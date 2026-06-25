'use client'

import { useState, useEffect } from 'react'
import { ProcessLot, AnomalyEvent, AiReport } from '@/types/manufacturing'
import { transformRawData } from '@/lib/data/transform'
import { detectAnomalies } from '@/lib/data/anomalyRules'
import { generateRuleBasedReport } from '@/lib/data/reportGenerator'
import ReportCard from '@/components/reports/ReportCard'
import ReportDetail from '@/components/reports/ReportDetail'

export default function ReportsPage() {
  const [reports, setReports] = useState<AiReport[]>([])
  const [selectedReport, setSelectedReport] = useState<AiReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [dataLoaded, setDataLoaded] = useState(false)
  const [lots, setLots] = useState<ProcessLot[]>([])
  const [anomalies, setAnomalies] = useState<AnomalyEvent[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadAll() {
      setLoading(true)
      try {
        // 공정 데이터 + 저장된 리포트 병렬 로드
        const [lotsRes, reportsRes] = await Promise.all([
          fetch('/api/process-lots'),
          fetch('/api/generate-report'),
        ])

        if (!lotsRes.ok) throw new Error('데이터 로드 실패')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const raw: Record<string, any>[] = await lotsRes.json()
        const loadedLots = transformRawData(raw)
        setLots(loadedLots)
        setAnomalies(detectAnomalies(loadedLots))
        setDataLoaded(true)

        // 저장된 리포트 복원
        if (reportsRes.ok) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const saved: any[] = await reportsRes.json()
          if (Array.isArray(saved) && saved.length > 0) {
            const restored: AiReport[] = saved.map((r) => ({
              id: r.id,
              report_type: r.report_type ?? 'rule_based',
              title: r.title ?? '',
              summary: r.summary ?? '',
              situation: r.situation ?? '',
              key_metrics: r.key_metrics ?? {},
              root_cause_candidates: r.root_cause_candidates ?? [],
              verification_items: r.verification_items ?? [],
              recommended_actions: r.recommended_actions ?? [],
              prevention_checklist: r.prevention_checklist ?? [],
              model_used: r.model_used,
              created_at: r.created_at,
            }))
            setReports(restored)
            setSelectedReport(restored[0])
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '알 수 없는 오류')
      } finally {
        setLoading(false)
      }
    }
    loadAll()
  }, [])

  async function handleGenerateReport() {
    if (!dataLoaded) return
    setGenerating(true)
    setError(null)
    try {
      const res = await fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lots, anomalies }),
      })
      if (res.ok) {
        const data = await res.json()
        const report: AiReport = { ...data.report, created_at: new Date().toISOString() }
        setReports((prev) => [report, ...prev])
        setSelectedReport(report)
      } else {
        const report = { ...generateRuleBasedReport(lots, anomalies), created_at: new Date().toISOString() }
        setReports((prev) => [report, ...prev])
        setSelectedReport(report)
      }
    } catch {
      const report = { ...generateRuleBasedReport(lots, anomalies), created_at: new Date().toISOString() }
      setReports((prev) => [report, ...prev])
      setSelectedReport(report)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">품질 분석 리포트</h1>
          <p className="text-sm text-slate-500 mt-1">룰 기반 · AI 공정 품질 분석 보고서</p>
        </div>
        <button
          onClick={handleGenerateReport}
          disabled={generating || !dataLoaded}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {generating ? (
            <>
              <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              생성 중...
            </>
          ) : (
            <>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              리포트 생성
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 text-sm">{error}</div>
      )}

      {loading && (
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span className="h-4 w-4 rounded-full border-2 border-gray-300 border-t-transparent animate-spin" />
          데이터 로딩 중...
        </div>
      )}

      {!loading && reports.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-gray-300">
          <svg className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-sm font-medium text-gray-400">생성된 리포트가 없습니다</p>
          <p className="text-xs mt-1 text-gray-300">
            {dataLoaded ? '위의 "리포트 생성" 버튼을 클릭하세요' : '데이터 로딩 중...'}
          </p>
        </div>
      )}

      {reports.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">리포트 목록</h2>
            {reports.map((report, i) => (
              <ReportCard
                key={i}
                report={report}
                onClick={() => setSelectedReport(report)}
                selected={selectedReport === report}
              />
            ))}
          </div>
          <div className="lg:col-span-2">
            {selectedReport ? (
              <ReportDetail report={selectedReport} />
            ) : (
              <div className="flex flex-col items-center justify-center h-52 text-gray-300 rounded-xl border-2 border-dashed border-gray-200">
                <p className="text-sm">리포트를 선택하세요</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

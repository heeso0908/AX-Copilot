'use client'

import { useState, useEffect } from 'react'
import { ProcessLot, AnomalyEvent } from '@/types/manufacturing'
import { transformRawData } from '@/lib/data/transform'
import { detectAnomalies } from '@/lib/data/anomalyRules'
import AnomalyList from '@/components/anomalies/AnomalyList'

export default function AnomaliesPage() {
  const [anomalies, setAnomalies] = useState<AnomalyEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadAndDetect() {
      try {
        const res = await fetch('/api/process-lots')
        if (!res.ok) throw new Error('데이터 로드 실패')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const raw: Record<string, any>[] = await res.json()
        const lots: ProcessLot[] = transformRawData(raw)
        setAnomalies(detectAnomalies(lots))
      } catch (err) {
        setError(err instanceof Error ? err.message : '알 수 없는 오류')
      } finally {
        setLoading(false)
      }
    }
    loadAndDetect()
  }, [])

  const highCount   = anomalies.filter((a) => a.severity === 'High').length
  const mediumCount = anomalies.filter((a) => a.severity === 'Medium').length
  const lowCount    = anomalies.filter((a) => a.severity === 'Low').length

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">이상 탐지</h1>
          <p className="text-sm text-slate-500 mt-1">룰 기반 공정 이상 징후 감지 결과</p>
        </div>
        {!loading && (
          <div className="flex items-center gap-2 mt-1">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-500 border border-rose-200">
              높음 {highCount}건
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-200">
              보통 {mediumCount}건
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-600 border border-sky-200">
              낮음 {lowCount}건
            </span>
          </div>
        )}
      </div>

      {/* 적용 규칙 안내 */}
      <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
        <h3 className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-2">적용된 탐지 규칙</h3>
        <ul className="space-y-1 text-xs text-blue-700">
          <li>1. <strong>이상 플래그 LOT</strong> — anomaly_flag = 1 집중 발생 장비 (높음)</li>
          <li>2. <strong>장비 불량률 상승</strong> — 장비 불량률 &gt; 전체 평균 × 1.5배 (높음)</li>
          <li>3. <strong>파티클 급증</strong> — Particle Count &gt; 평균 + 2σ (보통)</li>
          <li>4. <strong>금속 오염 신호</strong> — Ni 오염 농도 &gt; 10 ppb (높음)</li>
          <li>5. <strong>배스 온도 이탈</strong> — Bath Temp 관리 범위 [55~70°C] 벗어남 (보통)</li>
          <li>6. <strong>캐리어 오염 의심</strong> — EQP-03 + 캐리어 B 조합 불량률 &gt; 5% (높음)</li>
        </ul>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          <p className="font-semibold text-sm">오류 발생</p>
          <p className="text-xs mt-1">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-xl border border-gray-200 bg-white p-5 space-y-4 animate-pulse">
              <div className="flex gap-2">
                <div className="h-5 w-16 rounded-full bg-gray-200" />
                <div className="h-5 w-20 rounded bg-gray-100" />
              </div>
              <div className="h-5 w-48 rounded bg-gray-200" />
              <div className="h-14 w-full rounded-lg bg-gray-100" />
              <div className="h-4 w-full rounded bg-gray-100" />
              <div className="h-4 w-3/4 rounded bg-gray-100" />
            </div>
          ))}
        </div>
      ) : (
        <AnomalyList anomalies={anomalies} />
      )}
    </div>
  )
}

'use client'

import { AiReport } from '@/types/manufacturing'

interface ReportCardProps {
  report: AiReport
  onClick?: () => void
  selected?: boolean
}

export default function ReportCard({ report, onClick, selected }: ReportCardProps) {
  const dateStr = report.created_at
    ? new Date(report.created_at).toLocaleDateString('ko-KR', {
        month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit',
      })
    : '방금 생성됨'

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border cursor-pointer transition-all hover:shadow-md p-4 space-y-3 ${
        selected ? 'border-blue-500 ring-1 ring-blue-500/30 shadow-md' : 'border-gray-200'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
          report.report_type === 'ai_generated'
            ? 'bg-sky-50 text-sky-600 border-sky-200'
            : 'bg-gray-100 text-gray-500 border-gray-200'
        }`}>
          {report.report_type === 'ai_generated' ? 'AI 생성' : '룰 기반'}
        </span>
        <span className="text-[11px] text-gray-400 shrink-0">{dateStr}</span>
      </div>

      <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">{report.title}</h3>
      <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">{report.summary}</p>

      <div className="flex items-center gap-3 pt-1 text-[11px] text-gray-400 border-t border-gray-100">
        <span>원인 후보 {report.root_cause_candidates.length}건</span>
        <span>·</span>
        <span>권장 조치 {report.recommended_actions.length}건</span>
      </div>
    </div>
  )
}

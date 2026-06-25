'use client'

import { AiReport } from '@/types/manufacturing'

interface ReportDetailProps {
  report: AiReport
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 pb-1.5 border-b border-gray-100">
        {title}
      </h3>
      {children}
    </div>
  )
}

function BulletList({ items, color }: { items: string[]; color: 'red' | 'blue' | 'yellow' | 'green' }) {
  const dotCls = {
    red: 'bg-red-400',
    blue: 'bg-blue-400',
    yellow: 'bg-yellow-400',
    green: 'bg-emerald-400',
  }[color]
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700 leading-relaxed">
          <span className={`mt-2 h-1.5 w-1.5 rounded-full shrink-0 ${dotCls}`} />
          {item}
        </li>
      ))}
    </ul>
  )
}

export default function ReportDetail({ report }: ReportDetailProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
      {/* Title area */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
            report.report_type === 'ai_generated'
              ? 'bg-sky-50 text-sky-600 border-sky-200'
              : 'bg-gray-100 text-gray-500 border-gray-200'
          }`}>
            {report.report_type === 'ai_generated' ? 'AI 생성' : '룰 기반'}
          </span>
          {report.model_used && (
            <span className="inline-flex items-center rounded-full border border-gray-200 px-2.5 py-0.5 text-[11px] text-gray-500">
              {report.model_used}
            </span>
          )}
        </div>
        <h2 className="text-lg font-bold text-slate-900">{report.title}</h2>
      </div>

      {/* Summary */}
      <Section title="요약">
        <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 border border-slate-100 rounded-lg p-4">
          {report.summary}
        </p>
      </Section>

      {/* Key Metrics */}
      {Object.keys(report.key_metrics).length > 0 && (
        <Section title="핵심 지표">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(report.key_metrics).map(([key, value]) => (
              <div key={key} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <div className="text-[11px] text-gray-400 font-medium">{key}</div>
                <div className="text-sm font-bold text-slate-900 mt-1">
                  {typeof value === 'number' ? value.toLocaleString() : value}
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Situation */}
      {report.situation && (
        <Section title="현황 분석">
          <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">
            {report.situation}
          </pre>
        </Section>
      )}

      {/* Root Cause */}
      {report.root_cause_candidates.length > 0 && (
        <Section title="근본 원인 후보">
          <BulletList items={report.root_cause_candidates} color="red" />
        </Section>
      )}

      {/* Verification */}
      {report.verification_items.length > 0 && (
        <Section title="확인 필요 사항">
          <BulletList items={report.verification_items} color="yellow" />
        </Section>
      )}

      {/* Actions */}
      {report.recommended_actions.length > 0 && (
        <Section title="권장 조치">
          <BulletList items={report.recommended_actions} color="blue" />
        </Section>
      )}

      {/* Prevention */}
      {report.prevention_checklist.length > 0 && (
        <Section title="재발 방지 체크리스트">
          <ul className="space-y-2">
            {report.prevention_checklist.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700 leading-relaxed">
                <svg className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  )
}

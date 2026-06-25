'use client'

import { AnomalyEvent } from '@/types/manufacturing'

interface AnomalyCardProps {
  anomaly: AnomalyEvent
}

const severityConfig = {
  High: {
    border: 'border-l-rose-400',
    badge: 'bg-rose-500 text-white',
    valueColor: 'text-rose-500',
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <circle cx="12" cy="12" r="10" /><path strokeLinecap="round" d="M12 8v4m0 4h.01" />
      </svg>
    ),
    iconBg: 'bg-rose-100 text-rose-500',
  },
  Medium: {
    border: 'border-l-amber-400',
    badge: 'bg-amber-500 text-white',
    valueColor: 'text-amber-600',
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      </svg>
    ),
    iconBg: 'bg-amber-100 text-amber-500',
  },
  Low: {
    border: 'border-l-sky-400',
    badge: 'bg-sky-500 text-white',
    valueColor: 'text-sky-600',
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <circle cx="12" cy="12" r="10" /><path strokeLinecap="round" d="M12 8v4m0 4h.01" />
      </svg>
    ),
    iconBg: 'bg-sky-100 text-sky-500',
  },
}

function fmtRange(start: string, end: string): string {
  const fmt = (s: string) => {
    // "2026-06-22T00:00:00" → "06-22 00:00"
    const d = new Date(s)
    const mo = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    const hh = String(d.getHours()).padStart(2, '0')
    const mm = String(d.getMinutes()).padStart(2, '0')
    return `${mo}-${dd} ${hh}:${mm}`
  }
  return `${fmt(start)} → ${fmt(end)}`
}

export default function AnomalyCard({ anomaly }: AnomalyCardProps) {
  const cfg = severityConfig[anomaly.severity]

  return (
    <div className={`bg-white rounded-xl border border-gray-200 border-l-4 ${cfg.border} p-5 space-y-3.5`}>
      {/* Header: icon + title | severity badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${cfg.iconBg}`}>
            {cfg.icon}
          </span>
          <h3 className="text-sm font-bold text-slate-900 leading-snug">{anomaly.anomaly_type}</h3>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wide ${cfg.badge}`}>
          {anomaly.severity === 'High' ? '높음' : anomaly.severity === 'Medium' ? '보통' : '낮음'}
        </span>
      </div>

      {/* Equipment + time range */}
      <p className="text-xs text-gray-400 -mt-1 font-mono">
        {anomaly.equipment_id} &nbsp;·&nbsp; {fmtRange(anomaly.start_time, anomaly.end_time)}
      </p>

      {/* Metric 2-col */}
      <div className="rounded-lg bg-gray-50 border border-gray-100 px-3 py-2.5">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mb-1">지표</div>
            <div className="text-xs text-slate-700 font-mono">{anomaly.metric_name}</div>
          </div>
          <div>
            <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mb-1">현재값 / 기준값</div>
            <div className="text-xs font-bold">
              <span className={cfg.valueColor}>{anomaly.current_value}</span>
              <span className="text-gray-400 font-normal"> / {anomaly.baseline_value}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Root cause */}
      <div>
        <div className="text-[11px] text-gray-400 font-semibold mb-1">원인 후보</div>
        <p className="text-xs text-slate-600 leading-relaxed">{anomaly.root_cause_candidate}</p>
      </div>

      {/* Action */}
      <div>
        <div className="text-[11px] text-gray-400 font-semibold mb-1">권장 조치</div>
        <p className="text-xs text-slate-600 leading-relaxed">{anomaly.recommended_action}</p>
      </div>

      {/* LOT IDs */}
      {anomaly.lot_ids.length > 0 && (
        <div>
          <div className="text-[11px] text-gray-400 font-semibold mb-1.5">관련 LOT</div>
          <div className="flex flex-wrap gap-1">
            {anomaly.lot_ids.slice(0, 6).map((id) => (
              <span
                key={id}
                className="inline-block text-[11px] text-blue-600 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded font-mono transition-colors cursor-default"
              >
                {id}
              </span>
            ))}
            {anomaly.lot_ids.length > 6 && (
              <span className="text-[11px] text-gray-400 px-1 py-0.5">
                +{anomaly.lot_ids.length - 6}건
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

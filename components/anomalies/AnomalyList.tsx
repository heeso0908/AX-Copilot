'use client'

import { useState } from 'react'
import { AnomalyEvent } from '@/types/manufacturing'
import AnomalyCard from './AnomalyCard'

interface AnomalyListProps {
  anomalies: AnomalyEvent[]
}

type SeverityFilter = 'All' | 'High' | 'Medium' | 'Low'

export default function AnomalyList({ anomalies }: AnomalyListProps) {
  const [filter, setFilter] = useState<SeverityFilter>('All')

  const counts = {
    High:   anomalies.filter((a) => a.severity === 'High').length,
    Medium: anomalies.filter((a) => a.severity === 'Medium').length,
    Low:    anomalies.filter((a) => a.severity === 'Low').length,
  }
  const filtered = filter === 'All' ? anomalies : anomalies.filter((a) => a.severity === filter)

  const tabs: { key: SeverityFilter; label: string; count: number }[] = [
    { key: 'All',    label: '전체', count: anomalies.length },
    { key: 'High',   label: '높음', count: counts.High },
    { key: 'Medium', label: '보통', count: counts.Medium },
    { key: 'Low',    label: '낮음', count: counts.Low },
  ]

  if (anomalies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-300">
        <svg className="h-14 w-14 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-sm font-medium text-gray-400">감지된 이상 징후가 없습니다</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Filter tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {tabs.map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
              filter === key
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {label} ({count})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="py-10 text-center text-gray-300 text-sm">
          해당 심각도의 이상 징후가 없습니다
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((anomaly, i) => (
            <AnomalyCard key={`${anomaly.equipment_id}-${anomaly.anomaly_type}-${i}`} anomaly={anomaly} />
          ))}
        </div>
      )}
    </div>
  )
}

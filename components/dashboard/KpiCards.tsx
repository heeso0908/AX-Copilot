'use client'

import { DashboardMetrics } from '@/types/manufacturing'

interface KpiCardsProps {
  metrics: DashboardMetrics | null
  loading?: boolean
}

/* ── 아이콘 (채도 낮은 색상) ── */
const IconBox = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="#7ba7cc" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
  </svg>
)
const IconTrend = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="#c07a7a" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
)
const IconRework = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="#c4895f" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
)
const IconAlert = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="#c07a7a" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
  </svg>
)
const IconPulse = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="#c4a838" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
)
const IconTag = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="#8da8c4" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
  </svg>
)

function KpiCard({
  label,
  value,
  sub,
  icon,
  valueColor = 'text-slate-900',
}: {
  label: string
  value: string
  sub?: string
  icon: React.ReactNode
  valueColor?: string
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold tracking-widest text-gray-400 uppercase">
          {label}
        </span>
        {icon}
      </div>
      <div>
        <div className={`text-3xl font-bold leading-none ${valueColor}`}>{value}</div>
        {sub && <div className="text-xs text-gray-400 mt-1.5">{sub}</div>}
      </div>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="h-3 w-24 rounded bg-gray-200" />
        <div className="h-5 w-5 rounded bg-gray-200" />
      </div>
      <div className="h-9 w-28 rounded bg-gray-200" />
      <div className="h-3 w-20 rounded bg-gray-100 mt-2" />
    </div>
  )
}

export default function KpiCards({ metrics, loading = false }: KpiCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
    )
  }

  if (!metrics) return null

  const defectHigh = metrics.overallDefectRate > 0.05
  const anomalyHigh = metrics.anomalyCount > 10

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      <KpiCard
        label="총 LOT 수"
        value={metrics.totalLots.toLocaleString()}
        sub="분석 대상 LOT 수"
        icon={<IconBox />}
      />
      <KpiCard
        label="불량률"
        value={`${(metrics.overallDefectRate * 100).toFixed(2)}%`}
        sub="전체 평균 불량률"
        icon={<IconTrend />}
        valueColor={defectHigh ? 'text-rose-500' : 'text-slate-900'}
      />
      <KpiCard
        label="재작업 LOT"
        value={metrics.reworkCount.toLocaleString()}
        sub="재작업 대상 LOT"
        icon={<IconRework />}
      />
      <KpiCard
        label="이상 탐지"
        value={metrics.anomalyCount.toLocaleString()}
        sub="이상 플래그 건수"
        icon={<IconAlert />}
        valueColor={anomalyHigh ? 'text-rose-500' : 'text-slate-900'}
      />
      <KpiCard
        label="최다 불량 장비"
        value={metrics.worstEquipment}
        sub="불량률 최고 장비"
        icon={<IconPulse />}
      />
      <KpiCard
        label="주요 NG 유형"
        value={metrics.topNgType || '-'}
        sub="최다 발생 NG 유형"
        icon={<IconTag />}
      />
    </div>
  )
}

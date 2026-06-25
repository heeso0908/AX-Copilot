'use client'

import { useState, useEffect, useMemo } from 'react'
import { ProcessLot, FilterState, DashboardMetrics } from '@/types/manufacturing'
import { transformRawData } from '@/lib/data/transform'
import {
  getDashboardMetrics,
  getEquipmentDefectRates,
  getNgTypeDistribution,
  getShiftComparison,
  getTimestampDefectTrend,
  getParticleCountTrend,
  getBathTempTrend,
} from '@/lib/data/metrics'
import KpiCards from '@/components/dashboard/KpiCards'
import DefectTrendChart from '@/components/dashboard/DefectTrendChart'
import EquipmentDefectChart from '@/components/dashboard/EquipmentDefectChart'
import NgTypeChart from '@/components/dashboard/NgTypeChart'
import ShiftComparisonChart from '@/components/dashboard/ShiftComparisonChart'
import ParticleCountChart from '@/components/dashboard/ParticleCountChart'
import BathTempChart from '@/components/dashboard/BathTempChart'
import ProcessDataTable from '@/components/dashboard/ProcessDataTable'

const defaultFilters: FilterState = {
  date: '',
  equipment: '',
  processStep: '',
  ngType: '',
  shift: '',
}

function FilterSelect({
  value,
  onChange,
  placeholder,
  options,
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
  options: { value: string; label: string }[]
}) {
  return (
    <div className="relative inline-block">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none pl-3 pr-8 py-1.5 text-sm border border-gray-300 rounded-full bg-white text-gray-700 cursor-pointer hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-colors"
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <svg
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400"
        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  )
}

export default function DashboardPage() {
  const [allLots, setAllLots] = useState<ProcessLot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<FilterState>(defaultFilters)

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/process-lots')
        if (!res.ok) throw new Error('데이터 로드 실패')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const raw: Record<string, any>[] = await res.json()
        setAllLots(transformRawData(raw))
      } catch (err) {
        setError(err instanceof Error ? err.message : '알 수 없는 오류')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const filteredLots = useMemo(() => {
    return allLots.filter((lot) => {
      if (filters.date && lot.date !== filters.date) return false
      if (filters.equipment && lot.equipment_id !== filters.equipment) return false
      if (filters.processStep && lot.process_step !== filters.processStep) return false
      if (filters.ngType && lot.ng_type !== filters.ngType) return false
      if (filters.shift && lot.shift !== filters.shift) return false
      return true
    })
  }, [allLots, filters])

  const metrics: DashboardMetrics | null = useMemo(
    () => (filteredLots.length > 0 ? getDashboardMetrics(filteredLots) : null),
    [filteredLots]
  )
  const equipmentRates = useMemo(() => getEquipmentDefectRates(filteredLots), [filteredLots])
  const ngDist        = useMemo(() => getNgTypeDistribution(filteredLots), [filteredLots])
  const shiftComp     = useMemo(() => getShiftComparison(filteredLots), [filteredLots])
  const tsTrend       = useMemo(() => getTimestampDefectTrend(filteredLots), [filteredLots])
  const particleTrend = useMemo(() => getParticleCountTrend(filteredLots), [filteredLots])
  const bathTrend     = useMemo(() => getBathTempTrend(filteredLots), [filteredLots])

  const uniqueDates      = useMemo(() => [...new Set(allLots.map((l) => l.date))].sort(), [allLots])
  const uniqueEquipments = useMemo(() => [...new Set(allLots.map((l) => l.equipment_id))].sort(), [allLots])
  const uniqueSteps      = useMemo(() => [...new Set(allLots.map((l) => l.process_step))].sort(), [allLots])
  const uniqueNgTypes    = useMemo(
    () => [...new Set(allLots.map((l) => l.ng_type).filter(Boolean))].sort() as string[],
    [allLots]
  )

  const hasFilter = Object.values(filters).some(Boolean)

  function updateFilter(key: keyof FilterState, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
          <p className="font-semibold">데이터 로드 오류</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      {/* Page title + filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">공정 품질 대시보드</h1>
          <p className="text-sm text-slate-500 mt-1">
            LOT 단위 공정 데이터에서 불량률, 장비 이상, 공정 조건별 추이를 모니터링합니다.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 items-center">
          <FilterSelect
            value={filters.date}
            onChange={(v) => updateFilter('date', v)}
            placeholder="전체 날짜"
            options={uniqueDates.map((d) => ({ value: d, label: d }))}
          />
          <FilterSelect
            value={filters.equipment}
            onChange={(v) => updateFilter('equipment', v)}
            placeholder="전체 장비"
            options={uniqueEquipments.map((e) => ({ value: e, label: e }))}
          />
          <FilterSelect
            value={filters.processStep}
            onChange={(v) => updateFilter('processStep', v)}
            placeholder="전체 공정"
            options={uniqueSteps.map((s) => ({ value: s, label: s }))}
          />
          <FilterSelect
            value={filters.ngType}
            onChange={(v) => updateFilter('ngType', v)}
            placeholder="전체 NG 유형"
            options={uniqueNgTypes.map((n) => ({ value: n, label: n }))}
          />
          <FilterSelect
            value={filters.shift}
            onChange={(v) => updateFilter('shift', v)}
            placeholder="전체 교대"
            options={[
              { value: 'A', label: 'A조' },
              { value: 'B', label: 'B조' },
              { value: 'C', label: 'C조' },
            ]}
          />
          {hasFilter && (
            <button
              onClick={() => setFilters(defaultFilters)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-full text-gray-600 hover:bg-gray-50 transition-colors"
            >
              초기화
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <KpiCards metrics={metrics} loading={loading} />

      {/* Defect Rate Trend (full width) */}
      <DefectTrendChart data={tsTrend} />

      {/* NG Type + Equipment side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <NgTypeChart data={ngDist} />
        <EquipmentDefectChart data={equipmentRates} />
      </div>

      {/* Particle Count + Bath Temp */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ParticleCountChart data={particleTrend} />
        <BathTempChart data={bathTrend} />
      </div>

      {/* Shift Comparison (full width) */}
      <ShiftComparisonChart data={shiftComp} />

      {/* Data Table */}
      <ProcessDataTable lots={filteredLots} pageSize={25} />
    </div>
  )
}

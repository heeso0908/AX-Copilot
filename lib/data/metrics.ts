import {
  ProcessLot,
  DashboardMetrics,
  EquipmentDefectRate,
  NgTypeCount,
  ShiftComparison,
  HourlyTrend,
  ParticleCountPoint,
  BathTempPoint,
} from '@/types/manufacturing'

export function calculateDefectRate(lots: ProcessLot[]): number {
  if (lots.length === 0) return 0
  const total = lots.reduce(
    (acc, lot) => ({
      defects: acc.defects + lot.defect_count,
      inspections: acc.inspections + lot.inspection_count,
    }),
    { defects: 0, inspections: 0 }
  )
  return total.inspections > 0 ? total.defects / total.inspections : 0
}

export function getEquipmentDefectRates(lots: ProcessLot[]): EquipmentDefectRate[] {
  const grouped: Record<string, { defects: number; inspections: number; count: number }> = {}

  for (const lot of lots) {
    if (!grouped[lot.equipment_id]) {
      grouped[lot.equipment_id] = { defects: 0, inspections: 0, count: 0 }
    }
    grouped[lot.equipment_id].defects += lot.defect_count
    grouped[lot.equipment_id].inspections += lot.inspection_count
    grouped[lot.equipment_id].count++
  }

  return Object.entries(grouped)
    .map(([equipment_id, data]) => ({
      equipment_id,
      defect_rate: data.inspections > 0 ? data.defects / data.inspections : 0,
      lot_count: data.count,
    }))
    .sort((a, b) => b.defect_rate - a.defect_rate)
}

export function getNgTypeDistribution(lots: ProcessLot[]): NgTypeCount[] {
  const counts: Record<string, number> = {}

  for (const lot of lots) {
    if (lot.ng_type) {
      counts[lot.ng_type] = (counts[lot.ng_type] || 0) + 1
    }
  }

  return Object.entries(counts)
    .map(([ng_type, count]) => ({ ng_type, count }))
    .sort((a, b) => b.count - a.count)
}

export function getShiftComparison(lots: ProcessLot[]): ShiftComparison[] {
  const grouped: Record<string, { defects: number; inspections: number; count: number }> = {}

  for (const lot of lots) {
    if (!grouped[lot.shift]) {
      grouped[lot.shift] = { defects: 0, inspections: 0, count: 0 }
    }
    grouped[lot.shift].defects += lot.defect_count
    grouped[lot.shift].inspections += lot.inspection_count
    grouped[lot.shift].count++
  }

  const shiftOrder = ['A', 'B', 'C']
  return shiftOrder
    .filter((s) => grouped[s])
    .map((shift) => ({
      shift,
      defect_rate: grouped[shift].inspections > 0 ? grouped[shift].defects / grouped[shift].inspections : 0,
      lot_count: grouped[shift].count,
    }))
}

export function getHourlyTrend(lots: ProcessLot[]): HourlyTrend[] {
  const grouped: Record<number, { defects: number; inspections: number; count: number }> = {}

  for (const lot of lots) {
    if (!grouped[lot.hour]) {
      grouped[lot.hour] = { defects: 0, inspections: 0, count: 0 }
    }
    grouped[lot.hour].defects += lot.defect_count
    grouped[lot.hour].inspections += lot.inspection_count
    grouped[lot.hour].count++
  }

  return Object.entries(grouped)
    .map(([hour, data]) => ({
      hour: parseInt(hour),
      defect_rate: data.inspections > 0 ? data.defects / data.inspections : 0,
      lot_count: data.count,
    }))
    .sort((a, b) => a.hour - b.hour)
}

export function getDashboardMetrics(lots: ProcessLot[]): DashboardMetrics {
  const totalLots = lots.length
  const overallDefectRate = calculateDefectRate(lots)
  const reworkCount = lots.filter((l) => l.rework_required).length
  const anomalyCount = lots.filter((l) => l.anomaly_flag === 1).length

  const equipmentRates = getEquipmentDefectRates(lots)
  const worstEquipment = equipmentRates.length > 0 ? equipmentRates[0].equipment_id : 'N/A'

  const ngDist = getNgTypeDistribution(lots)
  const topNgType = ngDist.length > 0 ? ngDist[0].ng_type : 'N/A'

  return {
    totalLots,
    overallDefectRate,
    reworkCount,
    anomalyCount,
    worstEquipment,
    topNgType,
  }
}

export function getTimestampDefectTrend(
  lots: ProcessLot[]
): { label: string; 불량률: number; lot_count: number }[] {
  const grouped: Record<string, { defects: number; inspections: number; count: number }> = {}
  for (const lot of lots) {
    const key = `${lot.date} ${String(lot.hour).padStart(2, '0')}:00`
    if (!grouped[key]) grouped[key] = { defects: 0, inspections: 0, count: 0 }
    grouped[key].defects += lot.defect_count
    grouped[key].inspections += lot.inspection_count
    grouped[key].count++
  }
  return Object.entries(grouped)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, data]) => ({
      label,
      불량률: data.inspections > 0 ? parseFloat((data.defects / data.inspections * 100).toFixed(3)) : 0,
      lot_count: data.count,
    }))
}

export function getParticleCountTrend(lots: ProcessLot[]): ParticleCountPoint[] {
  return lots
    .slice()
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .map((lot) => ({
      timestamp: lot.timestamp,
      particle_count: lot.particle_count,
      equipment_id: lot.equipment_id,
    }))
}

export function getBathTempTrend(lots: ProcessLot[]): BathTempPoint[] {
  return lots
    .slice()
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .map((lot) => ({
      timestamp: lot.timestamp,
      bath_temp_c: lot.bath_temp_c,
      equipment_id: lot.equipment_id,
    }))
}

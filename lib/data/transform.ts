import { ProcessLot } from '@/types/manufacturing'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toBoolean(val: unknown): boolean {
  if (typeof val === 'boolean') return val
  if (typeof val === 'string') {
    return val.toLowerCase() === 'true' || val === '1'
  }
  if (typeof val === 'number') return val === 1
  return false
}

function toNumber(val: unknown): number {
  const n = Number(val)
  return isNaN(n) ? 0 : n
}

function toInt(val: unknown): number {
  return Math.round(toNumber(val))
}

function toString(val: unknown): string {
  if (val === null || val === undefined) return ''
  return String(val)
}

function toNullableString(val: unknown): string | null {
  if (val === null || val === undefined || val === '' || val === 'null') return null
  return String(val)
}

function toShift(val: unknown): 'A' | 'B' | 'C' {
  const s = toString(val).toUpperCase()
  if (s === 'A' || s === 'B' || s === 'C') return s
  return 'A'
}

function toProcessStep(val: unknown): 'CLEAN' | 'ETCH' | 'COAT' | 'INSPECT' {
  const s = toString(val).toUpperCase()
  if (s === 'CLEAN' || s === 'ETCH' || s === 'COAT' || s === 'INSPECT') return s
  return 'CLEAN'
}

function toCarrierType(val: unknown): 'A' | 'B' | 'C' {
  const s = toString(val).toUpperCase()
  if (s === 'A' || s === 'B' || s === 'C') return s
  return 'A'
}

function toAnomalyFlag(val: unknown): 0 | 1 {
  const n = toInt(val)
  return n === 1 ? 1 : 0
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function transformRawRecord(raw: Record<string, any>): ProcessLot {
  const defect_count = toInt(raw.defect_count)
  const inspection_count = toInt(raw.inspection_count) || 100
  const defect_rate =
    raw.defect_rate !== undefined
      ? toNumber(raw.defect_rate)
      : defect_count / inspection_count

  return {
    timestamp: toString(raw.timestamp) || new Date().toISOString(),
    date: toString(raw.date) || new Date().toISOString().split('T')[0],
    hour: toInt(raw.hour),
    shift: toShift(raw.shift),
    lot_id: toString(raw.lot_id),
    product_id: toString(raw.product_id) || 'PROD-A',
    process_step: toProcessStep(raw.process_step),
    equipment_id: toString(raw.equipment_id) || 'EQP-01',
    cleaning_bath: toString(raw.cleaning_bath) || 'BATH-1',
    carrier_id: toString(raw.carrier_id),
    carrier_type: toCarrierType(raw.carrier_type),
    bath_temp_c: toNumber(raw.bath_temp_c),
    chemical_concentration_pct: toNumber(raw.chemical_concentration_pct),
    flow_rate_lpm: toNumber(raw.flow_rate_lpm),
    filter_life_day: toInt(raw.filter_life_day),
    particle_count: toInt(raw.particle_count),
    ni_contamination_ppb: toNumber(raw.ni_contamination_ppb),
    inspection_count,
    defect_count,
    defect_rate,
    ng_type: toNullableString(raw.ng_type),
    rework_required: toBoolean(raw.rework_required),
    anomaly_flag: toAnomalyFlag(raw.anomaly_flag),
    root_cause_hint: toNullableString(raw.root_cause_hint),
    action_taken: toNullableString(raw.action_taken),
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function transformRawData(rawData: Record<string, any>[]): ProcessLot[] {
  return rawData.map(transformRawRecord)
}

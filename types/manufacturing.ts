export interface ProcessLot {
  id?: string
  dataset_upload_id?: string
  timestamp: string
  date: string
  hour: number
  shift: 'A' | 'B' | 'C'
  lot_id: string
  product_id: string
  process_step: 'CLEAN' | 'ETCH' | 'COAT' | 'INSPECT'
  equipment_id: string
  cleaning_bath: string
  carrier_id: string
  carrier_type: 'A' | 'B' | 'C'
  bath_temp_c: number
  chemical_concentration_pct: number
  flow_rate_lpm: number
  filter_life_day: number
  particle_count: number
  ni_contamination_ppb: number
  inspection_count: number
  defect_count: number
  defect_rate: number
  ng_type: string | null
  rework_required: boolean
  anomaly_flag: 0 | 1
  root_cause_hint: string | null
  action_taken: string | null
  created_at?: string
}

export interface AnomalyEvent {
  id?: string
  dataset_upload_id?: string
  severity: 'High' | 'Medium' | 'Low'
  equipment_id: string
  anomaly_type: string
  start_time: string
  end_time: string
  metric_name: string
  current_value: number
  baseline_value: number
  root_cause_candidate: string
  recommended_action: string
  lot_ids: string[]
  created_at?: string
}

export interface AiReport {
  id?: string
  dataset_upload_id?: string
  report_type: 'rule_based' | 'ai_generated'
  title: string
  summary: string
  situation: string
  key_metrics: Record<string, string | number>
  root_cause_candidates: string[]
  verification_items: string[]
  recommended_actions: string[]
  prevention_checklist: string[]
  raw_content?: string
  model_used?: string
  created_at?: string
}

export interface DatasetUpload {
  id?: string
  file_name: string
  file_size: number
  storage_path?: string
  row_count: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
  error_message?: string
  uploaded_by?: string
  created_at?: string
}

export interface DashboardMetrics {
  totalLots: number
  overallDefectRate: number
  reworkCount: number
  anomalyCount: number
  worstEquipment: string
  topNgType: string
}

export interface ChartDataPoint {
  name: string
  value: number
  [key: string]: string | number
}

export interface FilterState {
  date: string
  equipment: string
  processStep: string
  ngType: string
  shift: string
}

export interface EquipmentDefectRate {
  equipment_id: string
  defect_rate: number
  lot_count: number
}

export interface NgTypeCount {
  ng_type: string
  count: number
}

export interface ShiftComparison {
  shift: string
  defect_rate: number
  lot_count: number
}

export interface HourlyTrend {
  hour: number
  defect_rate: number
  lot_count: number
}

export interface ParticleCountPoint {
  timestamp: string
  particle_count: number
  equipment_id: string
}

export interface BathTempPoint {
  timestamp: string
  bath_temp_c: number
  equipment_id: string
}

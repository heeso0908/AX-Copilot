-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- dataset_uploads table
CREATE TABLE IF NOT EXISTS dataset_uploads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  file_name TEXT NOT NULL,
  file_size INTEGER,
  storage_path TEXT,
  row_count INTEGER,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  uploaded_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- process_lots table
CREATE TABLE IF NOT EXISTS process_lots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dataset_upload_id UUID REFERENCES dataset_uploads(id),
  timestamp TIMESTAMPTZ,
  date DATE,
  hour INTEGER,
  shift TEXT,
  lot_id TEXT,
  product_id TEXT,
  process_step TEXT,
  equipment_id TEXT,
  cleaning_bath TEXT,
  carrier_id TEXT,
  carrier_type TEXT,
  bath_temp_c NUMERIC,
  chemical_concentration_pct NUMERIC,
  flow_rate_lpm NUMERIC,
  filter_life_day INTEGER,
  particle_count INTEGER,
  ni_contamination_ppb NUMERIC,
  inspection_count INTEGER,
  defect_count INTEGER,
  defect_rate NUMERIC,
  ng_type TEXT,
  rework_required BOOLEAN,
  anomaly_flag INTEGER DEFAULT 0,
  root_cause_hint TEXT,
  action_taken TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_process_lots_equipment ON process_lots(equipment_id);
CREATE INDEX IF NOT EXISTS idx_process_lots_date ON process_lots(date);
CREATE INDEX IF NOT EXISTS idx_process_lots_lot_id ON process_lots(lot_id);
CREATE INDEX IF NOT EXISTS idx_process_lots_anomaly ON process_lots(anomaly_flag);

-- anomaly_events table
CREATE TABLE IF NOT EXISTS anomaly_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dataset_upload_id UUID REFERENCES dataset_uploads(id),
  severity TEXT CHECK (severity IN ('High', 'Medium', 'Low')),
  equipment_id TEXT,
  anomaly_type TEXT,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  metric_name TEXT,
  current_value NUMERIC,
  baseline_value NUMERIC,
  root_cause_candidate TEXT,
  recommended_action TEXT,
  lot_ids TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ai_reports table
CREATE TABLE IF NOT EXISTS ai_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dataset_upload_id UUID REFERENCES dataset_uploads(id),
  report_type TEXT DEFAULT 'rule_based' CHECK (report_type IN ('rule_based', 'ai_generated')),
  title TEXT,
  summary TEXT,
  situation TEXT,
  key_metrics JSONB,
  root_cause_candidates TEXT[],
  verification_items TEXT[],
  recommended_actions TEXT[],
  prevention_checklist TEXT[],
  raw_content TEXT,
  model_used TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

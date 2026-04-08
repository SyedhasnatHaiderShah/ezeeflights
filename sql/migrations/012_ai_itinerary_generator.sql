-- AI Itinerary Generator module

CREATE TABLE IF NOT EXISTS ai_generated_packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  input_payload JSONB NOT NULL,
  generated_output JSONB NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'reviewed', 'published', 'rejected')),
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  reviewer_notes TEXT,
  converted_package_id UUID REFERENCES packages(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_generation_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_payload JSONB NOT NULL,
  response_payload JSONB,
  status VARCHAR(20) NOT NULL DEFAULT 'success' CHECK (status IN ('success', 'failed')),
  provider VARCHAR(50) NOT NULL DEFAULT 'mock',
  model VARCHAR(120),
  tokens_used INT,
  latency_ms INT,
  estimated_cost NUMERIC(12,6),
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE packages
  ADD COLUMN IF NOT EXISTS is_ai_generated BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_ai_generated_packages_status_created ON ai_generated_packages(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_generated_packages_created_by ON ai_generated_packages(created_by, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_generation_logs_created ON ai_generation_logs(created_at DESC);

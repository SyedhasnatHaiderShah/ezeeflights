-- Advanced Admin Revenue & Operations Command Center

CREATE TABLE IF NOT EXISTS revenue_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL UNIQUE,
  total_revenue NUMERIC(14,2) NOT NULL DEFAULT 0,
  flight_revenue NUMERIC(14,2) NOT NULL DEFAULT 0,
  hotel_revenue NUMERIC(14,2) NOT NULL DEFAULT 0,
  refund_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  net_revenue NUMERIC(14,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payment_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider VARCHAR(20) NOT NULL,
  success_count INT NOT NULL DEFAULT 0,
  failure_count INT NOT NULL DEFAULT 0,
  total_volume NUMERIC(14,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS operations_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL UNIQUE,
  active_bookings INT NOT NULL DEFAULT 0,
  failed_bookings INT NOT NULL DEFAULT 0,
  cancellations INT NOT NULL DEFAULT 0,
  avg_processing_time NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sla_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  expected_time TIMESTAMPTZ NOT NULL,
  actual_time TIMESTAMPTZ NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('ON_TIME', 'DELAYED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS settlements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider VARCHAR(20) NOT NULL,
  total_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  settled_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  pending_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reconciliation_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id TEXT NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('MATCHED', 'MISMATCH')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS system_health (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_name VARCHAR(80) NOT NULL,
  status VARCHAR(10) NOT NULL CHECK (status IN ('UP', 'DOWN')),
  response_time NUMERIC(10,2) NOT NULL DEFAULT 0,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS insights_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type VARCHAR(120) NOT NULL,
  data JSONB NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_revenue_metrics_date ON revenue_metrics(date DESC);
CREATE INDEX IF NOT EXISTS idx_operations_metrics_date ON operations_metrics(date DESC);
CREATE INDEX IF NOT EXISTS idx_sla_tracking_booking ON sla_tracking(booking_id, expected_time DESC);
CREATE INDEX IF NOT EXISTS idx_settlements_provider_created ON settlements(provider, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_recon_status_created ON reconciliation_logs(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_health_service_checked ON system_health(service_name, checked_at DESC);
CREATE INDEX IF NOT EXISTS idx_insights_cache_type_generated ON insights_cache(type, generated_at DESC);

WITH required(module, action) AS (
  VALUES
    ('FINANCE_OPS','READ'),('FINANCE_OPS','WRITE'),
    ('OPERATIONS','READ'),('OPERATIONS','WRITE'),
    ('INSIGHTS','READ')
)
INSERT INTO permissions (slug, module, action, description)
SELECT lower(module || '.' || action), module, action, 'Admin Ops permission for ' || module || ':' || action
FROM required
ON CONFLICT (slug) DO UPDATE SET module = EXCLUDED.module, action = EXCLUDED.action;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.slug IN ('finance_ops.read','finance_ops.write','operations.read','operations.write','insights.read')
WHERE r.slug = 'super-admin'
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.slug IN ('finance_ops.read','operations.read','insights.read')
WHERE r.slug = 'finance'
ON CONFLICT DO NOTHING;

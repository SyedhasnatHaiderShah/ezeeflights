-- Hybrid engine extensions (non-breaking)

CREATE TABLE IF NOT EXISTS hybrid_api_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  endpoint VARCHAR(120) NOT NULL,
  provider VARCHAR(64) NOT NULL,
  estimated_cost_usd NUMERIC(12,6) NOT NULL DEFAULT 0,
  latency_ms INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pricing_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tier VARCHAR(20) NOT NULL UNIQUE CHECK (tier IN ('budget','standard','luxury')),
  margin_pct NUMERIC(6,4) NOT NULL DEFAULT 0,
  seasonal_pct NUMERIC(6,4) NOT NULL DEFAULT 0,
  surge_pct NUMERIC(6,4) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS provider_switches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider VARCHAR(64) NOT NULL UNIQUE,
  provider_type VARCHAR(20) NOT NULL CHECK (provider_type IN ('flight','hotel')),
  is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO pricing_rules (tier, margin_pct, seasonal_pct, surge_pct)
VALUES
  ('budget', 0.0800, 0.0300, 0.0200),
  ('standard', 0.1200, 0.0500, 0.0300),
  ('luxury', 0.1800, 0.0800, 0.0500)
ON CONFLICT (tier) DO NOTHING;

INSERT INTO provider_switches (provider, provider_type, is_enabled)
VALUES
  ('amadeus', 'flight', true),
  ('duffel', 'flight', true),
  ('skyscanner', 'flight', true),
  ('booking', 'hotel', true),
  ('expedia', 'hotel', true)
ON CONFLICT (provider) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_hybrid_usage_endpoint_created ON hybrid_api_usage(endpoint, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_provider_switches_type_enabled ON provider_switches(provider_type, is_enabled);

CREATE TABLE price_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  alert_type VARCHAR(20) NOT NULL,
  search_params JSONB NOT NULL,
  target_price DECIMAL(10,2) NOT NULL,
  currency CHAR(3) DEFAULT 'USD',
  channels JSONB DEFAULT '["email"]',
  is_active BOOLEAN DEFAULT true,
  last_checked_at TIMESTAMPTZ,
  triggered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_price_alerts_user ON price_alerts(user_id);
CREATE INDEX idx_price_alerts_active ON price_alerts(is_active) WHERE is_active = true;

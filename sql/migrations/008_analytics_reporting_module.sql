CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID DEFAULT gen_random_uuid(),
  user_id UUID NULL,
  event_type VARCHAR(24) NOT NULL CHECK (event_type IN ('SEARCH', 'VIEW', 'BOOK', 'PAYMENT')),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

CREATE TABLE IF NOT EXISTS analytics_events_default PARTITION OF analytics_events DEFAULT;

CREATE TABLE IF NOT EXISTS analytics_bookings (
  id UUID DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL,
  user_id UUID NOT NULL,
  amount NUMERIC(14,2) NOT NULL,
  currency VARCHAR(8) NOT NULL,
  status VARCHAR(24) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id, created_at),
  UNIQUE (booking_id, created_at)
) PARTITION BY RANGE (created_at);

CREATE TABLE IF NOT EXISTS analytics_bookings_default PARTITION OF analytics_bookings DEFAULT;

CREATE TABLE IF NOT EXISTS analytics_revenue_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  total_revenue NUMERIC(14,2) NOT NULL DEFAULT 0,
  total_bookings INT NOT NULL DEFAULT 0,
  avg_booking_value NUMERIC(14,2) NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS analytics_funnel (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  step VARCHAR(16) NOT NULL CHECK (step IN ('SEARCH', 'SELECT', 'BOOK', 'PAY')),
  count INT NOT NULL DEFAULT 0,
  date DATE NOT NULL,
  UNIQUE(step, date)
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events (created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events (user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_bookings_created_at ON analytics_bookings (created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_bookings_user_id ON analytics_bookings (user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_funnel_date_step ON analytics_funnel (date, step);

CREATE OR REPLACE FUNCTION create_analytics_month_partition(target_month DATE)
RETURNS VOID AS $$
DECLARE
  start_date DATE := date_trunc('month', target_month)::date;
  end_date DATE := (date_trunc('month', target_month) + interval '1 month')::date;
  event_partition TEXT := 'analytics_events_' || to_char(start_date, 'YYYYMM');
  booking_partition TEXT := 'analytics_bookings_' || to_char(start_date, 'YYYYMM');
BEGIN
  EXECUTE format(
    'CREATE TABLE IF NOT EXISTS %I PARTITION OF analytics_events FOR VALUES FROM (%L) TO (%L)',
    event_partition,
    start_date,
    end_date
  );

  EXECUTE format(
    'CREATE TABLE IF NOT EXISTS %I PARTITION OF analytics_bookings FOR VALUES FROM (%L) TO (%L)',
    booking_partition,
    start_date,
    end_date
  );
END;
$$ LANGUAGE plpgsql;

SELECT create_analytics_month_partition(CURRENT_DATE);
SELECT create_analytics_month_partition((CURRENT_DATE + interval '1 month')::date);

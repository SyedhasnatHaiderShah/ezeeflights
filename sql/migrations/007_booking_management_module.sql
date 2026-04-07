ALTER TABLE refunds
  ADD COLUMN IF NOT EXISTS booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS payment_reference VARCHAR(255);

ALTER TABLE refunds
  DROP CONSTRAINT IF EXISTS refunds_status_check;

ALTER TABLE refunds
  ADD CONSTRAINT refunds_status_check CHECK (status IN ('PENDING','SUCCESS','PROCESSED','FAILED'));

CREATE INDEX IF NOT EXISTS idx_refunds_booking_created ON refunds(booking_id, created_at DESC);

CREATE TABLE IF NOT EXISTS booking_modifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  change_type VARCHAR(32) NOT NULL CHECK (change_type IN ('DATE_CHANGE','PASSENGER_UPDATE')),
  old_value JSONB NOT NULL,
  new_value JSONB NOT NULL,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS booking_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  action VARCHAR(120) NOT NULL,
  performed_by VARCHAR(20) NOT NULL CHECK (performed_by IN ('USER','ADMIN','SYSTEM')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_booking_modifications_booking_changed ON booking_modifications(booking_id, changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_booking_logs_booking_created ON booking_logs(booking_id, created_at DESC);

ALTER TABLE flights
  ADD COLUMN IF NOT EXISTS airline VARCHAR(120),
  ADD COLUMN IF NOT EXISTS duration_minutes INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS stops INT NOT NULL DEFAULT 0;

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS total_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

ALTER TABLE bookings
  DROP CONSTRAINT IF EXISTS bookings_status_check;

ALTER TABLE bookings
  ADD CONSTRAINT bookings_status_check CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELLED', 'FAILED'));

ALTER TABLE bookings
  DROP CONSTRAINT IF EXISTS bookings_payment_status_check;

ALTER TABLE bookings
  ADD CONSTRAINT bookings_payment_status_check CHECK (payment_status IN ('PENDING', 'PAID', 'FAILED'));

CREATE TABLE IF NOT EXISTS flight_segments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  flight_id UUID NOT NULL REFERENCES flights(id) ON DELETE CASCADE,
  segment_order INT NOT NULL,
  departure VARCHAR(10) NOT NULL,
  arrival VARCHAR(10) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(flight_id, segment_order)
);

CREATE TABLE IF NOT EXISTS booking_flights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  flight_id UUID NOT NULL REFERENCES flights(id) ON DELETE RESTRICT,
  price NUMERIC(12,2) NOT NULL CHECK (price >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS booking_passengers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  full_name VARCHAR(150) NOT NULL,
  passport_number VARCHAR(50) NOT NULL,
  seat_number VARCHAR(8) NOT NULL,
  type VARCHAR(10) NOT NULL CHECK (type IN ('ADULT', 'CHILD', 'INFANT')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_flights_airline_stops_price ON flights(airline_code, stops, base_fare);
CREATE INDEX IF NOT EXISTS idx_bookings_user_status_created ON bookings(user_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_booking_flights_booking ON booking_flights(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_flights_flight ON booking_flights(flight_id);
CREATE INDEX IF NOT EXISTS idx_booking_passengers_booking ON booking_passengers(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_passengers_passport ON booking_passengers(passport_number);
CREATE UNIQUE INDEX IF NOT EXISTS uq_active_seat_per_booking ON booking_passengers(booking_id, seat_number);

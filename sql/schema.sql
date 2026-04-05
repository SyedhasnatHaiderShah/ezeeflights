-- ezeeFlights relational schema (PostgreSQL)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  oauth_provider VARCHAR(50),
  preferred_currency VARCHAR(3) NOT NULL DEFAULT 'USD' CHECK (preferred_currency IN ('USD', 'AED', 'EUR', 'GBP')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  seat_preference VARCHAR(20),
  hotel_star_min SMALLINT,
  ai_persona VARCHAR(30) DEFAULT 'balanced',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE flights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  airline_code VARCHAR(10) NOT NULL,
  flight_number VARCHAR(20) NOT NULL,
  departure_airport VARCHAR(10) NOT NULL,
  arrival_airport VARCHAR(10) NOT NULL,
  departure_at TIMESTAMPTZ NOT NULL,
  arrival_at TIMESTAMPTZ NOT NULL,
  cabin_class VARCHAR(20) NOT NULL CHECK (cabin_class IN ('ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST')),
  base_fare NUMERIC(12,2) NOT NULL CHECK (base_fare >= 0),
  currency VARCHAR(3) NOT NULL CHECK (currency IN ('USD', 'AED', 'EUR', 'GBP')),
  seats_available INT NOT NULL CHECK (seats_available >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE hotels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  city VARCHAR(120) NOT NULL,
  country VARCHAR(120) NOT NULL,
  star_rating SMALLINT NOT NULL CHECK (star_rating BETWEEN 1 AND 5),
  nightly_rate NUMERIC(12,2) NOT NULL,
  currency VARCHAR(3) NOT NULL CHECK (currency IN ('USD', 'AED', 'EUR', 'GBP')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE trips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  budget NUMERIC(12,2),
  currency VARCHAR(3) CHECK (currency IN ('USD', 'AED', 'EUR', 'GBP')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  flight_id UUID REFERENCES flights(id) ON DELETE SET NULL,
  hotel_id UUID REFERENCES hotels(id) ON DELETE SET NULL,
  trip_id UUID REFERENCES trips(id) ON DELETE SET NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELLED', 'FAILED')),
  total_amount NUMERIC(12,2) NOT NULL,
  currency VARCHAR(3) NOT NULL CHECK (currency IN ('USD', 'AED', 'EUR', 'GBP')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  currency VARCHAR(3) NOT NULL CHECK (currency IN ('USD', 'AED', 'EUR', 'GBP')),
  provider VARCHAR(50) NOT NULL,
  provider_reference VARCHAR(255),
  status VARCHAR(20) NOT NULL CHECK (status IN ('INITIATED', 'AUTHORIZED', 'CAPTURED', 'FAILED', 'REFUNDED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comments TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexing strategy
CREATE INDEX idx_flights_route_date ON flights (departure_airport, arrival_airport, departure_at);
CREATE INDEX idx_flights_price ON flights (currency, base_fare);
CREATE INDEX idx_hotels_city_rate ON hotels (city, nightly_rate);
CREATE INDEX idx_bookings_user_created ON bookings (user_id, created_at DESC);
CREATE INDEX idx_payments_booking_status ON payments (booking_id, status);
CREATE INDEX idx_trips_user_dates ON trips (user_id, start_date, end_date);

-- Example transaction for booking + payment consistency
-- BEGIN;
-- INSERT INTO bookings (...) VALUES (...);
-- INSERT INTO payments (...) VALUES (...);
-- COMMIT;

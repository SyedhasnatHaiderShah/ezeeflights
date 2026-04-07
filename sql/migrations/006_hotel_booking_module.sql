-- Hotel booking module (non-breaking extension)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

ALTER TABLE hotels
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS rating NUMERIC(2,1) CHECK (rating >= 0 AND rating <= 5),
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS amenities JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

UPDATE hotels
SET rating = COALESCE(rating, star_rating::numeric),
    address = COALESCE(address, city || ', ' || country),
    description = COALESCE(description, name || ' hotel details are being curated')
WHERE rating IS NULL OR address IS NULL OR description IS NULL;

ALTER TABLE hotels
  ALTER COLUMN rating SET NOT NULL;

CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  room_type VARCHAR(120) NOT NULL,
  capacity INT NOT NULL CHECK (capacity > 0),
  price_per_night NUMERIC(12,2) NOT NULL CHECK (price_per_night >= 0),
  currency VARCHAR(3) NOT NULL CHECK (currency IN ('USD', 'AED', 'EUR', 'GBP')),
  available_rooms INT NOT NULL CHECK (available_rooms >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS room_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hotel_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hotel_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE RESTRICT,
  total_price NUMERIC(12,2) NOT NULL CHECK (total_price >= 0),
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELLED')),
  payment_status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'PAID', 'FAILED')),
  currency VARCHAR(3) NOT NULL CHECK (currency IN ('USD', 'AED', 'EUR', 'GBP')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (check_out_date > check_in_date)
);

CREATE TABLE IF NOT EXISTS booking_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES hotel_bookings(id) ON DELETE CASCADE,
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE RESTRICT,
  quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  price NUMERIC(12,2) NOT NULL CHECK (price >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS booking_guests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES hotel_bookings(id) ON DELETE CASCADE,
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE RESTRICT,
  full_name VARCHAR(255) NOT NULL,
  age INT NOT NULL CHECK (age >= 0),
  type VARCHAR(10) NOT NULL CHECK (type IN ('ADULT', 'CHILD')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hotels_city_rating ON hotels(city, rating DESC);
CREATE INDEX IF NOT EXISTS idx_hotels_amenities_gin ON hotels USING GIN (amenities);
CREATE INDEX IF NOT EXISTS idx_rooms_hotel_price ON rooms(hotel_id, price_per_night);
CREATE INDEX IF NOT EXISTS idx_hotel_bookings_user_created ON hotel_bookings(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_hotel_bookings_hotel_dates ON hotel_bookings(hotel_id, check_in_date, check_out_date);
CREATE INDEX IF NOT EXISTS idx_hotel_bookings_status ON hotel_bookings(status, payment_status);
CREATE INDEX IF NOT EXISTS idx_booking_rooms_booking ON booking_rooms(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_rooms_room ON booking_rooms(room_id);
CREATE INDEX IF NOT EXISTS idx_booking_guests_booking ON booking_guests(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_guests_room ON booking_guests(room_id);

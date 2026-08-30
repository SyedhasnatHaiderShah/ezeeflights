-- Packages + Itinerary module

CREATE TABLE IF NOT EXISTS packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  destination VARCHAR(150) NOT NULL,
  country VARCHAR(120) NOT NULL,
  duration_days INT NOT NULL CHECK (duration_days > 0),
  base_price NUMERIC(12,2) NOT NULL CHECK (base_price >= 0),
  currency VARCHAR(3) NOT NULL CHECK (currency IN ('USD', 'AED', 'EUR', 'GBP')),
  thumbnail_url TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS package_itineraries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  package_id UUID NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
  day_number INT NOT NULL CHECK (day_number > 0),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  hotel_id UUID REFERENCES hotels(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(package_id, day_number)
);

CREATE TABLE IF NOT EXISTS package_inclusions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  package_id UUID NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('flight', 'hotel', 'meal', 'activity', 'transfer')),
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS package_exclusions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  package_id UUID NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS package_pricing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  package_id UUID NOT NULL UNIQUE REFERENCES packages(id) ON DELETE CASCADE,
  adult_price NUMERIC(12,2) NOT NULL CHECK (adult_price >= 0),
  child_price NUMERIC(12,2) NOT NULL CHECK (child_price >= 0),
  infant_price NUMERIC(12,2) NOT NULL CHECK (infant_price >= 0)
);

CREATE TABLE IF NOT EXISTS package_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  package_id UUID NOT NULL REFERENCES packages(id) ON DELETE RESTRICT,
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  travelers_json JSONB NOT NULL,
  total_amount NUMERIC(12,2) NOT NULL CHECK (total_amount >= 0),
  currency VARCHAR(3) NOT NULL CHECK (currency IN ('USD', 'AED', 'EUR', 'GBP')),
  payment_status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'PAID', 'FAILED', 'REFUNDED')),
  booking_status VARCHAR(25) NOT NULL DEFAULT 'INITIATED' CHECK (booking_status IN ('INITIATED', 'PAYMENT_PENDING', 'CONFIRMED', 'CANCELLED', 'FAILED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_packages_status_destination ON packages(status, destination);
CREATE INDEX IF NOT EXISTS idx_packages_slug ON packages(slug);
CREATE INDEX IF NOT EXISTS idx_package_itineraries_package_day ON package_itineraries(package_id, day_number);
CREATE INDEX IF NOT EXISTS idx_package_bookings_user_created ON package_bookings(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_package_bookings_package_created ON package_bookings(package_id, created_at DESC);

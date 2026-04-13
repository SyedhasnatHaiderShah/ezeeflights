CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE car_category AS ENUM ('economy','compact','suv','luxury','electric','minivan');
CREATE TYPE car_booking_status AS ENUM ('pending','confirmed','active','completed','cancelled','refunded');
CREATE TYPE insurance_type AS ENUM ('basic','comprehensive','cdw','none');
CREATE TYPE fuel_policy AS ENUM ('full_to_full','full_to_empty','prepaid');

CREATE TABLE car_vendors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  logo_url TEXT,
  api_provider VARCHAR(50),
  api_base_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE car_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID REFERENCES car_vendors(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  country_code CHAR(2) NOT NULL,
  iata_code CHAR(3),
  latitude DECIMAL(9,6),
  longitude DECIMAL(9,6),
  is_airport_pickup BOOLEAN DEFAULT false,
  operating_hours JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE cars (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID REFERENCES car_vendors(id),
  location_id UUID REFERENCES car_locations(id),
  category car_category NOT NULL,
  make VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  year SMALLINT,
  seats SMALLINT DEFAULT 5,
  doors SMALLINT DEFAULT 4,
  transmission VARCHAR(20) DEFAULT 'automatic',
  fuel_type VARCHAR(30) DEFAULT 'petrol',
  fuel_policy fuel_policy DEFAULT 'full_to_full',
  air_conditioning BOOLEAN DEFAULT true,
  unlimited_mileage BOOLEAN DEFAULT false,
  mileage_limit_km INTEGER,
  price_per_day DECIMAL(10,2) NOT NULL,
  currency CHAR(3) DEFAULT 'USD',
  deposit_amount DECIMAL(10,2),
  minimum_driver_age SMALLINT DEFAULT 21,
  images JSONB DEFAULT '[]',
  features JSONB DEFAULT '[]',
  is_available BOOLEAN DEFAULT true,
  external_id VARCHAR(200),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE car_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  car_id UUID NOT NULL REFERENCES cars(id),
  pickup_location_id UUID REFERENCES car_locations(id),
  dropoff_location_id UUID REFERENCES car_locations(id),
  pickup_datetime TIMESTAMPTZ NOT NULL,
  dropoff_datetime TIMESTAMPTZ NOT NULL,
  total_days INTEGER NOT NULL,
  base_price DECIMAL(10,2) NOT NULL,
  insurance_type insurance_type DEFAULT 'basic',
  insurance_price DECIMAL(10,2) DEFAULT 0,
  extras_price DECIMAL(10,2) DEFAULT 0,
  extras JSONB DEFAULT '[]',
  total_price DECIMAL(10,2) NOT NULL,
  currency CHAR(3) DEFAULT 'USD',
  status car_booking_status DEFAULT 'pending',
  driver_name VARCHAR(200),
  driver_license_number VARCHAR(100),
  driver_nationality CHAR(2),
  additional_drivers JSONB DEFAULT '[]',
  payment_id UUID,
  confirmation_code VARCHAR(50) UNIQUE,
  vendor_booking_ref VARCHAR(100),
  notes TEXT,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE car_extras (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price_per_day DECIMAL(8,2) NOT NULL,
  category VARCHAR(50),
  is_active BOOLEAN DEFAULT true
);

CREATE INDEX idx_cars_location ON cars(location_id);
CREATE INDEX idx_cars_category ON cars(category);
CREATE INDEX idx_cars_available ON cars(is_available);
CREATE INDEX idx_car_bookings_user ON car_bookings(user_id);
CREATE INDEX idx_car_bookings_status ON car_bookings(status);
CREATE INDEX idx_car_locations_iata ON car_locations(iata_code);
CREATE INDEX idx_car_locations_city ON car_locations(city, country_code);

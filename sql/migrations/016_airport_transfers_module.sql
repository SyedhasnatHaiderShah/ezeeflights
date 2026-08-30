CREATE TYPE transfer_type AS ENUM ('shared','private','luxury','bus');
CREATE TYPE vehicle_type AS ENUM ('sedan','suv','minivan','bus','luxury_sedan','luxury_suv');
CREATE TYPE transfer_direction AS ENUM ('airport_to_hotel','hotel_to_airport','point_to_point');
CREATE TYPE transfer_status AS ENUM ('pending','confirmed','driver_assigned','in_progress','completed','cancelled');

CREATE TABLE transfer_providers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  country_code CHAR(2) NOT NULL,
  api_endpoint TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE transfer_routes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID REFERENCES transfer_providers(id),
  origin_iata CHAR(3),
  origin_name VARCHAR(200) NOT NULL,
  destination_name VARCHAR(200) NOT NULL,
  destination_city VARCHAR(100) NOT NULL,
  country_code CHAR(2) NOT NULL,
  distance_km DECIMAL(8,2),
  duration_minutes INTEGER,
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE transfer_vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  route_id UUID REFERENCES transfer_routes(id),
  vehicle_type vehicle_type NOT NULL,
  transfer_type transfer_type NOT NULL,
  max_passengers SMALLINT NOT NULL,
  max_luggage SMALLINT DEFAULT 2,
  price DECIMAL(10,2) NOT NULL,
  currency CHAR(3) DEFAULT 'USD',
  includes_meet_and_greet BOOLEAN DEFAULT false,
  includes_flight_tracking BOOLEAN DEFAULT false,
  free_waiting_minutes INTEGER DEFAULT 60,
  description TEXT,
  image_url TEXT
);

CREATE TABLE transfer_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  vehicle_id UUID NOT NULL REFERENCES transfer_vehicles(id),
  direction transfer_direction NOT NULL,
  status transfer_status DEFAULT 'pending',
  flight_number VARCHAR(20),
  flight_arrival_datetime TIMESTAMPTZ,
  pickup_datetime TIMESTAMPTZ NOT NULL,
  pickup_address TEXT NOT NULL,
  dropoff_address TEXT NOT NULL,
  passenger_count SMALLINT NOT NULL,
  luggage_count SMALLINT DEFAULT 1,
  passenger_name VARCHAR(200) NOT NULL,
  passenger_phone VARCHAR(30) NOT NULL,
  passenger_email VARCHAR(200),
  meet_and_greet BOOLEAN DEFAULT false,
  special_requests TEXT,
  price DECIMAL(10,2) NOT NULL,
  currency CHAR(3) DEFAULT 'USD',
  payment_id UUID,
  confirmation_code VARCHAR(50) UNIQUE,
  driver_name VARCHAR(200),
  driver_phone VARCHAR(30),
  driver_vehicle_plate VARCHAR(30),
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_transfer_bookings_user ON transfer_bookings(user_id);
CREATE INDEX idx_transfer_bookings_flight ON transfer_bookings(flight_number);
CREATE INDEX idx_transfer_routes_iata ON transfer_routes(origin_iata);

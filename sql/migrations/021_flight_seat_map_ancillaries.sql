CREATE TYPE seat_class AS ENUM ('economy','premium_economy','business','first');
CREATE TYPE seat_position AS ENUM ('window','middle','aisle');
CREATE TYPE seat_status AS ENUM ('available','occupied','blocked','reserved');
CREATE TYPE ancillary_type AS ENUM ('baggage','meal','insurance','fast_track','lounge','upgrade');

CREATE TABLE aircraft_seat_maps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  flight_id UUID NOT NULL,
  aircraft_type VARCHAR(50),
  total_rows INTEGER,
  columns_layout VARCHAR(20),
  seat_map_data JSONB NOT NULL,
  last_synced_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE seat_selections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL,
  passenger_index INTEGER NOT NULL DEFAULT 0,
  flight_id UUID NOT NULL,
  seat_row INTEGER NOT NULL,
  seat_column CHAR(1) NOT NULL,
  seat_class seat_class NOT NULL,
  seat_position seat_position,
  price DECIMAL(8,2) DEFAULT 0,
  currency CHAR(3) DEFAULT 'USD',
  status seat_status DEFAULT 'reserved',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ancillary_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ancillary_type ancillary_type NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  airline_code CHAR(3),
  price DECIMAL(8,2) NOT NULL,
  currency CHAR(3) DEFAULT 'USD',
  unit VARCHAR(50),
  value JSONB,
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE booking_ancillaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL,
  passenger_index INTEGER DEFAULT 0,
  ancillary_id UUID NOT NULL REFERENCES ancillary_options(id),
  quantity SMALLINT DEFAULT 1,
  unit_price DECIMAL(8,2) NOT NULL,
  total_price DECIMAL(8,2) NOT NULL,
  currency CHAR(3) DEFAULT 'USD',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_seat_map_flight ON aircraft_seat_maps(flight_id);
CREATE INDEX idx_seat_selections_booking ON seat_selections(booking_id);
CREATE INDEX idx_booking_ancillaries_booking ON booking_ancillaries(booking_id);

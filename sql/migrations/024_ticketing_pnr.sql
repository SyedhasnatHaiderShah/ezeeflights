CREATE TABLE IF NOT EXISTS pnr_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  pnr_code VARCHAR(6) NOT NULL,
  provider VARCHAR(20) NOT NULL CHECK (provider IN ('AMADEUS', 'SABRE', 'TRAVELPORT', 'INTERNAL')),
  status VARCHAR(20) NOT NULL CHECK (status IN ('CREATED', 'TICKETED', 'CANCELLED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (booking_id),
  UNIQUE (pnr_code)
);

CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pnr_id UUID NOT NULL REFERENCES pnr_records(id) ON DELETE CASCADE,
  ticket_number VARCHAR(13) NOT NULL,
  passenger_id UUID NOT NULL REFERENCES booking_passengers(id) ON DELETE RESTRICT,
  flight_id UUID NOT NULL REFERENCES flights(id) ON DELETE RESTRICT,
  issue_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status VARCHAR(20) NOT NULL CHECK (status IN ('ISSUED', 'CANCELLED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (pnr_id, passenger_id, flight_id),
  UNIQUE (ticket_number)
);

CREATE TABLE IF NOT EXISTS ticket_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pnr_records_pnr_code ON pnr_records(pnr_code);
CREATE INDEX IF NOT EXISTS idx_tickets_ticket_number ON tickets(ticket_number);
CREATE INDEX IF NOT EXISTS idx_tickets_pnr_id ON tickets(pnr_id);
CREATE INDEX IF NOT EXISTS idx_ticket_documents_ticket_id ON ticket_documents(ticket_id);

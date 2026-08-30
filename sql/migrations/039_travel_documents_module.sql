-- Travel documents module

CREATE TABLE IF NOT EXISTS travel_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  traveler_id UUID REFERENCES saved_travelers(id) ON DELETE SET NULL,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  doc_type VARCHAR(30) NOT NULL CHECK (doc_type IN ('PASSPORT', 'NATIONAL_ID', 'VISA', 'E_TICKET', 'HOTEL_VOUCHER', 'INSURANCE', 'OTHER')),
  title VARCHAR(255),
  original_file_name VARCHAR(255) NOT NULL,
  storage_path TEXT NOT NULL,
  mime_type VARCHAR(120) NOT NULL,
  size_bytes INT NOT NULL CHECK (size_bytes >= 0),
  issuing_country VARCHAR(80),
  destination VARCHAR(120),
  expiry_date DATE,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  ocr_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  share_token UUID NOT NULL DEFAULT uuid_generate_v4() UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_travel_documents_user_id ON travel_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_travel_documents_booking_id ON travel_documents(booking_id);
CREATE INDEX IF NOT EXISTS idx_travel_documents_traveler_id ON travel_documents(traveler_id);
CREATE INDEX IF NOT EXISTS idx_travel_documents_doc_type ON travel_documents(doc_type);
CREATE INDEX IF NOT EXISTS idx_travel_documents_share_token ON travel_documents(share_token);

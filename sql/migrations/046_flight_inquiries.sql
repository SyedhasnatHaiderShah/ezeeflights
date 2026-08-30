-- 046_flight_inquiries.sql
-- Flight booking inquiry / lead capture table

CREATE TABLE IF NOT EXISTS flight_inquiries (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Flight reference
  flight_id        TEXT NOT NULL,

  -- Search context (from URL params)
  origin           TEXT,
  destination      TEXT,
  depart_date      TEXT,
  trip_type        TEXT,
  cabin_class      TEXT,
  adults           INT  NOT NULL DEFAULT 1,
  children         INT  NOT NULL DEFAULT 0,
  infants          INT  NOT NULL DEFAULT 0,

  -- Full flight details snapshot stored at submission time
  flight_snapshot  JSONB,

  -- Traveler details array stored as JSON
  -- Each object: { firstName, middleName, lastName, passportNumber, dob, nationality, gender }
  travelers        JSONB NOT NULL DEFAULT '[]',

  -- Contact info (may differ from profile)
  contact_email    TEXT,
  contact_phone    TEXT,

  -- Admin workflow
  status           TEXT NOT NULL DEFAULT 'PENDING',   -- PENDING | REVIEWED | CONTACTED | CLOSED
  admin_notes      TEXT,

  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_flight_inquiries_user_id    ON flight_inquiries(user_id);
CREATE INDEX IF NOT EXISTS idx_flight_inquiries_status     ON flight_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_flight_inquiries_created_at ON flight_inquiries(created_at DESC);

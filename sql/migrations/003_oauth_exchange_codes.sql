-- One-time codes to complete Google OAuth in the browser (redirect to frontend)

CREATE TABLE oauth_exchange_codes (
  code VARCHAR(64) PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_oauth_exchange_codes_expires ON oauth_exchange_codes(expires_at);

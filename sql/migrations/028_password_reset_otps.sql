CREATE TABLE IF NOT EXISTS password_reset_otps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  otp_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prot_user_id ON password_reset_otps(user_id);
CREATE INDEX IF NOT EXISTS idx_prot_expires ON password_reset_otps(expires_at) WHERE used = FALSE;

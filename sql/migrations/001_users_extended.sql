-- Add profile / admin fields to users (additive; keeps existing auth columns)

ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'USER';
ALTER TABLE users ADD COLUMN IF NOT EXISTS nationality VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS passport_number VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS passport_expiry DATE;

CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

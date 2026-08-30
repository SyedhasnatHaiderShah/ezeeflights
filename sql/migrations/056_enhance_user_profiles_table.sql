-- Enhance user_profiles table with middle_name and passport_expiry
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS middle_name VARCHAR(100);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS passport_expiry VARCHAR(50);

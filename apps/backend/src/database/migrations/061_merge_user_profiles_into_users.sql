ALTER TABLE users ADD COLUMN IF NOT EXISTS middle_name VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS gender VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferences JSON;

UPDATE users u
JOIN user_profiles p ON u.id = p.user_id
SET 
  u.first_name = COALESCE(u.first_name, p.first_name),
  u.last_name = COALESCE(u.last_name, p.last_name),
  u.phone = COALESCE(u.phone, p.phone),
  u.nationality = COALESCE(u.nationality, p.nationality),
  u.passport_number = COALESCE(u.passport_number, p.passport_number),
  u.passport_expiry = COALESCE(u.passport_expiry, 
    CASE 
      WHEN p.passport_expiry IS NOT NULL AND p.passport_expiry != '' 
      THEN STR_TO_DATE(p.passport_expiry, '%Y-%m-%d')
      ELSE NULL
    END
  ),
  u.middle_name = p.middle_name,
  u.date_of_birth = CASE 
      WHEN p.date_of_birth IS NOT NULL AND p.date_of_birth != '' 
      THEN STR_TO_DATE(p.date_of_birth, '%Y-%m-%d')
      ELSE NULL
    END,
  u.gender = p.gender,
  u.preferences = p.preferences;

DROP TABLE IF EXISTS user_profiles;

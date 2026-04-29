-- Fix loyalty_tier enum values to match uppercase TypeScript types
ALTER TYPE loyalty_tier RENAME VALUE 'blue' TO 'BRONZE';
ALTER TYPE loyalty_tier RENAME VALUE 'silver' TO 'SILVER';
ALTER TYPE loyalty_tier RENAME VALUE 'gold' TO 'GOLD';
ALTER TYPE loyalty_tier RENAME VALUE 'platinum' TO 'PLATINUM';

-- Update the default value for the column
ALTER TABLE users ALTER COLUMN loyalty_tier SET DEFAULT 'BRONZE';

-- Ensure existing 'blue' (if any left after rename) are updated
UPDATE users SET loyalty_tier = 'BRONZE' WHERE loyalty_tier::text = 'blue';

-- Enhance destinations and cities for frontend alignment
ALTER TABLE countries ADD COLUMN IF NOT EXISTS region VARCHAR(50);
ALTER TABLE cities ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;

-- Update existing countries with regions (optional, but good for seed)
UPDATE countries SET region = 'MIDDLE EAST' WHERE code = 'ARE';
UPDATE countries SET region = 'EUROPE' WHERE code = 'GBR';
UPDATE countries SET region = 'ASIA' WHERE code = 'PAK';
UPDATE countries SET region = 'AMERICAS' WHERE code = 'USA';

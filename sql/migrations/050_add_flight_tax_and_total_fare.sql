-- Add tax and total_fare columns to flights table if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'flights' 
        AND column_name = 'tax'
    ) THEN
        ALTER TABLE flights ADD COLUMN tax NUMERIC(12,2) DEFAULT 0.00;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'flights' 
        AND column_name = 'total_fare'
    ) THEN
        ALTER TABLE flights ADD COLUMN total_fare NUMERIC(12,2) DEFAULT 0.00;
    END IF;
END $$;

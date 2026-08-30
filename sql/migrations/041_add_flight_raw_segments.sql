-- Add raw_segments column to flights table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'flights' 
        AND column_name = 'raw_segments'
    ) THEN
        ALTER TABLE flights ADD COLUMN raw_segments TEXT;
    END IF;
END $$;

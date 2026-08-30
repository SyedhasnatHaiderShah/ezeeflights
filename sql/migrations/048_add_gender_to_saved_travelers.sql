-- Add gender column to saved_travelers table
ALTER TABLE saved_travelers 
ADD COLUMN IF NOT EXISTS gender VARCHAR(20) CHECK (gender IN ('MALE', 'FEMALE', 'OTHER', 'UNSPECIFIED'));

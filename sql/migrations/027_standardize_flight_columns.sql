DO $$
BEGIN
  ALTER TABLE flights RENAME COLUMN departure_time TO departure_at;
EXCEPTION
  WHEN undefined_column THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE flights RENAME COLUMN arrival_time TO arrival_at;
EXCEPTION
  WHEN undefined_column THEN NULL;
END $$;

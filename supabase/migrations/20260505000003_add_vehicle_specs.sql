-- Migration to add missing vehicle specification columns

ALTER TABLE public.vehicles 
  ADD COLUMN IF NOT EXISTS mileage NUMERIC,
  ADD COLUMN IF NOT EXISTS image_url TEXT,
  ADD COLUMN IF NOT EXISTS transmission TEXT,
  ADD COLUMN IF NOT EXISTS fuel_type TEXT;

-- If mileage already exists as INTEGER from a previous migration, 
-- we can ensure it's NUMERIC (optional, but requested by user)
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='vehicles' AND column_name='mileage' AND data_type='integer'
  ) THEN
    ALTER TABLE public.vehicles ALTER COLUMN mileage TYPE NUMERIC;
  END IF;
END $$;

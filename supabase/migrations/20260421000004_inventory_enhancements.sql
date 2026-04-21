-- Task 5: Inventory Enhancement — add missing columns to vehicles table

ALTER TABLE public.vehicles
  ADD COLUMN IF NOT EXISTS mileage INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS location TEXT DEFAULT 'Unknown',
  ADD COLUMN IF NOT EXISTS image_url TEXT,
  ADD COLUMN IF NOT EXISTS class TEXT DEFAULT 'Sedan';

COMMENT ON COLUMN public.vehicles.mileage IS 'Current mileage of the vehicle';
COMMENT ON COLUMN public.vehicles.location IS 'Physical showroom or storage location';
COMMENT ON COLUMN public.vehicles.image_url IS 'URL to the vehicle showcase image';
COMMENT ON COLUMN public.vehicles.class IS 'Vehicle classification (SUV, Coupe, etc) for filtering';

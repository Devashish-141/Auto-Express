ALTER TABLE public.vehicles 
  ADD COLUMN IF NOT EXISTS variant TEXT,
  ADD COLUMN IF NOT EXISTS engine_size TEXT,
  ADD COLUMN IF NOT EXISTS colour TEXT,
  ADD COLUMN IF NOT EXISTS doors INTEGER,
  ADD COLUMN IF NOT EXISTS previous_owners INTEGER,
  ADD COLUMN IF NOT EXISTS seats INTEGER,
  ADD COLUMN IF NOT EXISTS reg TEXT,
  ADD COLUMN IF NOT EXISTS sale_price DECIMAL(12, 2),
  ADD COLUMN IF NOT EXISTS created_by TEXT REFERENCES public.reps(rep_code);

COMMENT ON COLUMN public.vehicles.variant IS 'Vehicle trim or variant level (e.g. S-Line, M-Sport)';
COMMENT ON COLUMN public.vehicles.engine_size IS 'Engine displacement (e.g. 2.0L)';
COMMENT ON COLUMN public.vehicles.colour IS 'Exterior paint colour';
COMMENT ON COLUMN public.vehicles.doors IS 'Number of doors';
COMMENT ON COLUMN public.vehicles.previous_owners IS 'Total count of prior registered owners';
COMMENT ON COLUMN public.vehicles.seats IS 'Passenger capacity';
COMMENT ON COLUMN public.vehicles.reg IS 'Original registration (UK)';
COMMENT ON COLUMN public.vehicles.created_by IS 'The representative who registered this vehicle into stock.';

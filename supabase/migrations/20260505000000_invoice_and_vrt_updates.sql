-- Migration to add columns for invoice and VRT tracking.

-- [KI-007] VRT & Registration Schema Update
ALTER TABLE public.deals
  ADD COLUMN IF NOT EXISTS stage TEXT DEFAULT 'pending' CHECK (stage IN ('pending', 'invoiced', 'registered', 'closed')),
  ADD COLUMN IF NOT EXISTS vrt_amount DECIMAL(12, 2),
  ADD COLUMN IF NOT EXISTS reg_number TEXT,
  ADD COLUMN IF NOT EXISTS finance_company_code TEXT;

ALTER TABLE public.vehicles
  ADD COLUMN IF NOT EXISTS registration_number TEXT;

COMMENT ON COLUMN public.deals.stage IS 'Workflow stage: pending -> invoiced -> registered -> closed';
COMMENT ON COLUMN public.deals.vrt_amount IS 'Vehicle Registration Tax amount paid';
COMMENT ON COLUMN public.deals.reg_number IS 'New Irish registration number assigned';
COMMENT ON COLUMN public.deals.finance_company_code IS 'Finance company identifier (e.g., 109 = Finance Ireland)';
COMMENT ON COLUMN public.vehicles.registration_number IS 'Final Irish registration number';

-- Migration to add columns for CSV import mapping.
-- [KI-008] Extended Vehicle Schema for Import
ALTER TABLE public.vehicles 
  ADD COLUMN IF NOT EXISTS reg TEXT,
  ADD COLUMN IF NOT EXISTS sale_price DECIMAL(12, 2);

COMMENT ON COLUMN public.vehicles.reg IS 'Registration number from import (regfull)';
COMMENT ON COLUMN public.vehicles.sale_price IS 'Sale price from import (price)';

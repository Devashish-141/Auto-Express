-- Add unfinanceable column to deals table
ALTER TABLE public.deals 
ADD COLUMN IF NOT EXISTS unfinanceable BOOLEAN DEFAULT false;

COMMENT ON COLUMN public.deals.unfinanceable IS 'Flag set to true when all finance lenders have declined.';

-- ============================================================
-- PERFORMANCE OPTIMIZATION: INDEXING V2
-- Adds indexes to foreign keys and sorting columns to speed up 
-- relational lookups and dashboard rendering.
-- ============================================================

-- 1. Index for Deal -> Vehicle relation
CREATE INDEX IF NOT EXISTS idx_deals_vehicle_id ON public.deals(vehicle_id);

-- 2. Index for Deal -> Rep relation
CREATE INDEX IF NOT EXISTS idx_deals_rep_code ON public.deals(rep_code);

-- 3. Index for Payment -> Deal relation
CREATE INDEX IF NOT EXISTS idx_payments_deal_id ON public.payments(deal_id);

-- 4. Index for Finance App -> Deal relation
CREATE INDEX IF NOT EXISTS idx_finance_apps_deal_id ON public.finance_apps(deal_id);

-- 5. Index for Vehicles by location (used in frontend filtering)
CREATE INDEX IF NOT EXISTS idx_vehicles_location ON public.vehicles(location);

-- 6. Index for Vehicles by status (used in stats and summary cards)
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON public.vehicles(status);

-- 7. Sorting Indexes (Next.js components use .order('created_at', { ascending: false }))
CREATE INDEX IF NOT EXISTS idx_deals_created_at ON public.deals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vehicles_created_at ON public.vehicles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_date ON public.payments(payment_date DESC);

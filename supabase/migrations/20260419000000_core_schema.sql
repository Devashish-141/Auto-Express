-- [KI-001] & [KI-002] Auto Express Ireland: Core Schema Migrations 001-007

-- ==========================================
-- Block 001: Representatives (reps)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.reps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rep_code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- Block 002: Inventory (vehicles)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vin TEXT UNIQUE NOT NULL,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER,
    price DECIMAL(12, 2) NOT NULL,
    status TEXT CHECK (status IN ('available', 'garage', 'sold')) DEFAULT 'available',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- Block 003: Transactions (deals)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.deals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
    rep_code TEXT REFERENCES public.reps(rep_code),
    customer_name TEXT,
    status TEXT DEFAULT 'pending', -- pending, finalized, cancelled
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- Block 004: Revenue Tracking (payments)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deal_id UUID REFERENCES public.deals(id) ON DELETE CASCADE,
    amount DECIMAL(12, 2) NOT NULL,
    rep_code TEXT REFERENCES public.reps(rep_code),
    is_voided BOOLEAN DEFAULT false,
    void_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Immutable Ledger Policy: Prevent physical deletion of payments
CREATE OR REPLACE FUNCTION block_payment_deletion()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Payments cannot be deleted for audit integrity. Mark as is_voided = true instead.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS enforce_payment_immutability ON public.payments;
CREATE TRIGGER enforce_payment_immutability
BEFORE DELETE ON public.payments
FOR EACH ROW EXECUTE FUNCTION block_payment_deletion();

-- ==========================================
-- Block 005: Finance Pipeline (finance_apps)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.finance_apps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deal_id UUID REFERENCES public.deals(id) ON DELETE CASCADE,
    lender_name TEXT CHECK (lender_name IN ('Finance Ireland', 'Close Brothers', 'Finance4U')),
    status TEXT CHECK (status IN ('active', 'approved', 'declined')) DEFAULT 'active',
    approved_amount DECIMAL(12, 2),
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(deal_id, lender_name)
);

-- ==========================================
-- Block 006: Waterfall Integrity (enforce_waterfall)
-- ==========================================
CREATE OR REPLACE FUNCTION check_waterfall_order()
RETURNS TRIGGER AS $$
BEGIN
    -- Finance Ireland → Close Brothers → Finance4U
    
    IF NEW.lender_name = 'Close Brothers' THEN
        IF NOT EXISTS (
            SELECT 1 FROM public.finance_apps 
            WHERE deal_id = NEW.deal_id 
            AND lender_name = 'Finance Ireland' 
            AND status = 'declined'
        ) THEN
            RAISE EXCEPTION 'Finance Waterfall Violation: Close Brothers is locked until Finance Ireland is Declined.';
        END IF;
    END IF;

    IF NEW.lender_name = 'Finance4U' THEN
        IF NOT EXISTS (
            SELECT 1 FROM public.finance_apps 
            WHERE deal_id = NEW.deal_id 
            AND lender_name = 'Close Brothers' 
            AND status = 'declined'
        ) THEN
            RAISE EXCEPTION 'Finance Waterfall Violation: Finance4U is locked until Close Brothers is Declined.';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS enforce_waterfall ON public.finance_apps;
CREATE TRIGGER enforce_waterfall
BEFORE INSERT OR UPDATE ON public.finance_apps
FOR EACH ROW EXECUTE FUNCTION check_waterfall_order();

-- ==========================================
-- Block 007: Attribution & Security (RLS)
-- ==========================================
ALTER TABLE public.reps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance_apps ENABLE ROW LEVEL SECURITY;

-- Simple permissive policies for the demonstration of rep_code matching
-- In a production environment, these would check auth.uid() vs rep_code mapping
CREATE POLICY "Public reps are visible" ON public.reps FOR SELECT USING (active = true);
CREATE POLICY "Authorized reps can manage deals" ON public.deals FOR ALL USING (rep_code IS NOT NULL);
CREATE POLICY "Authorized reps can manage payments" ON public.payments FOR ALL USING (rep_code IS NOT NULL);
CREATE POLICY "Authorized reps can manage finance" ON public.finance_apps FOR ALL USING (deal_id IN (SELECT id FROM public.deals));

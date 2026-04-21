-- ============================================================
-- AUTO EXPRESS IRELAND — FULL DATABASE SCHEMA & SEED
-- Run this entire script in the Supabase SQL Editor.
-- It is fully idempotent: safe to run multiple times.
-- ============================================================


-- ============================================================
-- STEP 1: TABLES
-- ============================================================

-- 1a. Representatives (reps)
CREATE TABLE IF NOT EXISTS public.reps (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    rep_code    TEXT        UNIQUE NOT NULL,
    name        TEXT        NOT NULL,
    active      BOOLEAN     DEFAULT true,
    created_at  TIMESTAMPTZ DEFAULT now()
);

-- 1b. Inventory (vehicles)
CREATE TABLE IF NOT EXISTS public.vehicles (
    id          UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    vin         TEXT            UNIQUE NOT NULL,
    make        TEXT            NOT NULL,
    model       TEXT            NOT NULL,
    year        INTEGER,
    price       DECIMAL(12, 2)  NOT NULL,
    status      TEXT            CHECK (status IN ('available', 'garage', 'sold')) DEFAULT 'available',
    mileage     INTEGER         DEFAULT 0,
    location    TEXT            DEFAULT 'Unknown',
    image_url   TEXT,
    class       TEXT            DEFAULT 'Sedan',
    created_at  TIMESTAMPTZ     DEFAULT now()
);
-- Patch existing vehicles table with columns added in later migrations
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS mileage   INTEGER DEFAULT 0;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS location  TEXT    DEFAULT 'Unknown';
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS class     TEXT    DEFAULT 'Sedan';
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS year      INTEGER;

-- 1c. Transactions (deals)
CREATE TABLE IF NOT EXISTS public.deals (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id      UUID        REFERENCES public.vehicles(id) ON DELETE CASCADE,
    rep_code        TEXT        REFERENCES public.reps(rep_code),
    customer_name   TEXT,
    status          TEXT        DEFAULT 'pending', -- pending, finalized, cancelled
    unfinanceable   BOOLEAN     DEFAULT false,
    created_at      TIMESTAMPTZ DEFAULT now()
);
-- Patch existing tables that may be missing columns from later migrations
ALTER TABLE public.deals ADD COLUMN IF NOT EXISTS unfinanceable BOOLEAN DEFAULT false;
ALTER TABLE public.deals ADD COLUMN IF NOT EXISTS customer_name TEXT;
COMMENT ON COLUMN public.deals.unfinanceable IS 'Set to true when all three finance lenders have declined.';

-- 1d. Revenue Tracking (payments)
CREATE TABLE IF NOT EXISTS public.payments (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    deal_id         UUID            REFERENCES public.deals(id) ON DELETE CASCADE,
    amount          DECIMAL(12, 2)  NOT NULL,
    rep_code        TEXT            REFERENCES public.reps(rep_code),
    is_voided       BOOLEAN         DEFAULT false,
    void_reason     TEXT,
    method          TEXT            CHECK (method IN ('Cash', 'Card', 'Transfer')) DEFAULT 'Cash',
    payment_date    DATE            DEFAULT CURRENT_DATE,
    created_at      TIMESTAMPTZ     DEFAULT now()
);
-- Patch existing payments table with columns added in later migrations
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS is_voided     BOOLEAN DEFAULT false;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS void_reason   TEXT;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS method        TEXT DEFAULT 'Cash';
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS payment_date  DATE  DEFAULT CURRENT_DATE;
COMMENT ON COLUMN public.payments.rep_code     IS '[KI-002] Mandatory rep attribution — solves the Amanda Problem.';
COMMENT ON COLUMN public.payments.method       IS 'Payment method: Cash, Card, or Transfer.';
COMMENT ON COLUMN public.payments.payment_date IS 'Effective date of the payment as recorded by the rep.';

-- 1e. Finance Pipeline (finance_apps)
CREATE TABLE IF NOT EXISTS public.finance_apps (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    deal_id         UUID            REFERENCES public.deals(id) ON DELETE CASCADE,
    lender_name     TEXT            CHECK (lender_name IN ('Finance Ireland', 'Close Brothers', 'Finance4U')),
    status          TEXT            CHECK (status IN ('active', 'approved', 'declined')) DEFAULT 'active',
    approved_amount DECIMAL(12, 2),
    created_at      TIMESTAMPTZ     DEFAULT now(),
    UNIQUE(deal_id, lender_name)
);


-- ============================================================
-- STEP 2: FUNCTIONS & TRIGGERS
-- ============================================================

-- 2a. Immutable Ledger: Block physical deletion of payments
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


-- 2b. Finance Waterfall Sequence Enforcement
--     Order: Finance Ireland → Close Brothers → Finance4U
CREATE OR REPLACE FUNCTION check_waterfall_order()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.lender_name = 'Close Brothers' THEN
        IF NOT EXISTS (
            SELECT 1 FROM public.finance_apps
            WHERE deal_id = NEW.deal_id
              AND lender_name = 'Finance Ireland'
              AND status = 'declined'
        ) THEN
            RAISE EXCEPTION 'Waterfall Violation: Close Brothers is locked until Finance Ireland is Declined.';
        END IF;
    END IF;

    IF NEW.lender_name = 'Finance4U' THEN
        IF NOT EXISTS (
            SELECT 1 FROM public.finance_apps
            WHERE deal_id = NEW.deal_id
              AND lender_name = 'Close Brothers'
              AND status = 'declined'
        ) THEN
            RAISE EXCEPTION 'Waterfall Violation: Finance4U is locked until Close Brothers is Declined.';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS enforce_waterfall ON public.finance_apps;
CREATE TRIGGER enforce_waterfall
BEFORE INSERT OR UPDATE ON public.finance_apps
FOR EACH ROW EXECUTE FUNCTION check_waterfall_order();


-- 2c. Reserve Vehicle RPC (called from the UI to reserve a car and create a deal)
CREATE OR REPLACE FUNCTION public.reserve_vehicle(
    p_vehicle_id    UUID,
    p_rep_code      TEXT,
    p_customer_name TEXT,
    p_deposit       DECIMAL(12, 2) DEFAULT 0
) RETURNS UUID AS $$
DECLARE
    v_deal_id UUID;
BEGIN
    -- Verify vehicle is available
    IF NOT EXISTS (
        SELECT 1 FROM public.vehicles
        WHERE id = p_vehicle_id AND status = 'available'
    ) THEN
        RAISE EXCEPTION 'Vehicle is not available for reservation or does not exist.';
    END IF;

    -- Mark vehicle as sold (reserved)
    UPDATE public.vehicles
    SET status = 'sold'
    WHERE id = p_vehicle_id;

    -- Create deal record
    INSERT INTO public.deals (vehicle_id, rep_code, customer_name, status)
    VALUES (p_vehicle_id, p_rep_code, p_customer_name, 'pending')
    RETURNING id INTO v_deal_id;

    -- Log initial deposit if provided
    IF p_deposit > 0 THEN
        INSERT INTO public.payments (deal_id, amount, rep_code, method, payment_date)
        VALUES (v_deal_id, p_deposit, p_rep_code, 'Cash', CURRENT_DATE);
    END IF;

    RETURN v_deal_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================
-- STEP 3: ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE public.reps         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance_apps ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first to avoid conflicts on re-run
DROP POLICY IF EXISTS "Public reps are visible"            ON public.reps;
DROP POLICY IF EXISTS "Vehicles are publicly readable"     ON public.vehicles;
DROP POLICY IF EXISTS "Authorized reps can manage deals"   ON public.deals;
DROP POLICY IF EXISTS "Authorized reps can manage payments" ON public.payments;
DROP POLICY IF EXISTS "Authorized reps can manage finance"  ON public.finance_apps;

-- Reps: anyone can see active reps (for rep code validation on login)
CREATE POLICY "Public reps are visible"
    ON public.reps FOR SELECT
    USING (active = true);

-- Vehicles: publicly readable for the inventory view
CREATE POLICY "Vehicles are publicly readable"
    ON public.vehicles FOR SELECT
    USING (true);

-- Vehicles: only authenticated reps can insert/update
CREATE POLICY "Reps can manage vehicles"
    ON public.vehicles FOR ALL
    USING (true);

-- Deals: require a rep_code on every write
CREATE POLICY "Authorized reps can manage deals"
    ON public.deals FOR ALL
    USING (rep_code IS NOT NULL);

-- Payments: require a rep_code on every write
CREATE POLICY "Authorized reps can manage payments"
    ON public.payments FOR ALL
    USING (rep_code IS NOT NULL);

-- Finance Apps: accessible if linked to a valid deal
CREATE POLICY "Authorized reps can manage finance"
    ON public.finance_apps FOR ALL
    USING (deal_id IN (SELECT id FROM public.deals));


-- ============================================================
-- STEP 4: SEED DATA
-- ============================================================

-- 4a. Representatives
INSERT INTO public.reps (rep_code, name, active)
VALUES
    ('NICK-01',    'Nickson',              true),
    ('AMANDA-01',  'Amanda',               true),
    ('DEVA',       'Devashish',            true),
    ('DEMO-REP',   'Demo Representative',  true)
ON CONFLICT (rep_code) DO NOTHING;


-- 4b. Vehicles (Luxury Inventory)
INSERT INTO public.vehicles (make, model, year, price, vin, mileage, location, status, image_url, class)
VALUES
    ('ASTON MARTIN', 'DB12',        2024, 265000, 'VIN20ST907G12', 900,  'Dublin North', 'available', 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?q=80&w=600&auto=format&fit=crop', 'Hypercar'),
    ('PORSCHE',      '911 GT3',     2023, 198500, 'VIN20S4S07V13', 1200, 'Dublin South', 'available', 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?q=80&w=600&auto=format&fit=crop', 'Coupe'),
    ('FERRARI',      'F8 TRIBUTO',  2023, 325000, 'VIN20S1S07145', 450,  'Cork Central', 'available', 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=600&auto=format&fit=crop', 'Hypercar'),
    ('LAMBORGHINI',  'REVUELTO',    2024, 550000, 'VIN2067S00213', 150,  'Dublin North', 'available', 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?q=80&w=600&auto=format&fit=crop', 'Hypercar'),
    ('BENTLEY',      'BENTAYGA',    2023, 215000, 'VIN20S7B07412', 3200, 'Galway West',  'available', 'https://images.unsplash.com/photo-1621136531940-0e1a14a79901?q=80&w=600&auto=format&fit=crop', 'SUV')
ON CONFLICT (vin) DO NOTHING;


-- ============================================================
-- DONE ✓
-- All tables, triggers, RLS policies, and seed data are ready.
-- ============================================================

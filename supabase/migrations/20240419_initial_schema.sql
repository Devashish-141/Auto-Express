-- [KI-002] Security & Attribution Schema
-- Ensuring every action is tracked to a specific sales rep.

-- Representatives Table
CREATE TABLE IF NOT EXISTS reps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rep_code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Deals Table
CREATE TABLE IF NOT EXISTS deals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    vin TEXT NOT NULL,
    price DEFAULT 0,
    status TEXT DEFAULT 'available', -- available, sold, garage, unfinanceable
    rep_code TEXT REFERENCES reps(rep_code),
    unfinanceable BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- [KI-001] Finance Waterfall Applications
CREATE TABLE IF NOT EXISTS finance_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
    lender_name TEXT NOT NULL, -- Finance Ireland, Close Brothers, Finance4U
    status TEXT DEFAULT 'pending', -- pending, approved, declined
    approved_amount DEFAULT 0,
    sequence_order INTEGER NOT NULL, -- 1, 2, 3
    rep_code TEXT REFERENCES reps(rep_code),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- [KI-002] Accountability: Payments Table
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deal_id UUID REFERENCES deals(id),
    amount DEFAULT 0,
    status TEXT DEFAULT 'active', -- active, voided
    void_reason TEXT,
    rep_code TEXT REFERENCES reps(rep_code),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ROW LEVEL SECURITY (RLS) policies
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Policy: Reject transactions where rep_code doesn't match session (Simplified for SQL view)
-- NOTE: In a real Supabase env, we'd use (auth.jwt() ->> 'rep_code')
CREATE POLICY rep_attribution_policy ON deals
    FOR ALL
    USING (true)
    WITH CHECK (rep_code IS NOT NULL);

-- [KI-002] Payment Deletion Protection: Void only.
CREATE OR REPLACE FUNCTION protect_payments()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        RAISE EXCEPTION 'Payments cannot be deleted. Use Void status instead.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_protect_payments
BEFORE DELETE ON payments
FOR EACH ROW EXECUTE FUNCTION protect_payments();

-- [KI-001] Sequential Waterfall Integrity
CREATE OR REPLACE FUNCTION check_waterfall_order()
RETURNS TRIGGER AS $$
DECLARE
    prev_status TEXT;
BEGIN
    IF NEW.sequence_order > 1 THEN
        SELECT status INTO prev_status 
        FROM finance_applications 
        WHERE deal_id = NEW.deal_id AND sequence_order = NEW.sequence_order - 1;
        
        IF prev_status != 'declined' THEN
            RAISE EXCEPTION 'Lender % is locked until previous lender is Declined.', NEW.lender_name;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_waterfall_order
BEFORE UPDATE ON finance_applications
FOR EACH ROW EXECUTE FUNCTION check_waterfall_order();

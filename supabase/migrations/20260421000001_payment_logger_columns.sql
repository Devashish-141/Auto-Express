-- Task 3: Payment Logger — add method and payment_date columns to payments table

ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS method TEXT CHECK (method IN ('Cash', 'Card', 'Transfer')) DEFAULT 'Cash',
  ADD COLUMN IF NOT EXISTS payment_date DATE DEFAULT CURRENT_DATE;

-- Ensure the column that was missing from the core schema is present
-- (rep_code is already defined in the core schema block 004)
COMMENT ON COLUMN public.payments.method IS 'Payment method: Cash, Card, or Transfer';
COMMENT ON COLUMN public.payments.payment_date IS 'Effective date of the payment as recorded by the rep';
COMMENT ON COLUMN public.payments.rep_code IS '[KI-002] Mandatory rep attribution stamp — solves the Amanda Problem';

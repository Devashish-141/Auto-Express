-- [KI-003] Deal Workflow Integrity: Enforce Unidirectional Transitions
-- Stages: pending -> invoiced -> registered -> closed

CREATE OR REPLACE FUNCTION public.check_deal_stage_transition()
RETURNS TRIGGER AS $$
DECLARE
    v_old_rank INTEGER;
    v_new_rank INTEGER;
BEGIN
    -- Assign ranks to stages for easy comparison
    -- pending: 1, invoiced: 2, registered: 3, closed: 4
    v_old_rank := CASE OLD.stage 
        WHEN 'pending' THEN 1 
        WHEN 'invoiced' THEN 2 
        WHEN 'registered' THEN 3 
        WHEN 'closed' THEN 4 
        ELSE 0 END;
    
    v_new_rank := CASE NEW.stage 
        WHEN 'pending' THEN 1 
        WHEN 'invoiced' THEN 2 
        WHEN 'registered' THEN 3 
        WHEN 'closed' THEN 4 
        ELSE 0 END;

    -- Block regressions (cannot move to a lower rank)
    IF v_new_rank < v_old_rank THEN
        RAISE EXCEPTION 'Deal Workflow Regression Blocked [KI-003]: Cannot transition from % back to %.', OLD.stage, NEW.stage;
    END IF;

    -- Block changes if already closed
    IF OLD.stage = 'closed' AND NEW.stage != 'closed' THEN
        RAISE EXCEPTION 'Immutable Record Blocked: This deal is Closed and cannot be modified.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS enforce_deal_integrity ON public.deals;
CREATE TRIGGER enforce_deal_integrity
BEFORE UPDATE ON public.deals
FOR EACH ROW EXECUTE FUNCTION public.check_deal_stage_transition();

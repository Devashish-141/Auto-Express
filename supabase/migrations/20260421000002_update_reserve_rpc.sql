-- Task 4: Reserve Handshake — Update RPC with p_deposit and correct return behavior

CREATE OR REPLACE FUNCTION public.reserve_vehicle(
    p_vehicle_id UUID,
    p_rep_code TEXT,
    p_customer_name TEXT,
    p_deposit DECIMAL(12, 2) DEFAULT 0
) RETURNS UUID AS $$
DECLARE
    v_deal_id UUID;
BEGIN
    -- 1. Verify vehicle existence and availability
    IF NOT EXISTS (
        SELECT 1 FROM public.vehicles 
        WHERE id = p_vehicle_id AND status = 'available'
    ) THEN
        RAISE EXCEPTION 'Vehicle is not available for reservation or does not exist.';
    END IF;

    -- 2. Update vehicle status to 'sold' (representing reserved/allocated)
    -- In this system, 'sold' is used for any vehicle assigned to a deal.
    UPDATE public.vehicles
    SET status = 'sold'
    WHERE id = p_vehicle_id;

    -- 3. Create the deal record
    INSERT INTO public.deals (
        vehicle_id, 
        rep_code, 
        customer_name, 
        status
    ) VALUES (
        p_vehicle_id, 
        p_rep_code, 
        p_customer_name, 
        'pending'
    ) RETURNING id INTO v_deal_id;

    -- 4. Log initial deposit if > 0
    IF p_deposit > 0 THEN
        INSERT INTO public.payments (
            deal_id,
            amount,
            rep_code,
            method,
            payment_date
        ) VALUES (
            v_deal_id,
            p_deposit,
            p_rep_code,
            'Cash', -- Default for initial reservation deposit
            CURRENT_DATE
        );
    END IF;

    RETURN v_deal_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

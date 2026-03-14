-- 2026-03-05: Auto-Approve Low Risk (REPAIRED)
-- EN: Fixes policy matching and ensures State Machine compatibility.
BEGIN;

-- 1. Create Trusted Merchants Table
CREATE TABLE IF NOT EXISTS public.trusted_merchants (
    merchant_id uuid PRIMARY KEY,
    enabled boolean DEFAULT true,
    risk_tier text DEFAULT 'LOW' CHECK (risk_tier IN ('LOW','MEDIUM','HIGH'))
);

-- 2. Create Auto-Approve Policies Table
CREATE TABLE IF NOT EXISTS public.auto_approve_policies (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text UNIQUE NOT NULL,
    max_cod_amount numeric DEFAULT 0,
    max_weight numeric DEFAULT 5,
    enabled boolean DEFAULT true
);

-- 3. FIX: Seed safe default policy
INSERT INTO public.auto_approve_policies (name, max_cod_amount, max_weight)
VALUES ('DEFAULT_LOW_RISK', 0, 5)
ON CONFLICT (name) DO NOTHING;

-- 4. FIX: Patch the Event Ledger Trigger to support "SYSTEM_AUTO" actor
-- This allows the system to insert events even if no user is physically logged in
CREATE OR REPLACE FUNCTION public.sc_event_before_insert()
RETURNS trigger AS $$
BEGIN
  -- Handle system-level auto-approvals
  NEW.auth_user_id := COALESCE(auth.uid(), NEW.auth_user_id);
  NEW.actor_role := COALESCE(NEW.actor_role, 'SYSTEM_AUTO');
  
  -- Re-link way_id if missing
  IF NEW.shipment_id IS NULL THEN
    SELECT id INTO NEW.shipment_id FROM public.shipments WHERE way_id = NEW.way_id LIMIT 1;
  END IF;

  -- ENFORCE: Check state machine rules
  PERFORM public.sc_enforce_state_machine(NEW.shipment_id, NEW.event_type, NEW.segment, COALESCE(NEW.meta,'{}'::jsonb));

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. REPAIR: Trigger on shipments to auto-approve low-risk items
CREATE OR REPLACE FUNCTION public.auto_approve_on_insert()
RETURNS trigger AS $$
BEGIN
  -- Policy: If COD is 0, auto-approve immediately
  IF NEW.cod_amount = 0 THEN
    INSERT INTO public.supply_chain_events (way_id, segment, event_type, note, meta)
    VALUES (NEW.way_id, 'SUPERVISOR', 'SUPV_APPROVED', 'System Auto-Approve: COD=0', '{"auto": true, "force": true}');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_auto_approve_on_insert ON public.shipments;
CREATE TRIGGER trg_auto_approve_on_insert
AFTER INSERT ON public.shipments
FOR EACH ROW EXECUTE FUNCTION public.auto_approve_on_insert();

COMMIT;

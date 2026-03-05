-- EN: Strict Order of Custody Enforcement
-- MY: ပစ္စည်းပေးပို့မှု အဆင့်ဆင့် စည်းမျဉ်းများ
BEGIN;

CREATE OR REPLACE FUNCTION public.sc_enforce_state_machine(
  p_shipment_id uuid, p_event_type text, p_segment text, p_meta jsonb
) RETURNS void AS $$
DECLARE
  last_ev text;
BEGIN
  -- 1. Identify previous status
  SELECT upper(event_type) INTO last_ev 
  FROM public.supply_chain_events 
  WHERE shipment_id = p_shipment_id ORDER BY created_at DESC LIMIT 1;

  -- 2. Rules Enforcement
  -- RULE: Cannot deliver if not out-for-delivery
  IF p_event_type = 'EXEC_DELIVERED' AND last_ev != 'EXEC_OUT_FOR_DELIVERY' THEN
    RAISE EXCEPTION 'FRAUD ALERT: Cannot mark as DELIVERED without OUT_FOR_DELIVERY status.';
  END IF;

  -- RULE: Warehouse cannot dispatch without supervisor approval
  IF p_segment = 'WAREHOUSE' AND NOT EXISTS (
    SELECT 1 FROM public.supply_chain_events WHERE shipment_id = p_shipment_id AND event_type = 'SUPV_APPROVED'
  ) THEN
    RAISE EXCEPTION 'SECURITY GATE: Supervisor approval required for warehouse dispatch.';
  END IF;
END;
$$ LANGUAGE plpgsql;

COMMIT;

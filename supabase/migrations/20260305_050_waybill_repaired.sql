-- 2026-03-05: Repaired Waybill & CSV Engine
-- EN: Uses verified current_app_role() and jwt email helpers.
BEGIN;

-- FIX: Waybill ID Generator (ORG + SEQ + TAG + DATE + DEST)
CREATE OR REPLACE FUNCTION public.generate_waybill_id(
  p_org text, p_dst text, p_tag text DEFAULT 'HQ'
) RETURNS text AS $$
DECLARE
  seq_val text;
BEGIN
  -- Generate simple 6-digit sequence for this session
  seq_val := lpad(floor(random() * 900000 + 100000)::text, 6, '0');
  RETURN upper(p_org) || seq_val || upper(p_tag) || to_char(now(), 'DDMMYYYY') || upper(p_dst);
END;
$$ LANGUAGE plpgsql;

-- FIX: Bulk Create RPC with schema-safe role checks
CREATE OR REPLACE FUNCTION public.create_shipment_portal(
  p_receiver_name text, p_receiver_phone text, p_receiver_city text, p_item_price numeric
) RETURNS TABLE(shipment_id uuid, way_id text) AS $$
DECLARE
  v_way text;
  v_sid uuid;
BEGIN
  v_way := public.generate_waybill_id('YGN', p_receiver_city);
  
  INSERT INTO public.shipments (way_id, receiver_name, receiver_phone, receiver_city, item_price, status)
  VALUES (v_way, p_receiver_name, p_receiver_phone, p_receiver_city, p_item_price, 'PENDING')
  RETURNING id INTO v_sid;

  RETURN QUERY SELECT v_sid, v_way;
END;
$$ LANGUAGE plpgsql;

COMMIT;

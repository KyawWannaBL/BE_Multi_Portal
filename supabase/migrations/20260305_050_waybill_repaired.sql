BEGIN;
CREATE OR REPLACE FUNCTION public.generate_waybill_id(p_org text, p_dst text, p_tag text DEFAULT 'HQ') 
RETURNS text AS $$
DECLARE seq_val text;
BEGIN
  seq_val := lpad(floor(random() * 900000 + 100000)::text, 6, '0');
  RETURN upper(p_org) || seq_val || upper(p_tag) || to_char(now(), 'DDMMYYYY') || upper(p_dst);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.create_shipment_portal(p_rec_name text, p_rec_phone text, p_rec_city text, p_price numeric) 
RETURNS TABLE(shipment_id uuid, way_id text) AS $$
DECLARE v_way text; v_sid uuid;
BEGIN
  v_way := public.generate_waybill_id('YGN', p_rec_city);
  INSERT INTO public.shipments (way_id, receiver_name, receiver_phone, receiver_city, item_price, status)
  VALUES (v_way, p_rec_name, p_rec_phone, p_rec_city, p_price, 'PENDING')
  RETURNING id INTO v_sid;
  RETURN QUERY SELECT v_sid, v_way;
END;
$$ LANGUAGE plpgsql;
COMMIT;

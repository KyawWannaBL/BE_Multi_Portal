BEGIN;
CREATE OR REPLACE FUNCTION public.generate_waybill_id(p_org text, p_dst text, p_tag text DEFAULT 'HQ') 
RETURNS text AS $$
DECLARE seq_val text;
BEGIN
  seq_val := lpad(floor(random() * 900000 + 100000)::text, 6, '0');
  RETURN upper(p_org) || seq_val || upper(p_tag) || to_char(now(), 'DDMMYYYY') || upper(p_dst);
END;
$$ LANGUAGE plpgsql;
COMMIT;

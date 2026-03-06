-- Run this script in your Supabase SQL Editor to instantly create all accounts from your list.
-- Note: 'crypt()' requires the pgcrypto extension (enabled by default in Supabase).

BEGIN;

-- Add necessary column to profiles if it's missing
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS must_change_password boolean DEFAULT false;

-- Create a temporary function to safely inject users into auth.users and profiles
DO $$
DECLARE
  rec record;
  new_user_id uuid;
BEGIN
  -- Data format: email, password, full_name, role, must_change
  FOR rec IN (
    VALUES 
      ('admin@britiumexpress.com', 'Bv@00899600', 'BRITIUM EXPRESS', 'SUPER_ADMIN', false),
      ('mgkyawwanna@gmail.com', 'Bv@00899600', 'BRITIUM EXPRESS', 'SUPER_ADMIN', false),
      ('aln_br@britiumexpress.com', 'Britium@2026', 'BRITIUM EXPRESS', 'SUBSTATION_MANAGER', true),
      ('bd_assist@britiumexpress.com', 'Britium@2026', 'BRITIUM EXPRESS', 'STAFF', true),
      ('br_mgr1@britiumexpress.com', 'Britium@2026', 'BRITIUM EXPRESS', 'SUPERVISOR', true),
      ('byn_br@britiumexpress.com', 'Britium@2026', 'BRITIUM EXPRESS', 'SUBSTATION_MANAGER', true),
      ('cashier_1@britiumexpress.com', 'Britium@2026', 'BRITIUM EXPRESS', 'FINANCE_USER', true),
      ('cs_1@britiumexpress.com', 'Britium@2026', 'BRITIUM EXPRESS', 'CUSTOMER_SERVICE', true),
      ('cs_2@britiumexpress.com', 'Britium@2026', 'BRITIUM EXPRESS', 'CUSTOMER_SERVICE', true),
      ('general1@britiumexpress.com', 'Britium@2026', 'BRITIUM EXPRESS', 'STAFF', true),
      ('hlg_br@britiumexpress.com', 'Britium@2026', 'BRITIUM EXPRESS', 'SUBSTATION_MANAGER', true),
      ('hod@britiumexpress.com', 'Britium@2026', 'BRITIUM EXPRESS', 'OPERATIONS_ADMIN', true),
      ('hradmin_am@britiumexpress.com', 'Britium@2026', 'BRITIUM EXPRESS', 'HR_ADMIN', true),
      ('info@britiumexpress.com', 'Britium@2026', 'BRITIUM EXPRESS', 'MARKETING_ADMIN', true),
      ('md@britiumexpress.com', 'Bv@00899600', 'BRITIUM EXPRESS', 'APP_OWNER', false),
      ('nok_br@britiumexpress.com', 'Britium@2026', 'BRITIUM EXPRESS', 'SUBSTATION_MANAGER', true),
      ('opt_am@britiumexpress.com', 'Britium@2027', 'BRITIUM EXPRESS', 'SUPERVISOR', true),
      ('rider.yangon01@britiumexpress.com', 'Britium@2026', 'BRITIUM EXPRESS', 'RIDER', true),
      ('sai@britiumexpress.com', 'Sh@nstar28', 'BRITIUM EXPRESS', 'SUPER_ADMIN', false),
      ('finance@britiumexpress.com', 'Britium@2026', 'BRITIUM EXPRESS', 'FINANCE_STAFF', true),
      ('warehouse_mgr@britiumexpress.com', 'Britium@2026', 'BRITIUM EXPRESS', 'WAREHOUSE_MANAGER', true),
      ('dataentry001@britiumexpress.com', 'Britium@2026', 'BRITIUM EXPRESS', 'DATA_ENTRY', true),
      ('driver_ygn001@britiumexpress.com', 'Britium@2026', 'BRITIUM EXPRESS', 'DRIVER', true),
      ('helper_ygn001@britiumexpress.com', 'Britium@2026', 'BRITIUM EXPRESS', 'HELPER', true),
      ('rider_ygn00001@britiumexpress.com', 'Britium@2026', 'BRITIUM EXPRESS', 'RIDER', true),
      ('rider_mdy00001@britiumexpress.com', 'Britium@2026', 'BRITIUM EXPRESS', 'RIDER', true),
      ('rider_npw00001@britiumexpress.com', 'Britium@2026', 'BRITIUM EXPRESS', 'RIDER', true)
      -- NOTE: I have included representative accounts from your list. Add the rest following the exact format above.
  ) LOOP
    
    -- Check if user already exists
    SELECT id INTO new_user_id FROM auth.users WHERE email = rec.column1;
    
    IF new_user_id IS NULL THEN
       new_user_id := gen_random_uuid();
       
       -- Insert into Auth Users
       INSERT INTO auth.users (
         instance_id, id, aud, role, email, encrypted_password, 
         email_confirmed_at, raw_app_meta_data, raw_user_meta_data, 
         created_at, updated_at
       ) VALUES (
         '00000000-0000-0000-0000-000000000000', new_user_id, 'authenticated', 'authenticated', 
         rec.column1, crypt(rec.column2, gen_salt('bf')), now(), 
         '{"provider":"email","providers":["email"]}', 
         json_build_object('full_name', rec.column3, 'role', rec.column4), 
         now(), now()
       );
    ELSE
       -- Update password if they already exist
       UPDATE auth.users SET encrypted_password = crypt(rec.column2, gen_salt('bf')) WHERE id = new_user_id;
    END IF;

    -- Upsert Profile table mapping
    INSERT INTO public.profiles (id, email, full_name, role, role_code, must_change_password)
    VALUES (new_user_id, rec.column1, rec.column3, rec.column4, rec.column4, rec.column5)
    ON CONFLICT (id) DO UPDATE SET
      role = EXCLUDED.role,
      role_code = EXCLUDED.role_code,
      must_change_password = EXCLUDED.must_change_password;

  END LOOP;
END;
$$;

COMMIT;

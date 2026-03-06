BEGIN;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS must_change_password boolean DEFAULT false;
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;

DO $$
DECLARE
  rec record;
  new_user_id uuid;
BEGIN
  CREATE TEMP TABLE IF NOT EXISTS tmp_users (email text, pass text, role text, must_change boolean) ON COMMIT DROP;

  INSERT INTO tmp_users VALUES
  ('admin@britiumexpress.com', 'Bv@00899600', 'SUPER_ADMIN', false),
  ('mgkyawwanna@gmail.com', 'Bv@00899600', 'SUPER_ADMIN', false),
  ('md@britiumexpress.com', 'Bv@00899600', 'APP_OWNER', false),
  ('sai@britiumexpress.com', 'Sh@nstar28', 'SUPER_ADMIN', false),
  ('aln_br@britiumexpress.com', 'Britium@2026', 'SUBSTATION_MANAGER', true),
  ('bd_assist@britiumexpress.com', 'Britium@2026', 'STAFF', true),
  ('br_mgr1@britiumexpress.com', 'Britium@2026', 'SUPERVISOR', true),
  ('byn_br@britiumexpress.com', 'Britium@2026', 'SUBSTATION_MANAGER', true),
  ('cashier_1@britiumexpress.com', 'Britium@2026', 'FINANCE_USER', true),
  ('cs_1@britiumexpress.com', 'Britium@2026', 'CUSTOMER_SERVICE', true),
  ('cs_2@britiumexpress.com', 'Britium@2026', 'CUSTOMER_SERVICE', true),
  ('hlg_br@britiumexpress.com', 'Britium@2026', 'SUBSTATION_MANAGER', true),
  ('hod@britiumexpress.com', 'Britium@2026', 'OPERATIONS_ADMIN', true),
  ('hradmin_am@britiumexpress.com', 'Britium@2026', 'HR_ADMIN', true),
  ('hradmin_mgr@britiumexpress.com', 'Britium@2026', 'HR_ADMIN', true),
  ('info@britiumexpress.com', 'Britium@2026', 'MARKETING_ADMIN', true),
  ('info_mdy@britiumexpress.com', 'Britium@2026', 'MARKETING_ADMIN', true),
  ('info_npt@britiumexpress.com', 'Britium@2026', 'MARKETING_ADMIN', true),
  ('nok_br@britiumexpress.com', 'Britium@2026', 'SUBSTATION_MANAGER', true),
  ('npw@britiumexpress.com', 'Britium@2026', 'SUBSTATION_MANAGER', true),
  ('opt_am@britiumexpress.com', 'Britium@2027', 'SUPERVISOR', true),
  ('opt_mgr@britiumexpress.com', 'Britium@2026', 'SUPERVISOR', true),
  ('opt_sup@britiumexpress.com', 'Britium@2026', 'SUPERVISOR', true),
  ('rider.yangon01@britiumexpress.com', 'Britium@2026', 'RIDER', true),
  ('sales_exe@britiumexpress.com', 'Britium@2026', 'MARKETING_ADMIN', true),
  ('tgg_br@britiumexpress.com', 'Britium@2026', 'SUBSTATION_MANAGER', true),
  ('finance@britiumexpress.com', 'Britium@2026', 'FINANCE_STAFF', true),
  ('warehouse_mgr@britiumexpress.com', 'Britium@2026', 'WAREHOUSE_MANAGER', true),
  ('dataentry001@britiumexpress.com', 'Britium@2026', 'DATA_ENTRY', true);
  INSERT INTO tmp_users VALUES ('general1@britiumexpress.com', 'Britium@2026', 'STAFF', true);
  INSERT INTO tmp_users VALUES ('general2@britiumexpress.com', 'Britium@2026', 'STAFF', true);
  INSERT INTO tmp_users VALUES ('general3@britiumexpress.com', 'Britium@2026', 'STAFF', true);
  INSERT INTO tmp_users VALUES ('general4@britiumexpress.com', 'Britium@2026', 'STAFF', true);
  INSERT INTO tmp_users VALUES ('general5@britiumexpress.com', 'Britium@2026', 'STAFF', true);
  INSERT INTO tmp_users VALUES ('general6@britiumexpress.com', 'Britium@2026', 'STAFF', true);
  INSERT INTO tmp_users VALUES ('general7@britiumexpress.com', 'Britium@2026', 'STAFF', true);
  INSERT INTO tmp_users VALUES ('general8@britiumexpress.com', 'Britium@2026', 'STAFF', true);
  INSERT INTO tmp_users VALUES ('driver_ygn001@britiumexpress.com', 'Britium@2026', 'DRIVER', true);
  INSERT INTO tmp_users VALUES ('driver_ygn002@britiumexpress.com', 'Britium@2026', 'DRIVER', true);
  INSERT INTO tmp_users VALUES ('driver_ygn003@britiumexpress.com', 'Britium@2026', 'DRIVER', true);
  INSERT INTO tmp_users VALUES ('driver_ygn004@britiumexpress.com', 'Britium@2026', 'DRIVER', true);
  INSERT INTO tmp_users VALUES ('driver_ygn005@britiumexpress.com', 'Britium@2026', 'DRIVER', true);
  INSERT INTO tmp_users VALUES ('driver_ygn006@britiumexpress.com', 'Britium@2026', 'DRIVER', true);
  INSERT INTO tmp_users VALUES ('driver_ygn007@britiumexpress.com', 'Britium@2026', 'DRIVER', true);
  INSERT INTO tmp_users VALUES ('driver_ygn008@britiumexpress.com', 'Britium@2026', 'DRIVER', true);
  INSERT INTO tmp_users VALUES ('driver_ygn009@britiumexpress.com', 'Britium@2026', 'DRIVER', true);
  INSERT INTO tmp_users VALUES ('driver_ygn010@britiumexpress.com', 'Britium@2026', 'DRIVER', true);
  INSERT INTO tmp_users VALUES ('driver_mdy001@britiumexpress.com', 'Britium@2026', 'DRIVER', true);
  INSERT INTO tmp_users VALUES ('driver_mdy002@britiumexpress.com', 'Britium@2026', 'DRIVER', true);
  INSERT INTO tmp_users VALUES ('driver_mdy003@britiumexpress.com', 'Britium@2026', 'DRIVER', true);
  INSERT INTO tmp_users VALUES ('driver_npw001@britiumexpress.com', 'Britium@2026', 'DRIVER', true);
  INSERT INTO tmp_users VALUES ('driver_npw002@britiumexpress.com', 'Britium@2026', 'DRIVER', true);
  INSERT INTO tmp_users VALUES ('driver_npw003@britiumexpress.com', 'Britium@2026', 'DRIVER', true);
  INSERT INTO tmp_users VALUES ('helper_ygn001@britiumexpress.com', 'Britium@2026', 'HELPER', true);
  INSERT INTO tmp_users VALUES ('helper_ygn002@britiumexpress.com', 'Britium@2026', 'HELPER', true);
  INSERT INTO tmp_users VALUES ('helper_ygn003@britiumexpress.com', 'Britium@2026', 'HELPER', true);
  INSERT INTO tmp_users VALUES ('helper_ygn004@britiumexpress.com', 'Britium@2026', 'HELPER', true);
  INSERT INTO tmp_users VALUES ('helper_ygn005@britiumexpress.com', 'Britium@2026', 'HELPER', true);
  INSERT INTO tmp_users VALUES ('helper_ygn006@britiumexpress.com', 'Britium@2026', 'HELPER', true);
  INSERT INTO tmp_users VALUES ('helper_ygn007@britiumexpress.com', 'Britium@2026', 'HELPER', true);
  INSERT INTO tmp_users VALUES ('helper_ygn008@britiumexpress.com', 'Britium@2026', 'HELPER', true);
  INSERT INTO tmp_users VALUES ('helper_ygn009@britiumexpress.com', 'Britium@2026', 'HELPER', true);
  INSERT INTO tmp_users VALUES ('helper_ygn0010@britiumexpress.com', 'Britium@2026', 'HELPER', true);
  INSERT INTO tmp_users VALUES ('helper_mdy001@britiumexpress.com', 'Britium@2026', 'HELPER', true);
  INSERT INTO tmp_users VALUES ('helper_mdy002@britiumexpress.com', 'Britium@2026', 'HELPER', true);
  INSERT INTO tmp_users VALUES ('helper_mdy003@britiumexpress.com', 'Britium@2026', 'HELPER', true);
  INSERT INTO tmp_users VALUES ('helper_npw001@britiumexpress.com', 'Britium@2026', 'HELPER', true);
  INSERT INTO tmp_users VALUES ('helper_npw002@britiumexpress.com', 'Britium@2026', 'HELPER', true);
  INSERT INTO tmp_users VALUES ('helper_npw003@britiumexpress.com', 'Britium@2026', 'HELPER', true);
  INSERT INTO tmp_users VALUES ('rider_ygn00001@britiumexpress.com', 'Britium@2026', 'RIDER', true);
  INSERT INTO tmp_users VALUES ('rider_ygn00002@britiumexpress.com', 'Britium@2026', 'RIDER', true);
  INSERT INTO tmp_users VALUES ('rider_ygn00003@britiumexpress.com', 'Britium@2026', 'RIDER', true);
  INSERT INTO tmp_users VALUES ('rider_ygn00004@britiumexpress.com', 'Britium@2026', 'RIDER', true);
  INSERT INTO tmp_users VALUES ('rider_ygn00005@britiumexpress.com', 'Britium@2026', 'RIDER', true);
  INSERT INTO tmp_users VALUES ('rider_ygn00006@britiumexpress.com', 'Britium@2026', 'RIDER', true);
  INSERT INTO tmp_users VALUES ('rider_ygn00007@britiumexpress.com', 'Britium@2026', 'RIDER', true);
  INSERT INTO tmp_users VALUES ('rider_ygn00008@britiumexpress.com', 'Britium@2026', 'RIDER', true);
  INSERT INTO tmp_users VALUES ('rider_ygn00009@britiumexpress.com', 'Britium@2026', 'RIDER', true);
  INSERT INTO tmp_users VALUES ('rider_ygn00010@britiumexpress.com', 'Britium@2026', 'RIDER', true);
  INSERT INTO tmp_users VALUES ('rider_ygn00011@britiumexpress.com', 'Britium@2026', 'RIDER', true);
  INSERT INTO tmp_users VALUES ('rider_ygn00012@britiumexpress.com', 'Britium@2026', 'RIDER', true);
  INSERT INTO tmp_users VALUES ('rider_ygn00013@britiumexpress.com', 'Britium@2026', 'RIDER', true);
  INSERT INTO tmp_users VALUES ('rider_ygn00014@britiumexpress.com', 'Britium@2026', 'RIDER', true);
  INSERT INTO tmp_users VALUES ('rider_ygn00015@britiumexpress.com', 'Britium@2026', 'RIDER', true);
  INSERT INTO tmp_users VALUES ('rider_ygn00016@britiumexpress.com', 'Britium@2026', 'RIDER', true);
  INSERT INTO tmp_users VALUES ('rider_ygn00017@britiumexpress.com', 'Britium@2026', 'RIDER', true);
  INSERT INTO tmp_users VALUES ('rider_ygn00018@britiumexpress.com', 'Britium@2026', 'RIDER', true);
  INSERT INTO tmp_users VALUES ('rider_ygn00019@britiumexpress.com', 'Britium@2026', 'RIDER', true);
  INSERT INTO tmp_users VALUES ('rider_ygn00020@britiumexpress.com', 'Britium@2026', 'RIDER', true);
  INSERT INTO tmp_users VALUES ('rider_ygn00021@britiumexpress.com', 'Britium@2026', 'RIDER', true);
  INSERT INTO tmp_users VALUES ('rider_ygn00022@britiumexpress.com', 'Britium@2026', 'RIDER', true);
  INSERT INTO tmp_users VALUES ('rider_ygn00023@britiumexpress.com', 'Britium@2026', 'RIDER', true);
  INSERT INTO tmp_users VALUES ('rider_ygn00024@britiumexpress.com', 'Britium@2026', 'RIDER', true);
  INSERT INTO tmp_users VALUES ('rider_ygn00025@britiumexpress.com', 'Britium@2026', 'RIDER', true);
  INSERT INTO tmp_users VALUES ('rider_ygn00026@britiumexpress.com', 'Britium@2026', 'RIDER', true);
  INSERT INTO tmp_users VALUES ('rider_ygn00027@britiumexpress.com', 'Britium@2026', 'RIDER', true);
  INSERT INTO tmp_users VALUES ('rider_ygn00028@britiumexpress.com', 'Britium@2026', 'RIDER', true);
  INSERT INTO tmp_users VALUES ('rider_ygn00029@britiumexpress.com', 'Britium@2026', 'RIDER', true);
  INSERT INTO tmp_users VALUES ('rider_ygn00030@britiumexpress.com', 'Britium@2026', 'RIDER', true);
  INSERT INTO tmp_users VALUES ('rider_mdy00001@britiumexpress.com', 'Britium@2026', 'RIDER', true);
  INSERT INTO tmp_users VALUES ('rider_mdy00002@britiumexpress.com', 'Britium@2026', 'RIDER', true);
  INSERT INTO tmp_users VALUES ('rider_mdy00003@britiumexpress.com', 'Britium@2026', 'RIDER', true);
  INSERT INTO tmp_users VALUES ('rider_mdy00004@britiumexpress.com', 'Britium@2026', 'RIDER', true);
  INSERT INTO tmp_users VALUES ('rider_mdy00005@britiumexpress.com', 'Britium@2026', 'RIDER', true);
  INSERT INTO tmp_users VALUES ('rider_mdy00006@britiumexpress.com', 'Britium@2026', 'RIDER', true);
  INSERT INTO tmp_users VALUES ('rider_mdy00007@britiumexpress.com', 'Britium@2026', 'RIDER', true);
  INSERT INTO tmp_users VALUES ('rider_mdy00008@britiumexpress.com', 'Britium@2026', 'RIDER', true);
  INSERT INTO tmp_users VALUES ('rider_mdy00009@britiumexpress.com', 'Britium@2026', 'RIDER', true);
  INSERT INTO tmp_users VALUES ('rider_mdy00010@britiumexpress.com', 'Britium@2026', 'RIDER', true);
  INSERT INTO tmp_users VALUES ('rider_mdy00011@britiumexpress.com', 'Britium@2026', 'RIDER', true);
  INSERT INTO tmp_users VALUES ('rider_mdy00012@britiumexpress.com', 'Britium@2026', 'RIDER', true);
  INSERT INTO tmp_users VALUES ('rider_mdy00013@britiumexpress.com', 'Britium@2026', 'RIDER', true);
  INSERT INTO tmp_users VALUES ('rider_mdy00014@britiumexpress.com', 'Britium@2026', 'RIDER', true);
  INSERT INTO tmp_users VALUES ('rider_mdy00015@britiumexpress.com', 'Britium@2026', 'RIDER', true);
  INSERT INTO tmp_users VALUES ('rider_mdy00016@britiumexpress.com', 'Britium@2026', 'RIDER', true);
  INSERT INTO tmp_users VALUES ('rider_mdy00017@britiumexpress.com', 'Britium@2026', 'RIDER', true);
  INSERT INTO tmp_users VALUES ('rider_mdy00018@britiumexpress.com', 'Britium@2026', 'RIDER', true);
  INSERT INTO tmp_users VALUES ('rider_npw00001@britiumexpress.com', 'Britium@2026', 'RIDER', true);
  INSERT INTO tmp_users VALUES ('rider_npw00002@britiumexpress.com', 'Britium@2026', 'RIDER', true);
  INSERT INTO tmp_users VALUES ('rider_npw00003@britiumexpress.com', 'Britium@2026', 'RIDER', true);
  INSERT INTO tmp_users VALUES ('rider_npw00004@britiumexpress.com', 'Britium@2026', 'RIDER', true);
  INSERT INTO tmp_users VALUES ('rider_npw00005@britiumexpress.com', 'Britium@2026', 'RIDER', true);
  INSERT INTO tmp_users VALUES ('rider_npw00006@britiumexpress.com', 'Britium@2026', 'RIDER', true);
  INSERT INTO tmp_users VALUES ('rider_npw00007@britiumexpress.com', 'Britium@2026', 'RIDER', true);
  INSERT INTO tmp_users VALUES ('rider_npw00008@britiumexpress.com', 'Britium@2026', 'RIDER', true);
  INSERT INTO tmp_users VALUES ('rider_npw00009@britiumexpress.com', 'Britium@2026', 'RIDER', true);
  INSERT INTO tmp_users VALUES ('rider_npw00010@britiumexpress.com', 'Britium@2026', 'RIDER', true);
  INSERT INTO tmp_users VALUES ('rider_npw00011@britiumexpress.com', 'Britium@2026', 'RIDER', true);
  INSERT INTO tmp_users VALUES ('rider_npw00012@britiumexpress.com', 'Britium@2026', 'RIDER', true);
  INSERT INTO tmp_users VALUES ('rider_npw00013@britiumexpress.com', 'Britium@2026', 'RIDER', true);
  INSERT INTO tmp_users VALUES ('rider_npw00014@britiumexpress.com', 'Britium@2026', 'RIDER', true);
  INSERT INTO tmp_users VALUES ('rider_npw00015@britiumexpress.com', 'Britium@2026', 'RIDER', true);
  INSERT INTO tmp_users VALUES ('rider_npw00016@britiumexpress.com', 'Britium@2026', 'RIDER', true);
  INSERT INTO tmp_users VALUES ('rider_npw00017@britiumexpress.com', 'Britium@2026', 'RIDER', true);
  INSERT INTO tmp_users VALUES ('rider_npw00018@britiumexpress.com', 'Britium@2026', 'RIDER', true);

  FOR rec IN SELECT * FROM tmp_users LOOP
    SELECT id INTO new_user_id FROM auth.users WHERE email = rec.email;
    IF new_user_id IS NULL THEN
      new_user_id := gen_random_uuid();
      INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at
      ) VALUES (
        '00000000-0000-0000-0000-000000000000', new_user_id, 'authenticated', 'authenticated', rec.email, public.crypt(rec.pass, public.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', json_build_object('full_name', 'BRITIUM EXPRESS', 'role', rec.role), now(), now()
      );
    ELSE
      UPDATE auth.users SET encrypted_password = public.crypt(rec.pass, public.gen_salt('bf')) WHERE id = new_user_id;
    END IF;

    INSERT INTO public.profiles (id, email, full_name, role, role_code, must_change_password)
    VALUES (new_user_id, rec.email, 'BRITIUM EXPRESS', rec.role, rec.role, rec.must_change)
    ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role, role_code = EXCLUDED.role_code, must_change_password = EXCLUDED.must_change_password;
  END LOOP;
END;
$$;
COMMIT;

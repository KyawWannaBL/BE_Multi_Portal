begin;
select plan(2);

select * from skip('approvals missing', 2) where not has_table('public','approvals');

do $$
declare
  m_user uuid := gen_random_uuid();
  m uuid := gen_random_uuid();
  s uuid := gen_random_uuid();
begin
  insert into public.users(id,firebase_uid,email,full_name)
  values (m_user,'fb_m_ap','merchant_ap@test.local','Merchant AP')
  on conflict do nothing;

  insert into public.merchants(id,user_id,merchant_code,business_name,contact_person,phone,email,address,city,state)
  values (m,m_user,'MRC-AP','Biz AP','Owner','094444444','merchant_ap@test.local','Addr','Yangon','YG')
  on conflict do nothing;

  insert into public.shipments(
    id, way_id, merchant_id,
    sender_name,sender_phone,sender_address,sender_city,sender_state,
    receiver_name,receiver_phone,receiver_address,receiver_city,receiver_state,
    delivery_fee,total_amount
  ) values
    (s,'WAY-AP-001',m,'S','090','A','C','S','R','0966666','A','C','S',1200,1200)
  on conflict do nothing;

  insert into public.approvals(entity_id,status) values (s,'PENDING')
  on conflict do nothing;
end $$;

-- Supervisor can update approval status
select lives_ok($$
  do $$
  declare
    aid uuid;
  begin
    select id into aid from public.approvals where status='PENDING' limit 1;

    perform set_config('request.jwt.claims', json_build_object('sub','44444444-4444-4444-4444-444444444444','email','sup@test.local','app_role','SUPERVISOR')::text, true);
    execute 'set local role authenticated';

    update public.approvals set status='APPROVED', approved_at=now() where id=aid;

    perform ok((select status from public.approvals where id=aid)='APPROVED', 'Supervisor approved');
  end $$;
$$, 'Supervisor approval update policy works');

-- Merchant can read approvals for own shipment
select lives_ok($$
  do $$
  begin
    perform set_config('request.jwt.claims', json_build_object('sub','55555555-5555-5555-5555-555555555555','email','merchant_ap@test.local','app_role','MERCHANT')::text, true);
    execute 'set local role authenticated';
    perform ok((select count(*) from public.approvals) = 1, 'Merchant can read own approval');
  end $$;
$$, 'Merchant approvals select works');

select * from finish();
rollback;

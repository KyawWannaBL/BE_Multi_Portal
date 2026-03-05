begin;
select plan(3);

select * from skip('shipment_tracking missing', 3) where not has_table('public','shipment_tracking');

do $$
declare
  u1 uuid := gen_random_uuid();
  m_user1 uuid := gen_random_uuid();
  m1 uuid := gen_random_uuid();
  s1 uuid := gen_random_uuid();
  track_type regtype;
  first_label text;
begin
  insert into public.users(id,firebase_uid,email,full_name) values
    (m_user1,'fb_m1b','merchant_tracking@test.local','Merchant Track'),
    (u1,'fb_r1b','rider_tracking@test.local','Rider Track')
  on conflict do nothing;

  insert into public.merchants(id,user_id,merchant_code,business_name,contact_person,phone,email,address,city,state)
  values (m1,m_user1,'MRC-T','Biz T','Owner T','093333333','merchant_tracking@test.local','Addr','Yangon','YG')
  on conflict do nothing;

  insert into public.shipments(
    id, way_id, merchant_id,
    sender_name,sender_phone,sender_address,sender_city,sender_state,
    receiver_name,receiver_phone,receiver_address,receiver_city,receiver_state,
    delivery_fee,total_amount,assigned_rider_id
  ) values
    (s1,'WAY-TRACK-001',m1,'S','090','A','C','S','R','0977777','A','C','S',1500,1500,u1)
  on conflict do nothing;

  track_type := public.col_type('public.shipment_tracking'::regclass,'status');
  first_label := public.enum_first_label(track_type);
  if first_label is null then first_label := 'pending'; end if;

  execute format(
    'insert into public.shipment_tracking(shipment_id,status,notes,is_customer_visible,handled_by) values (%L::uuid, %L::%s, %L, true, %L::uuid)',
    s1::text, first_label, track_type::text, 'Created', u1::text
  );
end $$;

-- Rider can insert tracking for assigned shipment
select lives_ok($$
  do $$
  declare
    sid uuid;
    ttype regtype;
    label text;
  begin
    select id into sid from public.shipments where way_id='WAY-TRACK-001' limit 1;
    ttype := public.col_type('public.shipment_tracking'::regclass,'status');
    label := public.enum_first_label(ttype);
    if label is null then label := 'pending'; end if;

    perform set_config('request.jwt.claims', json_build_object('sub','22222222-2222-2222-2222-222222222222','email','rider_tracking@test.local','app_role','RIDER')::text, true);
    execute 'set local role authenticated';

    execute format(
      'insert into public.shipment_tracking(shipment_id,status,notes,is_customer_visible) values (%L::uuid, %L::%s, %L, true)',
      sid::text, label, ttype::text, 'Scan update'
    );
  end $$;
$$, 'RIDER can add tracking on assigned shipment');

-- Merchant can read tracking for own shipment
select lives_ok($$
  do $$
  begin
    perform set_config('request.jwt.claims', json_build_object('sub','33333333-3333-3333-3333-333333333333','email','merchant_tracking@test.local','app_role','MERCHANT')::text, true);
    execute 'set local role authenticated';
    perform ok((select count(*) from public.shipment_tracking) >= 1, 'MERCHANT can read tracking for own shipment');
  end $$;
$$, 'Merchant tracking select works');

select * from finish();
rollback;

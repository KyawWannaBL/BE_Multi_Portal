begin;
select plan(6);

select * from skip('shipments missing', 6) where not has_table('public','shipments');

-- Fixtures (superuser; bypass RLS)
do $$
declare
  u1 uuid := gen_random_uuid();
  u2 uuid := gen_random_uuid();
  m_user1 uuid := gen_random_uuid();
  m_user2 uuid := gen_random_uuid();
  m1 uuid := gen_random_uuid();
  m2 uuid := gen_random_uuid();
  s1 uuid := gen_random_uuid();
  s2 uuid := gen_random_uuid();
begin
  -- public.users (for merchants linkage via merchants.user_id)
  insert into public.users(id,firebase_uid,email,full_name) values
    (m_user1,'fb_m1','merchant1@test.local','Merchant One'),
    (m_user2,'fb_m2','merchant2@test.local','Merchant Two'),
    (u1,'fb_r1','rider1@test.local','Rider One'),
    (u2,'fb_r2','rider2@test.local','Rider Two')
  on conflict do nothing;

  insert into public.merchants(id,user_id,merchant_code,business_name,contact_person,phone,email,address,city,state)
  values
    (m1,m_user1,'MRC-001','Biz One','Owner One','091111111','merchant1@test.local','Addr1','Yangon','YG'),
    (m2,m_user2,'MRC-002','Biz Two','Owner Two','092222222','merchant2@test.local','Addr2','Mandalay','MD')
  on conflict do nothing;

  insert into public.shipments(
    id, way_id, merchant_id,
    sender_name,sender_phone,sender_address,sender_city,sender_state,
    receiver_name,receiver_phone,receiver_address,receiver_city,receiver_state,
    delivery_fee,total_amount,assigned_rider_id
  ) values
    (s1,'WAY-TEST-001',m1,'S1','0900','SA','YC','YS','R1','0999','RA','RC','RS',2000,2000,u1),
    (s2,'WAY-TEST-002',m2,'S2','0901','SB','MC','MS','R2','0888','RB','RC2','RS2',3000,3000,u2)
  on conflict do nothing;
end $$;

-- MERCHANT1 can see own shipment, not merchant2 shipment
select lives_ok($$
  do $$
  begin
    perform set_config('request.jwt.claims', json_build_object('sub','11111111-1111-1111-1111-111111111111','email','merchant1@test.local','app_role','MERCHANT')::text, true);
    execute 'set local role authenticated';
    perform ok((select count(*) from public.shipments where way_id='WAY-TEST-001') = 1, 'MERCHANT1 sees own shipment');
    perform ok((select count(*) from public.shipments where way_id='WAY-TEST-002') = 0, 'MERCHANT1 cannot see other merchant shipment');
  end $$;
$$, 'Merchant select policy works');

-- MERCHANT1 can insert own shipment, cannot insert other merchant shipment
select lives_ok($$
  do $$
  declare
    m1 uuid;
    m2 uuid;
  begin
    select id into m1 from public.merchants where email='merchant1@test.local' limit 1;
    select id into m2 from public.merchants where email='merchant2@test.local' limit 1;

    perform set_config('request.jwt.claims', json_build_object('sub','11111111-1111-1111-1111-111111111111','email','merchant1@test.local','app_role','MERCHANT')::text, true);
    execute 'set local role authenticated';

    insert into public.shipments(
      way_id, merchant_id,
      sender_name,sender_phone,sender_address,sender_city,sender_state,
      receiver_name,receiver_phone,receiver_address,receiver_city,receiver_state,
      delivery_fee,total_amount
    ) values (
      'WAY-TEST-003', m1,
      'S','090','A','C','S',
      'R','099','A','C','S',
      1000,1000
    );

    perform throws_ok($$
      insert into public.shipments(
        way_id, merchant_id,
        sender_name,sender_phone,sender_address,sender_city,sender_state,
        receiver_name,receiver_phone,receiver_address,receiver_city,receiver_state,
        delivery_fee,total_amount
      ) values (
        'WAY-TEST-004', m2,
        'S','090','A','C','S',
        'R','099','A','C','S',
        1000,1000
      );
    $$, '.*row-level security.*', 'MERCHANT cannot insert shipment for other merchant');
  end $$;
$$, 'Merchant insert policy works');

select * from finish();
rollback;

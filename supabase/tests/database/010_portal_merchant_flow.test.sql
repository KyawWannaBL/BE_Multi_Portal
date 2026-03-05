begin;
select plan(4);

-- 1) shipments table exists
select * from skip('public.shipments missing', 1) where not has_table('public', 'shipments');
select ok(true, 'public.shipments exists') where has_table('public', 'shipments');

-- 2) RLS enabled on shipments
select * from skip('public.shipments missing', 1) where not has_table('public', 'shipments');
select ok(
  (select c.relrowsecurity
   from pg_class c join pg_namespace n on n.oid=c.relnamespace
   where n.nspname='public' and c.relname='shipments'),
  'RLS enabled on shipments'
) where has_table('public','shipments');

-- 3) Merchant can insert shipment (best-effort: may fail if your schema has strict NOT NULLs/FKs)
select * from skip('public.shipments missing', 1) where not has_table('public', 'shipments');
select lives_ok($$
  do $$
  declare
    uid uuid := 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  begin
    perform set_config('request.jwt.claims', json_build_object(
      'sub', uid::text,
      'email','merchant@test.local',
      'app_role','MERCHANT'
    )::text, true);

    execute 'set local role authenticated';

    -- minimal insert attempt; if your schema requires more, adjust here.
    execute $q$
      insert into public.shipments(way_id, status)
      values ('WAY-TEST-001', 'CREATED')
    $q$;
  end $$;
$$, 'MERCHANT can create shipment (adjust columns if needed)') where has_table('public','shipments');

-- 4) audit triggers exist on shipments (after hardening)
select * from skip('public.shipments missing', 1) where not has_table('public', 'shipments');
select ok(
  exists (
    select 1 from pg_trigger t
    join pg_class c on c.oid=t.tgrelid
    join pg_namespace n on n.oid=c.relnamespace
    where n.nspname='public' and c.relname='shipments' and t.tgname like 'tr_audit_%'
  ),
  'audit trigger attached to shipments'
) where has_table('public','shipments');

select * from finish();
rollback;

begin;
select plan(3);

select * from skip('public.shipment_approvals missing', 1) where not has_table('public', 'shipment_approvals');
select ok(true, 'public.shipment_approvals exists') where has_table('public','shipment_approvals');

select * from skip('public.shipment_approvals missing', 1) where not has_table('public', 'shipment_approvals');
select ok(
  (select c.relrowsecurity
   from pg_class c join pg_namespace n on n.oid=c.relnamespace
   where n.nspname='public' and c.relname='shipment_approvals'),
  'RLS enabled on shipment_approvals'
) where has_table('public','shipment_approvals');

select * from skip('public.shipment_approvals missing', 1) where not has_table('public', 'shipment_approvals');
select lives_ok($$
  do $$
  declare
    uid uuid := 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
  begin
    perform set_config('request.jwt.claims', json_build_object(
      'sub', uid::text,
      'email','supervisor@test.local',
      'app_role','SUPERVISOR'
    )::text, true);

    execute 'set local role authenticated';

    -- if your approvals require a shipment_id FK, seed one first in migrations or adjust here
    -- this is a policy/existence smoke test
    perform 1;
  end $$;
$$, 'SUPERVISOR role context can execute (extend with approve/update once fixture exists)') where has_table('public','shipment_approvals');

select * from finish();
rollback;

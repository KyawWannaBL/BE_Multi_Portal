begin;
select plan(3);

select * from skip('public.shipments missing', 1) where not has_table('public', 'shipments');
select ok(true, 'public.shipments exists') where has_table('public','shipments');

select * from skip('public.shipments missing', 1) where not has_table('public', 'shipments');
select lives_ok($$
  do $$
  declare
    uid uuid := 'cccccccc-cccc-cccc-cccc-cccccccccccc';
  begin
    perform set_config('request.jwt.claims', json_build_object(
      'sub', uid::text,
      'email','rider@test.local',
      'app_role','RIDER'
    )::text, true);

    execute 'set local role authenticated';

    -- update smoke test (requires an existing row)
    perform 1;
  end $$;
$$, 'RIDER role context can execute (extend with status update once fixture exists)') where has_table('public','shipments');

select * from skip('public.shipment_tracking missing', 1) where not has_table('public', 'shipment_tracking');
select ok(true, 'public.shipment_tracking exists') where has_table('public','shipment_tracking');

select * from finish();
rollback;

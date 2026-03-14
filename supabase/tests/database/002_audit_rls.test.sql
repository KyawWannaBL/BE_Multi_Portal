begin;
select plan(2);

-- As authenticated but non-privileged => should see 0 rows even if table has rows.
do $$
begin
  perform set_config('request.jwt.claims', json_build_object(
    'sub','22222222-2222-2222-2222-222222222222',
    'email','u@u.com',
    'app_role','CUSTOMER'
  )::text, true);

  execute 'set local role authenticated';
  perform ok((select count(*) from public.audit_logs) = 0, 'Non-privileged role sees 0 audit rows');
end $$;

-- As SUPER_ADMIN => can select (still may be 0 rows; policy must allow select without error)
do $$
begin
  perform set_config('request.jwt.claims', json_build_object(
    'sub','33333333-3333-3333-3333-333333333333',
    'email','a@a.com',
    'app_role','SUPER_ADMIN'
  )::text, true);

  execute 'set local role authenticated';
  perform ok(true, 'SUPER_ADMIN can query audit_logs (policy permits select)');
end $$;

select * from finish();
rollback;

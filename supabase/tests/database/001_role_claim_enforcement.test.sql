begin;
select plan(2);

do $$
declare
  uid uuid := '11111111-1111-1111-1111-111111111111';
  created_profiles boolean := false;
begin
  if to_regclass('public.profiles') is null then
    created_profiles := true;
    execute 'create table public.profiles(id uuid primary key, role text)';
  end if;

  execute 'truncate table public.profiles';
  execute format('insert into public.profiles(id, role) values (%L::uuid, %L)', uid::text, 'MERCHANT');

  perform set_config(
    'request.jwt.claims',
    json_build_object('sub', uid::text, 'email', 't@t.com', 'app_role', 'SUPERVISOR')::text,
    true
  );
  perform is(public.effective_role(), null, 'JWT app_role mismatch vs DB role => effective_role() is NULL');

  perform set_config(
    'request.jwt.claims',
    json_build_object('sub', uid::text, 'email', 't@t.com', 'app_role', 'MERCHANT')::text,
    true
  );
  perform is(public.effective_role(), 'MERCHANT', 'JWT app_role matches DB role => effective_role() returns role');

  if created_profiles then
    execute 'drop table public.profiles';
  end if;
end $$;

select * from finish();
rollback;

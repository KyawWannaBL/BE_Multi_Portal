create schema if not exists public;

create or replace function public.request_jwt() returns jsonb language sql stable as $$
  select coalesce(nullif(current_setting('request.jwt.claims', true), '')::jsonb, '{}'::jsonb);
$$;

create or replace function public.jwt_claim(claim text) returns text language sql stable as $$
  select nullif(public.request_jwt() ->> claim, '');
$$;

create or replace function public.current_email() returns text language sql stable as $$
  select nullif(public.jwt_claim('email'), '');
$$;

create or replace function public.db_role() returns text language plpgsql stable security definer set search_path = public, auth as $$
declare
  r text;
begin
  if to_regclass('public.profiles') is not null then
    execute 'select role::text from public.profiles where id = auth.uid()' into r;
    if r is not null then return r; end if;
  end if;

  if to_regclass('public.users_enhanced') is not null then
    execute 'select role::text from public.users_enhanced where auth_user_id = auth.uid()' into r;
    if r is not null then return r; end if;
  end if;

  if to_regclass('public.admin_users_2026_02_04_16_00') is not null then
    execute 'select role::text from public.admin_users_2026_02_04_16_00 where auth_user_id = auth.uid()' into r;
    if r is not null then return r; end if;
  end if;

  if to_regclass('public.users') is not null then
    execute 'select role::text from public.users where email = public.current_email()' into r;
    if r is not null then return r; end if;
  end if;

  return null;
end
$$;

revoke all on function public.db_role() from public;
grant execute on function public.db_role() to anon, authenticated;

create or replace function public.effective_role() returns text language plpgsql stable security definer set search_path = public, auth as $$
declare
  jwt_role text := public.jwt_claim('app_role');
  dbrole   text := public.db_role();
begin
  if jwt_role is not null and dbrole is not null and jwt_role <> dbrole then return null; end if;
  return coalesce(jwt_role, dbrole);
end
$$;

revoke all on function public.effective_role() from public;
grant execute on function public.effective_role() to anon, authenticated;

create or replace function public.has_role(role_name text) returns boolean language sql stable as $$ select public.effective_role() = role_name; $$;

create or replace function public.has_any_role(role_names text[]) returns boolean language sql stable as $$ select public.effective_role() = any(role_names); $$;

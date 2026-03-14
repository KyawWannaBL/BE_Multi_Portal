create schema if not exists public;

create or replace function public.request_jwt() returns jsonb language sql stable as $$
  select coalesce(nullif(current_setting('request.jwt.claims', true), '')::jsonb, '{}'::jsonb);
$$;

create or replace function public.jwt_claim(claim text) returns text language sql stable as $$
  select nullif(public.request_jwt() ->> claim, '');
$$;

create or replace function public.app_role() returns text language sql stable as $$
  select nullif(upper(public.jwt_claim('app_role')), '');
$$;

create or replace function public.has_role(role_name text) returns boolean language sql stable as $$
  select public.app_role() = upper(role_name);
$$;

create or replace function public.has_any_role(role_names text[]) returns boolean language sql stable as $$
  select public.app_role() = any(select upper(x) from unnest(role_names) x);
$$;

-- Schema-Safe Identity Helpers (Prevents crash if users/merchants/customers tables are missing)
create or replace function public.current_public_user_id() returns uuid language plpgsql stable as $$
declare v_id uuid;
begin
  if to_regclass('public.users') is not null then
    execute 'select id from public.users where email = public.jwt_claim(''email'') limit 1' into v_id;
    return v_id;
  end if;
  return null;
end
$$;

create or replace function public.current_merchant_id() returns uuid language plpgsql stable as $$
declare v_id uuid;
begin
  if to_regclass('public.merchants') is not null then
    execute 'select id from public.merchants where email = public.jwt_claim(''email'') limit 1' into v_id;
    return v_id;
  end if;
  return null;
end
$$;

create or replace function public.current_customer_phone() returns text language plpgsql stable as $$
declare v_phone text;
begin
  v_phone := public.jwt_claim('phone');
  if v_phone is not null then return v_phone; end if;

  if to_regclass('public.customers') is not null then
    execute 'select phone from public.customers where email = public.jwt_claim(''email'') limit 1' into v_phone;
    return v_phone;
  end if;
  return null;
end
$$;

create or replace function public.col_type(p_table regclass, p_col text) returns regtype language sql stable as $$
  select a.atttypid::regtype from pg_attribute a where a.attrelid = p_table and a.attname = p_col and a.attnum > 0 and not a.attisdropped limit 1;
$$;

create or replace function public.enum_first_label(p_type regtype) returns text language sql stable as $$
  select e.enumlabel from pg_type t join pg_enum e on e.enumtypid = t.oid where t.oid = p_type order by e.enumsortorder limit 1;
$$;

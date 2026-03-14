begin;

create extension if not exists pgcrypto;

-- ==========================================================
-- 1) ROLE CLAIM HELPERS (CRITICAL FIX)
-- EN: Read role from app_metadata.role OR app_metadata.app_role, fallback to public.users.role.
-- MY: role ကို app_metadata.role / app_metadata.app_role ကနေယူပြီး မရှိရင် public.users.role ကို fallback လုပ်မယ်
-- ==========================================================

create or replace function public.request_jwt() returns jsonb
language sql stable as $$
  select coalesce(nullif(current_setting('request.jwt.claims', true), '')::jsonb, '{}'::jsonb);
$$;

create or replace function public.current_app_role() returns text
language sql stable as $$
  select coalesce(
    nullif(upper(coalesce(
      public.request_jwt() #>> '{app_metadata,role}',
      public.request_jwt() #>> '{app_metadata,app_role}',
      public.request_jwt() ->> 'role',
      public.request_jwt() ->> 'app_role'
    )), ''),
    nullif(upper((select role from public.users where id = auth.uid())), ''),
    'GUEST'
  );
$$;

create or replace function public.has_role(p_role text) returns boolean
language sql stable as $$
  select public.current_app_role() = upper(p_role);
$$;

create or replace function public.has_any_role(p_roles text[]) returns boolean
language sql stable as $$
  select public.current_app_role() = any(select upper(x) from unnest(p_roles) x);
$$;

create or replace function public.is_admin_role() returns boolean
language sql stable as $$
  select public.has_any_role(array['SYS','APP_OWNER','SUPER_ADMIN','ADMIN','ADM','MGR','OPERATIONS_ADMIN']);
$$;

create or replace function public.is_finance_role() returns boolean
language sql stable as $$
  select public.has_any_role(array['FINANCE','FINANCE_ADMIN','FINANCE_USER','FINANCE_STAFF','ACCOUNTANT']);
$$;

-- ==========================================================
-- 2) ENSURE public.users exists + unique email (but do NOT enforce unique if duplicates exist yet)
-- ==========================================================
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text default 'CUSTOMER',
  created_at timestamptz default now()
);

-- Duplicate detector (public.users by email)
create or replace view public.dup_public_users_email_v as
select lower(email) as email, count(*) as cnt, array_agg(id) as user_ids
from public.users
where email is not null and trim(email) <> ''
group by lower(email)
having count(*) > 1;

-- Duplicate detector (profiles by employee_id) - safe even if profiles missing
do $$
begin
  if to_regclass('public.profiles') is not null then
    execute $v$
      create or replace view public.dup_profiles_employee_id_v as
      select employee_id, count(*) as cnt, array_agg(id) as profile_ids
      from public.profiles
      where employee_id is not null and trim(employee_id) <> ''
      group by employee_id
      having count(*) > 1
    $v$;
  end if;
exception when others then null;
end $$;

-- Admin-only function to detect auth.users duplicates (email should be unique; if not, you have a provider/import problem)
create or replace function public.admin_auth_email_duplicates()
returns table(email text, cnt int, user_ids uuid[])
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin_role() then
    raise exception 'Admin only';
  end if;

  return query
  select lower(u.email) as email, count(*)::int as cnt, array_agg(u.id)::uuid[] as user_ids
  from auth.users u
  where u.email is not null and trim(u.email) <> ''
  group by lower(u.email)
  having count(*) > 1;
end;
$$;

grant execute on function public.admin_auth_email_duplicates() to authenticated;

-- ==========================================================
-- 3) COURIER LIVE TRACKING BACKEND (CRITICAL FIX)
-- EN: Create courier_locations + RLS + add to Supabase Realtime publication.
-- MY: courier_locations ဖန်တီး + RLS + Supabase Realtime publication ထဲထည့်
-- ==========================================================

create table if not exists public.courier_locations (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text null,
  lat numeric null,
  lng numeric null,
  heading numeric null,
  speed numeric null,
  accuracy_m numeric null,
  status text null default 'ONLINE',
  meta jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists courier_locations_updated_idx on public.courier_locations(updated_at desc);

-- auto updated_at
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_courier_locations_touch on public.courier_locations;
create trigger trg_courier_locations_touch
before update on public.courier_locations
for each row execute function public.touch_updated_at();

-- Realtime needs full replica identity for updates
alter table public.courier_locations replica identity full;

-- RLS
alter table public.courier_locations enable row level security;

drop policy if exists courier_locations_select on public.courier_locations;
create policy courier_locations_select
on public.courier_locations
for select to authenticated
using (
  public.is_admin_role()
  or public.has_any_role(array['SUPERVISOR','OPERATIONS_ADMIN','STAFF','WAREHOUSE_MANAGER','SUBSTATION_MANAGER','BRANCH_MANAGER','FINANCE_STAFF'])
  or user_id = auth.uid()
);

drop policy if exists courier_locations_upsert_self on public.courier_locations;
create policy courier_locations_upsert_self
on public.courier_locations
for insert to authenticated
with check (user_id = auth.uid() or public.is_admin_role());

drop policy if exists courier_locations_update_self on public.courier_locations;
create policy courier_locations_update_self
on public.courier_locations
for update to authenticated
using (user_id = auth.uid() or public.is_admin_role())
with check (user_id = auth.uid() or public.is_admin_role());

-- Add to Supabase Realtime publication (ignore if already added)
do $$
begin
  execute 'alter publication supabase_realtime add table public.courier_locations';
exception
  when duplicate_object then null;
  when others then null;
end $$;

commit;

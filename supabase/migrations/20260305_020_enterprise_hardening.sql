-- 2026-03-05: Enterprise Hardening
-- EN: Fix role claim extraction, ensure base schema, add DataEntry shipment RPC, harden RLS for supply chain tables.
-- MY: role claim extraction ပြင်ဆင်၊ schema ပြည့်စုံမှုစစ်၊ DataEntry shipment RPC ထည့်၊ supply chain tables အတွက် RLS ချမှတ်။

begin;

create extension if not exists pgcrypto;

-- ==========================================================
-- 1) Claims helpers: fix app_role() to read auth.app_metadata.role
-- ==========================================================
-- EN: Supabase stores roles inside JWT claim "app_metadata.role" (not "app_role").
-- MY: Supabase role သည် JWT "app_metadata.role" ထဲမှာရှိတတ်သည် ("app_role" မဟုတ်)

create schema if not exists public;

create or replace function public.request_jwt() returns jsonb
language sql stable as $$
  select coalesce(nullif(current_setting('request.jwt.claims', true), '')::jsonb, '{}'::jsonb);
$$;

create or replace function public.jwt_claim(claim text) returns text
language sql stable as $$
  select nullif(public.request_jwt() ->> claim, '');
$$;

-- Robust role resolver (supports multiple legacy styles)
create or replace function public.app_role() returns text
language sql stable as $$
  select nullif(upper(coalesce(
    public.request_jwt() #>> '{app_metadata,role}',
    public.request_jwt() #>> '{app_metadata,app_role}',
    public.jwt_claim('app_role'),
    public.jwt_claim('role')
  )), '');
$$;

create or replace function public.has_role(role_name text) returns boolean
language sql stable as $$
  select public.app_role() = upper(role_name);
$$;

create or replace function public.has_any_role(role_names text[]) returns boolean
language sql stable as $$
  select public.app_role() = any(select upper(x) from unnest(role_names) x);
$$;

-- Convenience wrappers used across the platform
create or replace function public.current_app_role() returns text
language sql stable as $$ select public.app_role(); $$;

create or replace function public.current_user_id() returns uuid
language sql stable as $$ select auth.uid(); $$;

create or replace function public.is_admin_role() returns boolean
language sql stable as $$
  select public.has_any_role(array['SYS','APP_OWNER','SUPER_ADMIN','ADMIN','ADM','MGR','OPERATIONS_ADMIN']);
$$;

create or replace function public.is_finance_role() returns boolean
language sql stable as $$
  select public.has_any_role(array['FINANCE','FINANCE_ADMIN','FINANCE_USER','FINANCE_STAFF','ACCOUNTANT']);
$$;

-- ==========================================================
-- 2) Ensure public.users row exists for every auth user (identity + FK reliability)
-- ==========================================================
-- EN: Many parts rely on public.users existing (id = auth.uid()).
-- MY: အပိုင်းများစွာမှာ public.users ရှိနေဖို့လိုသည် (id = auth.uid())။

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  firebase_uid text,
  email text unique,
  full_name text,
  role text default 'CUSTOMER',
  created_at timestamptz default now()
);

create or replace function public.handle_auth_user_upsert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare v_role text;
begin
  v_role := upper(coalesce(new.raw_app_meta_data->>'role', new.raw_app_meta_data->>'app_role', 'CUSTOMER'));

  insert into public.users (id, email, full_name, role)
  values (
    new.id,
    lower(coalesce(new.email,'')),
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', null),
    v_role
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, public.users.full_name),
    role = coalesce(excluded.role, public.users.role);

  return new;
end;
$$;

do $$
begin
  if to_regclass('auth.users') is not null then
    -- Create trigger only if not exists
    if not exists (
      select 1 from pg_trigger
      where tgname = 'trg_auth_users_upsert_public_users'
    ) then
      execute '
        create trigger trg_auth_users_upsert_public_users
        after insert or update on auth.users
        for each row execute function public.handle_auth_user_upsert()
      ';
    end if;
  end if;
end $$;

-- Helper: prefer auth.uid as public user id (fast + correct)
create or replace function public.current_public_user_id() returns uuid
language sql stable as $$ select auth.uid(); $$;

-- ==========================================================
-- 3) Ensure shipments schema matches frontend/services
-- ==========================================================
create table if not exists public.shipments (
  id uuid primary key default gen_random_uuid(),
  way_id text unique,
  merchant_id uuid null,
  sender_name text,
  sender_phone text,
  sender_address text,
  sender_city text,
  sender_state text,
  receiver_name text,
  receiver_phone text,
  receiver_address text,
  receiver_city text,
  receiver_state text,
  pickup_branch_id uuid null,
  delivery_branch_id uuid null,
  package_description text null,
  package_weight numeric null,
  delivery_fee numeric default 0,
  cod_amount numeric default 0,
  insurance_fee numeric default 0,
  total_amount numeric default 0,
  assigned_rider_id uuid null references public.users(id) on delete set null,
  status text default 'PENDING',
  created_by uuid null references auth.users(id) on delete set null,
  created_at timestamptz default now(),
  actual_pickup_time timestamptz null,
  actual_delivery_time timestamptz null
);

-- Add missing columns safely (idempotent)
do $$
begin
  if to_regclass('public.shipments') is not null then
    execute 'alter table public.shipments add column if not exists pickup_branch_id uuid null';
    execute 'alter table public.shipments add column if not exists delivery_branch_id uuid null';
    execute 'alter table public.shipments add column if not exists package_description text null';
    execute 'alter table public.shipments add column if not exists package_weight numeric null';
    execute 'alter table public.shipments add column if not exists cod_amount numeric default 0';
    execute 'alter table public.shipments add column if not exists insurance_fee numeric default 0';
    execute 'alter table public.shipments add column if not exists total_amount numeric default 0';
    execute 'alter table public.shipments add column if not exists created_by uuid null';
    execute 'alter table public.shipments add column if not exists actual_pickup_time timestamptz null';
    execute 'alter table public.shipments add column if not exists actual_delivery_time timestamptz null';
  end if;
exception when others then
  -- ignore in case environment differs
  null;
end $$;

create unique index if not exists shipments_way_id_uq on public.shipments(way_id);

-- Tracking table (ensure enterprise columns exist)
create table if not exists public.shipment_tracking (
  id uuid primary key default gen_random_uuid(),
  shipment_id uuid references public.shipments(id) on delete cascade,
  status text,
  location text,
  notes text,
  timestamp timestamptz default now(),
  is_customer_visible boolean default true,
  handled_by uuid references public.users(id) on delete set null
);

do $$
begin
  if to_regclass('public.shipment_tracking') is not null then
    execute 'alter table public.shipment_tracking add column if not exists is_customer_visible boolean default true';
    execute 'alter table public.shipment_tracking add column if not exists handled_by uuid null';
  end if;
exception when others then null;
end $$;

-- ==========================================================
-- 4) Data Entry controlled RPC: create shipment without merchant_id requirement
-- ==========================================================
create or replace function public.create_shipment_data_entry(
  p_receiver_name text,
  p_receiver_phone text,
  p_receiver_address text,
  p_receiver_city text,
  p_receiver_state text,
  p_delivery_fee numeric,
  p_cod_amount numeric default 0,
  p_pickup_branch_id uuid default null,
  p_delivery_branch_id uuid default null,
  p_package_description text default null,
  p_package_weight numeric default null
)
returns table(shipment_id uuid, way_id text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_way text;
  v_total numeric;
  v_sid uuid;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if not public.has_any_role(array['DATA_ENTRY','OPERATIONS_ADMIN','SUPERVISOR','APP_OWNER','SUPER_ADMIN','SYS']) then
    raise exception 'Role % is not allowed for Data Entry shipment creation', public.app_role();
  end if;

  -- EN: Generate unique WAY ID
  -- MY: WAY ID တည်ဆောက်
  v_way := 'BTX-' || upper(to_char(now(), 'YYMMDDHH24MISS')) || '-' || upper(substr(encode(gen_random_bytes(2),'hex'), 1, 4));
  v_total := coalesce(p_delivery_fee,0) + coalesce(p_cod_amount,0);

  insert into public.shipments (
    way_id,
    receiver_name, receiver_phone, receiver_address, receiver_city, receiver_state,
    pickup_branch_id, delivery_branch_id,
    package_description, package_weight,
    delivery_fee, cod_amount, insurance_fee, total_amount,
    created_by,
    status
  ) values (
    v_way,
    p_receiver_name, p_receiver_phone, p_receiver_address, p_receiver_city, p_receiver_state,
    p_pickup_branch_id, p_delivery_branch_id,
    p_package_description, p_package_weight,
    coalesce(p_delivery_fee,0), coalesce(p_cod_amount,0), 0, v_total,
    auth.uid(),
    'PENDING'
  )
  returning id into v_sid;

  -- Create customer-visible tracking row
  insert into public.shipment_tracking (shipment_id, status, notes, handled_by, is_customer_visible)
  values (v_sid, 'pending', 'Shipment created by Data Entry (awaiting approval)', auth.uid(), true);

  -- Create approval request if table exists
  if to_regclass('public.shipment_approvals') is not null then
    insert into public.shipment_approvals (shipment_id, status, requested_by)
    values (v_sid, 'PENDING', auth.uid());
  end if;

  return query select v_sid, v_way;
end;
$$;

grant execute on function public.create_shipment_data_entry(
  text,text,text,text,text,numeric,numeric,uuid,uuid,text,numeric
) to authenticated;

-- ==========================================================
-- 5) RLS Hardening for staff_assignments + supply_chain_events + finance tables
-- ==========================================================

-- staff_assignments: allow HR/admin manage; allow user read own assignment (needed for QR auto location)
create table if not exists public.staff_assignments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  location_type text not null check (location_type in ('BRANCH','WAREHOUSE','HQ')),
  location_id uuid not null,
  title text null,
  is_active boolean not null default true,
  start_at timestamptz not null default now(),
  end_at timestamptz null,
  created_at timestamptz not null default now()
);

alter table public.staff_assignments enable row level security;

drop policy if exists staff_assignments_admin_all on public.staff_assignments;
create policy staff_assignments_admin_all on public.staff_assignments
for all to authenticated
using (public.is_admin_role() or public.has_role('HR_ADMIN'))
with check (public.is_admin_role() or public.has_role('HR_ADMIN'));

drop policy if exists staff_assignments_self_select on public.staff_assignments;
create policy staff_assignments_self_select on public.staff_assignments
for select to authenticated
using (user_id = auth.uid());

-- supply_chain_events: allow select only if user can see shipment (prevents leaking)
create table if not exists public.supply_chain_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  shipment_id uuid not null,
  way_id text not null,
  segment text not null,
  event_type text not null,
  note text null,
  meta jsonb not null default '{}'::jsonb,
  location_type text null,
  location_id uuid null,
  auth_user_id uuid not null,
  actor_user_id uuid null,
  actor_role text null,
  device_id text null,
  latitude numeric null,
  longitude numeric null,
  accuracy_m numeric null,
  prev_hash text null,
  event_hash text null
);

alter table public.supply_chain_events enable row level security;

drop policy if exists sc_events_select_by_ship_access on public.supply_chain_events;
create policy sc_events_select_by_ship_access
on public.supply_chain_events
for select to authenticated
using (
  public.is_admin_role()
  or exists (select 1 from public.shipments s where s.id = supply_chain_events.shipment_id)
);

-- Default: no update/delete (immutable audit)
drop policy if exists sc_events_no_update on public.supply_chain_events;
create policy sc_events_no_update on public.supply_chain_events
for update to authenticated
using (false);

drop policy if exists sc_events_no_delete on public.supply_chain_events;
create policy sc_events_no_delete on public.supply_chain_events
for delete to authenticated
using (false);

-- Finance tables: enterprise reconciliation
create table if not exists public.finance_deposits (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  branch_id uuid null,
  deposited_by_user_id uuid null,
  amount numeric not null default 0,
  currency text not null default 'MMK',
  reference text null,
  evidence_url text null,
  status text not null default 'PENDING' check (status in ('PENDING','APPROVED','REJECTED'))
);

create table if not exists public.cod_collections (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  shipment_id uuid not null,
  way_id text not null,
  amount numeric not null,
  currency text not null default 'MMK',
  collected_by_user_id uuid null,
  deposit_id uuid null references public.finance_deposits(id) on delete set null,
  status text not null default 'COLLECTED' check (status in ('COLLECTED','DEPOSITED','DISPUTED'))
);

alter table public.finance_deposits enable row level security;
alter table public.cod_collections enable row level security;

drop policy if exists finance_deposits_rw_fin on public.finance_deposits;
create policy finance_deposits_rw_fin on public.finance_deposits
for all to authenticated
using (public.is_admin_role() or public.is_finance_role())
with check (public.is_admin_role() or public.is_finance_role());

-- Optional: Branch managers can create deposits for their own branch (cash handover)
drop policy if exists finance_deposits_insert_branch_mgr on public.finance_deposits;
create policy finance_deposits_insert_branch_mgr on public.finance_deposits
for insert to authenticated
with check (
  public.has_any_role(array['BRANCH_MANAGER','SUBSTATION_MANAGER'])
  and exists (
    select 1 from public.staff_assignments a
    where a.user_id = auth.uid()
      and a.is_active = true
      and a.location_type = 'BRANCH'
      and a.location_id = finance_deposits.branch_id
  )
);

drop policy if exists cod_collections_rw_fin on public.cod_collections;
create policy cod_collections_rw_fin on public.cod_collections
for all to authenticated
using (public.is_admin_role() or public.is_finance_role())
with check (public.is_admin_role() or public.is_finance_role());

-- Views (safe if columns exist)
create or replace view public.finance_cod_pending_v as
select
  s.id as shipment_id,
  s.way_id,
  coalesce(s.cod_amount,0) as cod_amount,
  s.actual_delivery_time,
  cc.status as cod_status,
  cc.deposit_id
from public.shipments s
left join public.cod_collections cc on cc.shipment_id = s.id
where coalesce(s.cod_amount,0) > 0
  and s.actual_delivery_time is not null
  and (cc.id is null or cc.status in ('COLLECTED','DISPUTED'));

commit;

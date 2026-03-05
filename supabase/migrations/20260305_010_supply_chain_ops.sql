-- 2026-03-05: Enterprise Supply Chain Ops Core (Track & Trace + Anti-Fraud)
-- EN: Adds tamper-evident event ledger across Warehouse/Branch/Execution/Finance/HR/Supervisor/DataEntry.
-- MY: Warehouse/Branch/Execution/Finance/HR/Supervisor/DataEntry အားလုံးအတွက် event ledger (tamper-evident) ထည့်မည်။

begin;

create extension if not exists pgcrypto;

-- ==========================================================
-- Staff assignments (HR admin assigns staff to a branch/warehouse)
-- ==========================================================
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

create index if not exists staff_assignments_user_active_idx
  on public.staff_assignments (user_id, is_active);

-- ==========================================================
-- Supply chain event ledger (tamper-evident)
-- ==========================================================
create table if not exists public.supply_chain_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  -- entity
  shipment_id uuid not null,
  way_id text not null,

  -- event
  segment text not null check (segment in ('DATA_ENTRY','BRANCH','WAREHOUSE','EXECUTION','SUPERVISOR','FINANCE','HR')),
  event_type text not null,
  note text null,
  meta jsonb not null default '{}'::jsonb,

  -- where
  location_type text null check (location_type in ('BRANCH','WAREHOUSE','CUSTOMER','HQ','OTHER')),
  location_id uuid null,

  -- who
  auth_user_id uuid not null,
  actor_user_id uuid null,
  actor_role text null,
  device_id text null,

  -- geo
  latitude numeric null,
  longitude numeric null,
  accuracy_m numeric null,

  -- integrity
  prev_hash text null,
  event_hash text null
);

create index if not exists supply_chain_events_way_idx on public.supply_chain_events (way_id, created_at desc);
create index if not exists supply_chain_events_ship_idx on public.supply_chain_events (shipment_id, created_at desc);
create index if not exists supply_chain_events_actor_idx on public.supply_chain_events (auth_user_id, created_at desc);

comment on table public.supply_chain_events is
'Tamper-evident supply chain event ledger. Use for track & trace, fraud prevention, audit.';

-- ==========================================================
-- Role-based "who can emit what" (anti-fraud segregation of duties)
-- ==========================================================
create or replace function public.can_emit_supply_event(p_event_type text)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare r text := upper(coalesce(public.current_app_role(), ''));
begin
  if public.is_admin_role() then return true; end if;

  if r = 'DATA_ENTRY' then
    return p_event_type in ('DE_CREATED','DE_UPDATED');
  end if;

  if r = 'WAREHOUSE_MANAGER' then
    return p_event_type like 'WH_%';
  end if;

  if r in ('SUBSTATION_MANAGER','BRANCH_MANAGER') then
    return p_event_type like 'BR_%';
  end if;

  if r = 'SUPERVISOR' then
    return p_event_type like 'SUPV_%';
  end if;

  if r in ('FINANCE_USER','FINANCE_STAFF') then
    return p_event_type like 'FIN_%';
  end if;

  if r in ('RIDER','DRIVER','HELPER') then
    return p_event_type like 'EXEC_%';
  end if;

  return false;
end;
$$;

-- ==========================================================
-- Before insert trigger: fill identity + link shipment + compute hashes
-- ==========================================================
create or replace function public.sc_event_before_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  last_hash text;
  payload text;
begin
  -- who
  new.auth_user_id := auth.uid();
  new.actor_role := coalesce(new.actor_role, public.current_app_role());
  new.actor_user_id := coalesce(new.actor_user_id, public.current_user_id());

  -- link shipment by way_id if shipment_id missing
  if new.shipment_id is null or new.shipment_id = '00000000-0000-0000-0000-000000000000'::uuid then
    select s.id into new.shipment_id from public.shipments s where s.way_id = new.way_id limit 1;
  end if;

  -- enforce existence
  if new.shipment_id is null then
    raise exception 'Unknown way_id %, cannot resolve shipment_id', new.way_id;
  end if;

  -- denormalize way_id from shipment (ensures canonical)
  select s.way_id into new.way_id from public.shipments s where s.id = new.shipment_id limit 1;

  -- previous hash for this shipment
  select e.event_hash
    into last_hash
  from public.supply_chain_events e
  where e.shipment_id = new.shipment_id
  order by e.created_at desc
  limit 1;

  new.prev_hash := last_hash;

  -- hash payload (tamper-evident chain)
  payload := concat_ws('|',
    coalesce(new.way_id,''),
    coalesce(new.segment,''),
    coalesce(new.event_type,''),
    coalesce(new.location_type,''),
    coalesce(new.location_id::text,''),
    coalesce(new.auth_user_id::text,''),
    coalesce(new.actor_user_id::text,''),
    coalesce(new.actor_role,''),
    coalesce(new.device_id,''),
    coalesce(new.latitude::text,''),
    coalesce(new.longitude::text,''),
    coalesce(new.accuracy_m::text,''),
    coalesce(new.note,''),
    coalesce(new.meta::text,''),
    coalesce(new.prev_hash,'')
  );

  new.event_hash := encode(digest(payload, 'sha256'), 'hex');

  return new;
end;
$$;

drop trigger if exists trg_sc_event_before_insert on public.supply_chain_events;
create trigger trg_sc_event_before_insert
before insert on public.supply_chain_events
for each row execute function public.sc_event_before_insert();

-- ==========================================================
-- RPC: record_supply_event(way_id, event_type, segment, location, geo, device, note, meta)
-- EN: single entrypoint for QR scans
-- MY: QR scan အားလုံးအတွက် single RPC
-- ==========================================================
create or replace function public.record_supply_event(
  p_way_id text,
  p_event_type text,
  p_segment text,
  p_location_type text default null,
  p_location_id uuid default null,
  p_lat numeric default null,
  p_lng numeric default null,
  p_accuracy_m numeric default null,
  p_device_id text default null,
  p_note text default null,
  p_meta jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare sid uuid;
declare eid uuid;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if not public.can_emit_supply_event(p_event_type) then
    raise exception 'Role % cannot emit event %', public.current_app_role(), p_event_type;
  end if;

  select s.id into sid from public.shipments s where s.way_id = p_way_id limit 1;
  if sid is null then
    raise exception 'Unknown way_id %', p_way_id;
  end if;

  insert into public.supply_chain_events(
    shipment_id, way_id, segment, event_type,
    location_type, location_id,
    latitude, longitude, accuracy_m,
    device_id, note, meta,
    auth_user_id
  )
  values (
    sid, p_way_id, upper(p_segment), upper(p_event_type),
    upper(p_location_type), p_location_id,
    p_lat, p_lng, p_accuracy_m,
    p_device_id, p_note, coalesce(p_meta,'{}'::jsonb),
    auth.uid()
  )
  returning id into eid;

  -- Optional: for certain events, also write customer-facing shipment_tracking
  -- Keep minimal + safe. Adjust based on your customer visibility policy.
  if upper(p_event_type) in ('EXEC_DELIVERED','EXEC_OUT_FOR_DELIVERY','WH_RECEIVED','BR_INBOUND') then
    begin
      insert into public.shipment_tracking (shipment_id, status, notes, handled_by, is_customer_visible)
      values (sid, lower(p_event_type), coalesce(p_note, p_event_type), public.current_user_id(), true);
    exception when others then
      -- ignore if table/rls differs
      null;
    end;
  end if;

  -- Optional: update shipment delivery timestamp when delivered
  if upper(p_event_type) = 'EXEC_DELIVERED' then
    begin
      update public.shipments set actual_delivery_time = now() where id = sid and actual_delivery_time is null;
    exception when others then
      null;
    end;
  end if;

  return eid;
end;
$$;

grant execute on function public.record_supply_event(text,text,text,text,uuid,numeric,numeric,numeric,text,text,jsonb)
to authenticated;

-- ==========================================================
-- Finance: COD collection + deposits (minimal enterprise reconciliation primitives)
-- ==========================================================
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

create index if not exists cod_collections_way_idx on public.cod_collections (way_id);
create index if not exists cod_collections_deposit_idx on public.cod_collections (deposit_id);

-- Pending COD view for finance portal
create or replace view public.finance_cod_pending_v as
select
  s.id as shipment_id,
  s.way_id,
  s.cod_amount,
  s.actual_delivery_time,
  coalesce(cc.status, null) as cod_status,
  cc.deposit_id
from public.shipments s
left join public.cod_collections cc on cc.shipment_id = s.id
where coalesce(s.cod_amount,0) > 0
  and s.actual_delivery_time is not null
  and (cc.id is null or cc.status in ('COLLECTED','DISPUTED'));

-- ==========================================================
-- Fraud signals (lightweight view: you can expand rules later)
-- ==========================================================
create or replace view public.fraud_signals_v as
select
  s.id as shipment_id,
  s.way_id,
  s.actual_delivery_time,
  s.cod_amount,
  -- Rule: delivered event exists but missing earlier custody events (branch/warehouse)
  case
    when exists (select 1 from public.supply_chain_events e where e.shipment_id=s.id and e.event_type='EXEC_DELIVERED')
     and not exists (select 1 from public.supply_chain_events e where e.shipment_id=s.id and e.event_type in ('BR_INBOUND','WH_RECEIVED'))
    then 'MISSING_CHAIN_BEFORE_DELIVERY'
    when (select count(*) from public.supply_chain_events e where e.shipment_id=s.id and e.event_type='EXEC_DELIVERED') > 1
    then 'DUPLICATE_DELIVERED_EVENTS'
    else null
  end as rule_code
from public.shipments s
where
  exists (select 1 from public.supply_chain_events e where e.shipment_id=s.id and e.event_type='EXEC_DELIVERED')
  and (
    not exists (select 1 from public.supply_chain_events e where e.shipment_id=s.id and e.event_type in ('BR_INBOUND','WH_RECEIVED'))
    or (select count(*) from public.supply_chain_events e where e.shipment_id=s.id and e.event_type='EXEC_DELIVERED') > 1
  );

-- ==========================================================
-- RLS (keep strict; adjust to your org)
-- ==========================================================
alter table public.supply_chain_events enable row level security;

drop policy if exists sc_events_select on public.supply_chain_events;
create policy sc_events_select
on public.supply_chain_events
for select
to authenticated
using (
  -- admins see all, others see only their own and same-location events
  public.is_admin_role()
  or auth_user_id = auth.uid()
);

drop policy if exists sc_events_insert on public.supply_chain_events;
create policy sc_events_insert
on public.supply_chain_events
for insert
to authenticated
with check (
  auth.uid() is not null
  and public.can_emit_supply_event(event_type)
);

-- HR/Finance/others tables can be tightened later; start with admin-only selects
alter table public.staff_assignments enable row level security;
drop policy if exists staff_assignments_admin on public.staff_assignments;
create policy staff_assignments_admin on public.staff_assignments
for all to authenticated
using (public.is_admin_role() or upper(coalesce(public.current_app_role(),''))='HR_ADMIN')
with check (public.is_admin_role() or upper(coalesce(public.current_app_role(),''))='HR_ADMIN');

alter table public.finance_deposits enable row level security;
drop policy if exists finance_deposits_fin on public.finance_deposits;
create policy finance_deposits_fin on public.finance_deposits
for all to authenticated
using (public.is_admin_role() or public.is_finance_role())
with check (public.is_admin_role() or public.is_finance_role());

alter table public.cod_collections enable row level security;
drop policy if exists cod_collections_fin on public.cod_collections;
create policy cod_collections_fin on public.cod_collections
for all to authenticated
using (public.is_admin_role() or public.is_finance_role())
with check (public.is_admin_role() or public.is_finance_role());

commit;

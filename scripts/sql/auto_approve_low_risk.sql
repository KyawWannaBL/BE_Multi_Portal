-- 2026-03-05: Auto-Approve Low Risk (Enterprise)
-- EN: Auto-write SUPV_APPROVED for low-risk shipments using policies/trusted merchants.
-- MY: Policy/trusted merchant အလိုက် low-risk shipment များကို SUPV_APPROVED auto မှတ်တမ်းတင်မည်။

begin;

create extension if not exists pgcrypto;

-- ==========================================================
-- 1) Policy tables
-- ==========================================================
create table if not exists public.trusted_merchants (
  merchant_id uuid primary key,
  enabled boolean not null default true,
  risk_tier text not null default 'LOW' check (risk_tier in ('LOW','MEDIUM','HIGH')),
  note text null,
  created_at timestamptz not null default now()
);

create table if not exists public.auto_approve_policies (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  enabled boolean not null default true,

  -- thresholds (null = ignore)
  max_cod_amount numeric null,
  max_total_amount numeric null,
  max_weight numeric null,

  -- optional scope (null = all)
  allow_pickup_branch_id uuid null,
  allow_delivery_branch_id uuid null,

  -- if true, requires merchant_id ∈ trusted_merchants(enabled)
  require_trusted_merchant boolean not null default false,

  created_at timestamptz not null default now()
);

-- Seed a safe default policy (adjust anytime in DB)
-- EN: Default = COD=0 AND total<=50000 AND weight<=5kg
-- MY: Default = COD=0 AND total<=50000 AND weight<=5kg
insert into public.auto_approve_policies (name, enabled, max_cod_amount, max_total_amount, max_weight, require_trusted_merchant)
select 'DEFAULT_LOW_RISK_NO_COD', true, 0, 50000, 5, false
where not exists (select 1 from public.auto_approve_policies where name='DEFAULT_LOW_RISK_NO_COD');

-- ==========================================================
-- 2) Patch supply_chain_events trigger to allow system inserts to pass auth_user_id
--    (EN: needed for trigger-based auto approvals)
--    (MY: trigger-based auto approve အတွက် auth_user_id သတ်မှတ်ခွင့်လို)
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
  created_by_uid uuid;
begin
  -- Allow caller/trigger to supply auth_user_id when auth.uid() is null
  new.auth_user_id := coalesce(auth.uid(), new.auth_user_id);

  new.actor_role := coalesce(new.actor_role, public.current_app_role(), 'SYSTEM_AUTO');
  new.actor_user_id := coalesce(new.actor_user_id, public.current_user_id());

  -- Resolve shipment_id by way_id if missing
  if new.shipment_id is null or new.shipment_id = '00000000-0000-0000-0000-000000000000'::uuid then
    select s.id into new.shipment_id
    from public.shipments s
    where s.way_id = new.way_id
    limit 1;
  end if;

  if new.shipment_id is null then
    raise exception 'Unknown way_id %, cannot resolve shipment_id', new.way_id;
  end if;

  -- Canonical way_id + created_by fallback
  select s.way_id, s.created_by into new.way_id, created_by_uid
  from public.shipments s
  where s.id = new.shipment_id
  limit 1;

  new.auth_user_id := coalesce(new.auth_user_id, created_by_uid, new.actor_user_id);

  if new.auth_user_id is null then
    raise exception 'Missing auth_user_id (cannot attribute event)';
  end if;

  -- EN/MY: State machine enforcement already exists (from previous migration)
  perform public.sc_enforce_state_machine(
    new.shipment_id,
    new.event_type,
    new.segment,
    coalesce(new.meta,'{}'::jsonb)
  );

  -- Prev hash
  select e.event_hash
    into last_hash
  from public.supply_chain_events e
  where e.shipment_id = new.shipment_id
  order by e.created_at desc
  limit 1;

  new.prev_hash := last_hash;

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

  if new.created_at < now() - interval '10 minutes' then
    raise exception 'Backdated created_at not allowed';
  end if;

  return new;
end;
$$;

-- Ensure trigger exists (idempotent)
drop trigger if exists trg_sc_event_before_insert on public.supply_chain_events;
create trigger trg_sc_event_before_insert
before insert on public.supply_chain_events
for each row execute function public.sc_event_before_insert();

-- ==========================================================
-- 3) Policy matcher: returns policy name or NULL
-- ==========================================================
create or replace function public.auto_approve_policy_for_shipment(p_shipment_id uuid)
returns text
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  s_cod numeric := 0;
  s_total numeric := 0;
  s_weight numeric := null;
  s_pick uuid := null;
  s_del uuid := null;
  s_merchant uuid := null;
  pol record;
  merchant_ok boolean := false;
begin
  select
    coalesce(cod_amount,0),
    coalesce(total_amount,0),
    package_weight,
    pickup_branch_id,
    delivery_branch_id,
    merchant_id
  into s_cod, s_total, s_weight, s_pick, s_del, s_merchant
  from public.shipments
  where id = p_shipment_id;

  if not found then
    return null;
  end if;

  if s_merchant is not null then
    merchant_ok := exists(
      select 1 from public.trusted_merchants tm
      where tm.merchant_id = s_merchant and tm.enabled = true and tm.risk_tier = 'LOW'
    );
  end if;

  for pol in
    select * from public.auto_approve_policies
    where enabled = true
    order by created_at asc
  loop
    if pol.max_cod_amount is not null and s_cod > pol.max_cod_amount then
      continue;
    end if;

    if pol.max_total_amount is not null and s_total > pol.max_total_amount then
      continue;
    end if;

    if pol.max_weight is not null and s_weight is not null and s_weight > pol.max_weight then
      continue;
    end if;

    if pol.allow_pickup_branch_id is not null and s_pick is distinct from pol.allow_pickup_branch_id then
      continue;
    end if;

    if pol.allow_delivery_branch_id is not null and s_del is distinct from pol.allow_delivery_branch_id then
      continue;
    end if;

    if pol.require_trusted_merchant = true and merchant_ok = false then
      continue;
    end if;

    return pol.name;
  end loop;

  return null;
end;
$$;

-- ==========================================================
-- 4) Auto-approve writer (inserts SUPV_APPROVED once)
-- ==========================================================
create or replace function public.auto_approve_shipment_if_low_risk(
  p_shipment_id uuid,
  p_source text default 'SHIPMENT_AFTER_INSERT'
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  pol text;
  already boolean;
  w text;
  created_by_uid uuid;
begin
  -- Do nothing if already approved/rejected
  already := public.sc_has_event(p_shipment_id,'SUPV_APPROVED')
          or public.sc_has_event(p_shipment_id,'SUPV_REJECTED');
  if already then return false; end if;

  pol := public.auto_approve_policy_for_shipment(p_shipment_id);
  if pol is null then
    return false;
  end if;

  select way_id, created_by into w, created_by_uid from public.shipments where id = p_shipment_id;

  insert into public.supply_chain_events(
    shipment_id, way_id,
    segment, event_type,
    note,
    meta,
    actor_role,
    actor_user_id,
    auth_user_id
  ) values (
    p_shipment_id, w,
    'SUPERVISOR', 'SUPV_APPROVED',
    'Auto-approved (low risk) / Low-risk auto approve',
    jsonb_build_object(
      'auto', true,
      'policy', pol,
      'source', p_source,
      'force', true,
      'reason_en', 'Low risk per policy',
      'reason_my', 'Policy အလိုက် risk နိမ့်သောကြောင့် auto approve'
    ),
    'SYSTEM_AUTO',
    null,
    coalesce(created_by_uid, auth.uid())
  );

  return true;
end;
$$;

-- ==========================================================
-- 5) Trigger on shipments: after insert → attempt auto approval
-- ==========================================================
create or replace function public.shipments_after_insert_auto_approve()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Only auto-approve when status is pending (avoid interfering with imports)
  if coalesce(new.status,'PENDING') = 'PENDING' then
    perform public.auto_approve_shipment_if_low_risk(new.id, 'SHIPMENTS_TRIGGER');
  end if;
  return new;
end;
$$;

drop trigger if exists trg_shipments_after_insert_auto_approve on public.shipments;
create trigger trg_shipments_after_insert_auto_approve
after insert on public.shipments
for each row execute function public.shipments_after_insert_auto_approve();

-- ==========================================================
-- 6) RLS for config tables (enterprise: admin/supervisor can view; admin can edit)
-- ==========================================================
alter table public.auto_approve_policies enable row level security;
alter table public.trusted_merchants enable row level security;

drop policy if exists auto_approve_policies_select on public.auto_approve_policies;
create policy auto_approve_policies_select
on public.auto_approve_policies
for select to authenticated
using (public.is_admin_role() or public.has_any_role(array['SUPERVISOR','OPERATIONS_ADMIN']));

drop policy if exists auto_approve_policies_admin_write on public.auto_approve_policies;
create policy auto_approve_policies_admin_write
on public.auto_approve_policies
for all to authenticated
using (public.is_admin_role())
with check (public.is_admin_role());

drop policy if exists trusted_merchants_select on public.trusted_merchants;
create policy trusted_merchants_select
on public.trusted_merchants
for select to authenticated
using (public.is_admin_role() or public.has_any_role(array['SUPERVISOR','OPERATIONS_ADMIN','FINANCE_USER','FINANCE_STAFF']));

drop policy if exists trusted_merchants_admin_write on public.trusted_merchants;
create policy trusted_merchants_admin_write
on public.trusted_merchants
for all to authenticated
using (public.is_admin_role())
with check (public.is_admin_role());

commit;

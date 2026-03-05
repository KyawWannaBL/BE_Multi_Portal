#!/usr/bin/env bash
set -euo pipefail

# ==========================================================
# EN: Executive Dashboard + Cargo Tracking + Live Surveillance Map + Way Planning (Auto/Assign/Lock)
# MY: Executive Dashboard + Cargo Tracking + Live Surveillance Map + Way Planning (Auto/Assign/Lock)
# ==========================================================

if [ ! -f "package.json" ]; then
  echo "❌ EN: Run from repo root (package.json not found)."
  echo "❌ MY: repo root (package.json ရှိရာ) မှ run လုပ်ပါ။"
  exit 1
fi

STAMP="$(date +%Y%m%d_%H%M%S)"
BK=".backup_exec_${STAMP}"
mkdir -p "$BK"

backup_file () {
  local f="$1"
  if [ -f "$f" ]; then
    mkdir -p "$BK/$(dirname "$f")"
    cp -f "$f" "$BK/$f.bak"
  fi
}

write_file () {
  local f="$1"
  mkdir -p "$(dirname "$f")"
  cat > "$f"
}

echo "✅ EN: Backup folder: $BK"
echo "✅ MY: Backup ဖိုလ်ဒါ: $BK"

# backups
backup_file "package.json"
backup_file "package-lock.json"
backup_file "src/App.tsx"
backup_file "src/pages/portals/AdminPortal.tsx"

mkdir -p \
  supabase/migrations \
  scripts/sql \
  src/pages/portals/admin \
  src/services/admin \
  src/services/wayplanning

# ==========================================================
# 1) Dependencies for Live Map (Leaflet)
# ==========================================================
echo "== EN: Installing map deps (react-leaflet/leaflet) | MY: map library ထည့်မယ် =="
npm install react-leaflet leaflet

# ==========================================================
# 2) SQL Migration: Executive summary + Way planning tables + RPCs + RLS + Lock enforcement
# ==========================================================
write_file "supabase/migrations/20260305_060_exec_surveillance_wayplanning.sql" <<'SQL'
begin;

create extension if not exists pgcrypto;

-- ----------------------------------------------------------
-- Executive summary RPC (safe: checks object existence)
-- ----------------------------------------------------------
create or replace function public.get_executive_summary()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  js jsonb := '{}'::jsonb;
  ship_total bigint := 0;
  ship_pending bigint := 0;
  ship_approved bigint := 0;
  ship_out bigint := 0;
  ship_delivered bigint := 0;
  cod_pending_count bigint := 0;
  cod_pending_amount numeric := 0;
  courier_online bigint := 0;
  fraud_count bigint := 0;
  print_queued bigint := 0;
  way_active bigint := 0;
begin
  if to_regclass('public.shipments') is not null then
    execute 'select count(*) from public.shipments' into ship_total;
    execute $$select count(*) from public.shipments where upper(coalesce(status,''))='PENDING'$$ into ship_pending;
    execute $$select count(*) from public.shipments where upper(coalesce(status,''))='APPROVED'$$ into ship_approved;
    execute $$select count(*) from public.shipments where upper(coalesce(status,''))='OUT_FOR_DELIVERY'$$ into ship_out;
    execute $$select count(*) from public.shipments where upper(coalesce(status,''))='DELIVERED'$$ into ship_delivered;
  end if;

  if to_regclass('public.finance_cod_pending_v') is not null then
    execute 'select count(*), coalesce(sum(cod_amount),0) from public.finance_cod_pending_v' into cod_pending_count, cod_pending_amount;
  elsif to_regclass('public.shipments') is not null then
    -- fallback
    execute $$select count(*), coalesce(sum(cod_amount),0)
             from public.shipments
             where coalesce(cod_amount,0)>0 and actual_delivery_time is not null$$ into cod_pending_count, cod_pending_amount;
  end if;

  if to_regclass('public.courier_locations') is not null then
    execute $$select count(*)
             from public.courier_locations
             where updated_at >= now() - interval '5 minutes'$$ into courier_online;
  end if;

  if to_regclass('public.fraud_signals_v') is not null then
    execute 'select count(*) from public.fraud_signals_v' into fraud_count;
  end if;

  if to_regclass('public.waybill_print_jobs') is not null then
    execute $$select count(*) from public.waybill_print_jobs where status in ('QUEUED','FAILED')$$ into print_queued;
  end if;

  if to_regclass('public.way_plans') is not null then
    execute $$select count(*) from public.way_plans where status in ('DRAFT','PLANNED','LOCKED','IN_PROGRESS')$$ into way_active;
  end if;

  js := jsonb_build_object(
    'ship_total', ship_total,
    'ship_pending', ship_pending,
    'ship_approved', ship_approved,
    'ship_out_for_delivery', ship_out,
    'ship_delivered', ship_delivered,
    'cod_pending_count', cod_pending_count,
    'cod_pending_amount', cod_pending_amount,
    'courier_online', courier_online,
    'fraud_count', fraud_count,
    'print_queue', print_queued,
    'active_way_plans', way_active
  );

  return js;
end;
$$;

grant execute on function public.get_executive_summary() to authenticated;

-- ----------------------------------------------------------
-- Way Planning Core Tables
-- ----------------------------------------------------------
create table if not exists public.way_plans (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  service_date date not null default current_date,
  hub_branch_id uuid null,
  group_key text not null,
  route_name text not null,
  status text not null default 'DRAFT' check (status in ('DRAFT','PLANNED','LOCKED','IN_PROGRESS','COMPLETED','CANCELLED')),
  created_by uuid null default auth.uid(),
  locked_by uuid null,
  locked_at timestamptz null,
  locked_reason text null
);

create table if not exists public.way_plan_shipments (
  way_plan_id uuid references public.way_plans(id) on delete cascade,
  shipment_id uuid not null,
  way_id text not null,
  stop_order int not null,
  primary key (way_plan_id, shipment_id)
);

create table if not exists public.way_plan_assignments (
  way_plan_id uuid primary key references public.way_plans(id) on delete cascade,
  driver_id uuid null,
  rider_id uuid null,
  helper_ids uuid[] not null default '{}'::uuid[],
  assigned_by uuid null default auth.uid(),
  assigned_at timestamptz not null default now(),
  is_locked boolean not null default false
);

create index if not exists way_plans_service_idx on public.way_plans(service_date, status);
create index if not exists way_plan_shipments_way_idx on public.way_plan_shipments(way_id);
create index if not exists way_plan_shipments_ship_idx on public.way_plan_shipments(shipment_id);

-- ----------------------------------------------------------
-- Guard: prevent edits after LOCK
-- ----------------------------------------------------------
create or replace function public.way_plan_guard()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.status = 'LOCKED' then
    -- Allow status progression only by admin roles
    if (tg_table_name = 'way_plans') then
      if new.status is distinct from old.status then
        if public.is_admin_role() then
          return new;
        end if;
      end if;
    end if;

    raise exception 'Way plan is LOCKED. Only admin can progress status.';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_way_plans_guard on public.way_plans;
create trigger trg_way_plans_guard
before update on public.way_plans
for each row execute function public.way_plan_guard();

drop trigger if exists trg_way_plan_assign_guard on public.way_plan_assignments;
create trigger trg_way_plan_assign_guard
before update on public.way_plan_assignments
for each row execute function public.way_plan_guard();

drop trigger if exists trg_way_plan_ship_guard on public.way_plan_shipments;
create trigger trg_way_plan_ship_guard
before update on public.way_plan_shipments
for each row execute function public.way_plan_guard();

-- ----------------------------------------------------------
-- RPC: Generate Way Plans automatically from shipments
-- EN: Uses shipments with status APPROVED / IN_WAREHOUSE / DISPATCHED and not already assigned to a plan
-- MY: status APPROVED / IN_WAREHOUSE / DISPATCHED ဖြစ်ပြီး plan မချိတ်ရသေးတဲ့ shipment များကို auto plan ထုတ်မယ်
-- Grouping: CITY (receiver_city city_code)
-- ----------------------------------------------------------
create or replace function public.generate_way_plans(
  p_service_date date default current_date,
  p_hub_branch_id uuid default null,
  p_group_by text default 'CITY'
)
returns table(plan_id uuid, group_key text, shipments_count int)
language plpgsql
security definer
set search_path = public
as $$
declare
  r record;
  pid uuid;
  cnt int;
begin
  if not (public.is_admin_role() or public.has_any_role(array['SUPERVISOR','OPERATIONS_ADMIN','ADM','MGR'])) then
    raise exception 'Not allowed';
  end if;

  -- group candidates
  for r in
    with candidates as (
      select
        s.id as shipment_id,
        s.way_id,
        upper(coalesce(s.status,'')) as status,
        coalesce(s.receiver_city,'') as receiver_city,
        s.created_at
      from public.shipments s
      where upper(coalesce(s.status,'')) in ('APPROVED','IN_WAREHOUSE','DISPATCHED')
        and not exists (
          select 1 from public.way_plan_shipments wps where wps.shipment_id = s.id
        )
    ),
    grouped as (
      select
        case
          when upper(coalesce(p_group_by,'CITY'))='CITY' then public.city_code(receiver_city)
          else public.city_code(receiver_city)
        end as gk,
        shipment_id,
        way_id,
        created_at
      from candidates
    )
    select gk, array_agg(shipment_id order by created_at asc) as ship_ids
    from grouped
    group by gk
  loop
    insert into public.way_plans(service_date, hub_branch_id, group_key, route_name, status)
    values (p_service_date, p_hub_branch_id, r.gk, ('WAY-'||r.gk||'-'||to_char(p_service_date,'DDMMYYYY')), 'PLANNED')
    returning id into pid;

    cnt := 0;

    -- insert shipments into plan with stop order
    insert into public.way_plan_shipments(way_plan_id, shipment_id, way_id, stop_order)
    select
      pid,
      s.id,
      s.way_id,
      row_number() over (order by s.created_at asc)::int
    from public.shipments s
    where s.id = any(r.ship_ids);

    get diagnostics cnt = row_count;

    return query select pid, r.gk, cnt;
  end loop;

end;
$$;

grant execute on function public.generate_way_plans(date,uuid,text) to authenticated;

-- ----------------------------------------------------------
-- RPC: Assign staff and optionally LOCK the plan
-- ----------------------------------------------------------
create or replace function public.assign_and_lock_way_plan(
  p_way_plan_id uuid,
  p_driver_id uuid default null,
  p_rider_id uuid default null,
  p_helper_ids uuid[] default '{}'::uuid[],
  p_lock boolean default false,
  p_lock_reason text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not (public.is_admin_role() or public.has_any_role(array['SUPERVISOR','OPERATIONS_ADMIN','ADM','MGR'])) then
    raise exception 'Not allowed';
  end if;

  insert into public.way_plan_assignments(way_plan_id, driver_id, rider_id, helper_ids, assigned_by)
  values (p_way_plan_id, p_driver_id, p_rider_id, coalesce(p_helper_ids,'{}'::uuid[]), auth.uid())
  on conflict (way_plan_id) do update set
    driver_id = excluded.driver_id,
    rider_id = excluded.rider_id,
    helper_ids = excluded.helper_ids,
    assigned_by = auth.uid(),
    assigned_at = now()
  ;

  if p_lock then
    update public.way_plan_assignments set is_locked = true where way_plan_id = p_way_plan_id;
    update public.way_plans
      set status='LOCKED', locked_by=auth.uid(), locked_at=now(), locked_reason=p_lock_reason
    where id = p_way_plan_id;
  end if;
end;
$$;

grant execute on function public.assign_and_lock_way_plan(uuid,uuid,uuid,uuid[],boolean,text) to authenticated;

-- ----------------------------------------------------------
-- RLS
-- ----------------------------------------------------------
alter table public.way_plans enable row level security;
alter table public.way_plan_shipments enable row level security;
alter table public.way_plan_assignments enable row level security;

-- SELECT: admins + assigned staff
drop policy if exists way_plans_select on public.way_plans;
create policy way_plans_select on public.way_plans
for select to authenticated
using (
  public.is_admin_role()
  or exists (select 1 from public.way_plan_assignments a
            where a.way_plan_id = way_plans.id
              and (a.driver_id = auth.uid() or a.rider_id = auth.uid() or auth.uid() = any(a.helper_ids)))
);

drop policy if exists way_plan_shipments_select on public.way_plan_shipments;
create policy way_plan_shipments_select on public.way_plan_shipments
for select to authenticated
using (
  public.is_admin_role()
  or exists (select 1 from public.way_plan_assignments a
            where a.way_plan_id = way_plan_shipments.way_plan_id
              and (a.driver_id = auth.uid() or a.rider_id = auth.uid() or auth.uid() = any(a.helper_ids)))
);

drop policy if exists way_plan_assignments_select on public.way_plan_assignments;
create policy way_plan_assignments_select on public.way_plan_assignments
for select to authenticated
using (
  public.is_admin_role()
  or (driver_id = auth.uid() or rider_id = auth.uid() or auth.uid() = any(helper_ids))
);

-- WRITE: admins + ops manager + supervisor
drop policy if exists way_plans_write on public.way_plans;
create policy way_plans_write on public.way_plans
for all to authenticated
using (public.is_admin_role() or public.has_any_role(array['SUPERVISOR','OPERATIONS_ADMIN','ADM','MGR']))
with check (public.is_admin_role() or public.has_any_role(array['SUPERVISOR','OPERATIONS_ADMIN','ADM','MGR']));

drop policy if exists way_plan_shipments_write on public.way_plan_shipments;
create policy way_plan_shipments_write on public.way_plan_shipments
for all to authenticated
using (public.is_admin_role() or public.has_any_role(array['SUPERVISOR','OPERATIONS_ADMIN','ADM','MGR']))
with check (public.is_admin_role() or public.has_any_role(array['SUPERVISOR','OPERATIONS_ADMIN','ADM','MGR']));

drop policy if exists way_plan_assignments_write on public.way_plan_assignments;
create policy way_plan_assignments_write on public.way_plan_assignments
for all to authenticated
using (public.is_admin_role() or public.has_any_role(array['SUPERVISOR','OPERATIONS_ADMIN','ADM','MGR']))
with check (public.is_admin_role() or public.has_any_role(array['SUPERVISOR','OPERATIONS_ADMIN','ADM','MGR']));

commit;
SQL

write_file "scripts/sql/exec_surveillance_wayplanning.sql" < "supabase/migrations/20260305_060_exec_surveillance_wayplanning.sql"

echo "✅ EN: SQL created: supabase/migrations/20260305_060_exec_surveillance_wayplanning.sql"
echo "✅ MY: SQL ဖိုင်ပြုလုပ်ပြီး: supabase/migrations/20260305_060_exec_surveillance_wayplanning.sql"

# ==========================================================
# 3) Frontend services
# ==========================================================
write_file "src/services/admin/executive.ts" <<'TS'
import { supabase } from "@/lib/supabase";

export type ExecutiveSummary = {
  ship_total: number;
  ship_pending: number;
  ship_approved: number;
  ship_out_for_delivery: number;
  ship_delivered: number;
  cod_pending_count: number;
  cod_pending_amount: number;
  courier_online: number;
  fraud_count: number;
  print_queue: number;
  active_way_plans: number;
};

export async function getExecutiveSummary(): Promise<ExecutiveSummary> {
  const { data, error } = await supabase.rpc("get_executive_summary");
  if (error) throw new Error(error.message);
  return data as ExecutiveSummary;
}
TS

write_file "src/services/wayplanning/wayPlanning.ts" <<'TS'
import { supabase } from "@/lib/supabase";

export type WayPlanRow = {
  id: string;
  service_date: string;
  hub_branch_id: string | null;
  group_key: string;
  route_name: string;
  status: string;
  created_at: string;
  locked_by: string | null;
  locked_at: string | null;
  locked_reason: string | null;
};

export async function generateWayPlans(input: { service_date: string; hub_branch_id?: string | null; group_by?: string }) {
  const { data, error } = await supabase.rpc("generate_way_plans", {
    p_service_date: input.service_date,
    p_hub_branch_id: input.hub_branch_id ?? null,
    p_group_by: input.group_by ?? "CITY",
  });
  if (error) throw new Error(error.message);
  return (data ?? []) as Array<{ plan_id: string; group_key: string; shipments_count: number }>;
}

export async function listWayPlans(limit = 50): Promise<WayPlanRow[]> {
  const { data, error } = await supabase
    .from("way_plans")
    .select("id,service_date,hub_branch_id,group_key,route_name,status,created_at,locked_by,locked_at,locked_reason")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []) as any;
}

export async function getWayPlanShipments(planId: string) {
  const { data, error } = await supabase
    .from("way_plan_shipments")
    .select("shipment_id,way_id,stop_order")
    .eq("way_plan_id", planId)
    .order("stop_order", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listAssignableStaff() {
  // EN: Uses public.users table (role values must exist)
  // MY: public.users ထဲက role များအလိုက်ယူမယ်
  const { data, error } = await supabase
    .from("users")
    .select("id,email,full_name,role")
    .in("role", ["DRIVER", "RIDER", "HELPER"])
    .order("role", { ascending: true })
    .limit(500);
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function assignAndLockWayPlan(input: {
  plan_id: string;
  driver_id?: string | null;
  rider_id?: string | null;
  helper_ids?: string[];
  lock?: boolean;
  lock_reason?: string | null;
}) {
  const { error } = await supabase.rpc("assign_and_lock_way_plan", {
    p_way_plan_id: input.plan_id,
    p_driver_id: input.driver_id ?? null,
    p_rider_id: input.rider_id ?? null,
    p_helper_ids: input.helper_ids ?? [],
    p_lock: Boolean(input.lock),
    p_lock_reason: input.lock_reason ?? null,
  });
  if (error) throw new Error(error.message);
}
TS

# ==========================================================
# 4) Executive Dashboard Page
# ==========================================================
write_file "src/pages/portals/admin/ExecutiveDashboardPage.tsx" <<'TSX'
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PortalShell } from "@/components/layout/PortalShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { getExecutiveSummary } from "@/services/admin/executive";
import { recordSupplyEvent } from "@/services/supplyChain";
import { TraceTimeline } from "@/components/supplychain/TraceTimeline";

function Stat({ label, value }: { label: string; value: any }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="text-[10px] uppercase tracking-widest opacity-70">{label}</div>
      <div className="text-2xl font-black text-white mt-1">{value}</div>
    </div>
  );
}

export default function ExecutiveDashboardPage() {
  const { lang } = useLanguage();
  const nav = useNavigate();

  const [summary, setSummary] = useState<any | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const [quickWay, setQuickWay] = useState("");
  const [approveWay, setApproveWay] = useState("");

  const isEn = lang === "en";

  async function refresh() {
    setErr(null);
    try {
      const s = await getExecutiveSummary();
      setSummary(s);
    } catch (e: any) {
      setErr(e?.message || String(e));
    }
  }

  useEffect(() => { void refresh(); }, []);

  const portals = useMemo(() => ([
    { labelEn: "Operations", labelMy: "Operations", to: "/portal/operations" },
    { labelEn: "Execution", labelMy: "Execution", to: "/portal/execution" },
    { labelEn: "Warehouse", labelMy: "Warehouse", to: "/portal/warehouse" },
    { labelEn: "Branch", labelMy: "Branch", to: "/portal/branch" },
    { labelEn: "Finance", labelMy: "Finance", to: "/portal/finance" },
    { labelEn: "HR", labelMy: "HR", to: "/portal/hr" },
    { labelEn: "Waybills", labelMy: "Waybill", to: "/portal/operations/waybills" },
    { labelEn: "QR Ops", labelMy: "QR Ops", to: "/portal/operations/qr-scan" },
  ]), []);

  async function approveNow() {
    const way = approveWay.trim().toUpperCase();
    if (!way) return;

    try {
      await recordSupplyEvent({
        way_id: way,
        event_type: "SUPV_APPROVED",
        segment: "SUPERVISOR",
        note: "Approved from Executive Dashboard",
        meta: { ui: "ExecutiveDashboard", force: true }, // admin override allowed
      });
      alert(isEn ? "Approved" : "အတည်ပြုပြီးပါပြီ");
      setApproveWay("");
      await refresh();
    } catch (e: any) {
      alert(e?.message || String(e));
    }
  }

  return (
    <PortalShell
      title={isEn ? "Executive Dashboard" : "အုပ်ချုပ်ရေး Dashboard"}
      links={[
        { to: "/portal/admin/executive", label: "Executive" },
        { to: "/portal/admin/surveillance", label: "Surveillance Map" },
        { to: "/portal/admin/cargo-tracking", label: "Cargo Tracking" },
        { to: "/portal/admin/way-planning", label: "Way Planning" },
      ]}
    >
      <div className="p-8 space-y-6 bg-[#0B101B] min-h-screen text-slate-200">
        {err ? <div className="text-xs text-red-300">Error: {err}</div> : null}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Stat label={isEn ? "Total Shipments" : "စုစုပေါင်း"} value={summary?.ship_total ?? "—"} />
          <Stat label={isEn ? "Pending" : "Pending"} value={summary?.ship_pending ?? "—"} />
          <Stat label={isEn ? "Delivered" : "Delivered"} value={summary?.ship_delivered ?? "—"} />
          <Stat label={isEn ? "Couriers Online (5m)" : "Online (5m)"} value={summary?.courier_online ?? "—"} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Stat label={isEn ? "COD Pending Count" : "COD Pending"} value={summary?.cod_pending_count ?? "—"} />
          <Stat label={isEn ? "COD Pending Amount" : "COD Amount"} value={(summary?.cod_pending_amount ?? 0).toLocaleString?.() ?? "—"} />
          <Stat label={isEn ? "Fraud Signals" : "Fraud"} value={summary?.fraud_count ?? "—"} />
          <Stat label={isEn ? "Print Queue" : "Print Queue"} value={summary?.print_queue ?? "—"} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-[#05080F] border-white/10 rounded-3xl">
            <CardContent className="p-6 space-y-4">
              <div className="text-sm font-black uppercase tracking-widest">
                {isEn ? "Consolidated Portals" : "Portal အားလုံး"}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {portals.map((p) => (
                  <Button
                    key={p.to}
                    className="h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-500 font-black"
                    onClick={() => nav(p.to)}
                  >
                    {isEn ? p.labelEn : p.labelMy}
                  </Button>
                ))}
              </div>

              <div className="pt-4 border-t border-white/10">
                <Button
                  className="w-full h-12 rounded-2xl bg-[#D4AF37] hover:bg-[#b5952f] text-black font-black"
                  onClick={() => nav("/portal/admin/way-planning")}
                >
                  {isEn ? "Open Way Planning (Auto/Assign/Lock)" : "Way Planning ဖွင့်မည်"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#05080F] border-white/10 rounded-3xl">
            <CardContent className="p-6 space-y-4">
              <div className="text-sm font-black uppercase tracking-widest">
                {isEn ? "Direct Actions" : "Direct Actions"}
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4 space-y-2">
                <div className="text-[11px] opacity-70">{isEn ? "Quick Cargo Search (Waybill ID)" : "Waybill နဲ့ရှာ"}</div>
                <div className="flex gap-2">
                  <Input className="bg-[#0B0E17] border border-white/10 rounded-xl h-11 text-white"
                    value={quickWay} onChange={(e)=>setQuickWay(e.target.value)} placeholder="WAY ID" />
                  <Button className="h-11 rounded-xl bg-white/10 hover:bg-white/15"
                    onClick={() => nav(`/portal/admin/cargo-tracking?way=${encodeURIComponent(quickWay.trim().toUpperCase())}`)}>
                    {isEn ? "Open" : "ဖွင့်"}
                  </Button>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4 space-y-2">
                <div className="text-[11px] opacity-70">{isEn ? "Approve Shipment (Supervisor)" : "Shipment အတည်ပြု"}</div>
                <div className="flex gap-2">
                  <Input className="bg-[#0B0E17] border border-white/10 rounded-xl h-11 text-white"
                    value={approveWay} onChange={(e)=>setApproveWay(e.target.value)} placeholder="WAY ID" />
                  <Button className="h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-black" onClick={() => void approveNow()}>
                    {isEn ? "Approve" : "Approve"}
                  </Button>
                </div>
                <div className="text-[10px] opacity-60">
                  {isEn ? "EN: Writes SUPV_APPROVED event (admin override supported)." : "MY: SUPV_APPROVED event မှတ်တမ်းတင်မည်။"}
                </div>
              </div>

              <Button className="w-full h-12 rounded-2xl bg-sky-600 hover:bg-sky-500 font-black"
                onClick={() => nav("/portal/admin/surveillance")}>
                {isEn ? "Open Live Surveillance Map" : "Live Map ဖွင့်မည်"}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="max-w-5xl">
          <TraceTimeline />
        </div>

        <div className="flex justify-end">
          <Button variant="outline" className="border-white/10 bg-black/30 hover:bg-white/5" onClick={() => void refresh()}>
            {isEn ? "Refresh" : "Refresh"}
          </Button>
        </div>
      </div>
    </PortalShell>
  );
}
TSX

# ==========================================================
# 5) Live Surveillance Map Page (realtime couriers)
# Inspired by your LiveSurveillanceMap UI :contentReference[oaicite:1]{index=1}
# ==========================================================
write_file "src/pages/portals/admin/LiveSurveillancePage.tsx" <<'TSX'
import React, { useMemo, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe, Activity, Gauge, MapPin } from "lucide-react";
import { useLiveCourierLocations } from "@/hooks/useLiveCourierLocations";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function LiveSurveillancePage() {
  const { lang, toggleLang } = useLanguage();
  const isEn = lang === "en";

  const { locations } = useLiveCourierLocations({ enabled: true } as any);

  const [selected, setSelected] = useState<any | null>(null);

  const center = useMemo(() => {
    if (selected?.lat && selected?.lng) return [selected.lat, selected.lng] as any;
    const first = locations?.[0];
    if (first?.lat && first?.lng) return [first.lat, first.lng] as any;
    return [16.8661, 96.1561] as any; // Yangon fallback
  }, [locations, selected]);

  return (
    <div className="flex h-screen bg-[#0B101B] text-slate-300 overflow-hidden">
      {/* Sidebar */}
      <div className="w-[420px] bg-[#05080F] border-r border-white/5 p-6 overflow-y-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-black text-white flex items-center gap-3 italic">
            <Activity className="text-emerald-500 animate-pulse" />
            {isEn ? "LIVE SURVEILLANCE" : "တိုက်ရိုက် စောင့်ကြည့်စနစ်"}
          </h1>
          <Button onClick={toggleLang} className="bg-emerald-600 text-white font-black rounded-2xl">
            <Globe className="mr-2 h-4 w-4" /> {isEn ? "မြန်မာ" : "English"}
          </Button>
        </div>

        <div className="mt-6 text-xs opacity-70">
          {isEn
            ? "EN: Couriers are live via Supabase Realtime (courier_locations)."
            : "MY: courier_locations realtime ဖြင့် courier များကို live ကြည့်နိုင်သည်။"}
        </div>

        <div className="mt-6 space-y-3">
          {(locations || []).map((c: any) => (
            <Card
              key={c.user_id || c.id}
              className="bg-[#0B101B] border-white/5 hover:border-emerald-500/50 transition-all cursor-pointer p-4"
              onClick={() => setSelected(c)}
            >
              <div className="flex justify-between items-start mb-3">
                <span className="font-black text-white text-sm">
                  {c.display_name || c.user_id?.slice?.(0, 8) || "COURIER"}
                </span>
                <span className="bg-emerald-500/10 text-emerald-500 text-[9px] px-2 py-1 rounded font-black uppercase">
                  {c.status || "ONLINE"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-[10px] font-mono text-slate-500">
                <div className="flex items-center gap-2">
                  <Gauge size={12} className="text-sky-500" /> {Math.round(Number(c.speed || 0))} km/h
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={12} className="text-amber-500" /> ±{Math.round(Number(c.accuracy_m || 0))}m
                </div>
              </div>
              <div className="text-[10px] opacity-70 mt-2">
                {c.updated_at ? new Date(c.updated_at).toLocaleString() : ""}
              </div>
            </Card>
          ))}
          {!locations?.length ? (
            <div className="text-xs opacity-60">
              {isEn ? "No live couriers yet." : "Live courier မရှိသေးပါ။"}
            </div>
          ) : null}
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <MapContainer center={center} zoom={6} className="h-full w-full">
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
          {(locations || []).map((c: any) =>
            c.lat && c.lng ? (
              <Marker key={c.user_id || c.id} position={[c.lat, c.lng]}>
                <Popup>
                  <div className="font-bold">{c.display_name || c.user_id?.slice?.(0, 8)}</div>
                  <div className="text-xs">Speed: {Math.round(Number(c.speed || 0))} km/h</div>
                  <div className="text-xs">Accuracy: ±{Math.round(Number(c.accuracy_m || 0))}m</div>
                </Popup>
              </Marker>
            ) : null
          )}
        </MapContainer>
      </div>
    </div>
  );
}
TSX

# ==========================================================
# 6) Cargo Tracking Page (Waybill search + trace + map)
# ==========================================================
write_file "src/pages/portals/admin/CargoTrackingPage.tsx" <<'TSX'
import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { PortalShell } from "@/components/layout/PortalShell";
import { useLanguage } from "@/contexts/LanguageContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { TraceTimeline } from "@/components/supplychain/TraceTimeline";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function CargoTrackingPage() {
  const { lang } = useLanguage();
  const isEn = lang === "en";
  const q = useQuery();

  const [way, setWay] = useState(q.get("way") || "");
  const [ship, setShip] = useState<any | null>(null);
  const [courier, setCourier] = useState<any | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setErr(null); setShip(null); setCourier(null);
    const w = way.trim().toUpperCase();
    if (!w) return;

    const sres = await supabase.from("shipments").select("*").eq("way_id", w).maybeSingle();
    if (sres.error) return setErr(sres.error.message);
    if (!sres.data) return setErr(isEn ? "Not found" : "မတွေ့ပါ");
    setShip(sres.data);

    const riderId = sres.data.assigned_rider_id;
    if (riderId) {
      const cres = await supabase.from("courier_locations").select("*").eq("user_id", riderId).maybeSingle();
      if (!cres.error && cres.data) setCourier(cres.data);
    }
  }

  useEffect(() => { if (q.get("way")) void load(); }, []);

  const center = useMemo(() => {
    if (courier?.lat && courier?.lng) return [courier.lat, courier.lng] as any;
    return [16.8661, 96.1561] as any;
  }, [courier]);

  return (
    <PortalShell
      title={isEn ? "Cargo Tracking" : "Cargo ခြေရာခံခြင်း"}
      links={[
        { to: "/portal/admin/executive", label: "Executive" },
        { to: "/portal/admin/surveillance", label: "Surveillance" },
        { to: "/portal/admin/way-planning", label: "Way Planning" },
      ]}
    >
      <div className="p-8 bg-[#0B101B] min-h-screen text-slate-200 space-y-6">
        <div className="rounded-3xl border border-white/10 bg-[#05080F] p-6 space-y-3">
          <div className="text-sm font-black uppercase tracking-widest">{isEn ? "Search by Waybill ID" : "Waybill ID ဖြင့်ရှာ"}</div>
          <div className="flex gap-2">
            <Input className="bg-[#0B0E17] border border-white/10 rounded-xl h-11 text-white"
              value={way} onChange={(e)=>setWay(e.target.value)} placeholder="WAY ID" />
            <Button className="h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-black" onClick={() => void load()}>
              {isEn ? "Search" : "ရှာ"}
            </Button>
          </div>
          {err ? <div className="text-xs text-red-300">Error: {err}</div> : null}
        </div>

        {ship ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-3xl border border-white/10 bg-[#05080F] p-6 space-y-3">
              <div className="text-sm font-black">Way: <span className="font-mono text-sky-300">{ship.way_id}</span></div>
              <div className="text-xs opacity-70">Status: {ship.status}</div>

              <div className="text-xs">
                <div><span className="opacity-70">{isEn ? "Receiver" : "လက်ခံသူ"}:</span> <b>{ship.receiver_name}</b></div>
                <div><span className="opacity-70">{isEn ? "Phone" : "ဖုန်း"}:</span> <b>{ship.receiver_phone}</b></div>
                <div><span className="opacity-70">{isEn ? "Address" : "လိပ်စာ"}:</span> {ship.receiver_address}</div>
                <div><span className="opacity-70">{isEn ? "City" : "မြို့"}:</span> {ship.receiver_city}</div>
              </div>

              <div className="text-xs">
                <div><span className="opacity-70">COD:</span> <b>{Number(ship.cod_amount || 0).toLocaleString()}</b></div>
                <div><span className="opacity-70">{isEn ? "Delivery Fee" : "Delivery Fee"}:</span> <b>{Number(ship.delivery_fee || 0).toLocaleString()}</b></div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#05080F] overflow-hidden">
              <div className="p-4 text-sm font-black">{isEn ? "Live Courier Location" : "Courier Location"}</div>
              <div className="h-[420px]">
                <MapContainer center={center} zoom={10} className="h-full w-full">
                  <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                  {courier?.lat && courier?.lng ? (
                    <Marker position={[courier.lat, courier.lng]}>
                      <Popup>
                        <div className="font-bold">Courier</div>
                        <div className="text-xs">Speed: {Math.round(Number(courier.speed || 0))} km/h</div>
                        <div className="text-xs">±{Math.round(Number(courier.accuracy_m || 0))}m</div>
                      </Popup>
                    </Marker>
                  ) : null}
                </MapContainer>
              </div>
              <div className="p-4 text-[11px] opacity-70">
                {isEn ? "If rider is assigned and publishing location, marker appears." : "Rider assign လုပ်ပြီး location publish လုပ်ရင် marker ပေါ်လာမယ်။"}
              </div>
            </div>
          </div>
        ) : null}

        <div className="max-w-5xl">
          <TraceTimeline />
        </div>
      </div>
    </PortalShell>
  );
}
TSX

# ==========================================================
# 7) Way Planning Page (Auto generate + assign + lock)
# Enhanced from your WayManagement design :contentReference[oaicite:2]{index=2}
# ==========================================================
write_file "src/pages/portals/admin/WayPlanningPage.tsx" <<'TSX'
import React, { useEffect, useMemo, useState } from "react";
import { PortalShell } from "@/components/layout/PortalShell";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { generateWayPlans, listWayPlans, getWayPlanShipments, listAssignableStaff, assignAndLockWayPlan } from "@/services/wayplanning/wayPlanning";

function todayISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,'0');
  const day = String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${day}`;
}

export default function WayPlanningPage() {
  const { lang } = useLanguage();
  const isEn = lang === "en";

  const [serviceDate, setServiceDate] = useState(todayISO());
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [plans, setPlans] = useState<any[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<any | null>(null);
  const [shipments, setShipments] = useState<any[]>([]);

  const [staff, setStaff] = useState<any[]>([]);
  const drivers = useMemo(() => staff.filter(s=>String(s.role).toUpperCase()==="DRIVER"), [staff]);
  const riders  = useMemo(() => staff.filter(s=>String(s.role).toUpperCase()==="RIDER"), [staff]);
  const helpers = useMemo(() => staff.filter(s=>String(s.role).toUpperCase()==="HELPER"), [staff]);

  const [driverId, setDriverId] = useState<string>("");
  const [riderId, setRiderId] = useState<string>("");
  const [helperIds, setHelperIds] = useState<string[]>([]);
  const [lockReason, setLockReason] = useState("");

  async function refreshPlans() {
    const rows = await listWayPlans(60);
    setPlans(rows);
  }

  useEffect(() => {
    void refreshPlans();
    void (async () => {
      try {
        const s = await listAssignableStaff();
        setStaff(s);
      } catch {}
    })();
  }, []);

  async function generate() {
    setErr(null); setBusy(true);
    try {
      const res = await generateWayPlans({ service_date: serviceDate, group_by: "CITY" });
      await refreshPlans();
      alert(isEn ? `Generated ${res.length} plan(s)` : `Plan ${res.length} ခု ထုတ်ပြီး`);
    } catch (e: any) {
      setErr(e?.message || String(e));
    } finally { setBusy(false); }
  }

  async function openPlan(p: any) {
    setSelectedPlan(p);
    setErr(null);
    try {
      const rows = await getWayPlanShipments(p.id);
      setShipments(rows);
    } catch (e:any) {
      setErr(e?.message || String(e));
    }
  }

  async function assign(lock: boolean) {
    if (!selectedPlan) return;
    setErr(null); setBusy(true);
    try {
      await assignAndLockWayPlan({
        plan_id: selectedPlan.id,
        driver_id: driverId || null,
        rider_id: riderId || null,
        helper_ids: helperIds,
        lock,
        lock_reason: lock ? (lockReason || "Locked from Way Planning UI") : null,
      });
      await refreshPlans();
      const updated = (await listWayPlans(60)).find((x:any)=>x.id===selectedPlan.id) || selectedPlan;
      await openPlan(updated);
      alert(lock ? (isEn ? "LOCKED" : "LOCKED") : (isEn ? "Assigned" : "Assigned"));
    } catch (e:any) {
      setErr(e?.message || String(e));
    } finally { setBusy(false); }
  }

  const locked = selectedPlan?.status === "LOCKED";

  return (
    <PortalShell
      title={isEn ? "Way Planning (Auto • Assign • Lock)" : "Way Planning (Auto • Assign • Lock)"}
      links={[
        { to: "/portal/admin/executive", label: "Executive" },
        { to: "/portal/admin/surveillance", label: "Surveillance" },
        { to: "/portal/admin/cargo-tracking", label: "Cargo Tracking" },
      ]}
    >
      <div className="p-8 space-y-6 bg-[#0B101B] min-h-screen text-slate-200">
        {err ? <div className="text-xs text-red-300">Error: {err}</div> : null}

        <div className="flex flex-col md:flex-row gap-4 items-start md:items-end justify-between bg-[#05080F] p-6 rounded-[2rem] border border-white/10">
          <div>
            <div className="text-2xl font-black text-white uppercase italic tracking-tight">
              {isEn ? "Way Matrix" : "ပို့ဆောင်မှု မေထရစ်"}
            </div>
            <div className="text-[11px] opacity-70 mt-1">
              {isEn
                ? "EN: Auto creates plans from approved/warehouse/dispatched shipments grouped by destination city."
                : "MY: approval/warehouse/dispatched shipment များကို city အလိုက် plan ထုတ်မယ်။"}
            </div>
          </div>

          <div className="flex gap-2 flex-wrap items-end">
            <div>
              <div className="text-[10px] opacity-70">Service Date</div>
              <Input type="date" value={serviceDate} onChange={(e)=>setServiceDate(e.target.value)}
                className="bg-[#0B0E17] border border-white/10 rounded-xl h-11 text-white" />
            </div>
            <Button disabled={busy} className="h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-black px-6" onClick={() => void generate()}>
              {isEn ? "Generate Way Plan" : "လမ်းကြောင်းစာရင်း ထုတ်မည်"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Plans list */}
          <Card className="bg-[#05080F] border-white/10 rounded-3xl p-4">
            <div className="text-sm font-black mb-3">{isEn ? "Plans" : "Plan များ"}</div>
            <div className="space-y-2">
              {plans.map((p:any) => (
                <button
                  key={p.id}
                  onClick={() => void openPlan(p)}
                  className={`w-full text-left rounded-2xl border px-4 py-3 transition-all
                    ${selectedPlan?.id===p.id ? "border-emerald-500/60 bg-emerald-500/10" : "border-white/10 bg-black/20 hover:bg-white/5"}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-mono text-xs text-sky-300">{p.route_name}</div>
                    <div className="text-[10px] px-2 py-1 rounded-full border border-white/10 bg-black/30 uppercase">
                      {p.status}
                    </div>
                  </div>
                  <div className="text-[11px] opacity-70 mt-1">
                    {isEn ? "Group" : "Group"}: {p.group_key} • {new Date(p.created_at).toLocaleString()}
                  </div>
                  {p.locked_at ? (
                    <div className="text-[10px] text-amber-300 mt-1">
                      {isEn ? "LOCKED" : "LOCKED"}: {new Date(p.locked_at).toLocaleString()}
                    </div>
                  ) : null}
                </button>
              ))}
              {!plans.length ? <div className="text-xs opacity-60">No plans yet.</div> : null}
            </div>
          </Card>

          {/* Plan details */}
          <Card className="bg-[#05080F] border-white/10 rounded-3xl p-4 xl:col-span-2">
            {!selectedPlan ? (
              <div className="text-xs opacity-70">{isEn ? "Select a plan to view details." : "Plan တစ်ခုရွေးပါ။"}</div>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <div className="text-lg font-black text-white">{selectedPlan.route_name}</div>
                    <div className="text-[11px] opacity-70">Status: {selectedPlan.status} • Group: {selectedPlan.group_key}</div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button disabled={busy || locked} className="bg-sky-600 hover:bg-sky-500 font-black rounded-xl" onClick={() => void assign(false)}>
                      {isEn ? "Assign" : "Assign"}
                    </Button>
                    <Button disabled={busy || locked} className="bg-[#D4AF37] hover:bg-[#b5952f] text-black font-black rounded-xl" onClick={() => void assign(true)}>
                      {isEn ? "Assign & LOCK" : "Assign & LOCK"}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <div className="text-[10px] opacity-70">Driver</div>
                    <select disabled={locked} value={driverId} onChange={(e)=>setDriverId(e.target.value)}
                      className="mt-1 w-full rounded-xl bg-black/30 border border-white/10 px-3 py-2 text-sm">
                      <option value="">{isEn ? "—" : "—"}</option>
                      {drivers.map((u:any)=>(
                        <option key={u.id} value={u.id}>{u.full_name || u.email || u.id.slice(0,8)}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="text-[10px] opacity-70">Rider</div>
                    <select disabled={locked} value={riderId} onChange={(e)=>setRiderId(e.target.value)}
                      className="mt-1 w-full rounded-xl bg-black/30 border border-white/10 px-3 py-2 text-sm">
                      <option value="">{isEn ? "—" : "—"}</option>
                      {riders.map((u:any)=>(
                        <option key={u.id} value={u.id}>{u.full_name || u.email || u.id.slice(0,8)}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="text-[10px] opacity-70">Helpers (multi)</div>
                    <select disabled={locked} multiple value={helperIds} onChange={(e)=>{
                      const opts = Array.from(e.target.selectedOptions).map(o=>o.value);
                      setHelperIds(opts);
                    }}
                      className="mt-1 w-full rounded-xl bg-black/30 border border-white/10 px-3 py-2 text-sm h-[92px]">
                      {helpers.map((u:any)=>(
                        <option key={u.id} value={u.id}>{u.full_name || u.email || u.id.slice(0,8)}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <div className="text-[10px] opacity-70">Lock Reason</div>
                  <Input disabled={locked} value={lockReason} onChange={(e)=>setLockReason(e.target.value)}
                    className="bg-[#0B0E17] border border-white/10 rounded-xl h-11 text-white"
                    placeholder={isEn ? "e.g. Assigned and confirmed" : "ဥပမာ - အတည်ပြုပြီး Lock"} />
                  {locked ? (
                    <div className="text-[11px] text-amber-300 mt-2">
                      {isEn ? "This plan is LOCKED. Editing is blocked." : "Plan LOCKED ဖြစ်ပြီး ပြင်လို့မရပါ။"}
                    </div>
                  ) : null}
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="text-sm font-black mb-2">{isEn ? "Shipments in Plan" : "Plan ထဲ Shipment"}</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {shipments.map((s:any)=>(
                      <div key={s.shipment_id} className="rounded-xl border border-white/10 bg-black/30 p-3">
                        <div className="font-mono text-xs text-sky-300">{s.way_id}</div>
                        <div className="text-[11px] opacity-70">Stop #{s.stop_order}</div>
                      </div>
                    ))}
                    {!shipments.length ? <div className="text-xs opacity-60">No shipments.</div> : null}
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>

      </div>
    </PortalShell>
  );
}
TSX

# ==========================================================
# 8) Wire routes into src/App.tsx
# ==========================================================
# Add imports (best-effort)
if ! grep -q "ExecutiveDashboardPage" src/App.tsx; then
  perl -0777 -pi -e 's/(import ManualPage from \"@\/pages\/ManualPage\";\n)/$1import ExecutiveDashboardPage from \"@\/pages\/portals\/admin\/ExecutiveDashboardPage\";\nimport LiveSurveillancePage from \"@\/pages\/portals\/admin\/LiveSurveillancePage\";\nimport CargoTrackingPage from \"@\/pages\/portals\/admin\/CargoTrackingPage\";\nimport WayPlanningPage from \"@\/pages\/portals\/admin\/WayPlanningPage\";\n/s' src/App.tsx
fi

# Add routes (insert after /portal/admin route block if possible)
if ! grep -q "/portal/admin/executive" src/App.tsx; then
  perl -0777 -pi -e 's#(path=\"/portal/admin\"[\s\S]*?</Route>\n)#${1}\n\n              <Route\n                path=\"/portal/admin/executive\"\n                element={\n                  <RequireRole allow={[\"SYS\",\"APP_OWNER\",\"SUPER_ADMIN\",\"ADMIN\",\"ADM\",\"MGR\",\"OPERATIONS_ADMIN\"]}>\n                    <ExecutiveDashboardPage />\n                  </RequireRole>\n                }\n              />\n              <Route\n                path=\"/portal/admin/surveillance\"\n                element={\n                  <RequireRole allow={[\"SYS\",\"APP_OWNER\",\"SUPER_ADMIN\",\"ADMIN\",\"ADM\",\"MGR\",\"OPERATIONS_ADMIN\",\"SUPERVISOR\"]}>\n                    <LiveSurveillancePage />\n                  </RequireRole>\n                }\n              />\n              <Route\n                path=\"/portal/admin/cargo-tracking\"\n                element={\n                  <RequireRole allow={[\"SYS\",\"APP_OWNER\",\"SUPER_ADMIN\",\"ADMIN\",\"ADM\",\"MGR\",\"OPERATIONS_ADMIN\",\"SUPERVISOR\"]}>\n                    <CargoTrackingPage />\n                  </RequireRole>\n                }\n              />\n              <Route\n                path=\"/portal/admin/way-planning\"\n                element={\n                  <RequireRole allow={[\"SYS\",\"APP_OWNER\",\"SUPER_ADMIN\",\"ADMIN\",\"ADM\",\"MGR\",\"OPERATIONS_ADMIN\",\"SUPERVISOR\"]}>\n                    <WayPlanningPage />\n                  </RequireRole>\n                }\n              />\n#s' src/App.tsx
fi

echo "✅ EN: Routes added."
echo "✅ MY: Routes ထည့်ပြီးပါပြီ။"

# ==========================================================
# 9) Enhance AdminPortal (best-effort link injection)
# ==========================================================
if [ -f "src/pages/portals/AdminPortal.tsx" ]; then
  if ! grep -q "admin/executive" "src/pages/portals/AdminPortal.tsx"; then
    # Try simple insertion: add links prop
    perl -0777 -pi -e 's/<PortalShell title=\"Admin Portal\">/<PortalShell title=\"Admin Portal\" links={[{ to: \"\\/portal\\/admin\\/executive\", label: \"Executive\" }, { to: \"\\/portal\\/admin\\/surveillance\", label: \"Surveillance\" }, { to: \"\\/portal\\/admin\\/cargo-tracking\", label: \"Cargo Tracking\" }, { to: \"\\/portal\\/admin\\/way-planning\", label: \"Way Planning\" }]}>\n/s' "src/pages/portals/AdminPortal.tsx" || true
  fi
fi

echo ""
echo "=========================================================="
echo "✅ EN: APPLY COMPLETE."
echo "✅ MY: APPLY ပြီးဆုံးပါပြီ။"
echo ""
echo "NEXT STEPS:"
echo "EN: 1) Apply SQL: supabase db push  (or run scripts/sql/exec_surveillance_wayplanning.sql)"
echo "MY: 1) SQL run: supabase db push (သို့) scripts/sql/exec_surveillance_wayplanning.sql ကို run"
echo "EN: 2) Start: npm run dev"
echo "MY: 2) Start: npm run dev"
echo "EN: 3) Open: /portal/admin/executive"
echo "MY: 3) /portal/admin/executive သို့ ဝင်ပါ"
echo "=========================================================="
#!/usr/bin/env bash
set -euo pipefail

# ==============================================================================
# WAREHOUSE PLATFORM (WMS) — Enterprise Starter (Bilingual EN/MM)
#
# Features:
# - Separate portals:
#   - Controller/Supervisor: dashboard, task board, assignments, master data, inventory, reports
#   - Staff: my tasks, inbound (receive/putaway), outbound (pick/pack/dispatch), cycle count
# - Scan-first UX using existing QRCodeScanner (fallback to manual input)
# - Offline queue + sync for staff actions
# - Supabase best-effort with schema-resilient column handling; local fallback
# - Excel exports (xlsx) for controller reports
#
# Expected tables (recommended; otherwise local fallback):
# - warehouse_tasks(id, created_at, updated_at, type, status, reference, sku, qty,
#                  from_location, to_location, assigned_to_email, note, meta jsonb)
# - warehouse_skus(id, sku, name, barcode, uom, meta jsonb, updated_at)
# - warehouse_locations(id, code, name, zone, type, capacity, meta jsonb, updated_at)
# - warehouse_inventory(id, sku, location_code, qty, updated_at)   (optional; can be derived)
#
# Routes added (best-effort patch):
# - /portal/warehouse -> redirects by role
# - /portal/warehouse/controller
# - /portal/warehouse/controller/master
# - /portal/warehouse/controller/inbound
# - /portal/warehouse/controller/outbound
# - /portal/warehouse/controller/inventory
# - /portal/warehouse/controller/reports
# - /portal/warehouse/staff
# - /portal/warehouse/staff/inbound
# - /portal/warehouse/staff/outbound
# - /portal/warehouse/staff/cycle-count
#
# Run:
#   bash apply_warehouse_platform.sh
# ==============================================================================

backup(){ [[ -f "$1" ]] && cp -f "$1" "$1.bak.$(date +%Y%m%d_%H%M%S)" || true; }

PKG="package.json"

SHELL="src/components/layout/WarehouseShell.tsx"
BADGE="src/components/warehouse/WarehouseStatusBadge.tsx"
SCAN="src/components/warehouse/WarehouseScanInput.tsx"

OFFLINE="src/lib/warehouseOfflineQueue.ts"
SERVICE="src/services/warehousePlatform.ts"

PORTAL="src/pages/portals/WarehousePortal.tsx"

CTRL_DASH="src/pages/portals/warehouse/ControllerDashboard.tsx"
CTRL_MASTER="src/pages/portals/warehouse/ControllerMasterData.tsx"
CTRL_TASKS="src/pages/portals/warehouse/ControllerTaskBoard.tsx"
CTRL_INBOUND="src/pages/portals/warehouse/ControllerInbound.tsx"
CTRL_OUTBOUND="src/pages/portals/warehouse/ControllerOutbound.tsx"
CTRL_INV="src/pages/portals/warehouse/ControllerInventory.tsx"
CTRL_REPORTS="src/pages/portals/warehouse/ControllerReports.tsx"

STAFF_HOME="src/pages/portals/warehouse/StaffHome.tsx"
STAFF_INBOUND="src/pages/portals/warehouse/StaffInbound.tsx"
STAFF_OUTBOUND="src/pages/portals/warehouse/StaffOutbound.tsx"
STAFF_CYCLE="src/pages/portals/warehouse/StaffCycleCount.tsx"

APP="src/App.tsx"

mkdir -p \
  "$(dirname "$SHELL")" "$(dirname "$BADGE")" "$(dirname "$SCAN")" \
  "$(dirname "$OFFLINE")" "$(dirname "$SERVICE")" \
  "$(dirname "$PORTAL")" \
  "$(dirname "$CTRL_DASH")" "$(dirname "$CTRL_MASTER")" "$(dirname "$CTRL_TASKS")" \
  "$(dirname "$CTRL_INBOUND")" "$(dirname "$CTRL_OUTBOUND")" "$(dirname "$CTRL_INV")" "$(dirname "$CTRL_REPORTS")" \
  "$(dirname "$STAFF_HOME")" "$(dirname "$STAFF_INBOUND")" "$(dirname "$STAFF_OUTBOUND")" "$(dirname "$STAFF_CYCLE")"

backup "$PKG" "$SHELL" "$BADGE" "$SCAN" "$OFFLINE" "$SERVICE" "$PORTAL" \
  "$CTRL_DASH" "$CTRL_MASTER" "$CTRL_TASKS" "$CTRL_INBOUND" "$CTRL_OUTBOUND" "$CTRL_INV" "$CTRL_REPORTS" \
  "$STAFF_HOME" "$STAFF_INBOUND" "$STAFF_OUTBOUND" "$STAFF_CYCLE" "$APP"

# ------------------------------------------------------------------------------
# 0) Ensure xlsx dependency for reports (safe if already installed)
# ------------------------------------------------------------------------------
node - <<'NODE'
const fs = require("fs");
const p = "package.json";
const pkg = JSON.parse(fs.readFileSync(p,"utf-8"));
pkg.dependencies ||= {};
if (!pkg.dependencies["xlsx"]) pkg.dependencies["xlsx"] = "^0.18.5";
fs.writeFileSync(p, JSON.stringify(pkg,null,2)+"\n");
console.log("✅ ensured dependency: xlsx");
NODE

# ------------------------------------------------------------------------------
# 1) Status badge
# ------------------------------------------------------------------------------
cat > "$BADGE" <<'EOF'
import React from "react";
import { Badge } from "@/components/ui/badge";

export type WhStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "HOLD" | "CANCELLED";

export function WarehouseStatusBadge({ status }: { status: WhStatus | string }) {
  const s = String(status ?? "PENDING").toUpperCase();

  const cls =
    s === "COMPLETED"
      ? "border-emerald-500/30 text-emerald-300 bg-emerald-500/10"
      : s === "IN_PROGRESS"
      ? "border-amber-500/30 text-amber-300 bg-amber-500/10"
      : s === "HOLD"
      ? "border-rose-500/30 text-rose-300 bg-rose-500/10"
      : s === "CANCELLED"
      ? "border-slate-500/30 text-slate-300 bg-slate-500/10"
      : "border-white/10 text-white/70 bg-white/5";

  return (
    <Badge variant="outline" className={cls}>
      {s}
    </Badge>
  );
}

export default WarehouseStatusBadge;
EOF

# ------------------------------------------------------------------------------
# 2) Scan input wrapper (uses QRCodeScanner if exists; always provides manual input)
# ------------------------------------------------------------------------------
cat > "$SCAN" <<'EOF'
import React, { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QrCode, Keyboard } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

type Props = {
  label: string;
  placeholder?: string;
  onValue: (value: string) => void;
  normalize?: (raw: string) => string;
};

export function WarehouseScanInput({ label, placeholder, onValue, normalize }: Props) {
  const { lang } = useLanguage();
  const t = (en: string, mm: string) => (lang === "en" ? en : mm);

  const [open, setOpen] = useState(false);
  const [manual, setManual] = useState("");

  const Scanner = useMemo(async () => {
    try {
      const mod = await import("@/components/QRCodeScanner");
      return (mod as any).default || (mod as any).QRCodeScanner;
    } catch {
      return null;
    }
  }, []);

  const norm = (v: string) => (normalize ? normalize(v) : v.trim());

  return (
    <div className="flex items-center gap-2">
      <Button className="bg-sky-600 hover:bg-sky-500" onClick={() => setOpen(true)}>
        <QrCode className="h-4 w-4 mr-2" />
        {t("Scan", "Scan")}
      </Button>

      <div className="flex-1">
        <Input
          className="bg-[#05080F] border-white/10"
          value={manual}
          onChange={(e) => setManual(e.target.value)}
          placeholder={placeholder ?? label}
        />
      </div>

      <Button
        variant="outline"
        className="border-white/10"
        onClick={() => {
          const v = norm(manual);
          if (v) onValue(v);
          setManual("");
        }}
      >
        <Keyboard className="h-4 w-4 mr-2" />
        {t("Use", "သုံးမည်")}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-[#05080F] border-white/10 text-white max-w-3xl">
          <DialogHeader>
            <DialogTitle className="font-black tracking-widest uppercase">{label}</DialogTitle>
          </DialogHeader>

          <React.Suspense fallback={<div className="p-6 text-white/60">Loading scanner…</div>}>
            <ScannerGate onScan={(raw) => { onValue(norm(raw)); setOpen(false); }} />
          </React.Suspense>

          <DialogFooter>
            <Button variant="outline" className="border-white/10" onClick={() => setOpen(false)}>
              {t("Close", "ပိတ်")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ScannerGate({ onScan }: { onScan: (raw: string) => void }) {
  const [Comp, setComp] = useState<any>(null);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const mod = await import("@/components/QRCodeScanner");
        if (mounted) setComp(() => (mod as any).default || (mod as any).QRCodeScanner);
      } catch {
        if (mounted) setComp(() => null);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (!Comp) {
    return <div className="p-6 text-white/60">Scanner not available. Use manual input.</div>;
  }

  return <Comp continuous={false} onScan={onScan} />;
}

export default WarehouseScanInput;
EOF

# ------------------------------------------------------------------------------
# 3) Offline queue for staff actions
# ------------------------------------------------------------------------------
cat > "$OFFLINE" <<'EOF'
export type WhActionKind =
  | "TASK_START"
  | "TASK_HOLD"
  | "TASK_COMPLETE"
  | "RECEIVE"
  | "PUTAWAY"
  | "PICK"
  | "PACK"
  | "DISPATCH"
  | "CYCLE_COUNT";

export type WhOfflineAction = {
  id: string;
  kind: WhActionKind;
  taskId?: string | null;
  payload: Record<string, unknown>;
  createdAtIso: string;
};

const KEY = "wh_offline_queue_v1";

function uuid() {
  const c: any = globalThis.crypto;
  return c?.randomUUID ? c.randomUUID() : `q_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function safeJson<T>(raw: string | null, fallback: T): T {
  try {
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function loadWhQueue(): WhOfflineAction[] {
  if (typeof window === "undefined") return [];
  const v = safeJson<WhOfflineAction[]>(window.localStorage.getItem(KEY), []);
  return Array.isArray(v) ? v : [];
}

export function saveWhQueue(items: WhOfflineAction[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(items.slice(0, 1000)));
}

export function enqueueWhAction(a: Omit<WhOfflineAction, "id" | "createdAtIso">) {
  const cur = loadWhQueue();
  const next: WhOfflineAction = { ...a, id: uuid(), createdAtIso: new Date().toISOString() };
  saveWhQueue([next, ...cur]);
  return next;
}

export function removeWhAction(id: string) {
  const cur = loadWhQueue();
  saveWhQueue(cur.filter((x) => x.id !== id));
}

export async function syncWhQueue(handlers: {
  onStart: (taskId: string, payload: Record<string, unknown>) => Promise<void>;
  onHold: (taskId: string, payload: Record<string, unknown>) => Promise<void>;
  onComplete: (taskId: string, payload: Record<string, unknown>) => Promise<void>;
  onOp: (kind: WhActionKind, payload: Record<string, unknown>) => Promise<void>;
}) {
  const cur = loadWhQueue();
  const remaining: WhOfflineAction[] = [];
  let ok = 0;
  let fail = 0;

  // oldest first
  for (const item of [...cur].reverse()) {
    try {
      if (item.kind === "TASK_START") await handlers.onStart(String(item.taskId), item.payload);
      else if (item.kind === "TASK_HOLD") await handlers.onHold(String(item.taskId), item.payload);
      else if (item.kind === "TASK_COMPLETE") await handlers.onComplete(String(item.taskId), item.payload);
      else await handlers.onOp(item.kind, item.payload);
      ok++;
    } catch {
      remaining.push(item);
      fail++;
    }
  }

  saveWhQueue(remaining.reverse());
  return { ok, fail, remaining: remaining.length };
}
EOF

# ------------------------------------------------------------------------------
# 4) Warehouse Platform service (Supabase best-effort + local fallback)
# ------------------------------------------------------------------------------
cat > "$SERVICE" <<'EOF'
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export type WhTaskType = "RECEIVE" | "PUTAWAY" | "PICK" | "PACK" | "DISPATCH" | "CYCLE_COUNT" | "QC_HOLD";
export type WhTaskStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "HOLD" | "CANCELLED";

export type WhTask = {
  id: string;
  created_at: string;
  updated_at?: string | null;

  type: WhTaskType;
  status: WhTaskStatus;

  reference: string | null; // AWB/PO/ORDER/BATCH
  sku: string | null;
  qty: number | null;

  from_location: string | null;
  to_location: string | null;

  assigned_to_email: string | null;
  note: string | null;
  meta?: Record<string, unknown> | null;
};

export type WhSku = {
  id: string;
  sku: string;
  name: string | null;
  barcode: string | null;
  uom: string | null;
  meta?: Record<string, unknown> | null;
};

export type WhLocation = {
  id: string;
  code: string;
  name: string | null;
  zone: string | null;
  type: string | null;
  capacity: number | null;
  meta?: Record<string, unknown> | null;
};

export type WhInventoryRow = {
  sku: string;
  location_code: string;
  qty: number;
};

const LS = {
  tasks: "wh_tasks_v2",
  skus: "wh_skus_v1",
  locs: "wh_locs_v1",
  inv: "wh_inv_v1",
};

function uuid() {
  const c: any = globalThis.crypto;
  return c?.randomUUID ? c.randomUUID() : `wh_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function nowIso() {
  return new Date().toISOString();
}

function safeJson<T>(raw: string | null, fallback: T): T {
  try {
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function loadLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  return safeJson<T>(window.localStorage.getItem(key), fallback);
}

function saveLocal<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

async function actor() {
  try {
    const { data } = await supabase.auth.getSession();
    const u = data?.session?.user;
    return { email: u?.email ?? null, id: u?.id ?? null };
  } catch {
    return { email: null, id: null };
  }
}

async function audit(eventType: string, metadata: Record<string, unknown>) {
  if (!isSupabaseConfigured) return;
  try {
    await supabase.from("audit_logs").insert({ event_type: eventType, user_id: null, metadata } as any);
  } catch {
    // best-effort
  }
}

function mapTask(r: any): WhTask {
  return {
    id: String(r?.id ?? ""),
    created_at: String(r?.created_at ?? nowIso()),
    updated_at: r?.updated_at ?? null,
    type: String(r?.type ?? "RECEIVE").toUpperCase() as WhTaskType,
    status: String(r?.status ?? "PENDING").toUpperCase() as WhTaskStatus,
    reference: r?.reference ?? r?.ref ?? null,
    sku: r?.sku ?? null,
    qty: r?.qty ?? null,
    from_location: r?.from_location ?? r?.fromLocation ?? null,
    to_location: r?.to_location ?? r?.toLocation ?? null,
    assigned_to_email: r?.assigned_to_email ?? r?.assignedTo ?? null,
    note: r?.note ?? null,
    meta: r?.meta ?? r?.metadata ?? null,
  };
}

function mapSku(r: any): WhSku {
  return {
    id: String(r?.id ?? ""),
    sku: String(r?.sku ?? ""),
    name: r?.name ?? null,
    barcode: r?.barcode ?? null,
    uom: r?.uom ?? null,
    meta: r?.meta ?? r?.metadata ?? null,
  };
}

function mapLoc(r: any): WhLocation {
  return {
    id: String(r?.id ?? ""),
    code: String(r?.code ?? ""),
    name: r?.name ?? null,
    zone: r?.zone ?? null,
    type: r?.type ?? null,
    capacity: r?.capacity ?? null,
    meta: r?.meta ?? r?.metadata ?? null,
  };
}

export async function listTasks(scope: "ALL" | "MINE"): Promise<WhTask[]> {
  const { email } = await actor();

  if (!isSupabaseConfigured) {
    const tasks = loadLocal<WhTask[]>(LS.tasks, []);
    const all = [...tasks].sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
    return scope === "ALL" ? all : all.filter((t) => (t.assigned_to_email ?? "") === (email ?? ""));
  }

  let q = supabase.from("warehouse_tasks").select("*").order("created_at", { ascending: false }).limit(800);
  if (scope === "MINE" && email) q = q.eq("assigned_to_email" as any, email);
  const res = await q;
  if (res.error) throw new Error(res.error.message);
  return (res.data ?? []).map(mapTask);
}

export async function createTask(input: Omit<WhTask, "id" | "created_at" | "updated_at">): Promise<WhTask> {
  const a = await actor();
  const t: WhTask = { id: uuid(), created_at: nowIso(), updated_at: nowIso(), ...input };

  if (!isSupabaseConfigured) {
    const cur = loadLocal<WhTask[]>(LS.tasks, []);
    saveLocal(LS.tasks, [t, ...cur]);
    return t;
  }

  const ins = await supabase.from("warehouse_tasks").insert({
    id: t.id,
    created_at: t.created_at,
    updated_at: t.updated_at,
    type: t.type,
    status: t.status,
    reference: t.reference,
    sku: t.sku,
    qty: t.qty,
    from_location: t.from_location,
    to_location: t.to_location,
    assigned_to_email: t.assigned_to_email,
    note: t.note,
    meta: { ...(t.meta ?? {}), actorEmail: a.email ?? null },
  } as any);

  if (ins.error) throw new Error(ins.error.message);
  await audit("WH_TASK_CREATED", { taskId: t.id, type: t.type, reference: t.reference, assignedTo: t.assigned_to_email, actorEmail: a.email });
  return t;
}

export async function setTaskStatus(id: string, status: WhTaskStatus, note?: string | null): Promise<void> {
  const a = await actor();

  if (!isSupabaseConfigured) {
    const cur = loadLocal<WhTask[]>(LS.tasks, []);
    saveLocal(LS.tasks, cur.map((x) => (x.id === id ? { ...x, status, note: note ?? x.note, updated_at: nowIso() } : x)));
    return;
  }

  const upd = await supabase.from("warehouse_tasks").update({ status, note: note ?? null, updated_at: nowIso() } as any).eq("id", id);
  if (upd.error) throw new Error(upd.error.message);
  await audit("WH_TASK_STATUS", { taskId: id, status, note: note ?? null, actorEmail: a.email });
}

export async function assignTask(id: string, assignedToEmail: string | null): Promise<void> {
  const a = await actor();

  if (!isSupabaseConfigured) {
    const cur = loadLocal<WhTask[]>(LS.tasks, []);
    saveLocal(LS.tasks, cur.map((x) => (x.id === id ? { ...x, assigned_to_email: assignedToEmail, updated_at: nowIso() } : x)));
    return;
  }

  const upd = await supabase.from("warehouse_tasks").update({ assigned_to_email: assignedToEmail, updated_at: nowIso() } as any).eq("id", id);
  if (upd.error) throw new Error(upd.error.message);
  await audit("WH_TASK_ASSIGNED", { taskId: id, assignedTo: assignedToEmail, actorEmail: a.email });
}

export async function listStaffEmails(): Promise<string[]> {
  if (!isSupabaseConfigured) return [];
  try {
    const roles = ["WAREHOUSE_STAFF", "WH_STAFF", "STAFF", "WAREHOUSE"];
    const res = await supabase.from("profiles").select("email, role").in("role" as any, roles as any).limit(400);
    if (res.error) return [];
    const emails = (res.data ?? []).map((r: any) => String(r?.email ?? "").trim()).filter(Boolean);
    return Array.from(new Set(emails)).sort();
  } catch {
    return [];
  }
}

export async function listSkus(): Promise<WhSku[]> {
  if (!isSupabaseConfigured) return loadLocal<WhSku[]>(LS.skus, []);
  const res = await supabase.from("warehouse_skus").select("*").order("sku", { ascending: true }).limit(2000);
  if (res.error) throw new Error(res.error.message);
  return (res.data ?? []).map(mapSku);
}

export async function upsertSku(input: { sku: string; name?: string | null; barcode?: string | null; uom?: string | null }): Promise<void> {
  const row = { id: uuid(), sku: input.sku.trim(), name: input.name ?? null, barcode: input.barcode ?? null, uom: input.uom ?? null, updated_at: nowIso() };
  if (!isSupabaseConfigured) {
    const cur = loadLocal<WhSku[]>(LS.skus, []);
    const next = [row as any, ...cur.filter((x) => x.sku !== row.sku)];
    saveLocal(LS.skus, next);
    return;
  }
  const up = await supabase.from("warehouse_skus").upsert(row as any, { onConflict: "sku" as any });
  if (up.error) throw new Error(up.error.message);
}

export async function listLocations(): Promise<WhLocation[]> {
  if (!isSupabaseConfigured) return loadLocal<WhLocation[]>(LS.locs, []);
  const res = await supabase.from("warehouse_locations").select("*").order("code", { ascending: true }).limit(2000);
  if (res.error) throw new Error(res.error.message);
  return (res.data ?? []).map(mapLoc);
}

export async function upsertLocation(input: { code: string; name?: string | null; zone?: string | null; type?: string | null; capacity?: number | null }): Promise<void> {
  const row = { id: uuid(), code: input.code.trim().toUpperCase(), name: input.name ?? null, zone: input.zone ?? null, type: input.type ?? null, capacity: input.capacity ?? null, updated_at: nowIso() };
  if (!isSupabaseConfigured) {
    const cur = loadLocal<WhLocation[]>(LS.locs, []);
    const next = [row as any, ...cur.filter((x) => x.code !== row.code)];
    saveLocal(LS.locs, next);
    return;
  }
  const up = await supabase.from("warehouse_locations").upsert(row as any, { onConflict: "code" as any });
  if (up.error) throw new Error(up.error.message);
}

export async function listInventory(): Promise<WhInventoryRow[]> {
  if (!isSupabaseConfigured) return loadLocal<WhInventoryRow[]>(LS.inv, []);
  try {
    const res = await supabase.from("warehouse_inventory").select("sku,location_code,qty").limit(5000);
    if (res.error) throw new Error(res.error.message);
    return (res.data ?? []).map((r: any) => ({ sku: String(r.sku), location_code: String(r.location_code), qty: Number(r.qty ?? 0) }));
  } catch {
    return [];
  }
}

export async function adjustInventory(input: { sku: string; location_code: string; qty: number; reason: string }): Promise<void> {
  const a = await actor();
  const row = { sku: input.sku.trim(), location_code: input.location_code.trim().toUpperCase(), qty: Number(input.qty || 0) };

  if (!isSupabaseConfigured) {
    const cur = loadLocal<WhInventoryRow[]>(LS.inv, []);
    const idx = cur.findIndex((x) => x.sku === row.sku && x.location_code === row.location_code);
    const next = [...cur];
    if (idx >= 0) next[idx] = { ...next[idx], qty: row.qty };
    else next.unshift({ ...row });
    saveLocal(LS.inv, next);
    return;
  }

  const up = await supabase.from("warehouse_inventory").upsert({ ...row, updated_at: nowIso() } as any, { onConflict: "sku,location_code" as any });
  if (up.error) throw new Error(up.error.message);
  await audit("WH_INV_ADJUST", { ...row, reason: input.reason, actorEmail: a.email });
}

/**
 * Helpers for operational flows: create canonical tasks.
 */
export async function createReceiveTask(input: { reference: string; sku?: string | null; qty?: number | null; note?: string | null; assignedTo?: string | null }) {
  return createTask({
    type: "RECEIVE",
    status: "PENDING",
    reference: input.reference.trim(),
    sku: input.sku ?? null,
    qty: input.qty ?? null,
    from_location: "DOCK",
    to_location: null,
    assigned_to_email: input.assignedTo ?? null,
    note: input.note ?? null,
    meta: { flow: "RECEIVE" },
  });
}

export async function createPutawayTask(input: { reference: string; sku?: string | null; qty?: number | null; fromLoc?: string | null; toLoc?: string | null; assignedTo?: string | null }) {
  return createTask({
    type: "PUTAWAY",
    status: "PENDING",
    reference: input.reference.trim(),
    sku: input.sku ?? null,
    qty: input.qty ?? null,
    from_location: (input.fromLoc ?? "DOCK").toUpperCase(),
    to_location: input.toLoc ? input.toLoc.toUpperCase() : null,
    assigned_to_email: input.assignedTo ?? null,
    note: null,
    meta: { flow: "PUTAWAY" },
  });
}

export async function createPickTask(input: { reference: string; sku: string; qty: number; fromLoc?: string | null; assignedTo?: string | null }) {
  return createTask({
    type: "PICK",
    status: "PENDING",
    reference: input.reference.trim(),
    sku: input.sku.trim(),
    qty: Number(input.qty || 0),
    from_location: (input.fromLoc ?? "STORAGE").toUpperCase(),
    to_location: "PACKING",
    assigned_to_email: input.assignedTo ?? null,
    note: null,
    meta: { flow: "PICK" },
  });
}
EOF

# ------------------------------------------------------------------------------
# 5) Warehouse shell (role-aware, bilingual, full menu)
# ------------------------------------------------------------------------------
cat > "$SHELL" <<'EOF'
import React, { useMemo } from "react";
import { NavLink } from "react-router-dom";
import { PortalShell } from "@/components/layout/PortalShell";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";

const base =
  "block px-4 py-3 rounded-2xl border border-white/10 hover:border-white/20 hover:bg-white/5 text-sm font-semibold";

function isController(role?: string | null) {
  const r = String(role ?? "").toUpperCase().trim();
  return [
    "WAREHOUSE_CONTROLLER",
    "WAREHOUSE_SUPERVISOR",
    "WH_CONTROLLER",
    "WH_SUPERVISOR",
    "WH_CTRL",
    "WH_SUP",
    "SUPERVISOR",
    "OPERATIONS_ADMIN",
    "SUPER_ADMIN",
    "SYS",
    "APP_OWNER",
  ].includes(r);
}

export function WarehouseShell({ title, children }: { title: string; children: React.ReactNode }) {
  const { lang } = useLanguage();
  const { role } = useAuth();
  const t = (en: string, mm: string) => (lang === "en" ? en : mm);

  const ctrl = useMemo(() => isController(role as any), [role]);

  const items = useMemo(() => {
    if (ctrl) {
      return [
        { to: "/portal/warehouse/controller", label: t("Dashboard", "Dashboard") },
        { to: "/portal/warehouse/controller/tasks", label: t("Task Board", "Task Board") },
        { to: "/portal/warehouse/controller/master", label: t("Master Data", "Master Data") },
        { to: "/portal/warehouse/controller/inbound", label: t("Inbound", "Inbound") },
        { to: "/portal/warehouse/controller/outbound", label: t("Outbound", "Outbound") },
        { to: "/portal/warehouse/controller/inventory", label: t("Inventory", "Inventory") },
        { to: "/portal/warehouse/controller/reports", label: t("Reports", "Reports") },
      ];
    }

    return [
      { to: "/portal/warehouse/staff", label: t("My Tasks", "မိမိ Task များ") },
      { to: "/portal/warehouse/staff/inbound", label: t("Inbound Ops", "Inbound Ops") },
      { to: "/portal/warehouse/staff/outbound", label: t("Outbound Ops", "Outbound Ops") },
      { to: "/portal/warehouse/staff/cycle-count", label: t("Cycle Count", "Cycle Count") },
    ];
  }, [ctrl, lang]);

  return (
    <PortalShell title={title}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <aside className="lg:col-span-3">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-3 space-y-2 sticky top-[88px]">
            <div className="text-[10px] font-mono text-white/60 tracking-widest uppercase px-2 py-1">
              {t("Warehouse Menu", "Warehouse မီနူး")}
            </div>

            {items.map((i) => (
              <NavLink
                key={i.to}
                to={i.to}
                className={({ isActive }) => `${base} ${isActive ? "bg-emerald-500/10 border-emerald-500/30" : ""}`}
              >
                {i.label}
              </NavLink>
            ))}
          </div>
        </aside>

        <section className="lg:col-span-9">{children}</section>
      </div>
    </PortalShell>
  );
}

export default WarehouseShell;
EOF

# ------------------------------------------------------------------------------
# 6) Portal redirect by role
# ------------------------------------------------------------------------------
cat > "$PORTAL" <<'EOF'
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { PortalShell } from "@/components/layout/PortalShell";

function isController(role?: string | null) {
  const r = String(role ?? "").toUpperCase().trim();
  return [
    "WAREHOUSE_CONTROLLER",
    "WAREHOUSE_SUPERVISOR",
    "WH_CONTROLLER",
    "WH_SUPERVISOR",
    "WH_CTRL",
    "WH_SUP",
    "SUPERVISOR",
    "OPERATIONS_ADMIN",
    "SUPER_ADMIN",
    "SYS",
    "APP_OWNER",
  ].includes(r);
}

export default function WarehousePortal() {
  const { role } = useAuth();
  const { lang } = useLanguage();
  const nav = useNavigate();
  const t = (en: string, mm: string) => (lang === "en" ? en : mm);

  useEffect(() => {
    nav(isController(role as any) ? "/portal/warehouse/controller" : "/portal/warehouse/staff", { replace: true });
  }, [role]);

  return (
    <PortalShell title={t("Warehouse", "Warehouse")}>
      <div className="p-6 text-white/70 text-sm">{t("Redirecting…", "ပြောင်းနေပါသည်…")}</div>
    </PortalShell>
  );
}
EOF

# ------------------------------------------------------------------------------
# 7) Controller pages
# ------------------------------------------------------------------------------
cat > "$CTRL_DASH" <<'EOF'
import React, { useEffect, useMemo, useState } from "react";
import WarehouseShell from "@/components/layout/WarehouseShell";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, LayoutDashboard } from "lucide-react";
import { listInventory, listLocations, listSkus, listTasks, type WhTask } from "@/services/warehousePlatform";

export default function ControllerDashboard() {
  const { lang } = useLanguage();
  const { user, role } = useAuth();
  const t = (en: string, mm: string) => (lang === "en" ? en : mm);

  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<WhTask[]>([]);
  const [skuCount, setSkuCount] = useState<number>(0);
  const [locCount, setLocCount] = useState<number>(0);
  const [invCount, setInvCount] = useState<number>(0);

  async function refresh() {
    setLoading(true);
    try {
      const [ts, skus, locs, inv] = await Promise.all([listTasks("ALL"), listSkus(), listLocations(), listInventory()]);
      setTasks(ts);
      setSkuCount(skus.length);
      setLocCount(locs.length);
      setInvCount(inv.length);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void refresh(); }, []);

  const kpi = useMemo(() => {
    const total = tasks.length;
    const pending = tasks.filter((x) => x.status === "PENDING").length;
    const inprog = tasks.filter((x) => x.status === "IN_PROGRESS").length;
    const done = tasks.filter((x) => x.status === "COMPLETED").length;
    const inbound = tasks.filter((x) => x.type === "RECEIVE" || x.type === "PUTAWAY").length;
    const outbound = tasks.filter((x) => x.type === "PICK" || x.type === "PACK" || x.type === "DISPATCH").length;
    return { total, pending, inprog, done, inbound, outbound };
  }, [tasks]);

  const title = t("Warehouse Controller", "Warehouse Controller");

  return (
    <WarehouseShell title={title}>
      <div className="space-y-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <LayoutDashboard className="h-5 w-5 text-emerald-300" />
              <div>
                <div className="text-sm font-black tracking-widest uppercase">{t("Controller Dashboard", "Controller Dashboard")}</div>
                <div className="text-xs text-white/60">{(user as any)?.email ?? "—"} • {String(role ?? "NO_ROLE")}</div>
              </div>
            </div>
            <Button variant="outline" className="border-white/10" onClick={() => void refresh()} disabled={loading}>
              <RefreshCw className="h-4 w-4 mr-2" /> {t("Refresh", "ပြန်တင်")}
            </Button>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Card className="bg-[#05080F] border-white/10"><CardContent className="p-4 space-y-2">
            <div className="text-xs font-mono text-white/60 tracking-widest uppercase">{t("Tasks", "Tasks")}</div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="border-white/10">TOTAL {kpi.total}</Badge>
              <Badge variant="outline" className="border-white/10">PENDING {kpi.pending}</Badge>
              <Badge variant="outline" className="border-white/10">IN_PROGRESS {kpi.inprog}</Badge>
              <Badge variant="outline" className="border-white/10">DONE {kpi.done}</Badge>
            </div>
            <div className="text-xs text-white/50">{t("Monitor operational throughput and backlog.", "လုပ်ငန်းအလုပ်များ၏ အလုပ်ကျန်/ပြီးစီးမှုကို စောင့်ကြည့်ပါ။")}</div>
          </CardContent></Card>

          <Card className="bg-[#05080F] border-white/10"><CardContent className="p-4 space-y-2">
            <div className="text-xs font-mono text-white/60 tracking-widest uppercase">{t("Inbound / Outbound", "Inbound / Outbound")}</div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="border-white/10">INBOUND {kpi.inbound}</Badge>
              <Badge variant="outline" className="border-white/10">OUTBOUND {kpi.outbound}</Badge>
            </div>
            <div className="text-xs text-white/50">{t("Control receiving, putaway, pick/pack/dispatch.", "Receiving/Putaway နှင့် Pick/Pack/Dispatch ကို ထိန်းချုပ်ပါ။")}</div>
          </CardContent></Card>

          <Card className="bg-[#05080F] border-white/10"><CardContent className="p-4 space-y-2">
            <div className="text-xs font-mono text-white/60 tracking-widest uppercase">{t("Master + Inventory", "Master + Inventory")}</div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="border-white/10">SKUs {skuCount}</Badge>
              <Badge variant="outline" className="border-white/10">LOC {locCount}</Badge>
              <Badge variant="outline" className="border-white/10">INV ROWS {invCount}</Badge>
            </div>
            <div className="text-xs text-white/50">{t("Maintain SKUs/locations and inventory accuracy.", "SKU/Location နှင့် Stock တိကျမှုကို ထိန်းသိမ်းပါ။")}</div>
          </CardContent></Card>
        </div>
      </div>
    </WarehouseShell>
  );
}
EOF

cat > "$CTRL_TASKS" <<'EOF'
import React, { useEffect, useMemo, useState } from "react";
import WarehouseShell from "@/components/layout/WarehouseShell";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import WarehouseStatusBadge from "@/components/warehouse/WarehouseStatusBadge";
import { assignTask, createTask, listStaffEmails, listTasks, type WhTask, type WhTaskType } from "@/services/warehousePlatform";
import { Plus, RefreshCw, Users } from "lucide-react";

export default function ControllerTaskBoard() {
  const { lang } = useLanguage();
  const { user } = useAuth();
  const t = (en: string, mm: string) => (lang === "en" ? en : mm);

  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<WhTask[]>([]);
  const [staff, setStaff] = useState<string[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("ALL");
  const [type, setType] = useState<string>("ALL");

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({
    type: "RECEIVE" as WhTaskType,
    reference: "",
    sku: "",
    qty: "",
    from: "",
    to: "",
    assigned: "",
    note: "",
  });

  async function refresh() {
    setLoading(true);
    try {
      const [ts, emails] = await Promise.all([listTasks("ALL"), listStaffEmails()]);
      setTasks(ts);
      setStaff(emails);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void refresh(); }, []);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return tasks.filter((x) => {
      if (status !== "ALL" && x.status !== status) return false;
      if (type !== "ALL" && x.type !== type) return false;
      if (!qq) return true;
      const hay = `${x.type} ${x.status} ${x.reference ?? ""} ${x.sku ?? ""} ${x.from_location ?? ""} ${x.to_location ?? ""} ${x.assigned_to_email ?? ""}`.toLowerCase();
      return hay.includes(qq);
    });
  }, [tasks, q, status, type]);

  async function createOne() {
    const qty = draft.qty ? Number(draft.qty) : null;
    await createTask({
      type: draft.type,
      status: "PENDING",
      reference: draft.reference.trim() || null,
      sku: draft.sku.trim() || null,
      qty: Number.isFinite(qty as any) ? qty : null,
      from_location: draft.from.trim() ? draft.from.trim().toUpperCase() : null,
      to_location: draft.to.trim() ? draft.to.trim().toUpperCase() : null,
      assigned_to_email: draft.assigned.trim() || null,
      note: draft.note.trim() || null,
      meta: { createdFrom: "ControllerTaskBoard", actorEmail: (user as any)?.email ?? null },
    });
    setOpen(false);
    setDraft({ type: "RECEIVE", reference: "", sku: "", qty: "", from: "", to: "", assigned: "", note: "" });
    await refresh();
  }

  async function doAssign(taskId: string, email: string | null) {
    await assignTask(taskId, email);
    await refresh();
  }

  return (
    <WarehouseShell title={t("Task Board", "Task Board")}>
      <div className="space-y-4">
        <Card className="bg-white/5 border-white/10"><CardContent className="p-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-emerald-300" />
            <div>
              <div className="text-sm font-black tracking-widest uppercase">{t("Task Board", "Task Board")}</div>
              <div className="text-xs text-white/60">{t("Assign and monitor warehouse tasks.", "Warehouse task များကို တာဝန်ခွဲပြီး စောင့်ကြည့်ပါ။")}</div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="border-white/10" onClick={() => void refresh()} disabled={loading}>
              <RefreshCw className="h-4 w-4 mr-2" /> {t("Refresh", "ပြန်တင်")}
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-500" onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4 mr-2" /> {t("Create", "ဖန်တီး")}
            </Button>
          </div>
        </CardContent></Card>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-6"><Input className="bg-[#05080F] border-white/10" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("Search…", "ရှာရန်…")} /></div>
          <div className="md:col-span-3">
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="bg-[#05080F] border-white/10"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>{["ALL","RECEIVE","PUTAWAY","PICK","PACK","DISPATCH","CYCLE_COUNT","QC_HOLD"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="md:col-span-3">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="bg-[#05080F] border-white/10"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>{["ALL","PENDING","IN_PROGRESS","COMPLETED","HOLD","CANCELLED"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>

        <Card className="bg-[#05080F] border-white/10"><CardContent className="p-0">
          <div className="p-4 border-b border-white/10 text-xs font-mono text-white/60 tracking-widest uppercase">
            {t("All Tasks", "Task အားလုံး")} • {filtered.length}
          </div>

          <div className="overflow-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-white/70">
                <tr>
                  <th className="p-3 text-xs font-mono tracking-widest uppercase">TYPE</th>
                  <th className="p-3 text-xs font-mono tracking-widest uppercase">STATUS</th>
                  <th className="p-3 text-xs font-mono tracking-widest uppercase">REF</th>
                  <th className="p-3 text-xs font-mono tracking-widest uppercase">SKU</th>
                  <th className="p-3 text-xs font-mono tracking-widest uppercase">QTY</th>
                  <th className="p-3 text-xs font-mono tracking-widest uppercase">FROM</th>
                  <th className="p-3 text-xs font-mono tracking-widest uppercase">TO</th>
                  <th className="p-3 text-xs font-mono tracking-widest uppercase">{t("ASSIGNED", "တာဝန်ပေး")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filtered.map((x) => (
                  <tr key={x.id} className="hover:bg-white/5">
                    <td className="p-3 font-semibold text-white">{x.type}</td>
                    <td className="p-3"><WarehouseStatusBadge status={x.status} /></td>
                    <td className="p-3 text-white/80">{x.reference ?? "—"}</td>
                    <td className="p-3 text-white/70">{x.sku ?? "—"}</td>
                    <td className="p-3 text-white/70">{x.qty ?? "—"}</td>
                    <td className="p-3 text-white/70">{x.from_location ?? "—"}</td>
                    <td className="p-3 text-white/70">{x.to_location ?? "—"}</td>
                    <td className="p-3">
                      <Select value={x.assigned_to_email ?? "UNASSIGNED"} onValueChange={(v) => void doAssign(x.id, v === "UNASSIGNED" ? null : v)}>
                        <SelectTrigger className="bg-black/30 border-white/10 h-10"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UNASSIGNED">{t("Unassigned", "မပေးသေး")}</SelectItem>
                          {staff.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </td>
                  </tr>
                ))}
                {!loading && filtered.length === 0 ? <tr><td colSpan={8} className="p-6 text-white/60">{t("No tasks.", "Task မရှိပါ။")}</td></tr> : null}
              </tbody>
            </table>
          </div>
        </CardContent></Card>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="bg-[#05080F] border-white/10 text-white max-w-2xl">
            <DialogHeader><DialogTitle className="font-black tracking-widest uppercase">{t("Create Task", "Task ဖန်တီး")}</DialogTitle></DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <div className="text-[10px] font-mono text-white/60 tracking-widest uppercase">TYPE</div>
                <Select value={draft.type} onValueChange={(v) => setDraft((p) => ({ ...p, type: v as any }))}>
                  <SelectTrigger className="bg-[#0B101B] border-white/10"><SelectValue /></SelectTrigger>
                  <SelectContent>{["RECEIVE","PUTAWAY","PICK","PACK","DISPATCH","CYCLE_COUNT","QC_HOLD"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="text-[10px] font-mono text-white/60 tracking-widest uppercase">{t("ASSIGN TO", "တာဝန်ပေး")}</div>
                <Select value={draft.assigned || "UNASSIGNED"} onValueChange={(v) => setDraft((p) => ({ ...p, assigned: v === "UNASSIGNED" ? "" : v }))}>
                  <SelectTrigger className="bg-[#0B101B] border-white/10"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UNASSIGNED">{t("Unassigned", "မပေးသေး")}</SelectItem>
                    {staff.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="text-[10px] font-mono text-white/60 tracking-widest uppercase">REFERENCE</div>
                <Input className="bg-[#0B101B] border-white/10" value={draft.reference} onChange={(e) => setDraft((p) => ({ ...p, reference: e.target.value }))} />
              </div>

              <div className="space-y-2">
                <div className="text-[10px] font-mono text-white/60 tracking-widest uppercase">SKU</div>
                <Input className="bg-[#0B101B] border-white/10" value={draft.sku} onChange={(e) => setDraft((p) => ({ ...p, sku: e.target.value }))} />
              </div>

              <div className="space-y-2">
                <div className="text-[10px] font-mono text-white/60 tracking-widest uppercase">QTY</div>
                <Input className="bg-[#0B101B] border-white/10" value={draft.qty} onChange={(e) => setDraft((p) => ({ ...p, qty: e.target.value }))} />
              </div>

              <div className="space-y-2">
                <div className="text-[10px] font-mono text-white/60 tracking-widest uppercase">NOTE</div>
                <Input className="bg-[#0B101B] border-white/10" value={draft.note} onChange={(e) => setDraft((p) => ({ ...p, note: e.target.value }))} />
              </div>

              <div className="space-y-2">
                <div className="text-[10px] font-mono text-white/60 tracking-widest uppercase">FROM</div>
                <Input className="bg-[#0B101B] border-white/10" value={draft.from} onChange={(e) => setDraft((p) => ({ ...p, from: e.target.value }))} />
              </div>

              <div className="space-y-2">
                <div className="text-[10px] font-mono text-white/60 tracking-widest uppercase">TO</div>
                <Input className="bg-[#0B101B] border-white/10" value={draft.to} onChange={(e) => setDraft((p) => ({ ...p, to: e.target.value }))} />
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" className="border-white/10" onClick={() => setOpen(false)}>{t("Cancel", "မလုပ်တော့")}</Button>
              <Button className="bg-emerald-600 hover:bg-emerald-500" onClick={() => void createOne()}>{t("Create", "ဖန်တီး")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </WarehouseShell>
  );
}
EOF

cat > "$CTRL_MASTER" <<'EOF'
import React, { useEffect, useMemo, useState } from "react";
import WarehouseShell from "@/components/layout/WarehouseShell";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, Save } from "lucide-react";
import { listLocations, listSkus, upsertLocation, upsertSku, type WhLocation, type WhSku } from "@/services/warehousePlatform";

type Mode = "SKUS" | "LOCATIONS";

export default function ControllerMasterData() {
  const { lang } = useLanguage();
  const t = (en: string, mm: string) => (lang === "en" ? en : mm);

  const [mode, setMode] = useState<Mode>("SKUS");
  const [loading, setLoading] = useState(true);

  const [skus, setSkus] = useState<WhSku[]>([]);
  const [locs, setLocs] = useState<WhLocation[]>([]);

  const [q, setQ] = useState("");

  const [skuDraft, setSkuDraft] = useState({ sku: "", name: "", barcode: "", uom: "" });
  const [locDraft, setLocDraft] = useState({ code: "", name: "", zone: "", type: "STORAGE", capacity: "" });

  async function refresh() {
    setLoading(true);
    try {
      const [s, l] = await Promise.all([listSkus(), listLocations()]);
      setSkus(s);
      setLocs(l);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void refresh(); }, []);

  const filteredSkus = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return skus;
    return skus.filter((x) => `${x.sku} ${x.name ?? ""} ${x.barcode ?? ""}`.toLowerCase().includes(qq));
  }, [skus, q]);

  const filteredLocs = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return locs;
    return locs.filter((x) => `${x.code} ${x.name ?? ""} ${x.zone ?? ""} ${x.type ?? ""}`.toLowerCase().includes(qq));
  }, [locs, q]);

  async function saveSku() {
    if (!skuDraft.sku.trim()) return;
    await upsertSku({ sku: skuDraft.sku, name: skuDraft.name || null, barcode: skuDraft.barcode || null, uom: skuDraft.uom || null });
    setSkuDraft({ sku: "", name: "", barcode: "", uom: "" });
    await refresh();
  }

  async function saveLoc() {
    if (!locDraft.code.trim()) return;
    await upsertLocation({
      code: locDraft.code,
      name: locDraft.name || null,
      zone: locDraft.zone || null,
      type: locDraft.type || null,
      capacity: locDraft.capacity ? Number(locDraft.capacity) : null,
    });
    setLocDraft({ code: "", name: "", zone: "", type: "STORAGE", capacity: "" });
    await refresh();
  }

  return (
    <WarehouseShell title={t("Master Data", "Master Data")}>
      <div className="space-y-4">
        <Card className="bg-white/5 border-white/10"><CardContent className="p-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Select value={mode} onValueChange={(v) => setMode(v as Mode)}>
              <SelectTrigger className="bg-[#05080F] border-white/10 w-[220px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="SKUS">{t("SKUs", "SKUs")}</SelectItem>
                <SelectItem value="LOCATIONS">{t("Locations", "Locations")}</SelectItem>
              </SelectContent>
            </Select>
            <Input className="bg-[#05080F] border-white/10" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("Search…", "ရှာရန်…")} />
          </div>

          <Button variant="outline" className="border-white/10" onClick={() => void refresh()} disabled={loading}>
            <RefreshCw className="h-4 w-4 mr-2" /> {t("Refresh", "ပြန်တင်")}
          </Button>
        </CardContent></Card>

        {mode === "SKUS" ? (
          <Card className="bg-[#05080F] border-white/10"><CardContent className="p-4 space-y-3">
            <div className="text-xs font-mono text-white/60 tracking-widest uppercase">{t("Create/Update SKU", "SKU ဖန်တီး/ပြင်")}</div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <Input className="bg-black/30 border-white/10" placeholder="SKU" value={skuDraft.sku} onChange={(e) => setSkuDraft((p) => ({ ...p, sku: e.target.value }))} />
              <Input className="bg-black/30 border-white/10" placeholder={t("Name", "အမည်")} value={skuDraft.name} onChange={(e) => setSkuDraft((p) => ({ ...p, name: e.target.value }))} />
              <Input className="bg-black/30 border-white/10" placeholder={t("Barcode", "Barcode")} value={skuDraft.barcode} onChange={(e) => setSkuDraft((p) => ({ ...p, barcode: e.target.value }))} />
              <Input className="bg-black/30 border-white/10" placeholder="UOM" value={skuDraft.uom} onChange={(e) => setSkuDraft((p) => ({ ...p, uom: e.target.value }))} />
            </div>
            <Button className="bg-emerald-600 hover:bg-emerald-500" onClick={() => void saveSku()}>
              <Save className="h-4 w-4 mr-2" /> {t("Save SKU", "SKU သိမ်း")}
            </Button>

            <div className="overflow-auto rounded-2xl border border-white/10">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 text-white/70">
                  <tr>
                    <th className="p-3 text-xs font-mono tracking-widest uppercase">SKU</th>
                    <th className="p-3 text-xs font-mono tracking-widest uppercase">{t("NAME", "အမည်")}</th>
                    <th className="p-3 text-xs font-mono tracking-widest uppercase">BARCODE</th>
                    <th className="p-3 text-xs font-mono tracking-widest uppercase">UOM</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filteredSkus.map((x) => (
                    <tr key={x.id} className="hover:bg-white/5">
                      <td className="p-3 font-semibold text-white">{x.sku}</td>
                      <td className="p-3 text-white/70">{x.name ?? "—"}</td>
                      <td className="p-3 text-white/70">{x.barcode ?? "—"}</td>
                      <td className="p-3 text-white/70">{x.uom ?? "—"}</td>
                    </tr>
                  ))}
                  {!loading && filteredSkus.length === 0 ? <tr><td colSpan={4} className="p-6 text-white/60">{t("No SKUs.", "SKU မရှိပါ။")}</td></tr> : null}
                </tbody>
              </table>
            </div>
          </CardContent></Card>
        ) : (
          <Card className="bg-[#05080F] border-white/10"><CardContent className="p-4 space-y-3">
            <div className="text-xs font-mono text-white/60 tracking-widest uppercase">{t("Create/Update Location", "Location ဖန်တီး/ပြင်")}</div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
              <Input className="bg-black/30 border-white/10" placeholder={t("Code", "ကုဒ်")} value={locDraft.code} onChange={(e) => setLocDraft((p) => ({ ...p, code: e.target.value }))} />
              <Input className="bg-black/30 border-white/10" placeholder={t("Name", "အမည်")} value={locDraft.name} onChange={(e) => setLocDraft((p) => ({ ...p, name: e.target.value }))} />
              <Input className="bg-black/30 border-white/10" placeholder={t("Zone", "ဇုန်")} value={locDraft.zone} onChange={(e) => setLocDraft((p) => ({ ...p, zone: e.target.value }))} />
              <Input className="bg-black/30 border-white/10" placeholder={t("Type", "အမျိုးအစား")} value={locDraft.type} onChange={(e) => setLocDraft((p) => ({ ...p, type: e.target.value }))} />
              <Input className="bg-black/30 border-white/10" placeholder={t("Capacity", "စွမ်းရည်")} value={locDraft.capacity} onChange={(e) => setLocDraft((p) => ({ ...p, capacity: e.target.value }))} />
            </div>
            <Button className="bg-emerald-600 hover:bg-emerald-500" onClick={() => void saveLoc()}>
              <Save className="h-4 w-4 mr-2" /> {t("Save Location", "Location သိမ်း")}
            </Button>

            <div className="overflow-auto rounded-2xl border border-white/10">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 text-white/70">
                  <tr>
                    <th className="p-3 text-xs font-mono tracking-widest uppercase">{t("CODE", "ကုဒ်")}</th>
                    <th className="p-3 text-xs font-mono tracking-widest uppercase">{t("NAME", "အမည်")}</th>
                    <th className="p-3 text-xs font-mono tracking-widest uppercase">{t("ZONE", "ဇုန်")}</th>
                    <th className="p-3 text-xs font-mono tracking-widest uppercase">{t("TYPE", "အမျိုးအစား")}</th>
                    <th className="p-3 text-xs font-mono tracking-widest uppercase">{t("CAP", "စွမ်းရည်")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filteredLocs.map((x) => (
                    <tr key={x.id} className="hover:bg-white/5">
                      <td className="p-3 font-semibold text-white">{x.code}</td>
                      <td className="p-3 text-white/70">{x.name ?? "—"}</td>
                      <td className="p-3 text-white/70">{x.zone ?? "—"}</td>
                      <td className="p-3 text-white/70">{x.type ?? "—"}</td>
                      <td className="p-3 text-white/70">{x.capacity ?? "—"}</td>
                    </tr>
                  ))}
                  {!loading && filteredLocs.length === 0 ? <tr><td colSpan={5} className="p-6 text-white/60">{t("No locations.", "Location မရှိပါ။")}</td></tr> : null}
                </tbody>
              </table>
            </div>
          </CardContent></Card>
        )}
      </div>
    </WarehouseShell>
  );
}
EOF

cat > "$CTRL_INBOUND" <<'EOF'
import React, { useEffect, useMemo, useState } from "react";
import WarehouseShell from "@/components/layout/WarehouseShell";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import WarehouseStatusBadge from "@/components/warehouse/WarehouseStatusBadge";
import { listTasks, type WhTask } from "@/services/warehousePlatform";

export default function ControllerInbound() {
  const { lang } = useLanguage();
  const t = (en: string, mm: string) => (lang === "en" ? en : mm);

  const [tasks, setTasks] = useState<WhTask[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    (async () => {
      const all = await listTasks("ALL");
      setTasks(all.filter((x) => x.type === "RECEIVE" || x.type === "PUTAWAY"));
    })();
  }, []);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return tasks;
    return tasks.filter((x) => `${x.type} ${x.reference ?? ""} ${x.sku ?? ""} ${x.assigned_to_email ?? ""}`.toLowerCase().includes(qq));
  }, [tasks, q]);

  return (
    <WarehouseShell title={t("Inbound", "Inbound")}>
      <div className="space-y-4">
        <Card className="bg-white/5 border-white/10"><CardContent className="p-4 flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="text-sm font-black tracking-widest uppercase">{t("Inbound Overview", "Inbound Overview")}</div>
            <div className="text-xs text-white/60">{t("Receiving + Putaway backlog.", "Receiving + Putaway အလုပ်ကျန်။")}</div>
          </div>
          <Badge variant="outline" className="border-white/10">{filtered.length} {t("tasks", "tasks")}</Badge>
        </CardContent></Card>

        <Input className="bg-[#05080F] border-white/10" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("Search…", "ရှာရန်…")} />

        <Card className="bg-[#05080F] border-white/10"><CardContent className="p-0">
          <div className="divide-y divide-white/5">
            {filtered.map((x) => (
              <div key={x.id} className="p-4 flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="font-black text-white">{x.type}</div>
                    <WarehouseStatusBadge status={x.status} />
                    <Badge variant="outline" className="border-white/10">{x.reference ?? "—"}</Badge>
                  </div>
                  <div className="text-sm text-white/70 mt-1">
                    SKU: {x.sku ?? "—"} • QTY: {x.qty ?? "—"} • {t("Assigned", "တာဝန်ပေး")}: {x.assigned_to_email ?? "—"}
                  </div>
                  <div className="text-xs text-white/50 mt-1">
                    {t("From", "မှ")}: {x.from_location ?? "—"} → {t("To", "သို့")}: {x.to_location ?? "—"}
                  </div>
                </div>
              </div>
            ))}
            {filtered.length === 0 ? <div className="p-6 text-white/60">{t("No inbound tasks.", "Inbound task မရှိပါ။")}</div> : null}
          </div>
        </CardContent></Card>
      </div>
    </WarehouseShell>
  );
}
EOF

cat > "$CTRL_OUTBOUND" <<'EOF'
import React, { useEffect, useMemo, useState } from "react";
import WarehouseShell from "@/components/layout/WarehouseShell";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import WarehouseStatusBadge from "@/components/warehouse/WarehouseStatusBadge";
import { listTasks, type WhTask } from "@/services/warehousePlatform";

export default function ControllerOutbound() {
  const { lang } = useLanguage();
  const t = (en: string, mm: string) => (lang === "en" ? en : mm);

  const [tasks, setTasks] = useState<WhTask[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    (async () => {
      const all = await listTasks("ALL");
      setTasks(all.filter((x) => x.type === "PICK" || x.type === "PACK" || x.type === "DISPATCH"));
    })();
  }, []);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return tasks;
    return tasks.filter((x) => `${x.type} ${x.reference ?? ""} ${x.sku ?? ""} ${x.assigned_to_email ?? ""}`.toLowerCase().includes(qq));
  }, [tasks, q]);

  return (
    <WarehouseShell title={t("Outbound", "Outbound")}>
      <div className="space-y-4">
        <Card className="bg-white/5 border-white/10"><CardContent className="p-4 flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="text-sm font-black tracking-widest uppercase">{t("Outbound Overview", "Outbound Overview")}</div>
            <div className="text-xs text-white/60">{t("Pick + Pack + Dispatch backlog.", "Pick + Pack + Dispatch အလုပ်ကျန်။")}</div>
          </div>
          <Badge variant="outline" className="border-white/10">{filtered.length} {t("tasks", "tasks")}</Badge>
        </CardContent></Card>

        <Input className="bg-[#05080F] border-white/10" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("Search…", "ရှာရန်…")} />

        <Card className="bg-[#05080F] border-white/10"><CardContent className="p-0">
          <div className="divide-y divide-white/5">
            {filtered.map((x) => (
              <div key={x.id} className="p-4 flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="font-black text-white">{x.type}</div>
                    <WarehouseStatusBadge status={x.status} />
                    <Badge variant="outline" className="border-white/10">{x.reference ?? "—"}</Badge>
                  </div>
                  <div className="text-sm text-white/70 mt-1">
                    SKU: {x.sku ?? "—"} • QTY: {x.qty ?? "—"} • {t("Assigned", "တာဝန်ပေး")}: {x.assigned_to_email ?? "—"}
                  </div>
                  <div className="text-xs text-white/50 mt-1">
                    {t("From", "မှ")}: {x.from_location ?? "—"} → {t("To", "သို့")}: {x.to_location ?? "—"}
                  </div>
                </div>
              </div>
            ))}
            {filtered.length === 0 ? <div className="p-6 text-white/60">{t("No outbound tasks.", "Outbound task မရှိပါ။")}</div> : null}
          </div>
        </CardContent></Card>
      </div>
    </WarehouseShell>
  );
}
EOF

cat > "$CTRL_INV" <<'EOF'
import React, { useEffect, useMemo, useState } from "react";
import WarehouseShell from "@/components/layout/WarehouseShell";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { adjustInventory, listInventory, type WhInventoryRow } from "@/services/warehousePlatform";
import { Save, RefreshCw } from "lucide-react";

export default function ControllerInventory() {
  const { lang } = useLanguage();
  const t = (en: string, mm: string) => (lang === "en" ? en : mm);

  const [rows, setRows] = useState<WhInventoryRow[]>([]);
  const [q, setQ] = useState("");

  const [draft, setDraft] = useState({ sku: "", location: "", qty: "", reason: "ADJUSTMENT" });

  async function refresh() {
    setRows(await listInventory());
  }

  useEffect(() => { void refresh(); }, []);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return rows;
    return rows.filter((r) => `${r.sku} ${r.location_code}`.toLowerCase().includes(qq));
  }, [rows, q]);

  async function saveAdjust() {
    if (!draft.sku.trim() || !draft.location.trim()) return;
    await adjustInventory({ sku: draft.sku, location_code: draft.location, qty: Number(draft.qty || 0), reason: draft.reason || "ADJUSTMENT" });
    setDraft({ sku: "", location: "", qty: "", reason: "ADJUSTMENT" });
    await refresh();
  }

  return (
    <WarehouseShell title={t("Inventory", "Inventory")}>
      <div className="space-y-4">
        <Card className="bg-white/5 border-white/10"><CardContent className="p-4 flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="text-sm font-black tracking-widest uppercase">{t("Inventory Control", "Inventory Control")}</div>
            <div className="text-xs text-white/60">{t("View and adjust inventory records.", "Stock ကို ကြည့်ပြီး ပြင်ဆင်နိုင်ပါသည်။")}</div>
          </div>
          <Button variant="outline" className="border-white/10" onClick={() => void refresh()}>
            <RefreshCw className="h-4 w-4 mr-2" /> {t("Refresh", "ပြန်တင်")}
          </Button>
        </CardContent></Card>

        <Card className="bg-[#05080F] border-white/10"><CardContent className="p-4 space-y-3">
          <div className="text-xs font-mono text-white/60 tracking-widest uppercase">{t("Adjust Stock", "Stock ပြင်ရန်")}</div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <Input className="bg-black/30 border-white/10" placeholder="SKU" value={draft.sku} onChange={(e) => setDraft((p) => ({ ...p, sku: e.target.value }))} />
            <Input className="bg-black/30 border-white/10" placeholder={t("Location", "Location")} value={draft.location} onChange={(e) => setDraft((p) => ({ ...p, location: e.target.value }))} />
            <Input className="bg-black/30 border-white/10" placeholder="QTY" value={draft.qty} onChange={(e) => setDraft((p) => ({ ...p, qty: e.target.value }))} />
            <Input className="bg-black/30 border-white/10" placeholder={t("Reason", "အကြောင်းရင်း")} value={draft.reason} onChange={(e) => setDraft((p) => ({ ...p, reason: e.target.value }))} />
          </div>
          <Button className="bg-emerald-600 hover:bg-emerald-500" onClick={() => void saveAdjust()}>
            <Save className="h-4 w-4 mr-2" /> {t("Save", "သိမ်း")}
          </Button>
        </CardContent></Card>

        <Input className="bg-[#05080F] border-white/10" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("Search inventory…", "Stock ရှာရန်…")} />

        <Card className="bg-[#05080F] border-white/10"><CardContent className="p-0">
          <div className="overflow-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-white/70">
                <tr>
                  <th className="p-3 text-xs font-mono tracking-widest uppercase">SKU</th>
                  <th className="p-3 text-xs font-mono tracking-widest uppercase">{t("LOCATION", "LOCATION")}</th>
                  <th className="p-3 text-xs font-mono tracking-widest uppercase">QTY</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filtered.map((r, i) => (
                  <tr key={`${r.sku}_${r.location_code}_${i}`} className="hover:bg-white/5">
                    <td className="p-3 font-semibold text-white">{r.sku}</td>
                    <td className="p-3 text-white/70">{r.location_code}</td>
                    <td className="p-3 text-white/70">{r.qty}</td>
                  </tr>
                ))}
                {filtered.length === 0 ? <tr><td colSpan={3} className="p-6 text-white/60">{t("No inventory rows.", "Stock row မရှိပါ။")}</td></tr> : null}
              </tbody>
            </table>
          </div>
        </CardContent></Card>
      </div>
    </WarehouseShell>
  );
}
EOF

cat > "$CTRL_REPORTS" <<'EOF'
import React, { useEffect, useMemo, useState } from "react";
import WarehouseShell from "@/components/layout/WarehouseShell";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw } from "lucide-react";
import * as XLSX from "xlsx";
import { listInventory, listTasks, type WhTask } from "@/services/warehousePlatform";

export default function ControllerReports() {
  const { lang } = useLanguage();
  const t = (en: string, mm: string) => (lang === "en" ? en : mm);

  const [tasks, setTasks] = useState<WhTask[]>([]);
  const [inv, setInv] = useState<any[]>([]);

  async function refresh() {
    const [ts, iv] = await Promise.all([listTasks("ALL"), listInventory()]);
    setTasks(ts);
    setInv(iv);
  }

  useEffect(() => { void refresh(); }, []);

  const headersTasks = useMemo(() => (lang === "en"
    ? ["TYPE","STATUS","REFERENCE","SKU","QTY","FROM","TO","ASSIGNED","CREATED_AT"]
    : ["TYPE","STATUS","REFERENCE","SKU","QTY","FROM","TO","ASSIGNED","CREATED_AT"]), [lang]);

  const headersInv = useMemo(() => (lang === "en"
    ? ["SKU","LOCATION","QTY"]
    : ["SKU","LOCATION","QTY"]), [lang]);

  function exportTasks() {
    const aoa = [
      headersTasks,
      ...tasks.map((x) => [
        x.type, x.status, x.reference ?? "", x.sku ?? "", x.qty ?? "", x.from_location ?? "", x.to_location ?? "", x.assigned_to_email ?? "", x.created_at,
      ]),
    ];
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "TASKS");
    XLSX.writeFile(wb, `warehouse_tasks_${new Date().toISOString().slice(0,10)}.xlsx`);
  }

  function exportInventory() {
    const aoa = [
      headersInv,
      ...inv.map((r: any) => [r.sku, r.location_code, r.qty]),
    ];
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "INVENTORY");
    XLSX.writeFile(wb, `warehouse_inventory_${new Date().toISOString().slice(0,10)}.xlsx`);
  }

  return (
    <WarehouseShell title={t("Reports", "Reports")}>
      <div className="space-y-4">
        <Card className="bg-white/5 border-white/10"><CardContent className="p-4 flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="text-sm font-black tracking-widest uppercase">{t("Exports", "Exports")}</div>
            <div className="text-xs text-white/60">{t("Export tasks and inventory to Excel.", "Task နှင့် Stock ကို Excel ထုတ်နိုင်သည်။")}</div>
          </div>
          <Button variant="outline" className="border-white/10" onClick={() => void refresh()}>
            <RefreshCw className="h-4 w-4 mr-2" /> {t("Refresh", "ပြန်တင်")}
          </Button>
        </CardContent></Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Card className="bg-[#05080F] border-white/10"><CardContent className="p-4 space-y-3">
            <div className="text-xs font-mono text-white/60 tracking-widest uppercase">{t("Tasks Export", "Tasks Export")}</div>
            <div className="text-sm text-white/70">{tasks.length} rows</div>
            <Button className="bg-emerald-600 hover:bg-emerald-500" onClick={exportTasks}>
              <Download className="h-4 w-4 mr-2" /> {t("Download Tasks XLSX", "Tasks XLSX ဒေါင်း")}
            </Button>
          </CardContent></Card>

          <Card className="bg-[#05080F] border-white/10"><CardContent className="p-4 space-y-3">
            <div className="text-xs font-mono text-white/60 tracking-widest uppercase">{t("Inventory Export", "Inventory Export")}</div>
            <div className="text-sm text-white/70">{inv.length} rows</div>
            <Button className="bg-sky-600 hover:bg-sky-500" onClick={exportInventory}>
              <Download className="h-4 w-4 mr-2" /> {t("Download Inventory XLSX", "Stock XLSX ဒေါင်း")}
            </Button>
          </CardContent></Card>
        </div>
      </div>
    </WarehouseShell>
  );
}
EOF

# ------------------------------------------------------------------------------
# 8) Staff pages (tasks + inbound/outbound + cycle count + offline sync)
# ------------------------------------------------------------------------------
cat > "$STAFF_HOME" <<'EOF'
import React, { useEffect, useMemo, useState } from "react";
import WarehouseShell from "@/components/layout/WarehouseShell";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import WarehouseStatusBadge from "@/components/warehouse/WarehouseStatusBadge";
import { listTasks, setTaskStatus, type WhTask } from "@/services/warehousePlatform";
import { enqueueWhAction, loadWhQueue, syncWhQueue } from "@/lib/warehouseOfflineQueue";
import { RefreshCw, CloudOff, CheckCircle2, PauseCircle, PlayCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function StaffHome() {
  const { lang } = useLanguage();
  const { user } = useAuth();
  const t = (en: string, mm: string) => (lang === "en" ? en : mm);

  const [tasks, setTasks] = useState<WhTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [queue, setQueue] = useState<number>(0);
  const [syncing, setSyncing] = useState(false);

  async function refresh() {
    setLoading(true);
    try {
      setTasks(await listTasks("MINE"));
      setQueue(loadWhQueue().length);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void refresh(); }, []);

  async function applyStatus(id: string, status: any) {
    try {
      await setTaskStatus(id, status);
      await refresh();
    } catch {
      enqueueWhAction({ kind: status === "IN_PROGRESS" ? "TASK_START" : status === "HOLD" ? "TASK_HOLD" : "TASK_COMPLETE", taskId: id, payload: { status, at: new Date().toISOString() } });
      await refresh();
    }
  }

  async function syncNow() {
    setSyncing(true);
    try {
      await syncWhQueue({
        onStart: async (taskId, payload) => setTaskStatus(taskId, "IN_PROGRESS", String(payload.note ?? "")),
        onHold: async (taskId, payload) => setTaskStatus(taskId, "HOLD", String(payload.note ?? "")),
        onComplete: async (taskId, payload) => setTaskStatus(taskId, "COMPLETED", String(payload.note ?? "")),
        onOp: async () => {},
      });
    } finally {
      setSyncing(false);
      await refresh();
    }
  }

  const kpi = useMemo(() => {
    const pending = tasks.filter((x) => x.status === "PENDING").length;
    const inprog = tasks.filter((x) => x.status === "IN_PROGRESS").length;
    return { pending, inprog };
  }, [tasks]);

  return (
    <WarehouseShell title={t("Warehouse Staff", "Warehouse Staff")}>
      <div className="space-y-4">
        <Card className="bg-white/5 border-white/10"><CardContent className="p-4 flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="text-sm font-black tracking-widest uppercase">{t("My Tasks", "မိမိ Task များ")}</div>
            <div className="text-xs text-white/60">{(user as any)?.email ?? "—"}</div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="border-white/10">PENDING {kpi.pending}</Badge>
            <Badge variant="outline" className="border-white/10">IN_PROGRESS {kpi.inprog}</Badge>
            <Badge variant="outline" className={queue ? "border-amber-500/30 text-amber-300 bg-amber-500/10" : "border-white/10 text-white/60"}>
              {queue ? `${queue} queued` : "queue=0"}
            </Badge>
            <Button className="bg-emerald-600 hover:bg-emerald-500" onClick={() => void syncNow()} disabled={syncing}>
              <RefreshCw className={"h-4 w-4 mr-2 " + (syncing ? "animate-spin" : "")} />
              {t("Sync", "Sync")}
            </Button>
            <Button variant="outline" className="border-white/10" onClick={() => void refresh()} disabled={loading}>
              <RefreshCw className="h-4 w-4 mr-2" /> {t("Refresh", "ပြန်တင်")}
            </Button>
          </div>
        </CardContent></Card>

        <Card className="bg-[#05080F] border-white/10"><CardContent className="p-0">
          <div className="divide-y divide-white/5">
            {loading ? (
              <div className="p-6 text-white/60">{t("Loading…", "ရယူနေပါသည်…")}</div>
            ) : tasks.length === 0 ? (
              <div className="p-6 text-white/60">{t("No tasks assigned.", "Task မပေးသေးပါ။")}</div>
            ) : (
              tasks.map((x) => (
                <div key={x.id} className="p-4 flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="font-black text-white">{x.type}</div>
                      <WarehouseStatusBadge status={x.status} />
                      {x.reference ? <Badge variant="outline" className="border-white/10">{x.reference}</Badge> : null}
                      {!navigator.onLine ? <Badge variant="outline" className="border-rose-500/30 text-rose-300 bg-rose-500/10"><CloudOff className="h-3 w-3 mr-1" /> offline</Badge> : null}
                    </div>
                    <div className="text-sm text-white/70 mt-1">SKU: {x.sku ?? "—"} • QTY: {x.qty ?? "—"}</div>
                    <div className="text-xs text-white/50 mt-1">FROM: {x.from_location ?? "—"} → TO: {x.to_location ?? "—"}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" className="border-white/10" onClick={() => void applyStatus(x.id, "IN_PROGRESS")} disabled={x.status === "COMPLETED"}>
                      <PlayCircle className="h-4 w-4 mr-2" /> {t("Start", "စလုပ်")}
                    </Button>
                    <Button variant="outline" className="border-white/10" onClick={() => void applyStatus(x.id, "HOLD")} disabled={x.status === "COMPLETED"}>
                      <PauseCircle className="h-4 w-4 mr-2" /> {t("Hold", "ခဏရပ်")}
                    </Button>
                    <Button className="bg-emerald-600 hover:bg-emerald-500" onClick={() => void applyStatus(x.id, "COMPLETED")} disabled={x.status === "COMPLETED"}>
                      <CheckCircle2 className="h-4 w-4 mr-2" /> {t("Complete", "ပြီးဆုံး")}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent></Card>
      </div>
    </WarehouseShell>
  );
}
EOF

cat > "$STAFF_INBOUND" <<'EOF'
import React, { useMemo, useState } from "react";
import WarehouseShell from "@/components/layout/WarehouseShell";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import WarehouseScanInput from "@/components/warehouse/WarehouseScanInput";
import { createPutawayTask, createReceiveTask, setTaskStatus } from "@/services/warehousePlatform";
import { enqueueWhAction } from "@/lib/warehouseOfflineQueue";
import { toast } from "@/components/ui/use-toast";

function norm(s: string) { return s.trim().toUpperCase(); }

export default function StaffInbound() {
  const { lang } = useLanguage();
  const { user } = useAuth();
  const t = (en: string, mm: string) => (lang === "en" ? en : mm);

  const [awb, setAwb] = useState("");
  const [sku, setSku] = useState("");
  const [qty, setQty] = useState("1");
  const [toLoc, setToLoc] = useState("");

  const canCreate = useMemo(() => Boolean(awb.trim()), [awb]);

  async function receive() {
    if (!awb.trim()) return;
    try {
      const task = await createReceiveTask({ reference: awb, sku: sku || null, qty: Number(qty || 1), note: `Received by ${(user as any)?.email ?? "staff"}`, assignedTo: (user as any)?.email ?? null });
      await setTaskStatus(task.id, "COMPLETED");
      toast({ title: t("Received", "လက်ခံပြီး"), description: `AWB=${awb}` });
    } catch {
      enqueueWhAction({ kind: "RECEIVE", payload: { awb, sku, qty: Number(qty || 1), at: new Date().toISOString() } });
      toast({ title: t("Queued offline", "Offline queue ထဲထည့်ပြီး"), description: `AWB=${awb}`, variant: "destructive" as any });
    }
    setAwb(""); setSku(""); setQty("1");
  }

  async function createPutaway() {
    if (!awb.trim() || !toLoc.trim()) return;
    try {
      await createPutawayTask({ reference: awb, sku: sku || null, qty: Number(qty || 1), fromLoc: "DOCK", toLoc: toLoc, assignedTo: (user as any)?.email ?? null });
      toast({ title: t("Putaway task created", "Putaway task ဖန်တီးပြီး"), description: `AWB=${awb} → ${toLoc}` });
    } catch {
      enqueueWhAction({ kind: "PUTAWAY", payload: { awb, sku, qty: Number(qty || 1), toLoc, at: new Date().toISOString() } });
      toast({ title: t("Queued offline", "Offline queue ထဲထည့်ပြီး"), description: `PUTAWAY ${awb} → ${toLoc}`, variant: "destructive" as any });
    }
    setAwb(""); setToLoc(""); setSku(""); setQty("1");
  }

  return (
    <WarehouseShell title={t("Inbound Ops", "Inbound Ops")}>
      <div className="space-y-4">
        <Card className="bg-white/5 border-white/10"><CardContent className="p-4 space-y-1">
          <div className="text-sm font-black tracking-widest uppercase">{t("Receive & Putaway", "Receive & Putaway")}</div>
          <div className="text-xs text-white/60">{t("Scan AWB → receive → create putaway.", "AWB စကန် → လက်ခံ → putaway ဖန်တီး")}</div>
        </CardContent></Card>

        <Card className="bg-[#05080F] border-white/10"><CardContent className="p-4 space-y-3">
          <WarehouseScanInput label={t("Scan AWB / Waybill", "AWB / Waybill စကန်")} onValue={(v) => setAwb(norm(v))} normalize={norm} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <Input className="bg-black/30 border-white/10" placeholder="SKU (optional)" value={sku} onChange={(e) => setSku(e.target.value)} />
            <Input className="bg-black/30 border-white/10" placeholder="QTY" value={qty} onChange={(e) => setQty(e.target.value)} />
            <Input className="bg-black/30 border-white/10" placeholder={t("TO Location (Putaway)", "TO Location (Putaway)")} value={toLoc} onChange={(e) => setToLoc(e.target.value)} />
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button className="bg-emerald-600 hover:bg-emerald-500" disabled={!canCreate} onClick={() => void receive()}>
              {t("Receive (Complete)", "လက်ခံ (ပြီးဆုံး)")}
            </Button>
            <Button className="bg-sky-600 hover:bg-sky-500" disabled={!awb.trim() || !toLoc.trim()} onClick={() => void createPutaway()}>
              {t("Create Putaway Task", "Putaway Task ဖန်တီး")}
            </Button>
          </div>

          {awb ? <div className="text-xs text-white/50">AWB: {awb}</div> : null}
        </CardContent></Card>
      </div>
    </WarehouseShell>
  );
}
EOF

cat > "$STAFF_OUTBOUND" <<'EOF'
import React, { useMemo, useState } from "react";
import WarehouseShell from "@/components/layout/WarehouseShell";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import WarehouseScanInput from "@/components/warehouse/WarehouseScanInput";
import { createPickTask, createTask, setTaskStatus } from "@/services/warehousePlatform";
import { enqueueWhAction } from "@/lib/warehouseOfflineQueue";
import { toast } from "@/components/ui/use-toast";

function norm(s: string) { return s.trim().toUpperCase(); }

export default function StaffOutbound() {
  const { lang } = useLanguage();
  const { user } = useAuth();
  const t = (en: string, mm: string) => (lang === "en" ? en : mm);

  const [ref, setRef] = useState(""); // order/awb/batch
  const [sku, setSku] = useState("");
  const [qty, setQty] = useState("1");
  const [fromLoc, setFromLoc] = useState("STORAGE");

  const canPick = useMemo(() => Boolean(ref.trim() && sku.trim() && Number(qty || 0) > 0), [ref, sku, qty]);

  async function createPick() {
    try {
      await createPickTask({ reference: ref, sku: sku, qty: Number(qty || 1), fromLoc, assignedTo: (user as any)?.email ?? null });
      toast({ title: t("Pick task created", "Pick task ဖန်တီးပြီး"), description: `${ref} • ${sku} x${qty}` });
    } catch {
      enqueueWhAction({ kind: "PICK", payload: { ref, sku, qty: Number(qty || 1), fromLoc, at: new Date().toISOString() } });
      toast({ title: t("Queued offline", "Offline queue ထဲထည့်ပြီး"), description: `PICK ${ref}`, variant: "destructive" as any });
    }
  }

  async function pack() {
    if (!ref.trim()) return;
    try {
      const task = await createTask({ type: "PACK", status: "PENDING", reference: ref, sku: null, qty: null, from_location: "PACKING", to_location: "DISPATCH", assigned_to_email: (user as any)?.email ?? null, note: null, meta: { flow: "PACK" } });
      await setTaskStatus(task.id, "COMPLETED");
      toast({ title: t("Packed", "Pack ပြီး"), description: ref });
    } catch {
      enqueueWhAction({ kind: "PACK", payload: { ref, at: new Date().toISOString() } });
      toast({ title: t("Queued offline", "Offline queue ထဲထည့်ပြီး"), description: `PACK ${ref}`, variant: "destructive" as any });
    }
  }

  async function dispatch() {
    if (!ref.trim()) return;
    try {
      const task = await createTask({ type: "DISPATCH", status: "PENDING", reference: ref, sku: null, qty: null, from_location: "DISPATCH", to_location: "OUT", assigned_to_email: (user as any)?.email ?? null, note: null, meta: { flow: "DISPATCH" } });
      await setTaskStatus(task.id, "COMPLETED");
      toast({ title: t("Dispatched", "Dispatch ပြီး"), description: ref });
    } catch {
      enqueueWhAction({ kind: "DISPATCH", payload: { ref, at: new Date().toISOString() } });
      toast({ title: t("Queued offline", "Offline queue ထဲထည့်ပြီး"), description: `DISPATCH ${ref}`, variant: "destructive" as any });
    }
  }

  return (
    <WarehouseShell title={t("Outbound Ops", "Outbound Ops")}>
      <div className="space-y-4">
        <Card className="bg-white/5 border-white/10"><CardContent className="p-4 space-y-1">
          <div className="text-sm font-black tracking-widest uppercase">{t("Pick / Pack / Dispatch", "Pick / Pack / Dispatch")}</div>
          <div className="text-xs text-white/60">{t("Scan reference → pick items → pack → dispatch.", "Reference စကန် → pick → pack → dispatch")}</div>
        </CardContent></Card>

        <Card className="bg-[#05080F] border-white/10"><CardContent className="p-4 space-y-3">
          <WarehouseScanInput label={t("Scan Order/AWB Reference", "Order/AWB Reference စကန်")} onValue={(v) => setRef(norm(v))} normalize={norm} />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <Input className="bg-black/30 border-white/10" placeholder="SKU" value={sku} onChange={(e) => setSku(e.target.value)} />
            <Input className="bg-black/30 border-white/10" placeholder="QTY" value={qty} onChange={(e) => setQty(e.target.value)} />
            <Input className="bg-black/30 border-white/10" placeholder={t("From Location", "From Location")} value={fromLoc} onChange={(e) => setFromLoc(e.target.value)} />
            <div className="text-xs text-white/50 flex items-center">{ref ? `REF: ${ref}` : ""}</div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button className="bg-emerald-600 hover:bg-emerald-500" disabled={!canPick} onClick={() => void createPick()}>
              {t("Create Pick Task", "Pick Task ဖန်တီး")}
            </Button>
            <Button className="bg-sky-600 hover:bg-sky-500" disabled={!ref.trim()} onClick={() => void pack()}>
              {t("Pack (Complete)", "Pack (ပြီးဆုံး)")}
            </Button>
            <Button className="bg-amber-600 hover:bg-amber-500" disabled={!ref.trim()} onClick={() => void dispatch()}>
              {t("Dispatch (Complete)", "Dispatch (ပြီးဆုံး)")}
            </Button>
          </div>
        </CardContent></Card>
      </div>
    </WarehouseShell>
  );
}
EOF

cat > "$STAFF_CYCLE" <<'EOF'
import React, { useMemo, useState } from "react";
import WarehouseShell from "@/components/layout/WarehouseShell";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import WarehouseScanInput from "@/components/warehouse/WarehouseScanInput";
import { adjustInventory } from "@/services/warehousePlatform";
import { enqueueWhAction } from "@/lib/warehouseOfflineQueue";
import { toast } from "@/components/ui/use-toast";

function norm(s: string) { return s.trim().toUpperCase(); }

export default function StaffCycleCount() {
  const { lang } = useLanguage();
  const t = (en: string, mm: string) => (lang === "en" ? en : mm);

  const [location, setLocation] = useState("");
  const [sku, setSku] = useState("");
  const [counted, setCounted] = useState("0");

  const canSubmit = useMemo(() => Boolean(location.trim() && sku.trim()), [location, sku]);

  async function submit() {
    try {
      await adjustInventory({ sku, location_code: location, qty: Number(counted || 0), reason: "CYCLE_COUNT" });
      toast({ title: t("Saved", "သိမ်းပြီး"), description: `${sku} @ ${location} = ${counted}` });
    } catch {
      enqueueWhAction({ kind: "CYCLE_COUNT", payload: { sku, location, counted: Number(counted || 0), at: new Date().toISOString() } });
      toast({ title: t("Queued offline", "Offline queue ထဲထည့်ပြီး"), description: `${sku} @ ${location}`, variant: "destructive" as any });
    }
    setSku(""); setCounted("0");
  }

  return (
    <WarehouseShell title={t("Cycle Count", "Cycle Count")}>
      <div className="space-y-4">
        <Card className="bg-white/5 border-white/10"><CardContent className="p-4 space-y-1">
          <div className="text-sm font-black tracking-widest uppercase">{t("Cycle Count", "Cycle Count")}</div>
          <div className="text-xs text-white/60">{t("Scan location + SKU, enter counted qty.", "Location + SKU စကန်၊ qty ထည့်ပါ။")}</div>
        </CardContent></Card>

        <Card className="bg-[#05080F] border-white/10"><CardContent className="p-4 space-y-3">
          <WarehouseScanInput label={t("Scan Location Code", "Location code စကန်")} onValue={(v) => setLocation(norm(v))} normalize={norm} />
          <WarehouseScanInput label={t("Scan SKU / Barcode", "SKU / Barcode စကန်")} onValue={(v) => setSku(norm(v))} normalize={norm} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <Input className="bg-black/30 border-white/10" placeholder={t("Counted Qty", "ရေတွက် qty")} value={counted} onChange={(e) => setCounted(e.target.value)} />
            <div className="text-xs text-white/50 flex items-center">{location ? `LOC: ${location}` : ""}</div>
          </div>

          <Button className="bg-emerald-600 hover:bg-emerald-500" disabled={!canSubmit} onClick={() => void submit()}>
            {t("Submit Count", "Count တင်မည်")}
          </Button>
        </CardContent></Card>
      </div>
    </WarehouseShell>
  );
}
EOF

# ------------------------------------------------------------------------------
# 9) Patch App.tsx (best-effort) to add imports and routes
# ------------------------------------------------------------------------------
python3 - <<'PY'
from pathlib import Path
import re

p = Path("src/App.tsx")
if not p.exists():
    print("[warn] src/App.tsx not found. Add routes manually.")
    raise SystemExit(0)

s = p.read_text(encoding="utf-8", errors="ignore")

def add_import(symbol, path):
    global s
    if re.search(rf"\b{re.escape(symbol)}\b", s):
        return
    imports = list(re.finditer(r"^import .*;$", s, flags=re.M))
    if imports:
        idx = imports[-1].end()
        s = s[:idx] + f'\nimport {symbol} from "{path}";' + s[idx:]
    else:
        s = f'import {symbol} from "{path}";\n' + s

add_import("WarehousePortal", "@/pages/portals/WarehousePortal")
add_import("ControllerDashboard", "@/pages/portals/warehouse/ControllerDashboard")
add_import("ControllerTaskBoard", "@/pages/portals/warehouse/ControllerTaskBoard")
add_import("ControllerMasterData", "@/pages/portals/warehouse/ControllerMasterData")
add_import("ControllerInbound", "@/pages/portals/warehouse/ControllerInbound")
add_import("ControllerOutbound", "@/pages/portals/warehouse/ControllerOutbound")
add_import("ControllerInventory", "@/pages/portals/warehouse/ControllerInventory")
add_import("ControllerReports", "@/pages/portals/warehouse/ControllerReports")
add_import("StaffHome", "@/pages/portals/warehouse/StaffHome")
add_import("StaffInbound", "@/pages/portals/warehouse/StaffInbound")
add_import("StaffOutbound", "@/pages/portals/warehouse/StaffOutbound")
add_import("StaffCycleCount", "@/pages/portals/warehouse/StaffCycleCount")

# ensure /portal/warehouse route uses WarehousePortal
if re.search(r'path="/portal/warehouse"\s+element=\{<WarehousePortal', s) is None:
    # replace existing warehouse element if present
    s = re.sub(r'path="/portal/warehouse"\s+element=\{\s*<[^}]*>\s*\}\s*/>', 'path="/portal/warehouse" element={<WarehousePortal />} />', s)

# add new routes if missing
if "/portal/warehouse/controller" not in s:
    insert = """
              <Route path="/portal/warehouse" element={<WarehousePortal />} />
              <Route
                path="/portal/warehouse/controller"
                element={
                  <RequireRole allow={["WAREHOUSE_CONTROLLER","WAREHOUSE_SUPERVISOR","WH_CONTROLLER","WH_SUPERVISOR","WH_CTRL","WH_SUP","SUPERVISOR","OPERATIONS_ADMIN","SUPER_ADMIN","SYS","APP_OWNER"]}>
                    <ControllerDashboard />
                  </RequireRole>
                }
              />
              <Route
                path="/portal/warehouse/controller/tasks"
                element={
                  <RequireRole allow={["WAREHOUSE_CONTROLLER","WAREHOUSE_SUPERVISOR","WH_CONTROLLER","WH_SUPERVISOR","WH_CTRL","WH_SUP","SUPERVISOR","OPERATIONS_ADMIN","SUPER_ADMIN","SYS","APP_OWNER"]}>
                    <ControllerTaskBoard />
                  </RequireRole>
                }
              />
              <Route
                path="/portal/warehouse/controller/master"
                element={
                  <RequireRole allow={["WAREHOUSE_CONTROLLER","WAREHOUSE_SUPERVISOR","WH_CONTROLLER","WH_SUPERVISOR","WH_CTRL","WH_SUP","SUPERVISOR","OPERATIONS_ADMIN","SUPER_ADMIN","SYS","APP_OWNER"]}>
                    <ControllerMasterData />
                  </RequireRole>
                }
              />
              <Route
                path="/portal/warehouse/controller/inbound"
                element={
                  <RequireRole allow={["WAREHOUSE_CONTROLLER","WAREHOUSE_SUPERVISOR","WH_CONTROLLER","WH_SUPERVISOR","WH_CTRL","WH_SUP","SUPERVISOR","OPERATIONS_ADMIN","SUPER_ADMIN","SYS","APP_OWNER"]}>
                    <ControllerInbound />
                  </RequireRole>
                }
              />
              <Route
                path="/portal/warehouse/controller/outbound"
                element={
                  <RequireRole allow={["WAREHOUSE_CONTROLLER","WAREHOUSE_SUPERVISOR","WH_CONTROLLER","WH_SUPERVISOR","WH_CTRL","WH_SUP","SUPERVISOR","OPERATIONS_ADMIN","SUPER_ADMIN","SYS","APP_OWNER"]}>
                    <ControllerOutbound />
                  </RequireRole>
                }
              />
              <Route
                path="/portal/warehouse/controller/inventory"
                element={
                  <RequireRole allow={["WAREHOUSE_CONTROLLER","WAREHOUSE_SUPERVISOR","WH_CONTROLLER","WH_SUPERVISOR","WH_CTRL","WH_SUP","SUPERVISOR","OPERATIONS_ADMIN","SUPER_ADMIN","SYS","APP_OWNER"]}>
                    <ControllerInventory />
                  </RequireRole>
                }
              />
              <Route
                path="/portal/warehouse/controller/reports"
                element={
                  <RequireRole allow={["WAREHOUSE_CONTROLLER","WAREHOUSE_SUPERVISOR","WH_CONTROLLER","WH_SUPERVISOR","WH_CTRL","WH_SUP","SUPERVISOR","OPERATIONS_ADMIN","SUPER_ADMIN","SYS","APP_OWNER"]}>
                    <ControllerReports />
                  </RequireRole>
                }
              />

              <Route
                path="/portal/warehouse/staff"
                element={
                  <RequireRole allow={["WAREHOUSE_STAFF","WH_STAFF","STAFF","WAREHOUSE","SUPER_ADMIN","SYS","APP_OWNER"]}>
                    <StaffHome />
                  </RequireRole>
                }
              />
              <Route
                path="/portal/warehouse/staff/inbound"
                element={
                  <RequireRole allow={["WAREHOUSE_STAFF","WH_STAFF","STAFF","WAREHOUSE","SUPER_ADMIN","SYS","APP_OWNER"]}>
                    <StaffInbound />
                  </RequireRole>
                }
              />
              <Route
                path="/portal/warehouse/staff/outbound"
                element={
                  <RequireRole allow={["WAREHOUSE_STAFF","WH_STAFF","STAFF","WAREHOUSE","SUPER_ADMIN","SYS","APP_OWNER"]}>
                    <StaffOutbound />
                  </RequireRole>
                }
              />
              <Route
                path="/portal/warehouse/staff/cycle-count"
                element={
                  <RequireRole allow={["WAREHOUSE_STAFF","WH_STAFF","STAFF","WAREHOUSE","SUPER_ADMIN","SYS","APP_OWNER"]}>
                    <StaffCycleCount />
                  </RequireRole>
                }
              />
"""
    # insert before catch-all route
    s = s.replace('<Route path="*" element={<Navigate to="/login" replace />} />',
                  insert + '\n              <Route path="*" element={<Navigate to="/login" replace />} />')

p.write_text(s, encoding="utf-8")
print("[ok] App.tsx patched with warehouse platform routes (best-effort).")
PY

# ------------------------------------------------------------------------------
# Install deps
# ------------------------------------------------------------------------------
if command -v npm >/dev/null 2>&1; then
  npm install
else
  echo "⚠️ npm not found. Run: npm install"
fi

git add \
  "$PKG" \
  "$SHELL" "$BADGE" "$SCAN" \
  "$OFFLINE" "$SERVICE" \
  "$PORTAL" \
  "$CTRL_DASH" "$CTRL_TASKS" "$CTRL_MASTER" "$CTRL_INBOUND" "$CTRL_OUTBOUND" "$CTRL_INV" "$CTRL_REPORTS" \
  "$STAFF_HOME" "$STAFF_INBOUND" "$STAFF_OUTBOUND" "$STAFF_CYCLE" \
  "$APP" 2>/dev/null || true

echo "✅ Warehouse Platform created."
echo "Next:"
echo "  npm run dev"
echo "Commit:"
echo "  git commit -m \"feat(warehouse): enterprise platform (controller+staff, bilingual, offline, reports)\""
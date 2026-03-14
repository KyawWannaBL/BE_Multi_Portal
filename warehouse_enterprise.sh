#!/usr/bin/env bash
set -euo pipefail

# ==============================================================================
# WAREHOUSE ENTERPRISE PATCH
# ✅ Controller Putaway Rules CRUD (EN/MM) + Reorder + Activate/Deactivate
# ✅ Capacity hard-stop for bin selection (block GRN + QC release if no bin fits)
#
# ENV (Vite):
#   VITE_WAREHOUSE_CAPACITY_HARD_STOP=true
#
# Optional Supabase table (if present; otherwise localStorage fallback):
#   warehouse_putaway_rules(
#     id uuid/text PK,
#     created_at timestamptz,
#     updated_at timestamptz,
#     priority int,
#     active boolean,
#     sku_prefix text,
#     sku_regex text,
#     zone text,
#     location_type text,
#     note text,
#     meta jsonb
#   )
# ==============================================================================

backup(){ [[ -f "$1" ]] && cp -f "$1" "$1.bak.$(date +%Y%m%d_%H%M%S)" || true; }

SVC="src/services/warehousePlatform.ts"
SHELL="src/components/layout/WarehouseShell.tsx"
CTRL_RULES="src/pages/portals/warehouse/ControllerPutawayRules.tsx"
CTRL_QC="src/pages/portals/warehouse/ControllerQCHold.tsx"
STAFF_INBOUND="src/pages/portals/warehouse/StaffInbound.tsx"
APP="src/App.tsx"

mkdir -p \
  "$(dirname "$SVC")" \
  "$(dirname "$SHELL")" \
  "$(dirname "$CTRL_RULES")" \
  "$(dirname "$CTRL_QC")" \
  "$(dirname "$STAFF_INBOUND")" \
  "$(dirname "$APP")"

backup "$SVC" "$SHELL" "$CTRL_RULES" "$CTRL_QC" "$STAFF_INBOUND" "$APP"

# ------------------------------------------------------------------------------
# 1) Consolidated warehousePlatform service (keeps all features + adds rules/hardstop)
# ------------------------------------------------------------------------------
cat > "$SVC" <<'EOF'
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

/* =========================
   Types
   ========================= */
export type WhTaskType = "RECEIVE" | "PUTAWAY" | "PICK" | "PACK" | "DISPATCH" | "CYCLE_COUNT" | "QC_HOLD";
export type WhTaskStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "HOLD" | "CANCELLED";

export type WhTask = {
  id: string;
  created_at: string;
  updated_at?: string | null;

  type: WhTaskType;
  status: WhTaskStatus;

  reference: string | null;
  sku: string | null;
  qty: number | null;

  from_location: string | null;
  to_location: string | null;

  assigned_to_email: string | null;
  note: string | null;
  meta?: Record<string, unknown> | null;
};

export type WhSku = { id: string; sku: string; name: string | null; barcode: string | null; uom: string | null; meta?: Record<string, unknown> | null };
export type WhLocation = { id: string; code: string; name: string | null; zone: string | null; type: string | null; capacity: number | null; meta?: Record<string, unknown> | null };
export type WhInventoryRow = { sku: string; location_code: string; qty: number };

export type AsnStatus = "DRAFT" | "SENT" | "RECEIVED" | "CLOSED" | "CANCELLED";
export type GrnStatus = "RECEIVED" | "QC_HOLD" | "RELEASED" | "REJECTED";

export type WarehouseASN = {
  id: string;
  created_at: string;
  updated_at?: string | null;
  status: AsnStatus;
  vendor: string | null;
  eta: string | null;
  reference: string;
  note: string | null;
  meta?: Record<string, unknown> | null;
};

export type WarehouseASNLine = { id: string; asn_id: string; sku: string; expected_qty: number; meta?: Record<string, unknown> | null };

export type WarehouseGRN = {
  id: string;
  created_at: string;
  updated_at?: string | null;
  status: GrnStatus;
  reference: string;
  asn_id: string | null;
  note: string | null;
  meta?: Record<string, unknown> | null;
};

export type WarehouseGRNLine = { id: string; grn_id: string; sku: string; expected_qty: number | null; received_qty: number; meta?: Record<string, unknown> | null };

export type AsnReceiptSuggestion = { sku: string; expectedQty: number; alreadyReceivedQty: number; remainingQty: number; receivedQty: number };

export type PutawayRule = {
  id: string;
  priority: number;
  active: boolean;
  sku_prefix: string | null;
  sku_regex: string | null;
  zone: string | null;
  location_type: string | null;
  note: string | null;
  updated_at?: string | null;
};

/* =========================
   Local storage keys
   ========================= */
const LS = {
  tasks: "wh_tasks_v2",
  skus: "wh_skus_v1",
  locs: "wh_locs_v1",
  inv: "wh_inv_v1",
  asns: "wh_asns_v1",
  asnLines: "wh_asn_lines_v1",
  grns: "wh_grns_v1",
  grnLines: "wh_grn_lines_v1",
  rules: "wh_putaway_rules_v2",
};

function uuid() {
  const c: any = globalThis.crypto;
  return c?.randomUUID ? c.randomUUID() : `wh_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}
function nowIso() { return new Date().toISOString(); }
function safeJson<T>(raw: string | null, fallback: T): T { try { return raw ? (JSON.parse(raw) as T) : fallback; } catch { return fallback; } }
function loadLocal<T>(key: string, fallback: T): T { if (typeof window === "undefined") return fallback; return safeJson<T>(window.localStorage.getItem(key), fallback); }
function saveLocal<T>(key: string, value: T) { if (typeof window === "undefined") return; window.localStorage.setItem(key, JSON.stringify(value)); }

function U(v: any) { return String(v ?? "").trim().toUpperCase(); }
function N(v: any) { const x = Number(v); return Number.isFinite(x) ? x : 0; }

function envBool(name: string, def = false) {
  const v = (import.meta as any)?.env?.[name];
  if (v == null) return def;
  return String(v).toLowerCase() === "true";
}

const HARD_STOP = envBool("VITE_WAREHOUSE_CAPACITY_HARD_STOP", false);

async function actor() {
  try {
    const { data } = await supabase.auth.getSession();
    const u = data?.session?.user;
    return { email: u?.email ?? null, id: u?.id ?? null };
  } catch {
    return { email: null, id: null };
  }
}

async function audit(event_type: string, metadata: Record<string, unknown>) {
  if (!isSupabaseConfigured) return;
  try { await supabase.from("audit_logs").insert({ event_type, user_id: null, metadata } as any); } catch {}
}

/* =========================
   Putaway Rules CRUD (Supabase if exists, else localStorage)
   ========================= */
function defaultRules(): PutawayRule[] {
  return [
    { id: "r1", priority: 10, active: true, sku_prefix: "FRZ", sku_regex: null, zone: "FREEZER", location_type: null, note: "Frozen" },
    { id: "r2", priority: 20, active: true, sku_prefix: "CHL", sku_regex: null, zone: "CHILL", location_type: null, note: "Chilled" },
    { id: "r3", priority: 30, active: true, sku_prefix: "HAZ", sku_regex: null, zone: "HAZMAT", location_type: null, note: "Hazard" },
    { id: "r4", priority: 99, active: true, sku_prefix: null, sku_regex: ".*", zone: "GENERAL", location_type: null, note: "Default" },
  ];
}

export async function listPutawayRules(): Promise<PutawayRule[]> {
  // Supabase first
  if (isSupabaseConfigured) {
    try {
      const res = await supabase
        .from("warehouse_putaway_rules")
        .select("*")
        .order("priority", { ascending: true })
        .limit(2000);

      if (!res.error) {
        const rows = (res.data ?? []).map((r: any) => ({
          id: String(r.id),
          priority: N(r.priority ?? 999),
          active: Boolean(r.active ?? true),
          sku_prefix: r.sku_prefix ?? null,
          sku_regex: r.sku_regex ?? null,
          zone: r.zone ?? null,
          location_type: r.location_type ?? null,
          note: r.note ?? null,
          updated_at: r.updated_at ?? null,
        })) as PutawayRule[];

        if (rows.length) return rows;
      }
    } catch {
      // fall back
    }
  }

  const local = loadLocal<PutawayRule[]>(LS.rules, []);
  if (Array.isArray(local) && local.length) return [...local].sort((a, b) => a.priority - b.priority);

  const def = defaultRules();
  saveLocal(LS.rules, def);
  return def;
}

export async function upsertPutawayRule(input: Omit<PutawayRule, "updated_at">): Promise<PutawayRule> {
  const row: PutawayRule = { ...input, updated_at: nowIso() };

  if (isSupabaseConfigured) {
    try {
      const res = await supabase
        .from("warehouse_putaway_rules")
        .upsert(
          {
            id: row.id,
            priority: row.priority,
            active: row.active,
            sku_prefix: row.sku_prefix,
            sku_regex: row.sku_regex,
            zone: row.zone,
            location_type: row.location_type,
            note: row.note,
            updated_at: row.updated_at,
          } as any,
          { onConflict: "id" as any }
        );

      if (!res.error) return row;
    } catch {
      // fallback
    }
  }

  const cur = loadLocal<PutawayRule[]>(LS.rules, defaultRules());
  const next = [row, ...cur.filter((x) => x.id !== row.id)].sort((a, b) => a.priority - b.priority);
  saveLocal(LS.rules, next);
  return row;
}

export async function deletePutawayRule(id: string): Promise<void> {
  if (isSupabaseConfigured) {
    try {
      const res = await supabase.from("warehouse_putaway_rules").delete().eq("id", id);
      if (!res.error) return;
    } catch {
      // fallback
    }
  }
  const cur = loadLocal<PutawayRule[]>(LS.rules, defaultRules());
  saveLocal(LS.rules, cur.filter((x) => x.id !== id));
}

export async function savePutawayRuleOrder(rules: PutawayRule[]): Promise<void> {
  const normalized = rules.map((r, idx) => ({ ...r, priority: (idx + 1) * 10 }));
  if (isSupabaseConfigured) {
    try {
      const payload = normalized.map((r) => ({
        id: r.id,
        priority: r.priority,
        active: r.active,
        sku_prefix: r.sku_prefix,
        sku_regex: r.sku_regex,
        zone: r.zone,
        location_type: r.location_type,
        note: r.note,
        updated_at: nowIso(),
      }));
      const res = await supabase.from("warehouse_putaway_rules").upsert(payload as any, { onConflict: "id" as any });
      if (!res.error) return;
    } catch {
      // fallback
    }
  }
  saveLocal(LS.rules, normalized);
}

function ruleMatches(sku: string, r: PutawayRule) {
  const s = U(sku);
  if (!r.active) return false;
  if (r.sku_prefix && s.startsWith(U(r.sku_prefix))) return true;
  if (r.sku_regex) {
    try {
      const re = new RegExp(r.sku_regex, "i");
      return re.test(s);
    } catch {
      return false;
    }
  }
  return false;
}

async function pickRule(sku: string): Promise<PutawayRule | null> {
  const rules = await listPutawayRules();
  for (const r of rules.sort((a, b) => a.priority - b.priority)) {
    if (ruleMatches(sku, r)) return r;
  }
  return null;
}

/* =========================
   Tasks
   ========================= */
function mapTask(r: any): WhTask {
  return {
    id: String(r?.id ?? ""),
    created_at: String(r?.created_at ?? nowIso()),
    updated_at: r?.updated_at ?? null,
    type: U(r?.type || "RECEIVE") as WhTaskType,
    status: U(r?.status || "PENDING") as WhTaskStatus,
    reference: r?.reference ?? r?.ref ?? null,
    sku: r?.sku ?? null,
    qty: r?.qty ?? null,
    from_location: r?.from_location ?? null,
    to_location: r?.to_location ?? null,
    assigned_to_email: r?.assigned_to_email ?? null,
    note: r?.note ?? null,
    meta: r?.meta ?? null,
  };
}

export async function listTasks(scope: "ALL" | "MINE"): Promise<WhTask[]> {
  const { email } = await actor();

  if (!isSupabaseConfigured) {
    const tasks = loadLocal<WhTask[]>(LS.tasks, []);
    const all = [...tasks].sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
    return scope === "ALL" ? all : all.filter((t) => (t.assigned_to_email ?? "") === (email ?? ""));
  }

  let q = supabase.from("warehouse_tasks").select("*").order("created_at", { ascending: false }).limit(1500);
  if (scope === "MINE" && email) q = q.eq("assigned_to_email" as any, email);
  const res = await q;
  if (res.error) throw new Error(res.error.message);
  return (res.data ?? []).map(mapTask);
}

async function getTaskById(taskId: string): Promise<WhTask | null> {
  if (!taskId) return null;
  if (!isSupabaseConfigured) {
    const cur = loadLocal<WhTask[]>(LS.tasks, []);
    return cur.find((x) => x.id === taskId) ?? null;
  }
  const res = await supabase.from("warehouse_tasks").select("*").eq("id", taskId).limit(1);
  if (res.error) throw new Error(res.error.message);
  return res.data?.[0] ? mapTask(res.data[0]) : null;
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
  await audit("WH_TASK_CREATED", { taskId: t.id, type: t.type, reference: t.reference, actorEmail: a.email ?? null });
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
  await audit("WH_TASK_STATUS", { taskId: id, status, actorEmail: a.email ?? null });
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
  await audit("WH_TASK_ASSIGNED", { taskId: id, assignedToEmail, actorEmail: a.email ?? null });
}

export async function listStaffEmails(): Promise<string[]> {
  if (!isSupabaseConfigured) return [];
  try {
    const roles = ["WAREHOUSE_STAFF","WH_STAFF","STAFF","WAREHOUSE","WAREHOUSE_SUPERVISOR","WH_SUPERVISOR"];
    const res = await supabase.from("profiles").select("email, role").in("role" as any, roles as any).limit(800);
    if (res.error) return [];
    const emails = (res.data ?? []).map((r: any) => String(r?.email ?? "").trim()).filter(Boolean);
    return Array.from(new Set(emails)).sort();
  } catch {
    return [];
  }
}

/* =========================
   Master Data (SKUs + Locations)
   ========================= */
function mapSku(r: any): WhSku {
  return {
    id: String(r?.id ?? ""),
    sku: String(r?.sku ?? ""),
    name: r?.name ?? null,
    barcode: r?.barcode ?? null,
    uom: r?.uom ?? null,
    meta: r?.meta ?? null,
  };
}
function mapLoc(r: any): WhLocation {
  return {
    id: String(r?.id ?? ""),
    code: U(r?.code ?? ""),
    name: r?.name ?? null,
    zone: r?.zone ? U(r.zone) : null,
    type: r?.type ? U(r.type) : null,
    capacity: r?.capacity ?? null,
    meta: r?.meta ?? null,
  };
}

export async function listSkus(): Promise<WhSku[]> {
  if (!isSupabaseConfigured) return loadLocal<WhSku[]>(LS.skus, []);
  const res = await supabase.from("warehouse_skus").select("*").order("sku", { ascending: true }).limit(2500);
  if (res.error) throw new Error(res.error.message);
  return (res.data ?? []).map(mapSku);
}

export async function upsertSku(input: { sku: string; name?: string | null; barcode?: string | null; uom?: string | null }): Promise<void> {
  const row = { id: uuid(), sku: U(input.sku), name: input.name ?? null, barcode: input.barcode ?? null, uom: input.uom ?? null, updated_at: nowIso() };
  if (!isSupabaseConfigured) {
    const cur = loadLocal<WhSku[]>(LS.skus, []);
    saveLocal(LS.skus, [row as any, ...cur.filter((x) => U(x.sku) !== row.sku)]);
    return;
  }
  const up = await supabase.from("warehouse_skus").upsert(row as any, { onConflict: "sku" as any });
  if (up.error) throw new Error(up.error.message);
}

export async function listLocations(): Promise<WhLocation[]> {
  if (!isSupabaseConfigured) return loadLocal<WhLocation[]>(LS.locs, []);
  const res = await supabase.from("warehouse_locations").select("*").order("code", { ascending: true }).limit(3000);
  if (res.error) throw new Error(res.error.message);
  return (res.data ?? []).map(mapLoc);
}

export async function upsertLocation(input: { code: string; name?: string | null; zone?: string | null; type?: string | null; capacity?: number | null }): Promise<void> {
  const row = { id: uuid(), code: U(input.code), name: input.name ?? null, zone: input.zone ? U(input.zone) : null, type: input.type ? U(input.type) : null, capacity: input.capacity ?? null, updated_at: nowIso() };
  if (!isSupabaseConfigured) {
    const cur = loadLocal<WhLocation[]>(LS.locs, []);
    saveLocal(LS.locs, [row as any, ...cur.filter((x) => U(x.code) !== row.code)]);
    return;
  }
  const up = await supabase.from("warehouse_locations").upsert(row as any, { onConflict: "code" as any });
  if (up.error) throw new Error(up.error.message);
}

/* =========================
   Inventory
   ========================= */
export async function listInventory(): Promise<WhInventoryRow[]> {
  if (!isSupabaseConfigured) return loadLocal<WhInventoryRow[]>(LS.inv, []);
  try {
    const res = await supabase.from("warehouse_inventory").select("sku,location_code,qty").limit(8000);
    if (res.error) throw new Error(res.error.message);
    return (res.data ?? []).map((r: any) => ({ sku: U(r.sku), location_code: U(r.location_code), qty: N(r.qty) }));
  } catch {
    return [];
  }
}

export async function adjustInventory(input: { sku: string; location_code: string; qty: number; reason: string }): Promise<void> {
  const a = await actor();
  const row = { sku: U(input.sku), location_code: U(input.location_code), qty: Math.max(0, N(input.qty)) };

  if (!isSupabaseConfigured) {
    const cur = loadLocal<WhInventoryRow[]>(LS.inv, []);
    const idx = cur.findIndex((x) => U(x.sku) === row.sku && U(x.location_code) === row.location_code);
    const next = [...cur];
    if (idx >= 0) next[idx] = { ...next[idx], qty: row.qty, sku: row.sku, location_code: row.location_code };
    else next.unshift({ ...row });
    saveLocal(LS.inv, next);
    return;
  }

  const up = await supabase.from("warehouse_inventory").upsert({ ...row, updated_at: nowIso() } as any, { onConflict: "sku,location_code" as any });
  if (up.error) throw new Error(up.error.message);
  await audit("WH_INV_SET", { ...row, reason: input.reason, actorEmail: a.email ?? null });
}

async function getInvQty(sku: string, location: string): Promise<number> {
  const s = U(sku);
  const loc = U(location);

  if (!isSupabaseConfigured) {
    const cur = loadLocal<WhInventoryRow[]>(LS.inv, []);
    return N(cur.find((x) => U(x.sku) === s && U(x.location_code) === loc)?.qty ?? 0);
  }

  try {
    const res = await supabase.from("warehouse_inventory").select("qty").eq("sku" as any, s).eq("location_code" as any, loc).limit(1);
    if (res.error) return 0;
    return N(res.data?.[0]?.qty ?? 0);
  } catch {
    return 0;
  }
}

export async function moveInventoryDelta(input: { sku: string; from_location: string; to_location: string; qty: number; reason: string }) {
  const a = await actor();
  const sku = U(input.sku);
  const fromLoc = U(input.from_location);
  const toLoc = U(input.to_location);
  const qty = Math.max(0, N(input.qty));

  const fromCur = await getInvQty(sku, fromLoc);
  const toCur = await getInvQty(sku, toLoc);
  const fromNext = Math.max(0, fromCur - qty);
  const toNext = toCur + qty;

  await adjustInventory({ sku, location_code: fromLoc, qty: fromNext, reason: `${input.reason}_FROM` });
  await adjustInventory({ sku, location_code: toLoc, qty: toNext, reason: `${input.reason}_TO` });

  await audit("WH_INV_MOVE", { sku, from_location: fromLoc, to_location: toLoc, qty, from_before: fromCur, from_after: fromNext, to_before: toCur, to_after: toNext, reason: input.reason, actorEmail: a.email ?? null });
  return { fromQty: fromNext, toQty: toNext };
}

/* =========================
   Bin suggestion (rules + capacity hard-stop)
   ========================= */
export async function suggestPutawayLocation(input: { sku?: string | null; qty?: number | null; preferZone?: string | null }): Promise<string | null> {
  const sku = U(input.sku ?? "");
  const qty = Math.max(1, N(input.qty ?? 1));

  const rule = input.preferZone ? { zone: U(input.preferZone) } as PutawayRule : await pickRule(sku);

  const [locs, inv] = await Promise.all([listLocations(), listInventory().catch(() => [])]);

  const invByLoc: Record<string, number> = {};
  for (const r of inv) invByLoc[U(r.location_code)] = (invByLoc[U(r.location_code)] ?? 0) + N(r.qty);

  const candidates = locs
    .filter((l) => l.code)
    .filter((l) => {
      const type = U(l.type ?? "STORAGE");
      const typeOk = type.includes("STORAGE") || type.includes("BIN") || type.includes("RACK");
      const zoneOk = rule?.zone ? U(l.zone ?? "") === U(rule.zone) : true;
      const locTypeOk = rule?.location_type ? U(l.type ?? "") === U(rule.location_type) : true;
      return typeOk && zoneOk && locTypeOk;
    })
    .map((l) => {
      const code = U(l.code);
      const used = invByLoc[code] ?? 0;
      const cap = l.capacity != null ? N(l.capacity) : null;
      const free = cap != null ? cap - used : null;
      return { code, used, cap, free };
    });

  if (!candidates.length) {
    return HARD_STOP ? null : (locs.map((l) => U(l.code)).sort()[0] ?? null);
  }

  const withCap = candidates.filter((c) => c.cap != null && c.free != null);
  const anyUnknownCap = candidates.some((c) => c.cap == null);

  const canFit = withCap.filter((c) => (c.free as number) >= qty);

  const pickBest = (arr: typeof candidates) =>
    [...arr].sort((a, b) => {
      const fa = a.free ?? -1;
      const fb = b.free ?? -1;
      if (fb !== fa) return fb - fa;
      if (a.used !== b.used) return a.used - b.used;
      return a.code.localeCompare(b.code);
    })[0]?.code ?? null;

  if (canFit.length) return pickBest(canFit);

  // Hard stop only when capacity is KNOWN for all candidates and none fits.
  if (HARD_STOP && !anyUnknownCap && withCap.length > 0) return null;

  // If capacity unknown exists, we cannot prove "no fit" -> choose deterministic
  if (anyUnknownCap) return candidates.map((c) => c.code).sort()[0] ?? null;

  // capacity known but none fits and hard-stop disabled -> choose max-free
  if (withCap.length) return pickBest(withCap);

  return candidates.map((c) => c.code).sort()[0] ?? null;
}

/* =========================
   Flow helpers
   ========================= */
export async function createReceiveTask(input: { reference: string; sku?: string | null; qty?: number | null; note?: string | null; assignedTo?: string | null }) {
  return createTask({
    type: "RECEIVE",
    status: "PENDING",
    reference: U(input.reference),
    sku: input.sku ? U(input.sku) : null,
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
    reference: U(input.reference),
    sku: input.sku ? U(input.sku) : null,
    qty: input.qty ?? null,
    from_location: U(input.fromLoc ?? "DOCK"),
    to_location: input.toLoc ? U(input.toLoc) : null,
    assigned_to_email: input.assignedTo ?? null,
    note: null,
    meta: { flow: "PUTAWAY" },
  });
}

export async function completeWarehouseTask(taskId: string, note?: string | null): Promise<void> {
  const a = await actor();
  const task = await getTaskById(taskId);
  if (!task) throw new Error("TASK_NOT_FOUND");

  await setTaskStatus(taskId, "COMPLETED", note ?? null);

  if (task.type === "PUTAWAY") {
    const sku = U(task.sku ?? "");
    const qty = N(task.qty ?? 0);
    const fromLoc = U(task.from_location ?? "");
    const toLoc = U(task.to_location ?? "");
    if (sku && qty > 0 && fromLoc && toLoc) {
      await moveInventoryDelta({ sku, from_location: fromLoc, to_location: toLoc, qty, reason: "PUTAWAY_COMPLETE" });
      await audit("WH_PUTAWAY_POSTED", { taskId, sku, qty, fromLoc, toLoc, actorEmail: a.email ?? null });
    }
  }
}

/* =========================
   ASN / GRN (partial receipt + close rules)
   ========================= */
function mapAsn(r: any): WarehouseASN {
  return {
    id: String(r?.id ?? ""),
    created_at: String(r?.created_at ?? nowIso()),
    updated_at: r?.updated_at ?? null,
    status: U(r?.status || "DRAFT") as AsnStatus,
    vendor: r?.vendor ?? null,
    eta: r?.eta ?? null,
    reference: String(r?.reference ?? ""),
    note: r?.note ?? null,
    meta: r?.meta ?? null,
  };
}
function mapAsnLine(r: any): WarehouseASNLine {
  return { id: String(r?.id ?? ""), asn_id: String(r?.asn_id ?? ""), sku: U(r?.sku ?? ""), expected_qty: N(r?.expected_qty ?? 0), meta: r?.meta ?? null };
}
function mapGrn(r: any): WarehouseGRN {
  return { id: String(r?.id ?? ""), created_at: String(r?.created_at ?? nowIso()), updated_at: r?.updated_at ?? null, status: U(r?.status || "RECEIVED") as GrnStatus, reference: String(r?.reference ?? ""), asn_id: r?.asn_id ?? null, note: r?.note ?? null, meta: r?.meta ?? null };
}
function mapGrnLine(r: any): WarehouseGRNLine {
  return { id: String(r?.id ?? ""), grn_id: String(r?.grn_id ?? ""), sku: U(r?.sku ?? ""), expected_qty: r?.expected_qty ?? null, received_qty: N(r?.received_qty ?? 0), meta: r?.meta ?? null };
}

export async function listASNs(): Promise<WarehouseASN[]> {
  if (!isSupabaseConfigured) return loadLocal<WarehouseASN[]>(LS.asns, []);
  const res = await supabase.from("warehouse_asns").select("*").order("created_at", { ascending: false }).limit(1500);
  if (res.error) throw new Error(res.error.message);
  return (res.data ?? []).map(mapAsn);
}

export async function listASNLines(asnId: string): Promise<WarehouseASNLine[]> {
  if (!isSupabaseConfigured) return loadLocal<WarehouseASNLine[]>(LS.asnLines, []).filter((x) => x.asn_id === asnId);
  const res = await supabase.from("warehouse_asn_lines").select("*").eq("asn_id" as any, asnId).limit(8000);
  if (res.error) throw new Error(res.error.message);
  return (res.data ?? []).map(mapAsnLine);
}

export async function createASN(input: { vendor?: string | null; eta?: string | null; reference: string; note?: string | null }): Promise<WarehouseASN> {
  const a = await actor();
  const asn: WarehouseASN = { id: uuid(), created_at: nowIso(), updated_at: nowIso(), status: "DRAFT", vendor: input.vendor ?? null, eta: input.eta ?? null, reference: input.reference.trim(), note: input.note ?? null, meta: { actorEmail: a.email ?? null } };

  if (!isSupabaseConfigured) {
    const cur = loadLocal<WarehouseASN[]>(LS.asns, []);
    saveLocal(LS.asns, [asn, ...cur]);
    return asn;
  }

  const ins = await supabase.from("warehouse_asns").insert(asn as any);
  if (ins.error) throw new Error(ins.error.message);
  await audit("WH_ASN_CREATED", { asnId: asn.id, reference: asn.reference, actorEmail: a.email ?? null });
  return asn;
}

export async function addASNLine(input: { asnId: string; sku: string; expectedQty: number }): Promise<WarehouseASNLine> {
  const line: WarehouseASNLine = { id: uuid(), asn_id: input.asnId, sku: U(input.sku), expected_qty: N(input.expectedQty), meta: null };

  if (!isSupabaseConfigured) {
    const cur = loadLocal<WarehouseASNLine[]>(LS.asnLines, []);
    saveLocal(LS.asnLines, [line, ...cur]);
    return line;
  }

  const ins = await supabase.from("warehouse_asn_lines").insert(line as any);
  if (ins.error) throw new Error(ins.error.message);
  return line;
}

export async function setASNStatus(asnId: string, status: AsnStatus): Promise<void> {
  const a = await actor();
  if (!isSupabaseConfigured) {
    const cur = loadLocal<WarehouseASN[]>(LS.asns, []);
    saveLocal(LS.asns, cur.map((x) => (x.id === asnId ? { ...x, status, updated_at: nowIso() } : x)));
    return;
  }
  const upd = await supabase.from("warehouse_asns").update({ status, updated_at: nowIso() } as any).eq("id", asnId);
  if (upd.error) throw new Error(upd.error.message);
  await audit("WH_ASN_STATUS", { asnId, status, actorEmail: a.email ?? null });
}

export async function listGRNs(): Promise<WarehouseGRN[]> {
  if (!isSupabaseConfigured) return loadLocal<WarehouseGRN[]>(LS.grns, []);
  const res = await supabase.from("warehouse_grns").select("*").order("created_at", { ascending: false }).limit(1500);
  if (res.error) throw new Error(res.error.message);
  return (res.data ?? []).map(mapGrn);
}

export async function listGRNLines(grnId: string): Promise<WarehouseGRNLine[]> {
  if (!isSupabaseConfigured) return loadLocal<WarehouseGRNLine[]>(LS.grnLines, []).filter((x) => x.grn_id === grnId);
  const res = await supabase.from("warehouse_grn_lines").select("*").eq("grn_id" as any, grnId).limit(8000);
  if (res.error) throw new Error(res.error.message);
  return (res.data ?? []).map(mapGrnLine);
}

export async function setGRNStatus(grnId: string, status: GrnStatus): Promise<void> {
  const a = await actor();
  if (!isSupabaseConfigured) {
    const cur = loadLocal<WarehouseGRN[]>(LS.grns, []);
    saveLocal(LS.grns, cur.map((x) => (x.id === grnId ? { ...x, status, updated_at: nowIso() } : x)));
    return;
  }
  const upd = await supabase.from("warehouse_grns").update({ status, updated_at: nowIso() } as any).eq("id", grnId);
  if (upd.error) throw new Error(upd.error.message);
  await audit("WH_GRN_STATUS", { grnId, status, actorEmail: a.email ?? null });
}

async function asnReceivedTotals(asnId: string): Promise<Record<string, number>> {
  const totals: Record<string, number> = {};
  if (!asnId) return totals;

  if (!isSupabaseConfigured) {
    const grns = loadLocal<WarehouseGRN[]>(LS.grns, []).filter((g) => g.asn_id === asnId);
    const lines = loadLocal<WarehouseGRNLine[]>(LS.grnLines, []);
    const ids = new Set(grns.map((g) => g.id));
    for (const l of lines) {
      if (!ids.has(l.grn_id)) continue;
      totals[U(l.sku)] = (totals[U(l.sku)] ?? 0) + N(l.received_qty);
    }
    return totals;
  }

  const g = await supabase.from("warehouse_grns").select("id").eq("asn_id" as any, asnId).limit(2500);
  if (g.error) return totals;
  const ids = (g.data ?? []).map((x: any) => String(x.id)).filter(Boolean);
  if (!ids.length) return totals;

  const l = await supabase.from("warehouse_grn_lines").select("sku,received_qty,grn_id").in("grn_id" as any, ids as any).limit(8000);
  if (l.error) return totals;
  for (const r of l.data ?? []) {
    totals[U((r as any).sku)] = (totals[U((r as any).sku)] ?? 0) + N((r as any).received_qty);
  }
  return totals;
}

export async function suggestReceiptLinesFromASN(asnId: string): Promise<AsnReceiptSuggestion[]> {
  const lines = await listASNLines(asnId);
  const totals = await asnReceivedTotals(asnId);
  return lines.map((l) => {
    const sku = U(l.sku);
    const expectedQty = N(l.expected_qty);
    const alreadyReceivedQty = N(totals[sku] ?? 0);
    const remainingQty = Math.max(0, expectedQty - alreadyReceivedQty);
    return { sku, expectedQty, alreadyReceivedQty, remainingQty, receivedQty: 0 };
  }).filter((x) => x.sku);
}

async function qcHoldsForAsn(asnId: string): Promise<WhTask[]> {
  if (!asnId) return [];
  const all = await listTasks("ALL");
  return all.filter((t) => t.type === "QC_HOLD" && String((t.meta as any)?.asnId ?? "") === asnId);
}

async function allQcReleased(asnId: string): Promise<boolean> {
  const holds = await qcHoldsForAsn(asnId);
  if (!holds.length) return true;
  return holds.every((t) => String((t.meta as any)?.qcDecision ?? "").toUpperCase() === "RELEASE");
}

export async function recomputeAsnLifecycle(asnId: string): Promise<AsnStatus> {
  const suggestions = await suggestReceiptLinesFromASN(asnId);
  const remainingTotal = suggestions.reduce((s, x) => s + Math.max(0, x.remainingQty), 0);

  if (remainingTotal > 0) {
    await setASNStatus(asnId, "SENT");
    return "SENT";
  }

  const qcOk = await allQcReleased(asnId);
  const status: AsnStatus = qcOk ? "CLOSED" : "RECEIVED";
  await setASNStatus(asnId, status);
  return status;
}

export async function createGRN(input: {
  reference: string;
  asnId?: string | null;
  note?: string | null;
  lines: Array<{ sku: string; receivedQty: number; expectedQty?: number | null }>;
  status?: GrnStatus;
}): Promise<WarehouseGRN> {
  const a = await actor();
  const asnId = input.asnId ?? null;

  const grn: WarehouseGRN = {
    id: uuid(),
    created_at: nowIso(),
    updated_at: nowIso(),
    status: input.status ?? "RECEIVED",
    reference: U(input.reference),
    asn_id: asnId,
    note: input.note ?? null,
    meta: { actorEmail: a.email ?? null },
  };

  const grnLines: WarehouseGRNLine[] = input.lines
    .map((l) => ({
      id: uuid(),
      grn_id: grn.id,
      sku: U(l.sku),
      expected_qty: l.expectedQty ?? null,
      received_qty: Math.max(0, N(l.receivedQty)),
      meta: null,
    }))
    .filter((l) => l.sku && l.received_qty > 0);

  if (!isSupabaseConfigured) {
    const cur = loadLocal<WarehouseGRN[]>(LS.grns, []);
    const curLines = loadLocal<WarehouseGRNLine[]>(LS.grnLines, []);
    saveLocal(LS.grns, [grn, ...cur]);
    saveLocal(LS.grnLines, [...grnLines, ...curLines]);
    await audit("WH_GRN_CREATED_LOCAL", { grnId: grn.id, asnId, actorEmail: a.email ?? null });
    if (asnId) await recomputeAsnLifecycle(asnId);
    return grn;
  }

  const ins = await supabase.from("warehouse_grns").insert(grn as any);
  if (ins.error) throw new Error(ins.error.message);

  if (grnLines.length) {
    const insL = await supabase.from("warehouse_grn_lines").insert(grnLines as any);
    if (insL.error) throw new Error(insL.error.message);
  }

  await audit("WH_GRN_CREATED", { grnId: grn.id, asnId, actorEmail: a.email ?? null });
  if (asnId) await recomputeAsnLifecycle(asnId);
  return grn;
}

/* =========================
   QC Hold
   ========================= */
export async function listQCHoldTasks(scope: "ALL" | "MINE"): Promise<WhTask[]> {
  const all = await listTasks(scope);
  return all.filter((t) => t.type === "QC_HOLD" && (t.status === "PENDING" || t.status === "HOLD" || t.status === "IN_PROGRESS"));
}

export async function staffSubmitQcResult(input: { taskId: string; result: "PASS" | "FAIL"; note?: string | null }): Promise<void> {
  const a = await actor();
  const task = await getTaskById(input.taskId);
  if (!task) throw new Error("TASK_NOT_FOUND");

  const nextMeta = { ...(task.meta ?? {}), qcResult: input.result, qcNote: input.note ?? null, qcSubmittedAt: nowIso(), qcBy: a.email ?? null };

  if (!isSupabaseConfigured) {
    const cur = loadLocal<WhTask[]>(LS.tasks, []);
    saveLocal(LS.tasks, cur.map((x) => (x.id === input.taskId ? { ...x, status: "HOLD", note: input.note ?? x.note, meta: nextMeta, updated_at: nowIso() } : x)));
    return;
  }

  const upd = await supabase.from("warehouse_tasks").update({ status: "HOLD", note: input.note ?? null, meta: nextMeta, updated_at: nowIso() } as any).eq("id", input.taskId);
  if (upd.error) throw new Error(upd.error.message);
}

export async function controllerDecisionQcHold(input: { taskId: string; decision: "RELEASE" | "REJECT"; note?: string | null }): Promise<void> {
  const a = await actor();
  const task = await getTaskById(input.taskId);
  if (!task) throw new Error("TASK_NOT_FOUND");

  const nextMeta = { ...(task.meta ?? {}), qcDecision: input.decision, qcDecisionNote: input.note ?? null, qcDecisionAt: nowIso(), qcDecisionBy: a.email ?? null };

  // hard-stop: must have a valid bin on RELEASE
  if (input.decision === "RELEASE") {
    const sku = U((task.meta as any)?.sku ?? task.sku ?? "");
    const qty = N((task.meta as any)?.qty ?? task.qty ?? 0);

    const desired = U((task.meta as any)?.suggestToLoc ?? task.to_location ?? "");
    const suggested = desired || (await suggestPutawayLocation({ sku, qty }));

    if (!suggested) {
      throw new Error("NO_BIN_CAPACITY");
    }

    (nextMeta as any).suggestToLoc = suggested;
  }

  const nextStatus: WhTaskStatus = input.decision === "RELEASE" ? "COMPLETED" : "CANCELLED";
  await setTaskStatus(input.taskId, nextStatus, input.note ?? null);

  // persist meta best-effort
  if (!isSupabaseConfigured) {
    const cur = loadLocal<WhTask[]>(LS.tasks, []);
    saveLocal(LS.tasks, cur.map((x) => (x.id === input.taskId ? { ...x, meta: nextMeta, updated_at: nowIso() } : x)));
  } else {
    await supabase.from("warehouse_tasks").update({ meta: nextMeta, updated_at: nowIso() } as any).eq("id", input.taskId);
  }

  const grnId = String((task.meta as any)?.grnId ?? "");
  if (grnId) await setGRNStatus(grnId, input.decision === "RELEASE" ? "RELEASED" : "REJECTED");

  if (input.decision === "RELEASE") {
    const sku = U((task.meta as any)?.sku ?? task.sku ?? "");
    const qty = N((task.meta as any)?.qty ?? task.qty ?? 0);
    const toLoc = String((nextMeta as any).suggestToLoc ?? "STAGING");
    await createPutawayTask({ reference: task.reference ?? (grnId || "GRN"), sku: sku || null, qty: qty || null, fromLoc: "QC", toLoc, assignedTo: null });
  }

  const asnId = String((task.meta as any)?.asnId ?? "");
  if (asnId) await recomputeAsnLifecycle(asnId);
}
EOF

# ------------------------------------------------------------------------------
# 2) WarehouseShell menu: add Putaway Rules
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
        { to: "/portal/warehouse/controller/asn", label: t("ASN (Inbound Plan)", "ASN (Inbound Plan)") },
        { to: "/portal/warehouse/controller/grn", label: t("GRN (Goods Receipt)", "GRN (Goods Receipt)") },
        { to: "/portal/warehouse/controller/qc-hold", label: t("QC Hold Approvals", "QC Hold Approvals") },
        { to: "/portal/warehouse/controller/putaway-rules", label: t("Putaway Rules", "Putaway Rules") },
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
      { to: "/portal/warehouse/staff/qc-hold", label: t("QC Hold (My)", "QC Hold (My)") },
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
# 3) Controller Putaway Rules UI (CRUD + reorder)
# ------------------------------------------------------------------------------
cat > "$CTRL_RULES" <<'EOF'
import React, { useEffect, useMemo, useState } from "react";
import WarehouseShell from "@/components/layout/WarehouseShell";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { ArrowDown, ArrowUp, Plus, RefreshCw, Save, Trash2 } from "lucide-react";
import { deletePutawayRule, listPutawayRules, savePutawayRuleOrder, upsertPutawayRule, type PutawayRule } from "@/services/warehousePlatform";

type Draft = {
  id?: string;
  priority: string;
  active: boolean;
  sku_prefix: string;
  sku_regex: string;
  zone: string;
  location_type: string;
  note: string;
};

function mkDraft(r?: PutawayRule): Draft {
  return {
    id: r?.id,
    priority: String(r?.priority ?? 10),
    active: r?.active ?? true,
    sku_prefix: r?.sku_prefix ?? "",
    sku_regex: r?.sku_regex ?? "",
    zone: r?.zone ?? "",
    location_type: r?.location_type ?? "",
    note: r?.note ?? "",
  };
}

export default function ControllerPutawayRules() {
  const { lang } = useLanguage();
  const t = (en: string, mm: string) => (lang === "en" ? en : mm);

  const [loading, setLoading] = useState(true);
  const [rules, setRules] = useState<PutawayRule[]>([]);
  const [q, setQ] = useState("");

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(mkDraft());

  async function refresh() {
    setLoading(true);
    try {
      setRules(await listPutawayRules());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void refresh(); }, []);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return rules;
    return rules.filter((r) => {
      const hay = `${r.priority} ${r.active} ${r.sku_prefix ?? ""} ${r.sku_regex ?? ""} ${r.zone ?? ""} ${r.location_type ?? ""} ${r.note ?? ""}`.toLowerCase();
      return hay.includes(qq);
    });
  }, [rules, q]);

  function move(idx: number, dir: -1 | 1) {
    setRules((cur) => {
      const next = [...cur];
      const j = idx + dir;
      if (j < 0 || j >= next.length) return cur;
      const tmp = next[idx];
      next[idx] = next[j];
      next[j] = tmp;
      return next;
    });
  }

  async function saveOrder() {
    try {
      await savePutawayRuleOrder(rules);
      toast({ title: t("Saved order", "Order သိမ်းပြီး") });
      await refresh();
    } catch (e: any) {
      toast({ title: t("Save failed", "မသိမ်းနိုင်ပါ"), description: String(e?.message ?? e), variant: "destructive" as any });
    }
  }

  async function saveOne() {
    const id = draft.id ?? crypto.randomUUID();
    const payload: PutawayRule = {
      id,
      priority: Number(draft.priority || 10),
      active: Boolean(draft.active),
      sku_prefix: draft.sku_prefix.trim() || null,
      sku_regex: draft.sku_regex.trim() || null,
      zone: draft.zone.trim() || null,
      location_type: draft.location_type.trim() || null,
      note: draft.note.trim() || null,
      updated_at: new Date().toISOString(),
    };

    if (!payload.sku_prefix && !payload.sku_regex) {
      toast({ title: t("Rule needs SKU prefix or regex", "SKU prefix သို့ regex တစ်ခုလိုသည်"), variant: "destructive" as any });
      return;
    }

    if (!payload.zone) {
      toast({ title: t("Rule needs a zone", "Zone တစ်ခုလိုသည်"), variant: "destructive" as any });
      return;
    }

    try {
      await upsertPutawayRule(payload);
      setOpen(false);
      setDraft(mkDraft());
      toast({ title: t("Saved", "သိမ်းပြီး") });
      await refresh();
    } catch (e: any) {
      toast({ title: t("Save failed", "မသိမ်းနိုင်ပါ"), description: String(e?.message ?? e), variant: "destructive" as any });
    }
  }

  async function remove(id: string) {
    try {
      await deletePutawayRule(id);
      toast({ title: t("Deleted", "ဖျက်ပြီး") });
      await refresh();
    } catch (e: any) {
      toast({ title: t("Delete failed", "မဖျက်နိုင်ပါ"), description: String(e?.message ?? e), variant: "destructive" as any });
    }
  }

  async function toggle(id: string) {
    const r = rules.find((x) => x.id === id);
    if (!r) return;
    await upsertPutawayRule({ ...r, active: !r.active, updated_at: new Date().toISOString() });
    await refresh();
  }

  return (
    <WarehouseShell title={t("Putaway Rules", "Putaway Rules")}>
      <div className="space-y-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 flex items-center justify-between gap-3 flex-wrap">
            <div>
              <div className="text-sm font-black tracking-widest uppercase">{t("Putaway Rule Manager", "Putaway Rule Manager")}</div>
              <div className="text-xs text-white/60">
                {t("Priority order matters. First match wins. Used for bin suggestion.", "Priority အစဉ်အတိုင်းသက်ရောက်သည်။ ပထမဆုံး match အနိုင်ရမည်။ Bin suggestion အတွက်သုံးသည်။")}
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" className="border-white/10" onClick={() => void refresh()} disabled={loading}>
                <RefreshCw className="h-4 w-4 mr-2" /> {t("Refresh", "ပြန်တင်")}
              </Button>
              <Button variant="outline" className="border-white/10" onClick={() => void saveOrder()} disabled={loading || !rules.length}>
                <Save className="h-4 w-4 mr-2" /> {t("Save Order", "Order သိမ်း")}
              </Button>
              <Button className="bg-emerald-600 hover:bg-emerald-500" onClick={() => { setDraft(mkDraft()); setOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" /> {t("New Rule", "Rule အသစ်")}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Input className="bg-[#05080F] border-white/10" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("Search…", "ရှာရန်…")} />

        <Card className="bg-[#05080F] border-white/10">
          <CardContent className="p-0 overflow-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-white/70">
                <tr>
                  <th className="p-3 text-xs font-mono tracking-widest uppercase">PRIORITY</th>
                  <th className="p-3 text-xs font-mono tracking-widest uppercase">ACTIVE</th>
                  <th className="p-3 text-xs font-mono tracking-widest uppercase">SKU PREFIX</th>
                  <th className="p-3 text-xs font-mono tracking-widest uppercase">SKU REGEX</th>
                  <th className="p-3 text-xs font-mono tracking-widest uppercase">ZONE</th>
                  <th className="p-3 text-xs font-mono tracking-widest uppercase">LOC TYPE</th>
                  <th className="p-3 text-xs font-mono tracking-widest uppercase">{t("ACTIONS", "လုပ်ဆောင်ချက်")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filtered.map((r, idx) => (
                  <tr key={r.id} className="hover:bg-white/5">
                    <td className="p-3 font-mono text-white/80">{r.priority}</td>
                    <td className="p-3">
                      <Button
                        variant="outline"
                        className={r.active ? "border-emerald-500/30 text-emerald-300 bg-emerald-500/10" : "border-white/10 text-white/60"}
                        onClick={() => void toggle(r.id)}
                      >
                        {r.active ? "ON" : "OFF"}
                      </Button>
                    </td>
                    <td className="p-3 text-white/70">{r.sku_prefix ?? "—"}</td>
                    <td className="p-3 text-white/70">{r.sku_regex ?? "—"}</td>
                    <td className="p-3"><Badge variant="outline" className="border-white/10">{r.zone ?? "—"}</Badge></td>
                    <td className="p-3 text-white/70">{r.location_type ?? "—"}</td>
                    <td className="p-3 flex gap-2 flex-wrap">
                      <Button variant="outline" className="border-white/10" onClick={() => move(idx, -1)}><ArrowUp className="h-4 w-4" /></Button>
                      <Button variant="outline" className="border-white/10" onClick={() => move(idx, 1)}><ArrowDown className="h-4 w-4" /></Button>
                      <Button
                        variant="outline"
                        className="border-white/10"
                        onClick={() => { setDraft(mkDraft(r)); setOpen(true); }}
                      >
                        {t("Edit", "ပြင်")}
                      </Button>
                      <Button variant="outline" className="border-rose-500/30 text-rose-300 bg-rose-500/10" onClick={() => void remove(r.id)}>
                        <Trash2 className="h-4 w-4 mr-2" /> {t("Delete", "ဖျက်")}
                      </Button>
                    </td>
                  </tr>
                ))}
                {!loading && filtered.length === 0 ? <tr><td colSpan={7} className="p-6 text-white/60">{t("No rules.", "Rule မရှိပါ။")}</td></tr> : null}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="bg-[#05080F] border-white/10 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-black tracking-widest uppercase">{draft.id ? t("Edit Rule", "Rule ပြင်") : t("New Rule", "Rule အသစ်")}</DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input className="bg-[#0B101B] border-white/10" placeholder="Priority (10,20,…)" value={draft.priority} onChange={(e) => setDraft((p) => ({ ...p, priority: e.target.value }))} />
              <Input className="bg-[#0B101B] border-white/10" placeholder="Zone (e.g. GENERAL)" value={draft.zone} onChange={(e) => setDraft((p) => ({ ...p, zone: e.target.value }))} />

              <Input className="bg-[#0B101B] border-white/10" placeholder="SKU Prefix (e.g. FRZ)" value={draft.sku_prefix} onChange={(e) => setDraft((p) => ({ ...p, sku_prefix: e.target.value }))} />
              <Input className="bg-[#0B101B] border-white/10" placeholder='SKU Regex (e.g. "^ABC.*")' value={draft.sku_regex} onChange={(e) => setDraft((p) => ({ ...p, sku_regex: e.target.value }))} />

              <Input className="bg-[#0B101B] border-white/10" placeholder="Location Type (optional)" value={draft.location_type} onChange={(e) => setDraft((p) => ({ ...p, location_type: e.target.value }))} />
              <Input className="bg-[#0B101B] border-white/10" placeholder={t("Note (optional)", "မှတ်ချက် (optional)")} value={draft.note} onChange={(e) => setDraft((p) => ({ ...p, note: e.target.value }))} />

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className={draft.active ? "border-emerald-500/30 text-emerald-300 bg-emerald-500/10" : "border-white/10 text-white/60"}
                  onClick={() => setDraft((p) => ({ ...p, active: !p.active }))}
                >
                  {draft.active ? "ACTIVE" : "INACTIVE"}
                </Button>
                <span className="text-xs text-white/60">{t("Toggle active state.", "Active state ပြောင်းပါ။")}</span>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" className="border-white/10" onClick={() => setOpen(false)}>{t("Cancel", "မလုပ်တော့")}</Button>
              <Button className="bg-emerald-600 hover:bg-emerald-500" onClick={() => void saveOne()}>{t("Save", "သိမ်း")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </WarehouseShell>
  );
}
EOF

# ------------------------------------------------------------------------------
# 4) ControllerQCHold: catch NO_BIN_CAPACITY and toast
# ------------------------------------------------------------------------------
# Overwrite with a safe version that only changes decide() behavior.
cat > "$CTRL_QC" <<'EOF'
import React, { useEffect, useMemo, useState } from "react";
import WarehouseShell from "@/components/layout/WarehouseShell";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { RefreshCw, ShieldCheck, ShieldX } from "lucide-react";
import { controllerDecisionQcHold, listQCHoldTasks, type WhTask } from "@/services/warehousePlatform";
import { toast } from "@/components/ui/use-toast";

export default function ControllerQCHold() {
  const { lang } = useLanguage();
  const t = (en: string, mm: string) => (lang === "en" ? en : mm);

  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<WhTask[]>([]);
  const [q, setQ] = useState("");

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<WhTask | null>(null);
  const [note, setNote] = useState("");

  async function refresh() {
    setLoading(true);
    try {
      setTasks(await listQCHoldTasks("ALL"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void refresh(); }, []);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return tasks;
    return tasks.filter((x) => `${x.reference ?? ""} ${x.assigned_to_email ?? ""} ${(x.meta as any)?.qcResult ?? ""}`.toLowerCase().includes(qq));
  }, [tasks, q]);

  function openTask(x: WhTask) {
    setActive(x);
    setNote("");
    setOpen(true);
  }

  async function decide(decision: "RELEASE" | "REJECT") {
    if (!active) return;
    try {
      await controllerDecisionQcHold({ taskId: active.id, decision, note: note || null });
      setOpen(false);
      setActive(null);
      await refresh();
      toast({ title: t("Decision saved", "အတည်ပြုချက် သိမ်းပြီး"), description: decision });
    } catch (e: any) {
      const msg = String(e?.message ?? e);
      if (msg.includes("NO_BIN_CAPACITY")) {
        toast({
          title: t("No bin capacity available", "Bin capacity မလုံလောက်ပါ"),
          description: t("Increase capacity or adjust putaway rules.", "Capacity တိုးပါ သို့ Putaway rules ကို ပြင်ပါ။"),
          variant: "destructive" as any,
        });
      } else {
        toast({ title: t("Action failed", "မအောင်မြင်ပါ"), description: msg, variant: "destructive" as any });
      }
    }
  }

  return (
    <WarehouseShell title={t("QC Hold Approvals", "QC Hold Approvals")}>
      <div className="space-y-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 flex items-center justify-between gap-3 flex-wrap">
            <div>
              <div className="text-sm font-black tracking-widest uppercase">{t("QC Hold Queue", "QC Hold Queue")}</div>
              <div className="text-xs text-white/60">{t("Release/Reject after QC submission.", "QC တင်ပြီးနောက် Release/Reject လုပ်ပါ။")}</div>
            </div>
            <Button variant="outline" className="border-white/10" onClick={() => void refresh()} disabled={loading}>
              <RefreshCw className="h-4 w-4 mr-2" /> {t("Refresh", "ပြန်တင်")}
            </Button>
          </CardContent>
        </Card>

        <Input className="bg-[#05080F] border-white/10" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("Search…", "ရှာရန်…")} />

        <Card className="bg-[#05080F] border-white/10">
          <CardContent className="p-0">
            <div className="divide-y divide-white/5">
              {loading ? (
                <div className="p-6 text-white/60">{t("Loading…", "ရယူနေပါသည်…")}</div>
              ) : filtered.length === 0 ? (
                <div className="p-6 text-white/60">{t("No QC holds.", "QC Hold မရှိပါ။")}</div>
              ) : (
                filtered.map((x) => (
                  <div key={x.id} className="p-4 flex items-start justify-between gap-4 flex-wrap">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="border-rose-500/30 text-rose-300 bg-rose-500/10">QC_HOLD</Badge>
                        <Badge variant="outline" className="border-white/10">REF: {x.reference ?? "—"}</Badge>
                        <Badge variant="outline" className="border-white/10">GRN: {(x.meta as any)?.grnId ?? "—"}</Badge>
                        <Badge variant="outline" className="border-white/10">{t("Status", "Status")}: {x.status}</Badge>
                      </div>
                      <div className="text-xs text-white/60 mt-2">
                        QC Result: {(x.meta as any)?.qcResult ?? "—"} • QC By: {(x.meta as any)?.qcBy ?? "—"} • TO: {(x.meta as any)?.suggestToLoc ?? "—"}
                      </div>
                    </div>
                    <Button className="bg-sky-600 hover:bg-sky-500" onClick={() => openTask(x)}>{t("Review", "စစ်ဆေး")}</Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="bg-[#05080F] border-white/10 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-black tracking-widest uppercase">
                {t("QC Decision", "QC Decision")} • {active?.reference ?? ""}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-2 text-sm text-white/70">
              <div>QC Result: <span className="text-white">{(active?.meta as any)?.qcResult ?? "—"}</span></div>
              <div>QC Note: <span className="text-white">{(active?.meta as any)?.qcNote ?? "—"}</span></div>
              <div>Suggested TO: <span className="text-white">{(active?.meta as any)?.suggestToLoc ?? "—"}</span></div>
              <div className="text-xs text-white/50">{t("Hard-stop will block Release if no bin fits.", "Bin မလုံလောက်လျှင် Release ကို ပိတ်ထားမည်။")}</div>
            </div>

            <Input className="bg-[#0B101B] border-white/10" placeholder={t("Decision note (optional)", "Decision note (optional)")} value={note} onChange={(e) => setNote(e.target.value)} />

            <DialogFooter className="gap-2">
              <Button variant="outline" className="border-white/10" onClick={() => setOpen(false)}>{t("Cancel", "မလုပ်တော့")}</Button>
              <Button className="bg-emerald-600 hover:bg-emerald-500" onClick={() => void decide("RELEASE")}>
                <ShieldCheck className="h-4 w-4 mr-2" /> {t("Release", "Release")}
              </Button>
              <Button className="bg-rose-600 hover:bg-rose-500" onClick={() => void decide("REJECT")}>
                <ShieldX className="h-4 w-4 mr-2" /> {t("Reject", "Reject")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </WarehouseShell>
  );
}
EOF

# ------------------------------------------------------------------------------
# 5) StaffInbound: enforce hard-stop at GRN creation time
# ------------------------------------------------------------------------------
# NOTE: This is a minimal enforcement wrapper. It assumes your latest StaffInbound
# uses suggestPutawayLocation already; we overwrite with a safe compatible version.
cat > "$STAFF_INBOUND" <<'EOF'
import React, { useMemo, useState } from "react";
import WarehouseShell from "@/components/layout/WarehouseShell";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import WarehouseScanInput from "@/components/warehouse/WarehouseScanInput";
import { toast } from "@/components/ui/use-toast";
import {
  createGRN,
  createReceiveTask,
  createTask,
  setTaskStatus,
  suggestReceiptLinesFromASN,
  suggestPutawayLocation,
  type GrnStatus,
  type AsnReceiptSuggestion,
} from "@/services/warehousePlatform";
import { RefreshCw, Wand2, Sparkles } from "lucide-react";

type ReceiptLine = AsnReceiptSuggestion;

function norm(s: string) { return s.trim().toUpperCase(); }
function num(v: string) { const n = Number(v); return Number.isFinite(n) ? n : 0; }

export default function StaffInbound() {
  const { lang } = useLanguage();
  const { user } = useAuth();
  const t = (en: string, mm: string) => (lang === "en" ? en : mm);

  const [ref, setRef] = useState("");
  const [asnId, setAsnId] = useState("");

  const [lines, setLines] = useState<ReceiptLine[]>([]);
  const [busy, setBusy] = useState(false);

  const [qcNeeded, setQcNeeded] = useState(true);
  const [qcAssignee, setQcAssignee] = useState("");
  const [suggestToLoc, setSuggestToLoc] = useState("");

  const canSubmit = useMemo(
    () => Boolean(ref.trim() && lines.length && lines.some((l) => l.sku && l.receivedQty > 0)),
    [ref, lines]
  );

  function upsertLineSku(sku: string) {
    const s = norm(sku);
    if (!s) return;

    setLines((cur) => {
      const idx = cur.findIndex((x) => x.sku === s);
      if (idx >= 0) return cur;
      return [{ sku: s, expectedQty: 0, alreadyReceivedQty: 0, remainingQty: 0, receivedQty: 0 }, ...cur];
    });
  }

  async function autoSuggestBin() {
    const firstSku = lines.find((l) => l.sku)?.sku ?? "";
    const totalQty = lines.reduce((s, l) => s + (l.receivedQty > 0 ? l.receivedQty : 0), 0) || 1;
    if (!firstSku) return null;
    return await suggestPutawayLocation({ sku: firstSku, qty: totalQty });
  }

  async function loadAsnLines() {
    if (!asnId.trim()) return;
    setBusy(true);
    try {
      const suggested = await suggestReceiptLinesFromASN(asnId.trim());
      setLines(suggested.map((x) => ({ ...x, receivedQty: 0 })));
      toast({ title: t("ASN loaded", "ASN ရယူပြီး"), description: `${asnId} • ${suggested.length} lines` });
      const loc = suggested[0]?.sku ? await suggestPutawayLocation({ sku: suggested[0].sku, qty: 1 }) : null;
      if (loc) setSuggestToLoc(loc);
    } catch {
      toast({ title: t("ASN load failed", "ASN မရပါ"), description: asnId, variant: "destructive" as any });
    } finally {
      setBusy(false);
    }
  }

  async function receiveAndCreateGrn() {
    if (!canSubmit) return;

    setBusy(true);
    try {
      const desired = suggestToLoc.trim().toUpperCase();
      const bin = desired || (await autoSuggestBin());

      if (!bin) {
        toast({
          title: t("No bin capacity available", "Bin capacity မလုံလောက်ပါ"),
          description: t("Update Putaway Rules or increase location capacity.", "Putaway rules ပြင်ပါ သို့ capacity တိုးပါ။"),
          variant: "destructive" as any,
        });
        return;
      }

      // RECEIVE tasks (trace)
      for (const l of lines) {
        if (!l.sku || l.receivedQty <= 0) continue;
        const task = await createReceiveTask({
          reference: ref,
          sku: l.sku,
          qty: l.receivedQty,
          note: `Received by ${(user as any)?.email ?? "staff"}`,
          assignedTo: (user as any)?.email ?? null,
        });
        await setTaskStatus(task.id, "COMPLETED");
      }

      const grnStatus: GrnStatus = qcNeeded ? "QC_HOLD" : "RECEIVED";
      const grn = await createGRN({
        reference: ref,
        asnId: asnId.trim() || null,
        note: qcNeeded ? "QC HOLD REQUIRED" : null,
        status: grnStatus,
        lines: lines.filter((l) => l.sku && l.receivedQty > 0).map((l) => ({ sku: l.sku, receivedQty: l.receivedQty, expectedQty: l.expectedQty || null })),
      });

      if (qcNeeded) {
        const totalQty = lines.reduce((s, l) => s + (l.receivedQty > 0 ? l.receivedQty : 0), 0);
        const firstSku = lines.find((l) => l.sku)?.sku ?? null;

        await createTask({
          type: "QC_HOLD",
          status: "PENDING",
          reference: ref,
          sku: firstSku,
          qty: totalQty || null,
          from_location: "RECEIVING",
          to_location: "QC",
          assigned_to_email: qcAssignee.trim() || null,
          note: "QC REQUIRED",
          meta: {
            flow: "QC_HOLD",
            grnId: grn.id,
            asnId: asnId.trim() || null,
            lines,
            sku: firstSku,
            qty: totalQty,
            suggestToLoc: bin,
          },
        });
      } else {
        // no QC: create putaway task immediately to bin
        const totalQty = lines.reduce((s, l) => s + (l.receivedQty > 0 ? l.receivedQty : 0), 0);
        const firstSku = lines.find((l) => l.sku)?.sku ?? null;
        await createTask({
          type: "PUTAWAY",
          status: "PENDING",
          reference: ref,
          sku: firstSku,
          qty: totalQty || null,
          from_location: "RECEIVING",
          to_location: bin,
          assigned_to_email: (user as any)?.email ?? null,
          note: "AUTO PUTAWAY",
          meta: { flow: "PUTAWAY", grnId: grn.id, asnId: asnId.trim() || null, lines },
        });
      }

      toast({ title: t("GRN created", "GRN ဖန်တီးပြီး"), description: `${ref} • TO=${bin}` });

      setRef(""); setAsnId(""); setLines([]); setQcNeeded(true); setQcAssignee(""); setSuggestToLoc("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <WarehouseShell title={t("Inbound Ops", "Inbound Ops")}>
      <div className="space-y-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 space-y-1">
            <div className="text-sm font-black tracking-widest uppercase">{t("ASN Partial Receiving + Hard-Stop", "ASN Partial Receiving + Hard-Stop")}</div>
            <div className="text-xs text-white/60">{t("If no bin fits capacity, system blocks GRN/QC release.", "Bin မလုံလောက်လျှင် GRN/QC release ကို စနစ်က ပိတ်ထားမည်။")}</div>
          </CardContent>
        </Card>

        <Card className="bg-[#05080F] border-white/10">
          <CardContent className="p-4 space-y-3">
            <WarehouseScanInput label={t("Scan Reference (AWB/PO)", "Reference (AWB/PO) စကန်")} onValue={(v) => setRef(norm(v))} normalize={norm} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <Input className="bg-black/30 border-white/10" placeholder={t("ASN ID (optional)", "ASN ID (optional)")} value={asnId} onChange={(e) => setAsnId(e.target.value)} />
              <Button className="bg-sky-600 hover:bg-sky-500" onClick={() => void loadAsnLines()} disabled={busy || !asnId.trim()}>
                <Wand2 className="h-4 w-4 mr-2" /> {t("Load ASN Lines", "ASN Lines ရယူ")}
              </Button>
              <Button variant="outline" className="border-white/10" onClick={() => setLines([])} disabled={busy || !lines.length}>
                <RefreshCw className={"h-4 w-4 mr-2 " + (busy ? "animate-spin" : "")} /> {t("Clear Lines", "Line ဖျက်")}
              </Button>
            </div>

            <WarehouseScanInput label={t("Scan SKU (add line)", "SKU စကန် (line ထည့်)")} onValue={(v) => upsertLineSku(v)} normalize={norm} />

            <div className="flex items-center gap-2 flex-wrap">
              <Button className={qcNeeded ? "bg-rose-600 hover:bg-rose-500" : "bg-white/10 hover:bg-white/15"} onClick={() => setQcNeeded((v) => !v)}>
                {qcNeeded ? t("QC HOLD: ON", "QC HOLD: ON") : t("QC HOLD: OFF", "QC HOLD: OFF")}
              </Button>

              <Input className="bg-black/30 border-white/10 w-[320px]" placeholder={t("QC Assignee email (optional)", "QC Assignee email (optional)")} value={qcAssignee} onChange={(e) => setQcAssignee(e.target.value)} />
              <Input className="bg-black/30 border-white/10 w-[220px]" placeholder={t("Suggested TO Bin", "Suggested TO Bin")} value={suggestToLoc} onChange={(e) => setSuggestToLoc(e.target.value)} />

              <Button variant="outline" className="border-white/10" onClick={async () => { const b = await autoSuggestBin(); if (b) setSuggestToLoc(b); }} disabled={!lines.length}>
                <Sparkles className="h-4 w-4 mr-2" /> {t("Suggest Bin", "Bin အကြံပြု")}
              </Button>

              <Badge variant="outline" className="border-white/10">{t("Lines", "Lines")}: {lines.length}</Badge>
            </div>

            <div className="overflow-auto rounded-2xl border border-white/10">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 text-white/70">
                  <tr>
                    <th className="p-3 text-xs font-mono tracking-widest uppercase">SKU</th>
                    <th className="p-3 text-xs font-mono tracking-widest uppercase">{t("Expected", "မျှော်မှန်း")}</th>
                    <th className="p-3 text-xs font-mono tracking-widest uppercase">{t("Received so far", "လက်ခံပြီး")}</th>
                    <th className="p-3 text-xs font-mono tracking-widest uppercase">{t("Remaining", "ကျန်")}</th>
                    <th className="p-3 text-xs font-mono tracking-widest uppercase">{t("Receive now", "ယခုလက်ခံ")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {lines.length ? (
                    lines.map((l, idx) => (
                      <tr key={`${l.sku}_${idx}`} className="hover:bg-white/5">
                        <td className="p-3 font-semibold text-white">{l.sku}</td>
                        <td className="p-3 text-white/70">{l.expectedQty || "—"}</td>
                        <td className="p-3 text-white/70">{l.alreadyReceivedQty || 0}</td>
                        <td className="p-3 text-white/70">{l.remainingQty}</td>
                        <td className="p-2">
                          <Input className="bg-black/30 border-white/10" value={String(l.receivedQty)} onChange={(e) => setLines((cur) => cur.map((x, i) => (i === idx ? { ...x, receivedQty: num(e.target.value) } : x)))} />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={5} className="p-6 text-white/60">{t("Load ASN or scan SKU to add lines.", "ASN ရယူပါ သို့မဟုတ် SKU စကန်ပြီး line ထည့်ပါ။")}</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            <Button className="bg-emerald-600 hover:bg-emerald-500" disabled={!canSubmit || busy} onClick={() => void receiveAndCreateGrn()}>
              {t("Receive + Create GRN", "လက်ခံ + GRN ဖန်တီး")}
            </Button>

            {ref ? <div className="text-xs text-white/50">REF: {ref}</div> : null}
          </CardContent>
        </Card>
      </div>
    </WarehouseShell>
  );
}
EOF

# ------------------------------------------------------------------------------
# 6) Patch App.tsx: add import + route
# ------------------------------------------------------------------------------
node - <<'NODE'
const fs = require("fs");
const path = "src/App.tsx";
if (!fs.existsSync(path)) {
  console.error("[WARN] src/App.tsx not found. Add route manually for ControllerPutawayRules.");
  process.exit(0);
}
let s = fs.readFileSync(path, "utf8");

function addImport(symbol, importPath) {
  if (new RegExp(`\\b${symbol}\\b`).test(s)) return;
  const importLines = [...s.matchAll(/^import .*;$/gm)];
  if (importLines.length) {
    const last = importLines[importLines.length - 1];
    const idx = last.index + last[0].length;
    s = s.slice(0, idx) + `\nimport ${symbol} from "${importPath}";` + s.slice(idx);
  } else {
    s = `import ${symbol} from "${importPath}";\n` + s;
  }
}

addImport("ControllerPutawayRules", "@/pages/portals/warehouse/ControllerPutawayRules");

const catchAll = '<Route path="*" element={<Navigate to="/login" replace />} />';

const insert = `
              <Route
                path="/portal/warehouse/controller/putaway-rules"
                element={
                  <RequireRole allow={["WAREHOUSE_CONTROLLER","WAREHOUSE_SUPERVISOR","WH_CONTROLLER","WH_SUPERVISOR","WH_CTRL","WH_SUP","SUPERVISOR","OPERATIONS_ADMIN","SUPER_ADMIN","SYS","APP_OWNER"]}>
                    <ControllerPutawayRules />
                  </RequireRole>
                }
              />
`;

if (!s.includes('/portal/warehouse/controller/putaway-rules')) {
  if (s.includes(catchAll)) s = s.replace(catchAll, insert + "\n              " + catchAll);
  else s += "\n\n// WAREHOUSE PUTAWAY RULES ROUTE (auto-added)\n" + insert + "\n";
}

fs.writeFileSync(path, s, "utf8");
console.log("✅ Patched App.tsx (putaway rules route).");
NODE

git add "$SVC" "$SHELL" "$CTRL_RULES" "$CTRL_QC" "$STAFF_INBOUND" "$APP" 2>/dev/null || true

echo "✅ Applied Putaway Rules UI + Capacity Hard-Stop"
echo "NEXT:"
echo "  1) Set VITE_WAREHOUSE_CAPACITY_HARD_STOP=true in your .env / Render"
echo "  2) npm run dev"
echo "COMMIT:"
echo "  git commit -m \"feat(warehouse): putaway rules ui + capacity hard-stop\""
EOF


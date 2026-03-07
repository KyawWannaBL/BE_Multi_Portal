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

import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export type WhTaskType = "RECEIVE" | "PUTAWAY" | "PICK" | "PACK" | "DISPATCH" | "CYCLE_COUNT" | "QC_HOLD";
export type WhTaskStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "HOLD" | "CANCELLED";

export type WhTask = {
  id: string; created_at: string; updated_at?: string | null;
  type: WhTaskType; status: WhTaskStatus;
  reference: string | null; sku: string | null; qty: number | null;
  from_location: string | null; to_location: string | null;
  assigned_to_email: string | null; note: string | null; meta?: Record<string, unknown> | null;
};

export type WhSku = { id: string; sku: string; name: string | null; barcode: string | null; uom: string | null; meta?: Record<string, unknown> | null };
export type WhLocation = { id: string; code: string; name: string | null; zone: string | null; type: string | null; capacity: number | null; meta?: Record<string, unknown> | null };
export type WhInventoryRow = { sku: string; location_code: string; qty: number };
export type AsnStatus = "DRAFT" | "SENT" | "RECEIVED" | "CLOSED" | "CANCELLED";
export type GrnStatus = "RECEIVED" | "QC_HOLD" | "RELEASED" | "REJECTED";

export type PutawayRule = {
  id: string; priority: number; active: boolean;
  sku_prefix: string | null; sku_regex: string | null;
  zone: string | null; location_type: string | null;
  note: string | null; updated_at?: string | null;
};

const LS = { tasks: "wh_tasks_v2", skus: "wh_skus_v1", locs: "wh_locs_v1", inv: "wh_inv_v1", rules: "wh_putaway_rules_v2" };

function uuid() { const c: any = globalThis.crypto; return c?.randomUUID ? c.randomUUID() : `wh_${Date.now()}_${Math.random().toString(16).slice(2)}`; }
function nowIso() { return new Date().toISOString(); }
function safeJson<T>(raw: string | null, fallback: T): T { try { return raw ? (JSON.parse(raw) as T) : fallback; } catch { return fallback; } }
function loadLocal<T>(key: string, fallback: T): T { if (typeof window === "undefined") return fallback; return safeJson<T>(window.localStorage.getItem(key), fallback); }
function saveLocal<T>(key: string, value: T) { if (typeof window === "undefined") return; window.localStorage.setItem(key, JSON.stringify(value)); }

export async function listTasks(scope: "ALL" | "MINE"): Promise<WhTask[]> {
  if (!isSupabaseConfigured) {
    const tasks = loadLocal<WhTask[]>(LS.tasks, []);
    return tasks.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
  }
  const res = await supabase.from("warehouse_tasks").select("*").order("created_at", { ascending: false }).limit(1500);
  return res.data as WhTask[] || [];
}

export async function listPutawayRules(): Promise<PutawayRule[]> {
  if (isSupabaseConfigured) {
    const res = await supabase.from("warehouse_putaway_rules").select("*").order("priority", { ascending: true });
    if (res.data) return res.data as PutawayRule[];
  }
  return loadLocal<PutawayRule[]>(LS.rules, []);
}

// Minimal exports for routing stability. Expanding full DB logic in actual files later.
export const WAREHOUSE_CAPACITY_HARD_STOP = import.meta.env.VITE_WAREHOUSE_CAPACITY_HARD_STOP === 'true';

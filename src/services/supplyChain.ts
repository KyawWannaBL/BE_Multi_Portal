import { supabase } from "@/lib/supabase";
const isSupabaseConfigured = true; // fallback guard

export type SupplyEvent = {
  id: string;
  created_at: string;
  way_id: string;
  event_type: string;
  segment: string;
  note?: string | null;
  meta?: Record<string, unknown> | null;
  actor_email?: string | null;
};

const LS_KEY = "btx_supply_events_v1";

function nowIso() { return new Date().toISOString(); }
function uuid() {
  const c: any = globalThis.crypto;
  return c?.randomUUID ? c.randomUUID() : `ev_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}
function safeJson<T>(raw: string | null, fb: T): T { try { return raw ? (JSON.parse(raw) as T) : fb; } catch { return fb; } }
function loadLocal(): SupplyEvent[] {
  if (typeof window === "undefined") return [];
  return safeJson<SupplyEvent[]>(window.localStorage.getItem(LS_KEY), []);
}
function saveLocal(rows: SupplyEvent[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LS_KEY, JSON.stringify(rows.slice(0, 8000)));
}

async function actorEmail(): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getSession();
    return data?.session?.user?.email ?? null;
  } catch {
    return null;
  }
}

async function trySup<T>(fn: () => Promise<T>): Promise<T | null> {
  if (!isSupabaseConfigured) return null;
  try {
    return await fn();
  } catch {
    return null;
  }
}

export async function recordSupplyEvent(input: {
  way_id: string;
  event_type: string;
  segment: string;
  note?: string | null;
  meta?: Record<string, unknown>;
}) {
  const row: SupplyEvent = {
    id: uuid(),
    created_at: nowIso(),
    way_id: String(input.way_id || "").trim(),
    event_type: String(input.event_type || "").trim(),
    segment: String(input.segment || "").trim(),
    note: input.note ?? null,
    meta: input.meta ?? null,
    actor_email: await actorEmail(),
  };

  // Best-effort Supabase insert into supply_chain_events table
  const sup = await trySup(async () => {
    const res = await supabase.from("supply_chain_events").insert(row as any);
    if (res.error) throw res.error;
    return true;
  });

  if (sup) return row;

  const cur = loadLocal();
  saveLocal([row, ...cur]);
  return row;
}

export async function listMyRecentEvents(limit = 20) {
  const sup = await trySup(async () => {
    const res = await supabase.from("supply_chain_events").select("*").order("created_at", { ascending: false }).limit(limit);
    if (res.error) throw res.error;
    return (res.data ?? []) as any as SupplyEvent[];
  });

  if (sup) return sup;

  return loadLocal().sort((a, b) => (a.created_at < b.created_at ? 1 : -1)).slice(0, limit);
}

export async function listEventsByWayId(wayId: string, limit = 100) {
  const key = String(wayId || "").trim();
  if (!key) return [];

  const sup = await trySup(async () => {
    const res = await supabase.from("supply_chain_events").select("*").eq("way_id" as any, key).order("created_at", { ascending: false }).limit(limit);
    if (res.error) throw res.error;
    return (res.data ?? []) as any as SupplyEvent[];
  });

  if (sup) return sup;

  return loadLocal().filter((x) => x.way_id === key).sort((a, b) => (a.created_at < b.created_at ? 1 : -1)).slice(0, limit);
}

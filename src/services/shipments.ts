import { supabase } from "@/lib/supabase";
const isSupabaseConfigured = true; // fallback guard

export type ShipmentStatus = "CREATED" | "ASSIGNED" | "PICKED_UP" | "DELIVERED" | "CANCELLED";

export type Shipment = {
  id: string;
  way_id: string;
  created_at: string;

  sender_name?: string | null;
  sender_phone?: string | null;
  sender_address?: string | null;
  sender_city?: string | null;
  sender_state?: string | null;

  receiver_name: string;
  receiver_phone: string;
  receiver_address: string;
  receiver_city: string;
  receiver_state?: string | null;

  item_price: number;
  delivery_fee: number;
  cod_amount: number;
  package_weight?: number | null;
  cbm?: number | null;
  delivery_type?: string | null;
  remarks?: string | null;

  assigned_to_email?: string | null;

  actual_pickup_time?: string | null;
  actual_delivery_time?: string | null;

  status: ShipmentStatus;
};

const LS_KEY = "btx_shipments_v1";

function nowIso() { return new Date().toISOString(); }
function uuid() {
  const c: any = globalThis.crypto;
  return c?.randomUUID ? c.randomUUID() : `sh_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}
function safeJson<T>(raw: string | null, fb: T): T { try { return raw ? (JSON.parse(raw) as T) : fb; } catch { return fb; } }
function loadLocal(): Shipment[] {
  if (typeof window === "undefined") return [];
  return safeJson<Shipment[]>(window.localStorage.getItem(LS_KEY), []);
}
function saveLocal(rows: Shipment[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LS_KEY, JSON.stringify(rows.slice(0, 5000)));
}

function genWayId() {
  const d = new Date();
  const y = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const rand = Math.random().toString(10).slice(2, 6);
  return `BR-${y}${mm}${dd}-${rand}`;
}

async function actorEmail(): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getSession();
    return data?.session?.user?.email ?? null;
  } catch {
    return null;
  }
}

async function trySelect<T>(fn: () => Promise<T>): Promise<T | null> {
  if (!isSupabaseConfigured) return null;
  try {
    return await fn();
  } catch {
    return null;
  }
}

export async function createShipmentDataEntry(input: Omit<Shipment, "id" | "created_at" | "way_id" | "status">): Promise<{ shipmentId: string; wayId: string }> {
  const id = uuid();
  const way = genWayId();
  const created_at = nowIso();
  const email = await actorEmail();

  const row: Shipment = {
    id,
    way_id: way,
    created_at,

    sender_name: input.sender_name ?? null,
    sender_phone: input.sender_phone ?? null,
    sender_address: input.sender_address ?? null,
    sender_city: input.sender_city ?? null,
    sender_state: input.sender_state ?? null,

    receiver_name: input.receiver_name,
    receiver_phone: input.receiver_phone,
    receiver_address: input.receiver_address,
    receiver_city: input.receiver_city,
    receiver_state: input.receiver_state ?? "MM",

    item_price: Number(input.item_price || 0),
    delivery_fee: Number(input.delivery_fee || 0),
    cod_amount: Number(input.cod_amount || 0),
    package_weight: input.package_weight ?? null,
    cbm: input.cbm ?? null,
    delivery_type: input.delivery_type ?? "STANDARD",
    remarks: input.remarks ?? null,

    assigned_to_email: null,
    actual_pickup_time: null,
    actual_delivery_time: null,
    status: "CREATED",
  };

  // Supabase best-effort: insert into shipments table if it exists
  const sup = await trySelect(async () => {
    const res = await supabase
      .from("shipments")
      .insert({
        id: row.id,
        way_id: row.way_id,
        created_at: row.created_at,

        sender_name: row.sender_name,
        sender_phone: row.sender_phone,
        sender_address: row.sender_address,
        sender_city: row.sender_city,
        sender_state: row.sender_state,

        receiver_name: row.receiver_name,
        receiver_phone: row.receiver_phone,
        receiver_address: row.receiver_address,
        receiver_city: row.receiver_city,
        receiver_state: row.receiver_state,

        item_price: row.item_price,
        delivery_fee: row.delivery_fee,
        cod_amount: row.cod_amount,
        package_weight: row.package_weight,
        cbm: row.cbm,
        delivery_type: row.delivery_type,
        remarks: row.remarks,

        assigned_to_email: row.assigned_to_email,
        actual_pickup_time: row.actual_pickup_time,
        actual_delivery_time: row.actual_delivery_time,
        status: row.status,

        created_by_email: email,
      } as any)
      .select("id, way_id")
      .single();

    if (res.error) throw res.error;
    return res.data as any;
  });

  if (sup?.id && sup?.way_id) return { shipmentId: String(sup.id), wayId: String(sup.way_id) };

  // Local fallback
  const cur = loadLocal();
  saveLocal([row, ...cur]);
  return { shipmentId: row.id, wayId: row.way_id };
}

export async function listRecentShipments(limit = 50): Promise<Shipment[]> {
  const sup = await trySelect(async () => {
    const res = await supabase
      .from("shipments")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (res.error) throw res.error;
    return (res.data ?? []) as any as Shipment[];
  });

  if (sup) return sup;

  const cur = loadLocal();
  return cur.sort((a, b) => (a.created_at < b.created_at ? 1 : -1)).slice(0, limit);
}

export async function listAssignedShipments(): Promise<Shipment[]> {
  const email = await actorEmail();
  if (!email) return [];

  const sup = await trySelect(async () => {
    const res = await supabase
      .from("shipments")
      .select("*")
      .eq("assigned_to_email" as any, email)
      .order("created_at", { ascending: false })
      .limit(200);

    if (res.error) throw res.error;
    return (res.data ?? []) as any as Shipment[];
  });

  if (sup) return sup;

  return loadLocal()
    .filter((s) => (s.assigned_to_email ?? "") === email)
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
}

export async function assignShipmentToMe(id: string): Promise<void> {
  const email = await actorEmail();
  if (!email) throw new Error("NO_SESSION_EMAIL");

  const sup = await trySelect(async () => {
    const res = await supabase
      .from("shipments")
      .update({ assigned_to_email: email, status: "ASSIGNED" } as any)
      .eq("id", id);

    if (res.error) throw res.error;
    return true;
  });

  if (sup) return;

  const cur = loadLocal();
  saveLocal(cur.map((x) => (x.id === id ? { ...x, assigned_to_email: email, status: "ASSIGNED" } : x)));
}

export async function markPickedUp(id: string): Promise<void> {
  const ts = nowIso();

  const sup = await trySelect(async () => {
    const res = await supabase
      .from("shipments")
      .update({ actual_pickup_time: ts, status: "PICKED_UP" } as any)
      .eq("id", id);

    if (res.error) throw res.error;
    return true;
  });

  if (sup) return;

  const cur = loadLocal();
  saveLocal(cur.map((x) => (x.id === id ? { ...x, actual_pickup_time: ts, status: "PICKED_UP" } : x)));
}

export async function markDelivered(id: string): Promise<void> {
  const ts = nowIso();

  const sup = await trySelect(async () => {
    const res = await supabase
      .from("shipments")
      .update({ actual_delivery_time: ts, status: "DELIVERED" } as any)
      .eq("id", id);

    if (res.error) throw res.error;
    return true;
  });

  if (sup) return;

  const cur = loadLocal();
  saveLocal(cur.map((x) => (x.id === id ? { ...x, actual_delivery_time: ts, status: "DELIVERED" } : x)));
}

export async function getShipmentByWayId(wayId: string): Promise<Shipment | null> {
  const key = String(wayId || "").trim();
  if (!key) return null;

  const sup = await trySelect(async () => {
    const res = await supabase.from("shipments").select("*").eq("way_id" as any, key).limit(1);
    if (res.error) throw res.error;
    return (res.data?.[0] ?? null) as any as Shipment | null;
  });

  if (sup !== null) return sup;

  return loadLocal().find((x) => x.way_id === key) ?? null;
}

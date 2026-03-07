import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { insertShipmentTrackingEvent } from "@/services/shipmentTracking";

export type Shipment = {
  id: string;
  wayId?: string | null;
  trackingNumber?: string | null;
  status?: string | null;

  receiverName?: string | null;
  receiverPhone?: string | null;
  receiverAddress?: string | null;

  codAmount?: number | null;
  updatedAt?: string | null;
};

export async function createShipment(input: {
  sender_name?: string;
  sender_phone?: string;
  sender_address?: string;
  sender_city?: string;
  sender_state?: string;

  receiver_name: string;
  receiver_phone: string;
  receiver_address: string;
  receiver_city: string;
  receiver_state?: string;

  item_price: number;
  delivery_fee: number;
  cod_amount?: number;
  package_weight?: number | null;
  cbm?: number;
  delivery_type?: string;
  remarks?: string;

  pickup_branch_id?: string | null;
  delivery_branch_id?: string | null;
}): Promise<{ shipmentId: string; wayId: string }> {
  const { data, error } = await supabase.rpc("create_shipment_portal", {
    p_sender_name: input.sender_name ?? null,
    p_sender_phone: input.sender_phone ?? null,
    p_sender_address: input.sender_address ?? null,
    p_sender_city: input.sender_city ?? null,
    p_sender_state: input.sender_state ?? null,

    p_receiver_name: input.receiver_name,
    p_receiver_phone: input.receiver_phone,
    p_receiver_address: input.receiver_address,
    p_receiver_city: input.receiver_city,
    p_receiver_state: input.receiver_state ?? "MM",

    p_item_price: Number(input.item_price || 0),
    p_delivery_fee: Number(input.delivery_fee || 0),
    p_cod_amount: Number(input.cod_amount || 0),
    p_package_weight: input.package_weight ?? null,
    p_cbm: Number(input.cbm ?? 1),
    p_delivery_type: input.delivery_type ?? "Normal",
    p_remarks: input.remarks ?? null,

    p_pickup_branch_id: input.pickup_branch_id ?? null,
    p_delivery_branch_id: input.delivery_branch_id ?? null,
  });

  if (error) throw new Error(error.message);
  const row = Array.isArray(data) ? data[0] : data;
  return { shipmentId: row.shipment_id, wayId: row.way_id };
}

export async function createShipmentDataEntry(input: Parameters<typeof createShipment>[0]) {
  return createShipment(input);
}

function mapShipmentRow(row: any): Shipment {
  return {
    id: String(row?.id ?? row?.shipment_id ?? ""),
    wayId: row?.way_id ?? null,
    trackingNumber: row?.tracking_number ?? row?.awb ?? row?.way_id ?? null,
    status: row?.status ?? null,
    receiverName: row?.receiver_name ?? null,
    receiverPhone: row?.receiver_phone ?? null,
    receiverAddress: row?.receiver_address ?? null,
    codAmount: typeof row?.cod_amount === "number" ? row.cod_amount : row?.cod_amount ? Number(row.cod_amount) : null,
    updatedAt: row?.updated_at ?? null,
  };
}

async function currentActor() {
  try {
    const { data } = await supabase.auth.getSession();
    const u = data?.session?.user;
    return {
      userId: u?.id ?? null,
      email: u?.email ?? null,
      role: (u?.app_metadata as any)?.role ?? (u?.user_metadata as any)?.role ?? null,
    };
  } catch {
    return { userId: null, email: null, role: null };
  }
}

/**
 * EN: Enterprise rider worklist, schema-resilient.
 * MY: Rider worklist ကို schema မတူနိုင်လို့ columns အမျိုးမျိုး စမ်းပြီးရယူမည်။
 */
export async function listAssignedShipments(): Promise<Shipment[]> {
  if (!isSupabaseConfigured) return [];

  const actor = await currentActor();
  const userId = actor.userId;
  const email = actor.email;

  const selects = [
    "id,way_id,tracking_number,status,receiver_name,receiver_phone,receiver_address,cod_amount,updated_at",
    "*",
  ];

  const idCols = ["assigned_to", "assigned_rider_id", "executor_id", "rider_id", "assigned_user_id"];
  for (const sel of selects) {
    for (const col of idCols) {
      if (!userId) continue;
      const res = await supabase.from("shipments").select(sel).eq(col as any, userId).order("updated_at", { ascending: false }).limit(250);
      if (!res.error && Array.isArray(res.data)) return res.data.map(mapShipmentRow);
    }
  }

  const emailCols = ["assigned_email", "rider_email", "executor_email"];
  for (const sel of selects) {
    for (const col of emailCols) {
      if (!email) continue;
      const res = await supabase.from("shipments").select(sel).eq(col as any, email).order("updated_at", { ascending: false }).limit(250);
      if (!res.error && Array.isArray(res.data)) return res.data.map(mapShipmentRow);
    }
  }

  const fallbackStatuses = ["OUT_FOR_DELIVERY", "PICKED_UP", "IN_TRANSIT", "DELIVERY_FAILED_NDR"];
  for (const sel of selects) {
    const res = await supabase.from("shipments").select(sel).in("status" as any, fallbackStatuses as any).order("updated_at", { ascending: false }).limit(250);
    if (!res.error && Array.isArray(res.data)) return res.data.map(mapShipmentRow);
  }

  return [];
}

async function transitionShipmentBestEffort(shipmentId: string, nextStatusCandidates: string[]) {
  for (const status of nextStatusCandidates) {
    try {
      const rpc = await supabase.rpc("transition_shipment", { p_shipment_id: shipmentId, p_next_status: status });
      if (!rpc.error) return;
    } catch {}

    try {
      const upd = await supabase.from("shipments").update({ status, updated_at: new Date().toISOString() } as any).eq("id", shipmentId);
      if (!upd.error) return;
    } catch {}
  }
  throw new Error("Unable to transition shipment (schema mismatch or permission denied).");
}

async function track(eventType: string, shipmentId: string, metadata: any) {
  try {
    const actor = await currentActor();
    await insertShipmentTrackingEvent({
      shipmentId,
      eventType,
      actorId: actor.userId,
      actorRole: actor.role,
      metadata: metadata ?? {},
    });
  } catch {
    // best-effort
  }
}

export async function markPickedUp(shipmentId: string, evidence?: Record<string, unknown>) {
  await transitionShipmentBestEffort(shipmentId, ["PICKED_UP", "OUT_FOR_DELIVERY"]);
  await track("EXEC_PICKUP", shipmentId, evidence ?? {});
}

export async function markDelivered(shipmentId: string, evidence?: Record<string, unknown>) {
  await transitionShipmentBestEffort(shipmentId, ["DELIVERED", "DELIVERED_OK"]);
  await track("EXEC_DELIVERED", shipmentId, evidence ?? {});
}

export async function markDeliveryFailed(shipmentId: string, evidence?: Record<string, unknown>) {
  await transitionShipmentBestEffort(shipmentId, ["DELIVERY_FAILED_NDR", "DELIVERY_FAILED"]);
  await track("EXEC_NDR", shipmentId, evidence ?? {});
}

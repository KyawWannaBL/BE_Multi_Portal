import { supabase } from "@/lib/supabase";

export async function createShipment(input: {
  // sender optional (merchant auto-detected by email)
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

// Backward compat alias (Data Entry uses same RPC)
export async function createShipmentDataEntry(input: Parameters<typeof createShipment>[0]) {
  return createShipment(input);
}

export async function listAssignedShipments(riderId: string) {
  const { data, error } = await supabase
    .from("shipments")
    .select("*")
    .eq("assigned_rider_id", riderId)
    .order("created_at", { ascending: false });
  
  if (error) throw error;
  return data;
}

export async function listAssignedShipments(riderId: string) {
  const { data, error } = await supabase
    .from("shipments")
    .select("*")
    .eq("assigned_rider_id", riderId)
    .order("created_at", { ascending: false });
  
  if (error) throw error;
  return data;
}

export async function listAssignedShipments(riderId: string) {
  const { data, error } = await supabase
    .from("shipments")
    .select("*")
    .eq("assigned_rider_id", riderId)
    .order("created_at", { ascending: false });
  
  if (error) throw error;
  return data;
}

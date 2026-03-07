import { supabase } from "@/lib/supabase";

export type Shipment = {
  id: string;
  waybill_id?: string;
  status: string;
  updated_at?: string;
  delivery_note?: string;
  [key: string]: any;
};

export async function markDeliveryFailed(shipmentId: string, payload: any) {
  const { data, error } = await supabase
    .from("shipments")
    .update({
      status: "NDR",
      updated_at: payload.at || new Date().toISOString(),
      delivery_note: payload.note || "Delivery failed"
    })
    .eq("id", shipmentId)
    .select().single();
  if (error) throw error;
  return data;
}

export async function markPickedUp(shipmentId: string, payload?: any) {
  const { data, error } = await supabase
    .from("shipments")
    .update({
      status: "PICKED_UP",
      updated_at: payload?.at || new Date().toISOString()
    })
    .eq("id", shipmentId)
    .select().single();
  if (error) throw error;
  return data;
}

export async function markDelivered(shipmentId: string, payload?: any) {
  const { data, error } = await supabase
    .from("shipments")
    .update({
      status: "DELIVERED",
      updated_at: payload?.at || new Date().toISOString()
    })
    .eq("id", shipmentId)
    .select().single();
  if (error) throw error;
  return data;
}

export async function listAssignedShipments() {
  const { data, error } = await supabase.from("shipments").select("*");
  if (error) throw error;
  return data || [];
}

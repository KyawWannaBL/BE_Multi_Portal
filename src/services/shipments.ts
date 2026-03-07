import { supabase } from "@/lib/supabase";

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

export async function listAssignedShipments() {
  const { data, error } = await supabase.from("shipments").select("*");
  if (error) throw error;
  return data || [];
}

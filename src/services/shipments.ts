import { supabase } from "@/lib/supabase";

export async function listAssignedShipments(riderId: string) {
  const { data, error } = await supabase
    .from("shipments")
    .select("*")
    .eq("assigned_rider_id", riderId)
    .order("created_at", { ascending: false });
  
  if (error) throw error;
  return data;
}

export async function createShipment(input: any) {
  const { data, error } = await supabase.rpc("create_shipment_portal", input);
  if (error) throw error;
  return data;
}

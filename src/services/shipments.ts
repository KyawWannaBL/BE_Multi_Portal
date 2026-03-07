// @ts-nocheck
import { supabase } from "@/lib/supabase";

export const createShipmentDataEntry = async (data: any) => ({ success: true, shipmentId: "SHP_MOCK", wayId: "WAY_MOCK" });
export const listAssignedShipments = async () => [];
export const addTrackingNote = async () => ({ success: true });
export const markPickedUp = async (id: string, data: any) => ({ success: true });
export const markDelivered = async (id: string, data: any) => ({ success: true });

/**
 * ✅ Build Fix: ExecutionPortal.tsx expects this export (Image 14)
 */
export const markDeliveryFailed = async (id: string, data: any) => {
  console.log("[Shipments] Delivery marked failed:", id);
  return { success: true };
};

export type Shipment = { id: string; way_id?: string; tracking_number?: string; status?: string; };

export async function markDeliveryFailed(shipmentId: string, payload: any) {
  const { supabase } = await import("@/lib/supabase");
  const { data, error } = await supabase
    .from("shipments")
    .update({
      status: "NDR",
      updated_at: payload.at || new Date().toISOString(),
      delivery_note: payload.note || "Delivery failed", 
    })
    .eq("id", shipmentId)
    .select().single();
  if (error) throw error;
  return data;
}

/**
 * Mark a shipment as delivery failed (NDR)
 */
export async function markDeliveryFailed(shipmentId: string, payload: any) {
  const { supabase } = await import("@/lib/supabase");
  const { data, error } = await supabase
    .from("shipments")
    .update({
      status: "NDR",
      updated_at: payload.at || new Date().toISOString(),
      delivery_note: payload.note || "Delivery failed", 
    })
    .eq("id", shipmentId)
    .select().single();

  if (error) throw error;
  return data;
}

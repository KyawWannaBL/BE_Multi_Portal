import { supabase } from "@/lib/supabase";
import { assertOk } from "@/services/supabaseHelpers";
import { addTrackingNote } from "@/services/shipments";
import { getCurrentIdentity } from "@/lib/appIdentity";

export type ShipmentApproval = {
  id: string;
  shipment_id: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  requested_by: string | null;
  reviewed_by: string | null;
  requested_at: string;
  reviewed_at: string | null;
  notes: string | null;
};

export async function listPendingApprovals(): Promise<ShipmentApproval[]> {
  const res = await supabase
    .from("shipment_approvals")
    .select("id, shipment_id, status, requested_by, reviewed_by, requested_at, reviewed_at, notes")
    .eq("status", "PENDING")
    .order("requested_at", { ascending: false });

  return assertOk(res as any, "Load approvals failed") as any;
}

export async function approveShipment(approvalId: string, shipmentId: string) {
  const identity = await getCurrentIdentity();
  const res = await supabase
    .from("shipment_approvals")
    .update({
      status: "APPROVED",
      reviewed_by: identity?.user_id ?? null,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", approvalId)
    .select("id")
    .single();
  assertOk(res as any, "Approve failed");
  await addTrackingNote(shipmentId, "Supervisor approved shipment");
}

export async function rejectShipment(approvalId: string, shipmentId: string, notes: string) {
  const identity = await getCurrentIdentity();
  const res = await supabase
    .from("shipment_approvals")
    .update({
      status: "REJECTED",
      reviewed_by: identity?.user_id ?? null,
      reviewed_at: new Date().toISOString(),
      notes,
    })
    .eq("id", approvalId)
    .select("id")
    .single();
  assertOk(res as any, "Reject failed");
  await addTrackingNote(shipmentId, `Supervisor rejected shipment: ${notes}`);
}

export async function getApprovalForShipment(shipmentId: string): Promise<ShipmentApproval | null> {
  const res = await supabase
    .from("shipment_approvals")
    .select("id, shipment_id, status, requested_by, reviewed_by, requested_at, reviewed_at, notes")
    .eq("shipment_id", shipmentId)
    .order("requested_at", { ascending: false })
    .maybeSingle();

  return (res.data as any) ?? null;
}

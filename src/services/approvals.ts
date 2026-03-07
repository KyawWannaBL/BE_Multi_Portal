// @ts-nocheck
import { supabase } from "@/lib/supabase";
import { safeSelect } from "@/services/supabaseHelpers";
import { addTrackingNote } from "@/services/shipments";
import { getCurrentIdentity } from "@/lib/appIdentity";

/**
 * Approvals Service (EN/MM)
 * EN: Supervisor approvals + tracking note integration.
 * MY: Supervisor အတည်ပြုချက်များ + tracking note ချိတ်ဆက်မှု။
 */

export async function listPendingApprovals(limit = 50) {
  // EN: Try common table/fields; if missing return []
  // MY: မတူညီတဲ့ schema ရှိနိုင်လို့ safe select
  const res = await safeSelect(
    supabase.from("shipments").select("*").eq("status", "PENDING").order("created_at", { ascending: false }).limit(limit)
  );
  return res.data ?? [];
}

export async function approveShipment(wayId: string, note?: string) {
  const id = getCurrentIdentity();
  try {
    await supabase.from("shipments").update({ status: "APPROVED" }).eq("way_id", wayId);
  } catch {}
  if (note) {
    await addTrackingNote(wayId, `APPROVED: ${note}`, { actor: id });
  } else {
    await addTrackingNote(wayId, "APPROVED", { actor: id });
  }
  return { success: true };
}

export async function rejectShipment(wayId: string, reason?: string) {
  const id = getCurrentIdentity();
  try {
    await supabase.from("shipments").update({ status: "REJECTED" }).eq("way_id", wayId);
  } catch {}
  await addTrackingNote(wayId, `REJECTED: ${reason ?? "N/A"}`, { actor: id });
  return { success: true };
}

// @ts-nocheck
import { supabase } from "@/lib/supabase";
import { safeSelect } from "@/services/supabaseHelpers";

/**
 * Admin Service (EN/MM)
 * EN: Safe functions for Admin pages. Won't crash if tables missing.
 * MY: Admin စာမျက်နှာတွေမှာ သုံးဖို့ safe functions. table မရှိရင်လည်း မပျက်။
 */

export async function countProfiles() {
  const res = await safeSelect(supabase.from("profiles").select("id", { count: "exact", head: true }));
  return res.count ?? 0;
}

export async function listProfiles(limit = 50) {
  const res = await safeSelect(
    supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(limit)
  );
  return res.data ?? [];
}

export async function listAuditLogs(limit = 50) {
  const res = await safeSelect(
    supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(limit)
  );
  return res.data ?? [];
}

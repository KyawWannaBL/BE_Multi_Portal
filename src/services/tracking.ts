// @ts-nocheck
import { supabase } from "@/lib/supabase";
import { safeSelect } from "@/services/supabaseHelpers";

/**
 * Tracking Service (EN/MM)
 * EN: Live tracking reads (courier_locations).
 * MY: courier_locations မှ live tracking ဖတ်ရန်။
 */
export async function listCourierLocations(limit = 200) {
  const res = await safeSelect(
    supabase.from("courier_locations").select("*").order("updated_at", { ascending: false }).limit(limit)
  );
  return res.data ?? [];
}

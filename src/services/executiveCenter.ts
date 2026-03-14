import { supabase } from "@/lib/supabase";
export async function getExecKPIs() {
  const { data, error } = await supabase.from("exec_dashboard_kpis_v").select("*").maybeSingle();
  if (error) throw error;
  return data;
}

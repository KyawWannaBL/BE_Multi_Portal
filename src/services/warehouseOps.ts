import { supabase } from "@/lib/supabase";
export async function listWarehouseTasks(scope: "ALL" | "MINE") {
  const { data: { session } } = await supabase.auth.getSession();
  let query = supabase.from("warehouse_tasks").select("*").order("created_at", { ascending: false });
  if (scope === "MINE") query = query.eq("assigned_to_email", session?.user?.email);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

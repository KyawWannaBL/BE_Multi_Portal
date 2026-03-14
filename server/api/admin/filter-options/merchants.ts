import { supabase } from "@/lib/supabase";

export default async function handler(req: any, res: any) {
  try {
    const { data, error } = await supabase.rpc("rpc_filter_options_merchants");
    if (error) throw error;
    res.status(200).json(Array.isArray(data) ? data : []);
  } catch (err: any) {
    res.status(500).json({ items: [], error: err?.message || "Failed to load merchant options" });
  }
}

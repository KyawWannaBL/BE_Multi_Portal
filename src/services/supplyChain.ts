import { supabase } from "@/lib/supabase";

export async function recordSupplyEvent(input: any) {
  const { data, error } = await supabase.rpc("record_supply_event", {
    p_way_id: input.way_id,
    p_event_type: input.event_type,
    p_segment: input.segment,
    p_location_type: input.location_type || null,
    p_location_id: input.location_id || null,
    p_note: input.note || null,
    p_meta: input.meta || {}
  });
  if (error) throw error;
  return data;
}

export async function listMyRecentEvents(limit = 20) {
  const { data, error } = await supabase
    .from("supply_chain_events")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

export async function traceByWayId(wayId: string) {
  const { data, error } = await supabase
    .from("supply_chain_events")
    .select("*")
    .eq("way_id", wayId.toUpperCase())
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data;
}

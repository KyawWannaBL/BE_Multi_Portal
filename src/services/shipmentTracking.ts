import { supabase } from "@/lib/supabase";

export async function findShipmentIdByWayId(wayId: string): Promise<string | null> {
  if (!wayId) return null;
  try {
    const res = await supabase.from("shipments").select("id").eq("way_id", wayId).limit(1).maybeSingle();
    if (res.error) return null;
    return (res.data as any)?.id ?? null;
  } catch {
    return null;
  }
}

export async function insertShipmentTrackingEvent(input: {
  wayId?: string | null;
  shipmentId?: string | null;
  eventType: string;
  stopIndex?: number | null;
  stopLabel?: string | null;
  lat?: number | null;
  lng?: number | null;
  accuracy?: number | null;
  actorId?: string | null;
  actorRole?: string | null;
  metadata?: any;
}) {
  const payload = {
    shipment_id: input.shipmentId ?? null,
    way_id: input.wayId ?? null,
    event_type: input.eventType,
    stop_index: input.stopIndex ?? null,
    stop_label: input.stopLabel ?? null,
    lat: input.lat ?? null,
    lng: input.lng ?? null,
    accuracy: input.accuracy ?? null,
    actor_id: input.actorId ?? null,
    actor_role: input.actorRole ?? null,
    metadata: input.metadata ?? {},
  };

  return supabase.from("shipment_tracking").insert(payload);
}

export async function upsertCourierLocationWithMetrics(input: {
  userId: string;
  lat: number;
  lng: number;
  heading?: number | null;
  speed?: number | null;
  accuracy?: number | null;
  updatedAt: string;
  remainingMeters?: number | null;
  etaSeconds?: number | null;
  nextStopIndex?: number | null;
  nextStopEta?: string | null;
  routeId?: string | null;
}) {
  const payload = {
    user_id: input.userId,
    lat: input.lat,
    lng: input.lng,
    heading: input.heading ?? null,
    speed: input.speed ?? null,
    accuracy: input.accuracy ?? null,
    remaining_meters: input.remainingMeters ?? null,
    eta_seconds: input.etaSeconds ?? null,
    next_stop_index: input.nextStopIndex ?? null,
    next_stop_eta: input.nextStopEta ?? null,
    route_id: input.routeId ?? null,
    updated_at: input.updatedAt,
  };

  return supabase.from("courier_locations").upsert(payload, { onConflict: "user_id" });
}

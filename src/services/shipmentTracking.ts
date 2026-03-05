import { supabase } from "@/lib/supabase";

/**
 * EN: Parse AWB/way_id from a stop label.
 * MY: Stop label ထဲက AWB/way_id ကို ထုတ်ယူမည်။
 */
export function parseWayIdFromLabel(label: string | null | undefined): string | null {
  const s = String(label ?? "").trim();
  if (!s) return null;

  const m = s.match(/(?:AWB|WAYBILL|WAY_ID|WAYID|WAY|WB)\s*[:#-]?\s*([A-Z0-9-]{6,})/i);
  if (m?.[1]) return m[1].toUpperCase();

  const m2 = s.match(/^\s*([A-Z0-9-]{6,})\b/);
  if (m2?.[1]) return m2[1].toUpperCase();

  return null;
}

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

/**
 * EN: Best-effort delivery update by way_id. Tries common columns.
 * MY: way_id နဲ့ delivery update (schema မတူနိုင်လို့ columns အမျိုးမျိုး စမ်းမည်)
 */
export async function markShipmentDeliveredByWayId(input: { wayId: string; deliveredAtIso?: string }) {
  const wayId = input.wayId;
  if (!wayId) return { data: null, error: { message: "Missing wayId" } };

  const ts = input.deliveredAtIso || new Date().toISOString();

  const payloads = [
    { status: "DELIVERED", actual_delivery_time: ts, delivered_at: ts, updated_at: ts },
    { status: "DELIVERED", actual_delivery_time: ts },
    { actual_delivery_time: ts },
    { delivered_at: ts },
    { status: "DELIVERED" },
  ];

  let lastErr: any = null;

  for (const p of payloads) {
    try {
      const res = await supabase.from("shipments").update(p as any).eq("way_id", wayId);
      if (!res.error) return res;
      lastErr = res.error;
    } catch (e: any) {
      lastErr = e;
    }
  }

  return { data: null, error: lastErr };
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

/**
 * EN: Upload photo/signature to Supabase Storage bucket "pod".
 * MY: Photo/signature ကို Supabase Storage bucket "pod" သို့ upload လုပ်မည်။
 *
 * NOTE: Create bucket "pod" in Supabase Storage UI.
 */
export async function uploadPodArtifact(input: {
  shipmentId: string | null;
  wayId: string | null;
  kind: "photo" | "signature";
  file: File;
}): Promise<{ bucket: string; path: string; url: string | null }> {
  const bucket = "pod";
  const base = input.shipmentId || input.wayId || "unknown";
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const ext = (input.file.name.split(".").pop() || (input.kind === "signature" ? "png" : "jpg")).toLowerCase();
  const path = `${base}/${ts}_${input.kind}.${ext}`;

  const res = await supabase.storage.from(bucket).upload(path, input.file, {
    upsert: true,
    contentType: input.file.type || (input.kind === "signature" ? "image/png" : "image/jpeg"),
  });
  if (res.error) throw res.error;

  const pub = supabase.storage.from(bucket).getPublicUrl(path);
  const url = pub?.data?.publicUrl || null;
  return { bucket, path, url };
}

/**
 * EN: OTP verification helper:
 * - If shipment has OTP on record -> verify equality.
 * - If OTP fields not found -> "unknown".
 *
 * MY: OTP စစ်ဆေးမှု:
 * - shipment ထဲမှာ OTP ရှိရင် ကိုက်ညီမှု စစ်မည်
 * - field မရှိရင် unknown
 */
export async function verifyShipmentOtpBestEffort(input: {
  shipmentId: string | null;
  wayId: string | null;
  otp: string;
}): Promise<{ mode: "verified" | "mismatch" | "unknown" }> {
  const otp = String(input.otp || "").trim();
  if (!otp) return { mode: "mismatch" };

  try {
    let row: any = null;

    if (input.shipmentId) {
      const res = await supabase.from("shipments").select("delivery_otp,otp,pod_otp,way_id").eq("id", input.shipmentId).maybeSingle();
      if (!res.error) row = res.data;
    } else if (input.wayId) {
      const res = await supabase.from("shipments").select("delivery_otp,otp,pod_otp,way_id").eq("way_id", input.wayId).limit(1).maybeSingle();
      if (!res.error) row = res.data;
    }

    const dbOtp = String(row?.delivery_otp || row?.pod_otp || row?.otp || "").trim();
    if (!dbOtp) return { mode: "unknown" };
    return dbOtp === otp ? { mode: "verified" } : { mode: "mismatch" };
  } catch {
    return { mode: "unknown" };
  }
}

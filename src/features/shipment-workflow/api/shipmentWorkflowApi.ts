/**
 * EN: Shared data access helpers for shipment workflow
 * MM: Shipment workflow အတွက် shared data access helper များ
 */

import { supabase } from "@/lib/supabase";
import type { ShipmentEventRecord, ShipmentRecord } from "../types";

function normalizeCode(code: string): string {
  return String(code || "").trim();
}

export async function findShipmentByCode(code: string): Promise<ShipmentRecord> {
  const normalized = normalizeCode(code);

  if (!normalized) {
    throw new Error("Shipment code is required.");
  }

  // EN: Search by tracking_no / way_no / parcel_no
  // MM: tracking_no / way_no / parcel_no ဖြင့် ရှာဖွေမည်
  const { data, error } = await supabase
    .from("shipments")
    .select("*")
    .or(
      `tracking_no.eq.${normalized},way_no.eq.${normalized},parcel_no.eq.${normalized}`
    )
    .limit(1)
    .single();

  if (error) {
    throw new Error(error.message || "Shipment not found.");
  }

  return data as ShipmentRecord;
}

export async function insertShipmentEvent(event: ShipmentEventRecord) {
  const { data, error } = await supabase
    .from("shipment_events")
    .insert({
      shipment_id: event.shipmentId,
      tracking_no: event.trackingNo ?? null,
      way_no: event.wayNo ?? null,
      parcel_no: event.parcelNo ?? null,
      event_type: event.eventType,
      actor_id: event.actorId ?? null,
      actor_role: event.actorRole ?? null,
      device_id: event.deviceId ?? null,
      lat: event.lat ?? null,
      lng: event.lng ?? null,
      scanned_code: event.scannedCode ?? null,
      signature_data_url: event.signatureDataUrl ?? null,
      notes: event.notes ?? null,
      meta: event.meta ?? {},
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message || "Could not save shipment event.");
  }

  return data;
}

export async function insertShipmentLocation(input: {
  shipmentId: string;
  actorId?: string | null;
  actorRole?: string | null;
  lat: number;
  lng: number;
}) {
  const { data, error } = await supabase
    .from("shipment_locations")
    .insert({
      shipment_id: input.shipmentId,
      actor_id: input.actorId ?? null,
      actor_role: input.actorRole ?? null,
      lat: input.lat,
      lng: input.lng,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message || "Could not save shipment location.");
  }

  return data;
}

export async function insertShipmentSignature(input: {
  shipmentId: string;
  actorId?: string | null;
  actorRole?: string | null;
  signatureDataUrl: string;
  lat?: number | null;
  lng?: number | null;
}) {
  const { data, error } = await supabase
    .from("shipment_signatures")
    .insert({
      shipment_id: input.shipmentId,
      actor_id: input.actorId ?? null,
      actor_role: input.actorRole ?? null,
      signature_data_url: input.signatureDataUrl,
      lat: input.lat ?? null,
      lng: input.lng ?? null,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message || "Could not save shipment signature.");
  }

  return data;
}

export async function updateShipmentStatus(input: {
  shipmentId: string;
  status: string;
  extra?: Record<string, unknown>;
}) {
  const payload = {
    status: input.status,
    ...(input.extra || {}),
  };

  const { data, error } = await supabase
    .from("shipments")
    .update(payload)
    .eq("id", input.shipmentId)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message || "Could not update shipment status.");
  }

  return data as ShipmentRecord;
}

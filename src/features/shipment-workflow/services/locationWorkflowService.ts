/**
 * EN: Mapbox / location workflow service
 * MM: Mapbox / location workflow service
 */

import { insertShipmentLocation } from "../api/shipmentWorkflowApi";
import { logShipmentEvent } from "./shipmentEventService";
import type { ShipmentLocationInput } from "../types";

export async function updateShipmentLocation(input: ShipmentLocationInput) {
  if (!input.shipmentId) {
    throw new Error("Shipment ID is required.");
  }

  if (typeof input.lat !== "number" || typeof input.lng !== "number") {
    throw new Error("Latitude and longitude are required.");
  }

  const location = await insertShipmentLocation({
    shipmentId: input.shipmentId,
    actorId: input.actorId ?? null,
    actorRole: input.actorRole ?? null,
    lat: input.lat,
    lng: input.lng,
  });

  if (input.statusEvent) {
    await logShipmentEvent({
      shipmentId: input.shipmentId,
      actorId: input.actorId ?? null,
      actorRole: input.actorRole ?? null,
      lat: input.lat,
      lng: input.lng,
      eventType: input.statusEvent,
      meta: {
        source: "mapbox",
        locationId: location?.id ?? null,
      },
    });
  }

  return location;
}

export async function markOutForDelivery(input: ShipmentLocationInput) {
  return updateShipmentLocation({
    ...input,
    statusEvent: "OUT_FOR_DELIVERY",
  });
}

export async function markArrivedAtStop(input: ShipmentLocationInput) {
  return updateShipmentLocation({
    ...input,
    statusEvent: "ARRIVED_AT_STOP",
  });
}

/**
 * EN: Signature workflow service
 * MM: Signature workflow service
 */

import { insertShipmentSignature } from "../api/shipmentWorkflowApi";
import { logShipmentEvent } from "./shipmentEventService";
import type { ShipmentSignatureInput } from "../types";

export async function saveDeliverySignature(input: ShipmentSignatureInput) {
  if (!input.shipmentId) {
    throw new Error("Shipment ID is required.");
  }

  if (!input.signatureDataUrl) {
    throw new Error("Signature data is required.");
  }

  const signature = await insertShipmentSignature({
    shipmentId: input.shipmentId,
    actorId: input.actorId ?? null,
    actorRole: input.actorRole ?? null,
    signatureDataUrl: input.signatureDataUrl,
    lat: input.lat ?? null,
    lng: input.lng ?? null,
  });

  await logShipmentEvent({
    shipmentId: input.shipmentId,
    actorId: input.actorId ?? null,
    actorRole: input.actorRole ?? null,
    lat: input.lat ?? null,
    lng: input.lng ?? null,
    signatureDataUrl: input.signatureDataUrl,
    notes: input.notes ?? null,
    eventType: "SIGNATURE_CAPTURED",
    meta: {
      source: "signature-pad",
      signatureId: signature?.id ?? null,
    },
  });

  return signature;
}

export async function confirmDeliveredWithSignature(input: ShipmentSignatureInput) {
  const signature = await saveDeliverySignature(input);

  await logShipmentEvent({
    shipmentId: input.shipmentId,
    actorId: input.actorId ?? null,
    actorRole: input.actorRole ?? null,
    lat: input.lat ?? null,
    lng: input.lng ?? null,
    signatureDataUrl: input.signatureDataUrl,
    notes: input.notes ?? null,
    eventType: "DELIVERED",
    meta: {
      source: "signature-pad",
      signatureId: signature?.id ?? null,
      proof: "recipient-signature",
    },
  });

  return signature;
}

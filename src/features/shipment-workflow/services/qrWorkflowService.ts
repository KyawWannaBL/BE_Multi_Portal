/**
 * EN: QR scan workflow service
 * MM: QR scan workflow service
 */

import { findShipmentByCode } from "../api/shipmentWorkflowApi";
import { logShipmentEvent } from "./shipmentEventService";
import type { ShipmentExecutionContext } from "../types";

export async function handleQrScan(code: string, context: ShipmentExecutionContext = {}) {
  const shipment = await findShipmentByCode(code);

  await logShipmentEvent({
    shipmentId: shipment.id,
    trackingNo: shipment.tracking_no ?? null,
    wayNo: shipment.way_no ?? null,
    parcelNo: shipment.parcel_no ?? null,
    scannedCode: code,
    actorId: context.actorId ?? null,
    actorRole: context.actorRole ?? null,
    deviceId: context.deviceId ?? null,
    lat: context.lat ?? null,
    lng: context.lng ?? null,
    eventType: "QR_SCANNED",
    meta: {
      source: "qr",
    },
  });

  return shipment;
}

/**
 * EN: Central event logger for shipment workflow
 * MM: Shipment workflow အတွက် အဓိက event logger
 */

import { insertShipmentEvent, updateShipmentStatus } from "../api/shipmentWorkflowApi";
import type { ShipmentEventRecord, ShipmentEventType } from "../types";

function statusForEvent(eventType: ShipmentEventType): string | null {
  switch (eventType) {
    case "PICKUP_CONFIRMED":
      return "PICKED_UP";
    case "OUT_FOR_DELIVERY":
      return "OUT_FOR_DELIVERY";
    case "ARRIVED_AT_STOP":
      return "ARRIVED";
    case "DELIVERED":
      return "DELIVERED";
    case "FAILED_DELIVERY":
      return "FAILED";
    case "RETURNED":
      return "RETURNED";
    default:
      return null;
  }
}

export async function logShipmentEvent(event: ShipmentEventRecord) {
  const savedEvent = await insertShipmentEvent(event);

  const nextStatus = statusForEvent(event.eventType);
  if (nextStatus) {
    await updateShipmentStatus({
      shipmentId: event.shipmentId,
      status: nextStatus,
    });
  }

  return savedEvent;
}

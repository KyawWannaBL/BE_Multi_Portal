/**
 * EN: Unified shipment execution hook
 * MM: Unified shipment execution hook
 */

import { useState } from "react";
import { handleQrScan } from "../services/qrWorkflowService";
import { confirmDeliveredWithSignature, saveDeliverySignature } from "../services/signatureWorkflowService";
import { markArrivedAtStop, markOutForDelivery, updateShipmentLocation } from "../services/locationWorkflowService";
import { logShipmentEvent } from "../services/shipmentEventService";
import type { ShipmentExecutionContext, ShipmentRecord } from "../types";

export function useShipmentExecution() {
  const [shipment, setShipment] = useState<ShipmentRecord | null>(null);
  const [loading, setLoading] = useState(false);

  async function scan(code: string, context: ShipmentExecutionContext = {}) {
    setLoading(true);
    try {
      const data = await handleQrScan(code, context);
      setShipment(data);
      return data;
    } finally {
      setLoading(false);
    }
  }

  async function sign(signatureDataUrl: string, context: ShipmentExecutionContext & { notes?: string | null } = {}) {
    if (!shipment?.id) {
      throw new Error("No active shipment selected.");
    }

    return saveDeliverySignature({
      shipmentId: shipment.id,
      signatureDataUrl,
      actorId: context.actorId ?? null,
      actorRole: context.actorRole ?? null,
      lat: context.lat ?? null,
      lng: context.lng ?? null,
      notes: context.notes ?? null,
    });
  }

  async function confirmDelivered(signatureDataUrl: string, context: ShipmentExecutionContext & { notes?: string | null } = {}) {
    if (!shipment?.id) {
      throw new Error("No active shipment selected.");
    }

    return confirmDeliveredWithSignature({
      shipmentId: shipment.id,
      signatureDataUrl,
      actorId: context.actorId ?? null,
      actorRole: context.actorRole ?? null,
      lat: context.lat ?? null,
      lng: context.lng ?? null,
      notes: context.notes ?? null,
    });
  }

  async function updateLocation(lat: number, lng: number, context: ShipmentExecutionContext = {}) {
    if (!shipment?.id) {
      throw new Error("No active shipment selected.");
    }

    return updateShipmentLocation({
      shipmentId: shipment.id,
      lat,
      lng,
      actorId: context.actorId ?? null,
      actorRole: context.actorRole ?? null,
      deviceId: context.deviceId ?? null,
    });
  }

  async function startDelivery(lat: number, lng: number, context: ShipmentExecutionContext = {}) {
    if (!shipment?.id) {
      throw new Error("No active shipment selected.");
    }

    return markOutForDelivery({
      shipmentId: shipment.id,
      lat,
      lng,
      actorId: context.actorId ?? null,
      actorRole: context.actorRole ?? null,
      deviceId: context.deviceId ?? null,
    });
  }

  async function arrive(lat: number, lng: number, context: ShipmentExecutionContext = {}) {
    if (!shipment?.id) {
      throw new Error("No active shipment selected.");
    }

    return markArrivedAtStop({
      shipmentId: shipment.id,
      lat,
      lng,
      actorId: context.actorId ?? null,
      actorRole: context.actorRole ?? null,
      deviceId: context.deviceId ?? null,
    });
  }

  async function failDelivery(notes: string, context: ShipmentExecutionContext = {}) {
    if (!shipment?.id) {
      throw new Error("No active shipment selected.");
    }

    return logShipmentEvent({
      shipmentId: shipment.id,
      trackingNo: shipment.tracking_no ?? null,
      wayNo: shipment.way_no ?? null,
      parcelNo: shipment.parcel_no ?? null,
      actorId: context.actorId ?? null,
      actorRole: context.actorRole ?? null,
      lat: context.lat ?? null,
      lng: context.lng ?? null,
      notes,
      eventType: "FAILED_DELIVERY",
      meta: {
        source: "execution-hook",
      },
    });
  }

  async function markReturned(notes: string, context: ShipmentExecutionContext = {}) {
    if (!shipment?.id) {
      throw new Error("No active shipment selected.");
    }

    return logShipmentEvent({
      shipmentId: shipment.id,
      trackingNo: shipment.tracking_no ?? null,
      wayNo: shipment.way_no ?? null,
      parcelNo: shipment.parcel_no ?? null,
      actorId: context.actorId ?? null,
      actorRole: context.actorRole ?? null,
      lat: context.lat ?? null,
      lng: context.lng ?? null,
      notes,
      eventType: "RETURNED",
      meta: {
        source: "execution-hook",
      },
    });
  }

  return {
    shipment,
    loading,
    setShipment,
    scan,
    sign,
    confirmDelivered,
    updateLocation,
    startDelivery,
    arrive,
    failDelivery,
    markReturned,
  };
}

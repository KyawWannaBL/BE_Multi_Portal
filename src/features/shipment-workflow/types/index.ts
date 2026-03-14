/**
 * EN: Shared shipment workflow types
 * MM: Shipment workflow အတွက် မျှဝေသုံးနိုင်သော type များ
 */

export type ShipmentEventType =
  | "QR_SCANNED"
  | "PICKUP_CONFIRMED"
  | "OUT_FOR_DELIVERY"
  | "ARRIVED_AT_STOP"
  | "SIGNATURE_CAPTURED"
  | "DELIVERED"
  | "FAILED_DELIVERY"
  | "RETURNED";

export type ShipmentWorkflowPayload = {
  shipmentId: string;
  trackingNo?: string | null;
  wayNo?: string | null;
  parcelNo?: string | null;
  actorId?: string | null;
  actorRole?: string | null;
  deviceId?: string | null;
  lat?: number | null;
  lng?: number | null;
  scannedCode?: string | null;
  signatureDataUrl?: string | null;
  notes?: string | null;
  meta?: Record<string, unknown>;
};

export type ShipmentEventRecord = ShipmentWorkflowPayload & {
  eventType: ShipmentEventType;
  createdAt?: string;
};

export type ShipmentRecord = {
  id: string;
  tracking_no?: string | null;
  way_no?: string | null;
  parcel_no?: string | null;
  status?: string | null;
  merchant_id?: string | null;
  rider_id?: string | null;
  branch_id?: string | null;
  delivery_date?: string | null;
  parcel_count?: number | null;
  [key: string]: unknown;
};

export type ShipmentExecutionContext = {
  actorId?: string | null;
  actorRole?: string | null;
  deviceId?: string | null;
  lat?: number | null;
  lng?: number | null;
};

export type ShipmentSignatureInput = ShipmentExecutionContext & {
  shipmentId: string;
  signatureDataUrl: string;
  notes?: string | null;
};

export type ShipmentLocationInput = ShipmentExecutionContext & {
  shipmentId: string;
  statusEvent?: Extract<ShipmentEventType, "ARRIVED_AT_STOP" | "OUT_FOR_DELIVERY">;
};

export type ShipmentScanInput = ShipmentExecutionContext & {
  code: string;
};

export type WorkflowState =
  | "DRAFT"
  | "ORDER_CAPTURED"
  | "PICKUP_ASSIGNED"
  | "PICKUP_SECURED"
  | "WAREHOUSE_INBOUND"
  | "WAREHOUSE_QC_HOLD"
  | "WAREHOUSE_READY"
  | "ROUTE_DISPATCHED"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "FAILED_ATTEMPT"
  | "RETURN_TO_HUB"
  | "CANCELLED";

export type EvidenceType =
  | "PICKUP_PHOTO"
  | "WAREHOUSE_INBOUND_PHOTO"
  | "WAREHOUSE_DAMAGE_PHOTO"
  | "DELIVERY_PHOTO"
  | "DELIVERY_SIGNATURE"
  | "LABEL_OCR_SOURCE";

export type ParcelLine = {
  id?: string;
  sku: string;
  description: string;
  qty: number;
  weightKg: number;
  value: number;
  barcodeValue?: string;
  qrValue?: string;
};

export type DeliveryDraft = {
  id?: string;
  trackingNo: string;
  qrLinkCode: string;
  merchantName: string;
  merchantPhone: string;
  merchantAddress: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  township: string;
  serviceLevel: string;
  paymentMode: string;
  codAmount: number;
  fragile: boolean;
  temperatureSensitive: boolean;
  requiresWarehouseCheck: boolean;
  pickupWindow: string;
  deliveryWindow: string;
  note: string;
  parcels: ParcelLine[];
  workflowState?: WorkflowState;
};

export type WorkflowEvent = {
  id: string;
  deliveryId: string;
  eventType: string;
  fromState?: WorkflowState;
  toState?: WorkflowState;
  actorName?: string;
  actorRole?: string;
  reason?: string;
  lat?: number;
  lng?: number;
  createdAt: string;
  eventPayload?: Record<string, unknown>;
};

export type EvidenceAsset = {
  id: string;
  deliveryId: string;
  eventId?: string;
  evidenceType: EvidenceType;
  storageBucket: string;
  storagePath: string;
  fileName?: string;
  mimeType?: string;
  qualityScore?: number;
  metadata?: Record<string, unknown>;
};

export type RouteStop = {
  id: string;
  label: string;
  lat: number;
  lng: number;
  status?: string;
  eta?: string;
};

export type LiveRouteSnapshot = {
  rider: { label: string; lat: number; lng: number };
  stops: RouteStop[];
  updatedAt: string;
};

export type OcrStructuredRow = {
  trackingNo?: string;
  senderName?: string;
  senderPhone?: string;
  receiverName?: string;
  receiverPhone?: string;
  address?: string;
  township?: string;
  note?: string;
};

export type OcrExtractionResult = {
  id?: string;
  rawText: string;
  confidence: number;
  rows: OcrStructuredRow[];
};

export type WaySummary = {
  id: string;
  trackingNo: string;
  merchant: string;
  receiver: string;
  township: string;
  rider?: string;
  currentStage: WorkflowState;
  status: string;
  eta?: string;
  lat?: number;
  lng?: number;
  photoScore?: number;
  exception?: string;
};

export type PickupSecurePayload = {
  deliveryId: string;
  trackingNo: string;
  tamperTag: string;
  pickupBagCode?: string;
  merchantName?: string;
  riderName?: string;
  expectedPieces: number;
  actualPieces: number;
  sealIntact: boolean;
  warehouseDestination: string;
  note?: string;
  evidenceIds?: string[];
  signatureId?: string;
  gps?: { lat: number; lng: number };
};

export type WarehouseInboundPayload = {
  deliveryId: string;
  scannedTrackingNo: string;
  inboundWarehouse: string;
  slotCode?: string;
  conditionStatus: "PASS" | "HOLD" | "DAMAGED";
  discrepancyNote?: string;
  evidenceIds?: string[];
  ocrExtractionId?: string;
};

export type DeliveryProofPayload = {
  deliveryId: string;
  trackingNo: string;
  deliveredTo: string;
  receiverRole?: string;
  codCollected?: number;
  note?: string;
  signatureId?: string;
  evidenceIds?: string[];
  gps?: { lat: number; lng: number };
};

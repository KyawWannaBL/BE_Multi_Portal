import { enterpriseApi } from "./client";
import type {
  PickupSecurePayload,
  WarehouseInboundPayload,
  DeliveryProofPayload,
  WorkflowEvent,
} from "../types/domain";

export async function pickupSecured(payload: PickupSecurePayload) {
  return enterpriseApi.post<{ event: WorkflowEvent; nextState: string }>(
    "/workflow/pickup-secured",
    payload
  );
}

export async function warehouseInbound(payload: WarehouseInboundPayload) {
  return enterpriseApi.post<{ event: WorkflowEvent; nextState: string }>(
    "/workflow/warehouse-inbound",
    payload
  );
}

export async function warehouseQc(
  payload: WarehouseInboundPayload & { decision: "PASS" | "HOLD" | "DAMAGED" }
) {
  return enterpriseApi.post<{ event: WorkflowEvent; nextState: string }>(
    "/workflow/warehouse-qc",
    payload
  );
}

export async function warehouseDispatch(payload: {
  deliveryId: string;
  trackingNo: string;
  batchId?: string;
  riderId?: string;
  riderName?: string;
  dispatchWarehouse: string;
}) {
  return enterpriseApi.post<{ event: WorkflowEvent; nextState: string }>(
    "/workflow/warehouse-dispatch",
    payload
  );
}

export async function markOutForDelivery(payload: {
  deliveryId: string;
  trackingNo: string;
  riderId?: string;
  riderName?: string;
}) {
  return enterpriseApi.post<{ event: WorkflowEvent; nextState: string }>(
    "/workflow/out-for-delivery",
    payload
  );
}

export async function proofOfDelivery(payload: DeliveryProofPayload) {
  return enterpriseApi.post<{ event: WorkflowEvent; nextState: string }>(
    "/workflow/proof-of-delivery",
    payload
  );
}

export async function markDeliveryFailed(payload: {
  deliveryId: string;
  trackingNo: string;
  reason: string;
  evidenceIds?: string[];
  gps?: { lat: number; lng: number };
}) {
  return enterpriseApi.post<{ event: WorkflowEvent; nextState: string }>(
    "/workflow/failure",
    payload
  );
}

export async function getWorkflowHistory(deliveryId: string) {
  return enterpriseApi.get<{ items: WorkflowEvent[] }>(`/deliveries/${deliveryId}/events`);
}

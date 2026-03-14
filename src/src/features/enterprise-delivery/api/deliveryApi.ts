import { enterpriseApi } from "./client";
import type { DeliveryDraft, WaySummary } from "../types/domain";

export async function createDeliveryDraft(payload: DeliveryDraft) {
  return enterpriseApi.post<{ id: string; trackingNo: string; workflowState: string }>(
    "/deliveries",
    payload
  );
}

export async function updateDeliveryDraft(deliveryId: string, payload: Partial<DeliveryDraft>) {
  return enterpriseApi.patch<{ id: string; workflowState: string }>(
    `/deliveries/${deliveryId}`,
    payload
  );
}

export async function getDelivery(deliveryId: string) {
  return enterpriseApi.get<any>(`/deliveries/${deliveryId}`);
}

export async function searchWays(query: Record<string, string | number | undefined>) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value) !== "") {
      params.set(key, String(value));
    }
  });
  return enterpriseApi.get<{ items: WaySummary[]; total: number }>(
    `/deliveries/search?${params.toString()}`
  );
}

export async function assignRider(deliveryId: string, payload: { riderId?: string; riderName?: string; batchId?: string }) {
  return enterpriseApi.post(`/deliveries/${deliveryId}/assignments`, payload);
}

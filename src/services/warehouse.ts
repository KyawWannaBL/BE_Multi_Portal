// @ts-nocheck
import { recordSupplyEvent } from "@/services/supplyChain";

/**
 * Warehouse Service (EN/MM)
 * EN: Wraps supply chain recording.
 * MY: supply chain event များကို wrapper လုပ်ထားသည်။
 */
export async function receiveWayId(wayId: string) {
  return recordSupplyEvent("WH_RECEIVED", { way_id: wayId });
}

export async function dispatchWayId(wayId: string) {
  return recordSupplyEvent("WH_DISPATCHED", { way_id: wayId });
}

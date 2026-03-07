// @ts-nocheck
import { recordSupplyEvent } from "@/services/supplyChain";

export async function inboundWayId(wayId: string) {
  return recordSupplyEvent("BR_INBOUND", { way_id: wayId });
}

export async function outboundWayId(wayId: string) {
  return recordSupplyEvent("BR_OUTBOUND", { way_id: wayId });
}

import { qrWorkflowService } from "./qrWorkflowService";
import { signatureWorkflowService } from "./signatureWorkflowService";
import { locationWorkflowService } from "./locationWorkflowService";
import { parcelPhotoWorkflowService } from "@/features/parcel-capture/services/parcelPhotoWorkflowService";

export async function startPickupWorkflow(payload: any) {
  return {
    step: "pickup_started",
    qr: await qrWorkflowService?.preparePickupQr?.(payload).catch(() => null),
    location: await locationWorkflowService?.captureCurrentLocation?.().catch(() => null),
  };
}

export async function startDeliveryWorkflow(payload: any) {
  return {
    step: "delivery_started",
    qr: await qrWorkflowService?.prepareDeliveryQr?.(payload).catch(() => null),
    location: await locationWorkflowService?.captureCurrentLocation?.().catch(() => null),
  };
}

export async function completeDeliveryWorkflow(payload: any) {
  return {
    step: "delivery_completed",
    signature: await signatureWorkflowService?.saveSignature?.(payload.signature).catch(() => null),
    qr: await qrWorkflowService?.verifyDeliveryQr?.(payload.qr).catch(() => null),
    location: await locationWorkflowService?.captureCurrentLocation?.().catch(() => null),
    photo: payload.photo ? await parcelPhotoWorkflowService?.processParcelPhoto?.(payload.photo).catch(() => null) : null,
  };
}

export async function failDeliveryWorkflow(payload: any) {
  return {
    step: "delivery_failed",
    qr: await qrWorkflowService?.verifyFailureQr?.(payload.qr).catch(() => null),
    location: await locationWorkflowService?.captureCurrentLocation?.().catch(() => null),
    photo: payload.photo ? await parcelPhotoWorkflowService?.processParcelPhoto?.(payload.photo).catch(() => null) : null,
    reason: payload.reason || null,
  };
}

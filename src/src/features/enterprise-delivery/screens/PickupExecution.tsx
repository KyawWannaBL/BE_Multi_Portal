import React, { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { ArrowRight, ShieldCheck, Truck } from "lucide-react";
import { pickupSecured } from "../api/workflowApi";
import { registerEvidence, requestPresignedUpload, uploadFileToPresignedUrl } from "../api/mediaApi";
import { DELIVERY_PERMISSIONS } from "../auth/permissions";
import PermissionGuard from "../auth/PermissionGuard";
import {
  DeviceFriendlyQrScanner,
  PhotoEvidenceCapture,
} from "../components/FieldOpsToolkit";
import PhotoReviewPanel from "../components/PhotoReviewPanel";
import SignaturePad from "../components/SignaturePad";
import { Field, Panel, PrimaryButton, ScreenShell, TextAreaField } from "./_shared";

export default function PickupExecution({ auth }: { auth: any }) {
  const [payload, setPayload] = useState({
    deliveryId: "",
    trackingNo: "",
    tamperTag: "",
    pickupBagCode: "",
    merchantName: "",
    riderName: "",
    expectedPieces: 1,
    actualPieces: 1,
    sealIntact: true,
    warehouseDestination: "Yangon Main Hub",
    note: "",
  });
  const [photoAssessment, setPhotoAssessment] = useState<any>(null);
  const [evidenceIds, setEvidenceIds] = useState<string[]>([]);
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const readiness = useMemo(() => {
    return (
      payload.trackingNo &&
      payload.tamperTag &&
      payload.expectedPieces === payload.actualPieces &&
      (photoAssessment?.score || 0) >= 60 &&
      Boolean(signatureDataUrl)
    );
  }, [payload, photoAssessment, signatureDataUrl]);

  const finalizePickup = async () => {
    try {
      setBusy(true);
      await pickupSecured({
        ...payload,
        evidenceIds,
        signatureId: signatureDataUrl ? "signature-captured-on-client" : undefined,
        gps: { lat: 16.84, lng: 96.17 },
      });
      toast.success(`Pickup secured for ${payload.trackingNo}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to secure pickup.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <PermissionGuard
      auth={auth}
      require={DELIVERY_PERMISSIONS.PICKUP_EXECUTE}
      fallback={<DeniedCard label="pickup execution" />}
    >
      <ScreenShell
        title="Pickup execution"
        subtitle="Secure the merchant handover with scans, tamper controls, evidence photos, and a signature before the parcel enters the warehouse chain."
        actions={
          <PrimaryButton onClick={finalizePickup} disabled={!readiness || busy}>
            <ShieldCheck size={16} />
            {busy ? "Submitting..." : "Secure pickup"}
          </PrimaryButton>
        }
      >
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <Panel title="Scan and identify" subtitle="Capture the parcel, tamper tag, and route bag from any supported device.">
              <div className="grid gap-4 md:grid-cols-2">
                <DeviceFriendlyQrScanner
                  title="Shipment scan"
                  helperText="Read the waybill first. Every next control point uses this code."
                  placeholder="Tracking no"
                  onDetected={(result) =>
                    setPayload((prev) => ({ ...prev, trackingNo: result.rawText }))
                  }
                />

                <DeviceFriendlyQrScanner
                  title="Tamper tag bind"
                  helperText="Link the seal or security tag before pickup leaves the merchant."
                  placeholder="Tamper tag"
                  onDetected={(result) =>
                    setPayload((prev) => ({ ...prev, tamperTag: result.rawText }))
                  }
                />
              </div>

              <div className="mt-4">
                <DeviceFriendlyQrScanner
                  title="Pickup bag / route bag"
                  helperText="Recommended when batching multiple parcels or sending inbound to a main hub."
                  placeholder="Bag code"
                  onDetected={(result) =>
                    setPayload((prev) => ({ ...prev, pickupBagCode: result.rawText }))
                  }
                />
              </div>
            </Panel>

            <Panel title="Verification" subtitle="Confirm the counts and rider accountability before custody lock.">
              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  label="Delivery id"
                  value={payload.deliveryId}
                  onChange={(value) => setPayload((prev) => ({ ...prev, deliveryId: value }))}
                />
                <Field
                  label="Merchant name"
                  value={payload.merchantName}
                  onChange={(value) => setPayload((prev) => ({ ...prev, merchantName: value }))}
                />
                <Field
                  label="Rider name"
                  value={payload.riderName}
                  onChange={(value) => setPayload((prev) => ({ ...prev, riderName: value }))}
                />
                <Field
                  label="Warehouse destination"
                  value={payload.warehouseDestination}
                  onChange={(value) =>
                    setPayload((prev) => ({ ...prev, warehouseDestination: value }))
                  }
                />
                <Field
                  label="Expected pieces"
                  type="number"
                  value={payload.expectedPieces}
                  onChange={(value) =>
                    setPayload((prev) => ({ ...prev, expectedPieces: Number(value || 0) }))
                  }
                />
                <Field
                  label="Actual pieces"
                  type="number"
                  value={payload.actualPieces}
                  onChange={(value) =>
                    setPayload((prev) => ({ ...prev, actualPieces: Number(value || 0) }))
                  }
                />
              </div>

              <div className="mt-4">
                <TextAreaField
                  label="Pickup note"
                  value={payload.note}
                  onChange={(value) => setPayload((prev) => ({ ...prev, note: value }))}
                />
              </div>
            </Panel>

            <Panel title="Evidence and merchant confirmation" subtitle="Capture a usable parcel photo and handover signature.">
              <div className="grid gap-4 xl:grid-cols-2">
                <PhotoEvidenceCapture
                  title="Pickup parcel evidence"
                  helperText="Frame the parcel, label, seal, and merchant context in one shot."
                  onReady={({ assessment }) => {
                    setPhotoAssessment(assessment);
                  }}
                />
                <SignaturePad
                  title="Merchant or pickup operator signature"
                  onChange={({ dataUrl }) => setSignatureDataUrl(dataUrl)}
                />
              </div>
            </Panel>
          </div>

          <div className="space-y-6">
            <PhotoReviewPanel assessment={photoAssessment} />

            <Panel title="Operational readiness" subtitle="Only valid handovers should be allowed into warehouse flow.">
              <div className="space-y-3">
                <Check label="Tracking and tamper tag are present" ok={Boolean(payload.trackingNo && payload.tamperTag)} />
                <Check label="Piece count matches" ok={payload.expectedPieces === payload.actualPieces} />
                <Check label="Photo quality is acceptable" ok={(photoAssessment?.score || 0) >= 60} />
                <Check label="Signature has been captured" ok={Boolean(signatureDataUrl)} />
              </div>
            </Panel>

            <Panel title="Server actions" subtitle="Suggested backend side effects on successful pickup.">
              <ul className="space-y-2 text-sm text-white/70">
                <li>• create `PICKUP_SECURED` workflow event</li>
                <li>• attach seal, bag, rider, GPS, and evidence references</li>
                <li>• create or update warehouse inbound task</li>
                <li>• notify warehouse lane dashboard for expected arrival</li>
              </ul>
            </Panel>
          </div>
        </div>
      </ScreenShell>
    </PermissionGuard>
  );
}

function Check({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div
      className={`rounded-2xl border px-4 py-3 text-sm ${
        ok
          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
          : "border-white/10 bg-white/5 text-white/60"
      }`}
    >
      {label}
    </div>
  );
}

function DeniedCard({ label }: { label: string }) {
  return (
    <div className="min-h-screen bg-[#070c16] p-8 text-white">
      <div className="mx-auto max-w-xl rounded-3xl border border-rose-500/20 bg-rose-500/10 p-6">
        <div className="text-lg font-black">Permission required</div>
        <div className="mt-2 text-sm text-rose-200">
          You do not have access to {label}.
        </div>
      </div>
    </div>
  );
}

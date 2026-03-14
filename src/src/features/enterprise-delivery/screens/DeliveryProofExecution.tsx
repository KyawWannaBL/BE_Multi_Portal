import React, { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { MapPin, ScanLine, Signature, Truck } from "lucide-react";
import { markDeliveryFailed, proofOfDelivery } from "../api/workflowApi";
import { DELIVERY_PERMISSIONS } from "../auth/permissions";
import PermissionGuard from "../auth/PermissionGuard";
import {
  DeviceFriendlyQrScanner,
  PhotoEvidenceCapture,
} from "../components/FieldOpsToolkit";
import LiveRouteMapPanel from "../components/LiveRouteMapPanel";
import PhotoReviewPanel from "../components/PhotoReviewPanel";
import SignaturePad from "../components/SignaturePad";
import { useRealtimeRoute } from "../hooks/useRealtimeRoute";
import { Field, Panel, PrimaryButton, ScreenShell, TextAreaField } from "./_shared";

export default function DeliveryProofExecution({ auth }: { auth: any }) {
  const [payload, setPayload] = useState({
    deliveryId: "",
    trackingNo: "",
    deliveredTo: "",
    receiverRole: "Customer",
    codCollected: 0,
    note: "",
  });
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const [photoAssessment, setPhotoAssessment] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const { snapshot } = useRealtimeRoute("sample-route-batch");

  const ready = useMemo(
    () =>
      payload.deliveryId &&
      payload.trackingNo &&
      payload.deliveredTo &&
      Boolean(signatureDataUrl) &&
      (photoAssessment?.score || 0) >= 60,
    [payload, signatureDataUrl, photoAssessment]
  );

  const submitPod = async () => {
    try {
      setBusy(true);
      await proofOfDelivery({
        ...payload,
        signatureId: signatureDataUrl ? "signature-captured-on-client" : undefined,
        evidenceIds: [],
        gps: { lat: snapshot.rider.lat, lng: snapshot.rider.lng },
      });
      toast.success(`Proof of delivery saved for ${payload.trackingNo}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save proof of delivery.");
    } finally {
      setBusy(false);
    }
  };

  const failDelivery = async () => {
    try {
      setBusy(true);
      await markDeliveryFailed({
        deliveryId: payload.deliveryId,
        trackingNo: payload.trackingNo,
        reason: payload.note || "Customer unavailable",
        gps: { lat: snapshot.rider.lat, lng: snapshot.rider.lng },
      });
      toast.success(`Failure captured for ${payload.trackingNo}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to capture delivery failure.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <PermissionGuard
      auth={auth}
      require={DELIVERY_PERMISSIONS.POD_CAPTURE}
      fallback={<DeniedCard label="proof of delivery execution" />}
    >
      <ScreenShell
        title="Delivery proof and exception handling"
        subtitle="Close the last mile with verified scan, live location, photo evidence, receiver signature, COD capture, and controlled failure reasons."
        actions={
          <>
            <PrimaryButton onClick={submitPod} disabled={!ready || busy}>
              <Signature size={16} />
              {busy ? "Submitting..." : "Complete delivery"}
            </PrimaryButton>
            <PrimaryButton onClick={failDelivery} disabled={!payload.trackingNo || busy}>
              <Truck size={16} />
              Mark failed
            </PrimaryButton>
          </>
        }
      >
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <Panel title="Destination scan and receiver details" subtitle="The driver should scan at the door or final checkpoint before capturing proof.">
              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  label="Delivery id"
                  value={payload.deliveryId}
                  onChange={(value) => setPayload((prev) => ({ ...prev, deliveryId: value }))}
                />
                <Field
                  label="Delivered to"
                  value={payload.deliveredTo}
                  onChange={(value) => setPayload((prev) => ({ ...prev, deliveredTo: value }))}
                />
                <Field
                  label="Receiver role"
                  value={payload.receiverRole}
                  onChange={(value) => setPayload((prev) => ({ ...prev, receiverRole: value }))}
                />
                <Field
                  label="COD collected"
                  type="number"
                  value={payload.codCollected}
                  onChange={(value) =>
                    setPayload((prev) => ({ ...prev, codCollected: Number(value || 0) }))
                  }
                />
              </div>

              <div className="mt-4">
                <DeviceFriendlyQrScanner
                  title="Delivery destination scan"
                  helperText="Scan the parcel again at the final handover point to prevent wrong-drop incidents."
                  placeholder="Tracking number"
                  onDetected={(result) =>
                    setPayload((prev) => ({ ...prev, trackingNo: result.rawText }))
                  }
                />
              </div>

              <div className="mt-4">
                <TextAreaField
                  label="Delivery note / failure reason"
                  value={payload.note}
                  onChange={(value) => setPayload((prev) => ({ ...prev, note: value }))}
                />
              </div>
            </Panel>

            <Panel title="Proof bundle" subtitle="Use both photo and signature for enterprise-grade auditability.">
              <div className="grid gap-4 xl:grid-cols-2">
                <PhotoEvidenceCapture
                  title="Delivery photo"
                  helperText="Capture parcel, receiver handover context, and delivery environment without exposing unnecessary personal data."
                  onReady={({ assessment }) => setPhotoAssessment(assessment)}
                />
                <SignaturePad
                  title="Receiver signature"
                  onChange={({ dataUrl }) => setSignatureDataUrl(dataUrl)}
                />
              </div>
            </Panel>
          </div>

          <div className="space-y-6">
            <Panel title="Live route location" subtitle="Final-mile proof should include where the rider was when the event was captured.">
              <LiveRouteMapPanel rider={snapshot.rider} stops={snapshot.stops} />
              <div className="mt-3 text-xs text-white/55">
                Last update: {new Date(snapshot.updatedAt).toLocaleString()}
              </div>
            </Panel>

            <PhotoReviewPanel assessment={photoAssessment} />

            <Panel title="Completion readiness" subtitle="Recommended proof requirements before server acceptance.">
              <div className="space-y-3">
                <Row label="Final scan completed" ok={Boolean(payload.trackingNo)} />
                <Row label="Receiver name captured" ok={Boolean(payload.deliveredTo)} />
                <Row label="Signature captured" ok={Boolean(signatureDataUrl)} />
                <Row label="Photo quality acceptable" ok={(photoAssessment?.score || 0) >= 60} />
              </div>
            </Panel>
          </div>
        </div>
      </ScreenShell>
    </PermissionGuard>
  );
}

function Row({ label, ok }: { label: string; ok: boolean }) {
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

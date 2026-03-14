import React, { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Boxes, CheckCircle2, ScanLine, Warehouse } from "lucide-react";
import { warehouseDispatch, warehouseInbound, warehouseQc } from "../api/workflowApi";
import { DELIVERY_PERMISSIONS } from "../auth/permissions";
import PermissionGuard from "../auth/PermissionGuard";
import {
  DeviceFriendlyQrScanner,
  PhotoEvidenceCapture,
  parseCargoTextToRows,
} from "../components/FieldOpsToolkit";
import PhotoReviewPanel from "../components/PhotoReviewPanel";
import WorkflowTimeline from "../components/WorkflowTimeline";
import { Field, Panel, PrimaryButton, ScreenShell, TextAreaField } from "./_shared";

const mockEvents = [
  {
    id: "e1",
    deliveryId: "d1",
    eventType: "ORDER_CAPTURED",
    fromState: "DRAFT",
    toState: "ORDER_CAPTURED",
    actorName: "System",
    createdAt: new Date().toISOString(),
  },
  {
    id: "e2",
    deliveryId: "d1",
    eventType: "PICKUP_SECURED",
    fromState: "ORDER_CAPTURED",
    toState: "PICKUP_SECURED",
    actorName: "Ko Min Thu",
    actorRole: "RIDER",
    createdAt: new Date().toISOString(),
  },
];

export default function WarehouseHubExecution({ auth }: { auth: any }) {
  const [payload, setPayload] = useState({
    deliveryId: "",
    scannedTrackingNo: "",
    inboundWarehouse: "Yangon Main Hub",
    slotCode: "A1-03-02",
    conditionStatus: "PASS" as "PASS" | "HOLD" | "DAMAGED",
    discrepancyNote: "",
  });
  const [photoAssessment, setPhotoAssessment] = useState<any>(null);
  const [ocrRows, setOcrRows] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);

  const canRelease = useMemo(
    () =>
      payload.scannedTrackingNo &&
      payload.slotCode &&
      (photoAssessment?.score || 0) >= 60 &&
      payload.conditionStatus !== "HOLD",
    [payload, photoAssessment]
  );

  const submitInbound = async () => {
    try {
      setBusy(true);
      await warehouseInbound(payload);
      if (payload.conditionStatus === "PASS") {
        await warehouseQc({ ...payload, decision: "PASS" });
      }
      toast.success(`Warehouse inbound recorded for ${payload.scannedTrackingNo}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Warehouse inbound failed.");
    } finally {
      setBusy(false);
    }
  };

  const releaseDispatch = async () => {
    try {
      setBusy(true);
      await warehouseDispatch({
        deliveryId: payload.deliveryId,
        trackingNo: payload.scannedTrackingNo,
        dispatchWarehouse: payload.inboundWarehouse,
        riderName: "Auto-wave assignment",
      });
      toast.success(`Released ${payload.scannedTrackingNo} to dispatch.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Dispatch release failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <PermissionGuard
      auth={auth}
      require={[
        DELIVERY_PERMISSIONS.WAREHOUSE_INBOUND_SCAN,
        DELIVERY_PERMISSIONS.WAREHOUSE_INBOUND_QC,
      ]}
      fallback={<DeniedCard label="warehouse execution" />}
    >
      <ScreenShell
        title="Warehouse inbound, QC, and dispatch"
        subtitle="Control the warehouse leg with inbound scan, photo quality checks, OCR label consistency review, slot assignment, and outbound release."
        actions={
          <>
            <PrimaryButton onClick={submitInbound} disabled={busy}>
              <CheckCircle2 size={16} />
              {busy ? "Processing..." : "Record inbound"}
            </PrimaryButton>
            <PrimaryButton onClick={releaseDispatch} disabled={!canRelease || busy}>
              <Boxes size={16} />
              Release to dispatch
            </PrimaryButton>
          </>
        }
      >
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <Panel title="Inbound scan" subtitle="The first warehouse operator validates that the parcel entering the hub matches the expected shipment.">
              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  label="Delivery id"
                  value={payload.deliveryId}
                  onChange={(value) => setPayload((prev) => ({ ...prev, deliveryId: value }))}
                />
                <Field
                  label="Inbound warehouse"
                  value={payload.inboundWarehouse}
                  onChange={(value) =>
                    setPayload((prev) => ({ ...prev, inboundWarehouse: value }))
                  }
                />
              </div>

              <div className="mt-4">
                <DeviceFriendlyQrScanner
                  title="Inbound parcel scan"
                  helperText="Confirm the tracked parcel is the one that physically arrived."
                  placeholder="Tracking number"
                  onDetected={(result) =>
                    setPayload((prev) => ({ ...prev, scannedTrackingNo: result.rawText }))
                  }
                />
              </div>
            </Panel>

            <Panel title="Condition and slotting" subtitle="Warehouse QC must keep bad evidence and damaged condition from silently moving to dispatch.">
              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  label="Slot code"
                  value={payload.slotCode}
                  onChange={(value) => setPayload((prev) => ({ ...prev, slotCode: value }))}
                />
                <label className="block">
                  <div className="mb-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/45">
                    Condition status
                  </div>
                  <select
                    value={payload.conditionStatus}
                    onChange={(e) =>
                      setPayload((prev) => ({
                        ...prev,
                        conditionStatus: e.target.value as "PASS" | "HOLD" | "DAMAGED",
                      }))
                    }
                    className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-emerald-500"
                  >
                    <option value="PASS">PASS</option>
                    <option value="HOLD">HOLD</option>
                    <option value="DAMAGED">DAMAGED</option>
                  </select>
                </label>
              </div>

              <div className="mt-4">
                <TextAreaField
                  label="Discrepancy note"
                  value={payload.discrepancyNote}
                  onChange={(value) =>
                    setPayload((prev) => ({ ...prev, discrepancyNote: value }))
                  }
                />
              </div>
            </Panel>

            <Panel title="Evidence and OCR review" subtitle="Use parcel photo quality scoring plus OCR normalization to avoid dispatching unreadable or mismatched labels.">
              <div className="grid gap-4 xl:grid-cols-2">
                <PhotoEvidenceCapture
                  title="Inbound condition photo"
                  helperText="Capture full parcel surface, label, and any visible damage."
                  onReady={({ assessment }) => setPhotoAssessment(assessment)}
                />
                <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
                  <div className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                    OCR normalization preview
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const rows = parseCargoTextToRows(
                        `TRACK: ${payload.scannedTrackingNo}
                         RECEIVER: Sample Receiver
                         09xxxxxxxx
                         Sample Address`
                      );
                      setOcrRows(rows);
                      toast.success("OCR preview updated.");
                    }}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-black uppercase text-white"
                  >
                    Build OCR preview
                  </button>

                  {ocrRows.length ? (
                    <div className="mt-4 space-y-3">
                      {ocrRows.map((row, index) => (
                        <div
                          key={index}
                          className="rounded-2xl border border-white/5 bg-[#0B1220] p-4 text-sm text-white/75"
                        >
                          <div>Tracking: {row.trackingNo || "-"}</div>
                          <div>Receiver: {row.receiverName || "-"}</div>
                          <div>Phone: {row.receiverPhone || "-"}</div>
                          <div>Address: {row.address || "-"}</div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </Panel>
          </div>

          <div className="space-y-6">
            <PhotoReviewPanel assessment={photoAssessment} />
            <WorkflowTimeline events={mockEvents as any} title="Current shipment timeline" />
            <Panel title="Dispatch gate" subtitle="Recommended release criteria before the parcel leaves the hub.">
              <div className="space-y-3">
                <GateRow label="Parcel was inbound-scanned" ok={Boolean(payload.scannedTrackingNo)} />
                <GateRow label="Photo quality is usable" ok={(photoAssessment?.score || 0) >= 60} />
                <GateRow label="Slot code assigned" ok={Boolean(payload.slotCode)} />
                <GateRow label="Condition is not on hold" ok={payload.conditionStatus !== "HOLD"} />
              </div>
            </Panel>
          </div>
        </div>
      </ScreenShell>
    </PermissionGuard>
  );
}

function GateRow({ label, ok }: { label: string; ok: boolean }) {
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

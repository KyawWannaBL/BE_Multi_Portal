import React, { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Download, Plus, Save, ScanLine, Sparkles, Wand2 } from "lucide-react";
import { createDeliveryDraft } from "../api/deliveryApi";
import { DELIVERY_PERMISSIONS } from "../auth/permissions";
import PermissionGuard from "../auth/PermissionGuard";
import {
  DeviceFriendlyQrScanner,
  PhotoEvidenceCapture,
  parseCargoTextToRows,
} from "../components/FieldOpsToolkit";
import PhotoReviewPanel from "../components/PhotoReviewPanel";
import { Field, Panel, PrimaryButton, ScreenShell, TextAreaField } from "./_shared";
import type { DeliveryDraft, ParcelLine } from "../types/domain";

const emptyLine = (): ParcelLine => ({
  sku: "",
  description: "",
  qty: 1,
  weightKg: 1,
  value: 0,
});

const buildTrackingNo = () =>
  `MM-${new Date().getFullYear()}-${Math.floor(Math.random() * 900000 + 100000)}`;

export default function CreateDeliveryEnterprise({
  auth,
}: {
  auth: any;
}) {
  const [draft, setDraft] = useState<DeliveryDraft>({
    trackingNo: buildTrackingNo(),
    qrLinkCode: "",
    merchantName: "",
    merchantPhone: "",
    merchantAddress: "",
    receiverName: "",
    receiverPhone: "",
    receiverAddress: "",
    township: "",
    serviceLevel: "Same Day",
    paymentMode: "COD",
    codAmount: 0,
    fragile: false,
    temperatureSensitive: false,
    requiresWarehouseCheck: true,
    pickupWindow: "09:00 - 11:00",
    deliveryWindow: "14:00 - 18:00",
    note: "",
    parcels: [emptyLine()],
  });

  const [photoAssessment, setPhotoAssessment] = useState<any>(null);
  const [ocrRows, setOcrRows] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);

  const summary = useMemo(() => {
    const totalPieces = draft.parcels.reduce((sum, line) => sum + Number(line.qty || 0), 0);
    const totalWeight = draft.parcels.reduce(
      (sum, line) => sum + Number(line.qty || 0) * Number(line.weightKg || 0),
      0
    );
    const totalValue = draft.parcels.reduce(
      (sum, line) => sum + Number(line.qty || 0) * Number(line.value || 0),
      0
    );
    return {
      totalPieces,
      totalWeight: totalWeight.toFixed(2),
      totalValue: totalValue.toFixed(2),
    };
  }, [draft.parcels]);

  const saveOrder = async () => {
    try {
      setBusy(true);
      await createDeliveryDraft(draft);
      toast.success(`Draft created for ${draft.trackingNo}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create delivery draft.");
    } finally {
      setBusy(false);
    }
  };

  const setParcel = (index: number, patch: Partial<ParcelLine>) => {
    setDraft((prev) => ({
      ...prev,
      parcels: prev.parcels.map((line, i) => (i === index ? { ...line, ...patch } : line)),
    }));
  };

  return (
    <PermissionGuard
      auth={auth}
      require={DELIVERY_PERMISSIONS.ORDER_CREATE}
      fallback={<DeniedCard label="Create delivery" />}
    >
      <ScreenShell
        title="Create delivery order"
        subtitle="Capture enterprise delivery jobs through manual entry, QR intake, and OCR-assisted label parsing. This screen is wired for pricing, parcel detail capture, warehouse routing, and downstream proof workflows."
        actions={
          <>
            <PrimaryButton onClick={saveOrder} disabled={busy}>
              <Save size={16} />
              {busy ? "Saving..." : "Create order"}
            </PrimaryButton>
          </>
        }
      >
        <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-6">
            <Panel
              title="Order header"
              subtitle="Create the shipment record that will drive pickup, warehouse QC, dispatch, and proof-of-delivery."
            >
              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  label="Tracking no"
                  value={draft.trackingNo}
                  onChange={(value) => setDraft((prev) => ({ ...prev, trackingNo: value }))}
                />
                <Field
                  label="QR code value"
                  value={draft.qrLinkCode}
                  onChange={(value) => setDraft((prev) => ({ ...prev, qrLinkCode: value }))}
                />
                <Field
                  label="Merchant name"
                  value={draft.merchantName}
                  onChange={(value) => setDraft((prev) => ({ ...prev, merchantName: value }))}
                />
                <Field
                  label="Merchant phone"
                  value={draft.merchantPhone}
                  onChange={(value) => setDraft((prev) => ({ ...prev, merchantPhone: value }))}
                />
                <Field
                  label="Receiver name"
                  value={draft.receiverName}
                  onChange={(value) => setDraft((prev) => ({ ...prev, receiverName: value }))}
                />
                <Field
                  label="Receiver phone"
                  value={draft.receiverPhone}
                  onChange={(value) => setDraft((prev) => ({ ...prev, receiverPhone: value }))}
                />
                <Field
                  label="Township"
                  value={draft.township}
                  onChange={(value) => setDraft((prev) => ({ ...prev, township: value }))}
                />
                <Field
                  label="COD amount"
                  type="number"
                  value={draft.codAmount}
                  onChange={(value) =>
                    setDraft((prev) => ({ ...prev, codAmount: Number(value || 0) }))
                  }
                />
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <TextAreaField
                  label="Merchant address"
                  value={draft.merchantAddress}
                  onChange={(value) => setDraft((prev) => ({ ...prev, merchantAddress: value }))}
                />
                <TextAreaField
                  label="Receiver address"
                  value={draft.receiverAddress}
                  onChange={(value) => setDraft((prev) => ({ ...prev, receiverAddress: value }))}
                />
              </div>

              <div className="mt-4">
                <TextAreaField
                  label="Special handling note"
                  value={draft.note}
                  onChange={(value) => setDraft((prev) => ({ ...prev, note: value }))}
                />
              </div>
            </Panel>

            <Panel
              title="QR and OCR intake"
              subtitle="Use scan-first intake when labels already exist. Camera, uploaded image, and manual fallback are all supported."
              aside={
                <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70">
                  <Sparkles size={14} />
                  Multi-device friendly
                </div>
              }
            >
              <div className="grid gap-4 lg:grid-cols-2">
                <DeviceFriendlyQrScanner
                  title="Shipment or waybill scan"
                  helperText="Read printed QR or barcode from camera, uploaded image, or manual text."
                  placeholder="Tracking / waybill"
                  onDetected={(result) =>
                    setDraft((prev) => ({
                      ...prev,
                      trackingNo: result.rawText,
                      qrLinkCode: result.rawText,
                    }))
                  }
                />

                <PhotoEvidenceCapture
                  title="Label image for OCR"
                  helperText="Capture the label. The frontend already evaluates image quality and can send it to your OCR backend."
                  onReady={({ assessment }) => setPhotoAssessment(assessment)}
                />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const rows = parseCargoTextToRows(
                      `TRACK: ${draft.trackingNo}
                       Sender: ${draft.merchantName}
                       Receiver: ${draft.receiverName}
                       ${draft.receiverPhone}
                       ${draft.receiverAddress}`
                    );
                    setOcrRows(rows);
                    if (rows[0]) {
                      setDraft((prev) => ({
                        ...prev,
                        receiverName: rows[0].receiverName || prev.receiverName,
                        receiverPhone: rows[0].receiverPhone || prev.receiverPhone,
                        receiverAddress: rows[0].address || prev.receiverAddress,
                        township: rows[0].township || prev.township,
                      }));
                    }
                    toast.success("OCR normalization preview generated.");
                  }}
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-black uppercase text-white"
                >
                  <Wand2 size={15} />
                  Normalize OCR preview
                </button>

                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(draft.trackingNo)}
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-black uppercase text-white"
                >
                  <Download size={15} />
                  Copy tracking no
                </button>
              </div>

              {ocrRows.length ? (
                <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-black/30 text-white/45">
                      <tr>
                        <th className="p-3">Tracking</th>
                        <th className="p-3">Receiver</th>
                        <th className="p-3">Phone</th>
                        <th className="p-3">Address</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {ocrRows.map((row, index) => (
                        <tr key={index}>
                          <td className="p-3">{row.trackingNo || "-"}</td>
                          <td className="p-3">{row.receiverName || "-"}</td>
                          <td className="p-3">{row.receiverPhone || "-"}</td>
                          <td className="p-3">{row.address || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </Panel>

            <Panel
              title="Parcel lines"
              subtitle="Capture the physical inventory so downstream weight, risk scoring, warehouse slotting, and claims are consistent."
              aside={
                <button
                  type="button"
                  onClick={() =>
                    setDraft((prev) => ({ ...prev, parcels: [...prev.parcels, emptyLine()] }))
                  }
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-black uppercase text-white"
                >
                  <Plus size={14} />
                  Add parcel line
                </button>
              }
            >
              <div className="space-y-4">
                {draft.parcels.map((line, index) => (
                  <div
                    key={index}
                    className="grid gap-3 rounded-2xl border border-white/5 bg-black/20 p-4 md:grid-cols-5"
                  >
                    <Field
                      label="SKU"
                      value={line.sku}
                      onChange={(value) => setParcel(index, { sku: value })}
                    />
                    <Field
                      label="Description"
                      value={line.description}
                      onChange={(value) => setParcel(index, { description: value })}
                    />
                    <Field
                      label="Qty"
                      type="number"
                      value={line.qty}
                      onChange={(value) => setParcel(index, { qty: Number(value || 0) })}
                    />
                    <Field
                      label="Weight kg"
                      type="number"
                      value={line.weightKg}
                      onChange={(value) => setParcel(index, { weightKg: Number(value || 0) })}
                    />
                    <Field
                      label="Value"
                      type="number"
                      value={line.value}
                      onChange={(value) => setParcel(index, { value: Number(value || 0) })}
                    />
                  </div>
                ))}
              </div>
            </Panel>
          </div>

          <div className="space-y-6">
            <Panel title="Shipment summary" subtitle="Calculated from parcel lines and order values.">
              <div className="grid gap-3">
                <SummaryRow label="Pieces" value={summary.totalPieces} />
                <SummaryRow label="Weight kg" value={summary.totalWeight} />
                <SummaryRow label="Declared value" value={summary.totalValue} />
                <SummaryRow label="Warehouse QC" value={draft.requiresWarehouseCheck ? "Required" : "Optional"} />
              </div>
            </Panel>

            <PhotoReviewPanel assessment={photoAssessment} />

            <Panel title="Backend wiring notes" subtitle="This screen is ready to call real services.">
              <ul className="space-y-2 text-sm text-white/70">
                <li>• `createDeliveryDraft()` persists the shipment shell and parcel lines.</li>
                <li>• OCR can be sent to `/api/ocr/extract` or normalized server-side.</li>
                <li>• Photos should go through presigned upload and then `registerEvidence()`.</li>
                <li>• Final create should emit `ORDER_CAPTURED` in the workflow event stream.</li>
              </ul>
            </Panel>
          </div>
        </div>
      </ScreenShell>
    </PermissionGuard>
  );
}

function SummaryRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-black/20 px-4 py-3">
      <div className="text-sm text-white/65">{label}</div>
      <div className="text-sm font-semibold text-white">{value}</div>
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

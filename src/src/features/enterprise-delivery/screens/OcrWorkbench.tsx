import React, { useState } from "react";
import toast from "react-hot-toast";
import { Wand2 } from "lucide-react";
import { extractFromRawText } from "../api/ocrApi";
import { DELIVERY_PERMISSIONS } from "../auth/permissions";
import PermissionGuard from "../auth/PermissionGuard";
import { PhotoEvidenceCapture, parseCargoTextToRows } from "../components/FieldOpsToolkit";
import PhotoReviewPanel from "../components/PhotoReviewPanel";
import { Panel, PrimaryButton, ScreenShell, TextAreaField } from "./_shared";

export default function OcrWorkbench({ auth }: { auth: any }) {
  const [rawText, setRawText] = useState("");
  const [rows, setRows] = useState<any[]>([]);
  const [photoAssessment, setPhotoAssessment] = useState<any>(null);
  const [busy, setBusy] = useState(false);

  const normalize = async () => {
    try {
      setBusy(true);
      const result = await extractFromRawText({ rawText });
      setRows(result.rows || []);
      toast.success("OCR text normalized to structured rows.");
    } catch {
      const fallback = parseCargoTextToRows(rawText);
      setRows(fallback);
      toast("Using frontend fallback parser.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <PermissionGuard
      auth={auth}
      require={[DELIVERY_PERMISSIONS.OCR_EXTRACT, DELIVERY_PERMISSIONS.OCR_REVIEW]}
      fallback={<DeniedCard label="OCR workbench" />}
    >
      <ScreenShell
        title="OCR workbench"
        subtitle="Normalize cargo label text into structured operational data that can feed create-delivery, warehouse QC, and exception resolution screens."
        actions={
          <PrimaryButton onClick={() => void normalize()} disabled={!rawText.trim() || busy}>
            <Wand2 size={16} />
            {busy ? "Normalizing..." : "Normalize OCR text"}
          </PrimaryButton>
        }
      >
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <Panel title="OCR source" subtitle="Use raw OCR text from your backend or paste a captured label transcript.">
              <TextAreaField label="Raw OCR text" value={rawText} onChange={setRawText} rows={12} />
            </Panel>

            <Panel title="Structured table" subtitle="Parsed output ready for mapping into delivery records.">
              <div className="overflow-hidden rounded-2xl border border-white/10">
                <table className="w-full text-left text-xs">
                  <thead className="bg-black/30 text-white/45">
                    <tr>
                      <th className="p-3">Tracking</th>
                      <th className="p-3">Sender</th>
                      <th className="p-3">Receiver</th>
                      <th className="p-3">Phone</th>
                      <th className="p-3">Address</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {rows.map((row, index) => (
                      <tr key={index}>
                        <td className="p-3">{row.trackingNo || "-"}</td>
                        <td className="p-3">{row.senderName || "-"}</td>
                        <td className="p-3">{row.receiverName || "-"}</td>
                        <td className="p-3">{row.receiverPhone || "-"}</td>
                        <td className="p-3">{row.address || "-"}</td>
                      </tr>
                    ))}
                    {!rows.length ? (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-white/50">
                          No parsed rows yet.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </Panel>
          </div>

          <div className="space-y-6">
            <Panel title="Source image guidance" subtitle="Use this when warehouse or customer support teams need to understand why OCR confidence is low.">
              <PhotoEvidenceCapture
                title="OCR source photo"
                helperText="The platform can score glare, blur, and exposure before sending to OCR."
                onReady={({ assessment }) => setPhotoAssessment(assessment)}
              />
            </Panel>
            <PhotoReviewPanel assessment={photoAssessment} />
          </div>
        </div>
      </ScreenShell>
    </PermissionGuard>
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

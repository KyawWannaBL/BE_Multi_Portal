import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LogisticsApi } from "../api";

export function PhotoEvidenceUploader({
  onUploaded,
}: {
  onUploaded: (payload: {
    url: string;
    guidance: string[];
    fraudFlags: string[];
  }) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [guidance, setGuidance] = useState<string[]>([]);
  const [fraudFlags, setFraudFlags] = useState<string[]>([]);

  async function handleFile(file: File) {
    try {
      setBusy(true);

      const [analysis, fraud, url] = await Promise.all([
        LogisticsApi.analyzeParcelPhoto(file),
        LogisticsApi.detectPhotoFraud(file),
        LogisticsApi.uploadFile(file),
      ]);

      setGuidance(analysis.guidance || []);
      setFraudFlags(fraud.flags || []);
      onUploaded({
        url,
        guidance: analysis.guidance || [],
        fraudFlags: fraud.flags || [],
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4 rounded-xl border p-4">
      <input
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />

      {busy ? <p className="text-sm text-muted-foreground">Analyzing photo...</p> : null}

      {guidance.length ? (
        <div className="rounded-lg bg-amber-50 p-3 text-sm">
          <div className="font-semibold">Photo Guidance</div>
          <ul className="mt-2 list-disc pl-5">
            {guidance.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {fraudFlags.length ? (
        <div className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
          <div className="font-semibold">Possible Fraud Flags</div>
          <ul className="mt-2 list-disc pl-5">
            {fraudFlags.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <Button type="button" variant="outline" disabled={busy}>
        {busy ? "Processing..." : "Ready for next photo"}
      </Button>
    </div>
  );
}
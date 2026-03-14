import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LogisticsApi } from "@/features/logistics/api";

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
  const [error, setError] = useState("");

  async function handleFile(file: File) {
    try {
      setBusy(true);
      setError("");
      setGuidance([]);
      setFraudFlags([]);

      const [analysis, fraud, url] = await Promise.all([
        LogisticsApi.analyzeParcelPhoto(file),
        LogisticsApi.detectPhotoFraud(file),
        LogisticsApi.uploadFile(file),
      ]);

      const nextGuidance = Array.isArray(analysis?.guidance)
        ? analysis.guidance
        : [];
      const nextFraudFlags = Array.isArray(fraud?.flags) ? fraud.flags : [];

      setGuidance(nextGuidance);
      setFraudFlags(nextFraudFlags);

      onUploaded({
        url,
        guidance: nextGuidance,
        fraudFlags: nextFraudFlags,
      });
    } catch (err: any) {
      console.error("Photo processing failed:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Photo processing failed."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4 rounded-xl border p-4">
      <div className="space-y-2">
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
          }}
          className="block w-full text-sm"
        />
        <p className="text-xs text-muted-foreground">
          Upload parcel photos for quality guidance and fraud screening.
        </p>
      </div>

      {busy ? (
        <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
          Processing photo...
        </div>
      ) : null}

      {error ? (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

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

export default PhotoEvidenceUploader;
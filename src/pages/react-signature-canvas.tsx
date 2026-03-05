import SignatureCanvas from "react-signature-canvas";
import { useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { TABLES } from "@/lib/db/tables";
import { Button } from "@/components/ui/button";

export default function SignaturePad({ deliveryId }: { deliveryId: string }) {
  const sigRef = useRef<SignatureCanvas>(null);
  const [saving, setSaving] = useState(false);
  const [savedUrl, setSavedUrl] = useState<string | null>(null);

  const saveSignature = async () => {
    const canvas = sigRef.current?.getTrimmedCanvas();
    if (!canvas || !supabase) return;

    setSaving(true);
    try {
      const blob: Blob = await new Promise((resolve, reject) =>
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Failed to export signature"))), "image/png")
      );

      const filename = `${deliveryId}-${Date.now()}.png`;
      const path = `signatures/${filename}`;

      // Public bucket, so this will be accessible by URL.
      const { error: uploadErr } = await supabase.storage
        .from("signatures")
        .upload(path, blob, { contentType: "image/png", upsert: true });

      if (uploadErr) throw uploadErr;

      const { data } = supabase.storage.from("signatures").getPublicUrl(path);
      const url = data.publicUrl;
      setSavedUrl(url);

      // Best-effort: attach to shipment tracking.
      await supabase.from(TABLES.SHIPMENT_TRACKING).insert({
        shipment_id: deliveryId,
        status: "delivered",
        location: "Signature",
        notes: `Signature: ${url}`,
        timestamp: new Date().toISOString(),
      });

      // Best-effort: if shipments has a signature_url column, update it (ignore if column not present).
      await supabase.from(TABLES.SHIPMENTS).update({ signature_url: url }).eq("id", deliveryId);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      <SignatureCanvas
        ref={sigRef}
        penColor="black"
        canvasProps={{ width: 320, height: 140, style: { border: "1px solid #ccc", borderRadius: 8 } }}
      />
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => sigRef.current?.clear()} type="button">
          Clear
        </Button>
        <Button onClick={saveSignature} disabled={saving} type="button">
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>
      {savedUrl && (
        <a className="text-xs text-primary underline underline-offset-4" href={savedUrl} target="_blank" rel="noreferrer">
          View saved signature
        </a>
      )}
    </div>
  );
}

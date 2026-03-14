import { useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function DeviceQrScanner({
  onDetected,
  title = "QR / Barcode Scanner",
}: {
  onDetected: (value: string) => void;
  title?: string;
}) {
  const [manual, setManual] = useState("");
  const [cameraOpen, setCameraOpen] = useState(false);

  return (
    <div className="space-y-4 rounded-xl border p-4">
      <div>
        <div className="text-sm font-semibold">{title}</div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={() => setCameraOpen((v) => !v)}>
          {cameraOpen ? "Hide Camera" : "Open Camera"}
        </Button>
      </div>

      {cameraOpen ? (
        <div className="overflow-hidden rounded-xl border">
          <Scanner
            onScan={(codes) => {
              const value = codes?.[0]?.rawValue;
              if (value) onDetected(value);
            }}
            onError={(error) => {
              console.error("Scanner error:", error);
            }}
            constraints={{ facingMode: "environment" }}
            formats={["qr_code", "code_128", "code_39", "ean_13", "upc_a"]}
          />
        </div>
      ) : null}

      <div className="grid gap-3 md:grid-cols-[1fr_auto]">
        <Input
          value={manual}
          onChange={(e) => setManual(e.target.value)}
          placeholder="Manual QR / Waybill input"
        />
        <Button type="button" onClick={() => manual && onDetected(manual)}>
          Submit
        </Button>
      </div>

      <div className="text-xs text-muted-foreground">
        Camera scan + manual fallback are enabled here. Image-upload decoding can be added through your backend OCR/scan endpoint.
      </div>
    </div>
  );
}
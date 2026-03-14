import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QrReader } from "react-qr-reader";

export function DeviceQrScanner({
  onDetected,
}: {
  onDetected: (value: string) => void;
}) {
  const [manual, setManual] = useState("");
  const [showCamera, setShowCamera] = useState(false);

  return (
    <div className="space-y-4 rounded-xl border p-4">
      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={() => setShowCamera((v) => !v)}>
          {showCamera ? "Hide Camera" : "Open Camera Scanner"}
        </Button>
      </div>

      {showCamera ? (
        <div className="overflow-hidden rounded-xl border">
          <QrReader
            constraints={{ facingMode: "environment" }}
            onResult={(result) => {
              if (result) {
                onDetected(result.getText());
              }
            }}
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
    </div>
  );
}
import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogisticsApi } from "@/features/logistics/api";
import type { ParcelRecord } from "@/features/logistics/types";
import { DeviceQrScanner } from "@/features/logistics/components/DeviceQrScanner";
import { PhotoEvidenceUploader } from "@/features/logistics/components/PhotoEvidenceUploader";
import { SignaturePad } from "@/features/logistics/components/SignaturePad";

export default function PickupExecutionScreen() {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<ParcelRecord[]>([]);
  const [selected, setSelected] = useState<ParcelRecord | null>(null);
  const [qrCode, setQrCode] = useState("");
  const [signerName, setSignerName] = useState("");
  const [signatureDataUrl, setSignatureDataUrl] = useState("");
  const [note, setNote] = useState("");
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  async function load() {
    const results = await LogisticsApi.pickupSearch(query);
    setItems(results);
  }

  useEffect(() => {
    void load();
  }, [query]);

  async function handleConfirmPickup() {
    if (!selected) return;
    try {
      setSaving(true);
      await LogisticsApi.markPickup({
        parcelId: selected.id,
        qrCode,
        signerName,
        signatureDataUrl,
        photoUrls,
        note,
      });

      setSelected(null);
      setQrCode("");
      setSignerName("");
      setSignatureDataUrl("");
      setNote("");
      setPhotoUrls([]);
      await load();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Layout>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold">Pickup Execution</h1>
          <p className="text-muted-foreground">
            Pickup chain-of-custody flow with scan, evidence, and signature.
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_1fr]">
          <Card>
            <CardHeader>
              <CardTitle>Pickup Queue</CardTitle>
              <CardDescription>
                Search assigned pickup jobs and select a parcel to process
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search pickup ways"
              />

              <div className="max-h-[520px] space-y-2 overflow-auto">
                {items.map((item) => (
                  <button
                    key={item.id}
                    className={`w-full rounded-xl border p-4 text-left ${
                      selected?.id === item.id ? "border-primary ring-2 ring-primary/20" : ""
                    }`}
                    onClick={() => setSelected(item)}
                  >
                    <div className="font-semibold">{item.waybillNo}</div>
                    <div className="text-sm text-muted-foreground">
                      {item.merchantName} → {item.customerName}
                    </div>
                    <div className="mt-1 text-sm">
                      {item.township} • {item.status}
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pickup Chain of Custody</CardTitle>
              <CardDescription>
                Scan parcel, capture evidence, collect signature, and confirm pickup
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {!selected ? (
                <div className="rounded-xl border border-dashed p-8 text-sm text-muted-foreground">
                  Select a pickup job first.
                </div>
              ) : (
                <>
                  <div className="rounded-xl bg-muted p-4 text-sm">
                    <div><span className="font-semibold">Waybill:</span> {selected.waybillNo}</div>
                    <div><span className="font-semibold">Merchant:</span> {selected.merchantName}</div>
                    <div><span className="font-semibold">Customer:</span> {selected.customerName}</div>
                    <div><span className="font-semibold">Phone:</span> {selected.phone}</div>
                  </div>

                  <DeviceQrScanner onDetected={setQrCode} />

                  <Input
                    value={signerName}
                    onChange={(e) => setSignerName(e.target.value)}
                    placeholder="Pickup signer name"
                  />

                  <PhotoEvidenceUploader
                    onUploaded={(payload) =>
                      setPhotoUrls((prev) => [...prev, payload.url])
                    }
                  />

                  <div className="space-y-2">
                    <div className="text-sm font-medium">Electronic Signature</div>
                    <SignaturePad onChange={setSignatureDataUrl} />
                  </div>

                  <Input
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Pickup note"
                  />

                  <Button className="w-full" onClick={handleConfirmPickup} disabled={saving}>
                    {saving ? "Confirming..." : "Confirm Pickup"}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
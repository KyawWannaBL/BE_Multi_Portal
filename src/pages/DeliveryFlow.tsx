import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SignaturePad } from "@/features/logistics/components/SignaturePad";
import { DeviceQrScanner } from "@/features/logistics/components/DeviceQrScanner";
import { PhotoEvidenceUploader } from "@/features/logistics/components/PhotoEvidenceUploader";
import axios from "axios";

type DeliveryTask = {
  id: string;
  waybillNo: string;
  customerName: string;
  phone: string;
  township: string;
  address?: string;
  otpRequired?: boolean;
  otpCode?: string;
  codAmount?: number;
  status: string;
};

export default function DeliveryFlow() {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<DeliveryTask[]>([]);
  const [selected, setSelected] = useState<DeliveryTask | null>(null);

  const [qrCode, setQrCode] = useState("");
  const [otp, setOtp] = useState("");
  const [receiverName, setReceiverName] = useState("");
  const [signatureDataUrl, setSignatureDataUrl] = useState("");
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [deliveryNote, setDeliveryNote] = useState("");

  const [exceptionReason, setExceptionReason] = useState("");
  const [rescheduleDate, setRescheduleDate] = useState("");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  async function loadDeliveries(search?: string) {
    try {
      setLoading(true);
      const res = await axios.get("/api/v1/delivery/tasks", {
        params: search ? { q: search } : {},
      });
      setItems(res.data?.items || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadDeliveries();
  }, []);

  function resetForm() {
    setSelected(null);
    setQrCode("");
    setOtp("");
    setReceiverName("");
    setSignatureDataUrl("");
    setPhotoUrls([]);
    setDeliveryNote("");
    setExceptionReason("");
    setRescheduleDate("");
  }

  async function confirmDelivered() {
    if (!selected) return;

    try {
      setSaving(true);

      await axios.post("/api/v1/delivery/confirm", {
        parcelId: selected.id,
        qrCode,
        otp,
        receiverName,
        signatureDataUrl,
        photoUrls,
        note: deliveryNote,
      });

      resetForm();
      await loadDeliveries(query);
    } finally {
      setSaving(false);
    }
  }

  async function markFailedAttempt() {
    if (!selected) return;

    try {
      setSaving(true);

      await axios.post("/api/v1/delivery/fail", {
        parcelId: selected.id,
        qrCode,
        reason: exceptionReason,
        rescheduleDate: rescheduleDate || undefined,
        photoUrls,
        note: deliveryNote,
      });

      resetForm();
      await loadDeliveries(query);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Layout>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold">Delivery Proof & Exception Flow</h1>
          <p className="text-muted-foreground">
            Complete proof-of-delivery, OTP verification, signature, evidence photos, or failed-attempt reporting.
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.05fr_1fr]">
          <Card>
            <CardHeader>
              <CardTitle>Out for Delivery Queue</CardTitle>
              <CardDescription>
                Search and select a delivery task to process.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by waybill, customer, phone, or township"
                />
                <Button onClick={() => void loadDeliveries(query)} disabled={loading}>
                  {loading ? "Loading..." : "Search"}
                </Button>
              </div>

              <div className="max-h-[560px] space-y-2 overflow-auto">
                {items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelected(item)}
                    className={`w-full rounded-xl border p-4 text-left ${
                      selected?.id === item.id ? "border-primary ring-2 ring-primary/20" : ""
                    }`}
                  >
                    <div className="font-semibold">{item.waybillNo}</div>
                    <div className="text-sm text-muted-foreground">
                      {item.customerName} • {item.phone}
                    </div>
                    <div className="mt-1 text-sm">{item.township}</div>
                    <div className="mt-1 text-xs uppercase text-primary">
                      {item.status}
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Delivery Action Panel</CardTitle>
              <CardDescription>
                Scan, verify, collect proof, or mark as failed attempt.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {!selected ? (
                <div className="rounded-xl border border-dashed p-8 text-sm text-muted-foreground">
                  Select a delivery task from the queue.
                </div>
              ) : (
                <>
                  <div className="rounded-xl bg-muted p-4 text-sm">
                    <div><span className="font-semibold">Waybill:</span> {selected.waybillNo}</div>
                    <div><span className="font-semibold">Customer:</span> {selected.customerName}</div>
                    <div><span className="font-semibold">Phone:</span> {selected.phone}</div>
                    <div><span className="font-semibold">Township:</span> {selected.township}</div>
                    <div><span className="font-semibold">COD:</span> {selected.codAmount ?? 0}</div>
                  </div>

                  <DeviceQrScanner onDetected={setQrCode} />

                  <Input
                    value={receiverName}
                    onChange={(e) => setReceiverName(e.target.value)}
                    placeholder="Receiver name"
                  />

                  {selected.otpRequired ? (
                    <Input
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter OTP"
                    />
                  ) : null}

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
                    value={deliveryNote}
                    onChange={(e) => setDeliveryNote(e.target.value)}
                    placeholder="Delivery note"
                  />

                  <div className="grid gap-3 md:grid-cols-2">
                    <Button onClick={confirmDelivered} disabled={saving}>
                      {saving ? "Saving..." : "Confirm Delivered"}
                    </Button>
                    <Button variant="outline" onClick={resetForm} disabled={saving}>
                      Reset
                    </Button>
                  </div>

                  <div className="rounded-xl border p-4">
                    <div className="mb-3 font-semibold">Failed Attempt / Exception</div>

                    <div className="space-y-3">
                      <Input
                        value={exceptionReason}
                        onChange={(e) => setExceptionReason(e.target.value)}
                        placeholder="Reason (customer absent, wrong address, refused, etc.)"
                      />
                      <Input
                        type="datetime-local"
                        value={rescheduleDate}
                        onChange={(e) => setRescheduleDate(e.target.value)}
                      />
                      <Button
                        variant="destructive"
                        className="w-full"
                        onClick={markFailedAttempt}
                        disabled={saving || !exceptionReason}
                      >
                        {saving ? "Submitting..." : "Mark Failed Attempt"}
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
import { useEffect, useMemo, useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogisticsApi } from "@/features/logistics/api";
import type { ParcelRecord, RackCell, SlaSummary } from "@/features/logistics/types";
import { DeviceQrScanner } from "@/features/logistics/components/DeviceQrScanner";
import { PhotoEvidenceUploader } from "@/features/logistics/components/PhotoEvidenceUploader";
import { WarehouseRackHeatmap } from "@/features/logistics/components/WarehouseRackHeatmap";
import { SlaMonitoringPanel } from "@/features/logistics/components/SlaMonitoringPanel";

export default function WarehouseReceiving() {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<ParcelRecord[]>([]);
  const [selected, setSelected] = useState<ParcelRecord | null>(null);
  const [rackHeatmap, setRackHeatmap] = useState<RackCell[]>([]);
  const [sla, setSla] = useState<SlaSummary>({
    total: 0,
    healthy: 0,
    warning: 0,
    breached: 0,
  });
  const [receivedBy, setReceivedBy] = useState("");
  const [rackCode, setRackCode] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [note, setNote] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [anomalyFlags, setAnomalyFlags] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  async function load() {
    const [parcels, heatmap, slaSummary] = await Promise.all([
      LogisticsApi.searchInboundParcels(query),
      LogisticsApi.getRackHeatmap(),
      LogisticsApi.getSlaSummary(),
    ]);
    setItems(parcels);
    setRackHeatmap(heatmap);
    setSla(slaSummary);
  }

  useEffect(() => {
    void load();
  }, [query]);

  useEffect(() => {
    if (!selected?.id) return;
    void LogisticsApi.detectParcelAnomaly(selected.id).then(setAnomalyFlags);
  }, [selected?.id]);

  const selectedSummary = useMemo(() => {
    if (!selected) return null;
    return [
      ["Waybill", selected.waybillNo],
      ["Merchant", selected.merchantName],
      ["Customer", selected.customerName],
      ["Township", selected.township],
      ["Status", selected.status],
      ["Parcel Count", selected.parcelCount],
    ];
  }, [selected]);

  async function handleReceive() {
    if (!selected) return;
    try {
      setSaving(true);
      await LogisticsApi.receiveParcel({
        parcelId: selected.id,
        receivedBy,
        rackCode,
        qrCode,
        note,
        weightKg: weightKg ? Number(weightKg) : undefined,
        photoUrls,
      });

      setSelected(null);
      setRackCode("");
      setWeightKg("");
      setNote("");
      setQrCode("");
      setPhotoUrls([]);
      setAnomalyFlags([]);
      await load();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Layout>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold">Warehouse Receiving</h1>
          <p className="text-muted-foreground">
            Scan, verify, inspect, rack, and accept inbound parcels.
          </p>
        </div>

        <SlaMonitoringPanel summary={sla} />

        <Card>
          <CardHeader>
            <CardTitle>Rack Heatmap</CardTitle>
            <CardDescription>Live warehouse occupancy and receiving pressure</CardDescription>
          </CardHeader>
          <CardContent>
            <WarehouseRackHeatmap racks={rackHeatmap} />
          </CardContent>
        </Card>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
          <Card>
            <CardHeader>
              <CardTitle>Inbound Search Queue</CardTitle>
              <CardDescription>Search by waybill, merchant, customer, phone, or township</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search inbound parcels"
              />

              <div className="max-h-[480px] space-y-2 overflow-auto">
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
              <CardTitle>Receive Parcel</CardTitle>
              <CardDescription>Scan, inspect, capture evidence, and rack</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {!selected ? (
                <div className="rounded-xl border border-dashed p-8 text-sm text-muted-foreground">
                  Select a parcel from the inbound queue.
                </div>
              ) : (
                <>
                  <div className="rounded-xl bg-muted p-4">
                    {selectedSummary?.map(([label, value]) => (
                      <div key={label} className="grid grid-cols-[120px_1fr] gap-3 py-1 text-sm">
                        <div className="text-muted-foreground">{label}</div>
                        <div className="font-medium">{String(value ?? "-")}</div>
                      </div>
                    ))}
                  </div>

                  <DeviceQrScanner onDetected={setQrCode} />

                  <div className="grid gap-3 md:grid-cols-2">
                    <Input
                      value={receivedBy}
                      onChange={(e) => setReceivedBy(e.target.value)}
                      placeholder="Received by"
                    />
                    <Input
                      value={rackCode}
                      onChange={(e) => setRackCode(e.target.value)}
                      placeholder="Rack code"
                    />
                    <Input
                      value={weightKg}
                      onChange={(e) => setWeightKg(e.target.value)}
                      placeholder="Weight (kg)"
                    />
                    <Input
                      value={qrCode}
                      onChange={(e) => setQrCode(e.target.value)}
                      placeholder="QR / Way code"
                    />
                  </div>

                  <Input
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Inspection note"
                  />

                  <PhotoEvidenceUploader
                    onUploaded={(payload) =>
                      setPhotoUrls((prev) => [...prev, payload.url])
                    }
                  />

                  {anomalyFlags.length ? (
                    <div className="rounded-xl bg-amber-50 p-4 text-sm">
                      <div className="font-semibold">Parcel Anomaly Detection</div>
                      <ul className="mt-2 list-disc pl-5">
                        {anomalyFlags.map((flag) => (
                          <li key={flag}>{flag}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  <Button className="w-full" onClick={handleReceive} disabled={saving}>
                    {saving ? "Receiving..." : "Confirm Warehouse Receiving"}
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
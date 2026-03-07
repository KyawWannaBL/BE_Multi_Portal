import React, { useMemo, useState } from "react";
import { ExecutionShell } from "@/components/layout/ExecutionShell";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import PhotoCapture from "@/components/PhotoCapture";
import { extractLabelFromImage, type ExtractedLabel } from "@/services/labelExtraction";
import { geocodeForward, fetchDirections, isMapboxConfigured } from "@/services/mapbox";
import ExecutionRoutePlannerMap, { type RouteStop } from "@/components/ExecutionRoutePlannerMap";
import * as XLSX from "xlsx";
import { Download, Wand2, Trash2, Route, MapPin } from "lucide-react";

type IntakeRow = {
  id: string;
  image: string; // base64
  extracted: ExtractedLabel | null;
  status: "PENDING" | "REJECTED" | "EXTRACTED";
  errors: string[];
};

type DeliveryRow = {
  awb: string;
  receiver: string;
  phone: string;
  address: string;
  codAmount: number;
};

function uuid(): string {
  const c: any = globalThis.crypto;
  return c?.randomUUID ? c.randomUUID() : `id_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function toDeliveryRows(items: IntakeRow[]): DeliveryRow[] {
  const rows: DeliveryRow[] = [];
  const seen = new Set<string>();
  for (const it of items) {
    const ex = it.extracted;
    if (!ex || !ex.quality.pass) continue;
    const awb = (ex.awb ?? "").trim();
    const key = awb || `${ex.phone ?? ""}_${ex.receiver ?? ""}_${ex.address ?? ""}`;
    if (!key || seen.has(key)) continue;
    seen.add(key);

    rows.push({
      awb: awb || "—",
      receiver: ex.receiver ?? "—",
      phone: ex.phone ?? "—",
      address: ex.address ?? "—",
      codAmount: Number(ex.codAmount ?? 0),
    });
  }
  return rows;
}

export default function ExecutionParcelIntakePage() {
  const { lang } = useLanguage();
  const t = (en: string, my: string) => (lang === "en" ? en : my);

  const [items, setItems] = useState<IntakeRow[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [delivery, setDelivery] = useState<DeliveryRow[]>([]);
  const [stops, setStops] = useState<RouteStop[]>([]);
  const [routeGeom, setRouteGeom] = useState<any | null>(null);
  const [routeMeta, setRouteMeta] = useState<{ km: number; min: number } | null>(null);
  const [planning, setPlanning] = useState(false);

  async function handleCapture(img: string) {
    const id = uuid();
    const row: IntakeRow = { id, image: img, extracted: null, status: "PENDING", errors: [] };
    setItems((p) => [row, ...p]);

    // auto: quality gate + extraction
    setBusyId(id);
    try {
      const ex = await extractLabelFromImage(img);

      if (!ex.quality.pass) {
        setItems((p) =>
          p.map((r) =>
            r.id === id
              ? { ...r, extracted: ex, status: "REJECTED", errors: ex.quality.issues }
              : r
          )
        );
        return;
      }

      setItems((p) => p.map((r) => (r.id === id ? { ...r, extracted: ex, status: "EXTRACTED", errors: [] } : r)));
    } finally {
      setBusyId(null);
    }
  }

  function remove(id: string) {
    setItems((p) => p.filter((x) => x.id !== id));
  }

  function generateDeliveryList() {
    const rows = toDeliveryRows(items);
    setDelivery(rows);
  }

  function setDeliveryCell(i: number, k: keyof DeliveryRow, v: string) {
    setDelivery((p) => p.map((r, idx) => (idx === i ? { ...r, [k]: k === "codAmount" ? Number(v || 0) : (v as any) } : r)));
  }

  function exportXlsx() {
    const headers = lang === "en"
      ? ["AWB/WAYBILL", "RECEIVER", "PHONE", "ADDRESS", "COD"]
      : ["AWB/WAYBILL", "လက်ခံသူ", "ဖုန်း", "လိပ်စာ", "COD"];

    const aoa = [
      headers,
      ...delivery.map((r) => [r.awb, r.receiver, r.phone, r.address, r.codAmount]),
    ];

    const sheet = XLSX.utils.aoa_to_sheet(aoa);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, sheet, "DELIVERY_LIST");
    XLSX.writeFile(wb, `delivery_list_${new Date().toISOString().slice(0,10)}.xlsx`);
  }

  async function geocodeAndPlanRoute() {
    if (!delivery.length) return;
    if (!isMapboxConfigured()) return;

    setPlanning(true);
    try {
      const nextStops: RouteStop[] = [];
      for (const r of delivery) {
        const q = `${r.address}`.trim();
        if (!q || q === "—") continue;
        const feats = await geocodeForward(q, { limit: 1, country: "MM" });
        const c = feats?.[0]?.center;
        if (c) {
          nextStops.push({
            id: r.awb,
            label: `${r.awb} • ${r.receiver}`,
            coord: c,
          });
        }
      }
      setStops(nextStops);

      if (nextStops.length >= 2) {
        const coords = nextStops.map((s) => s.coord);
        const route = await fetchDirections({
          profile: "driving",
          coordinates: coords,
          geometries: "geojson",
          overview: "full",
        });
        setRouteGeom(route.geometry);
        setRouteMeta({ km: Math.round(route.distance / 100) / 10, min: Math.round(route.duration / 60) });
      } else {
        setRouteGeom(null);
        setRouteMeta(null);
      }
    } finally {
      setPlanning(false);
    }
  }

  return (
    <ExecutionShell title={t("Parcel Intake (OCR + Route)", "Parcel Intake (OCR + Route)")}>
      <div className="space-y-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 space-y-1">
            <div className="text-sm font-black tracking-widest uppercase">{t("Fundamental: photo → extract → list → plan", "အခြေခံ: ပုံ → extract → စာရင်း → route")}</div>
            <div className="text-xs text-white/60">
              {t("System auto-rejects unclear photos and only extracts from clear labels.", "စနစ်က မရှင်းလင်းသော ပုံများကို auto-reject လုပ်ပြီး clear label များမှသာ extract လုပ်မည်။")}
            </div>
          </CardContent>
        </Card>

        {/* Capture */}
        <Card className="bg-[#05080F] border-white/10">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="text-xs font-mono text-white/60 tracking-widest uppercase">{t("Capture label photo", "Label ပုံရိုက်ရန်")}</div>
              <Badge variant="outline" className="border-white/10 text-white/70">{items.length} photos</Badge>
            </div>

            <PhotoCapture
              onCapture={handleCapture}
              watermarkData={{
                ttId: "INTAKE",
                userId: "exec",
                timestamp: new Date().toISOString(),
                gps: "auto",
              }}
              required={true}
            />

            <div className="text-xs text-white/40">
              {t("Quality gate checks: resolution, blur, brightness, contrast.", "Quality စစ်ချက်: resolution, blur, brightness, contrast.")}
            </div>
          </CardContent>
        </Card>

        {/* Intake items */}
        <Card className="bg-[#05080F] border-white/10">
          <CardContent className="p-0">
            <div className="p-4 border-b border-white/10 flex items-center justify-between flex-wrap gap-2">
              <div className="text-xs font-mono text-white/60 tracking-widest uppercase">{t("Intake results", "Intake results")}</div>
              <div className="flex gap-2">
                <Button className="bg-sky-600 hover:bg-sky-500" onClick={generateDeliveryList}>
                  <Wand2 className="h-4 w-4 mr-2" /> {t("Generate Delivery List", "Delivery List ထုတ်")}
                </Button>
              </div>
            </div>

            <div className="divide-y divide-white/5">
              {items.length === 0 ? (
                <div className="p-6 text-sm text-white/60">{t("No photos yet.", "ပုံမရှိသေးပါ။")}</div>
              ) : (
                items.map((it) => {
                  const ex = it.extracted;
                  const pass = ex?.quality.pass ?? false;
                  const score = ex?.quality.score ?? 0;

                  return (
                    <div key={it.id} className="p-4 flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex gap-3 min-w-[260px]">
                        <img src={it.image} alt="label" className="w-[140px] h-[100px] object-cover rounded-xl border border-white/10 bg-black" />
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={pass ? "border-emerald-500/30 text-emerald-300 bg-emerald-500/10" : "border-rose-500/30 text-rose-300 bg-rose-500/10"}>
                              {it.status}
                            </Badge>
                            {busyId === it.id ? <Badge variant="outline" className="border-amber-500/30 text-amber-300 bg-amber-500/10">processing…</Badge> : null}
                            <Badge variant="outline" className="border-white/10 text-white/70">score {score}</Badge>
                          </div>

                          {!pass && ex ? (
                            <div className="text-xs text-rose-300">
                              {t("Auto rejected:", "Auto rejected:")} {ex.quality.issues.join(", ")}
                            </div>
                          ) : null}

                          {pass && ex ? (
                            <div className="text-xs text-white/70 space-y-1">
                              <div>AWB: <span className="text-white">{ex.awb ?? "—"}</span></div>
                              <div>{t("Phone", "ဖုန်း")}: <span className="text-white">{ex.phone ?? "—"}</span></div>
                              <div>{t("Receiver", "လက်ခံသူ")}: <span className="text-white">{ex.receiver ?? "—"}</span></div>
                              <div className="text-white/60 line-clamp-2">{t("Address", "လိပ်စာ")}: {ex.address ?? "—"}</div>
                            </div>
                          ) : null}
                        </div>
                      </div>

                      <Button variant="outline" className="border-white/10" onClick={() => remove(it.id)}>
                        <Trash2 className="h-4 w-4 mr-2" /> {t("Remove", "ဖျက်")}
                      </Button>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Delivery list table */}
        <Card className="bg-[#05080F] border-white/10">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="text-xs font-mono text-white/60 tracking-widest uppercase">
                {t("Delivery list", "Delivery list")} <span className="text-white/40">({delivery.length})</span>
              </div>
              <div className="flex gap-2">
                <Button className="bg-emerald-600 hover:bg-emerald-500" disabled={!delivery.length} onClick={exportXlsx}>
                  <Download className="h-4 w-4 mr-2" /> {t("Export Excel", "Excel ထုတ်")}
                </Button>
                <Button className="bg-amber-600 hover:bg-amber-500" disabled={!delivery.length || !isMapboxConfigured() || planning} onClick={() => void geocodeAndPlanRoute()}>
                  <Route className="h-4 w-4 mr-2" /> {planning ? "planning…" : t("Plan Route", "Route စီမံ")}
                </Button>
              </div>
            </div>

            {!isMapboxConfigured() ? (
              <div className="text-xs text-rose-300">
                {t("Mapbox token missing. Set VITE_MAPBOX_ACCESS_TOKEN.", "Mapbox token မရှိပါ။ VITE_MAPBOX_ACCESS_TOKEN ထည့်ပါ။")}
              </div>
            ) : null}

            <div className="overflow-auto rounded-2xl border border-white/10">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 text-white/70">
                  <tr>
                    <th className="p-3 text-xs font-mono tracking-widest uppercase">AWB</th>
                    <th className="p-3 text-xs font-mono tracking-widest uppercase">{t("Receiver", "လက်ခံသူ")}</th>
                    <th className="p-3 text-xs font-mono tracking-widest uppercase">{t("Phone", "ဖုန်း")}</th>
                    <th className="p-3 text-xs font-mono tracking-widest uppercase">{t("Address", "လိပ်စာ")}</th>
                    <th className="p-3 text-xs font-mono tracking-widest uppercase">COD</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {delivery.length ? (
                    delivery.map((r, i) => (
                      <tr key={i} className="hover:bg-white/5">
                        <td className="p-2"><Input className="bg-black/30 border-white/10" value={r.awb} onChange={(e) => setDeliveryCell(i, "awb", e.target.value)} /></td>
                        <td className="p-2"><Input className="bg-black/30 border-white/10" value={r.receiver} onChange={(e) => setDeliveryCell(i, "receiver", e.target.value)} /></td>
                        <td className="p-2"><Input className="bg-black/30 border-white/10" value={r.phone} onChange={(e) => setDeliveryCell(i, "phone", e.target.value)} /></td>
                        <td className="p-2"><Input className="bg-black/30 border-white/10" value={r.address} onChange={(e) => setDeliveryCell(i, "address", e.target.value)} /></td>
                        <td className="p-2"><Input className="bg-black/30 border-white/10" value={String(r.codAmount)} onChange={(e) => setDeliveryCell(i, "codAmount", e.target.value)} /></td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={5} className="p-6 text-white/60">{t("Generate list from clear photos above.", "အပေါ်က clear ပုံများမှ စာရင်းထုတ်ပါ။")}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Map route */}
        <Card className="bg-[#05080F] border-white/10">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="text-xs font-mono text-white/60 tracking-widest uppercase">
                <MapPin className="inline h-4 w-4 mr-2" />
                {t("Route preview", "Route preview")}
              </div>
              {routeMeta ? (
                <Badge variant="outline" className="border-emerald-500/30 text-emerald-300 bg-emerald-500/10">
                  {routeMeta.km} km • {routeMeta.min} min
                </Badge>
              ) : (
                <Badge variant="outline" className="border-white/10 text-white/60">—</Badge>
              )}
            </div>

            <ExecutionRoutePlannerMap stops={stops} routeGeometry={routeGeom} className="rounded-3xl border border-white/10 overflow-hidden" />
          </CardContent>
        </Card>
      </div>
    </ExecutionShell>
  );
}

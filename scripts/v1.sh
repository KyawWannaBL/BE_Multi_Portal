#!/usr/bin/env bash
set -euo pipefail

# ==============================================================================
# ENTERPRISE: Parcel Intake -> Auto Quality Gate -> OCR/Barcode -> Upload to System
#
# Adds:
# - Strict photo criteria (auto reject)
# - Strict AWB requirement (barcode OR OCR) -> reject if missing
# - Auto-create shipments via createShipmentDataEntry() (Supabase RPC)
# - Optional upload label photo to Supabase Storage bucket (best-effort)
# - Generate delivery list + Mapbox route planning + XLSX export bilingual
# - Add route /portal/execution/intake and sidebar entry
#
# ENV (frontend):
#   VITE_MAPBOX_ACCESS_TOKEN=pk.__REPLACE_ME__
#
# Intake policy env (frontend):
#   VITE_INTAKE_STRICT_AWB=true
#   VITE_INTAKE_STRICT_CLEAR_PHOTO=true
#   VITE_INTAKE_REQUIRE_PHONE_OR_ADDRESS=true
#
# Storage (optional):
#   Bucket name used: parcel-labels (create in Supabase Storage if you want photo uploads)
# ==============================================================================

backup(){ [[ -f "$1" ]] && cp -f "$1" "$1.bak.$(date +%Y%m%d_%H%M%S)" || true; }

PKG="package.json"
IMGQ="src/lib/imageQuality.ts"
LABEL="src/services/labelExtraction.ts"
UPLOADER="src/services/intakeUploader.ts"
INTAKE="src/pages/portals/ExecutionParcelIntakePage.tsx"
SHELL="src/components/layout/ExecutionShell.tsx"
APP="src/App.tsx"

mkdir -p \
  "$(dirname "$IMGQ")" "$(dirname "$LABEL")" "$(dirname "$UPLOADER")" \
  "$(dirname "$INTAKE")" "$(dirname "$SHELL")" "$(dirname "$APP")"

backup "$PKG" "$IMGQ" "$LABEL" "$UPLOADER" "$INTAKE" "$SHELL" "$APP"

# ------------------------------------------------------------------------------
# 0) Ensure dependencies
# ------------------------------------------------------------------------------
node - <<'NODE'
const fs = require("fs");
const pkg = JSON.parse(fs.readFileSync("package.json","utf-8"));
pkg.dependencies ||= {};
const deps = {
  "@zxing/browser": "^0.1.4",
  "tesseract.js": "^5.1.1",
  "xlsx": "^0.18.5"
};
let changed=false;
for (const [k,v] of Object.entries(deps)) {
  if (!pkg.dependencies[k]) { pkg.dependencies[k]=v; changed=true; }
}
fs.writeFileSync("package.json", JSON.stringify(pkg,null,2)+"\n");
console.log(changed ? "✅ deps added" : "✅ deps already present");
NODE

# ------------------------------------------------------------------------------
# 1) Image Quality Gate (strict)
# ------------------------------------------------------------------------------
cat > "$IMGQ" <<'EOF'
export type ImageQualityResult = {
  pass: boolean;
  score: number; // 0..100
  issues: string[];
  metrics: {
    width: number;
    height: number;
    brightnessMean: number; // 0..255
    contrastStd: number; // 0..128
    blurVariance: number; // higher is sharper
  };
};

function envStr(key: string, fallback = ""): string {
  try { return String((import.meta as any)?.env?.[key] ?? fallback); } catch { return fallback; }
}
function envBool(key: string, fallback: boolean): boolean {
  const v = envStr(key, "");
  if (!v) return fallback;
  return ["1","true","yes","on"].includes(v.toLowerCase());
}

/**
 * EN: Enterprise quality gate for label photos (auto-regulated).
 * MM: Label photo quality စစ်ခြင်း (auto စည်းမျဉ်း)
 *
 * Overridable via env if needed:
 * - VITE_INTAKE_STRICT_CLEAR_PHOTO=true|false (default true)
 */
export async function analyzeImageQuality(dataUrl: string): Promise<ImageQualityResult> {
  const strict = envBool("VITE_INTAKE_STRICT_CLEAR_PHOTO", true);

  const img = await loadImage(dataUrl);
  const { width, height } = img;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas not supported");
  ctx.drawImage(img, 0, 0);

  const { data } = ctx.getImageData(0, 0, width, height);
  const n = width * height;

  let sum = 0, sum2 = 0;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i+1], b = data[i+2];
    const y = 0.2126*r + 0.7152*g + 0.0722*b;
    sum += y;
    sum2 += y*y;
  }
  const mean = sum / n;
  const variance = Math.max(0, sum2 / n - mean*mean);
  const std = Math.sqrt(variance);

  const blurVar = laplacianVariance(data, width, height);

  const issues: string[] = [];
  const minW = strict ? 1000 : 800;
  const minH = strict ? 720 : 600;
  const minBlur = strict ? 55 : 35;
  const minStd = strict ? 26 : 18;
  const minBright = strict ? 65 : 45;
  const maxBright = strict ? 210 : 225;

  if (width < minW || height < minH) issues.push(`LOW_RESOLUTION (${width}x${height})`);
  if (blurVar < minBlur) issues.push(`BLUR_TOO_HIGH (variance=${blurVar.toFixed(1)})`);
  if (std < minStd) issues.push(`LOW_CONTRAST (std=${std.toFixed(1)})`);
  if (mean < minBright) issues.push(`TOO_DARK (mean=${mean.toFixed(1)})`);
  if (mean > maxBright) issues.push(`TOO_BRIGHT (mean=${mean.toFixed(1)})`);

  let score = 100;
  if (width < minW || height < minH) score -= 25;
  if (blurVar < minBlur) score -= 35;
  if (std < minStd) score -= 15;
  if (mean < minBright || mean > maxBright) score -= 15;
  score = Math.max(0, Math.min(100, score));

  return {
    pass: issues.length === 0,
    score,
    issues,
    metrics: { width, height, brightnessMean: mean, contrastStd: std, blurVariance: blurVar },
  };
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Image load failed"));
    img.src = src;
  });
}

function laplacianVariance(rgba: Uint8ClampedArray, w: number, h: number): number {
  const step = Math.max(1, Math.floor(Math.min(w, h) / 420));
  const gray = (x: number, y: number) => {
    const i = (y * w + x) * 4;
    return 0.2126 * rgba[i] + 0.7152 * rgba[i + 1] + 0.0722 * rgba[i + 2];
  };

  let sum = 0, sum2 = 0, count = 0;
  for (let y = 1; y < h - 1; y += step) {
    for (let x = 1; x < w - 1; x += step) {
      const c = gray(x, y);
      const lap = gray(x - 1, y) + gray(x + 1, y) + gray(x, y - 1) + gray(x, y + 1) - 4 * c;
      sum += lap;
      sum2 += lap * lap;
      count++;
    }
  }
  if (!count) return 0;
  const mean = sum / count;
  return Math.max(0, sum2 / count - mean * mean);
}
EOF

# ------------------------------------------------------------------------------
# 2) Label Extraction (strict AWB criteria + field criteria)
# ------------------------------------------------------------------------------
cat > "$LABEL" <<'EOF'
import { analyzeImageQuality, type ImageQualityResult } from "@/lib/imageQuality";

export type ExtractedLabel = {
  awb: string | null;
  receiver: string | null;
  phone: string | null;
  address: string | null;
  codAmount: number | null;

  barcodeValue: string | null;
  ocrText: string;
  quality: ImageQualityResult;

  criteriaPass: boolean;
  criteriaIssues: string[];
};

function envStr(key: string, fallback = ""): string {
  try { return String((import.meta as any)?.env?.[key] ?? fallback); } catch { return fallback; }
}
function envBool(key: string, fallback: boolean): boolean {
  const v = envStr(key, "");
  if (!v) return fallback;
  return ["1","true","yes","on"].includes(v.toLowerCase());
}

function normalizePhone(s: string): string | null {
  const m = s.match(/(\+?95\s?9\d{7,9}|09\d{7,9})/);
  if (!m?.[1]) return null;
  return m[1].replace(/\s+/g, "");
}

function findAwb(text: string): string | null {
  const m = text.match(/(?:AWB|WAYBILL|WB|TT|Tracking)\s*[:#-]?\s*([A-Z0-9-]{6,})/i);
  if (m?.[1]) return m[1].toUpperCase();
  const m2 = text.match(/\b([A-Z0-9]{10,})\b/);
  return m2?.[1] ? m2[1].toUpperCase() : null;
}

function findCod(text: string): number | null {
  const m = text.match(/(?:COD|C\.O\.D)\s*[:#-]?\s*([0-9,\.]+)/i);
  if (!m?.[1]) return null;
  const v = Number(String(m[1]).replace(/,/g, ""));
  return Number.isFinite(v) ? v : null;
}

function guessReceiver(lines: string[]): string | null {
  for (const l of lines) {
    if (l.length > 3 && l.length <= 40 && !/\d/.test(l) && !/address|awb|waybill|cod|phone/i.test(l)) return l;
  }
  return null;
}

function guessAddress(lines: string[]): string | null {
  const cleaned = lines.filter((l) => l.length >= 8);
  if (!cleaned.length) return null;
  return cleaned.slice(-4).join(" ") || null;
}

async function decodeBarcodeFromImage(dataUrl: string): Promise<string | null> {
  try {
    const mod = await import("@zxing/browser");
    const reader = new mod.BrowserMultiFormatReader();
    const result = await reader.decodeFromImageUrl(dataUrl);
    const txt = result?.getText?.();
    return txt ? String(txt).trim() : null;
  } catch {
    return null;
  }
}

async function runOcr(dataUrl: string): Promise<string> {
  const mod = await import("tesseract.js");
  const res = await mod.recognize(dataUrl, "eng", { logger: () => {} } as any);
  return String(res?.data?.text ?? "");
}

/**
 * EN: Intake pipeline.
 * 1) Quality Gate
 * 2) Barcode/QR decode
 * 3) OCR (only if photo clear)
 * 4) Parse fields
 * 5) Apply criteria rules (strict)
 */
export async function extractLabelFromImage(dataUrl: string): Promise<ExtractedLabel> {
  const strictAwb = envBool("VITE_INTAKE_STRICT_AWB", true);
  const requirePhoneOrAddress = envBool("VITE_INTAKE_REQUIRE_PHONE_OR_ADDRESS", true);

  const quality = await analyzeImageQuality(dataUrl);
  const barcodeValue = await decodeBarcodeFromImage(dataUrl);

  const ocrText = quality.pass ? await runOcr(dataUrl) : "";
  const lines = ocrText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  const awb = barcodeValue ? (findAwb(barcodeValue) ?? barcodeValue) : findAwb(ocrText);
  const phone = normalizePhone(ocrText);
  const receiver = guessReceiver(lines);
  const address = guessAddress(lines);
  const codAmount = findCod(ocrText);

  const criteriaIssues: string[] = [];
  if (strictAwb && !awb) criteriaIssues.push("AWB_NOT_DETECTED");
  if (requirePhoneOrAddress && !phone && !address) criteriaIssues.push("MISSING_PHONE_AND_ADDRESS");

  const criteriaPass = criteriaIssues.length === 0;

  return {
    awb,
    receiver,
    phone,
    address,
    codAmount,
    barcodeValue,
    ocrText,
    quality,
    criteriaPass,
    criteriaIssues,
  };
}
EOF

# ------------------------------------------------------------------------------
# 3) Intake uploader -> create shipments via createShipmentDataEntry() + optional photo upload
# ------------------------------------------------------------------------------
cat > "$UPLOADER" <<'EOF'
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { createShipmentDataEntry } from "@/services/shipments";

export type IntakeUploadDefaults = {
  receiverCity: string;
  receiverState: string;
  deliveryType: string;
  deliveryFee: number;
  itemPrice: number;
  cbm: number;
  remarksPrefix: string;
};

export type UploadRowInput = {
  awb: string;
  receiver: string;
  phone: string;
  address: string;
  codAmount: number;
  labelPhotoDataUrl?: string | null;
};

export type UploadRowResult = {
  ok: boolean;
  awb: string;
  shipmentId?: string;
  wayId?: string;
  photoUrl?: string | null;
  error?: string;
};

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64] = dataUrl.split(",");
  const mime = header.match(/data:(.*?);base64/)?.[1] ?? "image/jpeg";
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  return new Blob([bytes], { type: mime });
}

/**
 * Best-effort: upload label photo to Supabase storage bucket "parcel-labels".
 * If bucket is missing or RLS denies, returns null and continues.
 */
async function uploadLabelPhotoBestEffort(awb: string, dataUrl: string): Promise<string | null> {
  if (!isSupabaseConfigured) return null;

  try {
    const bucket = "parcel-labels";
    const ext = "jpg";
    const path = `intake/${awb}/${Date.now()}.${ext}`;
    const blob = dataUrlToBlob(dataUrl);

    const up = await supabase.storage.from(bucket).upload(path, blob, { upsert: true, contentType: blob.type });
    if (up.error) return null;

    const pub = supabase.storage.from(bucket).getPublicUrl(path);
    return pub?.data?.publicUrl ?? null;
  } catch {
    return null;
  }
}

export async function uploadParcelsFromIntake(
  rows: UploadRowInput[],
  defaults: IntakeUploadDefaults
): Promise<UploadRowResult[]> {
  const out: UploadRowResult[] = [];

  for (const r of rows) {
    try {
      const awb = String(r.awb || "").trim();
      if (!awb || awb === "—") throw new Error("AWB_REQUIRED");

      const receiver_name = (r.receiver || "UNKNOWN").trim();
      const receiver_phone = (r.phone || "—").trim();
      const receiver_address = (r.address || "—").trim();

      const photoUrl = r.labelPhotoDataUrl ? await uploadLabelPhotoBestEffort(awb, r.labelPhotoDataUrl) : null;

      const remarks = [
        defaults.remarksPrefix,
        `AWB=${awb}`,
        `PHONE=${receiver_phone}`,
        `COD=${Number(r.codAmount || 0)}`,
        photoUrl ? `LABEL_PHOTO=${photoUrl}` : "",
      ].filter(Boolean).join(" | ");

      const created = await createShipmentDataEntry({
        receiver_name,
        receiver_phone,
        receiver_address,
        receiver_city: defaults.receiverCity,
        receiver_state: defaults.receiverState,
        item_price: defaults.itemPrice,
        delivery_fee: defaults.deliveryFee,
        cod_amount: Number(r.codAmount || 0),
        cbm: defaults.cbm,
        delivery_type: defaults.deliveryType,
        remarks,
      } as any);

      out.push({ ok: true, awb, shipmentId: created.shipmentId, wayId: created.wayId, photoUrl });
    } catch (e: any) {
      out.push({ ok: false, awb: String(r.awb || "—"), error: String(e?.message || e) });
    }
  }

  return out;
}
EOF

# ------------------------------------------------------------------------------
# 4) Intake Page UI: strict reject + generate list + upload to system + mapbox route + export xlsx
# ------------------------------------------------------------------------------
cat > "$INTAKE" <<'EOF'
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
import { uploadParcelsFromIntake, type IntakeUploadDefaults } from "@/services/intakeUploader";
import * as XLSX from "xlsx";
import { Download, Wand2, Trash2, Route, UploadCloud, CheckCircle2, XCircle } from "lucide-react";

type IntakeRow = {
  id: string;
  image: string;
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
  labelPhotoDataUrl?: string | null;

  uploadStatus?: "READY" | "UPLOADING" | "UPLOADED" | "FAILED";
  shipmentId?: string;
  wayId?: string;
  error?: string;
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
    if (!ex) continue;
    if (!ex.quality.pass) continue;
    if (!ex.criteriaPass) continue;

    const awb = (ex.awb ?? "").trim();
    if (!awb) continue;

    if (seen.has(awb)) continue;
    seen.add(awb);

    rows.push({
      awb,
      receiver: ex.receiver ?? "—",
      phone: ex.phone ?? "—",
      address: ex.address ?? "—",
      codAmount: Number(ex.codAmount ?? 0),
      labelPhotoDataUrl: it.image,
      uploadStatus: "READY",
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
  const [defaults, setDefaults] = useState<IntakeUploadDefaults>({
    receiverCity: "Yangon",
    receiverState: "MM",
    deliveryType: "Normal",
    deliveryFee: 0,
    itemPrice: 0,
    cbm: 1,
    remarksPrefix: "INTAKE_OCR",
  });

  const [stops, setStops] = useState<RouteStop[]>([]);
  const [routeGeom, setRouteGeom] = useState<any | null>(null);
  const [routeMeta, setRouteMeta] = useState<{ km: number; min: number } | null>(null);
  const [planning, setPlanning] = useState(false);

  async function handleCapture(img: string) {
    const id = uuid();
    const row: IntakeRow = { id, image: img, extracted: null, status: "PENDING", errors: [] };
    setItems((p) => [row, ...p]);

    setBusyId(id);
    try {
      const ex = await extractLabelFromImage(img);

      const hardIssues: string[] = [];
      if (!ex.quality.pass) hardIssues.push(...ex.quality.issues);
      if (!ex.criteriaPass) hardIssues.push(...ex.criteriaIssues);

      if (hardIssues.length) {
        setItems((p) =>
          p.map((r) => (r.id === id ? { ...r, extracted: ex, status: "REJECTED", errors: hardIssues } : r))
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
    setDelivery(toDeliveryRows(items));
  }

  function setDeliveryCell(i: number, k: keyof DeliveryRow, v: string) {
    setDelivery((p) =>
      p.map((r, idx) =>
        idx === i
          ? {
              ...r,
              [k]:
                k === "codAmount"
                  ? Number(v || 0)
                  : v,
            }
          : r
      )
    );
  }

  function exportXlsx() {
    const headers =
      lang === "en"
        ? ["AWB/WAYBILL", "RECEIVER", "PHONE", "ADDRESS", "COD", "SHIPMENT_ID", "WAY_ID"]
        : ["AWB/WAYBILL", "လက်ခံသူ", "ဖုန်း", "လိပ်စာ", "COD", "SHIPMENT_ID", "WAY_ID"];

    const aoa = [
      headers,
      ...delivery.map((r) => [r.awb, r.receiver, r.phone, r.address, r.codAmount, r.shipmentId ?? "", r.wayId ?? ""]),
    ];

    const sheet = XLSX.utils.aoa_to_sheet(aoa);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, sheet, "DELIVERY_LIST");
    XLSX.writeFile(wb, `delivery_list_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  async function geocodeAndPlanRoute() {
    if (!delivery.length || !isMapboxConfigured()) return;
    setPlanning(true);
    try {
      const nextStops: RouteStop[] = [];
      for (const r of delivery) {
        const q = `${r.address}`.trim();
        if (!q || q === "—") continue;
        const feats = await geocodeForward(q, { limit: 1, country: "MM" });
        const c = feats?.[0]?.center;
        if (c) nextStops.push({ id: r.awb, label: `${r.awb} • ${r.receiver}`, coord: c });
      }
      setStops(nextStops);

      if (nextStops.length >= 2) {
        const route = await fetchDirections({
          profile: "driving",
          coordinates: nextStops.map((s) => s.coord),
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

  async function uploadToSystem() {
    if (!delivery.length) return;

    setDelivery((p) => p.map((r) => ({ ...r, uploadStatus: "UPLOADING", error: "" })));

    const results = await uploadParcelsFromIntake(
      delivery.map((r) => ({
        awb: r.awb,
        receiver: r.receiver,
        phone: r.phone,
        address: r.address,
        codAmount: r.codAmount,
        labelPhotoDataUrl: r.labelPhotoDataUrl ?? null,
      })),
      defaults
    );

    setDelivery((prev) =>
      prev.map((r) => {
        const rr = results.find((x) => x.awb === r.awb);
        if (!rr) return r;
        if (rr.ok) {
          return { ...r, uploadStatus: "UPLOADED", shipmentId: rr.shipmentId, wayId: rr.wayId, error: "" };
        }
        return { ...r, uploadStatus: "FAILED", error: rr.error ?? "FAILED" };
      })
    );
  }

  const extractedCount = useMemo(() => items.filter((x) => x.status === "EXTRACTED").length, [items]);
  const rejectedCount = useMemo(() => items.filter((x) => x.status === "REJECTED").length, [items]);

  return (
    <ExecutionShell title={t("Parcel Intake (OCR + Upload + Route)", "Parcel Intake (OCR + Upload + Route)")}>
      <div className="space-y-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 space-y-2">
            <div className="text-sm font-black tracking-widest uppercase">
              {t("Fundamental: clear label photos -> auto create parcels", "အခြေခံ: clear label ပုံ -> parcel auto create")}
            </div>
            <div className="text-xs text-white/60">
              {t(
                "System auto-rejects unclear photos and requires AWB detection.",
                "စနစ်က မရှင်းလင်းသော ပုံများကို auto-reject လုပ်ပြီး AWB detect လိုအပ်ပါသည်။"
              )}
            </div>
            <div className="flex gap-2 flex-wrap">
              <Badge variant="outline" className="border-emerald-500/30 text-emerald-300 bg-emerald-500/10">
                {extractedCount} {t("extracted", "extracted")}
              </Badge>
              <Badge variant="outline" className="border-rose-500/30 text-rose-300 bg-rose-500/10">
                {rejectedCount} {t("rejected", "rejected")}
              </Badge>
              <Badge variant="outline" className={isMapboxConfigured() ? "border-emerald-500/30 text-emerald-300" : "border-amber-500/30 text-amber-300"}>
                MAPBOX {isMapboxConfigured() ? "OK" : "MISSING TOKEN"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Defaults */}
        <Card className="bg-[#05080F] border-white/10">
          <CardContent className="p-4 space-y-3">
            <div className="text-xs font-mono text-white/60 tracking-widest uppercase">{t("Upload defaults", "Upload defaults")}</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <div className="text-[10px] font-mono text-white/50 tracking-widest uppercase">{t("City", "မြို့")}</div>
                <Input className="bg-black/30 border-white/10" value={defaults.receiverCity} onChange={(e) => setDefaults((p) => ({ ...p, receiverCity: e.target.value }))} />
              </div>
              <div>
                <div className="text-[10px] font-mono text-white/50 tracking-widest uppercase">{t("State", "ပြည်နယ်/တိုင်း")}</div>
                <Input className="bg-black/30 border-white/10" value={defaults.receiverState} onChange={(e) => setDefaults((p) => ({ ...p, receiverState: e.target.value }))} />
              </div>
              <div>
                <div className="text-[10px] font-mono text-white/50 tracking-widest uppercase">{t("Delivery type", "Delivery type")}</div>
                <Input className="bg-black/30 border-white/10" value={defaults.deliveryType} onChange={(e) => setDefaults((p) => ({ ...p, deliveryType: e.target.value }))} />
              </div>
              <div>
                <div className="text-[10px] font-mono text-white/50 tracking-widest uppercase">{t("Delivery fee", "ပို့ခ")}</div>
                <Input className="bg-black/30 border-white/10" value={String(defaults.deliveryFee)} onChange={(e) => setDefaults((p) => ({ ...p, deliveryFee: Number(e.target.value || 0) }))} />
              </div>
              <div>
                <div className="text-[10px] font-mono text-white/50 tracking-widest uppercase">{t("Item price", "ပစ္စည်းတန်ဖိုး")}</div>
                <Input className="bg-black/30 border-white/10" value={String(defaults.itemPrice)} onChange={(e) => setDefaults((p) => ({ ...p, itemPrice: Number(e.target.value || 0) }))} />
              </div>
              <div>
                <div className="text-[10px] font-mono text-white/50 tracking-widest uppercase">CBM</div>
                <Input className="bg-black/30 border-white/10" value={String(defaults.cbm)} onChange={(e) => setDefaults((p) => ({ ...p, cbm: Number(e.target.value || 1) }))} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Capture */}
        <Card className="bg-[#05080F] border-white/10">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="text-xs font-mono text-white/60 tracking-widest uppercase">{t("Capture label photo", "Label ပုံရိုက်ရန်")}</div>
              {busyId ? <Badge variant="outline" className="border-amber-500/30 text-amber-300 bg-amber-500/10">processing…</Badge> : null}
            </div>

            <PhotoCapture
              onCapture={handleCapture}
              watermarkData={{ ttId: "INTAKE", userId: "exec", timestamp: new Date().toISOString(), gps: "auto" }}
              required={true}
            />

            <div className="flex gap-2 flex-wrap">
              <Button className="bg-sky-600 hover:bg-sky-500" onClick={generateDeliveryList}>
                <Wand2 className="h-4 w-4 mr-2" /> {t("Generate Delivery List", "Delivery List ထုတ်")}
              </Button>
              <Button className="bg-emerald-600 hover:bg-emerald-500" disabled={!delivery.length} onClick={uploadToSystem}>
                <UploadCloud className="h-4 w-4 mr-2" /> {t("Upload to System", "System သို့ တင်")}
              </Button>
              <Button variant="outline" className="border-white/10" disabled={!delivery.length} onClick={exportXlsx}>
                <Download className="h-4 w-4 mr-2" /> {t("Export Excel", "Excel ထုတ်")}
              </Button>
              <Button className="bg-amber-600 hover:bg-amber-500" disabled={!delivery.length || !isMapboxConfigured() || planning} onClick={() => void geocodeAndPlanRoute()}>
                <Route className="h-4 w-4 mr-2" /> {planning ? "planning…" : t("Plan Route", "Route စီမံ")}
              </Button>
            </div>

            {!isMapboxConfigured() ? (
              <div className="text-xs text-rose-300">
                {t("Set VITE_MAPBOX_ACCESS_TOKEN to enable route planning.", "Route planning အတွက် VITE_MAPBOX_ACCESS_TOKEN ထည့်ပါ။")}
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* Intake results */}
        <Card className="bg-[#05080F] border-white/10">
          <CardContent className="p-0">
            <div className="p-4 border-b border-white/10 text-xs font-mono text-white/60 tracking-widest uppercase">
              {t("Intake results", "Intake results")} ({items.length})
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
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className={it.status === "EXTRACTED" ? "border-emerald-500/30 text-emerald-300 bg-emerald-500/10" : it.status === "REJECTED" ? "border-rose-500/30 text-rose-300 bg-rose-500/10" : "border-amber-500/30 text-amber-300 bg-amber-500/10"}>
                              {it.status}
                            </Badge>
                            <Badge variant="outline" className="border-white/10 text-white/70">score {score}</Badge>
                          </div>

                          {it.status === "REJECTED" && ex ? (
                            <div className="text-xs text-rose-300">
                              {t("Rejected:", "Rejected:")} {it.errors.join(", ")}
                            </div>
                          ) : null}

                          {it.status === "EXTRACTED" && ex ? (
                            <div className="text-xs text-white/70 space-y-1">
                              <div>AWB: <span className="text-white">{ex.awb ?? "—"}</span></div>
                              <div>{t("Phone", "ဖုန်း")}: <span className="text-white">{ex.phone ?? "—"}</span></div>
                              <div>{t("Receiver", "လက်ခံသူ")}: <span className="text-white">{ex.receiver ?? "—"}</span></div>
                              <div className="text-white/60 line-clamp-2">{t("Address", "လိပ်စာ")}: {ex.address ?? "—"}</div>
                            </div>
                          ) : null}

                          {!pass && ex ? (
                            <div className="text-[10px] text-white/40 font-mono">
                              blur={ex.quality.metrics.blurVariance.toFixed(1)} • bright={ex.quality.metrics.brightnessMean.toFixed(1)} • contrast={ex.quality.metrics.contrastStd.toFixed(1)}
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

        {/* Delivery list */}
        <Card className="bg-[#05080F] border-white/10">
          <CardContent className="p-4 space-y-3">
            <div className="text-xs font-mono text-white/60 tracking-widest uppercase">
              {t("Delivery list (editable)", "Delivery list (editable)")} ({delivery.length})
            </div>

            <div className="overflow-auto rounded-2xl border border-white/10">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 text-white/70">
                  <tr>
                    <th className="p-3 text-xs font-mono tracking-widest uppercase">AWB</th>
                    <th className="p-3 text-xs font-mono tracking-widest uppercase">{t("Receiver", "လက်ခံသူ")}</th>
                    <th className="p-3 text-xs font-mono tracking-widest uppercase">{t("Phone", "ဖုန်း")}</th>
                    <th className="p-3 text-xs font-mono tracking-widest uppercase">{t("Address", "လိပ်စာ")}</th>
                    <th className="p-3 text-xs font-mono tracking-widest uppercase">COD</th>
                    <th className="p-3 text-xs font-mono tracking-widest uppercase">{t("Upload", "Upload")}</th>
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
                        <td className="p-2">
                          {r.uploadStatus === "UPLOADED" ? (
                            <div className="flex items-center gap-2 text-emerald-300">
                              <CheckCircle2 className="h-4 w-4" />
                              <span className="text-xs font-mono">OK</span>
                            </div>
                          ) : r.uploadStatus === "FAILED" ? (
                            <div className="text-rose-300 text-xs">
                              <div className="flex items-center gap-2"><XCircle className="h-4 w-4" /> FAILED</div>
                              <div className="text-[10px] opacity-80">{r.error}</div>
                            </div>
                          ) : r.uploadStatus === "UPLOADING" ? (
                            <div className="text-amber-300 text-xs font-mono">UPLOADING…</div>
                          ) : (
                            <div className="text-white/60 text-xs font-mono">READY</div>
                          )}
                          {r.shipmentId ? <div className="text-[10px] text-white/50 font-mono">shipment={r.shipmentId}</div> : null}
                          {r.wayId ? <div className="text-[10px] text-white/50 font-mono">way={r.wayId}</div> : null}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={6} className="p-6 text-white/60">{t("Generate from clear photos above.", "အပေါ်က clear ပုံများမှ စာရင်းထုတ်ပါ။")}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Route preview */}
        <Card className="bg-[#05080F] border-white/10">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="text-xs font-mono text-white/60 tracking-widest uppercase">{t("Route preview", "Route preview")}</div>
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
EOF

# ------------------------------------------------------------------------------
# 5) Ensure sidebar includes Parcel Intake
# ------------------------------------------------------------------------------
cat > "$SHELL" <<'EOF'
import React, { useMemo } from "react";
import { NavLink } from "react-router-dom";
import { PortalShell } from "@/components/layout/PortalShell";
import { useLanguage } from "@/contexts/LanguageContext";

const base =
  "block px-4 py-3 rounded-2xl border border-white/10 hover:border-white/20 hover:bg-white/5 text-sm font-semibold";

export function ExecutionShell({ title, children }: { title: string; children: React.ReactNode }) {
  const { lang } = useLanguage();
  const t = (en: string, my: string) => (lang === "en" ? en : my);

  const items = useMemo(
    () => [
      { to: "/portal/execution", label: t("Worklist", "လုပ်ငန်းစာရင်း") },
      { to: "/portal/execution/intake", label: t("Parcel Intake (OCR)", "Parcel Intake (OCR)") },
      { to: "/portal/execution/navigation", label: t("Mapbox Way Planning", "Mapbox လမ်းကြောင်းစီမံ") },
      { to: "/portal/execution/live-map", label: t("Live Map View", "Live Map ကြည့်ရန်") },
      { to: "/portal/execution/ocr-export", label: t("OCR → Excel", "OCR → Excel") },
      { to: "/portal/execution/manual", label: t("QR Manual", "QR လမ်းညွှန်") },
    ],
    [lang]
  );

  return (
    <PortalShell title={title}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <aside className="lg:col-span-3">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-3 space-y-2 sticky top-[88px]">
            <div className="text-[10px] font-mono text-white/60 tracking-widest uppercase px-2 py-1">
              {t("Execution Menu", "Execution မီနူး")}
            </div>
            {items.map((i) => (
              <NavLink
                key={i.to}
                to={i.to}
                className={({ isActive }) =>
                  `${base} ${isActive ? "bg-emerald-500/10 border-emerald-500/30" : ""}`
                }
              >
                {i.label}
              </NavLink>
            ))}
          </div>
        </aside>
        <section className="lg:col-span-9">{children}</section>
      </div>
    </PortalShell>
  );
}
EOF

# ------------------------------------------------------------------------------
# 6) Patch App.tsx to add route if missing (best-effort)
# ------------------------------------------------------------------------------
python3 - <<'PY'
from pathlib import Path
import re

p = Path("src/App.tsx")
if not p.exists():
    print("[warn] src/App.tsx not found. Add route manually:")
    print('  <Route path="/portal/execution/intake" element={<RequireRole allow={["RIDER","DRIVER","HELPER","SUPER_ADMIN","SYS","APP_OWNER"]}><ExecutionParcelIntakePage /></RequireRole>} />')
    raise SystemExit(0)

s = p.read_text(encoding="utf-8", errors="ignore")

# Add import if not present
if "ExecutionParcelIntakePage" not in s:
    # insert near other execution imports if possible
    if "ExecutionOcrExportPage" in s:
        s = s.replace(
            "import ExecutionOcrExportPage from",
            "import ExecutionOcrExportPage from"
        )
    # append import at end of import block
    s = re.sub(r"(import\s+ExecutionOcrExportPage[^\n]*\n)", r"\1import ExecutionParcelIntakePage from \"@/pages/portals/ExecutionParcelIntakePage\";\n", s, count=1)

    if "ExecutionParcelIntakePage" not in s:
        # fallback: add after last import
        last_import = list(re.finditer(r"^import .*;$", s, flags=re.M))
        if last_import:
            idx = last_import[-1].end()
            s = s[:idx] + "\nimport ExecutionParcelIntakePage from \"@/pages/portals/ExecutionParcelIntakePage\";\n" + s[idx:]

# Add route if missing
if "/portal/execution/intake" not in s:
    route_snip = """
              <Route
                path="/portal/execution/intake"
                element={
                  <RequireRole allow={["RIDER", "DRIVER", "HELPER", "SUPER_ADMIN", "SYS", "APP_OWNER"]}>
                    <ExecutionParcelIntakePage />
                  </RequireRole>
                }
              />
"""
    # try insert after /portal/execution route
    m = re.search(r'path="/portal/execution"\s*[\s\S]*?</Route>\s*', s)
    if m:
        insert_at = m.end()
        s = s[:insert_at] + route_snip + s[insert_at:]
    else:
        # fallback: before catch-all
        s = s.replace('<Route path="*" element={<Navigate to="/login" replace />} />',
                      route_snip + '\n              <Route path="*" element={<Navigate to="/login" replace />} />')

p.write_text(s, encoding="utf-8")
print("[ok] App.tsx patched for /portal/execution/intake")
PY

# ------------------------------------------------------------------------------
# Install deps
# ------------------------------------------------------------------------------
if command -v npm >/dev/null 2>&1; then
  npm install
else
  echo "⚠️ npm not found. Run: npm install"
fi

git add "$PKG" "$IMGQ" "$LABEL" "$UPLOADER" "$INTAKE" "$SHELL" "$APP" 2>/dev/null || true

echo "✅ Done:"
echo " - Strict photo + strict AWB enforced"
echo " - OCR/Barcode extraction generates delivery list"
echo " - Upload to System creates shipments via createShipmentDataEntry()"
echo " - Mapbox route planning + XLSX export bilingual"
echo
echo "ENV required:"
echo "  VITE_MAPBOX_ACCESS_TOKEN=pk.__REPLACE_ME__"
echo "  VITE_INTAKE_STRICT_AWB=true"
echo "  VITE_INTAKE_STRICT_CLEAR_PHOTO=true"
echo "  VITE_INTAKE_REQUIRE_PHONE_OR_ADDRESS=true"
echo
echo "Commit:"
echo "  git commit -m \"feat(execution): strict intake OCR + upload parcels + route plan\""
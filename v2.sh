#!/usr/bin/env bash
set -euo pipefail

# ==============================================================================
# ENTERPRISE RIDER PORTAL - STATE OF THE ART PATCH (WINDOWS SAFE)
# ==============================================================================

backup(){ [[ -f "$1" ]] && cp -f "$1" "$1.bak.$(date +%Y%m%d_%H%M%S)" || true; }

PKG="package.json"

IMGQ="src/lib/imageQuality.ts"
MAPBOX="src/services/mapbox.ts"
LABEL="src/services/labelExtraction.ts"
OTP="src/services/otp.ts"

QRC="src/components/QRCodeScanner.tsx"
ROUTEMAP="src/components/ExecutionRoutePlannerMap.tsx"

SHELL="src/components/layout/ExecutionShell.tsx"
EXEC="src/pages/portals/ExecutionPortal.tsx"
INTAKE="src/pages/portals/ExecutionParcelIntakePage.tsx"
APP="src/App.tsx"

mkdir -p \
  "$(dirname "$IMGQ")" "$(dirname "$MAPBOX")" "$(dirname "$LABEL")" "$(dirname "$OTP")" \
  "$(dirname "$QRC")" "$(dirname "$ROUTEMAP")" \
  "$(dirname "$SHELL")" "$(dirname "$EXEC")" "$(dirname "$INTAKE")" "$(dirname "$APP")"

backup "$PKG"
backup "$IMGQ"
backup "$MAPBOX"
backup "$LABEL"
backup "$OTP"
backup "$QRC"
backup "$ROUTEMAP"
backup "$SHELL"
backup "$EXEC"
backup "$INTAKE"
backup "$APP"

# ------------------------------------------------------------------------------
# 0) Dependencies (OCR + barcode + XLSX + Mapbox) - SAFE NODE EXECUTION
# ------------------------------------------------------------------------------
cat > patch_pkg.js <<'NODE_EOF'
const fs = require("fs");
const pkg = JSON.parse(fs.readFileSync("package.json","utf-8"));
pkg.dependencies = pkg.dependencies || {};
const deps = {
  "@zxing/browser": "^0.1.4",
  "tesseract.js": "^5.1.1",
  "xlsx": "^0.18.5",
  "mapbox-gl": "^2.15.0"
};
let changed=false;
for (const [k,v] of Object.entries(deps)) {
  if (!pkg.dependencies[k]) { pkg.dependencies[k]=v; changed=true; }
}
fs.writeFileSync("package.json", JSON.stringify(pkg,null,2)+"\n");
console.log(changed ? "✅ deps added" : "✅ deps already present");
NODE_EOF

node patch_pkg.js && rm patch_pkg.js

# ------------------------------------------------------------------------------
# 1) Image Quality Gate (automatic regulations)
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

/**
 * EN: Enterprise quality gate for label photos.
 * MM: Label photo အတွက် quality စည်းမျဉ်းများ (blur/brightness/resolution/contrast)
 *
 * Thresholds are intentionally conservative for field use.
 */
export async function analyzeImageQuality(dataUrl: string): Promise<ImageQualityResult> {
  const img = await loadImage(dataUrl);
  const { width, height } = img;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas not supported");

  ctx.drawImage(img, 0, 0);
  const { data } = ctx.getImageData(0, 0, width, height);

  // brightness mean + contrast std
  let sum = 0;
  let sum2 = 0;
  const n = width * height;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const y = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    sum += y;
    sum2 += y * y;
  }
  const mean = sum / n;
  const variance = Math.max(0, sum2 / n - mean * mean);
  const std = Math.sqrt(variance);

  // blur variance via simple laplacian (downsample for speed)
  const blurVar = laplacianVariance(data, width, height);

  // thresholds (tuneable)
  const issues: string[] = [];
  const minW = 900;
  const minH = 650;
  const minBlur = 45;      // sharper above
  const minStd = 22;       // contrast
  const minBright = 55;    // avoid too dark
  const maxBright = 215;   // avoid too bright

  if (width < minW || height < minH) issues.push(`LOW_RESOLUTION (${width}x${height})`);
  if (blurVar < minBlur) issues.push(`BLUR_TOO_HIGH (variance=${blurVar.toFixed(1)})`);
  if (std < minStd) issues.push(`LOW_CONTRAST (std=${std.toFixed(1)})`);
  if (mean < minBright) issues.push(`TOO_DARK (mean=${mean.toFixed(1)})`);
  if (mean > maxBright) issues.push(`TOO_BRIGHT (mean=${mean.toFixed(1)})`);

  // score composition
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
    metrics: {
      width,
      height,
      brightnessMean: mean,
      contrastStd: std,
      blurVariance: blurVar,
    },
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
  // Downsample stride for speed
  const step = Math.max(1, Math.floor(Math.min(w, h) / 420));
  const gray = (x: number, y: number) => {
    const i = (y * w + x) * 4;
    return 0.2126 * rgba[i] + 0.7152 * rgba[i + 1] + 0.0722 * rgba[i + 2];
  };

  let sum = 0;
  let sum2 = 0;
  let count = 0;

  for (let y = 1; y < h - 1; y += step) {
    for (let x = 1; x < w - 1; x += step) {
      const c = gray(x, y);
      const lap =
        gray(x - 1, y) + gray(x + 1, y) + gray(x, y - 1) + gray(x, y + 1) - 4 * c;
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
# 2) Mapbox service (geocode + directions)
# ------------------------------------------------------------------------------
cat > "$MAPBOX" <<'EOF'
export type LngLat = [number, number];

function token(): string {
  return (import.meta.env.VITE_MAPBOX_ACCESS_TOKEN ||
    import.meta.env.VITE_MAPBOX_TOKEN ||
    "") as string;
}

export function isMapboxConfigured(): boolean {
  return Boolean(token());
}

function baseHeaders() {
  return { "content-type": "application/json" };
}

export async function geocodeForward(
  query: string,
  opts?: { limit?: number; country?: string }
): Promise<{ center: LngLat; place_name: string }[]> {
  const t = token();
  if (!t) throw new Error("Mapbox token missing");
  const limit = opts?.limit ?? 1;
  const country = opts?.country ?? "MM";

  const url = new URL(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`);
  url.searchParams.set("access_token", t);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("country", country);

  const res = await fetch(url.toString(), { headers: baseHeaders() });
  if (!res.ok) throw new Error(`Geocode failed: ${res.status}`);
  const json = await res.json();
  const feats = Array.isArray(json?.features) ? json.features : [];
  return feats
    .map((f: any) => ({ center: f.center as LngLat, place_name: String(f.place_name ?? "") }))
    .filter((x: any) => Array.isArray(x.center) && x.center.length === 2);
}

export async function fetchDirections(input: {
  profile: "driving" | "driving-traffic" | "walking" | "cycling";
  coordinates: LngLat[];
  geometries?: "geojson";
  overview?: "full" | "simplified" | "false";
}): Promise<{ geometry: any; duration: number; distance: number }> {
  const t = token();
  if (!t) throw new Error("Mapbox token missing");
  if (input.coordinates.length < 2) throw new Error("Need at least 2 points");

  const coords = input.coordinates.map((c) => `${c[0]},${c[1]}`).join(";");
  const url = new URL(`https://api.mapbox.com/directions/v5/mapbox/${input.profile}/${coords}`);
  url.searchParams.set("access_token", t);
  url.searchParams.set("geometries", input.geometries ?? "geojson");
  url.searchParams.set("overview", input.overview ?? "full");

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Directions failed: ${res.status}`);
  const json = await res.json();
  const r0 = json?.routes?.[0];
  if (!r0?.geometry) throw new Error("No route");
  return { geometry: r0.geometry, duration: Number(r0.duration ?? 0), distance: Number(r0.distance ?? 0) };
}
EOF

# ------------------------------------------------------------------------------
# 3) Label Extraction: barcode/QR + OCR + parsing
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
};

function normalizePhone(s: string): string | null {
  const m = s.match(/(\+?95\s?9\d{7,9}|09\d{7,9})/);
  if (!m?.[1]) return null;
  return m[1].replace(/\s+/g, "");
}

function findAwb(text: string): string | null {
  const m = text.match(/(?:AWB|WAYBILL|WB|TT|Tracking)\s*[:#-]?\s*([A-Z0-9-]{6,})/i);
  if (m?.[1]) return m[1].toUpperCase();
  // fallback: long alnum token
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
    if (l.length > 3 && l.length <= 40 && !/\d/.test(l) && !/address|awb|waybill|cod|phone/i.test(l)) {
      return l;
    }
  }
  return null;
}

function guessAddress(lines: string[]): string | null {
  const cleaned = lines.filter((l) => l.length >= 8);
  if (!cleaned.length) return null;
  // take last 2-4 lines as address-ish
  const last = cleaned.slice(-4).join(" ");
  return last || null;
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
 * EN: Intake pipeline. Quality gate → barcode → OCR → parse.
 * MM: Quality စစ် → barcode/QR → OCR → parse
 */
export async function extractLabelFromImage(dataUrl: string): Promise<ExtractedLabel> {
  const quality = await analyzeImageQuality(dataUrl);
  const barcodeValue = await decodeBarcodeFromImage(dataUrl);

  const ocrText = quality.pass ? await runOcr(dataUrl) : "";
  const lines = ocrText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const awb = barcodeValue ? findAwb(barcodeValue) ?? barcodeValue : findAwb(ocrText);
  const phone = normalizePhone(ocrText);
  const receiver = guessReceiver(lines);
  const address = guessAddress(lines);
  const codAmount = findCod(ocrText);

  return {
    awb,
    receiver,
    phone,
    address,
    codAmount,
    barcodeValue,
    ocrText,
    quality,
  };
}
EOF

# ------------------------------------------------------------------------------
# 4) OTP service (server-side RPC best-effort)
# ------------------------------------------------------------------------------
cat > "$OTP" <<'EOF'
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export type OtpValidationResult = {
  valid: boolean;
  mode: "server" | "device";
  reason?: string;
};

function envStr(key: string, fallback = ""): string {
  try {
    const v = (import.meta as any)?.env?.[key];
    return v == null ? fallback : String(v);
  } catch {
    return fallback;
  }
}

function envBool(key: string, fallback: boolean): boolean {
  const v = envStr(key, "");
  if (!v) return fallback;
  return ["1", "true", "yes", "on"].includes(v.toLowerCase());
}

function parseRpcBoolean(data: any): boolean | null {
  if (typeof data === "boolean") return data;
  if (data && typeof data === "object") {
    if (typeof data.ok === "boolean") return data.ok;
    if (typeof data.valid === "boolean") return data.valid;
    if (typeof data.is_valid === "boolean") return data.is_valid;
    if (data.data && typeof data.data.valid === "boolean") return data.data.valid;
  }
  return null;
}

/**
 * Config:
 * - VITE_OTP_VALIDATE_MODE=server|device (default device)
 * - VITE_OTP_FAIL_OPEN=true|false (default true)
 */
export async function validateCodOtp(input: { shipmentId: string; otp: string }): Promise<OtpValidationResult> {
  const mode = (envStr("VITE_OTP_VALIDATE_MODE", "device").toLowerCase() === "server" ? "server" : "device") as
    | "server"
    | "device";

  if (mode === "device") {
    const ok = /^\d{4,8}$/.test(String(input.otp || "").trim());
    return { valid: ok, mode, reason: ok ? "FORMAT_OK" : "FORMAT_INVALID" };
  }

  const failOpen = envBool("VITE_OTP_FAIL_OPEN", true);

  if (!isSupabaseConfigured) return { valid: failOpen, mode, reason: "SUPABASE_NOT_CONFIGURED" };

  const otp = String(input.otp || "").trim();
  const shipmentId = String(input.shipmentId || "").trim();
  if (!shipmentId || !otp) return { valid: false, mode, reason: "MISSING_INPUT" };

  try {
    const { data, error } = await supabase.rpc("verify_cod_otp", { p_shipment_id: shipmentId, p_otp: otp } as any);
    if (error) return { valid: failOpen, mode, reason: `RPC_ERROR_FAIL_${failOpen ? "OPEN" : "CLOSED"}` };

    const parsed = parseRpcBoolean(data);
    if (parsed === null) return { valid: failOpen, mode, reason: `RPC_UNPARSEABLE_FAIL_${failOpen ? "OPEN" : "CLOSED"}` };
    return { valid: parsed, mode, reason: parsed ? "RPC_VALID" : "RPC_INVALID" };
  } catch (e: any) {
    return { valid: failOpen, mode, reason: `RPC_THROW_FAIL_${failOpen ? "OPEN" : "CLOSED"}` };
  }
}
EOF

# ------------------------------------------------------------------------------
# 5) QR Scanner (continuous + cooldown)
# ------------------------------------------------------------------------------
cat > "$QRC" <<'EOF'
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Camera, RefreshCw, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

type Props = {
  onScan: (value: string) => void;
  onError?: (error: string) => void;
  className?: string;
  continuous?: boolean;
  cooldownMs?: number;
};

export function QRCodeScanner({
  onScan,
  onError,
  className,
  continuous = false,
  cooldownMs = 1200,
}: Props) {
  const { lang } = useLanguage();
  const t = (en: string, my: string) => (lang === "en" ? en : my);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const zxingRef = useRef<any>(null);
  const [active, setActive] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const lastScanRef = useRef<{ value: string; at: number }>({ value: "", at: 0 });

  const stop = useCallback(async () => {
    try { if (zxingRef.current?.reset) zxingRef.current.reset(); } catch {}
    try {
      const v = videoRef.current;
      const s = v?.srcObject as MediaStream | null;
      s?.getTracks?.().forEach((tr) => tr.stop());
      if (v) v.srcObject = null;
    } catch {}
    setActive(false);
  }, []);

  const emitScan = useCallback(async (raw: string) => {
    const v = String(raw ?? "").trim();
    if (!v) return;
    const now = Date.now();
    const last = lastScanRef.current;
    if (last.value === v && now - last.at < cooldownMs) return;
    lastScanRef.current = { value: v, at: now };
    onScan(v);
    if (!continuous) await stop();
  }, [cooldownMs, continuous, onScan, stop]);

  const start = useCallback(async () => {
    setErr(null);
    const v = videoRef.current;
    if (!v) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      v.srcObject = stream;
      await v.play();
      setActive(true);

      if ("BarcodeDetector" in window) {
        const detector = new (window as any).BarcodeDetector({ formats: ["qr_code"] });
        let cancelled = false;
        const loop = async () => {
          if (cancelled) return;
          try {
            const codes = await detector.detect(v);
            if (codes?.length) await emitScan(String(codes[0].rawValue ?? ""));
          } catch {}
          requestAnimationFrame(loop);
        };
        loop();
        return () => { cancelled = true; };
      }

      const mod = await import("@zxing/browser");
      const reader = new mod.BrowserQRCodeReader();
      zxingRef.current = reader;

      reader.decodeFromVideoElement(v, (result: any, error: any) => {
        if (result?.getText) void emitScan(String(result.getText() ?? ""));
        else if (error && error.name !== "NotFoundException") { /* ignore */ }
      });
    } catch (e: any) {
      const msg = e?.message ?? "Camera access denied";
      setErr(msg);
      onError?.(msg);
      await stop();
    }
  }, [emitScan, onError, stop]);

  useEffect(() => {
    void start();
    return () => { void stop(); };
  }, [start, stop]);

  return (
    <div className={className}>
      <div className="rounded-3xl border border-white/10 bg-white/5 p-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-emerald-300" />
            <div>
              <div className="text-sm font-black tracking-widest uppercase">{t("QR Scanner", "QR Scanner")}</div>
              <div className="text-xs text-white/60">
                {continuous ? t("Batch scan mode", "Batch scan mode") : t("Single scan mode", "Single scan mode")}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" className="border-white/10" onClick={() => void start()}>
              <RefreshCw className="h-4 w-4 mr-2" /> {t("Restart", "ပြန်စ")}
            </Button>
            <Button variant="outline" className="border-white/10" onClick={() => void stop()}>
              <XCircle className="h-4 w-4 mr-2" /> {t("Stop", "ပိတ်")}
            </Button>
          </div>
        </div>

        <div className="mt-3 overflow-hidden rounded-2xl border border-white/10 bg-black">
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-[340px] object-cover opacity-90" />
        </div>

        {err ? <div className="mt-3 text-sm text-rose-300">{err}</div> : null}
        <div className="mt-2 text-[10px] font-mono text-white/50">
          {active ? t("Camera active", "ကင်မရာဖွင့်ထားသည်") : t("Camera stopped", "ကင်မရာပိတ်ထားသည်")}
        </div>
      </div>
    </div>
  );
}

export default QRCodeScanner;
EOF

# ------------------------------------------------------------------------------
# 6) Route Planner Map component (mapbox-gl)
# ------------------------------------------------------------------------------
cat > "$ROUTEMAP" <<'EOF'
import React, { useEffect, useMemo, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

export type RouteStop = {
  id: string;
  label: string;
  coord: [number, number]; // lng, lat
};

export function ExecutionRoutePlannerMap({
  stops,
  routeGeometry,
  className,
}: {
  stops: RouteStop[];
  routeGeometry?: any | null;
  className?: string;
}) {
  const token = useMemo(
    () => (import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || import.meta.env.VITE_MAPBOX_TOKEN || "") as string,
    []
  );

  const divRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    if (!divRef.current || mapRef.current) return;
    if (!token) return;

    mapboxgl.accessToken = token;
    const map = new mapboxgl.Map({
      container: divRef.current,
      style: "mapbox://styles/mapbox/navigation-night-v1",
      center: [96.1951, 16.8661],
      zoom: 11,
      pitch: 35,
    });
    map.addControl(new mapboxgl.NavigationControl(), "top-right");
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [token]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // clear markers
    for (const m of markersRef.current) m.remove();
    markersRef.current = [];

    for (const s of stops) {
      const m = new mapboxgl.Marker({ color: "#f59e0b" })
        .setLngLat(s.coord)
        .setPopup(new mapboxgl.Popup().setHTML(`<b>${s.label}</b>`))
        .addTo(map);
      markersRef.current.push(m);
    }

    if (stops.length) {
      const lngs = stops.map((s) => s.coord[0]);
      const lats = stops.map((s) => s.coord[1]);
      map.fitBounds(
        [
          [Math.min(...lngs), Math.min(...lats)],
          [Math.max(...lngs), Math.max(...lats)],
        ],
        { padding: 60, duration: 600 }
      );
    }
  }, [stops]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const srcId = "route-src";
    const layerId = "route-layer";

    if (map.getLayer(layerId)) map.removeLayer(layerId);
    if (map.getSource(srcId)) map.removeSource(srcId);

    if (!routeGeometry) return;

    map.addSource(srcId, {
      type: "geojson",
      data: { type: "Feature", properties: {}, geometry: routeGeometry },
    });

    map.addLayer({
      id: layerId,
      type: "line",
      source: srcId,
      paint: { "line-width": 5, "line-opacity": 0.9 },
    });
  }, [routeGeometry]);

  if (!token) {
    return (
      <div className={className} style={{ height: 540, borderRadius: 18, border: "1px solid rgba(255,255,255,.15)", background: "rgba(255,255,255,.05)", padding: 16, color: "white" }}>
        <div style={{ fontWeight: 900, letterSpacing: ".18em", textTransform: "uppercase" }}>Mapbox</div>
        <div style={{ opacity: 0.8, marginTop: 8 }}>Set VITE_MAPBOX_ACCESS_TOKEN and restart.</div>
      </div>
    );
  }

  return <div ref={divRef} className={className} style={{ height: 540, width: "100%" }} />;
}

export default ExecutionRoutePlannerMap;
EOF

# ------------------------------------------------------------------------------
# 7) ExecutionShell menu: add Parcel Intake
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
# 8) Parcel Intake Page (photo regulations → OCR → delivery list → mapbox route → XLSX)
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
EOF

# ------------------------------------------------------------------------------
# 9) ExecutionPortal: batch scan auto pickup + OTP for ALL payments (optional) + server OTP verify
# ------------------------------------------------------------------------------
cat > "$EXEC" <<'EOF'
import React, { useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { ExecutionShell } from "@/components/layout/ExecutionShell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, QrCode, RefreshCw, CheckCircle2, XCircle, PackageCheck, ListChecks, Play, Trash2, Zap } from "lucide-react";
import SignaturePad from "@/components/SignaturePad";
import PhotoCapture from "@/components/PhotoCapture";
import QRCodeScanner from "@/components/QRCodeScanner";
import { parseWayIdFromLabel } from "@/services/shipmentTracking";
import { listAssignedShipments, markPickedUp, markDelivered, markDeliveryFailed, type Shipment } from "@/services/shipments";
import { validateCodOtp } from "@/services/otp";
import { toast } from "@/components/ui/use-toast";

type DeliverMode = "DELIVERED" | "NDR";

type DeliverDraft = {
  shipmentId: string;
  mode: DeliverMode;
  recipientName: string;
  relationship: "Self" | "Family" | "Neighbor" | "Guard" | "Other";
  otp: string;
  note: string;
  signature?: string;
  photo?: string;
};

function envBool(key: string, fallback: boolean): boolean {
  const v = (import.meta.env[key] ?? "") as string;
  if (!v) return fallback;
  return ["1","true","yes","on"].includes(String(v).toLowerCase());
}

function badgeFor(status?: string | null) {
  const s = String(status ?? "").toUpperCase();
  if (s.includes("DELIVER")) return "border-emerald-500/30 text-emerald-300 bg-emerald-500/10";
  if (s.includes("FAIL") || s.includes("NDR")) return "border-rose-500/30 text-rose-300 bg-rose-500/10";
  if (s.includes("OUT") || s.includes("PICK")) return "border-amber-500/30 text-amber-300 bg-amber-500/10";
  return "border-white/10 text-white/70 bg-white/5";
}

function normalizeCode(raw: string) {
  const code = (parseWayIdFromLabel(raw) ?? raw ?? "").trim();
  return code.toUpperCase();
}

export default function ExecutionPortal() {
  const { lang } = useLanguage();
  const { user, role } = useAuth();
  const t = (en: string, my: string) => (lang === "en" ? en : my);

  const otpForAll = envBool("VITE_OTP_REQUIRE_FOR_ALL", false);

  const [rows, setRows] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const [scanOpen, setScanOpen] = useState(false);
  const [batchMode, setBatchMode] = useState(false);
  const [autoPickup, setAutoPickup] = useState(true);

  const [deliverOpen, setDeliverOpen] = useState(false);
  const [draft, setDraft] = useState<DeliverDraft | null>(null);

  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [batchQueue, setBatchQueue] = useState<string[]>([]);
  const [batchIndex, setBatchIndex] = useState<number>(0);

  async function refresh() {
    setLoading(true);
    try {
      const r = await listAssignedShipments();
      setRows(r);
    } catch (e: any) {
      toast({ title: "Load failed", description: e?.message || String(e), variant: "destructive" as any });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void refresh(); }, []);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return rows.filter((r) => {
      const st = String(r.status ?? "").toUpperCase();
      if (statusFilter !== "ALL" && st !== statusFilter) return false;
      if (!qq) return true;
      const hay = `${r.trackingNumber ?? ""} ${r.wayId ?? ""} ${r.receiverName ?? ""} ${r.receiverPhone ?? ""} ${r.receiverAddress ?? ""}`.toLowerCase();
      return hay.includes(qq);
    });
  }, [rows, q, statusFilter]);

  const statusOptions = useMemo(() => {
    const set = new Set<string>();
    for (const r of rows) set.add(String(r.status ?? "UNKNOWN").toUpperCase());
    return ["ALL", ...Array.from(set).sort()];
  }, [rows]);

  function openDeliver(shipmentId: string) {
    setDraft({
      shipmentId,
      mode: "DELIVERED",
      recipientName: "",
      relationship: "Self",
      otp: "",
      note: "",
    });
    setDeliverOpen(true);
  }

  function startBatchProcessing() {
    if (!batchQueue.length) {
      toast({ title: t("Empty queue", "Queue မရှိပါ"), variant: "destructive" as any });
      return;
    }
    setBatchIndex(0);
    setScanOpen(false);
    setSelectedId(batchQueue[0]);
    openDeliver(batchQueue[0]);
  }

  function nextInBatch() {
    const nextIdx = batchIndex + 1;
    if (nextIdx >= batchQueue.length) {
      setBatchIndex(0);
      setBatchQueue([]);
      toast({ title: t("Batch completed", "Batch ပြီးပါပြီ") });
      return;
    }
    setBatchIndex(nextIdx);
    const nextId = batchQueue[nextIdx];
    setSelectedId(nextId);
    openDeliver(nextId);
  }

  async function pickup(shipmentId: string) {
    try {
      await markPickedUp(shipmentId, { at: new Date().toISOString(), actorEmail: user?.email ?? null });
      toast({ title: t("Picked up", "Pickup ပြီးပါပြီ") });
      await refresh();
    } catch (e: any) {
      toast({ title: "Pickup failed", description: e?.message || String(e), variant: "destructive" as any });
    }
  }

  async function submitDeliver() {
    if (!draft) return;

    const shipment = rows.find((r) => r.id === draft.shipmentId);
    const cod = Number(shipment?.codAmount ?? 0);
    const isCod = cod > 0;

    if (!draft.recipientName.trim()) {
      toast({ title: t("Recipient required", "လက်ခံသူအမည်လိုအပ်ပါသည်"), variant: "destructive" as any });
      return;
    }

    const otpRequired = otpForAll || isCod;

    if (otpRequired) {
      const otp = draft.otp.trim();
      const otpFormatOk = /^\d{4,8}$/.test(otp);
      if (!otpFormatOk) {
        toast({
          title: t("OTP required", "OTP လိုအပ်ပါသည်"),
          description: t("Enter 4-8 digits OTP.", "OTP ကို 4-8 လုံးထည့်ပါ။"),
          variant: "destructive" as any,
        });
        return;
      }

      // server validation supported (even if not COD)
      const v = await validateCodOtp({ shipmentId: draft.shipmentId, otp });
      if (!v.valid) {
        toast({
          title: t("OTP verification failed", "OTP မမှန်ပါ"),
          description: `${t("Mode", "Mode")}: ${v.mode} • ${t("Reason", "Reason")}: ${v.reason ?? "-"}`,
          variant: "destructive" as any,
        });
        return;
      }
    }

    // Evidence rules: COD always requires proof; for otpForAll you may also require proof (we keep COD-only strict)
    if (isCod && !draft.signature && !draft.photo) {
      toast({
        title: t("Proof required for COD", "COD အတွက် အထောက်အထားလိုအပ်ပါသည်"),
        description: t("Capture signature or photo.", "Signature သို့မဟုတ် Photo တစ်ခုခုယူပါ။"),
        variant: "destructive" as any,
      });
      return;
    }

    const payload = {
      mode: draft.mode,
      recipientName: draft.recipientName,
      relationship: draft.relationship,
      otp: draft.otp || null,
      note: draft.note || null,
      signature: draft.signature || null,
      photo: draft.photo || null,
      codAmount: cod,
      at: new Date().toISOString(),
      actorEmail: user?.email ?? null,
      actorRole: role ?? null,
    };

    try {
      if (draft.mode === "DELIVERED") await markDelivered(draft.shipmentId, payload);
      else await markDeliveryFailed(draft.shipmentId, payload);

      toast({ title: t("Saved", "သိမ်းပြီးပါပြီ") });
      setDeliverOpen(false);
      setDraft(null);
      await refresh();

      if (batchQueue.length) nextInBatch();
    } catch (e: any) {
      toast({ title: "Save failed", description: e?.message || String(e), variant: "destructive" as any });
    }
  }

  function findShipmentIdByCode(code: string): string | null {
    const upper = code.toUpperCase();
    const found =
      rows.find((r) => String(r.trackingNumber ?? "").toUpperCase() === upper) ||
      rows.find((r) => String(r.wayId ?? "").toUpperCase() === upper) ||
      rows.find((r) => String(r.id) === upper);
    return found ? found.id : null;
  }

  async function handleScan(raw: string) {
    const code = normalizeCode(raw);
    const id = findShipmentIdByCode(code);

    if (!id) {
      toast({ title: t("Not found", "မတွေ့ပါ"), description: `${t("Scanned", "Scan")}: ${code}`, variant: "destructive" as any });
      return;
    }

    setSelectedId(id);
    setQ(code);

    if (batchMode) {
      setBatchQueue((prev) => (prev.includes(id) ? prev : [...prev, id]));
      toast({ title: t("Queued", "Queue ထဲထည့်ပြီး"), description: code });

      // ✅ Auto pickup in batch mode
      if (autoPickup) await pickup(id);

      return;
    }

    setScanOpen(false);
    toast({ title: t("Found", "တွေ့ပါပြီ"), description: code });
  }

  return (
    <ExecutionShell title={t("Execution Portal", "Execution Portal")}>
      <div className="space-y-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="text-sm font-black tracking-widest uppercase">{t("Rider Worklist", "Rider လုပ်ငန်းစာရင်း")}</div>
              <div className="text-xs text-white/60">{user?.email ?? "—"} • {String(role ?? "NO_ROLE")}</div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Badge variant="outline" className={batchQueue.length ? "border-amber-500/30 text-amber-300 bg-amber-500/10" : "border-white/10 text-white/60"}>
                {batchQueue.length ? `${batchQueue.length} queued` : "queue=0"}
              </Badge>
              {otpForAll ? (
                <Badge variant="outline" className="border-sky-500/30 text-sky-300 bg-sky-500/10">OTP_ALL</Badge>
              ) : null}
              <Button variant="outline" className="border-white/10" onClick={() => void refresh()}>
                <RefreshCw className="h-4 w-4 mr-2" /> {t("Refresh", "ပြန်တင်")}
              </Button>
              <Button className="bg-sky-600 hover:bg-sky-500" onClick={() => setScanOpen(true)}>
                <QrCode className="h-4 w-4 mr-2" /> {t("Scan", "Scan")}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-7 relative">
            <Search className="h-4 w-4 text-white/40 absolute left-4 top-1/2 -translate-y-1/2" />
            <Input className="pl-11 bg-[#05080F] border-white/10" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("Search…", "ရှာရန်…")} />
          </div>
          <div className="md:col-span-5">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-[#05080F] border-white/10"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                {statusOptions.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card className="bg-[#05080F] border-white/10">
          <CardContent className="p-0">
            <div className="divide-y divide-white/5">
              {loading ? (
                <div className="p-6 text-sm text-white/60">{t("Loading…", "ရယူနေပါသည်…")}</div>
              ) : filtered.length === 0 ? (
                <div className="p-6 text-sm text-white/60">{t("No assigned shipments.", "တာဝန်ပေးထားသော Shipment မရှိပါ။")}</div>
              ) : (
                filtered.map((r) => {
                  const key = r.trackingNumber ?? r.wayId ?? r.id;
                  const cod = Number(r.codAmount ?? 0);
                  return (
                    <div key={r.id} className={`p-4 md:p-5 flex items-start justify-between gap-4 flex-wrap ${selectedId === r.id ? "bg-emerald-500/5" : ""}`}>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="font-black text-white">{key}</div>
                          <Badge variant="outline" className={badgeFor(r.status)}>{String(r.status ?? "UNKNOWN").toUpperCase()}</Badge>
                          {cod > 0 ? (
                            <Badge variant="outline" className="border-amber-500/30 text-amber-300 bg-amber-500/10">COD {cod}</Badge>
                          ) : null}
                        </div>
                        <div className="text-sm text-white/70 mt-1">{r.receiverName ?? "—"} • {r.receiverPhone ?? "—"}</div>
                        <div className="text-xs text-white/50 mt-1 break-words">{r.receiverAddress ?? "—"}</div>
                        <div className="text-[10px] text-white/40 mt-2 font-mono">id={r.id} • updated={r.updatedAt ?? "—"}</div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button variant="outline" className="border-white/10" onClick={() => void pickup(r.id)}>
                          <PackageCheck className="h-4 w-4 mr-2" /> {t("Pickup", "Pickup")}
                        </Button>
                        <Button className="bg-emerald-600 hover:bg-emerald-500" onClick={() => openDeliver(r.id)}>
                          {t("Deliver / NDR", "Deliver / NDR")}
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Scan Modal */}
        <Dialog open={scanOpen} onOpenChange={(v) => { setScanOpen(v); if (!v) { setBatchMode(false); } }}>
          <DialogContent className="bg-[#05080F] border-white/10 text-white max-w-3xl">
            <DialogHeader>
              <DialogTitle className="font-black tracking-widest uppercase">{t("Scan Waybill", "Waybill စကန်ဖတ်ရန်")}</DialogTitle>
            </DialogHeader>

            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Button variant={!batchMode ? "default" : "outline"} className={!batchMode ? "bg-sky-600 hover:bg-sky-500" : "border-white/10"} onClick={() => setBatchMode(false)}>
                  {t("Single", "Single")}
                </Button>
                <Button variant={batchMode ? "default" : "outline"} className={batchMode ? "bg-emerald-600 hover:bg-emerald-500" : "border-white/10"} onClick={() => setBatchMode(true)}>
                  <ListChecks className="h-4 w-4 mr-2" /> {t("Batch", "Batch")}
                </Button>
              </div>

              {batchMode ? (
                <div className="flex items-center gap-2">
                  <Button variant={autoPickup ? "default" : "outline"} className={autoPickup ? "bg-amber-600 hover:bg-amber-500" : "border-white/10"} onClick={() => setAutoPickup((v) => !v)}>
                    <Zap className="h-4 w-4 mr-2" /> {autoPickup ? t("Auto Pickup ON", "Auto Pickup ON") : t("Auto Pickup OFF", "Auto Pickup OFF")}
                  </Button>
                  <Badge variant="outline" className="border-amber-500/30 text-amber-300 bg-amber-500/10">{batchQueue.length} queued</Badge>
                  <Button className="bg-emerald-600 hover:bg-emerald-500" disabled={!batchQueue.length} onClick={startBatchProcessing}>
                    <Play className="h-4 w-4 mr-2" /> {t("Start", "Start")}
                  </Button>
                  <Button variant="outline" className="border-white/10" onClick={() => { setBatchQueue([]); setBatchIndex(0); }} disabled={!batchQueue.length}>
                    <Trash2 className="h-4 w-4 mr-2" /> {t("Clear", "ဖျက်")}
                  </Button>
                </div>
              ) : null}
            </div>

            <QRCodeScanner continuous={batchMode} cooldownMs={1200} onScan={handleScan} onError={(e) => toast({ title: "Scan error", description: e, variant: "destructive" as any })} />

            <DialogFooter>
              <Button variant="outline" className="border-white/10" onClick={() => setScanOpen(false)}>
                <XCircle className="h-4 w-4 mr-2" /> {t("Close", "ပိတ်")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delivery Modal */}
        <Dialog open={deliverOpen} onOpenChange={(v) => { setDeliverOpen(v); if (!v) setDraft(null); }}>
          <DialogContent className="bg-[#05080F] border-white/10 text-white max-w-3xl">
            <DialogHeader>
              <DialogTitle className="font-black tracking-widest uppercase">
                {t("Delivery Proof", "Delivery Proof")}
                {batchQueue.length ? <span className="ml-3 text-xs font-mono text-amber-300 tracking-widest uppercase">batch {batchIndex+1}/{batchQueue.length}</span> : null}
              </DialogTitle>
            </DialogHeader>

            {draft ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <div className="text-xs font-mono text-white/60 tracking-widest uppercase">{t("Mode", "အမျိုးအစား")}</div>
                    <Select value={draft.mode} onValueChange={(v) => setDraft((x) => x ? { ...x, mode: v as DeliverMode } : x)}>
                      <SelectTrigger className="bg-[#0B101B] border-white/10"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DELIVERED">{t("Delivered", "Delivered")}</SelectItem>
                        <SelectItem value="NDR">{t("Failed (NDR)", "Failed (NDR)")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-mono text-white/60 tracking-widest uppercase">{t("Relationship", "ဆက်ဆံရေး")}</div>
                    <Select value={draft.relationship} onValueChange={(v) => setDraft((x) => x ? { ...x, relationship: v as any } : x)}>
                      <SelectTrigger className="bg-[#0B101B] border-white/10"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["Self","Family","Neighbor","Guard","Other"].map((x) => (<SelectItem key={x} value={x}>{x}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <div className="text-xs font-mono text-white/60 tracking-widest uppercase">{t("Recipient name", "လက်ခံသူအမည်")}</div>
                    <Input className="bg-[#0B101B] border-white/10" value={draft.recipientName} onChange={(e) => setDraft((x) => x ? { ...x, recipientName: e.target.value } : x)} />
                  </div>
                  <div className="space-y-2">
                    <div className="text-xs font-mono text-white/60 tracking-widest uppercase">{t("OTP", "OTP")}</div>
                    <Input className="bg-[#0B101B] border-white/10" value={draft.otp} onChange={(e) => setDraft((x) => x ? { ...x, otp: e.target.value } : x)} />
                    <div className="text-[10px] text-white/40">
                      {otpForAll ? t("OTP required for ALL shipments.", "Shipment အားလုံးအတွက် OTP လိုပါသည်။") : t("OTP required for COD only.", "COD အတွက်သာ OTP လိုပါသည်။")}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-mono text-white/60 tracking-widest uppercase">{t("Note", "မှတ်ချက်")}</div>
                  <Input className="bg-[#0B101B] border-white/10" value={draft.note} onChange={(e) => setDraft((x) => x ? { ...x, note: e.target.value } : x)} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 rounded-2xl border border-white/10 bg-white/5">
                    <div className="text-xs font-mono text-white/60 tracking-widest uppercase mb-2">{t("Signature", "Signature")}</div>
                    <SignaturePad onSave={(sig) => setDraft((x) => x ? { ...x, signature: sig } : x)} />
                  </div>
                  <div className="p-3 rounded-2xl border border-white/10 bg-white/5">
                    <div className="text-xs font-mono text-white/60 tracking-widest uppercase mb-2">{t("Photo", "Photo")}</div>
                    <PhotoCapture onCapture={(p) => setDraft((x) => x ? { ...x, photo: p } : x)} watermarkData={{ ttId: draft.shipmentId, userId: user?.id ?? "unknown", timestamp: new Date().toISOString(), gps: "auto" }} required={false} />
                  </div>
                </div>
              </div>
            ) : null}

            <DialogFooter className="gap-2">
              <Button variant="outline" className="border-white/10" onClick={() => { setDeliverOpen(false); setDraft(null); }}>
                <XCircle className="h-4 w-4 mr-2" /> {t("Cancel", "မလုပ်တော့")}
              </Button>
              <Button className="bg-emerald-600 hover:bg-emerald-500" onClick={() => void submitDeliver()}>
                <CheckCircle2 className="h-4 w-4 mr-2" /> {t("Confirm", "အတည်ပြု")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ExecutionShell>
  );
}
EOF

# ------------------------------------------------------------------------------
# 10) App.tsx: add route /portal/execution/intake
# ------------------------------------------------------------------------------
cat > patch_app.js <<'NODE_EOF'
const fs = require('fs');
const path = 'src/App.tsx';

if (fs.existsSync(path)) {
  let s = fs.readFileSync(path, 'utf-8');
  if (!s.includes('/portal/execution/intake')) {
    console.log("⚠️ App.tsx exists but route missing. Add manually if needed:");
    console.log('  <Route path="/portal/execution/intake" element={<RequireRole allow={["RIDER","DRIVER","HELPER","SUPER_ADMIN","SYS","APP_OWNER"]}><ExecutionParcelIntakePage /></RequireRole>} />');
  }
} else {
  console.log("⚠️ src/App.tsx not found; add route manually.");
}
NODE_EOF

node patch_app.js && rm patch_app.js

# ------------------------------------------------------------------------------
# Install deps
# ------------------------------------------------------------------------------
if command -v npm >/dev/null 2>&1; then
  npm install
else
  echo "⚠️ npm not found. Run: npm install"
fi

git add "$PKG" "$IMGQ" "$MAPBOX" "$LABEL" "$OTP" "$QRC" "$ROUTEMAP" "$SHELL" "$EXEC" "$INTAKE" 2>/dev/null || true

echo "✅ Applied enterprise intake + extraction + planning."
echo
echo "IMPORTANT ENV:"
echo "  VITE_MAPBOX_ACCESS_TOKEN=pk.__REPLACE_ME__"
echo "  VITE_OTP_VALIDATE_MODE=server"
echo "  VITE_OTP_FAIL_OPEN=true"
echo "  VITE_OTP_REQUIRE_FOR_ALL=true   # if you want OTP for all shipments"
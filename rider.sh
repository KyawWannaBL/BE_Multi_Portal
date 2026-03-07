#!/usr/bin/env bash
set -euo pipefail

# ==============================================================================
# ENTERPRISE RIDER PORTAL (Execution) PATCH
# - QR scan: BarcodeDetector + ZXing fallback (@zxing/browser)
# - COD policy: OTP required only if COD > 0 AND requires signature OR photo
# - Live Map: Mapbox live location + geocode stops + route to selected stop
# - Route planning: fixes ExecutionNavigationPage props for MapboxNavigationWorkspace
# - OCR from photo: tesseract.js
# - Export Excel: xlsx
# - Bilingual: EN/MY via LanguageContext.lang
#
# NOTE: You must set Mapbox token in your frontend .env:
#   VITE_MAPBOX_ACCESS_TOKEN=pk.__REPLACE_ME__
#
# Run from repo root:
#   bash apply-enterprise-rider-portal.sh
# ==============================================================================

backup() { [[ -f "$1" ]] && cp -f "$1" "$1.bak.$(date +%Y%m%d_%H%M%S)" || true; }

PKG="package.json"
SHIPMENTS="src/services/shipments.ts"
QRCOMP="src/components/QRCodeScanner.tsx"
MAPVIEW="src/components/MapView.tsx"
EXECSHELL="src/components/layout/ExecutionShell.tsx"
EXECPORTAL="src/pages/portals/ExecutionPortal.tsx"
EXECNAV="src/pages/portals/ExecutionNavigationPage.tsx"
EXECLIVE="src/pages/portals/ExecutionLiveMapPage.tsx"
EXECOCR="src/pages/portals/ExecutionOcrExportPage.tsx"
APP="src/App.tsx"

mkdir -p \
  "$(dirname "$SHIPMENTS")" \
  "$(dirname "$QRCOMP")" \
  "$(dirname "$MAPVIEW")" \
  "$(dirname "$EXECSHELL")" \
  "$(dirname "$EXECPORTAL")" \
  "$(dirname "$EXECNAV")" \
  "$(dirname "$EXECLIVE")" \
  "$(dirname "$EXECOCR")" \
  "$(dirname "$APP")"

backup "$PKG"
backup "$SHIPMENTS"
backup "$QRCOMP"
backup "$MAPVIEW"
backup "$EXECSHELL"
backup "$EXECPORTAL"
backup "$EXECNAV"
backup "$EXECLIVE"
backup "$EXECOCR"
backup "$APP"

# ------------------------------------------------------------------------------
# 1) Add dependencies (enterprise tech)
# ------------------------------------------------------------------------------
node - <<'NODE'
const fs = require("fs");

const pkgPath = "package.json";
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));

pkg.dependencies ||= {};

const need = {
  "@zxing/browser": "^0.1.4",
  "tesseract.js": "^5.1.1",
  "xlsx": "^0.18.5"
};

let changed = false;
for (const [k,v] of Object.entries(need)) {
  if (!pkg.dependencies[k]) {
    pkg.dependencies[k] = v;
    changed = true;
  }
}

fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
console.log(changed ? "✅ package.json updated (deps added)" : "✅ package.json already had required deps");
NODE

# ------------------------------------------------------------------------------
# 2) Fix MapView token mismatch (VITE_MAPBOX_ACCESS_TOKEN OR VITE_MAPBOX_TOKEN)
# ------------------------------------------------------------------------------
cat > "$MAPVIEW" <<'EOF'
import { useEffect, useMemo, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

type MapViewProps = {
  center?: [number, number];
  zoom?: number;
  styleUrl?: string;
  className?: string;
};

export default function MapView({
  center = [96.1951, 16.8661], // Yangon default
  zoom = 10,
  styleUrl = "mapbox://styles/mapbox/streets-v11",
  className,
}: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  const token = useMemo(
    () =>
      (import.meta.env.VITE_MAPBOX_ACCESS_TOKEN ||
        import.meta.env.VITE_MAPBOX_TOKEN ||
        "") as string,
    []
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError(
        "Missing Mapbox token. Set VITE_MAPBOX_ACCESS_TOKEN in .env and restart."
      );
      return;
    }
    if (!mapContainerRef.current) return;
    if (mapRef.current) return; // React 18 strict-mode safe

    mapboxgl.accessToken = token;

    try {
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: styleUrl,
        center,
        zoom,
      });

      map.addControl(new mapboxgl.NavigationControl(), "top-right");

      map.on("error", (e) => {
        console.error("Mapbox error:", e?.error);
        setError(e?.error?.message ?? "Mapbox failed to load (see console).");
      });

      mapRef.current = map;
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? "Failed to initialize map.");
    }

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [token, center, zoom, styleUrl]);

  if (error) {
    return (
      <div
        className={className}
        style={{
          width: "100%",
          height: 500,
          display: "grid",
          placeItems: "center",
          border: "1px solid rgba(255,255,255,.15)",
          borderRadius: 16,
          background: "rgba(255,255,255,.05)",
          color: "white",
          padding: 16,
        }}
      >
        <div style={{ maxWidth: 520 }}>
          <div style={{ fontWeight: 900, letterSpacing: ".18em", textTransform: "uppercase" }}>
            Mapbox Error
          </div>
          <div style={{ opacity: 0.75, marginTop: 8, fontSize: 13 }}>{error}</div>
        </div>
      </div>
    );
  }

  return <div ref={mapContainerRef} className={className} style={{ width: "100%", height: 520 }} />;
}
EOF

# ------------------------------------------------------------------------------
# 3) Shipments service: add execution worklist + status transitions (best-effort)
# ------------------------------------------------------------------------------
cat > "$SHIPMENTS" <<'EOF'
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { insertShipmentTrackingEvent } from "@/services/shipmentTracking";

export type Shipment = {
  id: string;
  wayId?: string | null;
  trackingNumber?: string | null;
  status?: string | null;

  receiverName?: string | null;
  receiverPhone?: string | null;
  receiverAddress?: string | null;

  codAmount?: number | null;
  updatedAt?: string | null;
};

export async function createShipment(input: {
  sender_name?: string;
  sender_phone?: string;
  sender_address?: string;
  sender_city?: string;
  sender_state?: string;

  receiver_name: string;
  receiver_phone: string;
  receiver_address: string;
  receiver_city: string;
  receiver_state?: string;

  item_price: number;
  delivery_fee: number;
  cod_amount?: number;
  package_weight?: number | null;
  cbm?: number;
  delivery_type?: string;
  remarks?: string;

  pickup_branch_id?: string | null;
  delivery_branch_id?: string | null;
}): Promise<{ shipmentId: string; wayId: string }> {
  const { data, error } = await supabase.rpc("create_shipment_portal", {
    p_sender_name: input.sender_name ?? null,
    p_sender_phone: input.sender_phone ?? null,
    p_sender_address: input.sender_address ?? null,
    p_sender_city: input.sender_city ?? null,
    p_sender_state: input.sender_state ?? null,

    p_receiver_name: input.receiver_name,
    p_receiver_phone: input.receiver_phone,
    p_receiver_address: input.receiver_address,
    p_receiver_city: input.receiver_city,
    p_receiver_state: input.receiver_state ?? "MM",

    p_item_price: Number(input.item_price || 0),
    p_delivery_fee: Number(input.delivery_fee || 0),
    p_cod_amount: Number(input.cod_amount || 0),
    p_package_weight: input.package_weight ?? null,
    p_cbm: Number(input.cbm ?? 1),
    p_delivery_type: input.delivery_type ?? "Normal",
    p_remarks: input.remarks ?? null,

    p_pickup_branch_id: input.pickup_branch_id ?? null,
    p_delivery_branch_id: input.delivery_branch_id ?? null,
  });

  if (error) throw new Error(error.message);
  const row = Array.isArray(data) ? data[0] : data;
  return { shipmentId: row.shipment_id, wayId: row.way_id };
}

export async function createShipmentDataEntry(input: Parameters<typeof createShipment>[0]) {
  return createShipment(input);
}

function mapShipmentRow(row: any): Shipment {
  return {
    id: String(row?.id ?? row?.shipment_id ?? ""),
    wayId: row?.way_id ?? null,
    trackingNumber: row?.tracking_number ?? row?.awb ?? row?.way_id ?? null,
    status: row?.status ?? null,
    receiverName: row?.receiver_name ?? null,
    receiverPhone: row?.receiver_phone ?? null,
    receiverAddress: row?.receiver_address ?? null,
    codAmount: typeof row?.cod_amount === "number" ? row.cod_amount : row?.cod_amount ? Number(row.cod_amount) : null,
    updatedAt: row?.updated_at ?? null,
  };
}

async function currentActor() {
  try {
    const { data } = await supabase.auth.getSession();
    const u = data?.session?.user;
    return {
      userId: u?.id ?? null,
      email: u?.email ?? null,
      role: (u?.app_metadata as any)?.role ?? (u?.user_metadata as any)?.role ?? null,
    };
  } catch {
    return { userId: null, email: null, role: null };
  }
}

/**
 * EN: Enterprise rider worklist, schema-resilient.
 * MY: Rider worklist ကို schema မတူနိုင်လို့ columns အမျိုးမျိုး စမ်းပြီးရယူမည်။
 */
export async function listAssignedShipments(): Promise<Shipment[]> {
  if (!isSupabaseConfigured) return [];

  const actor = await currentActor();
  const userId = actor.userId;
  const email = actor.email;

  const selects = [
    "id,way_id,tracking_number,status,receiver_name,receiver_phone,receiver_address,cod_amount,updated_at",
    "*",
  ];

  const idCols = ["assigned_to", "assigned_rider_id", "executor_id", "rider_id", "assigned_user_id"];
  for (const sel of selects) {
    for (const col of idCols) {
      if (!userId) continue;
      const res = await supabase.from("shipments").select(sel).eq(col as any, userId).order("updated_at", { ascending: false }).limit(250);
      if (!res.error && Array.isArray(res.data)) return res.data.map(mapShipmentRow);
    }
  }

  const emailCols = ["assigned_email", "rider_email", "executor_email"];
  for (const sel of selects) {
    for (const col of emailCols) {
      if (!email) continue;
      const res = await supabase.from("shipments").select(sel).eq(col as any, email).order("updated_at", { ascending: false }).limit(250);
      if (!res.error && Array.isArray(res.data)) return res.data.map(mapShipmentRow);
    }
  }

  const fallbackStatuses = ["OUT_FOR_DELIVERY", "PICKED_UP", "IN_TRANSIT", "DELIVERY_FAILED_NDR"];
  for (const sel of selects) {
    const res = await supabase.from("shipments").select(sel).in("status" as any, fallbackStatuses as any).order("updated_at", { ascending: false }).limit(250);
    if (!res.error && Array.isArray(res.data)) return res.data.map(mapShipmentRow);
  }

  return [];
}

async function transitionShipmentBestEffort(shipmentId: string, nextStatusCandidates: string[]) {
  for (const status of nextStatusCandidates) {
    try {
      const rpc = await supabase.rpc("transition_shipment", { p_shipment_id: shipmentId, p_next_status: status });
      if (!rpc.error) return;
    } catch {}

    try {
      const upd = await supabase.from("shipments").update({ status, updated_at: new Date().toISOString() } as any).eq("id", shipmentId);
      if (!upd.error) return;
    } catch {}
  }
  throw new Error("Unable to transition shipment (schema mismatch or permission denied).");
}

async function track(eventType: string, shipmentId: string, metadata: any) {
  try {
    const actor = await currentActor();
    await insertShipmentTrackingEvent({
      shipmentId,
      eventType,
      actorId: actor.userId,
      actorRole: actor.role,
      metadata: metadata ?? {},
    });
  } catch {
    // best-effort
  }
}

export async function markPickedUp(shipmentId: string, evidence?: Record<string, unknown>) {
  await transitionShipmentBestEffort(shipmentId, ["PICKED_UP", "OUT_FOR_DELIVERY"]);
  await track("EXEC_PICKUP", shipmentId, evidence ?? {});
}

export async function markDelivered(shipmentId: string, evidence?: Record<string, unknown>) {
  await transitionShipmentBestEffort(shipmentId, ["DELIVERED", "DELIVERED_OK"]);
  await track("EXEC_DELIVERED", shipmentId, evidence ?? {});
}

export async function markDeliveryFailed(shipmentId: string, evidence?: Record<string, unknown>) {
  await transitionShipmentBestEffort(shipmentId, ["DELIVERY_FAILED_NDR", "DELIVERY_FAILED"]);
  await track("EXEC_NDR", shipmentId, evidence ?? {});
}
EOF

# ------------------------------------------------------------------------------
# 4) ExecutionShell (sidebar menu)
# ------------------------------------------------------------------------------
cat > "$EXECSHELL" <<'EOF'
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
# 5) QRCodeScanner: REAL scan (BarcodeDetector + ZXing fallback)
# ------------------------------------------------------------------------------
cat > "$QRCOMP" <<'EOF'
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Camera, RefreshCw, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

type Props = {
  onScan: (value: string) => void;
  onError?: (error: string) => void;
  className?: string;
};

export function QRCodeScanner({ onScan, onError, className }: Props) {
  const { lang } = useLanguage();
  const t = (en: string, my: string) => (lang === "en" ? en : my);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const zxingRef = useRef<any>(null);

  const [active, setActive] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const stop = useCallback(async () => {
    try {
      if (zxingRef.current?.reset) zxingRef.current.reset();
    } catch {}
    try {
      const v = videoRef.current;
      const s = v?.srcObject as MediaStream | null;
      s?.getTracks?.().forEach((tr) => tr.stop());
      if (v) v.srcObject = null;
    } catch {}
    setActive(false);
  }, []);

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

      // 1) BarcodeDetector (best performance where supported)
      if ("BarcodeDetector" in window) {
        const detector = new (window as any).BarcodeDetector({ formats: ["qr_code"] });
        let cancelled = false;

        const loop = async () => {
          if (cancelled) return;
          try {
            const codes = await detector.detect(v);
            if (codes?.length) {
              const raw = String(codes[0].rawValue ?? "").trim();
              if (raw) {
                onScan(raw);
                await stop();
                return;
              }
            }
          } catch {
            // fallthrough to next frame
          }
          requestAnimationFrame(loop);
        };

        loop();
        return () => {
          cancelled = true;
        };
      }

      // 2) ZXing fallback
      const mod = await import("@zxing/browser");
      const reader = new mod.BrowserQRCodeReader();
      zxingRef.current = reader;

      reader.decodeFromVideoElement(v, (result: any, error: any) => {
        if (result?.getText) {
          const raw = String(result.getText() ?? "").trim();
          if (raw) {
            onScan(raw);
            void stop();
          }
        } else if (error && error.name !== "NotFoundException") {
          // ignore NotFoundException (no code in frame)
        }
      });
    } catch (e: any) {
      const msg = e?.message ?? "Camera access denied";
      setErr(msg);
      onError?.(msg);
      await stop();
    }
  }, [onError, onScan, stop]);

  useEffect(() => {
    void start();
    return () => {
      void stop();
    };
  }, [start, stop]);

  return (
    <div className={className}>
      <div className="rounded-3xl border border-white/10 bg-white/5 p-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-emerald-300" />
            <div>
              <div className="text-sm font-black tracking-widest uppercase">{t("QR Scanner", "QR Scanner")}</div>
              <div className="text-xs text-white/60">{t("Scan AWB / Waybill", "AWB / Waybill စကန်ဖတ်ရန်")}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" className="border-white/10" onClick={() => void start()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              {t("Restart", "ပြန်စ") }
            </Button>
            <Button variant="outline" className="border-white/10" onClick={() => void stop()}>
              <XCircle className="h-4 w-4 mr-2" />
              {t("Stop", "ပိတ်")}
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
# 6) ExecutionNavigationPage: fix props + wrap in ExecutionShell
# ------------------------------------------------------------------------------
cat > "$EXECNAV" <<'EOF'
import React, { useMemo, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Map } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import MapboxNavigationWorkspace from "@/features/maps/MapboxNavigationWorkspace";
import { ExecutionShell } from "@/components/layout/ExecutionShell";

export default function ExecutionNavigationPage() {
  const { lang } = useLanguage();
  const { role } = useAuth();
  const t = (en: string, my: string) => (lang === "en" ? en : my);

  const normalizedRole = (role ?? "").trim().toUpperCase();
  const canShare = ["RIDER", "DRIVER", "HELPER"].includes(normalizedRole);
  const [share, setShare] = useState(true);

  return (
    <ExecutionShell title={t("Navigation", "လမ်းညွှန်")}>
      <div className="space-y-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Map className="h-5 w-5" />
              <div>
                <div className="text-sm font-semibold">
                  {t("Live Navigation & Way Planning", "Live လမ်းညွှန် + လမ်းကြောင်းစီမံ")}
                </div>
                <div className="text-xs opacity-70">
                  {t("ETA + Remaining + Geofence arrival events", "ETA + Remaining + Geofence arrival events")}
                </div>
              </div>
            </div>

            {canShare ? (
              <div className="flex items-center gap-3">
                <div className="text-xs opacity-80">{t("Share location", "တည်နေရာ ပို့မည်")}</div>
                <Switch checked={share} onCheckedChange={setShare} />
                <Badge variant="outline">{share ? t("ON", "ဖွင့်") : t("OFF", "ပိတ်")}</Badge>
              </div>
            ) : (
              <Badge variant="outline">{t("Read-only", "Read-only")}</Badge>
            )}
          </CardContent>
        </Card>

        <MapboxNavigationWorkspace mode="rider" title={t("Rider Navigation", "Rider Navigation")} shareLocation={share && canShare} />
      </div>
    </ExecutionShell>
  );
}
EOF

# ------------------------------------------------------------------------------
# 7) Live Map Page (Mapbox live + geocode stops + route to selected)
# ------------------------------------------------------------------------------
cat > "$EXECLIVE" <<'EOF'
import React, { useEffect, useMemo, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Target, Route } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { listAssignedShipments, type Shipment } from "@/services/shipments";
import { geocodeForward, fetchDirections, isMapboxConfigured, type LngLat } from "@/services/mapbox";
import { ExecutionShell } from "@/components/layout/ExecutionShell";

type GeoCache = Record<string, { lng: number; lat: number; at: string }>;
const GEO_KEY = "exec_geocache_v1";

function loadGeoCache(): GeoCache {
  try {
    const raw = localStorage.getItem(GEO_KEY);
    const v = raw ? JSON.parse(raw) : {};
    return v && typeof v === "object" ? (v as GeoCache) : {};
  } catch {
    return {};
  }
}
function saveGeoCache(v: GeoCache) {
  localStorage.setItem(GEO_KEY, JSON.stringify(v));
}

async function getGeo(): Promise<LngLat | null> {
  if (!("geolocation" in navigator)) return null;
  return await new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (p) => resolve([p.coords.longitude, p.coords.latitude]),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  });
}

export default function ExecutionLiveMapPage() {
  const { lang } = useLanguage();
  const t = (en: string, my: string) => (lang === "en" ? en : my);

  const token = (import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || import.meta.env.VITE_MAPBOX_TOKEN || "") as string;

  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapDiv = useRef<HTMLDivElement | null>(null);
  const riderMarker = useRef<mapboxgl.Marker | null>(null);
  const stopMarkers = useRef<Record<string, mapboxgl.Marker>>({});
  const routeLayerId = "route-line";

  const [rows, setRows] = useState<Shipment[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const selected = useMemo(() => rows.find((r) => r.id === selectedId) ?? null, [rows, selectedId]);

  async function refresh() {
    setBusy(true);
    try {
      const r = await listAssignedShipments();
      setRows(r);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  useEffect(() => {
    if (!mapDiv.current || mapRef.current) return;
    if (!token) return;

    mapboxgl.accessToken = token;
    const map = new mapboxgl.Map({
      container: mapDiv.current,
      style: "mapbox://styles/mapbox/navigation-night-v1",
      center: [96.1951, 16.8661],
      zoom: 11,
      pitch: 40,
    });
    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    mapRef.current = map;
    return () => map.remove();
  }, [token]);

  async function followMe() {
    if (!mapRef.current) return;
    const p = await getGeo();
    if (!p) return;

    if (!riderMarker.current) {
      riderMarker.current = new mapboxgl.Marker({ color: "#10b981" }).setLngLat(p).addTo(mapRef.current);
    } else {
      riderMarker.current.setLngLat(p);
    }

    mapRef.current.flyTo({ center: p, zoom: 14, speed: 1.2 });
  }

  async function geocodeStops() {
    if (!isMapboxConfigured()) return;
    if (!mapRef.current) return;

    const cache = loadGeoCache();
    const nextCache: GeoCache = { ...cache };

    for (const s of rows) {
      const key = (s.trackingNumber ?? s.wayId ?? s.id) as string;
      if (nextCache[key]) continue;

      const addr = `${s.receiverAddress ?? ""}`.trim();
      if (!addr) continue;

      try {
        const features = await geocodeForward(addr, { limit: 1 });
        const c = features?.[0]?.center;
        if (Array.isArray(c) && c.length === 2) {
          nextCache[key] = { lng: c[0], lat: c[1], at: new Date().toISOString() };
        }
      } catch {
        // ignore single stop
      }
    }

    saveGeoCache(nextCache);
    renderMarkers(nextCache);
  }

  function renderMarkers(cache: GeoCache) {
    if (!mapRef.current) return;
    for (const s of rows) {
      const key = (s.trackingNumber ?? s.wayId ?? s.id) as string;
      const c = cache[key];
      if (!c) continue;

      if (!stopMarkers.current[key]) {
        stopMarkers.current[key] = new mapboxgl.Marker({ color: "#f59e0b" })
          .setLngLat([c.lng, c.lat])
          .setPopup(new mapboxgl.Popup().setHTML(`<b>${key}</b><br/>${s.receiverName ?? ""}`))
          .addTo(mapRef.current);
      } else {
        stopMarkers.current[key].setLngLat([c.lng, c.lat]);
      }
    }
  }

  async function routeToSelected() {
    if (!selected) return;
    if (!mapRef.current) return;
    if (!isMapboxConfigured()) return;

    const cache = loadGeoCache();
    const key = (selected.trackingNumber ?? selected.wayId ?? selected.id) as string;
    const stop = cache[key];
    if (!stop) return;

    const me = await getGeo();
    if (!me) return;

    const route = await fetchDirections({
      profile: "driving",
      coordinates: [me, [stop.lng, stop.lat]],
      overview: "full",
      geometries: "geojson",
      steps: false,
    });

    const geojson = {
      type: "Feature",
      properties: {},
      geometry: route.geometry,
    } as any;

    const map = mapRef.current;
    if (map.getLayer(routeLayerId)) map.removeLayer(routeLayerId);
    if (map.getSource(routeLayerId)) map.removeSource(routeLayerId);

    map.addSource(routeLayerId, { type: "geojson", data: geojson });
    map.addLayer({
      id: routeLayerId,
      type: "line",
      source: routeLayerId,
      paint: { "line-width": 5, "line-opacity": 0.85 },
    });

    map.fitBounds(
      [
        [Math.min(me[0], stop.lng), Math.min(me[1], stop.lat)],
        [Math.max(me[0], stop.lng), Math.max(me[1], stop.lat)],
      ],
      { padding: 60, duration: 800 }
    );
  }

  const mapOk = Boolean(token);

  return (
    <ExecutionShell title={t("Live Map View", "Live Map ကြည့်ရန်")}>
      <div className="space-y-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 flex items-center justify-between flex-wrap gap-3">
            <div className="space-y-1">
              <div className="text-sm font-black tracking-widest uppercase">{t("Rider Live Map", "Rider Live Map")}</div>
              <div className="text-xs text-white/60">
                {t("Geocode stops + route to selected", "Stops ကို geocode လုပ်ပြီး route ပြ")}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={mapOk ? "border-emerald-500/30 text-emerald-300" : "border-rose-500/30 text-rose-300"}>
                {mapOk ? "MAPBOX OK" : "MISSING TOKEN"}
              </Badge>
              <Button variant="outline" className="border-white/10" onClick={() => void refresh()} disabled={busy}>
                <RefreshCw className="h-4 w-4 mr-2" /> {t("Refresh", "ပြန်တင်")}
              </Button>
              <Button className="bg-emerald-600 hover:bg-emerald-500" onClick={() => void followMe()}>
                <Target className="h-4 w-4 mr-2" /> {t("Follow Me", "ကျွန်ုပ်နောက်လိုက်")}
              </Button>
              <Button className="bg-sky-600 hover:bg-sky-500" onClick={() => void geocodeStops()} disabled={!isMapboxConfigured()}>
                {t("Geocode Stops", "Stops geocode")}
              </Button>
              <Button className="bg-amber-600 hover:bg-amber-500" onClick={() => void routeToSelected()} disabled={!selected}>
                <Route className="h-4 w-4 mr-2" /> {t("Route", "Route")}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-8">
            <div className="rounded-3xl border border-white/10 overflow-hidden">
              {!mapOk ? (
                <div className="p-6 text-sm text-rose-300 bg-[#05080F]">
                  {t("Set VITE_MAPBOX_ACCESS_TOKEN to enable maps.", "Map အသုံးပြုရန် VITE_MAPBOX_ACCESS_TOKEN ထည့်ပါ။")}
                </div>
              ) : (
                <div ref={mapDiv} style={{ width: "100%", height: 560 }} />
              )}
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="rounded-3xl border border-white/10 bg-[#05080F] overflow-hidden">
              <div className="p-4 border-b border-white/10 text-xs font-mono text-white/60 tracking-widest uppercase">
                {t("Stops", "Stops")} ({rows.length})
              </div>
              <div className="max-h-[560px] overflow-auto">
                {rows.map((s) => {
                  const key = (s.trackingNumber ?? s.wayId ?? s.id) as string;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setSelectedId(s.id)}
                      className={`w-full text-left p-4 border-b border-white/5 hover:bg-white/5 ${
                        selectedId === s.id ? "bg-emerald-500/10" : ""
                      }`}
                    >
                      <div className="text-sm font-semibold text-white">{key}</div>
                      <div className="text-xs text-white/60 mt-1">{s.receiverName ?? "—"} • {s.receiverPhone ?? "—"}</div>
                      <div className="text-[10px] text-white/40 mt-1 break-words">{s.receiverAddress ?? "—"}</div>
                    </button>
                  );
                })}
                {!rows.length ? <div className="p-6 text-sm text-white/60">{t("No shipments.", "Shipment မရှိပါ။")}</div> : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ExecutionShell>
  );
}
EOF

# ------------------------------------------------------------------------------
# 8) OCR → Excel Page (Tesseract + XLSX) bilingual
# ------------------------------------------------------------------------------
cat > "$EXECOCR" <<'EOF'
import React, { useMemo, useState } from "react";
import { ExecutionShell } from "@/components/layout/ExecutionShell";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PhotoCapture from "@/components/PhotoCapture";
import { Download, FileImage, Wand2, XCircle, Plus } from "lucide-react";
import * as XLSX from "xlsx";

type Row = {
  waybill: string;
  receiver: string;
  phone: string;
  address: string;
  note: string;
};

function parseTextToRows(text: string): Row[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const rows: Row[] = [];
  let current: Partial<Row> = {};

  const push = () => {
    const r: Row = {
      waybill: (current.waybill ?? "").trim(),
      receiver: (current.receiver ?? "").trim(),
      phone: (current.phone ?? "").trim(),
      address: (current.address ?? "").trim(),
      note: (current.note ?? "").trim(),
    };
    if (r.waybill || r.phone || r.receiver || r.address) rows.push(r);
    current = {};
  };

  for (const l of lines) {
    const wb = l.match(/(?:AWB|WAYBILL|WB|TT)\s*[:#-]?\s*([A-Z0-9-]{6,})/i);
    if (wb?.[1]) {
      if (current.waybill) push();
      current.waybill = wb[1].toUpperCase();
      continue;
    }

    const phone = l.match(/(\+?95\s?9\d{7,9}|09\d{7,9})/);
    if (phone?.[1]) {
      current.phone = phone[1].replace(/\s+/g, "");
      continue;
    }

    // crude name heuristic
    if (!current.receiver && l.length <= 32 && !/\d/.test(l)) {
      current.receiver = l;
      continue;
    }

    // address fallback
    if (!current.address) current.address = l;
    else current.address += " " + l;
  }

  push();
  return rows.slice(0, 300);
}

export default function ExecutionOcrExportPage() {
  const { lang } = useLanguage();
  const t = (en: string, my: string) => (lang === "en" ? en : my);

  const [img, setImg] = useState<string | null>(null);
  const [text, setText] = useState<string>("");
  const [rows, setRows] = useState<Row[]>([]);
  const [busy, setBusy] = useState(false);

  const headers = useMemo(
    () => [
      t("Waybill / AWB", "Waybill / AWB"),
      t("Receiver", "လက်ခံသူ"),
      t("Phone", "ဖုန်း"),
      t("Address", "လိပ်စာ"),
      t("Note", "မှတ်ချက်"),
    ],
    [lang]
  );

  async function runOcr() {
    if (!img) return;
    setBusy(true);
    try {
      const mod = await import("tesseract.js");
      const res = await mod.recognize(img, "eng", {
        logger: () => {},
      } as any);

      const out = String(res?.data?.text ?? "");
      setText(out);
      setRows(parseTextToRows(out));
    } finally {
      setBusy(false);
    }
  }

  function exportXlsx() {
    const sheet = XLSX.utils.aoa_to_sheet([
      headers,
      ...rows.map((r) => [r.waybill, r.receiver, r.phone, r.address, r.note]),
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, sheet, "OCR");

    const file = `ocr_export_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, file);
  }

  function setCell(i: number, k: keyof Row, v: string) {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, [k]: v } : r)));
  }

  return (
    <ExecutionShell title={t("OCR → Excel", "OCR → Excel")}>
      <div className="space-y-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 space-y-2">
            <div className="text-sm font-black tracking-widest uppercase">{t("Text extraction from images", "ပုံမှ စာသားထုတ်ယူရန်")}</div>
            <div className="text-xs text-white/60">
              {t("Capture/upload → OCR → parse → export XLSX.", "Capture/upload → OCR → parse → XLSX ထုတ်ရန်")}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-6 space-y-3">
            <Card className="bg-[#05080F] border-white/10">
              <CardContent className="p-4 space-y-3">
                <div className="text-xs font-mono text-white/60 tracking-widest uppercase">{t("Capture", "Capture")}</div>
                <PhotoCapture
                  onCapture={(p) => setImg(p)}
                  watermarkData={{
                    ttId: "OCR",
                    userId: "exec",
                    timestamp: new Date().toISOString(),
                    gps: "auto",
                  }}
                  required={false}
                />
              </CardContent>
            </Card>

            <Card className="bg-[#05080F] border-white/10">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-mono text-white/60 tracking-widest uppercase">{t("Upload", "Upload")}</div>
                  <label className="inline-flex items-center gap-2 text-xs cursor-pointer">
                    <FileImage className="h-4 w-4" />
                    {t("Choose image", "ပုံရွေး")}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (!f) return;
                        const r = new FileReader();
                        r.onload = () => setImg(String(r.result));
                        r.readAsDataURL(f);
                      }}
                    />
                  </label>
                </div>

                {img ? (
                  <div className="rounded-2xl border border-white/10 overflow-hidden">
                    <img src={img} alt="ocr" className="w-full max-h-[320px] object-contain bg-black" />
                  </div>
                ) : (
                  <div className="text-sm text-white/60">{t("No image selected.", "ပုံမရွေးထားပါ။")}</div>
                )}

                <div className="flex gap-2">
                  <Button className="bg-emerald-600 hover:bg-emerald-500" disabled={!img || busy} onClick={() => void runOcr()}>
                    <Wand2 className="h-4 w-4 mr-2" />
                    {busy ? t("Processing…", "လုပ်နေသည်…") : t("Run OCR", "OCR စလုပ်")}
                  </Button>
                  <Button variant="outline" className="border-white/10" onClick={() => { setImg(null); setText(""); setRows([]); }}>
                    <XCircle className="h-4 w-4 mr-2" />
                    {t("Clear", "ဖျက်")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-6 space-y-3">
            <Card className="bg-[#05080F] border-white/10">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="text-xs font-mono text-white/60 tracking-widest uppercase">
                    {t("Parsed table", "Table")}
                    <span className="ml-2 text-white/40">({rows.length})</span>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" className="border-white/10" onClick={() => setRows((r) => [{ waybill:"", receiver:"", phone:"", address:"", note:"" }, ...r])}>
                      <Plus className="h-4 w-4 mr-2" /> {t("Add", "ထည့်")}
                    </Button>
                    <Button className="bg-sky-600 hover:bg-sky-500" disabled={!rows.length} onClick={exportXlsx}>
                      <Download className="h-4 w-4 mr-2" /> {t("Export XLSX", "XLSX ထုတ်")}
                    </Button>
                  </div>
                </div>

                <div className="overflow-auto rounded-2xl border border-white/10">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-white/5 text-white/70">
                      <tr>
                        {headers.map((h) => (
                          <th key={h} className="p-3 text-xs font-mono tracking-widest uppercase">{h}</th>
                        ))}
                        <th className="p-3 text-xs font-mono tracking-widest uppercase">{t("Actions", "လုပ်ဆောင်")}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {rows.map((r, i) => (
                        <tr key={i} className="hover:bg-white/5">
                          <td className="p-2"><Input className="bg-black/30 border-white/10" value={r.waybill} onChange={(e) => setCell(i, "waybill", e.target.value)} /></td>
                          <td className="p-2"><Input className="bg-black/30 border-white/10" value={r.receiver} onChange={(e) => setCell(i, "receiver", e.target.value)} /></td>
                          <td className="p-2"><Input className="bg-black/30 border-white/10" value={r.phone} onChange={(e) => setCell(i, "phone", e.target.value)} /></td>
                          <td className="p-2"><Input className="bg-black/30 border-white/10" value={r.address} onChange={(e) => setCell(i, "address", e.target.value)} /></td>
                          <td className="p-2"><Input className="bg-black/30 border-white/10" value={r.note} onChange={(e) => setCell(i, "note", e.target.value)} /></td>
                          <td className="p-2">
                            <Button variant="outline" className="border-white/10" onClick={() => setRows((prev) => prev.filter((_, idx) => idx !== i))}>
                              {t("Remove", "ဖျက်")}
                            </Button>
                          </td>
                        </tr>
                      ))}
                      {!rows.length ? (
                        <tr><td colSpan={6} className="p-6 text-white/60">{t("No rows.", "Row မရှိပါ။")}</td></tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>

                <div className="text-xs text-white/40">
                  {t("Tip: OCR quality improves with clear photos and good lighting.", "အကြံပြုချက်: ပုံကြည်လင်ပြီး အလင်းကောင်းမှ OCR ပိုကောင်းမည်။")}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#05080F] border-white/10">
              <CardContent className="p-4">
                <div className="text-xs font-mono text-white/60 tracking-widest uppercase">{t("Raw OCR text", "OCR text")}</div>
                <pre className="mt-2 text-xs text-white/60 whitespace-pre-wrap break-words">{text || "—"}</pre>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ExecutionShell>
  );
}
EOF

# ------------------------------------------------------------------------------
# 9) ExecutionPortal enterprise: QR scan + COD OTP policy + proof capture
# ------------------------------------------------------------------------------
cat > "$EXECPORTAL" <<'EOF'
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
import { Search, QrCode, RefreshCw, CheckCircle2, XCircle, PackageCheck } from "lucide-react";
import SignaturePad from "@/components/SignaturePad";
import PhotoCapture from "@/components/PhotoCapture";
import QRCodeScanner from "@/components/QRCodeScanner";
import { parseWayIdFromLabel } from "@/services/shipmentTracking";
import { listAssignedShipments, markPickedUp, markDelivered, markDeliveryFailed, type Shipment } from "@/services/shipments";
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

function badgeFor(status?: string | null) {
  const s = String(status ?? "").toUpperCase();
  if (s.includes("DELIVER")) return "border-emerald-500/30 text-emerald-300 bg-emerald-500/10";
  if (s.includes("FAIL") || s.includes("NDR")) return "border-rose-500/30 text-rose-300 bg-rose-500/10";
  if (s.includes("OUT") || s.includes("PICK")) return "border-amber-500/30 text-amber-300 bg-amber-500/10";
  return "border-white/10 text-white/70 bg-white/5";
}

export default function ExecutionPortal() {
  const { lang } = useLanguage();
  const { user, role } = useAuth();
  const t = (en: string, my: string) => (lang === "en" ? en : my);

  const [rows, setRows] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const [scanOpen, setScanOpen] = useState(false);
  const [deliverOpen, setDeliverOpen] = useState(false);
  const [draft, setDraft] = useState<DeliverDraft | null>(null);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = useMemo(() => rows.find((r) => r.id === selectedId) ?? null, [rows, selectedId]);

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

  useEffect(() => {
    void refresh();
  }, []);

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

  async function pickup(shipmentId: string) {
    try {
      await markPickedUp(shipmentId, { at: new Date().toISOString() });
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

    // ✅ COD policy: OTP required only if COD > 0
    if (isCod) {
      const otp = draft.otp.trim();
      const otpOk = /^\d{4,8}$/.test(otp);
      if (!otpOk) {
        toast({ title: t("OTP required for COD", "COD အတွက် OTP လိုအပ်ပါသည်"), description: t("Enter 4-8 digits OTP.", "OTP ကို 4-8 လုံးထည့်ပါ။"), variant: "destructive" as any });
        return;
      }

      // ✅ COD policy: require signature OR photo evidence
      if (!draft.signature && !draft.photo) {
        toast({
          title: t("Proof required for COD", "COD အတွက် အထောက်အထားလိုအပ်ပါသည်"),
          description: t("Capture signature or photo.", "Signature သို့မဟုတ် Photo တစ်ခုခုယူပါ။"),
          variant: "destructive" as any,
        });
        return;
      }
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
    };

    try {
      if (draft.mode === "DELIVERED") await markDelivered(draft.shipmentId, payload);
      else await markDeliveryFailed(draft.shipmentId, payload);

      toast({ title: t("Saved", "သိမ်းပြီးပါပြီ") });
      setDeliverOpen(false);
      setDraft(null);
      await refresh();
    } catch (e: any) {
      toast({ title: "Save failed", description: e?.message || String(e), variant: "destructive" as any });
    }
  }

  function handleScan(raw: string) {
    const code = parseWayIdFromLabel(raw) ?? raw.trim();
    const found =
      rows.find((r) => String(r.trackingNumber ?? "").toUpperCase() === code.toUpperCase()) ||
      rows.find((r) => String(r.wayId ?? "").toUpperCase() === code.toUpperCase()) ||
      rows.find((r) => String(r.id) === code);

    if (!found) {
      toast({ title: t("Not found", "မတွေ့ပါ"), description: `${t("Scanned", "Scan")}: ${code}`, variant: "destructive" as any });
      setScanOpen(false);
      return;
    }

    setSelectedId(found.id);
    setQ(code);
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
            <div className="flex gap-2">
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
              <SelectTrigger className="bg-[#05080F] border-white/10">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
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
                    <div
                      key={r.id}
                      className={`p-4 md:p-5 flex items-start justify-between gap-4 flex-wrap ${selectedId === r.id ? "bg-emerald-500/5" : ""}`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="font-black text-white">{key}</div>
                          <Badge variant="outline" className={badgeFor(r.status)}>{String(r.status ?? "UNKNOWN").toUpperCase()}</Badge>
                          {cod > 0 ? (
                            <Badge variant="outline" className="border-amber-500/30 text-amber-300 bg-amber-500/10">
                              COD {cod}
                            </Badge>
                          ) : null}
                        </div>
                        <div className="text-sm text-white/70 mt-1">{r.receiverName ?? "—"} • {r.receiverPhone ?? "—"}</div>
                        <div className="text-xs text-white/50 mt-1 break-words">{r.receiverAddress ?? "—"}</div>
                        <div className="text-[10px] text-white/40 mt-2 font-mono">id={r.id} • updated={r.updatedAt ?? "—"}</div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button variant="outline" className="border-white/10" onClick={() => void pickup(r.id)}>
                          <PackageCheck className="h-4 w-4 mr-2" />
                          {t("Pickup", "Pickup")}
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

        {/* QR Scan Modal */}
        <Dialog open={scanOpen} onOpenChange={setScanOpen}>
          <DialogContent className="bg-[#05080F] border-white/10 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-black tracking-widest uppercase">{t("Scan Waybill", "Waybill စကန်ဖတ်ရန်")}</DialogTitle>
            </DialogHeader>
            <QRCodeScanner onScan={handleScan} onError={(e) => toast({ title: "Scan error", description: e, variant: "destructive" as any })} />
            <DialogFooter>
              <Button variant="outline" className="border-white/10" onClick={() => setScanOpen(false)}>
                <XCircle className="h-4 w-4 mr-2" /> {t("Close", "ပိတ်")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delivery / NDR Modal */}
        <Dialog open={deliverOpen} onOpenChange={(v) => { setDeliverOpen(v); if (!v) setDraft(null); }}>
          <DialogContent className="bg-[#05080F] border-white/10 text-white max-w-3xl">
            <DialogHeader>
              <DialogTitle className="font-black tracking-widest uppercase">
                {t("Delivery Proof", "Delivery Proof")}
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
                    <div className="text-xs font-mono text-white/60 tracking-widest uppercase">{t("OTP (COD only)", "OTP (COD only)")}</div>
                    <Input className="bg-[#0B101B] border-white/10" value={draft.otp} onChange={(e) => setDraft((x) => x ? { ...x, otp: e.target.value } : x)} />
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
                    <PhotoCapture
                      onCapture={(p) => setDraft((x) => x ? { ...x, photo: p } : x)}
                      watermarkData={{
                        ttId: draft.shipmentId,
                        userId: user?.id ?? "unknown",
                        timestamp: new Date().toISOString(),
                        gps: "auto",
                      }}
                      required={false}
                    />
                  </div>
                </div>

                <div className="text-xs text-white/50">
                  {t(
                    "COD policy: OTP required + (signature OR photo).",
                    "COD policy: OTP လို + (signature သို့မဟုတ် photo) လို"
                  )}
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
# 10) App.tsx: ensure execution routes exist (keeps your existing executive route)
# ------------------------------------------------------------------------------
cat > "$APP" <<'EOF'
import React, { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import { RequireAuth } from "@/routes/RequireAuth";
import { RequireRole } from "@/routes/RequireRole";

import Login from "./pages/Login";
import Unauthorized from "./pages/Unauthorized";
import DashboardRedirect from "./pages/DashboardRedirect";
import PortalHome from "./pages/portal/PortalHome";
import ManualPage from "./pages/ManualPage";

import AdminPortal from "./pages/portals/AdminPortal";
import OperationsPortal from "./pages/portals/OperationsPortal";
import FinancePortal from "./pages/portals/FinancePortal";
import MarketingPortal from "./pages/portals/MarketingPortal";
import HrPortal from "./pages/portals/HrPortal";
import SupportPortal from "./pages/portals/SupportPortal";
import SupervisorPortal from "./pages/portals/SupervisorPortal";
import WarehousePortal from "./pages/portals/WarehousePortal";
import BranchPortal from "./pages/portals/BranchPortal";
import MerchantPortal from "./pages/portals/MerchantPortal";
import CustomerPortal from "./pages/portals/CustomerPortal";

import ExecutiveCommandCenter from "@/pages/portals/admin/ExecutiveCommandCenter";

import ExecutionPortal from "@/pages/portals/ExecutionPortal";
import ExecutionNavigationPage from "@/pages/portals/ExecutionNavigationPage";
import ExecutionLiveMapPage from "@/pages/portals/ExecutionLiveMapPage";
import ExecutionOcrExportPage from "@/pages/portals/ExecutionOcrExportPage";

export default function App() {
  return (
    <LanguageProvider>
      <Suspense fallback={<div className="bg-[#05080F] min-h-screen" />}>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            <Route element={<RequireAuth />}>
              <Route path="/" element={<DashboardRedirect />} />
              <Route path="/portal" element={<PortalHome />} />

              {/* Portals */}
              <Route path="/portal/admin" element={<AdminPortal />} />
              <Route path="/portal/operations" element={<OperationsPortal />} />
              <Route path="/portal/finance" element={<FinancePortal />} />
              <Route path="/portal/marketing" element={<MarketingPortal />} />
              <Route path="/portal/hr" element={<HrPortal />} />
              <Route path="/portal/support" element={<SupportPortal />} />
              <Route path="/portal/supervisor" element={<SupervisorPortal />} />
              <Route path="/portal/warehouse" element={<WarehousePortal />} />
              <Route path="/portal/branch" element={<BranchPortal />} />
              <Route path="/portal/merchant" element={<MerchantPortal />} />
              <Route path="/portal/customer" element={<CustomerPortal />} />

              {/* Existing executive route (kept) */}
              <Route
                path="/portal/admin/executive"
                element={
                  <RequireRole allow={["SUPER_ADMIN", "SYS"]}>
                    <ExecutiveCommandCenter />
                  </RequireRole>
                }
              />

              {/* Rider / Driver / Helper (Enterprise Execution Portal) */}
              <Route
                path="/portal/execution"
                element={
                  <RequireRole allow={["RIDER", "DRIVER", "HELPER", "SUPER_ADMIN", "SYS", "APP_OWNER"]}>
                    <ExecutionPortal />
                  </RequireRole>
                }
              />
              <Route
                path="/portal/execution/navigation"
                element={
                  <RequireRole allow={["RIDER", "DRIVER", "HELPER", "SUPER_ADMIN", "SYS", "APP_OWNER"]}>
                    <ExecutionNavigationPage />
                  </RequireRole>
                }
              />
              <Route
                path="/portal/execution/live-map"
                element={
                  <RequireRole allow={["RIDER", "DRIVER", "HELPER", "SUPER_ADMIN", "SYS", "APP_OWNER"]}>
                    <ExecutionLiveMapPage />
                  </RequireRole>
                }
              />
              <Route
                path="/portal/execution/ocr-export"
                element={
                  <RequireRole allow={["RIDER", "DRIVER", "HELPER", "SUPER_ADMIN", "SYS", "APP_OWNER"]}>
                    <ExecutionOcrExportPage />
                  </RequireRole>
                }
              />
              <Route
                path="/portal/execution/manual"
                element={
                  <RequireRole allow={["RIDER", "DRIVER", "HELPER", "OPERATIONS_ADMIN", "STAFF", "DATA_ENTRY", "SUPER_ADMIN", "SYS", "APP_OWNER"]}>
                    <ManualPage />
                  </RequireRole>
                }
              />
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </Suspense>
    </LanguageProvider>
  );
}
EOF

# ------------------------------------------------------------------------------
# 11) Install dependencies
# ------------------------------------------------------------------------------
if command -v npm >/dev/null 2>&1; then
  echo "📦 Installing deps..."
  npm install
else
  echo "⚠️ npm not found. Run: npm install"
fi

git add \
  "$PKG" \
  "$SHIPMENTS" \
  "$QRCOMP" \
  "$MAPVIEW" \
  "$EXECSHELL" \
  "$EXECPORTAL" \
  "$EXECNAV" \
  "$EXECLIVE" \
  "$EXECOCR" \
  "$APP" 2>/dev/null || true

echo "✅ Enterprise Rider Portal applied."
echo
echo "REQUIRED ENV:"
echo "  VITE_MAPBOX_ACCESS_TOKEN=pk.eyJ1IjoiYnJpdGl1bXZlbnR1cmVzIiwiYSI6ImNtbHVydDRwbTAwZjczZnMxbDgyODJxbHUifQ.HwgFGIQzepHOhImZLM4Knw"
echo
echo "Run:"
echo "  npm run dev"
echo
echo "Commit:"
echo "  git commit -m \"feat(execution): enterprise rider portal (qr+cod otp+map+ocr+xlsx)\""
#!/usr/bin/env bash
set -euo pipefail

# EN: SUPER_ADMIN-only stop edit/reorder + Drag&Drop reorder + Require POD (photo/signature/OTP) before DELIVERED at final stop
# MY: Stop edit/reorder ကို SUPER_ADMIN သာခွင့်ပြု + Drag&Drop reorder + Final stop မှာ POD (photo/signature/OTP) မဖြစ်မနေယူပြီးမှ DELIVERED

if [ ! -f "package.json" ]; then
  echo "❌ EN: Run this from repo root (package.json folder)."
  echo "❌ MY: package.json ရှိတဲ့ repo root မှ run လုပ်ပါ။"
  exit 1
fi

STAMP="$(date +%Y%m%d_%H%M%S)"
BK=".backup_mapbox_admin_dnd_pod_${STAMP}"
mkdir -p "$BK"

for f in \
  "package.json" \
  "src/services/shipmentTracking.ts" \
  "src/features/maps/MapboxNavigationWorkspace.tsx" \
  "scripts/sql/pod_storage_policies.sql" \
; do
  if [ -f "$f" ]; then
    mkdir -p "$BK/$(dirname "$f")"
    cp -f "$f" "$BK/$f.bak"
  fi
done

echo "✅ EN: Backups saved to $BK"
echo "✅ MY: Backup ဖိုင်များကို $BK ထဲသိမ်းပြီးပါပြီ"

# EN: Install deps for drag & drop
# MY: Drag & drop အတွက် deps install လုပ်မည်
npm i @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities

mkdir -p "src/services" "src/features/maps" "scripts/sql"

cat > "src/services/shipmentTracking.ts" <<'EOF'
import { supabase } from "@/lib/supabase";

/**
 * EN: Parse AWB/way_id from a stop label.
 * MY: Stop label ထဲက AWB/way_id ကို ထုတ်ယူမည်။
 */
export function parseWayIdFromLabel(label: string | null | undefined): string | null {
  const s = String(label ?? "").trim();
  if (!s) return null;

  const m = s.match(/(?:AWB|WAYBILL|WAY_ID|WAYID|WAY|WB)\s*[:#-]?\s*([A-Z0-9-]{6,})/i);
  if (m?.[1]) return m[1].toUpperCase();

  const m2 = s.match(/^\s*([A-Z0-9-]{6,})\b/);
  if (m2?.[1]) return m2[1].toUpperCase();

  return null;
}

export async function findShipmentIdByWayId(wayId: string): Promise<string | null> {
  if (!wayId) return null;
  try {
    const res = await supabase.from("shipments").select("id").eq("way_id", wayId).limit(1).maybeSingle();
    if (res.error) return null;
    return (res.data as any)?.id ?? null;
  } catch {
    return null;
  }
}

export async function insertShipmentTrackingEvent(input: {
  wayId?: string | null;
  shipmentId?: string | null;
  eventType: string;
  stopIndex?: number | null;
  stopLabel?: string | null;
  lat?: number | null;
  lng?: number | null;
  accuracy?: number | null;
  actorId?: string | null;
  actorRole?: string | null;
  metadata?: any;
}) {
  const payload = {
    shipment_id: input.shipmentId ?? null,
    way_id: input.wayId ?? null,
    event_type: input.eventType,
    stop_index: input.stopIndex ?? null,
    stop_label: input.stopLabel ?? null,
    lat: input.lat ?? null,
    lng: input.lng ?? null,
    accuracy: input.accuracy ?? null,
    actor_id: input.actorId ?? null,
    actor_role: input.actorRole ?? null,
    metadata: input.metadata ?? {},
  };

  return supabase.from("shipment_tracking").insert(payload);
}

/**
 * EN: Best-effort delivery update by way_id. Tries common columns.
 * MY: way_id နဲ့ delivery update (schema မတူနိုင်လို့ columns အမျိုးမျိုး စမ်းမည်)
 */
export async function markShipmentDeliveredByWayId(input: { wayId: string; deliveredAtIso?: string }) {
  const wayId = input.wayId;
  if (!wayId) return { data: null, error: { message: "Missing wayId" } };

  const ts = input.deliveredAtIso || new Date().toISOString();

  const payloads = [
    { status: "DELIVERED", actual_delivery_time: ts, delivered_at: ts, updated_at: ts },
    { status: "DELIVERED", actual_delivery_time: ts },
    { actual_delivery_time: ts },
    { delivered_at: ts },
    { status: "DELIVERED" },
  ];

  let lastErr: any = null;

  for (const p of payloads) {
    try {
      const res = await supabase.from("shipments").update(p as any).eq("way_id", wayId);
      if (!res.error) return res;
      lastErr = res.error;
    } catch (e: any) {
      lastErr = e;
    }
  }

  return { data: null, error: lastErr };
}

export async function upsertCourierLocationWithMetrics(input: {
  userId: string;
  lat: number;
  lng: number;
  heading?: number | null;
  speed?: number | null;
  accuracy?: number | null;
  updatedAt: string;
  remainingMeters?: number | null;
  etaSeconds?: number | null;
  nextStopIndex?: number | null;
  nextStopEta?: string | null;
  routeId?: string | null;
}) {
  const payload = {
    user_id: input.userId,
    lat: input.lat,
    lng: input.lng,
    heading: input.heading ?? null,
    speed: input.speed ?? null,
    accuracy: input.accuracy ?? null,
    remaining_meters: input.remainingMeters ?? null,
    eta_seconds: input.etaSeconds ?? null,
    next_stop_index: input.nextStopIndex ?? null,
    next_stop_eta: input.nextStopEta ?? null,
    route_id: input.routeId ?? null,
    updated_at: input.updatedAt,
  };

  return supabase.from("courier_locations").upsert(payload, { onConflict: "user_id" });
}

/**
 * EN: Upload photo/signature to Supabase Storage bucket "pod".
 * MY: Photo/signature ကို Supabase Storage bucket "pod" သို့ upload လုပ်မည်။
 *
 * NOTE: Create bucket "pod" in Supabase Storage UI.
 */
export async function uploadPodArtifact(input: {
  shipmentId: string | null;
  wayId: string | null;
  kind: "photo" | "signature";
  file: File;
}): Promise<{ bucket: string; path: string; url: string | null }> {
  const bucket = "pod";
  const base = input.shipmentId || input.wayId || "unknown";
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const ext = (input.file.name.split(".").pop() || (input.kind === "signature" ? "png" : "jpg")).toLowerCase();
  const path = `${base}/${ts}_${input.kind}.${ext}`;

  const res = await supabase.storage.from(bucket).upload(path, input.file, {
    upsert: true,
    contentType: input.file.type || (input.kind === "signature" ? "image/png" : "image/jpeg"),
  });
  if (res.error) throw res.error;

  const pub = supabase.storage.from(bucket).getPublicUrl(path);
  const url = pub?.data?.publicUrl || null;
  return { bucket, path, url };
}

/**
 * EN: OTP verification helper:
 * - If shipment has OTP on record -> verify equality.
 * - If OTP fields not found -> "unknown".
 *
 * MY: OTP စစ်ဆေးမှု:
 * - shipment ထဲမှာ OTP ရှိရင် ကိုက်ညီမှု စစ်မည်
 * - field မရှိရင် unknown
 */
export async function verifyShipmentOtpBestEffort(input: {
  shipmentId: string | null;
  wayId: string | null;
  otp: string;
}): Promise<{ mode: "verified" | "mismatch" | "unknown" }> {
  const otp = String(input.otp || "").trim();
  if (!otp) return { mode: "mismatch" };

  try {
    let row: any = null;

    if (input.shipmentId) {
      const res = await supabase.from("shipments").select("delivery_otp,otp,pod_otp,way_id").eq("id", input.shipmentId).maybeSingle();
      if (!res.error) row = res.data;
    } else if (input.wayId) {
      const res = await supabase.from("shipments").select("delivery_otp,otp,pod_otp,way_id").eq("way_id", input.wayId).limit(1).maybeSingle();
      if (!res.error) row = res.data;
    }

    const dbOtp = String(row?.delivery_otp || row?.pod_otp || row?.otp || "").trim();
    if (!dbOtp) return { mode: "unknown" };
    return dbOtp === otp ? { mode: "verified" } : { mode: "mismatch" };
  } catch {
    return { mode: "unknown" };
  }
}
EOF

cat > "scripts/sql/pod_storage_policies.sql" <<'EOF'
-- EN: Storage policies for bucket "pod" (optional)
-- MY: Bucket "pod" အတွက် Storage policy (optional)

do $$
begin
  if not exists (select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='pod_objects_insert') then
    create policy pod_objects_insert
      on storage.objects for insert to authenticated
      with check (bucket_id = 'pod');
  end if;

  if not exists (select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='pod_objects_select') then
    create policy pod_objects_select
      on storage.objects for select to authenticated
      using (bucket_id = 'pod');
  end if;
end $$;
EOF

cat > ".workspace.tpl.tsx" <<'TPL'
// @ts-nocheck
import React from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertCircle,
  Camera,
  Check,
  ClipboardCheck,
  GripVertical,
  LocateFixed,
  MapPin,
  Pause,
  Pencil,
  Play,
  Route,
  Send,
  ShieldCheck,
  Signature,
  X,
} from "lucide-react";
import { geocodeForward, fetchDirections, fetchOptimizedTripV1, isMapboxConfigured, type LngLat } from "@/services/mapbox";
import { useLiveCourierLocations } from "@/hooks/useLiveCourierLocations";
import { useAuth } from "@/contexts/AuthContext";
import { haversineMeters, metersToKm, secondsToMin, fmtTime } from "@/lib/geo";
import {
  findShipmentIdByWayId,
  insertShipmentTrackingEvent,
  markShipmentDeliveredByWayId,
  parseWayIdFromLabel,
  uploadPodArtifact,
  upsertCourierLocationWithMetrics,
  verifyShipmentOtpBestEffort,
} from "@/services/shipmentTracking";
__MARK_DELIVERED_IMPORT__

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "";

type Stop = { id: string; label: string; coord: LngLat; wayId: string | null; lockWayId: boolean };
type PodMethod = "photo" | "signature" | "otp";

const SUPER_ADMIN_ONLY = new Set(["SUPER_ADMIN"]);

function uid() {
  return Math.random().toString(16).slice(2) + "-" + Date.now().toString(16);
}

function normalizeWayId(v: string | null | undefined): string | null {
  const s = String(v ?? "").trim();
  return s ? s.toUpperCase() : null;
}

function SortableRow(props: { id: string; disabled?: boolean; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: props.id,
    disabled: props.disabled,
  });

  const style: React.CSSProperties = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.7 : 1 };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div className="flex items-start gap-2">
        <button
          type="button"
          className="mt-2 p-1 rounded-md border border-white/10 bg-black/30 hover:bg-white/5 disabled:opacity-50"
          disabled={props.disabled}
          {...listeners}
          aria-label="Drag"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="flex-1">{props.children}</div>
      </div>
    </div>
  );
}

function SignaturePad(props: { onChange: (pngBlob: Blob | null) => void }) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const drawingRef = React.useRef(false);
  const lastRef = React.useRef<{ x: number; y: number } | null>(null);

  function getPos(e: PointerEvent) {
    const c = canvasRef.current!;
    const rect = c.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function redraw() {
    const c = canvasRef.current;
    if (!c) return;
    c.toBlob((b) => props.onChange(b), "image/png");
  }

  React.useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;

    const ctx = c.getContext("2d")!;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#e2e8f0";

    const onDown = (e: PointerEvent) => {
      drawingRef.current = true;
      c.setPointerCapture(e.pointerId);
      lastRef.current = getPos(e);
    };

    const onMove = (e: PointerEvent) => {
      if (!drawingRef.current) return;
      const p = getPos(e);
      const last = lastRef.current;
      if (!last) {
        lastRef.current = p;
        return;
      }
      ctx.beginPath();
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      lastRef.current = p;
    };

    const onUp = () => {
      drawingRef.current = false;
      lastRef.current = null;
      redraw();
    };

    c.addEventListener("pointerdown", onDown);
    c.addEventListener("pointermove", onMove);
    c.addEventListener("pointerup", onUp);
    c.addEventListener("pointercancel", onUp);

    return () => {
      c.removeEventListener("pointerdown", onDown);
      c.removeEventListener("pointermove", onMove);
      c.removeEventListener("pointerup", onUp);
      c.removeEventListener("pointercancel", onUp);
    };
  }, []);

  function clear() {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    ctx.clearRect(0, 0, c.width, c.height);
    props.onChange(null);
  }

  return (
    <div className="space-y-2">
      <div className="rounded-xl border border-white/10 bg-black/30 overflow-hidden">
        <canvas ref={canvasRef} width={640} height={280} className="w-full h-40" />
      </div>
      <Button type="button" variant="outline" className="border-white/10 bg-black/30 hover:bg-white/5" onClick={clear}>
        <X className="h-4 w-4 mr-2" /> Clear
      </Button>
    </div>
  );
}

export default function MapboxNavigationWorkspace(props: { mode: "rider" | "ops"; title?: string; shareLocation?: boolean }) {
  const { user, role } = useAuth();
  const roleNorm = (role ?? "").trim().toUpperCase();
  const isSuperAdmin = SUPER_ADMIN_ONLY.has(roleNorm);

  const [query, setQuery] = React.useState("");
  const [suggestions, setSuggestions] = React.useState<any[]>([]);
  const [stops, setStops] = React.useState<Stop[]>([]);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [editingId, setEditingId] = React.useState<string | null>(null);

  const [routeInfo, setRouteInfo] = React.useState<{ distance: number; duration: number; steps: string[] } | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const [navOn, setNavOn] = React.useState(false);
  const [geoErr, setGeoErr] = React.useState<string | null>(null);
  const [radiusM, setRadiusM] = React.useState(80);

  const [current, setCurrent] = React.useState<{ lat: number; lng: number; accuracy: number | null; heading: number | null; speed: number | null } | null>(null);
  const [navIndex, setNavIndex] = React.useState(0);

  const [metrics, setMetrics] = React.useState<{ remainingMeters: number | null; etaSeconds: number | null; destEta: string | null; nextStopEta: string | null; perStop: Array<{ idx: number; label: string; etaIso: string | null; etaSec: number | null; distM: number | null }>; }>({
    remainingMeters: null, etaSeconds: null, destEta: null, nextStopEta: null, perStop: []
  });

  // POD
  const [podOpen, setPodOpen] = React.useState(false);
  const [podMethod, setPodMethod] = React.useState<PodMethod>("photo");
  const [podErr, setPodErr] = React.useState<string | null>(null);
  const [podBusy, setPodBusy] = React.useState(false);
  const [podPhoto, setPodPhoto] = React.useState<File | null>(null);
  const [podSigBlob, setPodSigBlob] = React.useState<Blob | null>(null);
  const [podOtp, setPodOtp] = React.useState("");
  const [pending, setPending] = React.useState<null | {
    stopIndex: number; stopId: string; stopLabel: string; wayId: string | null; shipmentId: string | null;
    lat: number; lng: number; accuracy: number | null; distM: number;
  }>(null);

  const mapRef = React.useRef<mapboxgl.Map | null>(null);
  const mapContainer = React.useRef<HTMLDivElement | null>(null);

  const markersRef = React.useRef<Record<string, mapboxgl.Marker>>({});
  const meMarkerRef = React.useRef<mapboxgl.Marker | null>(null);
  const watchIdRef = React.useRef<number | null>(null);
  const lastApiRef = React.useRef<{ t: number; lat: number; lng: number; idx: number; hash: string } | null>(null);
  const arrivedRef = React.useRef<Record<string, boolean>>({});
  const deliveredRef = React.useRef(false);

  // ops live markers optional
  const { rows: couriers, error: liveErr } = useLiveCourierLocations({ enabled: props.mode === "ops" });

  React.useEffect(() => {
    if (!mapContainer.current) return;

    mapRef.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/navigation-night-v1",
      center: [96.1561, 16.8661],
      zoom: 12,
    });

    mapRef.current.addControl(new mapboxgl.NavigationControl(), "bottom-right");
    return () => mapRef.current?.remove();
  }, []);

  function renderRouteLine(geojson: any) {
    if (!mapRef.current) return;
    const map = mapRef.current;
    const src = map.getSource("route") as mapboxgl.GeoJSONSource;
    if (src) src.setData(geojson);
    else {
      map.addSource("route", { type: "geojson", data: geojson });
      map.addLayer({
        id: "route-line",
        type: "line",
        source: "route",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: { "line-color": "#10b981", "line-width": 4, "line-opacity": 0.85 },
      });
    }
  }

  function renderStops() {
    if (!mapRef.current) return;
    const map = mapRef.current;

    for (const mk of Object.values(markersRef.current)) mk.remove();
    markersRef.current = {};

    for (const s of stops) {
      const el = document.createElement("div");
      el.style.width = "18px";
      el.style.height = "18px";
      el.style.borderRadius = "999px";
      el.style.background = s.id === selectedId ? "#f59e0b" : "#60a5fa";
      el.style.boxShadow = "0 0 0 3px rgba(96,165,250,0.22)";
      const mk = new mapboxgl.Marker({ element: el }).setLngLat(s.coord as any).addTo(map);
      markersRef.current[s.id] = mk;
    }
  }

  React.useEffect(() => { renderStops(); }, [stops, selectedId]);

  function locateMe() {
    if (!mapRef.current) return;
    if (!("geolocation" in navigator)) { setGeoErr("Geolocation not supported."); return; }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoErr(null);
        const lng = pos.coords.longitude;
        const lat = pos.coords.latitude;
        mapRef.current!.flyTo({ center: [lng, lat], zoom: 15, speed: 1.2 });

        if (!meMarkerRef.current) {
          const el = document.createElement("div");
          el.style.width = "12px";
          el.style.height = "12px";
          el.style.borderRadius = "999px";
          el.style.background = "rgba(244,63,94,0.95)";
          el.style.boxShadow = "0 0 0 4px rgba(244,63,94,0.22)";
          meMarkerRef.current = new mapboxgl.Marker({ element: el }).setLngLat([lng, lat]).addTo(mapRef.current!);
        } else meMarkerRef.current.setLngLat([lng, lat]);
      },
      (e) => setGeoErr(e.message),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  function updateStop(id: string, patch: Partial<Stop>) {
    setStops((prev) => prev.map((s) => {
      if (s.id !== id) return s;
      const next = { ...s, ...patch };
      if (!next.lockWayId) next.wayId = normalizeWayId(parseWayIdFromLabel(next.label));
      return next;
    }));
  }

  async function search() {
    try {
      setError(null);
      if (!query.trim()) return;
      const res = await geocodeForward(query.trim(), { limit: 5 });
      setSuggestions(res.features || []);
    } catch (e: any) { setError(e?.message || String(e)); }
  }

  function addStopFromFeature(f: any) {
    const coord: LngLat = [f.center[0], f.center[1]];
    const label = f.place_name || f.text || "Stop";
    const wayId = normalizeWayId(parseWayIdFromLabel(label));
    const stop: Stop = { id: uid(), label, coord, wayId, lockWayId: false };
    setStops((s) => [...s, stop]);
    setSuggestions([]);
    setQuery("");
  }

  function fitRoute(coords: LngLat[]) {
    if (!mapRef.current || coords.length < 2) return;
    const bounds = coords.reduce((b, c) => b.extend(c as any), new mapboxgl.LngLatBounds(coords[0] as any, coords[0] as any));
    mapRef.current.fitBounds(bounds, { padding: 60, duration: 600 });
  }

  async function planRouteDirections() {
    try {
      setError(null); setRouteInfo(null);
      if (stops.length < 2) { setError("Add at least 2 stops."); return; }
      const coords = stops.map((s) => s.coord);
      const route = await fetchDirections({ coordinates: coords, steps: true, overview: "full" });
      renderRouteLine({ type: "Feature", geometry: route.geometry });
      fitRoute(route.geometry.coordinates);
      const steps = (route.legs || []).flatMap((l) => (l.steps || []).map((s) => s.maneuver?.instruction).filter(Boolean));
      setRouteInfo({ distance: route.distance, duration: route.duration, steps });
    } catch (e: any) { setError(e?.message || String(e)); }
  }

  async function planRouteOptimize() {
    try {
      setError(null); setRouteInfo(null);
      if (!isSuperAdmin) { setError("Only SUPER_ADMIN can optimize/reorder stops."); return; }
      if (stops.length < 2) { setError("Add at least 2 stops."); return; }
      const coords = stops.map((s) => s.coord);
      const { trip, waypoints } = await fetchOptimizedTripV1({ coordinates: coords, roundtrip: false, source: "first", destination: "last", steps: true });
      renderRouteLine({ type: "Feature", geometry: trip.geometry });
      fitRoute(trip.geometry.coordinates);

      const key = (c: LngLat) => `${c[0].toFixed(6)},${c[1].toFixed(6)}`;
      const wMap = new Map<string, number>();
      (waypoints || []).forEach((w) => wMap.set(key(w.location), w.waypoint_index));
      setStops((prev) => [...prev].sort((a, b) => (wMap.get(key(a.coord)) ?? 0) - (wMap.get(key(b.coord)) ?? 0)));

      const steps = (trip.legs || []).flatMap((l) => (l.steps || []).map((s) => s.maneuver?.instruction).filter(Boolean));
      setRouteInfo({ distance: trip.distance, duration: trip.duration, steps });
    } catch (e: any) { setError(e?.message || String(e)); }
  }

  function routeHash() {
    return stops.map((s) => `${s.coord[0].toFixed(5)},${s.coord[1].toFixed(5)}`).join("|") + `#${navIndex}`;
  }

  async function recalcFromCurrent(pos: { lat: number; lng: number; accuracy: number | null; heading: number | null; speed: number | null }, force?: boolean) {
    if (props.mode !== "rider" || !navOn || !stops.length) return;

    const remainingStops = stops.slice(navIndex);
    if (!remainingStops.length) return;

    const coords: LngLat[] = [[pos.lng, pos.lat], ...remainingStops.map((s) => s.coord)];
    if (coords.length < 2) return;

    const now = Date.now();
    const last = lastApiRef.current;
    const h = routeHash();

    if (!force && last) {
      const dt = now - last.t;
      const dist = haversineMeters(last.lat, last.lng, pos.lat, pos.lng);
      if (dt < 15000 && dist < 40 && last.idx === navIndex && last.hash === h) return;
    }
    lastApiRef.current = { t: now, lat: pos.lat, lng: pos.lng, idx: navIndex, hash: h };

    const route = await fetchDirections({ coordinates: coords, steps: false, overview: "full" });
    renderRouteLine({ type: "Feature", geometry: route.geometry });

    const perStop: any[] = [];
    let cumDur = 0; let cumDist = 0;

    (route.legs || []).forEach((leg: any, i: number) => {
      cumDur += leg.duration ?? 0;
      cumDist += leg.distance ?? 0;
      const stop = remainingStops[i];
      if (stop) perStop.push({ idx: navIndex + i, label: stop.label, etaSec: cumDur, etaIso: new Date(Date.now() + cumDur * 1000).toISOString(), distM: cumDist });
    });

    const destEtaIso = route.duration ? new Date(Date.now() + route.duration * 1000).toISOString() : null;
    const nextStop = perStop[0] || null;

    setMetrics({ remainingMeters: route.distance ?? null, etaSeconds: route.duration ?? null, destEta: destEtaIso, nextStopEta: nextStop?.etaIso ?? null, perStop });

    if (props.shareLocation && user?.id) {
      await upsertCourierLocationWithMetrics({
        userId: user.id,
        lat: pos.lat, lng: pos.lng,
        heading: pos.heading ?? null, speed: pos.speed ?? null, accuracy: pos.accuracy ?? null,
        updatedAt: new Date().toISOString(),
        remainingMeters: route.distance ?? null,
        etaSeconds: route.duration ?? null,
        nextStopIndex: navIndex,
        nextStopEta: nextStop?.etaIso ?? null,
        routeId: h,
      });
    }
  }

  function openPod(payload: any) {
    setPending(payload);
    setPodErr(null);
    setPodMethod("photo");
    setPodPhoto(null);
    setPodSigBlob(null);
    setPodOtp("");
    setPodOpen(true);
  }

  async function doDeliverAfterPod(meta: any) {
    if (!pending) return;
    const { wayId, shipmentId } = pending;

    let ok = false;
    let lastErr: any = null;

__CALL_MARK_DELIVERED__

    if (!ok && wayId) {
      const upd = await markShipmentDeliveredByWayId({ wayId });
      ok = !upd?.error;
      if (!ok) lastErr = upd?.error;
    }

    if (!ok) {
      await insertShipmentTrackingEvent({
        wayId, shipmentId,
        eventType: "DELIVERED_UPDATE_FAILED",
        stopIndex: pending.stopIndex,
        stopLabel: pending.stopLabel,
        lat: pending.lat, lng: pending.lng,
        accuracy: pending.accuracy ?? null,
        actorId: user?.id ?? null,
        actorRole: roleNorm || null,
        metadata: { error: lastErr?.message || String(lastErr), ...meta },
      });
      throw new Error(lastErr?.message || "Delivery update failed.");
    }

    await insertShipmentTrackingEvent({
      wayId, shipmentId,
      eventType: "DELIVERED_UPDATED",
      stopIndex: pending.stopIndex,
      stopLabel: pending.stopLabel,
      lat: pending.lat, lng: pending.lng,
      accuracy: pending.accuracy ?? null,
      actorId: user?.id ?? null,
      actorRole: roleNorm || null,
      metadata: { ok: true, ...meta },
    });
  }

  async function submitPod() {
    if (!pending) return;
    setPodErr(null);

    try {
      setPodBusy(true);

      const wayId = pending.wayId;
      const shipmentId = pending.shipmentId;

      if (podMethod === "photo" && !podPhoto) throw new Error("Photo is required.");
      if (podMethod === "signature" && !podSigBlob) throw new Error("Signature is required.");
      if (podMethod === "otp" && !podOtp.trim()) throw new Error("OTP is required.");

      let otpVerified: boolean | null = null;
      if (podMethod === "otp") {
        const vr = await verifyShipmentOtpBestEffort({ shipmentId, wayId, otp: podOtp.trim() });
        if (vr.mode === "verified") otpVerified = true;
        else if (vr.mode === "mismatch") throw new Error("OTP mismatch.");
        else otpVerified = null;
      }

      let upload: null | { bucket: string; path: string; url: string | null } = null;
      if (podMethod === "photo") {
        upload = await uploadPodArtifact({ shipmentId, wayId, kind: "photo", file: podPhoto! });
      } else if (podMethod === "signature") {
        upload = await uploadPodArtifact({ shipmentId, wayId, kind: "signature", file: new File([podSigBlob!], "signature.png", { type: "image/png" }) });
      }

      const meta = {
        pod: {
          method: podMethod,
          bucket: upload?.bucket ?? null,
          path: upload?.path ?? null,
          url: upload?.url ?? null,
          otp_verified: otpVerified,
          otp_last4: podMethod === "otp" ? podOtp.trim().slice(-4) : null,
        },
        geofence: { radius_m: radiusM, distance_m: pending.distM },
      };

      await insertShipmentTrackingEvent({
        wayId, shipmentId,
        eventType: "POD_CAPTURED",
        stopIndex: pending.stopIndex,
        stopLabel: pending.stopLabel,
        lat: pending.lat, lng: pending.lng,
        accuracy: pending.accuracy ?? null,
        actorId: user?.id ?? null,
        actorRole: roleNorm || null,
        metadata: meta,
      });

      await insertShipmentTrackingEvent({
        wayId, shipmentId,
        eventType: "DELIVERED_GEOFENCE",
        stopIndex: pending.stopIndex,
        stopLabel: pending.stopLabel,
        lat: pending.lat, lng: pending.lng,
        accuracy: pending.accuracy ?? null,
        actorId: user?.id ?? null,
        actorRole: roleNorm || null,
        metadata: meta,
      });

      await doDeliverAfterPod(meta);

      deliveredRef.current = true;
      setPodOpen(false);
      setPending(null);

      stopNav();
      setNavIndex(stops.length);
    } catch (e: any) {
      setPodErr(e?.message || String(e));
    } finally {
      setPodBusy(false);
    }
  }

  async function onGeofence(pos: any) {
    const stop = stops[navIndex];
    if (!stop) return;

    const dist = haversineMeters(pos.lat, pos.lng, stop.coord[1], stop.coord[0]);
    if (dist > radiusM) return;

    const key = `${stop.id}`;
    if (arrivedRef.current[key]) return;
    arrivedRef.current[key] = true;

    const isFinal = navIndex >= stops.length - 1;
    const wayId = normalizeWayId(stop.wayId) || normalizeWayId(parseWayIdFromLabel(stop.label));
    const shipmentId = wayId ? await findShipmentIdByWayId(wayId) : null;

    if (isFinal) {
      if (deliveredRef.current) return;
      openPod({ stopIndex: navIndex, stopId: stop.id, stopLabel: stop.label, wayId, shipmentId, lat: pos.lat, lng: pos.lng, accuracy: pos.accuracy ?? null, distM: dist });
      return;
    }

    await insertShipmentTrackingEvent({
      wayId, shipmentId,
      eventType: "ARRIVED_STOP",
      stopIndex: navIndex,
      stopLabel: stop.label,
      lat: pos.lat, lng: pos.lng,
      accuracy: pos.accuracy ?? null,
      actorId: user?.id ?? null,
      actorRole: roleNorm || null,
      metadata: { geofence: { radius_m: radiusM, distance_m: dist } },
    });

    setNavIndex((i) => Math.min(i + 1, stops.length));
  }

  function startNav() {
    if (props.mode !== "rider") return;
    if (!("geolocation" in navigator)) { setGeoErr("Geolocation not supported."); return; }

    setGeoErr(null);
    setNavOn(true);

    watchIdRef.current = navigator.geolocation.watchPosition(
      async (pos) => {
        const p = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy ?? null,
          heading: pos.coords.heading ?? null,
          speed: pos.coords.speed ?? null,
        };
        setCurrent(p);

        if (mapRef.current) {
          if (!meMarkerRef.current) {
            const el = document.createElement("div");
            el.style.width = "12px"; el.style.height = "12px"; el.style.borderRadius = "999px";
            el.style.background = "rgba(244,63,94,0.95)";
            el.style.boxShadow = "0 0 0 4px rgba(244,63,94,0.22)";
            meMarkerRef.current = new mapboxgl.Marker({ element: el }).setLngLat([p.lng, p.lat]).addTo(mapRef.current);
          } else meMarkerRef.current.setLngLat([p.lng, p.lat]);
        }

        await onGeofence(p);
        await recalcFromCurrent(p);
      },
      (e) => setGeoErr(e.message),
      { enableHighAccuracy: true, maximumAge: 1500, timeout: 10000 }
    );
  }

  function stopNav() {
    setNavOn(false);
    if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    watchIdRef.current = null;
  }

  React.useEffect(() => {
    if (!navOn) return;
    if (current) void recalcFromCurrent(current, true);
  }, [navIndex, navOn, stops.length]);

  function onDragEnd(e: any) {
    if (!isSuperAdmin) return;
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setStops((items) => {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      return arrayMove(items, oldIndex, newIndex);
    });
  }

  const finalStop = stops.length ? stops[stops.length - 1] : null;
  const finalDistance = current && finalStop ? haversineMeters(current.lat, current.lng, finalStop.coord[1], finalStop.coord[0]) : null;

  return (
    <div className="grid gap-4 md:grid-cols-[430px_1fr]">
      {podOpen ? (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0B101B]/95 backdrop-blur-xl shadow-2xl overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-emerald-600 to-teal-400" />
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-black">Proof of Delivery (POD)</div>
                  <div className="text-xs opacity-70">Final stop — capture POD before DELIVERED.</div>
                </div>
                <Button variant="outline" className="border-white/10 bg-black/30 hover:bg-white/5" onClick={() => { setPodOpen(false); setPending(null); }} disabled={podBusy}>
                  <X className="h-4 w-4 mr-2" /> Close
                </Button>
              </div>

              {podErr ? (
                <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-rose-200 text-xs flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5" />
                  <div>{podErr}</div>
                </div>
              ) : null}

              <div className="grid grid-cols-3 gap-2">
                <Button type="button" variant={podMethod === "photo" ? "default" : "outline"} className={podMethod === "photo" ? "bg-emerald-600 hover:bg-emerald-500" : "border-white/10 bg-black/30 hover:bg-white/5"} onClick={() => setPodMethod("photo")} disabled={podBusy}>
                  <Camera className="h-4 w-4 mr-2" /> Photo
                </Button>
                <Button type="button" variant={podMethod === "signature" ? "default" : "outline"} className={podMethod === "signature" ? "bg-emerald-600 hover:bg-emerald-500" : "border-white/10 bg-black/30 hover:bg-white/5"} onClick={() => setPodMethod("signature")} disabled={podBusy}>
                  <Signature className="h-4 w-4 mr-2" /> Sign
                </Button>
                <Button type="button" variant={podMethod === "otp" ? "default" : "outline"} className={podMethod === "otp" ? "bg-emerald-600 hover:bg-emerald-500" : "border-white/10 bg-black/30 hover:bg-white/5"} onClick={() => setPodMethod("otp")} disabled={podBusy}>
                  <ClipboardCheck className="h-4 w-4 mr-2" /> OTP
                </Button>
              </div>

              {podMethod === "photo" ? (
                <div className="space-y-2">
                  <div className="text-xs opacity-80">Take a delivery photo</div>
                  <input type="file" accept="image/*" capture="environment" className="block w-full text-xs" onChange={(e) => setPodPhoto(e.target.files?.[0] ?? null)} disabled={podBusy} />
                  {podPhoto ? <div className="text-[11px] opacity-70">{podPhoto.name}</div> : null}
                </div>
              ) : null}

              {podMethod === "signature" ? (
                <div className="space-y-2">
                  <div className="text-xs opacity-80">Recipient signature</div>
                  <SignaturePad onChange={setPodSigBlob} />
                </div>
              ) : null}

              {podMethod === "otp" ? (
                <div className="space-y-2">
                  <div className="text-xs opacity-80">Enter OTP provided by recipient</div>
                  <Input className="bg-black/30 border-white/10 text-white" value={podOtp} onChange={(e) => setPodOtp(e.target.value)} placeholder="OTP" disabled={podBusy} />
                  <div className="text-[11px] opacity-60">If shipment has OTP on record, mismatch will be rejected.</div>
                </div>
              ) : null}

              <div className="flex gap-2 justify-end">
                <Button variant="outline" className="border-white/10 bg-black/30 hover:bg-white/5" onClick={() => { setPodOpen(false); setPending(null); }} disabled={podBusy}>
                  Cancel
                </Button>
                <Button className="bg-emerald-600 hover:bg-emerald-500" onClick={() => void submitPod()} disabled={podBusy}>
                  {podBusy ? "Saving…" : "Submit POD & Deliver"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="space-y-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">{props.title || (props.mode === "ops" ? "Live Tracking" : "Navigation & Route Planning")}</div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={locateMe}>
                <LocateFixed className="h-4 w-4 mr-2" /> Locate
              </Button>
              {props.mode === "rider" ? (
                <Button size="sm" className={navOn ? "bg-rose-600 hover:bg-rose-500" : "bg-emerald-600 hover:bg-emerald-500"} onClick={navOn ? stopNav : startNav}>
                  {navOn ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                  {navOn ? "Stop" : "Start"}
                </Button>
              ) : null}
            </div>
          </div>

          {!isMapboxConfigured() ? (
            <div className="text-xs text-rose-300 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5" />
              <div>Missing <span className="font-mono">VITE_MAPBOX_ACCESS_TOKEN</span>.</div>
            </div>
          ) : null}

          {geoErr ? (
            <div className="text-xs text-amber-300 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5" />
              <div>{geoErr}</div>
            </div>
          ) : null}

          {error ? (
            <div className="text-xs text-amber-300 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5" />
              <div>{error}</div>
            </div>
          ) : null}

          {liveErr ? (
            <div className="text-xs text-amber-300 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5" />
              <div>{liveErr}</div>
            </div>
          ) : null}

          {props.mode === "rider" ? (
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <div className="text-xs opacity-80">Geofence radius (m)</div>
                <Input className="h-8 w-24 bg-black/30 border-white/10 text-white" value={radiusM} onChange={(e) => setRadiusM(Number(e.target.value || 80))} />
              </div>

              <Card className="bg-black/20 border-white/10">
                <CardContent className="p-3 space-y-1">
                  <div className="text-xs">
                    Remaining: <span className="font-semibold">{metersToKm(metrics.remainingMeters)}</span> {" • "}
                    ETA: <span className="font-semibold">{secondsToMin(metrics.etaSeconds)}</span>
                  </div>
                  <div className="text-xs opacity-80">Destination: {fmtTime(metrics.destEta)} {" • "} Next stop: {fmtTime(metrics.nextStopEta)}</div>
                  <div className="text-[11px] opacity-70">Stop index: {navIndex} / {stops.length}</div>
                </CardContent>
              </Card>

              {finalStop && current ? (
                <Button
                  variant="outline"
                  className="border-white/10 bg-black/30 hover:bg-white/5"
                  disabled={(finalDistance ?? 1e9) > radiusM || deliveredRef.current}
                  onClick={async () => {
                    const wayId = normalizeWayId(finalStop.wayId) || normalizeWayId(parseWayIdFromLabel(finalStop.label));
                    const shipmentId = wayId ? await findShipmentIdByWayId(wayId) : null;
                    openPod({ stopIndex: stops.length - 1, stopId: finalStop.id, stopLabel: finalStop.label, wayId, shipmentId, lat: current.lat, lng: current.lng, accuracy: current.accuracy ?? null, distM: finalDistance ?? 0 });
                  }}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  POD & Deliver <span className="ml-2 text-[11px] opacity-70">{finalDistance !== null ? `(${Math.round(finalDistance)}m)` : ""}</span>
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <div className="text-sm font-semibold">Stops</div>
            <Badge variant="outline">{stops.length}</Badge>
            {!isSuperAdmin ? <Badge variant="outline" className="ml-auto">Edit: SUPER_ADMIN only</Badge> : null}
          </div>

          <div className="flex gap-2">
            <Input className="bg-black/30 border-white/10 text-white" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search place / address" />
            <Button onClick={search} variant="outline"><Send className="h-4 w-4 mr-2" /> Search</Button>
          </div>

          {suggestions.length ? (
            <div className="space-y-1">
              {suggestions.map((f) => (
                <button key={f.id} type="button" onClick={() => addStopFromFeature(f)} className="w-full text-left text-xs rounded-xl border border-white/10 bg-black/20 hover:bg-white/5 px-3 py-2">
                  {f.place_name}
                </button>
              ))}
            </div>
          ) : null}

          {isSuperAdmin ? (
            <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
              <SortableContext items={stops.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {stops.map((s, i) => {
                    const isEditing = editingId === s.id;
                    const eta = metrics.perStop.find((p) => p.idx === i)?.etaIso;
                    const distM = metrics.perStop.find((p) => p.idx === i)?.distM;
                    const parsed = normalizeWayId(parseWayIdFromLabel(s.label));
                    const effective = normalizeWayId(s.wayId) || parsed;

                    return (
                      <SortableRow key={s.id} id={s.id} disabled={navOn}>
                        <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                          <div className="flex items-center justify-between gap-2">
                            <button type="button" className="text-left flex-1" onClick={() => setSelectedId(s.id)}>
                              <div className="text-xs font-semibold truncate">{i}. {s.label}</div>
                              <div className="text-[11px] opacity-70">WayID: <span className="font-mono">{effective || "-"}</span> {" • "} ETA: {fmtTime(eta)} {" • "} Dist: {metersToKm(distM)}</div>
                            </button>
                            <div className="flex items-center gap-2">
                              {props.mode === "rider" && i === navIndex ? <Badge variant="outline">NEXT</Badge> : null}
                              <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => setEditingId(isEditing ? null : s.id)} disabled={navOn}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {isEditing ? (
                            <div className="mt-3 space-y-2">
                              <div className="text-[11px] opacity-70">Label</div>
                              <Input className="h-9 bg-black/30 border-white/10 text-white" value={s.label} onChange={(e) => updateStop(s.id, { label: e.target.value })} disabled={navOn} />

                              <div className="flex items-center justify-between gap-2">
                                <div className="text-[11px] opacity-70">WayID (AWB)</div>
                                <div className="flex items-center gap-2">
                                  <div className="text-[11px] opacity-70">Lock</div>
                                  <Switch checked={Boolean(s.lockWayId)} onCheckedChange={(v) => updateStop(s.id, { lockWayId: Boolean(v) })} disabled={navOn} />
                                </div>
                              </div>

                              <Input className="h-9 bg-black/30 border-white/10 text-white font-mono" value={s.wayId || ""} placeholder={parsed || "AUTO from label"} onChange={(e) => updateStop(s.id, { wayId: normalizeWayId(e.target.value), lockWayId: true })} disabled={navOn} />

                              <div className="text-[11px] opacity-70">Parsed from label: <span className="font-mono">{parsed || "-"}</span></div>

                              <div className="flex gap-2">
                                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500" onClick={() => setEditingId(null)} disabled={navOn}><Check className="h-4 w-4 mr-2" /> Done</Button>
                                <Button size="sm" variant="outline" onClick={() => updateStop(s.id, { lockWayId: false, wayId: null })} disabled={navOn}><X className="h-4 w-4 mr-2" /> Reset</Button>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </SortableRow>
                    );
                  })}
                </div>
              </SortableContext>
            </DndContext>
          ) : (
            <div className="space-y-2">
              {stops.map((s, i) => {
                const eta = metrics.perStop.find((p) => p.idx === i)?.etaIso;
                const distM = metrics.perStop.find((p) => p.idx === i)?.distM;
                const parsed = normalizeWayId(parseWayIdFromLabel(s.label));
                const effective = normalizeWayId(s.wayId) || parsed;

                return (
                  <div key={s.id} className="rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                    <div className="text-xs font-semibold truncate">{i}. {s.label}</div>
                    <div className="text-[11px] opacity-70">WayID: <span className="font-mono">{effective || "-"}</span> {" • "} ETA: {fmtTime(eta)} {" • "} Dist: {metersToKm(distM)}</div>
                    {props.mode === "rider" && i === navIndex ? <Badge variant="outline" className="mt-2">NEXT</Badge> : null}
                  </div>
                );
              })}
            </div>
          )}

          <Separator className="bg-white/10" />

          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={() => { setStops([]); setEditingId(null); }}>Clear</Button>
            <Button variant="outline" onClick={planRouteDirections}><Route className="h-4 w-4 mr-2" /> Directions</Button>
            <Button variant="outline" onClick={planRouteOptimize} disabled={!isSuperAdmin || navOn}><ShieldCheck className="h-4 w-4 mr-2" /> Optimize</Button>
          </div>

          {routeInfo ? <div className="text-xs opacity-80">Route: {metersToKm(routeInfo.distance)} • {secondsToMin(routeInfo.duration)}</div> : null}
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/5">
        <div ref={mapContainer} className="h-[72vh] w-full" />
      </div>
    </div>
  );
}
TPL

# EN: If markDelivered service exists, use it; otherwise keep way_id fallback.
# MY: markDelivered service ဖိုင်ရှိရင် သုံးမည်၊ မရှိရင် way_id fallback သာသုံးမည်။
MARK_IMPORT=""
MARK_CALL="  // markDelivered() service not found; using way_id fallback only.\n"

if [ -f "src/services/shipments.ts" ] || [ -f "src/services/shipments/index.ts" ] || [ -f "src/services/shipments.tsx" ]; then
  MARK_IMPORT='import { markDelivered } from "@/services/shipments";'
  MARK_CALL='  if (shipmentId) {\n    try {\n      await markDelivered(shipmentId);\n      ok = true;\n    } catch (e) {\n      lastErr = e;\n    }\n  }\n'
fi

node <<'NODE'
const fs = require("fs");

const tpl = fs.readFileSync(".workspace.tpl.tsx", "utf8");
const markImport = process.env.MARK_IMPORT || "";
const markCall = process.env.MARK_CALL || "";

const out = tpl
  .replace("__MARK_DELIVERED_IMPORT__", markImport)
  .replace("__CALL_MARK_DELIVERED__", markCall);

fs.mkdirSync("src/features/maps", { recursive: true });
fs.writeFileSync("src/features/maps/MapboxNavigationWorkspace.tsx", out);
fs.unlinkSync(".workspace.tpl.tsx");
console.log("✅ Wrote src/features/maps/MapboxNavigationWorkspace.tsx");
NODE

echo ""
echo "✅ EN: Installed SUPER_ADMIN-only stop edit/reorder + DnD + POD gating."
echo "✅ MY: SUPER_ADMIN-only stop edit/reorder + DnD + POD gating ထည့်သွင်းပြီးပါပြီ။"
echo ""
echo "NEXT:"
echo "  1) Supabase Storage UI: create bucket named: pod"
echo "  2) Supabase SQL Editor: run scripts/sql/pod_storage_policies.sql (optional if bucket is public)"
echo "  3) Ensure env: VITE_MAPBOX_ACCESS_TOKEN"
echo "  4) npm run build"

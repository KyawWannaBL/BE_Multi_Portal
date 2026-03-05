#!/usr/bin/env bash
set -euo pipefail

# EN: Add DELIVERED geofence status update + AWB parsing (label -> way_id)
# MY: Final stop ရောက်လျှင် DELIVERED status update + AWB parsing (label -> way_id) ထည့်သွင်းမည်

if [ ! -f "package.json" ]; then
  echo "❌ EN: Run this from repo root (package.json folder)."
  echo "❌ MY: package.json ရှိတဲ့ repo root မှ run လုပ်ပါ။"
  exit 1
fi

STAMP="$(date +%Y%m%d_%H%M%S)"
BK=".backup_mapbox_delivered_awb_${STAMP}"
mkdir -p "$BK"

# EN/MY: Backup files we overwrite
for f in \
  "src/services/shipmentTracking.ts" \
  "src/features/maps/MapboxNavigationWorkspace.tsx" \
; do
  if [ -f "$f" ]; then
    mkdir -p "$BK/$(dirname "$f")"
    cp -f "$f" "$BK/$f.bak"
  fi
done

echo "✅ EN: Backups saved to $BK"
echo "✅ MY: Backup ဖိုင်များကို $BK ထဲသိမ်းပြီးပါပြီ"

mkdir -p "src/services" "src/features/maps"

cat > "src/services/shipmentTracking.ts" <<'EOF'
import { supabase } from "@/lib/supabase";

/**
 * EN: Extract AWB / way_id from a stop label.
 * MY: Stop label ထဲက AWB / way_id ကိုထုတ်ယူရန်
 *
 * Accepts patterns like:
 * - "AWB: 12345678 - Customer"
 * - "WAY_ID#ABC-9999"
 * - "12345678 ..."
 */
export function parseWayIdFromLabel(label: string | null | undefined): string | null {
  const s = String(label ?? "").trim();
  if (!s) return null;

  const m = s.match(
    /(?:AWB|WAYBILL|WAY_ID|WAYID|WAY|WB)\s*[:#-]?\s*([A-Z0-9-]{6,})/i
  );
  if (m?.[1]) return m[1].toUpperCase();

  // If the label starts with a plausible AWB token
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
 * EN: Best-effort delivery update. Different schemas exist, so we try common fields.
 * MY: Schema မတူနိုင်လို့ fields အမျိုးမျိုးနဲ့ best-effort update လုပ်သည်။
 */
export async function markShipmentDeliveredByWayId(input: {
  wayId: string;
  deliveredAtIso?: string;
  extra?: any;
}) {
  const wayId = input.wayId;
  if (!wayId) return { data: null, error: { message: "Missing wayId" } };

  const ts = input.deliveredAtIso || new Date().toISOString();

  // Try common payloads; retry with minimal if schema differs.
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
EOF

cat > "src/features/maps/MapboxNavigationWorkspace.tsx" <<'EOF'
// @ts-nocheck
import React from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, LocateFixed, MapPin, Pause, Play, Route, Send, ShieldCheck } from "lucide-react";
import { geocodeForward, fetchDirections, fetchOptimizedTripV1, isMapboxConfigured, type LngLat } from "@/services/mapbox";
import { useLiveCourierLocations } from "@/hooks/useLiveCourierLocations";
import { useAuth } from "@/contexts/AuthContext";
import { haversineMeters, metersToKm, secondsToMin, fmtTime } from "@/lib/geo";
import {
  findShipmentIdByWayId,
  insertShipmentTrackingEvent,
  markShipmentDeliveredByWayId,
  parseWayIdFromLabel,
  upsertCourierLocationWithMetrics,
} from "@/services/shipmentTracking";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "";

type Stop = {
  id: string;
  label: string;
  coord: LngLat;
};

function uid() {
  return Math.random().toString(16).slice(2) + "-" + Date.now().toString(16);
}

export default function MapboxNavigationWorkspace(props: {
  mode: "rider" | "ops";
  title?: string;
  shareLocation?: boolean;
}) {
  const { user, role } = useAuth();

  const [query, setQuery] = React.useState("");
  const [suggestions, setSuggestions] = React.useState<any[]>([]);
  const [stops, setStops] = React.useState<Stop[]>([]);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  const [routeInfo, setRouteInfo] = React.useState<{ distance: number; duration: number; steps: string[] } | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const [navOn, setNavOn] = React.useState(false);
  const [geoErr, setGeoErr] = React.useState<string | null>(null);
  const [radiusM, setRadiusM] = React.useState(80);

  const [current, setCurrent] = React.useState<{ lat: number; lng: number; accuracy: number | null; heading: number | null; speed: number | null } | null>(null);
  const [navIndex, setNavIndex] = React.useState(0);

  const [metrics, setMetrics] = React.useState<{
    remainingMeters: number | null;
    etaSeconds: number | null;
    destEta: string | null;
    nextStopEta: string | null;
    perStop: Array<{ idx: number; label: string; etaIso: string | null; etaSec: number | null; distM: number | null }>;
  }>({ remainingMeters: null, etaSeconds: null, destEta: null, nextStopEta: null, perStop: [] });

  const mapRef = React.useRef<mapboxgl.Map | null>(null);
  const mapContainer = React.useRef<HTMLDivElement | null>(null);

  const markersRef = React.useRef<Record<string, mapboxgl.Marker>>({});
  const driverMarkersRef = React.useRef<Record<string, mapboxgl.Marker>>({});
  const meMarkerRef = React.useRef<mapboxgl.Marker | null>(null);

  const watchIdRef = React.useRef<number | null>(null);
  const lastApiRef = React.useRef<{ t: number; lat: number; lng: number; idx: number; hash: string } | null>(null);
  const arrivedRef = React.useRef<Record<string, boolean>>({});

  const { rows: couriers, error: liveErr } = useLiveCourierLocations({ enabled: props.mode === "ops" });

  React.useEffect(() => {
    if (!mapContainer.current) return;

    mapRef.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/navigation-night-v1",
      center: [96.1561, 16.8661], // Yangon default
      zoom: 12,
    });

    mapRef.current.addControl(new mapboxgl.NavigationControl(), "bottom-right");

    return () => mapRef.current?.remove();
  }, []);

  React.useEffect(() => {
    if (props.mode !== "ops") return;
    if (!mapRef.current) return;

    const map = mapRef.current;
    const seen = new Set<string>();

    for (const c of couriers || []) {
      seen.add(c.user_id);
      const lngLat: [number, number] = [c.lng, c.lat];

      let mk = driverMarkersRef.current[c.user_id];
      if (!mk) {
        const el = document.createElement("div");
        el.style.width = "14px";
        el.style.height = "14px";
        el.style.borderRadius = "999px";
        el.style.background = "rgba(16,185,129,0.95)";
        el.style.boxShadow = "0 0 0 3px rgba(16,185,129,0.22)";
        mk = new mapboxgl.Marker({ element: el }).setLngLat(lngLat).addTo(map);
        driverMarkersRef.current[c.user_id] = mk;
      } else {
        mk.setLngLat(lngLat);
      }
    }

    for (const id of Object.keys(driverMarkersRef.current)) {
      if (!seen.has(id)) {
        driverMarkersRef.current[id].remove();
        delete driverMarkersRef.current[id];
      }
    }
  }, [props.mode, couriers]);

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

  React.useEffect(() => {
    renderStops();
  }, [stops, selectedId]);

  function locateMe() {
    if (!mapRef.current) return;
    if (!("geolocation" in navigator)) {
      setGeoErr("Geolocation not supported.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoErr(null);
        const lng = pos.coords.longitude;
        const lat = pos.coords.latitude;
        const map = mapRef.current!;
        map.flyTo({ center: [lng, lat], zoom: 15, speed: 1.2 });

        if (!meMarkerRef.current) {
          const el = document.createElement("div");
          el.style.width = "12px";
          el.style.height = "12px";
          el.style.borderRadius = "999px";
          el.style.background = "rgba(244,63,94,0.95)";
          el.style.boxShadow = "0 0 0 4px rgba(244,63,94,0.22)";
          meMarkerRef.current = new mapboxgl.Marker({ element: el }).setLngLat([lng, lat]).addTo(map);
        } else {
          meMarkerRef.current.setLngLat([lng, lat]);
        }
      },
      (e) => setGeoErr(e.message),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  async function search() {
    try {
      setError(null);
      if (!query.trim()) return;
      const res = await geocodeForward(query.trim(), { limit: 5 });
      setSuggestions(res.features || []);
    } catch (e: any) {
      setError(e?.message || String(e));
    }
  }

  function addStopFromFeature(f: any) {
    const coord: LngLat = [f.center[0], f.center[1]];
    const label = f.place_name || f.text || "Stop";

    const stop: Stop = { id: uid(), label, coord };
    setStops((s) => [...s, stop]);
    setSuggestions([]);
    setQuery("");
  }

  function fitRoute(coords: LngLat[]) {
    if (!mapRef.current || coords.length < 2) return;
    const map = mapRef.current;
    const bounds = coords.reduce(
      (b, c) => b.extend(c as any),
      new mapboxgl.LngLatBounds(coords[0] as any, coords[0] as any)
    );
    map.fitBounds(bounds, { padding: 60, duration: 600 });
  }

  async function planRouteOptimize() {
    try {
      setError(null);
      setRouteInfo(null);
      if (stops.length < 2) {
        setError("Add at least 2 stops to optimize.");
        return;
      }
      const coords = stops.map((s) => s.coord);

      const { trip } = await fetchOptimizedTripV1({
        coordinates: coords,
        roundtrip: false,
        source: "first",
        destination: "last",
        steps: true,
      });

      renderRouteLine({ type: "Feature", geometry: trip.geometry });
      fitRoute(trip.geometry.coordinates);

      const steps = (trip.legs || []).flatMap((l) => (l.steps || []).map((s) => s.maneuver?.instruction).filter(Boolean));
      setRouteInfo({ distance: trip.distance, duration: trip.duration, steps });
    } catch (e: any) {
      setError(e?.message || String(e));
    }
  }

  async function planRouteDirections() {
    try {
      setError(null);
      setRouteInfo(null);
      if (stops.length < 2) {
        setError("Add at least 2 stops.");
        return;
      }
      const coords = stops.map((s) => s.coord);

      const route = await fetchDirections({ coordinates: coords, steps: true, overview: "full" });
      renderRouteLine({ type: "Feature", geometry: route.geometry });
      fitRoute(route.geometry.coordinates);

      const steps = (route.legs || []).flatMap((l) => (l.steps || []).map((s) => s.maneuver?.instruction).filter(Boolean));
      setRouteInfo({ distance: route.distance, duration: route.duration, steps });
    } catch (e: any) {
      setError(e?.message || String(e));
    }
  }

  function routeHash() {
    return stops.map((s) => `${s.coord[0].toFixed(5)},${s.coord[1].toFixed(5)}`).join("|") + `#${navIndex}`;
  }

  async function recalcFromCurrent(pos: { lat: number; lng: number; accuracy: number | null; heading: number | null; speed: number | null }, force?: boolean) {
    if (props.mode !== "rider") return;
    if (!navOn) return;
    if (!stops.length) return;

    const remainingStops = stops.slice(navIndex);
    if (remainingStops.length === 0) return;

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
    let cumDur = 0;
    let cumDist = 0;

    (route.legs || []).forEach((leg: any, i: number) => {
      cumDur += leg.duration ?? 0;
      cumDist += leg.distance ?? 0;

      const stop = remainingStops[i];
      if (stop) {
        perStop.push({
          idx: navIndex + i,
          label: stop.label,
          etaSec: cumDur,
          etaIso: new Date(Date.now() + cumDur * 1000).toISOString(),
          distM: cumDist,
        });
      }
    });

    const destEtaIso = route.duration ? new Date(Date.now() + route.duration * 1000).toISOString() : null;
    const nextStop = perStop[0] || null;

    setMetrics({
      remainingMeters: route.distance ?? null,
      etaSeconds: route.duration ?? null,
      destEta: destEtaIso,
      nextStopEta: nextStop?.etaIso ?? null,
      perStop,
    });

    if (props.shareLocation && user?.id) {
      await upsertCourierLocationWithMetrics({
        userId: user.id,
        lat: pos.lat,
        lng: pos.lng,
        heading: pos.heading ?? null,
        speed: pos.speed ?? null,
        accuracy: pos.accuracy ?? null,
        updatedAt: new Date().toISOString(),
        remainingMeters: route.distance ?? null,
        etaSeconds: route.duration ?? null,
        nextStopIndex: navIndex,
        nextStopEta: nextStop?.etaIso ?? null,
        routeId: h,
      });
    }
  }

  async function onGeofenceArrive(pos: any) {
    const stop = stops[navIndex];
    if (!stop) return;

    const dist = haversineMeters(pos.lat, pos.lng, stop.coord[1], stop.coord[0]);
    if (dist > radiusM) return;

    const key = `${stop.id}`;
    if (arrivedRef.current[key]) return;
    arrivedRef.current[key] = true;

    const isFinal = navIndex >= stops.length - 1;

    const wayId = parseWayIdFromLabel(stop.label);
    const shipmentId = wayId ? await findShipmentIdByWayId(wayId) : null;

    // Always log arrival event
    await insertShipmentTrackingEvent({
      wayId,
      shipmentId,
      eventType: isFinal ? "DELIVERED_GEOFENCE" : "ARRIVED_STOP",
      stopIndex: navIndex,
      stopLabel: stop.label,
      lat: pos.lat,
      lng: pos.lng,
      accuracy: pos.accuracy ?? null,
      actorId: user?.id ?? null,
      actorRole: (role ?? "").trim().toUpperCase() || null,
      metadata: { radius_m: radiusM, distance_m: dist, final_stop: isFinal },
    });

    // Final stop -> also update shipment status table (best effort)
    if (isFinal && wayId) {
      const upd = await markShipmentDeliveredByWayId({ wayId });

      if (upd?.error) {
        await insertShipmentTrackingEvent({
          wayId,
          shipmentId,
          eventType: "DELIVERED_UPDATE_FAILED",
          stopIndex: navIndex,
          stopLabel: stop.label,
          lat: pos.lat,
          lng: pos.lng,
          accuracy: pos.accuracy ?? null,
          actorId: user?.id ?? null,
          actorRole: (role ?? "").trim().toUpperCase() || null,
          metadata: { error: upd.error?.message || String(upd.error) },
        });
      }
    }

    if (isFinal) {
      stopNav();
      setNavIndex(stops.length);
      return;
    }

    setNavIndex((i) => Math.min(i + 1, stops.length));
  }

  function startNav() {
    if (props.mode !== "rider") return;
    if (!("geolocation" in navigator)) {
      setGeoErr("Geolocation not supported.");
      return;
    }

    setGeoErr(null);
    setNavOn(true);

    const map = mapRef.current;

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

        if (map) {
          if (!meMarkerRef.current) {
            const el = document.createElement("div");
            el.style.width = "12px";
            el.style.height = "12px";
            el.style.borderRadius = "999px";
            el.style.background = "rgba(244,63,94,0.95)";
            el.style.boxShadow = "0 0 0 4px rgba(244,63,94,0.22)";
            meMarkerRef.current = new mapboxgl.Marker({ element: el }).setLngLat([p.lng, p.lat]).addTo(map);
          } else {
            meMarkerRef.current.setLngLat([p.lng, p.lat]);
          }
        }

        await onGeofenceArrive(p);
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

  return (
    <div className="grid gap-4 md:grid-cols-[380px_1fr]">
      <div className="space-y-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">
              {props.title || (props.mode === "ops" ? "Live Tracking" : "Navigation & Route Planning")}
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={locateMe}>
                <LocateFixed className="h-4 w-4 mr-2" />
                Locate
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
                    Remaining: <span className="font-semibold">{metersToKm(metrics.remainingMeters)}</span>
                    {" • "}
                    ETA: <span className="font-semibold">{secondsToMin(metrics.etaSeconds)}</span>
                  </div>
                  <div className="text-xs opacity-80">
                    Destination: {fmtTime(metrics.destEta)}
                    {" • "}
                    Next stop: {fmtTime(metrics.nextStopEta)}
                  </div>
                  <div className="text-[11px] opacity-70">Stop index: {navIndex} / {stops.length}</div>
                </CardContent>
              </Card>
            </div>
          ) : null}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <div className="text-sm font-semibold">Stops</div>
            <Badge variant="outline">{stops.length}</Badge>
          </div>

          <div className="flex gap-2">
            <Input className="bg-black/30 border-white/10 text-white" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search place / address" />
            <Button onClick={search} variant="outline">
              <Send className="h-4 w-4 mr-2" /> Search
            </Button>
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

          <div className="space-y-2">
            {stops.map((s, i) => {
              const awb = parseWayIdFromLabel(s.label);
              const eta = metrics.perStop.find((p) => p.idx === i)?.etaIso;
              const distM = metrics.perStop.find((p) => p.idx === i)?.distM;

              return (
                <button key={s.id} type="button" onClick={() => setSelectedId(s.id)} className="w-full text-left rounded-xl border border-white/10 bg-black/20 hover:bg-white/5 px-3 py-2">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-semibold truncate">{i}. {s.label}</div>
                    {props.mode === "rider" && i === navIndex ? <Badge variant="outline">NEXT</Badge> : null}
                  </div>
                  <div className="text-[11px] opacity-70">
                    AWB: <span className="font-mono">{awb || "-"}</span>
                    {" • "} ETA: {fmtTime(eta)} {" • "} Dist: {metersToKm(distM)}
                  </div>
                </button>
              );
            })}
          </div>

          <Separator className="bg-white/10" />

          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={() => setStops([])}>Clear</Button>
            <Button variant="outline" onClick={planRouteDirections}><Route className="h-4 w-4 mr-2" /> Directions</Button>
            <Button variant="outline" onClick={planRouteOptimize}><ShieldCheck className="h-4 w-4 mr-2" /> Optimize</Button>
          </div>

          {routeInfo ? (
            <div className="text-xs opacity-80">
              Route: {metersToKm(routeInfo.distance)} • {secondsToMin(routeInfo.duration)}
            </div>
          ) : null}
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/5">
        <div ref={mapContainer} className="h-[72vh] w-full" />
      </div>
    </div>
  );
}
EOF

echo ""
echo "✅ EN: Installed AWB parsing + DELIVERED geofence update."
echo "✅ MY: AWB parsing + DELIVERED geofence update ထည့်သွင်းပြီးပါပြီ။"
echo ""
echo "Notes:"
echo "  - Final stop geofence inserts shipment_tracking event: DELIVERED_GEOFENCE"
echo "  - Best-effort updates shipments table by way_id (tries common columns)"
echo ""
echo "Next:"
echo "  npm run build"

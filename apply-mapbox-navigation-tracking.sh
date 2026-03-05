#!/usr/bin/env bash
set -euo pipefail

# EN: Mapbox integration installer (navigation + real-time tracking + route planning)
# MY: Mapbox integration ထည့်သွင်းမည် (navigation + real-time tracking + route planning)

if [ ! -f "package.json" ]; then
  echo "❌ EN: Run this from repo root (package.json folder)."
  echo "❌ MY: package.json ရှိတဲ့ repo root မှ run လုပ်ပါ။"
  exit 1
fi

STAMP="$(date +%Y%m%d_%H%M%S)"
BK=".backup_mapbox_${STAMP}"
mkdir -p "$BK"

# EN/MY: Backup files that we touch
for f in \
  "package.json" \
  ".env.example" \
  "src/App.tsx" \
  "src/pages/portals/ExecutionPortal.tsx" \
  "src/pages/portals/OperationsPortal.tsx" \
; do
  if [ -f "$f" ]; then
    mkdir -p "$BK/$(dirname "$f")"
    cp -f "$f" "$BK/$f.bak"
  fi
done

echo "✅ EN: Backups saved to $BK"
echo "✅ MY: Backup ဖိုင်များကို $BK ထဲသိမ်းပြီးပါပြီ"

# EN: Install deps
# MY: Dependency တွေ install လုပ်မယ်
npm i mapbox-gl @mapbox/mapbox-gl-directions
npm i -D @types/mapbox-gl

mkdir -p "src/services" "src/hooks" "src/features/maps" "src/pages/portals" "scripts/sql"

cat > "src/services/mapbox.ts" <<'EOF'
/**
 * Mapbox integration helpers (Directions, Optimization, Geocoding).
 *
 * EN: Uses public Mapbox token (VITE_MAPBOX_ACCESS_TOKEN) from Vite env.
 * MY: Vite env ထဲက public Mapbox token (VITE_MAPBOX_ACCESS_TOKEN) ကိုအသုံးပြုသည်။
 *
 * Docs:
 * - Directions API: https://docs.mapbox.com/api/navigation/directions/
 * - Optimization API v1: https://docs.mapbox.com/api/navigation/optimization-v1/
 */

export type LngLat = [number, number];

const TOKEN = (import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "") as string;
const BASE = "https://api.mapbox.com";

export function isMapboxConfigured(): boolean {
  return Boolean(TOKEN);
}

function assertToken() {
  if (!TOKEN) throw new Error("Mapbox token missing: VITE_MAPBOX_ACCESS_TOKEN");
}

function qs(params: Record<string, string | number | boolean | undefined>) {
  const u = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined) continue;
    u.set(k, String(v));
  }
  u.set("access_token", TOKEN);
  return u.toString();
}

function coordString(coords: LngLat[]) {
  return coords.map(([lng, lat]) => `${lng},${lat}`).join(";");
}

export type DirectionsProfile = "driving" | "driving-traffic" | "walking" | "cycling";

export type DirectionsStep = {
  distance: number;
  duration: number;
  name: string;
  maneuver: { instruction: string; type: string; modifier?: string };
};

export type DirectionsLeg = {
  distance: number;
  duration: number;
  steps?: DirectionsStep[];
};

export type DirectionsRoute = {
  distance: number;
  duration: number;
  geometry: { type: "LineString"; coordinates: LngLat[] };
  legs?: DirectionsLeg[];
};

export async function fetchDirections(input: {
  profile?: DirectionsProfile;
  coordinates: LngLat[];
  steps?: boolean;
  overview?: "simplified" | "full";
  geometries?: "geojson";
  language?: string;
}): Promise<DirectionsRoute> {
  assertToken();

  const profile = input.profile ?? "driving";
  const coordinates = input.coordinates;
  if (coordinates.length < 2) throw new Error("Directions requires at least 2 coordinates.");
  if (coordinates.length > 25) throw new Error("Directions supports up to 25 coordinates.");

  const url = `${BASE}/directions/v5/mapbox/${profile}/${coordString(coordinates)}?${qs({
    alternatives: false,
    geometries: input.geometries ?? "geojson",
    overview: input.overview ?? "full",
    steps: input.steps ?? true,
    language: input.language,
  })}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Directions API failed: ${res.status}`);
  const json = await res.json();

  const route = json?.routes?.[0];
  if (!route) throw new Error("No route returned from Directions API.");

  return {
    distance: route.distance,
    duration: route.duration,
    geometry: route.geometry,
    legs: route.legs,
  };
}

export type OptimizedWaypoint = {
  waypoint_index: number;
  trips_index: number;
  location: LngLat;
  name: string;
};

export type OptimizedTrip = {
  distance: number;
  duration: number;
  geometry: { type: "LineString"; coordinates: LngLat[] };
  legs?: DirectionsLeg[];
};

export async function fetchOptimizedTripV1(input: {
  profile?: DirectionsProfile;
  coordinates: LngLat[];
  roundtrip?: boolean;
  source?: "first" | "any";
  destination?: "last" | "any";
  steps?: boolean;
}): Promise<{ trip: OptimizedTrip; waypoints: OptimizedWaypoint[] }> {
  assertToken();

  const profile = input.profile ?? "driving";
  const coordinates = input.coordinates;
  if (coordinates.length < 2) throw new Error("Optimization requires at least 2 coordinates.");
  if (coordinates.length > 12) throw new Error("Optimization v1 supports up to 12 coordinates.");

  const url = `${BASE}/optimized-trips/v1/mapbox/${profile}/${coordString(coordinates)}?${qs({
    roundtrip: input.roundtrip ?? false,
    source: input.source ?? "first",
    destination: input.destination ?? "last",
    geometries: "geojson",
    overview: "full",
    steps: input.steps ?? false,
  })}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Optimization API failed: ${res.status}`);
  const json = await res.json();

  const trip = json?.trips?.[0];
  if (!trip) throw new Error("No trip returned from Optimization API.");

  return {
    trip: {
      distance: trip.distance,
      duration: trip.duration,
      geometry: trip.geometry,
      legs: trip.legs,
    },
    waypoints: (json?.waypoints || []).map((w: any) => ({
      waypoint_index: w.waypoint_index,
      trips_index: w.trips_index,
      location: w.location,
      name: w.name,
    })),
  };
}

export type GeocodeFeature = {
  id: string;
  place_name: string;
  center: LngLat;
};

export async function geocodeForward(query: string, input?: { limit?: number; proximity?: LngLat }): Promise<GeocodeFeature[]> {
  assertToken();
  const q = query.trim();
  if (!q) return [];

  const url = `${BASE}/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json?${qs({
    limit: input?.limit ?? 5,
    autocomplete: true,
    proximity: input?.proximity ? `${input.proximity[0]},${input.proximity[1]}` : undefined,
  })}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Geocoding API failed: ${res.status}`);
  const json = await res.json();

  const features = (json?.features || []) as any[];
  return features.map((f) => ({
    id: f.id,
    place_name: f.place_name,
    center: f.center,
  }));
}
EOF

cat > "src/hooks/useCourierLocationPublisher.ts" <<'EOF'
import * as React from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { isMissingRelation } from "@/services/supabaseHelpers";

/**
 * EN: Publish the current courier location to Supabase in real-time.
 * MY: Courier ရဲ့ လက်ရှိတည်နေရာကို Supabase သို့ real-time အဖြစ် ပို့မည်။
 *
 * Requires a table:
 *   public.courier_locations(user_id uuid PK, lat float8, lng float8, heading float4, speed float4, accuracy float4, updated_at timestamptz)
 */
export function useCourierLocationPublisher(input: { enabled: boolean; minIntervalMs?: number; minMoveMeters?: number }) {
  const { user } = useAuth();
  const enabled = input.enabled;
  const minIntervalMs = input.minIntervalMs ?? 3000;
  const minMoveMeters = input.minMoveMeters ?? 10;

  const [error, setError] = React.useState<string | null>(null);
  const [last, setLast] = React.useState<{ lat: number; lng: number; updatedAt: string } | null>(null);

  const lastSentRef = React.useRef<{ t: number; lat: number; lng: number } | null>(null);
  const watchIdRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    if (!enabled) return;

    if (!user?.id) {
      setError("Not authenticated.");
      return;
    }

    if (!("geolocation" in navigator)) {
      setError("Geolocation not supported.");
      return;
    }

    const onPos = async (pos: GeolocationPosition) => {
      try {
        const now = Date.now();
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        const lastSent = lastSentRef.current;
        if (lastSent) {
          const dt = now - lastSent.t;
          const dist = haversineMeters(lastSent.lat, lastSent.lng, lat, lng);
          if (dt < minIntervalMs && dist < minMoveMeters) return;
        }

        lastSentRef.current = { t: now, lat, lng };

        const payload = {
          user_id: user.id,
          lat,
          lng,
          heading: pos.coords.heading ?? null,
          speed: pos.coords.speed ?? null,
          accuracy: pos.coords.accuracy ?? null,
          updated_at: new Date().toISOString(),
        };

        const res = await supabase.from("courier_locations").upsert(payload, { onConflict: "user_id" });

        if (res.error) {
          if (isMissingRelation(res.error)) {
            setError("Missing table: courier_locations (apply SQL migration).");
          } else {
            setError(res.error.message);
          }
          return;
        }

        setError(null);
        setLast({ lat, lng, updatedAt: payload.updated_at });
      } catch (e: any) {
        setError(e?.message || String(e));
      }
    };

    const onErr = (err: GeolocationPositionError) => setError(err.message);

    const id = navigator.geolocation.watchPosition(onPos, onErr, {
      enableHighAccuracy: true,
      maximumAge: 1500,
      timeout: 15000,
    });

    watchIdRef.current = id;

    return () => {
      if (watchIdRef.current != null) navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    };
  }, [enabled, user?.id, minIntervalMs, minMoveMeters]);

  return { error, last };
}

function haversineMeters(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}
EOF

cat > "src/hooks/useLiveCourierLocations.ts" <<'EOF'
import * as React from "react";
import { supabase } from "@/lib/supabase";
import { isMissingRelation } from "@/services/supabaseHelpers";

export type CourierLocation = {
  user_id: string;
  lat: number;
  lng: number;
  heading: number | null;
  speed: number | null;
  accuracy: number | null;
  updated_at: string;
};

export function useLiveCourierLocations(input?: { enabled?: boolean }) {
  const enabled = input?.enabled ?? true;

  const [rows, setRows] = React.useState<CourierLocation[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!enabled) return;

    let alive = true;

    async function load() {
      const res = await supabase.from("courier_locations").select("*").order("updated_at", { ascending: false });
      if (!alive) return;

      if (res.error) {
        if (isMissingRelation(res.error)) setError("Missing table: courier_locations (apply SQL migration).");
        else setError(res.error.message);
        return;
      }

      setError(null);
      setRows((res.data || []) as any);
    }

    void load();

    const ch = supabase
      .channel("courier-locations")
      .on("postgres_changes", { event: "*", schema: "public", table: "courier_locations" }, () => load())
      .subscribe();

    return () => {
      alive = false;
      supabase.removeChannel(ch);
    };
  }, [enabled]);

  return { rows, error };
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
import { AlertCircle, LocateFixed, MapPin, Route, Send } from "lucide-react";
import { geocodeForward, fetchDirections, fetchOptimizedTripV1, isMapboxConfigured, type LngLat } from "@/services/mapbox";
import { useLiveCourierLocations } from "@/hooks/useLiveCourierLocations";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "";

type Stop = {
  id: string;
  label: string;
  coord: LngLat;
};

function fmtDist(meters: number) {
  if (!meters && meters !== 0) return "-";
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

function fmtDur(sec: number) {
  if (!sec && sec !== 0) return "-";
  const m = Math.round(sec / 60);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${h}h ${mm}m`;
}

export default function MapboxNavigationWorkspace(props: {
  mode: "rider" | "ops";
  title?: string;
}) {
  const [query, setQuery] = React.useState("");
  const [suggestions, setSuggestions] = React.useState<any[]>([]);
  const [stops, setStops] = React.useState<Stop[]>([]);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  const [routeInfo, setRouteInfo] = React.useState<{ distance: number; duration: number; steps: string[] } | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const mapRef = React.useRef<mapboxgl.Map | null>(null);
  const mapContainer = React.useRef<HTMLDivElement | null>(null);

  const markersRef = React.useRef<Record<string, mapboxgl.Marker>>({});
  const driverMarkersRef = React.useRef<Record<string, mapboxgl.Marker>>({});

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

    // update courier markers
    const map = mapRef.current;

    const seen = new Set<string>();
    for (const c of couriers || []) {
      seen.add(c.user_id);
      const key = c.user_id;
      const lngLat: [number, number] = [c.lng, c.lat];

      let mk = driverMarkersRef.current[key];
      if (!mk) {
        const el = document.createElement("div");
        el.style.width = "14px";
        el.style.height = "14px";
        el.style.borderRadius = "999px";
        el.style.background = "rgba(16,185,129,0.95)";
        el.style.boxShadow = "0 0 0 3px rgba(16,185,129,0.22)";
        mk = new mapboxgl.Marker({ element: el }).setLngLat(lngLat).addTo(map);
        driverMarkersRef.current[key] = mk;
      } else {
        mk.setLngLat(lngLat);
      }
    }

    // remove old markers
    for (const id of Object.keys(driverMarkersRef.current)) {
      if (!seen.has(id)) {
        driverMarkersRef.current[id].remove();
        delete driverMarkersRef.current[id];
      }
    }
  }, [props.mode, couriers]);

  React.useEffect(() => {
    const active = query.trim();
    if (!active) {
      setSuggestions([]);
      return;
    }
    let alive = true;
    const t = setTimeout(async () => {
      try {
        if (!isMapboxConfigured()) {
          if (alive) setError("Missing Mapbox token: VITE_MAPBOX_ACCESS_TOKEN");
          return;
        }
        const res = await geocodeForward(active, { limit: 5 });
        if (alive) {
          setSuggestions(res);
          setError(null);
        }
      } catch (e: any) {
        if (alive) setError(e?.message || String(e));
      }
    }, 250);

    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [query]);

  function addStop(s: any) {
    const coord = s.center as LngLat;
    const id = `${Date.now()}_${Math.random().toString(16).slice(2)}`;
    const stop: Stop = { id, label: s.place_name, coord };
    setStops((p) => [...p, stop]);
    setSelectedId(id);
    setQuery("");
    setSuggestions([]);
  }

  function removeStop(id: string) {
    setStops((p) => p.filter((x) => x.id !== id));
    if (selectedId === id) setSelectedId(null);
  }

  function moveStop(id: string, dir: -1 | 1) {
    setStops((prev) => {
      const idx = prev.findIndex((x) => x.id === id);
      if (idx < 0) return prev;
      const next = idx + dir;
      if (next < 0 || next >= prev.length) return prev;
      const copy = [...prev];
      const [it] = copy.splice(idx, 1);
      copy.splice(next, 0, it);
      return copy;
    });
  }

  function ensureStopMarkers() {
    if (!mapRef.current) return;
    const map = mapRef.current;

    const seen = new Set<string>();
    for (const s of stops) {
      seen.add(s.id);
      let mk = markersRef.current[s.id];
      if (!mk) {
        const el = document.createElement("div");
        el.style.width = "10px";
        el.style.height = "10px";
        el.style.borderRadius = "999px";
        el.style.background = "rgba(212,175,55,0.95)";
        el.style.boxShadow = "0 0 0 3px rgba(212,175,55,0.25)";
        mk = new mapboxgl.Marker({ element: el }).setLngLat(s.coord).addTo(map);
        markersRef.current[s.id] = mk;
      } else {
        mk.setLngLat(s.coord);
      }
    }

    for (const id of Object.keys(markersRef.current)) {
      if (!seen.has(id)) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    }
  }

  React.useEffect(() => {
    ensureStopMarkers();
  }, [stops]);

  async function locateMe() {
    setError(null);
    if (!("geolocation" in navigator)) {
      setError("Geolocation not supported.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (!mapRef.current) return;
        mapRef.current.flyTo({ center: [pos.coords.longitude, pos.coords.latitude], zoom: 14 });
      },
      (err) => setError(err.message),
      { enableHighAccuracy: true, timeout: 15000 }
    );
  }

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

      const { trip, waypoints } = await fetchOptimizedTripV1({ coordinates: coords, roundtrip: false, source: "first", destination: "last", steps: true });
      renderRouteLine({ type: "Feature", geometry: trip.geometry });
      fitRoute(trip.geometry.coordinates);

      // Reorder stops by waypoint_index (optimized order)
      const ordered = [...stops].sort((a, b) => {
        const wa = waypoints.find((w) => w.location[0] === a.coord[0] && w.location[1] === a.coord[1]);
        const wb = waypoints.find((w) => w.location[0] === b.coord[0] && w.location[1] === b.coord[1]);
        return (wa?.waypoint_index ?? 0) - (wb?.waypoint_index ?? 0);
      });
      setStops(ordered);

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

  return (
    <div className="grid gap-4 md:grid-cols-[360px_1fr]">
      <div className="space-y-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">{props.title || (props.mode === "ops" ? "Live Tracking" : "Navigation & Route Planning")}</div>
            <Button size="sm" variant="outline" onClick={locateMe}>
              <LocateFixed className="h-4 w-4 mr-2" />
              Locate
            </Button>
          </div>

          {!isMapboxConfigured() ? (
            <div className="mt-3 text-xs text-rose-300 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5" />
              <div>
                Missing <span className="font-mono">VITE_MAPBOX_ACCESS_TOKEN</span>.
              </div>
            </div>
          ) : null}

          {liveErr ? (
            <div className="mt-3 text-xs text-amber-300 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5" />
              <div>{liveErr}</div>
            </div>
          ) : null}

          {error ? (
            <div className="mt-3 text-xs text-rose-300 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5" />
              <div>{error}</div>
            </div>
          ) : null}
        </div>

        {props.mode === "rider" ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
            <div className="text-sm font-semibold flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Waypoints
              <Badge variant="outline">{stops.length}</Badge>
            </div>

            <div className="space-y-2">
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search address / place…" />
              {suggestions.length ? (
                <div className="rounded-xl border border-white/10 bg-black/40 overflow-hidden">
                  {suggestions.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => addStop(s)}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-white/5"
                    >
                      {s.place_name}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="space-y-2">
              {stops.map((s, idx) => (
                <div key={s.id} className="rounded-xl border border-white/10 bg-black/30 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-xs font-semibold line-clamp-1">{idx + 1}. {s.label}</div>
                    <div className="flex gap-1">
                      <Button size="icon" variant="outline" onClick={() => moveStop(s.id, -1)} disabled={idx === 0}>
                        ↑
                      </Button>
                      <Button size="icon" variant="outline" onClick={() => moveStop(s.id, 1)} disabled={idx === stops.length - 1}>
                        ↓
                      </Button>
                      <Button size="icon" variant="outline" onClick={() => removeStop(s.id)}>✕</Button>
                    </div>
                  </div>
                  <div className="mt-1 text-[10px] text-slate-400 font-mono">{s.coord[1].toFixed(5)}, {s.coord[0].toFixed(5)}</div>
                </div>
              ))}
            </div>

            <Separator className="bg-white/10" />

            <div className="flex gap-2 flex-wrap">
              <Button className="bg-emerald-600 hover:bg-emerald-500" onClick={planRouteDirections}>
                <Route className="h-4 w-4 mr-2" />
                Directions
              </Button>
              <Button variant="outline" onClick={planRouteOptimize}>
                <Send className="h-4 w-4 mr-2" />
                Optimize
              </Button>
            </div>

            {routeInfo ? (
              <div className="mt-3 rounded-xl border border-white/10 bg-black/30 p-3">
                <div className="text-xs font-semibold">Route</div>
                <div className="mt-1 text-[11px] text-slate-300">
                  {fmtDist(routeInfo.distance)} • {fmtDur(routeInfo.duration)}
                </div>
                {routeInfo.steps?.length ? (
                  <ol className="mt-2 list-decimal list-inside text-[11px] text-slate-300 space-y-1 max-h-56 overflow-auto pr-2">
                    {routeInfo.steps.slice(0, 50).map((s, i) => <li key={i}>{s}</li>)}
                  </ol>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-sm font-semibold">Couriers</div>
            <div className="mt-2 space-y-2 max-h-[420px] overflow-auto pr-2">
              {(couriers || []).map((c) => (
                <div key={c.user_id} className="rounded-xl border border-white/10 bg-black/30 p-3">
                  <div className="text-xs font-semibold font-mono line-clamp-1">{c.user_id}</div>
                  <div className="text-[11px] text-slate-300 mt-1">
                    {c.lat.toFixed(5)}, {c.lng.toFixed(5)}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    {new Date(c.updated_at).toLocaleString()}
                  </div>
                </div>
              ))}
              {!couriers?.length ? <div className="text-xs text-slate-400">No live locations yet.</div> : null}
            </div>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden min-h-[520px]">
        <div ref={mapContainer} className="h-full w-full" />
      </div>
    </div>
  );
}
EOF

cat > "src/pages/portals/ExecutionNavigationPage.tsx" <<'EOF'
// @ts-nocheck
import React, { useMemo, useState } from "react";
import { PortalShell } from "@/components/layout/PortalShell";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Map } from "lucide-react";
import MapboxNavigationWorkspace from "@/features/maps/MapboxNavigationWorkspace";
import { useCourierLocationPublisher } from "@/hooks/useCourierLocationPublisher";

export default function ExecutionNavigationPage() {
  const { lang } = useLanguage();
  const t = useMemo(() => (lang === "en" ? "en" : "my"), [lang]);
  const { role } = useAuth();

  const normalizedRole = (role ?? "").trim().toUpperCase();
  const canShare = ["RIDER", "DRIVER", "HELPER"].includes(normalizedRole);

  const [share, setShare] = useState(true);
  const pub = useCourierLocationPublisher({ enabled: canShare && share });

  return (
    <PortalShell
      title={t === "en" ? "Navigation" : "လမ်းညွှန်"}
      links={[
        { to: "/portal/execution", label: t === "en" ? "Execution" : "Execution" },
        { to: "/portal/execution/manual", label: t === "en" ? "QR Manual" : "QR လမ်းညွှန်" },
      ]}
    >
      <div className="space-y-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Map className="h-5 w-5" />
              <div>
                <div className="text-sm font-semibold">{t === "en" ? "Live Navigation & Route Planning" : "Live လမ်းညွှန် + လမ်းကြောင်းစီမံ"}</div>
                <div className="text-xs opacity-70">{t === "en" ? "Mapbox Directions + Optimization + live GPS" : "Mapbox Directions + Optimization + live GPS"}</div>
              </div>
            </div>

            {canShare ? (
              <div className="flex items-center gap-3">
                <div className="text-xs opacity-80">{t === "en" ? "Share location" : "တည်နေရာ ပို့မည်"}</div>
                <Switch checked={share} onCheckedChange={setShare} />
                <Badge variant="outline">{share ? (t === "en" ? "ON" : "ဖွင့်") : (t === "en" ? "OFF" : "ပိတ်")}</Badge>
              </div>
            ) : (
              <Badge variant="outline">{t === "en" ? "Read-only" : "ကြည့်ရန်သာ"}</Badge>
            )}
          </CardContent>
        </Card>

        {pub.error ? (
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-rose-200 text-xs flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5" />
            <div>{pub.error}</div>
          </div>
        ) : null}

        <MapboxNavigationWorkspace mode="rider" />
      </div>
    </PortalShell>
  );
}
EOF

cat > "src/pages/portals/OperationsTrackingPage.tsx" <<'EOF'
// @ts-nocheck
import React, { useMemo } from "react";
import { PortalShell } from "@/components/layout/PortalShell";
import { useLanguage } from "@/contexts/LanguageContext";
import MapboxNavigationWorkspace from "@/features/maps/MapboxNavigationWorkspace";

export default function OperationsTrackingPage() {
  const { lang } = useLanguage();
  const t = useMemo(() => (lang === "en" ? "en" : "my"), [lang]);

  return (
    <PortalShell
      title={t === "en" ? "Live Tracking" : "Live Tracking"}
      links={[
        { to: "/portal/operations", label: t === "en" ? "Operations" : "Operations" },
        { to: "/portal/operations/manual", label: t === "en" ? "QR Manual" : "QR လမ်းညွှန်" },
      ]}
    >
      <MapboxNavigationWorkspace mode="ops" title={t === "en" ? "Courier Live Tracking" : "Courier Live Tracking"} />
    </PortalShell>
  );
}
EOF

cat > "scripts/sql/courier_locations.sql" <<'EOF'
-- EN: Supabase table for real-time courier tracking
-- MY: Real-time courier tracking အတွက် Supabase table

create table if not exists public.courier_locations (
  user_id uuid primary key references auth.users(id) on delete cascade,
  lat double precision not null,
  lng double precision not null,
  heading real null,
  speed real null,
  accuracy real null,
  updated_at timestamptz not null default now()
);

alter table public.courier_locations enable row level security;

-- EN: Courier can upsert own location
-- MY: Courier သည် ကိုယ့် location ကိုသာ upsert လုပ်နိုင်
drop policy if exists "courier_upsert_own_location" on public.courier_locations;
create policy "courier_upsert_own_location"
on public.courier_locations
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- EN: Ops/Admin can read all locations (role from profiles.role)
-- MY: Ops/Admin သည် အားလုံးကို ဖတ်နိုင် (profiles.role မှ role ကိုသုံး)
drop policy if exists "ops_read_all_locations" on public.courier_locations;
create policy "ops_read_all_locations"
on public.courier_locations
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and upper(coalesce(p.role, p.role_code, p.app_role, p.user_role, '')) in
        ('OPERATIONS_ADMIN','STAFF','SUPERVISOR','WAREHOUSE_MANAGER','SUBSTATION_MANAGER','BRANCH_MANAGER','ADM','MGR','SUPER_ADMIN','SYS','APP_OWNER')
  )
);
EOF


# EN: Ensure env example has Mapbox token key
# MY: .env.example ထဲ Mapbox token key ထည့်မည်
if [ -f ".env.example" ]; then
  if ! grep -q "^VITE_MAPBOX_ACCESS_TOKEN=" ".env.example"; then
    echo "" >> ".env.example"
    echo "# Mapbox (public token)" >> ".env.example"
    echo "VITE_MAPBOX_ACCESS_TOKEN=" >> ".env.example"
  fi
fi

# EN: Patch App routes + imports (idempotent)
# MY: App route + import ထည့် (ထပ်မတိုးအောင်)
node <<'NODE'
const fs = require("fs");

const appPath = "src/App.tsx";
let s = fs.readFileSync(appPath, "utf8");

function ensureImport(line) {
  if (s.includes(line)) return;
  // Insert after other portal imports if possible
  const re = /import\s+ExecutionPortal\s+from\s+["']\.\/pages\/portals\/ExecutionPortal["'];\s*\r?\n/;
  if (re.test(s)) {
    s = s.replace(re, (m) => m + line + "\n");
    return;
  }
  s = line + "\n" + s;
}

ensureImport('import ExecutionNavigationPage from "./pages/portals/ExecutionNavigationPage";');
ensureImport('import OperationsTrackingPage from "./pages/portals/OperationsTrackingPage";');

function ensureRoute(path, elementLine) {
  if (s.includes(`path="${path}"`)) return;

  // Insert after /portal/execution route
  const re = new RegExp(`<Route\\s+path="${path.replace(/\//g, "\\/")}"`);
  if (re.test(s)) return;

  const anchor = /<Route\s+path="\/portal\/execution"[\s\S]*?<\/Route>\s*\r?\n/;
  if (anchor.test(s) && path.startsWith("/portal/execution")) {
    s = s.replace(anchor, (m) => m + elementLine + "\n");
    return;
  }

  const anchorOps = /<Route\s+path="\/portal\/operations"[\s\S]*?<\/Route>\s*\r?\n/;
  if (anchorOps.test(s) && path.startsWith("/portal/operations")) {
    s = s.replace(anchorOps, (m) => m + elementLine + "\n");
    return;
  }

  // Fallback before /unauthorized
  const re2 = /<Route\s+path="\/unauthorized"[\s\S]*?\/>\s*\r?\n/;
  if (re2.test(s)) {
    s = s.replace(re2, (m) => elementLine + "\n" + m);
    return;
  }

  // Last resort: append near end
  s = s.replace(/<\/Routes>/, elementLine + "\n</Routes>");
}

ensureRoute(
  "/portal/execution/navigation",
  `              <Route
                path="/portal/execution/navigation"
                element={
                  <RequireRole allow={["RIDER","DRIVER","HELPER","SYS","APP_OWNER","SUPER_ADMIN"]}>
                    <ExecutionNavigationPage />
                  </RequireRole>
                }
              />`
);

ensureRoute(
  "/portal/operations/tracking",
  `              <Route
                path="/portal/operations/tracking"
                element={
                  <RequireRole allow={["OPERATIONS_ADMIN","STAFF","SUPERVISOR","WAREHOUSE_MANAGER","SUBSTATION_MANAGER","BRANCH_MANAGER","ADM","MGR","SUPER_ADMIN","SYS","APP_OWNER"]}>
                    <OperationsTrackingPage />
                  </RequireRole>
                }
              />`
);

fs.writeFileSync(appPath, s);
console.log("✅ Patched src/App.tsx with Mapbox pages");
NODE

# EN: Add links/cards to ExecutionPortal + OperationsPortal (best-effort, idempotent)
# MY: ExecutionPortal + OperationsPortal ထဲ link/card ထည့် (best-effort)
node <<'NODE'
const fs = require("fs");

function patchFile(path, fn) {
  if (!fs.existsSync(path)) return;
  const orig = fs.readFileSync(path, "utf8");
  const next = fn(orig);
  if (next !== orig) fs.writeFileSync(path, next);
}

patchFile("src/pages/portals/ExecutionPortal.tsx", (s) => {
  if (s.includes("/portal/execution/navigation")) return s;

  // Add a link in PortalShell links array when showManual=true
  s = s.replace(
    /(\{\s*to:\s*"\/portal\/execution\/manual"[^}]*\}\s*,)/,
    `$1\n              { to: "/portal/execution/navigation", label: t === "en" ? "Navigation" : "လမ်းညွှန်" },`
  );

  // Add a small card under manual card
  s = s.replace(
    /(\{showManual\s*\?\s*\(\s*<div[\s\S]*?<\/div>\s*\)\s*:\s*null\}\s*)/m,
    `$1\n\n        {showManual ? (\n          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 flex items-center justify-between gap-3">\n            <div>\n              <div className="text-sm font-semibold">{t === "en" ? "Navigation" : "လမ်းညွှန်"}</div>\n              <div className="text-xs opacity-70">{t === "en" ? "Route planning + live GPS" : "Route planning + live GPS"}</div>\n            </div>\n            <Link to="/portal/execution/navigation">\n              <Button size="sm" variant="outline">{t === "en" ? "Open" : "ဖွင့်ရန်"}</Button>\n            </Link>\n          </div>\n        ) : null}\n`
  );

  return s;
});

patchFile("src/pages/portals/OperationsPortal.tsx", (s) => {
  if (s.includes("/portal/operations/tracking")) return s;

  // Add link in PortalShell links prop if present
  s = s.replace(
    /links=\{\[/,
    'links={[{ to: "/portal/operations/tracking", label: "Live Tracking" },'
  );

  return s;
});

console.log("✅ Patched portal links (best-effort)");
NODE

echo ""
echo "✅ EN: Mapbox integration installed."
echo "✅ MY: Mapbox integration ထည့်သွင်းပြီးပါပြီ။"
echo ""
echo "Next:"
echo "  1) Add VITE_MAPBOX_ACCESS_TOKEN in .env.local (and Vercel env), then redeploy."
echo "  2) Apply SQL: scripts/sql/courier_locations.sql in Supabase SQL editor."
echo "  3) npm run dev"

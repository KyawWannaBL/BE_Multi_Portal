#!/usr/bin/env bash
set -euo pipefail

# EN: Add ETA + remaining distance per stop (live) + Geofencing events -> shipment_tracking
# MY: ETA + လက်ကျန်အကွာအဝေး (Stop အလိုက်) real-time + Geofence event -> shipment_tracking ထည့်သွင်းမည်

if [ ! -f "package.json" ]; then
  echo "❌ EN: Run this from repo root (package.json folder)."
  echo "❌ MY: package.json ရှိတဲ့ repo root မှ run လုပ်ပါ။"
  exit 1
fi

STAMP="$(date +%Y%m%d_%H%M%S)"
BK=".backup_mapbox_eta_geofence_${STAMP}"
mkdir -p "$BK"

# EN/MY: Backup files we touch
for f in \
  "scripts/sql/courier_locations.sql" \
  "scripts/sql/shipment_tracking.sql" \
  "src/lib/geo.ts" \
  "src/services/shipmentTracking.ts" \
  "src/hooks/useLiveCourierLocations.ts" \
  "src/pages/portals/OperationsTrackingPage.tsx" \
  "src/pages/portals/ExecutionNavigationPage.tsx" \
  "src/features/maps/MapboxNavigationWorkspace.tsx"
do
  if [ -f "$f" ]; then
    mkdir -p "$BK/$(dirname "$f")"
    cp -f "$f" "$BK/$f.bak"
  fi
done

echo "✅ EN: Backups saved to $BK"
echo "✅ MY: Backup ဖိုင်များကို $BK ထဲသိမ်းပြီးပါပြီ"

mkdir -p "scripts/sql" "src/lib" "src/services" "src/hooks" "src/pages/portals" "src/features/maps"

# EN: SQL migrations (run these in Supabase SQL editor)
# MY: SQL migration များ (Supabase SQL editor မှာ run လုပ်ပါ)
cat > "scripts/sql/courier_locations.sql" <<'EOF'
-- EN: Courier live location table (with route metrics)
-- MY: Courier လက်ရှိတည်နေရာ + လမ်းကြောင်း metric များ

create table if not exists public.courier_locations (
  user_id uuid primary key references auth.users(id) on delete cascade,
  lat double precision not null,
  lng double precision not null,
  heading real,
  speed real,
  accuracy real,
  remaining_meters double precision,
  eta_seconds integer,
  next_stop_index integer,
  next_stop_eta timestamptz,
  route_id text,
  updated_at timestamptz not null default now()
);

-- Add columns if existing table was created earlier
alter table public.courier_locations add column if not exists remaining_meters double precision;
alter table public.courier_locations add column if not exists eta_seconds integer;
alter table public.courier_locations add column if not exists next_stop_index integer;
alter table public.courier_locations add column if not exists next_stop_eta timestamptz;
alter table public.courier_locations add column if not exists route_id text;

alter table public.courier_locations replica identity full;

alter table public.courier_locations enable row level security;

-- EN: Couriers can upsert their own row.
-- MY: Courier သည် သူ့ row ကိုသာ upsert/update လုပ်နိုင်သည်။
do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='courier_locations' and policyname='courier_locations_select') then
    create policy courier_locations_select on public.courier_locations
      for select to authenticated
      using (true);
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='courier_locations' and policyname='courier_locations_upsert_own') then
    create policy courier_locations_upsert_own on public.courier_locations
      for insert to authenticated
      with check (auth.uid() = user_id);
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='courier_locations' and policyname='courier_locations_update_own') then
    create policy courier_locations_update_own on public.courier_locations
      for update to authenticated
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end $$;
EOF

cat > "scripts/sql/shipment_tracking.sql" <<'EOF'
-- EN: Shipment tracking events (geofence / arrival / exception)
-- MY: Shipment tracking event များ (geofence / ရောက်ရှိ / exception)

create table if not exists public.shipment_tracking (
  id uuid primary key default gen_random_uuid(),
  shipment_id uuid null,
  way_id text null,
  event_type text not null,
  stop_index integer null,
  stop_label text null,
  lat double precision null,
  lng double precision null,
  accuracy real null,
  event_at timestamptz not null default now(),
  actor_id uuid null references auth.users(id) on delete set null,
  actor_role text null,
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists shipment_tracking_way_id_idx on public.shipment_tracking (way_id);
create index if not exists shipment_tracking_shipment_id_idx on public.shipment_tracking (shipment_id);
create index if not exists shipment_tracking_event_at_idx on public.shipment_tracking (event_at desc);

alter table public.shipment_tracking enable row level security;

-- EN: Allow authenticated insert (events are append-only).
-- MY: Authenticated user အား insert ခွင့်ပြု (event တွေ append-only)
do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='shipment_tracking' and policyname='shipment_tracking_insert') then
    create policy shipment_tracking_insert on public.shipment_tracking
      for insert to authenticated
      with check (true);
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='shipment_tracking' and policyname='shipment_tracking_select') then
    create policy shipment_tracking_select on public.shipment_tracking
      for select to authenticated
      using (true);
  end if;
end $$;
EOF

# EN: Geo helpers (haversine + formatters)
# MY: Geo helper များ
cat > "src/lib/geo.ts" <<'EOF'
export function haversineMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const toRad = (v: number) => (v * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function metersToKm(m: number | null | undefined): string {
  if (m === null || m === undefined) return "-";
  if (m < 1000) return `${Math.round(m)} m`;
  return `${(m / 1000).toFixed(1)} km`;
}

export function secondsToMin(sec: number | null | undefined): string {
  if (sec === null || sec === undefined) return "-";
  const m = Math.round(sec / 60);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${h}h ${mm}m`;
}

export function fmtTime(isoOrDate: string | Date | null | undefined): string {
  if (!isoOrDate) return "-";
  const d = isoOrDate instanceof Date ? isoOrDate : new Date(isoOrDate);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
EOF

# EN: Tracking service (upsert courier metrics + insert events)
# MY: Tracking service (courier metrics + event insert)
cat > "src/services/shipmentTracking.ts" <<'EOF'
import { supabase } from "@/lib/supabase";

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

# EN: Update live courier hook to include ETA fields
# MY: Live courier hook ကို ETA field များပါအောင် update
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
  remaining_meters: number | null;
  eta_seconds: number | null;
  next_stop_index: number | null;
  next_stop_eta: string | null;
  route_id: string | null;
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

# EN: Update portal pages
# MY: Portal page များ update
cat > "src/pages/portals/OperationsTrackingPage.tsx" <<'EOF'
// @ts-nocheck
import React, { useMemo } from "react";
import { PortalShell } from "@/components/layout/PortalShell";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Navigation } from "lucide-react";
import MapboxNavigationWorkspace from "@/features/maps/MapboxNavigationWorkspace";
import { useLiveCourierLocations } from "@/hooks/useLiveCourierLocations";
import { metersToKm, secondsToMin, fmtTime } from "@/lib/geo";

export default function OperationsTrackingPage() {
  const { lang } = useLanguage();
  const t = useMemo(() => (lang === "en" ? "en" : "my"), [lang]);

  const { rows, error } = useLiveCourierLocations({ enabled: true });

  return (
    <PortalShell
      title={t === "en" ? "Live Tracking" : "Live Tracking"}
      links={[
        { to: "/portal/operations", label: t === "en" ? "Operations" : "Operations" },
        { to: "/portal/operations/manual", label: t === "en" ? "QR Manual" : "QR လမ်းညွှန်" },
      ]}
    >
      <div className="space-y-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Navigation className="h-5 w-5" />
              <div>
                <div className="text-sm font-semibold">{t === "en" ? "Couriers (Real-time)" : "Courier များ (Real-time)"}</div>
                <div className="text-xs opacity-70">
                  {t === "en" ? "Remaining distance/ETA updates from rider app" : "Rider app မှ remaining distance/ETA ပို့သည်"}
                </div>
              </div>
            </div>
            <Badge variant="outline">{rows?.length ?? 0}</Badge>
          </CardContent>
        </Card>

        {error ? (
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-rose-200 text-xs flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5" />
            <div>{error}</div>
          </div>
        ) : null}

        <div className="grid gap-3 md:grid-cols-2">
          {(rows || []).slice(0, 12).map((r) => (
            <Card key={r.user_id} className="bg-white/5 border-white/10">
              <CardContent className="p-4 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="font-mono text-xs opacity-80">{r.user_id}</div>
                  <div className="text-[10px] opacity-70">{new Date(r.updated_at).toLocaleString()}</div>
                </div>
                <div className="text-xs opacity-80">
                  {t === "en" ? "Remaining" : "ကျန်"}: <span className="font-semibold">{metersToKm(r.remaining_meters)}</span>
                  {" • "}
                  {t === "en" ? "ETA" : "ETA"}: <span className="font-semibold">{secondsToMin(r.eta_seconds)}</span>
                </div>
                <div className="text-xs opacity-70">
                  {t === "en" ? "Next stop" : "နောက်တစ်မှတ်"}: {r.next_stop_index ?? "-"}
                  {" • "}
                  {t === "en" ? "Arrive" : "ရောက်မည်"}: {fmtTime(r.next_stop_eta)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <MapboxNavigationWorkspace mode="ops" title={t === "en" ? "Map View" : "မြေပုံ"} />
      </div>
    </PortalShell>
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
import { Map } from "lucide-react";
import MapboxNavigationWorkspace from "@/features/maps/MapboxNavigationWorkspace";

export default function ExecutionNavigationPage() {
  const { lang } = useLanguage();
  const t = useMemo(() => (lang === "en" ? "en" : "my"), [lang]);
  const { role } = useAuth();

  const normalizedRole = (role ?? "").trim().toUpperCase();
  const canShare = ["RIDER", "DRIVER", "HELPER"].includes(normalizedRole);

  const [share, setShare] = useState(true);

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
                <div className="text-xs opacity-70">{t === "en" ? "ETA + Remaining + Geofence arrival events" : "ETA + Remaining + Geofence arrival events"}</div>
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

        <MapboxNavigationWorkspace mode="rider" shareLocation={canShare && share} />
      </div>
    </PortalShell>
  );
}
EOF

# EN: Update map workspace (ETA + per-stop + geofence + publish metrics)
# MY: Map workspace update (ETA + Stop အလိုက် + geofence + metric publish)
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
import { findShipmentIdByWayId, insertShipmentTrackingEvent, upsertCourierLocationWithMetrics } from "@/services/shipmentTracking";

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

    // clean
    for (const mk of Object.values(markersRef.current)) mk.remove();
    markersRef.current = {};

    for (const s of stops) {
      const el = document.createElement("div");
      el.style.width = "18px";
      el.style.height = "18px";
      el.style.borderRadius = "999px";
      el.style.background = s.id === selectedId ? "#f59e0b" : "#60a5fa";
      el.style.boxShadow = "0 0 0 3px rgba(96,165,250,0.22)";

      const mk = new mapboxgl.Marker({ element: el })
        .setLngLat(s.coord as any)
        .addTo(map);

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

        // mark me
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

      const { trip, waypoints } = await fetchOptimizedTripV1({
        coordinates: coords,
        roundtrip: false,
        source: "first",
        destination: "last",
        steps: true,
      });

      renderRouteLine({ type: "Feature", geometry: trip.geometry });
      fitRoute(trip.geometry.coordinates);

      // reorder by waypoint_index
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

      const stop = remainingStops[i]; // leg i arrives at stop i (since origin is current)
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

    // publish to Supabase if enabled
    if (props.shareLocation && user?.id) {
      const nextStopEta = nextStop?.etaIso ?? null;
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
        nextStopEta,
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

    const wayId = stop.label;
    const shipmentId = await findShipmentIdByWayId(wayId);

    await insertShipmentTrackingEvent({
      wayId,
      shipmentId,
      eventType: "ARRIVED_STOP",
      stopIndex: navIndex,
      stopLabel: stop.label,
      lat: pos.lat,
      lng: pos.lng,
      accuracy: pos.accuracy ?? null,
      actorId: user?.id ?? null,
      actorRole: (role ?? "").trim().toUpperCase() || null,
      metadata: { radius_m: radiusM, distance_m: dist },
    });

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

        // update me marker
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
              <div>
                Missing <span className="font-mono">VITE_MAPBOX_ACCESS_TOKEN</span>.
              </div>
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
            <Input
              className="bg-black/30 border-white/10 text-white"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search place / address"
            />
            <Button onClick={search} variant="outline">
              <Send className="h-4 w-4 mr-2" /> Search
            </Button>
          </div>

          {suggestions.length ? (
            <div className="space-y-1">
              {suggestions.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => addStopFromFeature(f)}
                  className="w-full text-left text-xs rounded-xl border border-white/10 bg-black/20 hover:bg-white/5 px-3 py-2"
                >
                  {f.place_name}
                </button>
              ))}
            </div>
          ) : null}

          <div className="space-y-2">
            {stops.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSelectedId(s.id)}
                className="w-full text-left rounded-xl border border-white/10 bg-black/20 hover:bg-white/5 px-3 py-2"
              >
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold truncate">{i}. {s.label}</div>
                  {props.mode === "rider" && i === navIndex ? <Badge variant="outline">NEXT</Badge> : null}
                </div>
                {props.mode === "rider" ? (
                  <div className="text-[11px] opacity-70">
                    ETA: {fmtTime(metrics.perStop.find((p) => p.idx === i)?.etaIso)} • Dist: {metersToKm(metrics.perStop.find((p) => p.idx === i)?.distM)}
                  </div>
                ) : null}
              </button>
            ))}
          </div>

          <Separator className="bg-white/10" />

          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={() => setStops([])}>
              Clear
            </Button>
            <Button variant="outline" onClick={planRouteDirections}>
              <Route className="h-4 w-4 mr-2" /> Directions
            </Button>
            <Button variant="outline" onClick={planRouteOptimize}>
              <ShieldCheck className="h-4 w-4 mr-2" /> Optimize
            </Button>
          </div>

          {routeInfo ? (
            <div className="text-xs opacity-80">
              Route: {metersToKm(routeInfo.distance)} • {secondsToMin(routeInfo.duration)}
            </div>
          ) : null}
        </div>

        {props.mode === "rider" && metrics.perStop.length ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-sm font-semibold mb-2">Stop ETAs</div>
            <div className="space-y-2">
              {metrics.perStop.slice(0, 10).map((p) => (
                <div key={p.idx} className="text-xs flex items-center justify-between">
                  <div className="truncate mr-2">{p.idx}. {p.label}</div>
                  <div className="font-mono opacity-80">{fmtTime(p.etaIso)}</div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/5">
        <div ref={mapContainer} className="h-[72vh] w-full" />
      </div>
    </div>
  );
}
EOF

echo ""
echo "✅ EN: Installed ETA + per-stop metrics + geofence events."
echo "✅ MY: ETA + stop metrics + geofence event ထည့်သွင်းပြီးပါပြီ။"
echo ""
echo "NEXT STEPS:"
echo "  1) Supabase SQL editor: run scripts/sql/courier_locations.sql"
echo "  2) Supabase SQL editor: run scripts/sql/shipment_tracking.sql"
echo "  3) Ensure env: VITE_MAPBOX_ACCESS_TOKEN"
echo "  4) npm run build"

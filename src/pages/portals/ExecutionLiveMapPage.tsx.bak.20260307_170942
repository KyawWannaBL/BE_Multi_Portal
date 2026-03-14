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

// @ts-nocheck
import React from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Check, LocateFixed, MapPin, Pause, Pencil, Play, Route, Send, ShieldCheck, X } from "lucide-react";
import { geocodeForward, fetchDirections, fetchOptimizedTripV1, isMapboxConfigured, type LngLat } from "@/services/mapbox";
import { useLiveCourierLocations } from "@/hooks/useLiveCourierLocations";
import { useAuth } from "@/contexts/AuthContext";
import { haversineMeters, metersToKm, secondsToMin, fmtTime } from "@/lib/geo";
import { findShipmentIdByWayId, insertShipmentTrackingEvent, markShipmentDeliveredByWayId, parseWayIdFromLabel, upsertCourierLocationWithMetrics } from "@/services/shipmentTracking";
import { markDelivered } from "@/services/shipments";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "";

type Stop = {
  id: string;
  label: string;
  coord: LngLat;
  wayId: string | null;
  lockWayId: boolean;
};

function uid() {
  return Math.random().toString(16).slice(2) + "-" + Date.now().toString(16);
}

function normalizeWayId(v: string | null | undefined): string | null {
  const s = String(v ?? "").trim();
  return s ? s.toUpperCase() : null;
}

export default function MapboxNavigationWorkspace(props: { mode: 'rider' | 'ops'; title?: string; shareLocation?: boolean; }) {
  const { user, role } = useAuth();

  const [query, setQuery] = React.useState('');
  const [suggestions, setSuggestions] = React.useState<any[]>([]);
  const [stops, setStops] = React.useState<Stop[]>([]);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [editingId, setEditingId] = React.useState<string | null>(null);

  const [routeInfo, setRouteInfo] = React.useState<{ distance: number; duration: number } | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const [navOn, setNavOn] = React.useState(false);
  const [geoErr, setGeoErr] = React.useState<string | null>(null);
  const [radiusM, setRadiusM] = React.useState(80);
  const [navIndex, setNavIndex] = React.useState(0);

  const [current, setCurrent] = React.useState<{ lat: number; lng: number; accuracy: number | null; heading: number | null; speed: number | null } | null>(null);

  const [metrics, setMetrics] = React.useState<{ remainingMeters: number | null; etaSeconds: number | null; destEta: string | null; nextStopEta: string | null; perStop: Array<{ idx: number; label: string; etaIso: string | null; distM: number | null }>; }>({ remainingMeters: null, etaSeconds: null, destEta: null, nextStopEta: null, perStop: [] });

  const mapRef = React.useRef<mapboxgl.Map | null>(null);
  const mapContainer = React.useRef<HTMLDivElement | null>(null);
  const stopMarkersRef = React.useRef<Record<string, mapboxgl.Marker>>({});
  const courierMarkersRef = React.useRef<Record<string, mapboxgl.Marker>>({});
  const meMarkerRef = React.useRef<mapboxgl.Marker | null>(null);
  const watchIdRef = React.useRef<number | null>(null);
  const arrivedRef = React.useRef<Record<string, boolean>>({});
  const lastApiRef = React.useRef<{ t: number; lat: number; lng: number; idx: number; hash: string } | null>(null);

  const { rows: couriers, error: liveErr } = useLiveCourierLocations({ enabled: props.mode === 'ops' });

  React.useEffect(() => {
    if (!mapContainer.current) return;
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/navigation-night-v1',
      center: [96.1561, 16.8661],
      zoom: 12,
    });
    map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
    mapRef.current = map;
    return () => map.remove();
  }, []);

  React.useEffect(() => {
    if (props.mode !== 'ops') return;
    const map = mapRef.current;
    if (!map) return;
    const seen = new Set<string>();
    for (const c of couriers || []) {
      seen.add(c.user_id);
      const lngLat: [number, number] = [c.lng, c.lat];
      let mk = courierMarkersRef.current[c.user_id];
      if (!mk) {
        const el = document.createElement('div');
        el.style.width = '14px';
        el.style.height = '14px';
        el.style.borderRadius = '999px';
        el.style.background = 'rgba(16,185,129,0.95)';
        el.style.boxShadow = '0 0 0 3px rgba(16,185,129,0.22)';
        mk = new mapboxgl.Marker({ element: el }).setLngLat(lngLat).addTo(map);
        courierMarkersRef.current[c.user_id] = mk;
      } else {
        mk.setLngLat(lngLat);
      }
    }
    for (const id of Object.keys(courierMarkersRef.current)) {
      if (!seen.has(id)) {
        courierMarkersRef.current[id].remove();
        delete courierMarkersRef.current[id];
      }
    }
  }, [props.mode, couriers]);

  function ensureRouteSource(geojson: any) {
    const map = mapRef.current;
    if (!map) return;
    const src = map.getSource('route') as mapboxgl.GeoJSONSource;
    if (src) src.setData(geojson);
    else {
      map.addSource('route', { type: 'geojson', data: geojson });
      map.addLayer({
        id: 'route-line',
        type: 'line',
        source: 'route',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: { 'line-color': '#10b981', 'line-width': 4, 'line-opacity': 0.85 },
      });
    }
  }

  function updateStop(id: string, patch: Partial<Stop>) {
    setStops((prev) => prev.map((s) => {
      if (s.id !== id) return s;
      const next: Stop = { ...s, ...patch } as any;
      if (!next.lockWayId) next.wayId = normalizeWayId(parseWayIdFromLabel(next.label));
      return next;
    }));
  }

  function renderStopMarkers() {
    const map = mapRef.current;
    if (!map) return;
    for (const mk of Object.values(stopMarkersRef.current)) mk.remove();
    stopMarkersRef.current = {};
    for (const s of stops) {
      const el = document.createElement('div');
      el.style.width = '18px';
      el.style.height = '18px';
      el.style.borderRadius = '999px';
      el.style.background = s.id === selectedId ? '#f59e0b' : '#60a5fa';
      el.style.boxShadow = '0 0 0 3px rgba(96,165,250,0.22)';
      stopMarkersRef.current[s.id] = new mapboxgl.Marker({ element: el }).setLngLat(s.coord as any).addTo(map);
    }
  }

  React.useEffect(() => {
    renderStopMarkers();
  }, [stops, selectedId]);

  function locateMe() {
    const map = mapRef.current;
    if (!map) return;
    if (!('geolocation' in navigator)) { setGeoErr('Geolocation not supported.'); return; }
    navigator.geolocation.getCurrentPosition((pos) => {
      setGeoErr(null);
      const lng = pos.coords.longitude;
      const lat = pos.coords.latitude;
      map.flyTo({ center: [lng, lat], zoom: 15, speed: 1.2 });
      if (!meMarkerRef.current) {
        const el = document.createElement('div');
        el.style.width = '12px'; el.style.height = '12px'; el.style.borderRadius = '999px';
        el.style.background = 'rgba(244,63,94,0.95)';
        el.style.boxShadow = '0 0 0 4px rgba(244,63,94,0.22)';
        meMarkerRef.current = new mapboxgl.Marker({ element: el }).setLngLat([lng, lat]).addTo(map);
      } else meMarkerRef.current.setLngLat([lng, lat]);
    }, (e) => setGeoErr(e.message), { enableHighAccuracy: true, timeout: 8000 });
  }

  async function searchPlaces() {
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
    const label = f.place_name || f.text || 'Stop';
    const wayId = normalizeWayId(parseWayIdFromLabel(label));
    setStops((s) => [...s, { id: uid(), label, coord, wayId, lockWayId: false }]);
    setSuggestions([]); setQuery('');
  }

  function fitRoute(coords: LngLat[]) {
    const map = mapRef.current;
    if (!map || coords.length < 2) return;
    const bounds = coords.reduce((b, c) => b.extend(c as any), new mapboxgl.LngLatBounds(coords[0] as any, coords[0] as any));
    map.fitBounds(bounds, { padding: 60, duration: 600 });
  }

  async function planDirections() {
    try {
      setError(null); setRouteInfo(null);
      if (stops.length < 2) { setError('Add at least 2 stops.'); return; }
      const coords = stops.map((s) => s.coord);
      const route = await fetchDirections({ coordinates: coords, steps: false, overview: 'full' });
      ensureRouteSource({ type: 'Feature', geometry: route.geometry });
      fitRoute(route.geometry.coordinates);
      setRouteInfo({ distance: route.distance, duration: route.duration });
    } catch (e: any) { setError(e?.message || String(e)); }
  }

  async function optimizeRoute() {
    try {
      setError(null); setRouteInfo(null);
      if (stops.length < 2) { setError('Add at least 2 stops to optimize.'); return; }
      const coords = stops.map((s) => s.coord);
      const { trip, waypoints } = await fetchOptimizedTripV1({ coordinates: coords, roundtrip: false, source: 'first', destination: 'last', steps: false });
      ensureRouteSource({ type: 'Feature', geometry: trip.geometry });
      fitRoute(trip.geometry.coordinates);
      const key = (c: LngLat) => `${c[0].toFixed(6)},${c[1].toFixed(6)}`;
      const wMap = new Map<string, number>();
      (waypoints || []).forEach((w) => wMap.set(key(w.location), w.waypoint_index));
      setStops((prev) => [...prev].sort((a, b) => (wMap.get(key(a.coord)) ?? 0) - (wMap.get(key(b.coord)) ?? 0)));
      setRouteInfo({ distance: trip.distance, duration: trip.duration });
    } catch (e: any) { setError(e?.message || String(e)); }
  }

  function routeHash() {
    return stops.map((s) => `${s.coord[0].toFixed(5)},${s.coord[1].toFixed(5)}`).join('|') + `#${navIndex}`;
  }

  async function recalcEtaFromCurrent(pos: any, force?: boolean) {
    if (props.mode !== 'rider' || !navOn) return;
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
    const route = await fetchDirections({ coordinates: coords, steps: false, overview: 'full' });
    ensureRouteSource({ type: 'Feature', geometry: route.geometry });
    const perStop: any[] = [];
    let cumDur = 0;
    let cumDist = 0;
    (route.legs || []).forEach((leg: any, i: number) => {
      cumDur += leg.duration ?? 0;
      cumDist += leg.distance ?? 0;
      const stop = remainingStops[i];
      if (stop) perStop.push({ idx: navIndex + i, label: stop.label, etaIso: new Date(Date.now() + cumDur * 1000).toISOString(), distM: cumDist });
    });
    const destEtaIso = route.duration ? new Date(Date.now() + route.duration * 1000).toISOString() : null;
    const next = perStop[0] || null;
    setMetrics({ remainingMeters: route.distance ?? null, etaSeconds: route.duration ?? null, destEta: destEtaIso, nextStopEta: next?.etaIso ?? null, perStop });
    if (props.shareLocation && user?.id) {
      await upsertCourierLocationWithMetrics({
        userId: user.id, lat: pos.lat, lng: pos.lng, heading: pos.heading ?? null, speed: pos.speed ?? null, accuracy: pos.accuracy ?? null,
        updatedAt: new Date().toISOString(), remainingMeters: route.distance ?? null, etaSeconds: route.duration ?? null,
        nextStopIndex: navIndex, nextStopEta: next?.etaIso ?? null, routeId: h,
      });
    }
  }

  async function onGeofence(pos: any) {
    const stop = stops[navIndex];
    if (!stop) return;
    const dist = haversineMeters(pos.lat, pos.lng, stop.coord[1], stop.coord[0]);
    if (dist > radiusM) return;
    if (arrivedRef.current[stop.id]) return;
    arrivedRef.current[stop.id] = true;
    const isFinal = navIndex >= stops.length - 1;
    const wayId = normalizeWayId(stop.wayId) || normalizeWayId(parseWayIdFromLabel(stop.label));
    const shipmentId = wayId ? await findShipmentIdByWayId(wayId) : null;
    await insertShipmentTrackingEvent({
      wayId, shipmentId, eventType: isFinal ? 'DELIVERED_GEOFENCE' : 'ARRIVED_STOP', stopIndex: navIndex, stopLabel: stop.label,
      lat: pos.lat, lng: pos.lng, accuracy: pos.accuracy ?? null, actorId: user?.id ?? null, actorRole: (role ?? '').trim().toUpperCase() || null,
      metadata: { radius_m: radiusM, distance_m: dist, final_stop: isFinal },
    });
    if (isFinal && wayId) {
      let ok = false;
      let lastErr: any = null;
      if (shipmentId) {
        try { await markDelivered(shipmentId); ok = true; } catch (e: any) { lastErr = e; }
      }
      if (!ok) {
        const upd = await markShipmentDeliveredByWayId({ wayId });
        ok = !upd?.error;
        if (!ok) lastErr = upd?.error;
      }
      await insertShipmentTrackingEvent({
        wayId, shipmentId,
        eventType: ok ? 'DELIVERED_UPDATED' : 'DELIVERED_UPDATE_FAILED',
        stopIndex: navIndex, stopLabel: stop.label, lat: pos.lat, lng: pos.lng, accuracy: pos.accuracy ?? null,
        actorId: user?.id ?? null, actorRole: (role ?? '').trim().toUpperCase() || null,
        metadata: ok ? { by: shipmentId ? 'markDelivered(shipmentId)' : 'shipments.update(way_id)' } : { error: lastErr?.message || String(lastErr) },
      });
    }
    if (isFinal) {
      stopNav();
      setNavIndex(stops.length);
      return;
    }
    setNavIndex((i) => Math.min(i + 1, stops.length));
  }

  function startNav() {
    if (props.mode !== 'rider') return;
    if (!('geolocation' in navigator)) { setGeoErr('Geolocation not supported.'); return; }
    setGeoErr(null);
    setNavOn(true);
    const map = mapRef.current;
    watchIdRef.current = navigator.geolocation.watchPosition(async (pos) => {
      const p = { lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy ?? null, heading: pos.coords.heading ?? null, speed: pos.coords.speed ?? null };
      setCurrent(p);
      if (map) {
        if (!meMarkerRef.current) {
          const el = document.createElement('div');
          el.style.width = '12px'; el.style.height = '12px'; el.style.borderRadius = '999px';
          el.style.background = 'rgba(244,63,94,0.95)';
          el.style.boxShadow = '0 0 0 4px rgba(244,63,94,0.22)';
          meMarkerRef.current = new mapboxgl.Marker({ element: el }).setLngLat([p.lng, p.lat]).addTo(map);
        } else meMarkerRef.current.setLngLat([p.lng, p.lat]);
      }
      await onGeofence(p);
      await recalcEtaFromCurrent(p);
    }, (e) => setGeoErr(e.message), { enableHighAccuracy: true, maximumAge: 1500, timeout: 10000 });
  }

  function stopNav() {
    setNavOn(false);
    if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    watchIdRef.current = null;
  }

  React.useEffect(() => {
    if (!navOn) return;
    if (current) void recalcEtaFromCurrent(current, true);
  }, [navIndex, navOn, stops.length]);

  return (
    <div className='grid gap-4 md:grid-cols-[410px_1fr]'>
      <div className='space-y-3'>
        <div className='rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3'>
          <div className='flex items-center justify-between'>
            <div className='text-sm font-semibold'>{props.title || (props.mode === 'ops' ? 'Live Tracking' : 'Navigation & Route Planning')}</div>
            <div className='flex items-center gap-2'>
              <Button size='sm' variant='outline' onClick={locateMe}><LocateFixed className='h-4 w-4 mr-2' />Locate</Button>
              {props.mode === 'rider' ? (
                <Button size='sm' className={navOn ? 'bg-rose-600 hover:bg-rose-500' : 'bg-emerald-600 hover:bg-emerald-500'} onClick={navOn ? stopNav : startNav}>
                  {navOn ? <Pause className='h-4 w-4 mr-2' /> : <Play className='h-4 w-4 mr-2' />}
                  {navOn ? 'Stop' : 'Start'}
                </Button>
              ) : null}
            </div>
          </div>
          {!isMapboxConfigured() ? (
            <div className='text-xs text-rose-300 flex items-start gap-2'><AlertCircle className='h-4 w-4 mt-0.5' /><div>Missing <span className='font-mono'>VITE_MAPBOX_ACCESS_TOKEN</span>.</div></div>
          ) : null}
          {geoErr ? (<div className='text-xs text-amber-300 flex items-start gap-2'><AlertCircle className='h-4 w-4 mt-0.5' /><div>{geoErr}</div></div>) : null}
          {error ? (<div className='text-xs text-amber-300 flex items-start gap-2'><AlertCircle className='h-4 w-4 mt-0.5' /><div>{error}</div></div>) : null}
          {liveErr ? (<div className='text-xs text-amber-300 flex items-start gap-2'><AlertCircle className='h-4 w-4 mt-0.5' /><div>{liveErr}</div></div>) : null}
          {props.mode === 'rider' ? (
            <div className='grid gap-2'>
              <div className='flex items-center justify-between'><div className='text-xs opacity-80'>Geofence radius (m)</div><Input className='h-8 w-24 bg-black/30 border-white/10 text-white' value={radiusM} onChange={(e) => setRadiusM(Number(e.target.value || 80))} /></div>
              <Card className='bg-black/20 border-white/10'><CardContent className='p-3 space-y-1'>
                <div className='text-xs'>Remaining: <span className='font-semibold'>{metersToKm(metrics.remainingMeters)}</span> • ETA: <span className='font-semibold'>{secondsToMin(metrics.etaSeconds)}</span></div>
                <div className='text-xs opacity-80'>Destination: {fmtTime(metrics.destEta)} • Next stop: {fmtTime(metrics.nextStopEta)}</div>
                <div className='text-[11px] opacity-70'>Stop index: {navIndex} / {stops.length}</div>
              </CardContent></Card>
            </div>
          ) : null}
        </div>

        <div className='rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3'>
          <div className='flex items-center gap-2'><MapPin className='h-4 w-4' /><div className='text-sm font-semibold'>Stops</div><Badge variant='outline'>{stops.length}</Badge></div>
          <div className='flex gap-2'>
            <Input className='bg-black/30 border-white/10 text-white' value={query} onChange={(e) => setQuery(e.target.value)} placeholder='Search place / address' />
            <Button onClick={searchPlaces} variant='outline'><Send className='h-4 w-4 mr-2' />Search</Button>
          </div>
          {suggestions.length ? (
            <div className='space-y-1'>
              {suggestions.map((f) => (
                <button key={f.id} type='button' onClick={() => addStopFromFeature(f)} className='w-full text-left text-xs rounded-xl border border-white/10 bg-black/20 hover:bg-white/5 px-3 py-2'>{f.place_name}</button>
              ))}
            </div>
          ) : null}

          <div className='space-y-2'>
            {stops.map((s, i) => {
              const isEditing = editingId === s.id;
              const eta = metrics.perStop.find((p) => p.idx === i)?.etaIso;
              const distM = metrics.perStop.find((p) => p.idx === i)?.distM;
              const parsed = normalizeWayId(parseWayIdFromLabel(s.label));
              const effective = normalizeWayId(s.wayId) || parsed;
              return (
                <div key={s.id} className='rounded-xl border border-white/10 bg-black/20 px-3 py-2'>
                  <div className='flex items-center justify-between gap-2'>
                    <button type='button' className='text-left flex-1' onClick={() => setSelectedId(s.id)}>
                      <div className='text-xs font-semibold truncate'>{i}. {s.label}</div>
                      <div className='text-[11px] opacity-70'>WayID: <span className='font-mono'>{effective || '-'}</span> • ETA: {fmtTime(eta)} • Dist: {metersToKm(distM)}</div>
                    </button>
                    <div className='flex items-center gap-2'>
                      {props.mode === 'rider' && i === navIndex ? <Badge variant='outline'>NEXT</Badge> : null}
                      <Button size='icon' variant='outline' className='h-8 w-8' onClick={() => setEditingId(isEditing ? null : s.id)}><Pencil className='h-4 w-4' /></Button>
                    </div>
                  </div>

                  {isEditing ? (
                    <div className='mt-3 space-y-2'>
                      <div className='text-[11px] opacity-70'>Label</div>
                      <Input className='h-9 bg-black/30 border-white/10 text-white' value={s.label} onChange={(e) => updateStop(s.id, { label: e.target.value })} />
                      <div className='flex items-center justify-between gap-2'>
                        <div className='text-[11px] opacity-70'>WayID (AWB)</div>
                        <div className='flex items-center gap-2'>
                          <div className='text-[11px] opacity-70'>Lock</div>
                          <Switch checked={Boolean(s.lockWayId)} onCheckedChange={(v) => updateStop(s.id, { lockWayId: Boolean(v) })} />
                        </div>
                      </div>
                      <Input className='h-9 bg-black/30 border-white/10 text-white font-mono' value={s.wayId || ''} placeholder={parsed || 'AUTO from label'} onChange={(e) => updateStop(s.id, { wayId: normalizeWayId(e.target.value), lockWayId: true })} />
                      <div className='text-[11px] opacity-70'>Parsed from label: <span className='font-mono'>{parsed || '-'}</span></div>
                      <div className='flex gap-2'>
                        <Button size='sm' className='bg-emerald-600 hover:bg-emerald-500' onClick={() => setEditingId(null)}><Check className='h-4 w-4 mr-2' />Done</Button>
                        <Button size='sm' variant='outline' onClick={() => updateStop(s.id, { lockWayId: false, wayId: null })}><X className='h-4 w-4 mr-2' />Reset</Button>
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>

          <Separator className='bg-white/10' />
          <div className='flex gap-2 flex-wrap'>
            <Button variant='outline' onClick={() => { setStops([]); setEditingId(null); setNavIndex(0); arrivedRef.current = {}; }}>Clear</Button>
            <Button variant='outline' onClick={planDirections}><Route className='h-4 w-4 mr-2' />Directions</Button>
            <Button variant='outline' onClick={optimizeRoute}><ShieldCheck className='h-4 w-4 mr-2' />Optimize</Button>
          </div>
          {routeInfo ? (<div className='text-xs opacity-80'>Route: {metersToKm(routeInfo.distance)} • {secondsToMin(routeInfo.duration)}</div>) : null}
        </div>
      </div>

      <div className='rounded-2xl overflow-hidden border border-white/10 bg-white/5'>
        <div ref={mapContainer} className='h-[72vh] w-full' />
      </div>
    </div>
  );
}

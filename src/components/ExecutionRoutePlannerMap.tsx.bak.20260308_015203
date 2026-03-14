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

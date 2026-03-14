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

  const token = useMemo(() => import.meta.env.VITE_MAPBOX_TOKEN as string | undefined, []);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError("Missing Mapbox token. Set VITE_MAPBOX_TOKEN in .env and restart the dev server.");
      return;
    }

    if (!mapContainerRef.current) return;

    // Avoid double-init in React 18 StrictMode (dev)
    if (mapRef.current) return;

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
        // Helps surface style/token/CORS issues instead of a silent blank screen
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
          border: "1px solid rgba(0,0,0,0.15)",
          borderRadius: 12,
          padding: 16,
        }}
      >
        <div style={{ maxWidth: 700 }}>
          <h2 style={{ margin: 0, marginBottom: 8 }}>Map unavailable</h2>
          <p style={{ margin: 0, opacity: 0.85 }}>{error}</p>
        </div>
      </div>
    );
  }

  // Height is REQUIRED; otherwise you can get a blank/black view
  return (
    <div
      ref={mapContainerRef}
      className={className}
      style={{ width: "100%", height: 500, borderRadius: 12, overflow: "hidden" }}
    />
  );
}
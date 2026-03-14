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

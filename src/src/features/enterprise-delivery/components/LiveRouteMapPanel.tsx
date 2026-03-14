import React from "react";
import { MapContainer, Marker, Polyline, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

export type RouteStop = {
  id: string;
  label: string;
  lat: number;
  lng: number;
  status?: string;
  eta?: string;
};

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function centerFromPoints(points: Array<{ lat: number; lng: number }>) {
  if (!points.length) return [16.8661, 96.1951] as [number, number];
  const total = points.reduce(
    (acc, item) => ({ lat: acc.lat + item.lat, lng: acc.lng + item.lng }),
    { lat: 0, lng: 0 }
  );
  return [total.lat / points.length, total.lng / points.length] as [number, number];
}

export default function LiveRouteMapPanel({
  rider,
  stops,
  heightClassName = "h-[420px]",
}: {
  rider: { label: string; lat: number; lng: number };
  stops: RouteStop[];
  heightClassName?: string;
}) {
  const points = [rider, ...stops];
  const center = centerFromPoints(points);
  const polyline = points.map((p) => [p.lat, p.lng] as [number, number]);

  return (
    <div className={`overflow-hidden rounded-3xl border border-white/10 bg-[#0B1220] shadow-2xl ${heightClassName}`}>
      <MapContainer center={center} zoom={8} className="h-full w-full">
        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />

        <Marker position={[rider.lat, rider.lng]}>
          <Popup>
            <div className="font-semibold">{rider.label}</div>
            <div className="text-xs text-slate-600">Live rider location</div>
          </Popup>
        </Marker>

        {stops.map((stop) => (
          <Marker key={stop.id} position={[stop.lat, stop.lng]}>
            <Popup>
              <div className="font-semibold">{stop.label}</div>
              <div className="text-xs text-slate-600">{stop.status || "Scheduled stop"}</div>
              {stop.eta ? <div className="text-xs text-slate-600">ETA: {stop.eta}</div> : null}
            </Popup>
          </Marker>
        ))}

        {polyline.length >= 2 ? <Polyline positions={polyline} pathOptions={{ color: "#10b981", weight: 4 }} /> : null}
      </MapContainer>
    </div>
  );
}

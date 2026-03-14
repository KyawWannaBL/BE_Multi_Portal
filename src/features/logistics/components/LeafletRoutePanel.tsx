import { MapContainer, TileLayer, Marker, Polyline, Popup } from "react-leaflet";
import type { RoutePlan } from "../types";
import "leaflet/dist/leaflet.css";

export function LeafletRoutePanel({ plan }: { plan?: RoutePlan | null }) {
  if (!plan || !Array.isArray(plan.stops) || plan.stops.length === 0) {
    return (
      <div className="flex min-h-[420px] items-center justify-center rounded-xl border">
        <p className="text-sm text-muted-foreground">No route generated yet.</p>
      </div>
    );
  }

  const firstStop = plan.stops[0];
  const center: [number, number] = [firstStop.lat, firstStop.lng];

  const points: [number, number][] = plan.stops.map((stop) => [
    stop.lat,
    stop.lng,
  ]);

  return (
    <div className="overflow-hidden rounded-xl border">
      <MapContainer center={center} zoom={12} style={{ height: 420, width: "100%" }}>
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {points.length > 1 ? <Polyline positions={points} /> : null}

        {plan.stops.map((stop, idx) => (
          <Marker key={stop.parcelId} position={[stop.lat, stop.lng]}>
            <Popup>
              <div className="text-sm">
                <div className="font-semibold">
                  #{idx + 1} - {stop.customerName}
                </div>
                <div>{stop.township}</div>
                <div>Parcel: {stop.parcelId}</div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default LeafletRoutePanel;
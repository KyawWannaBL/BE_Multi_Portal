import React, { useMemo } from 'react';
import { MapContainer, Marker, Popup, Polyline, TileLayer, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

type Point = {
  lat: number;
  lng: number;
  label?: string;
  status?: string;
  eta?: string;
};

const riderIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function LeafletRoutePanel({
  rider,
  stops,
  route,
  height = 420,
}: {
  rider?: Point | null;
  stops?: Point[];
  route?: Array<[number, number]>;
  height?: number;
}) {
  const stopPoints = useMemo(
    () => (stops || []).filter((s) => Number.isFinite(s?.lat) && Number.isFinite(s?.lng)),
    [stops]
  );

  const routePoints = useMemo(() => {
    if (Array.isArray(route) && route.length) return route;
    const derived: Array<[number, number]> = [];
    if (rider?.lat && rider?.lng) derived.push([rider.lat, rider.lng]);
    stopPoints.forEach((s) => derived.push([s.lat, s.lng]));
    return derived;
  }, [route, rider, stopPoints]);

  const center = useMemo<[number, number]>(() => {
    if (rider?.lat && rider?.lng) return [rider.lat, rider.lng];
    if (stopPoints[0]) return [stopPoints[0].lat, stopPoints[0].lng];
    return [16.8409, 96.1735];
  }, [rider, stopPoints]);

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10">
      <MapContainer center={center} zoom={12} style={{ height, width: '100%' }} scrollWheelZoom>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        />

        {routePoints.length > 1 ? <Polyline positions={routePoints} /> : null}

        {rider?.lat && rider?.lng ? (
          <Marker position={[rider.lat, rider.lng]} icon={riderIcon}>
            <Popup>
              <div>
                <div><strong>{rider.label || 'Rider'}</strong></div>
                <div>{rider.lat}, {rider.lng}</div>
                {rider.status ? <div>Status: {rider.status}</div> : null}
              </div>
            </Popup>
          </Marker>
        ) : null}

        {stopPoints.map((stop, index) => (
          <CircleMarker key={`${stop.lat}-${stop.lng}-${index}`} center={[stop.lat, stop.lng]} radius={8}>
            <Popup>
              <div>
                <div><strong>{stop.label || `Stop ${index + 1}`}</strong></div>
                {stop.status ? <div>Status: {stop.status}</div> : null}
                {stop.eta ? <div>ETA: {stop.eta}</div> : null}
                <div>{stop.lat}, {stop.lng}</div>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}

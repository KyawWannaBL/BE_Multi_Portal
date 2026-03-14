import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default Leaflet marker icons
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Initial Mock GPS coordinates for Yangon
const initialRiders = [
  { id: 'RDR-001', name: 'Ko Aung Myat', lat: 16.8409, lng: 96.1735, status: 'On Route' },
  { id: 'RDR-002', name: 'U Kyaw Win', lat: 16.8162, lng: 96.1291, status: 'Delayed' },
  { id: 'RDR-005', name: 'Ma Thida', lat: 16.8661, lng: 96.1425, status: 'Returning' },
];

export default function LiveRiderMap() {
  const [riders, setRiders] = useState(initialRiders);

  // Simulate Live GPS Movement
  useEffect(() => {
    const interval = setInterval(() => {
      setRiders(prevRiders => prevRiders.map(rider => ({
        ...rider,
        // Move latitude and longitude randomly by a tiny margin to simulate driving
        lat: rider.lat + (Math.random() - 0.5) * 0.001,
        lng: rider.lng + (Math.random() - 0.5) * 0.001,
      })));
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <MapContainer center={[16.8409, 96.1435]} zoom={12} className="h-full w-full z-0">
      {/* Dark Mode CartoDB Map Tiles */}
      <TileLayer 
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" 
        attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
      />
      {riders.map(rider => (
        <Marker key={rider.id} position={[rider.lat, rider.lng]}>
          <Popup>
            <div className="p-1 font-mono text-[10px] uppercase">
              <p className="font-black text-blue-600">{rider.name}</p>
              <p className="text-gray-500">{rider.id}</p>
              <p className={`mt-1 font-bold ${rider.status === 'Delayed' ? 'text-amber-500' : 'text-emerald-500'}`}>
                {rider.status}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

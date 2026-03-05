import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import L from 'leaflet';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

type Order = {
  id: string;
  latitude: number;
  longitude: number;
  status: string;
};

export default function RealTimeMapView() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('orders')
        .select('id, latitude, longitude, status');

      if (data) setOrders(data as Order[]);
    };

    load();

    const channel = supabase
      .channel('orders-live')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        load
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="h-[500px] rounded-xl overflow-hidden border">
      <MapContainer
        center={[16.8661, 96.1561]}
        zoom={11}
        className="h-full w-full"
      >
        <TileLayer
          attribution="© OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {orders.map((o) => (
          <Marker key={o.id} position={[o.latitude, o.longitude]}>
            <Popup>
              <strong>Status:</strong> {o.status}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

// Set your Mapbox Access Token
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || '';

export default function RealTimeMapView({ city }: { city: string }) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize Map with Luxury Theme (Dark)
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/navigation-night-v1',
      center: [96.1561, 16.8661], // Default Yangon
      zoom: 11
    });

    map.current.addControl(new mapboxgl.NavigationControl());

    return () => map.current?.remove();
  }, []);

  useEffect(() => {
    const fetchAndPlot = async () => {
      const { data } = await supabase
        .from('orders')
        .select('id, township, route_sequence, latitude, longitude')
        .eq('city', city)
        .order('route_sequence', { ascending: true });

      if (data) {
        setOrders(data);
        updateMapRoute(data);
      }
    };

    fetchAndPlot();

    // REAL-TIME SUBSCRIPTION
    const channel = supabase
      .channel('map-updates')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, fetchAndPlot)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [city]);

  const updateMapRoute = (nodes: any[]) => {
    if (!map.current) return;

    const coordinates = nodes
      .filter(o => o.latitude && o.longitude)
      .map(o => [o.longitude, o.latitude] as [number, number]);

    // Update or Add Path Source
    const source = map.current.getSource('route') as mapboxgl.GeoJSONSource;
    const geojson: any = {
      type: 'Feature',
      geometry: { type: 'LineString', coordinates }
    };

    if (source) {
      source.setData(geojson);
    } else {
      map.current.addSource('route', { type: 'geojson', data: geojson });
      map.current.addLayer({
        id: 'route-line',
        type: 'line',
        source: 'route',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: { 'line-color': '#D4AF37', 'line-width': 4, 'line-opacity': 0.8 }
      });
    }
  };

  return (
    <div className="luxury-card overflow-hidden h-[500px] relative">
      <div ref={mapContainer} className="absolute inset-0" />
      <div className="absolute top-4 left-4 z-10 luxury-glass p-3 rounded-lg border border-luxury-gold/20">
        <h4 className="text-luxury-gold font-bold text-sm uppercase tracking-wider">Live Route: {city}</h4>
        <p className="text-[10px] text-white/50">{orders.length} Sequenced Stops</p>
      </div>
    </div>
  );
}
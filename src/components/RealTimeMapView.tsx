// src/components/RealTimeMapView.tsx
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/lib/supabase';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || '';

export default function RealTimeMapView({ city }: { city: string }) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<{ [key: string]: mapboxgl.Marker }>({});

  useEffect(() => {
    if (!mapContainer.current) return;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/navigation-night-v1',
      center: [96.1561, 16.8661],
      zoom: 11,
      pitch: 45
    });

    return () => map.current?.remove();
  }, []);

  useEffect(() => {
    const syncMarkers = async () => {
      const { data: orders } = await supabase
        .from('orders')
        .select('id, latitude, longitude, status, route_sequence')
        .eq('city', city);

      if (!orders || !map.current) return;

      orders.forEach((order) => {
        if (!order.latitude || !order.longitude) return;

        // If marker exists, update it. If not, create it.
        if (markers.current[order.id]) {
          markers.current[order.id].setLngLat([order.longitude, order.latitude]);
        } else {
          // Create a custom HTML element for the marker
          const el = document.createElement('div');
          el.className = 'marker';
          
          // Color logic based on status
          const color = order.status === 'delivered' ? '#10b981' : 
                        order.status === 'in_transit' ? '#3b82f6' : '#D4AF37';
          
          el.innerHTML = `
            <div style="background: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px ${color};">
              <span style="position: absolute; top: -15px; left: 50%; transform: translateX(-50%); font-size: 8px; font-weight: bold; color: white; white-space: nowrap;">
                ${order.route_sequence || ''}
              </span>
            </div>
          `;

          markers.current[order.id] = new mapboxgl.Marker(el)
            .setLngLat([order.longitude, order.latitude])
            .addTo(map.current!);
        }
      });
    };

    syncMarkers();
    const channel = supabase.channel('live-markers').on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, syncMarkers).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [city]);

  return (
    <div className="luxury-card overflow-hidden h-[500px] relative">
      <div ref={mapContainer} className="absolute inset-0" />
    </div>
  );
}
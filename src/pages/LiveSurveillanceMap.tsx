import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, Navigation, Fuel, Gauge, Globe, ShieldCheck } from 'lucide-react';

// Enterprise Icon Configuration
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function LiveSurveillanceMap() {
  const { lang, toggleLang } = useLanguage();
  const [fleet] = useState([
    { id: 'T-99', plate: 'YGN-7B/4820', lat: 16.8661, lng: 96.1561, fuel: 82, speed: 65, status: 'IN_TRANSIT' },
    { id: 'T-42', plate: 'MDY-2D/1109', lat: 21.9588, lng: 96.0891, fuel: 54, speed: 0, status: 'IDLE' }
  ]);

  return (
    <div className="flex h-screen bg-[#0B101B] text-slate-300 overflow-hidden">
      {/* Telemetry Sidebar (တဲလီမီထရီ စောင့်ကြည့်မှု) */}
      <div className="w-96 bg-[#05080F] border-r border-white/5 p-8 overflow-y-auto">
        <h1 className="text-2xl font-black text-white flex items-center gap-3 italic">
          <Activity className="text-emerald-500 animate-pulse" /> 
          {lang === 'en' ? 'SURVEILLANCE' : 'စောင့်ကြည့်စနစ်'}
        </h1>
        <div className="mt-8 space-y-4">
          {fleet.map((asset) => (
            <Card key={asset.id} className="bg-[#0B101B] border-white/5 hover:border-emerald-500/50 transition-all cursor-pointer p-4">
              <div className="flex justify-between items-start mb-3">
                <span className="font-black text-white text-sm">{asset.plate}</span>
                <span className="bg-emerald-500/10 text-emerald-500 text-[9px] px-2 py-1 rounded font-black uppercase">{asset.status}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-[10px] font-mono text-slate-500">
                <div className="flex items-center gap-2"><Fuel size={12} className="text-amber-500"/> {asset.fuel}%</div>
                <div className="flex items-center gap-2"><Gauge size={12} className="text-sky-500"/> {asset.speed} km/h</div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Main Map Engine */}
      <div className="flex-1 relative">
        <div className="absolute top-10 right-10 z-[1000] flex gap-4">
          <Button onClick={toggleLang} className="bg-emerald-600 text-white font-black px-8 rounded-2xl shadow-xl">
             <Globe className="mr-2 h-4 w-4" /> {lang === 'en' ? "မြန်မာစာ" : "English"}
          </Button>
        </div>
        <MapContainer center={[16.8661, 96.1561]} zoom={6} className="h-full w-full">
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
          {fleet.map((asset) => (
            <Marker key={asset.id} position={[asset.lat, asset.lng]}>
              <Popup>
                <div className="font-black text-black">{asset.plate}</div>
                <div className="text-[10px] text-slate-600 uppercase">Status: {asset.status}</div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}

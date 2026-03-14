import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Navigation, Truck, Battery, Signal, 
  Search, Globe, ArrowLeft, Target, 
  Activity, ShieldAlert 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function FleetSurveillance() {
  const { lang, toggleLang } = useLanguage();
  const navigate = useNavigate();

  const fleet = [
    { id: 'RDR-201', name: 'Zayar Min', status: 'ACTIVE', battery: 84, lat: 16.8661, lng: 96.1561 },
    { id: 'RDR-205', name: 'Kyaw Kyaw', status: 'IDLE', battery: 12, lat: 16.8441, lng: 96.1761 }
  ];

  return (
    <div className="flex h-screen bg-[#0B101B] text-slate-300 overflow-hidden">
      {/* Telemetry Sidebar (တဲလီမီထရီ စောင့်ကြည့်မှု) */}
      <div className="w-96 bg-[#05080F] border-r border-white/5 p-8 overflow-y-auto">
        <div className="flex items-center gap-4 mb-10">
          <Button onClick={() => navigate(-1)} variant="ghost" className="p-0 text-slate-500"><ArrowLeft size={24}/></Button>
          <h1 className="text-xl font-black text-white uppercase italic tracking-tighter">
            {lang === 'en' ? 'Fleet Live' : 'ယာဉ်တန်း စောင့်ကြည့်မှု'}
          </h1>
        </div>
        
        <div className="space-y-4">
          {fleet.map((rider) => (
            <Card key={rider.id} className="bg-[#0B101B] border-white/5 p-5 hover:border-indigo-500/50 cursor-pointer transition-all">
              <div className="flex justify-between items-start mb-4">
                <div>
                   <p className="text-white font-bold text-sm">{rider.name}</p>
                   <p className="text-[10px] text-slate-500 font-mono uppercase">{rider.id}</p>
                </div>
                <span className={`text-[8px] font-black px-2 py-1 rounded border ${rider.status === 'ACTIVE' ? 'border-emerald-500 text-emerald-500' : 'border-amber-500 text-amber-500'}`}>
                  {rider.status}
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono">
                 <div className="flex items-center gap-2"><Battery size={12} className={rider.battery < 20 ? 'text-rose-500' : 'text-emerald-500'}/> {rider.battery}%</div>
                 <div className="flex items-center gap-2 text-sky-500"><Target size={12}/> {lang === 'en' ? 'Locate' : 'ရှာဖွေမည်'}</div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Map Engine (Mapbox Integration) */}
      <div className="flex-1 relative">
        <div className="absolute top-10 right-10 z-[1000] flex gap-4">
          <Button onClick={toggleLang} className="bg-white/5 border border-white/10 text-white h-12 px-6 rounded-xl shadow-2xl backdrop-blur-xl">
             <Globe className="mr-2 h-4 w-4" /> {lang === 'en' ? "MY" : "EN"}
          </Button>
        </div>
        <div className="h-full w-full bg-[#0B101B] flex items-center justify-center opacity-30">
           <Navigation size={80} className="text-indigo-500 animate-pulse" />
           <p className="absolute bottom-10 font-mono text-[10px] text-slate-600 uppercase tracking-widest">Mapbox_Engine_L4_Live</p>
        </div>
      </div>
    </div>
  );
}

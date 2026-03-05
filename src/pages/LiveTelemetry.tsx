import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Truck, MapPin, Gauge, Fuel, Navigation, Activity, Globe, Search } from 'lucide-react';

export default function LiveTelemetry() {
  const { toggleLang, lang } = useLanguage();
  
  // Mock Telemetry Data (Bilingual)
  const activeAssets = [
    { id: 'T-99', plate: 'YGN-7B/4820', status: 'IN_USE', fuel: 82, locEn: 'Hwy 1: Mile 155', locMy: 'အမြန်လမ်း-မိုင် ၁၅၅' },
    { id: 'T-42', plate: 'MDY-2D/1109', status: 'ACTIVE', fuel: 54, locEn: 'Mandalay Hub', locMy: 'မန္တလေး ဗဟိုဌာန' },
    { id: 'T-12', plate: 'NPT-9A/7732', status: 'MAINTENANCE', fuel: 15, locEn: 'Service Depot', locMy: 'ပြုပြင်ထိန်းသိမ်းရေးစခန်း' }
  ];

  return (
    <div className="flex h-screen bg-[#0B101B] text-slate-300">
      {/* Sidebar: Surveillance Control (စောင့်ကြည့်ရေး ထိန်းချုပ်မှု) */}
      <div className="w-96 bg-[#05080F] border-r border-white/5 p-8 overflow-y-auto">
        <h1 className="text-2xl font-black text-white flex items-center gap-3 italic">
          <Activity className="text-emerald-500 animate-pulse" /> 
          {lang === 'en' ? 'LIVE TELEMETRY' : 'တိုက်ရိုက် စောင့်ကြည့်စနစ်'}
        </h1>
        
        <div className="mt-8 space-y-4">
          {activeAssets.map((asset) => (
            <Card key={asset.id} className="bg-[#0B101B] border-white/5 hover:border-emerald-500/50 transition-all cursor-pointer">
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="font-black text-white">{asset.plate}</span>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded-md font-black uppercase">
                    {asset.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 text-[10px] font-bold">
                  <div className="flex items-center gap-2"><Fuel size={12} className="text-amber-500"/> {asset.fuel}%</div>
                  <div className="flex items-center gap-2"><Gauge size={12} className="text-sky-500"/> 65 km/h</div>
                </div>
                <p className="text-[11px] text-slate-500 flex items-center gap-2">
                  <MapPin size={12}/> {lang === 'en' ? asset.locEn : asset.locMy}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Main Map View (မြေပုံစနစ်) */}
      <div className="flex-1 relative">
        <div className="absolute top-10 right-10 z-50">
          <Button onClick={toggleLang} className="bg-emerald-600 text-white font-black px-6 rounded-2xl shadow-xl">
             <Globe className="mr-2 h-4 w-4" /> {lang === 'en' ? "မြန်မာစာ" : "English"}
          </Button>
        </div>

        <div className="absolute inset-0 bg-[#0B101B] flex items-center justify-center">
           {/* Placeholder for Mapbox Engine */}
           <div className="text-center opacity-20">
              <Navigation size={80} className="mx-auto mb-4 text-emerald-500 rotate-45" />
              <p className="text-xl font-black uppercase tracking-[0.4em]">Map Engine Active</p>
           </div>
        </div>

        {/* Global Stats Overlay */}
        <div className="absolute bottom-10 left-10 right-10 grid grid-cols-3 gap-6">
           <div className="bg-[#05080F]/90 backdrop-blur-xl p-6 rounded-[2rem] border border-white/5">
              <p className="text-[10px] font-black text-slate-500 uppercase">{lang === 'en' ? 'Active Fleet' : 'လက်ရှိပြေးဆွဲနေသည့်ယာဉ်များ'}</p>
              <p className="text-2xl font-black text-white">334 Units</p>
           </div>
           <div className="bg-[#05080F]/90 backdrop-blur-xl p-6 rounded-[2rem] border border-white/5">
              <p className="text-[10px] font-black text-slate-500 uppercase">{lang === 'en' ? 'Fuel Consumption' : 'လောင်စာဆီ သုံးစွဲမှု'}</p>
              <p className="text-2xl font-black text-white">4.2 km/L</p>
           </div>
           <div className="bg-rose-500/10 backdrop-blur-xl p-6 rounded-[2rem] border border-rose-500/20">
              <p className="text-[10px] font-black text-rose-500 uppercase">{lang === 'en' ? 'Emergency Alerts' : 'အရေးပေါ်သတိပေးချက်'}</p>
              <p className="text-2xl font-black text-rose-500">02 Critical</p>
           </div>
        </div>
      </div>
    </div>
  );
}

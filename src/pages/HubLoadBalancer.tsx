import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Network, ArrowLeftRight, Activity, MapPin, Globe } from 'lucide-react';

export default function HubLoadBalancer() {
  const { toggleLang, lang } = useLanguage();
  const hubs = [
    { name: 'Yangon Main', load: 88, status: 'HIGH', color: 'text-rose-500' },
    { name: 'Mandalay North', load: 42, status: 'STABLE', color: 'text-emerald-500' }
  ];

  return (
    <div className="p-10 space-y-10 bg-[#0B101B] min-h-screen text-slate-300">
      <div className="flex justify-between items-center bg-[#05080F] p-10 rounded-[3rem] border border-white/5">
        <div className="flex items-center gap-6">
          <Network className="h-8 w-8 text-sky-500" />
          <h1 className="text-3xl font-black text-white uppercase italic">{lang === 'en' ? 'Hub Load Balancer' : 'ဗဟိုဌာန ဝန်အားထိန်းညှိစနစ်'}</h1>
        </div>
        <Button onClick={toggleLang} className="bg-white/5 border border-white/10 text-white h-12 px-8 rounded-xl"><Globe className="mr-2 h-4 w-4" /> {lang === 'en' ? "မြန်မာစာ" : "English"}</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {hubs.map((hub, i) => (
          <Card key={i} className="bg-[#05080F] border-none ring-1 ring-white/5 rounded-[3rem] p-10 space-y-4">
            <h3 className="text-2xl font-black text-white">{hub.name}</h3>
            <p className={`${hub.color} font-bold`}>{hub.load}% {lang === 'en' ? 'Capacity' : 'ဝန်အား'}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

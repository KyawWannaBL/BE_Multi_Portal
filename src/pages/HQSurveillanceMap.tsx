import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Map, Crosshair, MapPin, Navigation, ShieldCheck } from 'lucide-react';

export default function HQSurveillanceMap() {
  const [activeRegion, setActiveRegion] = useState('GLOBAL_HQ');

  return (
    <div className="p-10 space-y-8 bg-[#0B101B] min-h-screen text-slate-300">
      <div className="flex justify-between items-center bg-[#05080F] p-10 rounded-[3rem] border border-white/5 shadow-2xl">
        <div>
          <h1 className="text-4xl font-black uppercase text-white flex items-center gap-4">
            <Map className="h-10 w-10 text-rose-500" /> Live Surveillance
          </h1>
          <p className="text-rose-500 font-mono text-xs mt-2 tracking-widest uppercase flex items-center gap-2">
            <ShieldCheck className="h-3 w-3" /> L5_COMMAND • MULTI-REGION TELEMETRY
          </p>
        </div>
        <div className="flex gap-2 bg-[#0B101B] p-2 rounded-2xl border border-white/5">
          <Button 
            onClick={() => setActiveRegion('GLOBAL_HQ')}
            className={`rounded-xl px-6 ${activeRegion === 'GLOBAL_HQ' ? 'bg-rose-600 text-white font-black' : 'bg-transparent text-slate-400 hover:text-white'}`}
          >
            All Regions
          </Button>
          <Button 
            onClick={() => setActiveRegion('MANDALAY')}
            className={`rounded-xl px-6 ${activeRegion === 'MANDALAY' ? 'bg-amber-600 text-white font-black' : 'bg-transparent text-slate-400 hover:text-white'}`}
          >
            Mandalay (MDY)
          </Button>
          <Button 
            onClick={() => setActiveRegion('NAYPYITAW')}
            className={`rounded-xl px-6 ${activeRegion === 'NAYPYITAW' ? 'bg-emerald-600 text-white font-black' : 'bg-transparent text-slate-400 hover:text-white'}`}
          >
            Naypyitaw (NPT)
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 rounded-[2.5rem] bg-[#05080F] border-none ring-1 ring-white/5 overflow-hidden h-[600px] relative">
          {/* Simulated Map Background */}
          <div className="absolute inset-0 bg-[#0B101B] opacity-50 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-800 to-[#0B101B]"></div>
          <div className="absolute inset-0 flex items-center justify-center flex-col text-slate-500">
            <Crosshair className="h-16 w-16 mb-4 opacity-20 animate-pulse" />
            <p className="font-mono text-sm tracking-widest uppercase">Targeting {activeRegion} Coordinates...</p>
          </div>
          <div className="absolute top-6 left-6 bg-[#0B101B]/80 backdrop-blur-md p-4 rounded-2xl border border-white/10">
            <p className="text-white font-black flex items-center gap-2"><Navigation className="h-4 w-4 text-sky-400"/> Active Fleet: {activeRegion === 'GLOBAL_HQ' ? '142' : '38'} Riders</p>
          </div>
        </Card>

        <Card className="rounded-[2.5rem] bg-[#05080F] border-none ring-1 ring-white/5 p-8 flex flex-col gap-6">
          <h3 className="text-xl font-black text-white uppercase tracking-widest border-b border-white/10 pb-4">Region Metrics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl"><span className="text-slate-400">Total Waypoints</span><span className="text-white font-black">1,204</span></div>
            <div className="flex justify-between items-center p-4 bg-amber-500/10 rounded-2xl"><span className="text-amber-500">In Transit</span><span className="text-amber-500 font-black">482</span></div>
            <div className="flex justify-between items-center p-4 bg-emerald-500/10 rounded-2xl"><span className="text-emerald-500">Delivered Today</span><span className="text-emerald-500 font-black">722</span></div>
            <div className="flex justify-between items-center p-4 bg-rose-500/10 rounded-2xl"><span className="text-rose-500">Geofence Alerts</span><span className="text-rose-500 font-black">3</span></div>
          </div>
          <Button className="w-full mt-auto bg-white/10 hover:bg-white/20 text-white font-bold h-14 rounded-xl">Ping All {activeRegion} Riders</Button>
        </Card>
      </div>
    </div>
  );
}

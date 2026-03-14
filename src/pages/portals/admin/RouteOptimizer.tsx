import React, { useState } from 'react';
import { AdminShell } from '@/components/layout/AdminShell';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  MapPin, Navigation, Play, 
  ArrowDown, Fuel, Clock, Save 
} from 'lucide-react';

export default function RouteOptimizer() {
  const { lang } = useLanguage();
  const t = (en: string, my: string) => (lang === 'en' ? en : my);

  const [stops, setStops] = useState([
    { id: 1, city: 'Yangon (Hub)', type: 'START' },
    { id: 2, city: 'Bago', type: 'WAYPOINT' },
    { id: 3, city: 'Pyay', type: 'WAYPOINT' },
    { id: 4, city: 'Magway', type: 'WAYPOINT' },
    { id: 5, city: 'Mandalay (Dest)', type: 'END' },
  ]);

  const [isOptimizing, setIsOptimizing] = useState(false);

  const handleOptimize = () => {
    setIsOptimizing(true);
    // Simulate Route Optimization Logic (Greedy Algorithm)
    setTimeout(() => {
      setIsOptimizing(false);
      alert("Route Sequence Optimized for Fuel Efficiency!");
    }, 1500);
  };

  return (
    <AdminShell title={t("Route Optimization", "လမ်းကြောင်း အကောင်းဆုံးပြုပြင်ခြင်း")}>
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 animate-in fade-in duration-500">
        
        {/* Left Side: Route Controls */}
        <div className="xl:col-span-4 space-y-6">
          <div className="bg-[#0E1525] border border-white/5 p-8 rounded-[2.5rem] shadow-2xl">
            <h3 className="text-xs font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
              <Navigation className="h-4 w-4 text-blue-500" /> {t("Trip Planner", "ခရီးစဉ် ရေးဆွဲသူ")}
            </h3>
            
            <div className="space-y-3">
              {stops.map((stop, index) => (
                <div key={stop.id} className="group">
                  <div className="flex items-center gap-4 bg-[#0A0F1C] p-4 rounded-2xl border border-white/5 group-hover:border-blue-500/30 transition-all">
                    <div className={`p-2 rounded-lg ${stop.type === 'START' ? 'bg-emerald-500/10 text-emerald-500' : stop.type === 'END' ? 'bg-rose-500/10 text-rose-500' : 'bg-blue-500/10 text-blue-500'}`}>
                      <MapPin size={14} />
                    </div>
                    <span className="text-xs font-bold text-white">{stop.city}</span>
                  </div>
                  {index < stops.length - 1 && (
                    <div className="flex justify-center py-1">
                      <ArrowDown size={12} className="text-gray-700" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button 
              onClick={handleOptimize}
              disabled={isOptimizing}
              className="w-full mt-8 h-14 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900 text-white font-black text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-600/20"
            >
              {isOptimizing ? <span className="animate-pulse">Calculating Path...</span> : <><Play size={16} /> Optimize Sequence</>}
            </button>
          </div>
        </div>

        {/* Right Side: Efficiency Stats & Map Preview */}
        <div className="xl:col-span-8 space-y-6">
          <div className="grid grid-cols-2 gap-6">
             <div className="bg-[#0E1525] border border-white/5 p-6 rounded-[2rem] flex items-center gap-4">
                <div className="p-4 bg-emerald-500/10 rounded-2xl"><Fuel className="text-emerald-500" /></div>
                <div>
                   <p className="text-[10px] font-black text-gray-500 uppercase">Estimated Savings</p>
                   <p className="text-xl font-black text-white">12% Fuel</p>
                </div>
             </div>
             <div className="bg-[#0E1525] border border-white/5 p-6 rounded-[2rem] flex items-center gap-4">
                <div className="p-4 bg-blue-500/10 rounded-2xl"><Clock className="text-blue-500" /></div>
                <div>
                   <p className="text-[10px] font-black text-gray-500 uppercase">Time Reduction</p>
                   <p className="text-xl font-black text-white">4.5 Hours</p>
                </div>
             </div>
          </div>

          <div className="bg-[#0E1525] border border-white/5 rounded-[2.5rem] h-[450px] overflow-hidden relative">
             {/* Map Placeholder */}
             <div className="absolute inset-0 bg-[#0A0F1C] flex flex-col items-center justify-center opacity-40">
                <Navigation className="h-12 w-12 text-gray-700 mb-4 animate-bounce" />
                <p className="text-[10px] font-black text-gray-700 uppercase tracking-widest">Map Engine Ready</p>
             </div>
             <div className="absolute top-6 left-6 z-10">
                <span className="px-4 py-2 bg-blue-600 text-white text-[10px] font-black rounded-full uppercase shadow-lg">Live Route: YGN - MDL</span>
             </div>
          </div>
        </div>

      </div>
    </AdminShell>
  );
}

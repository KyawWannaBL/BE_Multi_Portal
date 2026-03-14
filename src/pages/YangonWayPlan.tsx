import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Navigation, Route, Zap, Globe, 
  MapPin, Clock, Fuel, CheckCircle2, UserPlus 
} from 'lucide-react';

export default function YangonWayPlan() {
  const { toggleLang, lang } = useLanguage();
  const [isLive, setIsLive] = useState(false);

  // Optimized Sequence for Yangon High-Density Zones
  const ygnSequence = [
    { stop: 1, id: 'BE-YGN-901', area: 'Hlaing Township', type: 'PICKUP', assignee: 'Zayar Min' },
    { stop: 2, id: 'BE-YGN-905', area: 'North Okkalapa', type: 'DELIVERY', assignee: 'Kyaw Kyaw' },
    { stop: 3, id: 'BE-YGN-909', area: 'Kamayut Township', type: 'DELIVERY', assignee: 'Aung Ko' }
  ];

  return (
    <div className="p-10 space-y-10 bg-[#0B101B] min-h-screen text-slate-300">
      <div className="flex justify-between items-center bg-[#05080F] p-10 rounded-[3rem] border border-white/5 shadow-2xl">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-sky-500/10 rounded-2xl border border-sky-500/20">
            <Navigation className="h-8 w-8 text-sky-500" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">
              {lang === 'en' ? 'Yangon Sovereign Dispatch' : 'ရန်ကုန် ပို့ဆောင်ရေး စီမံခန့်ခွဲမှု'}
            </h1>
            <p className="text-sky-500 font-mono text-[10px] mt-1 uppercase tracking-widest italic">
              HUB_CODE: YGN-MAIN • {lang === 'en' ? 'LIVE_SYNC_ENABLED' : 'တိုက်ရိုက်_ချိတ်ဆက်ထားသည်'}
            </p>
          </div>
        </div>
        <Button onClick={toggleLang} className="bg-white/5 border border-white/10 text-white h-12 px-8 rounded-xl shadow-lg">
           <Globe className="mr-2 h-4 w-4" /> {lang === 'en' ? "မြန်မာစာ" : "English"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 bg-[#05080F] border-none ring-1 ring-white/5 rounded-[3rem] overflow-hidden min-h-[500px] relative">
           <div className="absolute inset-0 bg-[#0B101B] flex items-center justify-center opacity-40">
              <Route size={80} className="text-sky-500 animate-pulse" />
           </div>
           <div className="absolute top-6 left-6 bg-[#05080F]/90 backdrop-blur-xl p-6 rounded-2xl border border-white/5 space-y-4">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Assignee Status</p>
              <div className="space-y-2">
                 {['Zayar Min', 'Kyaw Kyaw'].map(name => (
                   <div key={name} className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      <span className="text-xs text-white font-bold uppercase">{name} - Online</span>
                   </div>
                 ))}
              </div>
           </div>
        </Card>

        <Card className="bg-[#05080F] border-none ring-1 ring-white/5 rounded-[3rem] p-10 flex flex-col">
          <h2 className="text-xl font-black text-white uppercase italic mb-8 flex items-center gap-3">
             <UserPlus className="text-amber-500" /> {lang === 'en' ? 'Dispatch Console' : 'တာဝန်ပေးအပ်မှု စင်တာ'}
          </h2>
          
          <div className="space-y-4 flex-1">
             {ygnSequence.map((step) => (
               <div key={step.id} className="p-4 bg-[#0B101B] rounded-2xl border border-white/5 hover:border-sky-500/30 transition-all group">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-black text-sky-500 uppercase font-mono">{step.id}</span>
                    <span className="bg-white/5 text-slate-500 text-[8px] px-2 py-1 rounded uppercase">{step.type}</span>
                  </div>
                  <p className="text-white font-bold text-xs mt-1">{step.area}</p>
                  <p className="text-[9px] text-slate-500 mt-2 italic group-hover:text-emerald-500 transition-colors">Assignee: {step.assignee}</p>
               </div>
             ))}
          </div>

          <Button 
            onClick={() => setIsLive(true)}
            className={`w-full h-16 mt-6 font-black rounded-2xl text-lg uppercase tracking-widest shadow-xl transition-all ${isLive ? 'bg-emerald-600 text-white' : 'bg-sky-600 hover:bg-sky-500 text-white shadow-sky-900/40'}`}
          >
            {isLive ? (lang === 'en' ? 'Plan is LIVE' : 'လမ်းကြောင်း လွှင့်တင်ပြီး') : (lang === 'en' ? 'Push to Rider Screens' : 'တာဝန် ပေးအပ်မည်')}
          </Button>
        </Card>
      </div>
    </div>
  );
}

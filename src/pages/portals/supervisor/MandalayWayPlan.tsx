import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Map as MapIcon, Route, Navigation, 
  Printer, Download, Globe, CheckCircle2, 
  Zap, Clock, Fuel 
} from 'lucide-react';

export default function MandalayWayPlan() {
  const { toggleLang, lang } = useLanguage();
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);

  // High-Fidelity Sequence for MDY Hub
  const sequence = [
    { stop: 1, id: 'BE-2026-102', addr: 'Chan Aye Thar Zan', task: 'PICKUP', time: '09:00 AM' },
    { stop: 2, id: 'BE-2026-105', addr: 'Maha Aung Myay', task: 'DELIVERY', time: '09:45 AM' },
    { stop: 3, id: 'BE-2026-108', addr: 'Pyi Gyi Tagon', task: 'DELIVERY', time: '10:30 AM' }
  ];

  return (
    <div className="p-10 space-y-10 bg-[#0B101B] min-h-screen text-slate-300">
      {/* Header (ခေါင်းစဉ်အပိုင်း) */}
      <div className="flex justify-between items-center bg-[#05080F] p-10 rounded-[3rem] border border-white/5 shadow-2xl">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-sky-500/10 rounded-2xl border border-sky-500/20">
            <Route className="h-8 w-8 text-sky-500" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">
              {lang === 'en' ? 'Mandalay Hub Way Planning' : 'မန္တလေး ဗဟိုဌာန လမ်းကြောင်းစီစဉ်မှု'}
            </h1>
            <p className="text-sky-500 font-mono text-[10px] mt-1 uppercase tracking-widest">
              HUB_CODE: MDY-001 • {lang === 'en' ? 'MAPBOX_ROUTING_ACTIVE' : 'မြေပုံလမ်းညွှန်စနစ်_အသုံးပြုနေသည်'}
            </p>
          </div>
        </div>
        <Button onClick={toggleLang} className="bg-white/5 border border-white/10 text-white h-12 px-8 rounded-xl shadow-lg">
           <Globe className="mr-2 h-4 w-4" /> {lang === 'en' ? "မြန်မာစာ" : "English"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Mapbox Route Preview (မြေပုံ ကြိုတင်ကြည့်ရှုမှု) */}
        <Card className="lg:col-span-2 bg-[#05080F] border-none ring-1 ring-white/5 rounded-[3rem] overflow-hidden min-h-[500px] relative">
           <div className="absolute inset-0 bg-[#0B101B] flex items-center justify-center opacity-40">
              <Navigation size={80} className="text-sky-500 animate-pulse rotate-45" />
           </div>
           <div className="absolute top-6 left-6 bg-[#05080F]/90 backdrop-blur-xl p-6 rounded-2xl border border-white/5 space-y-2">
              <p className="text-[10px] font-black text-slate-500 uppercase">{lang === 'en' ? 'Route Metrics' : 'လမ်းကြောင်း အချက်အလက်'}</p>
              <div className="flex gap-6">
                 <div className="flex items-center gap-2 text-white font-bold"><Fuel size={14} className="text-amber-500"/> 4.2L</div>
                 <div className="flex items-center gap-2 text-white font-bold"><Clock size={14} className="text-sky-500"/> 1h 45m</div>
              </div>
           </div>
        </Card>

        {/* Way Plan Generator (လမ်းကြောင်းစာရင်း ထုတ်ယူခြင်း) */}
        <Card className="bg-[#05080F] border-none ring-1 ring-white/5 rounded-[3rem] p-10 flex flex-col">
          <h2 className="text-xl font-black text-white uppercase italic mb-8 flex items-center gap-3">
             <Zap className="text-amber-500" /> {lang === 'en' ? 'Optimization Console' : 'ထိန်းချုပ်မှုစင်တာ'}
          </h2>
          
          {!isGenerated ? (
            <div className="space-y-6 flex-1">
              <p className="text-sm text-slate-500 leading-relaxed italic">
                {lang === 'en' ? '12 Pending waybills selected for Mandalay North Zone. Sequence these for the optimized fuel path?' : 'မန္တလေး မြောက်ပိုင်းဇုန်အတွက် ပါဆယ် ၁၂ ခု ရွေးချယ်ထားပါသည်။ အကောင်းဆုံးလမ်းကြောင်းကို စီစဉ်မည်လား?'}
              </p>
              <Button 
                onClick={() => { setIsOptimizing(true); setTimeout(() => { setIsOptimizing(false); setIsGenerated(true); }, 2000); }}
                className="w-full h-16 bg-sky-600 hover:bg-sky-500 text-white font-black rounded-2xl text-lg uppercase tracking-widest shadow-xl shadow-sky-900/40"
              >
                {isOptimizing ? 'Mapbox Computing...' : lang === 'en' ? 'Generate optimized plan' : 'လမ်းကြောင်း စီစဉ်မည်'}
              </Button>
            </div>
          ) : (
            <div className="space-y-6 flex-1 animate-in fade-in duration-700">
               <div className="space-y-4">
                  {sequence.map((step) => (
                    <div key={step.stop} className="flex gap-4 items-center p-4 bg-[#0B101B] rounded-2xl border border-white/5">
                       <div className="h-8 w-8 bg-sky-500/10 text-sky-500 rounded-full flex items-center justify-center font-black text-xs">{step.stop}</div>
                       <div className="flex-1">
                          <p className="text-white font-bold text-xs">{step.addr}</p>
                          <p className="text-[10px] text-slate-500 font-mono">{step.id} • {step.task}</p>
                       </div>
                    </div>
                  ))}
               </div>
               <div className="flex gap-3 pt-6">
                 <Button onClick={() => window.print()} className="flex-1 bg-emerald-600 text-white font-black h-12 rounded-xl"><Printer size={16} className="mr-2"/> PRINT</Button>
                 <Button variant="outline" className="flex-1 border-white/10 text-slate-400 h-12 rounded-xl"><Download size={16} className="mr-2"/> MANIFEST</Button>
               </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

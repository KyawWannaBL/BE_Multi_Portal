import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Building2, Route, Navigation, ShieldCheck, 
  Printer, Globe, Zap, Clock, MapPin 
} from 'lucide-react';

export default function NaypyitawWayPlan() {
  const { toggleLang, lang } = useLanguage();
  const [isGenerated, setIsGenerated] = useState(false);

  // High-Security Sequence for NPT Ministry Zone
  const nptSequence = [
    { stop: 1, id: 'BE-NPT-401', zone: 'Ministry of Transport', clearance: 'LEVEL_3', task: 'PICKUP' },
    { stop: 2, id: 'BE-NPT-402', zone: 'Diplomatic Enclave', clearance: 'LEVEL_4', task: 'DELIVERY' },
    { stop: 3, id: 'BE-NPT-405', zone: 'Zabuthiri Residential', clearance: 'STANDARD', task: 'DELIVERY' }
  ];

  return (
    <div className="p-10 space-y-10 bg-[#0B101B] min-h-screen text-slate-300">
      <div className="flex justify-between items-center bg-[#05080F] p-10 rounded-[3rem] border border-white/5 shadow-2xl">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
            <Building2 className="h-8 w-8 text-emerald-500" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">
              {lang === 'en' ? 'NPT Administrative Hub' : 'နေပြည်တော် စီမံခန့်ခွဲမှု ဗဟို'}
            </h1>
            <p className="text-emerald-500 font-mono text-[10px] mt-1 uppercase tracking-widest">
              {lang === 'en' ? 'CAPITAL_ZONE_SURVEILLANCE' : 'မြို့တော်ဇုန်_စောင့်ကြည့်စစ်ဆေးမှု'}
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
              <Navigation size={80} className="text-emerald-500 animate-pulse rotate-45" />
           </div>
           <div className="absolute bottom-10 left-10 right-10 flex gap-4">
              <div className="bg-[#05080F]/90 backdrop-blur-xl p-4 rounded-2xl border border-white/5 flex-1">
                 <p className="text-[10px] font-black text-slate-500 uppercase">{lang === 'en' ? 'Zone Security' : 'ဇုန်လုံခြုံရေး'}</p>
                 <p className="text-white font-bold text-lg">MOD_SEC_ACTIVE</p>
              </div>
              <div className="bg-[#05080F]/90 backdrop-blur-xl p-4 rounded-2xl border border-white/5 flex-1">
                 <p className="text-[10px] font-black text-slate-500 uppercase">{lang === 'en' ? 'Clearance Required' : 'ခွင့်ပြုချက် လိုအပ်သည်'}</p>
                 <p className="text-white font-bold text-lg">L3 + L4</p>
              </div>
           </div>
        </Card>

        <Card className="bg-[#05080F] border-none ring-1 ring-white/5 rounded-[3rem] p-10 flex flex-col">
          <h2 className="text-xl font-black text-white uppercase italic mb-8 flex items-center gap-3">
             <ShieldCheck className="text-emerald-500" /> {lang === 'en' ? 'NPT Way Plan' : 'နေပြည်တော် လမ်းကြောင်းစာရင်း'}
          </h2>
          
          {!isGenerated ? (
            <div className="space-y-6 flex-1">
              <p className="text-sm text-slate-500 leading-relaxed italic">
                {lang === 'en' ? 'Initiate Mapbox Sequencing for high-security NPT ministry zones?' : 'နေပြည်တော် ဝန်ကြီးဌာနဇုန်များအတွက် အဆင့်မြင့်လမ်းကြောင်းစီစဉ်မှုကို စတင်မည်လား?'}
              </p>
              <Button 
                onClick={() => setIsGenerated(true)}
                className="w-full h-16 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl text-lg uppercase tracking-widest shadow-xl shadow-emerald-900/40"
              >
                {lang === 'en' ? 'Optimize NPT Route' : 'လမ်းကြောင်း စတင်စီစဉ်မည်'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4 flex-1 animate-in slide-in-from-right duration-500">
               {nptSequence.map((step) => (
                 <div key={step.id} className="p-4 bg-[#0B101B] rounded-2xl border border-white/5 flex gap-4 items-center">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-black text-xs">{step.stop}</div>
                    <div className="flex-1">
                       <p className="text-white font-bold text-xs">{step.zone}</p>
                       <p className="text-[9px] text-slate-500 font-mono uppercase">{step.id} • {step.clearance}</p>
                    </div>
                 </div>
               ))}
               <Button className="w-full mt-6 bg-white/5 hover:bg-emerald-600 text-emerald-500 hover:text-white font-black h-12 rounded-xl transition-all">
                 <Printer className="mr-2 h-4 w-4" /> {lang === 'en' ? 'Print Security Manifest' : 'လုံခြုံရေးစာရင်း ပရင့်ထုတ်မည်'}
               </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

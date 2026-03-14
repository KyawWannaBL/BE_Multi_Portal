import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Map, Navigation, ShieldAlert, Globe, Radio, Wind, CloudRain } from 'lucide-react';

export default function CrisisManagement() {
  const { lang, toggleLang } = useLanguage();

  // Active Regional Disruptions
  const disruptions = [
    { region: 'Yangon', type: 'FLASH_FLOOD', severity: 'HIGH', status: 'REROUTING' },
    { region: 'Mandalay', type: 'ROAD_BLOCKAGE', severity: 'CRITICAL', status: 'HALTED' },
    { region: 'NPT', type: 'NETWORK_OUTAGE', severity: 'LOW', status: 'STABLE' }
  ];

  return (
    <div className="p-10 space-y-10 bg-[#0B101B] min-h-screen text-slate-300">
      <div className="flex justify-between items-center bg-[#05080F] p-10 rounded-[3rem] border border-rose-500/20 shadow-2xl">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-rose-500/10 rounded-2xl border border-rose-500/20 animate-pulse">
            <AlertTriangle className="h-8 w-8 text-rose-500" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">
              {lang === 'en' ? 'Crisis Control Center' : 'အရေးပေါ် စီမံခန့်ခွဲမှုဗဟို'}
            </h1>
            <p className="text-rose-500 font-mono text-[10px] mt-1 uppercase tracking-widest">
              {lang === 'en' ? 'GLOBAL_DISRUPTION_PROTOCOL' : 'ကမ္ဘာလုံးဆိုင်ရာ_အနှောင့်အယှက်_ပရိုတိုကော'}
            </p>
          </div>
        </div>
        <Button onClick={toggleLang} className="bg-white/5 border border-white/10 text-white h-12 px-8 rounded-xl">
           <Globe className="mr-2 h-4 w-4" /> {lang === 'en' ? "MY" : "EN"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {disruptions.map((item, i) => (
          <Card key={i} className="bg-[#05080F] border-none ring-1 ring-white/5 rounded-[2.5rem] p-8 space-y-6 group hover:ring-rose-500/50 transition-all">
            <div className="flex justify-between items-start">
               <div className={`p-3 rounded-xl ${item.severity === 'CRITICAL' ? 'bg-rose-500/20' : 'bg-amber-500/20'}`}>
                  {item.type === 'FLASH_FLOOD' ? <CloudRain className="text-rose-500" /> : <Wind className="text-amber-500" />}
               </div>
               <span className={`text-[9px] font-black px-3 py-1 rounded-full border ${item.severity === 'CRITICAL' ? 'border-rose-500 text-rose-500 bg-rose-500/5' : 'border-amber-500 text-amber-500 bg-amber-500/5'}`}>
                 {item.severity}
               </span>
            </div>
            <div>
               <h3 className="text-2xl font-black text-white italic">{item.region}</h3>
               <p className="text-xs text-slate-500 font-mono uppercase tracking-widest">{item.type} • {item.status}</p>
            </div>
            <Button className="w-full bg-rose-600/10 text-rose-500 hover:bg-rose-600 hover:text-white border border-rose-500/20 font-black h-12 rounded-xl text-xs uppercase">
               {lang === 'en' ? 'Activate Contingency' : 'အရေးပေါ်စီမံချက် စတင်မည်'}
            </Button>
          </Card>
        ))}
      </div>

      <Card className="bg-[#05080F] border-none ring-1 ring-white/5 rounded-[3rem] p-12 text-center space-y-8">
         <Radio className="mx-auto text-rose-500 h-16 w-16 animate-ping" />
         <h2 className="text-3xl font-black text-white uppercase italic">
            {lang === 'en' ? 'Global Emergency Broadcast' : 'ကမ္ဘာလုံးဆိုင်ရာ အရေးပေါ် ထုတ်လွှင့်မှု'}
         </h2>
         <p className="text-slate-500 max-w-2xl mx-auto italic text-sm">
            {lang === 'en' ? 'Push a critical system-wide notification to all 18 roles and 350+ riders. This will appear as a full-screen override on all mobile apps.' : 'ဝန်ထမ်း ၁၈ အဆင့်နှင့် ယာဉ်မောင်း ၃၅၀ ကျော်အား အရေးကြီး သတိပေးချက် ထုတ်ပြန်မည်။ ၎င်းသည် မိုဘိုင်းလ်အက်ပ်အားလုံးတွင် ပေါ်လာမည်ဖြစ်ပါသည်။'}
         </p>
         <div className="flex gap-4 max-w-md mx-auto">
            <input className="flex-1 bg-[#0B101B] border border-white/10 rounded-2xl h-14 px-6 text-white text-sm" placeholder="Enter Alert Message..." />
            <Button className="bg-rose-600 hover:bg-rose-500 text-white font-black px-10 rounded-2xl shadow-xl shadow-rose-900/40 uppercase">
               Push
            </Button>
         </div>
      </Card>
    </div>
  );
}

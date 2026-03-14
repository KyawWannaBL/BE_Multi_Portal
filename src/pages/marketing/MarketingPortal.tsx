import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Users, Target, Gift, Globe, ArrowUpRight } from 'lucide-react';

export default function MarketingPortal() {
  const { lang, toggleLang } = useLanguage();

  return (
    <div className="p-10 space-y-10 bg-[#0B101B] min-h-screen text-slate-300">
      <div className="flex justify-between items-center bg-[#05080F] p-10 rounded-[3rem] border border-white/5">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-sky-500/10 rounded-2xl border border-sky-500/20"><Target className="h-8 w-8 text-sky-500" /></div>
          <div>
            <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">
              {lang === 'en' ? 'Marketing Intelligence' : 'စျေးကွက်မြှင့်တင်ရေး ဗဟို'}
            </h1>
            <p className="text-sky-500 font-mono text-[10px] mt-1 uppercase tracking-widest italic">L4_GROWTH_ENGINE</p>
          </div>
        </div>
        <Button onClick={toggleLang} className="bg-white/5 border border-white/10 text-white h-12 px-8 rounded-xl shadow-lg">
           <Globe className="mr-2 h-4 w-4" /> {lang === 'en' ? "MY" : "EN"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="bg-[#05080F] border-none ring-1 ring-white/5 rounded-[2.5rem] p-8 space-y-4">
           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{lang === 'en' ? 'New Merchants' : 'ကုန်သည်သစ်များ'}</p>
           <div className="flex justify-between items-end">
              <h2 className="text-5xl font-black text-white italic">+124</h2>
              <span className="text-emerald-500 font-black text-xs flex items-center gap-1"><ArrowUpRight size={14}/> 12%</span>
           </div>
        </Card>
        <Card className="bg-[#05080F] border-none ring-1 ring-white/5 rounded-[2.5rem] p-8 space-y-4">
           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{lang === 'en' ? 'Campaign ROI' : 'ရင်းနှီးမြှုပ်နှံမှု အကျိုးအမြတ်'}</p>
           <h2 className="text-5xl font-black text-white italic">4.2x</h2>
        </Card>
        <Card className="bg-[#05080F] border-none ring-1 ring-white/5 rounded-[2.5rem] p-8 space-y-4">
           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{lang === 'en' ? 'Active Promos' : 'ပရိုမိုးရှင်းများ'}</p>
           <h2 className="text-5xl font-black text-white italic">08</h2>
        </Card>
      </div>
    </div>
  );
}

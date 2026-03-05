import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldAlert, Zap, History, XCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function RiderTags() {
  const { lang } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0B101B] text-slate-300 p-6 space-y-6 pb-24">
      <div className="flex items-center gap-4">
        <Button onClick={() => navigate(-1)} variant="ghost" className="text-slate-500 p-0"><ArrowLeft /></Button>
        <h1 className="text-xl font-black text-white uppercase italic">{lang === 'en' ? 'Security Tags' : 'လုံခြုံရေးတက်ဂ်များ'}</h1>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-[#05080F] border-none ring-1 ring-emerald-500/20 p-6 rounded-3xl text-center">
           <p className="text-[10px] text-slate-500 uppercase font-black">{lang === 'en' ? 'Remaining' : 'ကျန်ရှိမှု'}</p>
           <h2 className="text-3xl font-black text-emerald-500">42</h2>
        </Card>
        <Card className="bg-[#05080F] border-none ring-1 ring-white/5 p-6 rounded-3xl text-center">
           <p className="text-[10px] text-slate-500 uppercase font-black">{lang === 'en' ? 'Used' : 'အသုံးပြုပြီး'}</p>
           <h2 className="text-3xl font-black text-white">08</h2>
        </Card>
      </div>

      <div className="space-y-4">
        <Button className="w-full h-16 bg-sky-600 hover:bg-sky-500 text-white font-black rounded-2xl shadow-xl uppercase tracking-widest">
           <RefreshCw className="mr-2 h-5 w-5" /> {lang === 'en' ? 'End-of-Day Reconcile' : 'တာဝန်ပြီးဆုံးကြောင်း အတည်ပြုမည်'}
        </Button>
        <Button variant="outline" className="w-full h-16 border-rose-500/20 text-rose-500 hover:bg-rose-500/10 font-black rounded-2xl uppercase tracking-widest">
           <XCircle className="mr-2 h-5 w-5" /> {lang === 'en' ? 'Void Damaged Tag' : 'ပျက်စီးသောတက်ဂ်အား ပယ်ဖျက်မည်'}
        </Button>
      </div>
    </div>
  );
}

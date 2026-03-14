import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Headset, PhoneCall, Calendar, MapPin, Globe, Search, AlertCircle, RefreshCcw } from 'lucide-react';

export default function CustomerServicePortal() {
  const { toggleLang, lang } = useLanguage();

  const ndrTickets = [
    { id: 'WB-9901', reason: 'No Answer', phone: '09792970776', customer: 'U Ba', attempts: 1 },
    { id: 'WB-1242', reason: 'Refused', phone: '09450012345', customer: 'Daw Mya', attempts: 2 }
  ];

  return (
    <div className="p-10 space-y-10 bg-[#0B101B] min-h-screen text-slate-300">
      {/* Header Section */}
      <div className="flex justify-between items-center bg-[#05080F] p-10 rounded-[3rem] border border-white/5 shadow-2xl">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-rose-500/10 rounded-2xl border border-rose-500/20"><Headset className="h-8 w-8 text-rose-500" /></div>
          <div>
            <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">CS & NDR Resolution</h1>
            <p className="text-rose-500 font-mono text-xs mt-1 uppercase tracking-widest">
              {lang === 'en' ? 'L1_CUSTOMER_SUPPORT' : 'ဖောက်သည် ဝန်ဆောင်မှု ဌာန'}
            </p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="relative w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input className="w-full bg-[#0B101B] border border-white/10 rounded-full h-12 pl-12 text-sm" placeholder="Search AWB or Phone..." />
          </div>
          <Button onClick={toggleLang} className="bg-white/5 border border-white/10 text-white h-12 px-8 rounded-xl"><Globe className="h-4 w-4 mr-2" /> {lang === 'en' ? 'MY' : 'EN'}</Button>
        </div>
      </div>

      {/* NDR Resolution Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {ndrTickets.map((ticket) => (
          <Card key={ticket.id} className="bg-[#05080F] border-none ring-1 ring-white/5 rounded-[2.5rem] p-8 space-y-6 group hover:ring-rose-500/50 transition-all">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-rose-500/10 rounded-xl"><AlertCircle className="text-rose-500 h-6 w-6" /></div>
                <div>
                  <h3 className="text-xl font-black text-white">{ticket.id}</h3>
                  <p className="text-xs text-slate-500 uppercase font-mono">{ticket.reason} • {ticket.attempts} {lang === 'en' ? 'Attempts' : 'ကြိမ် ပို့ဆောင်ခဲ့ပြီး'}</p>
                </div>
              </div>
              <Button variant="ghost" className="text-emerald-500 hover:bg-emerald-500/10 font-black"><PhoneCall className="mr-2 h-4 w-4"/> {ticket.phone}</Button>
            </div>

            <div className="bg-[#0B101B] p-6 rounded-2xl flex justify-between items-center border border-white/5">
               <div className="flex items-center gap-3">
                  <MapPin className="text-slate-500" size={18} />
                  <p className="text-sm font-bold text-slate-300">{ticket.customer}</p>
               </div>
               <div className="flex gap-2">
                 <Button className="bg-sky-600 hover:bg-sky-500 text-white font-black text-[10px] h-10 px-6 rounded-xl uppercase">
                   <Calendar className="mr-2 h-4 w-4" /> {lang === 'en' ? 'Re-attempt' : 'ထပ်မံပို့ဆောင်မည်'}
                 </Button>
                 <Button variant="outline" className="border-white/10 text-slate-500 text-[10px] h-10 px-6 rounded-xl uppercase">
                    <RefreshCcw className="mr-2 h-3 w-3" /> {lang === 'en' ? 'Return to Sender' : 'ပြန်လည် ပေးပို့မည်'}
                 </Button>
               </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

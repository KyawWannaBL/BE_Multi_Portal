import React, { useState } from 'react';
import { useLanguageContext } from '@/lib/LanguageContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Truck, Search, MapPin, 
  ArrowRight, Globe, Package, 
  QrCode, ClipboardList 
} from 'lucide-react';

export default function DispatchManagement() {
  const { language } = useLanguageContext();

  const zones = [
    { nameEn: 'North Okkalapa', nameMy: 'မြောက်ဥက္ကလာပ', count: 14, hub: 'YGN-01' },
    { nameEn: 'Hlaing Township', nameMy: 'လှိုင်မြို့နယ်', count: 08, hub: 'YGN-01' },
    { nameEn: 'Kamayut Zone', nameMy: 'ကမာရွတ်ဇုန်', count: 22, hub: 'YGN-01' }
  ];

  return (
    <div className="p-10 space-y-10 bg-[#0B101B] min-h-screen text-slate-300">
      <div className="flex justify-between items-center bg-[#05080F] p-10 rounded-[3rem] border border-white/5 shadow-2xl">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-sky-500/10 rounded-2xl border border-sky-500/20"><Truck className="h-8 w-8 text-sky-500" /></div>
          <div>
            <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">
              {language === 'en' ? 'Outbound Sortation' : 'ပါဆယ်ခွဲခြားမှုနှင့် ပို့ဆောင်ရေး'}
            </h1>
            <p className="text-sky-500 font-mono text-[10px] mt-1 uppercase tracking-widest italic italic">L2_DISPATCH_MANAGEMENT</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sortation Zones */}
        <div className="lg:col-span-2 space-y-6">
           <h2 className="text-xl font-black text-white uppercase italic flex items-center gap-3">
              <MapPin className="text-amber-500" /> {language === 'en' ? 'Zonal Accumulation' : 'နယ်မြေအလိုက် စုစည်းမှု'}
           </h2>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {zones.map((zone, i) => (
                <Card key={i} className="bg-[#05080F] border-none ring-1 ring-white/5 rounded-[2.5rem] p-8 space-y-6 group hover:ring-sky-500/50 transition-all">
                   <div className="flex justify-between items-start">
                      <div>
                         <h3 className="text-2xl font-black text-white italic">{language === 'en' ? zone.nameEn : zone.nameMy}</h3>
                         <p className="text-[10px] text-slate-500 font-mono uppercase mt-1">{zone.hub} • {language === 'en' ? 'Primary Hub' : 'ပင်မဗဟို'}</p>
                      </div>
                      <span className="bg-sky-500/10 text-sky-500 px-4 py-2 rounded-2xl font-black text-lg">{zone.count}</span>
                   </div>
                   <Button className="w-full h-14 bg-white/5 hover:bg-sky-600 text-sky-400 hover:text-white font-black rounded-2xl uppercase tracking-widest text-xs transition-all">
                      {language === 'en' ? 'Generate Batch QR' : 'Batch QR ထုတ်မည်'} <ArrowRight className="ml-2 h-4 w-4" />
                   </Button>
                </Card>
              ))}
           </div>
        </div>

        {/* Global Dispatch Controls */}
        <Card className="bg-[#05080F] border-none ring-1 ring-white/5 rounded-[3rem] p-10 flex flex-col space-y-8">
           <h2 className="text-xl font-black text-white uppercase italic flex items-center gap-3">
              <ClipboardList className="text-sky-500" /> {language === 'en' ? 'Active Batches' : 'လက်ရှိအသုတ်လိုက်စာရင်း'}
           </h2>
           <div className="flex-1 space-y-4">
              <div className="p-6 bg-[#0B101B] rounded-2xl border border-white/5 text-center">
                 <p className="text-[10px] text-slate-500 uppercase font-black">{language === 'en' ? 'Total Parcels Scanned Today' : 'ယနေ့စကင်ဖတ်ပြီးသော စုစုပေါင်းပါဆယ်'}</p>
                 <p className="text-4xl text-white font-black mt-2 tracking-tighter italic">1,204</p>
              </div>
           </div>
           <Button className="w-full h-20 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-[2rem] text-lg uppercase tracking-widest shadow-xl shadow-emerald-900/40">
              <QrCode className="mr-2 h-6 w-6" /> {language === 'en' ? 'Print Manifests' : 'ပို့ဆောင်မှုစာရင်း ပရင့်ထုတ်မည်'}
           </Button>
        </Card>
      </div>
    </div>
  );
}

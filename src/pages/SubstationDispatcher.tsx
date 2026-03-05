import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  QrCode, Users, Package, Printer, 
  Globe, ShieldCheck, Zap, ArrowRight, 
  MapPin, CheckCircle2 
} from 'lucide-react';

export default function SubstationDispatcher() {
  const { lang, toggleLang } = useLanguage();
  const [isGenerated, setIsGenerated] = useState(false);
  const [selectedRider, setSelectedRider] = useState("");

  const pendingWays = [
    { id: 'BE-2026-X81', area: 'North Okkalapa', type: 'COD' },
    { id: 'BE-2026-X82', area: 'Hlaing', type: 'PREPAID' },
    { id: 'BE-2026-X83', area: 'Kamayut', type: 'COD' }
  ];

  return (
    <div className="p-10 space-y-10 bg-[#0B101B] min-h-screen text-slate-300">
      {/* Header Surveillance (စောင့်ကြည့်မှု ခေါင်းစဉ်) */}
      <div className="flex justify-between items-center bg-[#05080F] p-10 rounded-[3rem] border border-white/5 shadow-2xl">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
            <Zap className="h-8 w-8 text-emerald-500" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">
              {lang === 'en' ? 'Substation Dispatch' : 'ရုံးခွဲ ပို့ဆောင်ရေး စင်တာ'}
            </h1>
            <p className="text-emerald-500 font-mono text-[10px] mt-1 uppercase tracking-widest italic">
              L3_SUBSTATION_AUTHORITY • {lang === 'en' ? 'BATCH_QR_GEN_ACTIVE' : 'QR_ထုတ်ပေးမှု_အဆင်သင့်ဖြစ်သည်'}
            </p>
          </div>
        </div>
        <Button onClick={toggleLang} className="bg-white/5 border border-white/10 text-white h-12 px-8 rounded-xl">
          <Globe className="mr-2 h-4 w-4" /> {lang === 'en' ? "MY" : "EN"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Waybill Selection (ပါဆယ်များ ရွေးချယ်ခြင်း) */}
        <Card className="lg:col-span-7 bg-[#05080F] border-none ring-1 ring-white/5 rounded-[3rem] p-10 space-y-8">
          <h2 className="text-xl font-black text-white uppercase italic flex items-center gap-3">
             <Package className="text-sky-500" /> {lang === 'en' ? 'Pending Waybills' : 'ပို့ဆောင်ရန် ကျန်ရှိသောစာရင်း'}
          </h2>
          <div className="space-y-4">
            {pendingWays.map((way) => (
              <div key={way.id} className="flex items-center justify-between p-6 bg-[#0B101B] rounded-2xl border border-white/5 group hover:border-emerald-500/30 transition-all">
                <div>
                   <p className="text-emerald-500 font-mono text-xs font-black">{way.id}</p>
                   <p className="text-white font-bold text-sm mt-1">{way.area}</p>
                </div>
                <div className="flex items-center gap-4">
                   <span className="text-[10px] font-black text-slate-500 uppercase">{way.type}</span>
                   <div className="w-6 h-6 rounded-full border-2 border-emerald-500 flex items-center justify-center">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                   </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Dispatch Control (တာဝန်ပေးအပ်မှု ထိန်းချုပ်ရေး) */}
        <Card className="lg:col-span-5 bg-[#05080F] border-none ring-1 ring-white/5 rounded-[3rem] p-10 flex flex-col items-center text-center space-y-8">
          <div className="w-full text-left space-y-6">
            <h2 className="text-xl font-black text-white uppercase italic flex items-center gap-3">
               <Users className="text-amber-500" /> {lang === 'en' ? 'Rider Assignment' : 'ယာဉ်မောင်း တာဝန်ပေးခြင်း'}
            </h2>
            <select 
              onChange={(e) => setSelectedRider(e.target.value)}
              className="w-full h-16 bg-[#0B101B] border border-white/10 rounded-2xl px-6 text-white font-black uppercase tracking-widest outline-none focus:border-emerald-500"
            >
               <option value="">{lang === 'en' ? '-- SELECT RIDER --' : '-- ယာဉ်မောင်း ရွေးချယ်ပါ --'}</option>
               <option value="RDR-001">ZAYAR MIN (Online)</option>
               <option value="RDR-002">KYAW KYAW (Online)</option>
            </select>
          </div>

          {!isGenerated ? (
            <div className="space-y-6 w-full pt-10">
               <div className="p-8 border-2 border-dashed border-white/5 rounded-[2.5rem] opacity-20">
                  <QrCode size={100} className="mx-auto" />
               </div>
               <Button 
                 disabled={!selectedRider}
                 onClick={() => setIsGenerated(true)}
                 className="w-full h-20 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-[2rem] text-lg uppercase tracking-[0.2em] shadow-xl shadow-emerald-900/40"
               >
                 {lang === 'en' ? 'Generate Batch QR' : 'Batch QR ထုတ်မည်'}
               </Button>
            </div>
          ) : (
            <div className="w-full space-y-8 animate-in zoom-in duration-500">
               <div className="bg-white p-6 rounded-[2.5rem] shadow-[0_0_50px_rgba(16,185,129,0.3)] mx-auto w-fit">
                  <QrCode size={200} className="text-black" />
               </div>
               <div className="space-y-2">
                  <p className="text-emerald-500 font-black uppercase italic text-sm">{lang === 'en' ? 'Ready for Scan' : 'စကင်ဖတ်ရန် အသင့်ဖြစ်သည်'}</p>
                  <p className="text-[10px] text-slate-500 font-mono">BATCH_ID: BTX-YGN-2026-0041</p>
               </div>
               <Button className="w-full h-14 bg-white/5 border border-white/10 text-white font-black rounded-2xl uppercase tracking-widest hover:bg-white/10">
                  <Printer className="mr-2 h-4 w-4" /> {lang === 'en' ? 'Print Label' : 'ပရင့်ထုတ်မည်'}
               </Button>
               <Button onClick={() => setIsGenerated(false)} variant="ghost" className="text-[10px] text-slate-600 uppercase font-black tracking-widest">
                  Reset Selection
               </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

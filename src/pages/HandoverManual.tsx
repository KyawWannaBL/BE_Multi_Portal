import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileCheck, ShieldCheck, Cpu, Database, 
  Globe, Download, Terminal, HardDrive 
} from 'lucide-react';

export default function HandoverManual() {
  const { lang, toggleLang } = useLanguage();

  return (
    <div className="p-10 space-y-10 bg-[#0B101B] min-h-screen text-slate-300">
      <div className="flex justify-between items-center bg-[#05080F] p-10 rounded-[3rem] border border-emerald-500/20 shadow-2xl">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
            <FileCheck className="h-8 w-8 text-emerald-500" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">System Handover Manual</h1>
            <p className="text-emerald-500 font-mono text-[10px] mt-1 uppercase tracking-widest italic">
              {lang === 'en' ? 'L5_SOVEREIGN_BLUEPRINT_2026' : 'အဆင့်_၅_အချုပ်အခြာအာဏာ_မူဘောင်'}
            </p>
          </div>
        </div>
        <Button onClick={toggleLang} className="bg-emerald-600 text-white font-black h-12 px-8 rounded-xl">
           <Globe className="mr-2 h-4 w-4" /> {lang === 'en' ? "မြန်မာစာ" : "English"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="bg-[#05080F] border-none ring-1 ring-white/5 rounded-[3rem] p-10 space-y-6">
          <h2 className="text-2xl font-black text-white italic flex items-center gap-3">
            <ShieldCheck className="text-emerald-500" /> {lang === 'en' ? 'Core Integrity' : 'စနစ်၏ ခိုင်မာမှု'}
          </h2>
          <div className="space-y-4 text-sm text-slate-500 italic leading-relaxed">
            <p>> Multi-Region Mapbox routing optimized for YGN/MDY/NPT.</p>
            <p>> SEC-01 Multi-layer encryption protocol verified.</p>
            <p>> L1-L5 Role-based access hierarchy fully mapped.</p>
          </div>
          <Button className="w-full h-14 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl uppercase">
            <Download className="mr-2 h-5 w-5" /> Download Digital Certificate
          </Button>
        </Card>

        <Card className="bg-[#05080F] border-none ring-1 ring-white/5 rounded-[3rem] p-10 space-y-6">
          <h2 className="text-2xl font-black text-white italic flex items-center gap-3">
            <Cpu className="text-sky-500" /> {lang === 'en' ? 'Operational Health' : 'လုပ်ငန်းလည်ပတ်မှု အခြေအနေ'}
          </h2>
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-[#0B101B] p-4 rounded-2xl border border-white/5">
                <p className="text-[10px] text-slate-500 uppercase">Uptime</p>
                <p className="text-xl font-black text-emerald-500">99.99%</p>
             </div>
             <div className="bg-[#0B101B] p-4 rounded-2xl border border-white/5">
                <p className="text-[10px] text-slate-500 uppercase">API Load</p>
                <p className="text-xl font-black text-sky-500">STABLE</p>
             </div>
          </div>
          <div className="p-4 bg-white/5 rounded-2xl flex items-center gap-4">
            <HardDrive className="text-amber-500" />
            <p className="text-xs text-slate-400 font-mono">Cold Storage: Last Backup 16:21:12</p>
          </div>
        </Card>
      </div>
    </div>
  );
}

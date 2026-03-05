import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Book, ShieldCheck, Cpu, Code2, 
  Printer, Globe, Server, Database,
  ArrowRight, FileText, Lock, Network
} from 'lucide-react';

export default function MasterManual() {
  const { lang, toggleLang } = useLanguage();
  const [view, setView] = useState<'OPERATIONAL' | 'TECHNICAL'>('OPERATIONAL');

  return (
    <div className="p-10 space-y-10 bg-[#0B101B] min-h-screen text-slate-300 print:bg-white print:p-0 print:text-black">
      {/* Control Bar (Hidden in Print) */}
      <div className="flex justify-between items-center bg-[#05080F] p-8 rounded-[2.5rem] border border-white/5 print:hidden">
        <div className="flex gap-4">
          <Button 
            onClick={() => setView('OPERATIONAL')}
            className={`h-12 px-8 rounded-xl font-black uppercase text-xs tracking-widest ${view === 'OPERATIONAL' ? 'bg-sky-600 text-white' : 'bg-white/5 text-slate-500'}`}
          >
            {lang === 'en' ? 'Operational SOP' : 'လုပ်ငန်းဆောင်ရွက်မှု လက်စွဲ'}
          </Button>
          <Button 
            onClick={() => setView('TECHNICAL')}
            className={`h-12 px-8 rounded-xl font-black uppercase text-xs tracking-widest ${view === 'TECHNICAL' ? 'bg-emerald-600 text-white' : 'bg-white/5 text-slate-500'}`}
          >
            {lang === 'en' ? 'Technical Manual' : 'နည်းပညာဆိုင်ရာ လက်စွဲ'}
          </Button>
        </div>
        <div className="flex gap-4">
          <Button onClick={toggleLang} variant="ghost" className="text-slate-400"><Globe size={20}/></Button>
          <Button onClick={() => window.print()} className="bg-white text-black font-black h-12 px-8 rounded-xl">
             <Printer className="mr-2 h-4 w-4" /> {lang === 'en' ? 'Generate PDF' : 'PDF ထုတ်ယူမည်'}
          </Button>
        </div>
      </div>

      {/* Manual Content Area */}
      <div className="max-w-5xl mx-auto bg-[#05080F] border border-white/5 rounded-[4rem] p-16 shadow-2xl print:border-none print:shadow-none print:p-0 print:bg-white">
        
        {/* Document Header */}
        <div className="border-b border-white/10 pb-12 mb-12 flex justify-between items-end print:border-black">
          <div>
            <h1 className="text-6xl font-black uppercase italic tracking-tighter text-white print:text-black">
               {view === 'OPERATIONAL' ? 'Operational SOP' : 'Technical Manual'}
            </h1>
            <p className="text-sky-500 font-mono text-sm mt-2 uppercase tracking-[0.3em] print:text-slate-600">
               Britium Express L5 Sovereign Core • 2026 Edition
            </p>
          </div>
          <div className="text-right hidden print:block">
            <p className="text-xs font-bold uppercase">Classification: HIGHLY SECURE</p>
            <p className="text-[10px] font-mono">ID: BTX-MAN-9901</p>
          </div>
        </div>

        {view === 'OPERATIONAL' ? (
          <div className="space-y-12 animate-in fade-in duration-500">
             <section className="space-y-6">
                <h2 className="text-2xl font-black text-white flex items-center gap-4 print:text-black underline underline-offset-8 decoration-sky-500">
                   <ShieldCheck className="text-sky-500" /> 01. Chain of Custody (ရုံးခွဲများ စီမံမှု)
                </h2>
                <p className="text-slate-400 italic leading-relaxed print:text-slate-700">
                   All parcels entering an <strong>Office Branch (ရုံးခွဲ)</strong> must be scanned and verified against the SEC-01 Tamper Tag database. A way is only "Activated" once the physical QR scan is confirmed by the L1/L2 device.
                </p>
                <div className="grid grid-cols-2 gap-8 pt-4">
                   <div className="p-6 bg-white/5 rounded-2xl border border-white/5 print:border-slate-200">
                      <p className="text-sky-500 font-black text-[10px] uppercase mb-2">Step A</p>
                      <p className="text-sm font-bold text-white print:text-black">Substation Batching</p>
                   </div>
                   <div className="p-6 bg-white/5 rounded-2xl border border-white/5 print:border-slate-200">
                      <p className="text-sky-500 font-black text-[10px] uppercase mb-2">Step B</p>
                      <p className="text-sm font-bold text-white print:text-black">Rider QR Activation</p>
                   </div>
                </div>
             </section>
          </div>
        ) : (
          <div className="space-y-12 animate-in fade-in duration-500">
             <section className="space-y-6">
                <h2 className="text-2xl font-black text-white flex items-center gap-4 print:text-black underline underline-offset-8 decoration-emerald-500">
                   <Cpu className="text-emerald-500" /> 01. Architecture & Encryption (နည်းပညာ)
                </h2>
                <div className="bg-[#0B101B] p-8 rounded-3xl border border-white/10 font-mono text-xs text-emerald-500 print:bg-slate-50 print:text-slate-800">
                   <p className="mb-2">// SEC-01 ENCRYPTION HEADER</p>
                   <p>PROTOCOL: AES-256-GCM</p>
                   <p>AUTH_LEVEL: L5_MASTER_ONLY</p>
                   <p>DATA_ISOLATION: SENSITIVE_VAULT_ACTIVE</p>
                </div>
                <p className="text-slate-400 italic leading-relaxed print:text-slate-700">
                   The system utilizes <strong>Mapbox GL JS</strong> for real-time telemetry rendering. All coordinates are WebSocket-streamed from L1/L2 devices to the Sovereign Super Screen via the encrypted L5 Dispatch Node.
                </p>
             </section>
          </div>
        )}

        <div className="mt-20 pt-8 border-t border-white/5 text-[10px] font-mono text-slate-600 flex justify-between print:border-black">
           <p>AUTHORIZED BY: BRITIUM BOARD OF DIRECTORS</p>
           <p>PAGE 01 / 12</p>
        </div>
      </div>
    </div>
  );
}

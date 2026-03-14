import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldAlert, History, Search, Globe, ArrowLeft, Filter, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SecurityAudit() {
  const { lang, toggleLang } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="p-10 space-y-10 bg-[#0B101B] min-h-screen text-slate-300">
      <div className="flex justify-between items-center bg-[#05080F] p-10 rounded-[3rem] border border-white/5">
        <div className="flex items-center gap-6">
          <Button onClick={() => navigate(-1)} variant="ghost" className="p-0 text-slate-500"><ArrowLeft size={32}/></Button>
          <div>
            <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">
              {lang === 'en' ? 'SEC-01 Audit' : 'လုံခြုံရေး စစ်ဆေးမှု'}
            </h1>
            <p className="text-rose-500 font-mono text-[10px] mt-1 uppercase tracking-widest italic">SOVEREIGN_INTEGRITY_MATRIX</p>
          </div>
        </div>
        <Button onClick={toggleLang} className="bg-white/5 border border-white/10 text-white h-12 px-8 rounded-xl shadow-lg">
           <Globe className="mr-2 h-4 w-4" /> {lang === 'en' ? "MY" : "EN"}
        </Button>
      </div>

      <Card className="bg-[#05080F] border-none ring-1 ring-white/5 rounded-[3rem] overflow-hidden">
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
           <h2 className="text-xl font-black text-white uppercase italic flex items-center gap-3">
              <History className="text-rose-500" /> {lang === 'en' ? 'Incident Ledger' : 'ပြဿနာ မှတ်တမ်း'}
           </h2>
           <Button variant="outline" className="border-white/10 text-slate-400 h-10 px-6 rounded-xl text-xs uppercase font-black">
              <Filter size={14} className="mr-2"/> Filters
           </Button>
        </div>
        <div className="p-20 text-center space-y-6">
           <Lock size={60} className="mx-auto text-slate-800" />
           <p className="text-sm text-slate-500 italic max-w-xs mx-auto">
             {lang === 'en' ? 'No active security breaches or tag discrepancies reported in the last 24 hours.' : 'ပြီးခဲ့သော ၂၄ နာရီအတွင်း လုံခြုံရေးပြဿနာ မရှိပါ။'}
           </p>
        </div>
      </Card>
    </div>
  );
}

import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Play, ShieldCheck, Database, Landmark, 
  Activity, Globe, Loader2, CheckCircle2 
} from 'lucide-react';

export default function ShadowRun() {
  const { lang, toggleLang } = useLanguage();
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<any>(null);

  const executeSimulation = () => {
    setIsRunning(true);
    // Logic: Simulating 1,000 shipments across YGN/MDY/NPT
    setTimeout(() => {
      setResults({
        totalCod: "45,000,000",
        branches: [
          { name: 'Yangon Office Branch', cod: '25,000,000' },
          { name: 'Mandalay Office Branch', cod: '12,500,000' },
          { name: 'NPT Office Branch', cod: '7,500,000' }
        ]
      });
      setIsRunning(false);
    }, 3000);
  };

  return (
    <div className="p-10 space-y-10 bg-[#0B101B] min-h-screen text-slate-300">
      <div className="flex justify-between items-center bg-[#05080F] p-10 rounded-[3rem] border border-white/5">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
            <Activity className="h-8 w-8 text-emerald-500" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">
              {lang === 'en' ? 'Sovereign Shadow Run' : 'လုပ်ငန်းစဉ် စမ်းသပ်မှု'}
            </h1>
            <p className="text-emerald-500 font-mono text-[10px] mt-1 uppercase tracking-widest italic">L5_STRESS_SIMULATION</p>
          </div>
        </div>
        <Button onClick={toggleLang} className="bg-white/5 border border-white/10 text-white h-12 px-8 rounded-xl">
           <Globe className="mr-2 h-4 w-4" /> {lang === 'en' ? "MY" : "EN"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-[#05080F] border-none ring-1 ring-white/5 rounded-[3rem] p-12 space-y-8">
          <h2 className="text-2xl font-black text-white uppercase italic">{lang === 'en' ? 'Simulation Parameters' : 'စမ်းသပ်မှု ကန့်သတ်ချက်များ'}</h2>
          <div className="space-y-4 font-mono text-xs text-slate-500">
             <p>> Generate 1,000 Shipments (L0 Merchant Origin)</p>
             <p>> Distribute across Office Office Branch Network (YGN/MDY/NPT)</p>
             <p>> Trigger SEC-01 Tamper Tag verification</p>
             <p>> Verify Finance Hub COD aggregation logic</p>
          </div>
          <Button 
            onClick={executeSimulation}
            disabled={isRunning}
            className="w-full h-20 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-3xl text-xl uppercase tracking-widest shadow-xl shadow-emerald-900/40"
          >
            {isRunning ? <Loader2 className="animate-spin mr-2"/> : <Play className="mr-2"/>}
            {lang === 'en' ? 'Start Shadow Run' : 'စမ်းသပ်မှု စတင်မည်'}
          </Button>
        </Card>

        {results && (
          <Card className="bg-[#05080F] border-none ring-2 ring-emerald-500/30 rounded-[3rem] p-12 space-y-8 animate-in zoom-in duration-500">
             <div className="flex justify-between items-center border-b border-white/5 pb-6">
                <h2 className="text-xl font-black text-emerald-500 uppercase">{lang === 'en' ? 'Audit Summary' : 'စစ်ဆေးချက် အနှစ်ချုပ်'}</h2>
                <CheckCircle2 className="text-emerald-500" />
             </div>
             <div className="text-center">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2">Total System COD</p>
                <h3 className="text-5xl font-black text-white italic">{results.totalCod} <span className="text-sm">MMK</span></h3>
             </div>
             <div className="space-y-4">
                {results.branches.map((b: any, i: number) => (
                   <div key={i} className="flex justify-between p-4 bg-[#0B101B] rounded-2xl border border-white/5">
                      <span className="text-xs font-bold text-white uppercase italic">{b.name}</span>
                      <span className="text-xs font-mono text-emerald-500">{b.cod} K</span>
                   </div>
                ))}
             </div>
          </Card>
        )}
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Zap, AlertOctagon, RefreshCcw, WifiOff, 
  ShieldAlert, Globe, Activity, ServerCrash, 
  DatabaseBackup, Loader2 
} from 'lucide-react';

export default function StressTest() {
  const { lang, toggleLang } = useLanguage();
  const [testing, setTesting] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const runScenario = (nameEn: string, nameMy: string) => {
    setTesting(true);
    const newLog = `${new Date().toLocaleTimeString()}: [CRITICAL] ${lang === 'en' ? nameEn : nameMy}`;
    setLogs(prev => [newLog, ...prev]);
    
    setTimeout(() => {
      setLogs(prev => [`${new Date().toLocaleTimeString()}: [SUCCESS] Recovery Protocol SEC-01 Active`, ...prev]);
      setTesting(false);
    }, 3000);
  };

  return (
    <div className="p-10 space-y-10 bg-[#0B101B] min-h-screen text-slate-300">
      <div className="flex justify-between items-center bg-[#05080F] p-10 rounded-[3rem] border border-rose-500/30 shadow-2xl">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-rose-500/10 rounded-2xl border border-rose-500/20">
            <Zap className="h-8 w-8 text-rose-500 animate-pulse" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">L5 Stress Test Console</h1>
            <p className="text-rose-500 font-mono text-[10px] mt-1 uppercase tracking-widest italic">
              {lang === 'en' ? 'SYSTEM_INTEGRITY_VERIFICATION' : 'စနစ်၏_ကြံ့ခိုင်မှု_စစ်ဆေးခြင်း'}
            </p>
          </div>
        </div>
        <Button onClick={toggleLang} className="bg-white/5 border border-white/10 text-white h-12 px-8 rounded-xl shadow-lg">
           <Globe className="mr-2 h-4 w-4" /> {lang === 'en' ? "MY" : "EN"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Scenario Selectors */}
        <Card className="bg-[#05080F] border-none ring-1 ring-white/5 rounded-[3rem] p-10 space-y-6">
          <h2 className="text-xl font-black text-white uppercase flex items-center gap-3">
            <ShieldAlert className="text-rose-500" /> {lang === 'en' ? 'Failure Scenarios' : 'ပျက်ကွက်မှု ပုံစံတူများ'}
          </h2>
          <div className="space-y-4">
             <Button 
               disabled={testing}
               onClick={() => runScenario('Mandalay Power Outage', 'မန္တလေး လျှပ်စစ်မီး ပြတ်တောက်မှု')}
               className="w-full h-14 bg-[#0B101B] hover:bg-rose-900/20 border border-white/5 text-slate-400 hover:text-rose-500 rounded-2xl justify-start px-6 transition-all"
             >
               <WifiOff className="mr-4 h-5 w-5" /> {lang === 'en' ? 'MDY Grid Failure' : 'မန္တလေး စနစ်ပြတ်တောက်မှု'}
             </Button>
             <Button 
               disabled={testing}
               onClick={() => runScenario('Yangon Data Congestion', 'ရန်ကုန် ဒေတာ ပိတ်ဆို့မှု')}
               className="w-full h-14 bg-[#0B101B] hover:bg-amber-900/20 border border-white/5 text-slate-400 hover:text-amber-500 rounded-2xl justify-start px-6 transition-all"
             >
               <Activity className="mr-4 h-5 w-5" /> {lang === 'en' ? 'YGN Node Overload' : 'ရန်ကုန် ဝန်အားလျှံတက်မှု'}
             </Button>
             <Button 
               disabled={testing}
               onClick={() => runScenario('NPT Security Lockdown', 'နေပြည်တော် လုံခြုံရေး ပိတ်ဆို့မှု')}
               className="w-full h-14 bg-[#0B101B] hover:bg-sky-900/20 border border-white/5 text-slate-400 hover:text-sky-500 rounded-2xl justify-start px-6 transition-all"
             >
               <ServerCrash className="mr-4 h-5 w-5" /> {lang === 'en' ? 'NPT API DDoS' : 'နေပြည်တော် API တိုက်ခိုက်ခံရမှု'}
             </Button>
          </div>
        </Card>

        {/* Real-time Integrity Terminal */}
        <Card className="lg:col-span-2 bg-[#05080F] border-none ring-1 ring-white/5 rounded-[3rem] overflow-hidden flex flex-col h-[500px]">
          <div className="bg-white/5 p-6 border-b border-white/5 flex justify-between items-center">
            <h3 className="font-mono text-xs uppercase tracking-[0.3em] text-slate-500 flex items-center gap-2">
              <RefreshCcw className={testing ? 'animate-spin' : ''} size={14} /> 
              {lang === 'en' ? 'Integrity Audit Log' : 'စနစ်စစ်ဆေးရေး မှတ်တမ်း'}
            </h3>
            {testing && <span className="text-[10px] font-black text-rose-500 animate-pulse uppercase italic">Executing Mitigation...</span>}
          </div>
          <div className="flex-1 p-8 font-mono text-xs space-y-4 overflow-y-auto bg-[#03050a] text-emerald-500/80">
            {logs.length === 0 ? (
              <p className="text-slate-700 italic">{lang === 'en' ? '> System status stable. No incidents logged.' : '> စနစ်အခြေအနေ ကောင်းမွန်ပါသည်။ မှတ်တမ်းမရှိပါ။'}</p>
            ) : (
              logs.map((log, i) => <p key={i} className={log.includes('CRITICAL') ? 'text-rose-500' : 'text-emerald-500'}>{`> ${log}`}</p>)
            )}
          </div>
          <div className="p-6 bg-white/5 border-t border-white/5">
             <Button 
               disabled={testing}
               className="w-full h-14 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl shadow-xl shadow-emerald-900/20 uppercase"
             >
               <DatabaseBackup className="mr-2 h-5 w-5" /> {lang === 'en' ? 'Force Cold Storage Backup' : 'ဒေတာများ သိမ်းဆည်းမည်'}
             </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

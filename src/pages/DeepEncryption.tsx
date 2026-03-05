import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Lock, ShieldCheck, Cpu, Key, 
  Globe, AlertTriangle, EyeOff, Terminal 
} from 'lucide-react';

export default function DeepEncryption() {
  const { toggleLang, lang } = useLanguage();
  const [isLocked, setIsLocked] = useState(true);

  return (
    <div className="p-10 space-y-10 bg-[#0B101B] min-h-screen text-slate-300">
      {/* Header (ခေါင်းစဉ်အပိုင်း) */}
      <div className="flex justify-between items-center bg-[#05080F] p-10 rounded-[3rem] border border-white/5 shadow-2xl">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-rose-500/10 rounded-2xl border border-rose-500/20">
            <Lock className="h-8 w-8 text-rose-500" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">
              Deep Encryption Access
            </h1>
            <p className="text-rose-500 font-mono text-[10px] mt-1 uppercase tracking-widest">
              MODULE: SEC-01 • {lang === 'en' ? 'L5_SOVEREIGN_ENCRYPTION' : 'အဆင့်_၅_လျှို့ဝှက်ကုဒ်_ထိန်းချုပ်မှု'}
            </p>
          </div>
        </div>
        <Button onClick={toggleLang} className="bg-white/5 border border-white/10 text-white h-12 px-8 rounded-xl">
           <Globe className="mr-2 h-4 w-4" /> {lang === 'en' ? "မြန်မာစာ" : "English"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Encryption Status (ကုဒ်ဝှက်စနစ် အခြေအနေ) */}
        <Card className="bg-[#05080F] border-none ring-1 ring-white/5 rounded-[3rem] p-10 space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Cpu size={120} className="text-rose-500" />
          </div>
          <h2 className="text-2xl font-black text-white italic">{lang === 'en' ? 'Master Key Status' : 'ပင်မသော့ချက် အခြေအနေ'}</h2>
          
          <div className="space-y-6">
             <div className="flex justify-between items-center bg-[#0B101B] p-6 rounded-2xl border border-white/5">
                <div>
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Encryption Engine</p>
                   <p className="text-white font-bold mt-1">AES-256-GCM</p>
                </div>
                <span className="bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full text-[10px] font-black uppercase">Active</span>
             </div>
             
             <div className="p-6 bg-rose-500/5 rounded-2xl border border-rose-500/10 space-y-4">
                <div className="flex items-center gap-3 text-rose-500">
                   <AlertTriangle size={18} />
                   <p className="text-xs font-black uppercase">{lang === 'en' ? 'Warning: High Security Zone' : 'သတိပေးချက်: လုံခြုံရေးအဆင့်မြင့်နယ်မြေ'}</p>
                </div>
                <p className="text-[11px] text-slate-500 italic">
                  {lang === 'en' ? 'Modifying SEC-01 keys will rotate all merchant and financial hashes.' : 'SEC-01 သော့ချက်များကို ပြင်ဆင်ခြင်းသည် စနစ်တစ်ခုလုံးရှိ ကုဒ်ဝှက်စနစ်များကို ပြောင်းလဲစေမည်ဖြစ်ပါသည်။'}
                </p>
             </div>
          </div>
        </Card>

        {/* L5 Authorization (အဆင့်_၅ ခွင့်ပြုချက်တောင်းခံခြင်း) */}
        <Card className="bg-[#05080F] border-none ring-1 ring-rose-500/20 rounded-[3rem] p-10 flex flex-col justify-center items-center text-center space-y-6">
          <div className={`p-6 rounded-full transition-all ${isLocked ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
             {isLocked ? <EyeOff size={48} /> : <ShieldCheck size={48} />}
          </div>
          <h3 className="text-xl font-black text-white">
            {isLocked ? (lang === 'en' ? 'Secondary Authorization Required' : 'ထပ်ဆင့် ခွင့်ပြုချက် လိုအပ်သည်') : (lang === 'en' ? 'Access Granted' : 'ဝင်ရောက်ခွင့် ပြုပြီး')}
          </h3>
          <p className="text-sm text-slate-500 max-w-xs">
            {lang === 'en' ? 'Please provide your L5 secondary token to unlock deep encryption settings.' : 'အဆင့်မြင့် ကုဒ်ဝှက်စနစ်များကို ပြင်ဆင်ရန် အဆင့်_၅ ထပ်ဆင့်ကုဒ်ကို ရိုက်ထည့်ပါ။'}
          </p>
          <div className="w-full max-w-sm space-y-4">
            <input type="password" className="w-full bg-[#0B101B] border border-white/10 rounded-2xl h-14 px-6 text-center text-white" placeholder="••••••••" />
            <Button 
              onClick={() => setIsLocked(!isLocked)}
              className={`w-full h-14 font-black rounded-2xl uppercase tracking-widest ${isLocked ? 'bg-rose-600 hover:bg-rose-500 text-white' : 'bg-white/5 text-slate-500'}`}
            >
              {isLocked ? (lang === 'en' ? 'Verify & Unlock' : 'စစ်ဆေးပြီး ဖွင့်မည်') : (lang === 'en' ? 'Re-lock Console' : 'ပြန်လည်ပိတ်မည်')}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

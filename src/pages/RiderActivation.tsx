import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode, ShieldCheck, Map, Smartphone, Globe, ArrowRight, Loader2 } from 'lucide-react';
import QRScanner from '@/components/QRScanner';

export default function RiderActivation() {
  const { lang, toggleLang } = useLanguage();
  const navigate = useNavigate();
  const [isScanning, setIsScanning] = useState(false);
  const [isActivating, setIsActivating] = useState(false);

  const handleBatchScan = (code: string) => {
    setIsScanning(false);
    setIsActivating(true);
    
    // Logic: Validate Batch QR against L5 Core
    setTimeout(() => {
      setIsActivating(false);
      navigate('/rider/dashboard'); // Unlock the Mapbox Way Plan
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#0B101B] text-slate-300 p-6 flex flex-col items-center justify-center space-y-8">
      <div className="absolute top-10 right-10">
        <Button onClick={toggleLang} variant="outline" className="border-white/5 text-[10px] font-black h-10 px-6 rounded-full uppercase">
           {lang === 'en' ? "MY" : "EN"}
        </Button>
      </div>

      <div className="text-center space-y-4 max-w-xs">
        <div className="w-20 h-20 bg-emerald-500/10 rounded-[2rem] border border-emerald-500/20 flex items-center justify-center mx-auto shadow-2xl shadow-emerald-900/20">
          <ShieldCheck className="text-emerald-500 h-10 w-10" />
        </div>
        <h1 className="text-2xl font-black text-white uppercase italic tracking-tighter">
          {lang === 'en' ? 'Way Activation' : 'လမ်းကြောင်း အသက်သွင်းခြင်း'}
        </h1>
        <p className="text-xs text-slate-500 leading-relaxed">
          {lang === 'en' ? 'Scan the Substation Batch QR to activate your optimized Way Plan.' : 'သင်၏ လမ်းကြောင်းစာရင်းကို စတင်ရန် ရုံးခွဲရှိ Batch QR ကို စကင်ဖတ်ပါ။'}
        </p>
      </div>

      {!isScanning && !isActivating ? (
        <Card className="w-full max-w-sm bg-[#05080F] border-none ring-1 ring-white/5 rounded-[3rem] p-10 flex flex-col gap-6 text-center">
           <QrCode className="h-24 w-24 mx-auto text-slate-700 opacity-20" />
           <Button 
             onClick={() => setIsScanning(true)}
             className="h-16 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl text-lg uppercase tracking-widest shadow-xl shadow-emerald-900/40"
           >
             {lang === 'en' ? 'Open Scanner' : 'စကင်ဖတ်မည်'}
           </Button>
        </Card>
      ) : isActivating ? (
        <div className="flex flex-col items-center gap-4">
           <Loader2 className="h-12 w-12 text-emerald-500 animate-spin" />
           <p className="font-mono text-[10px] text-emerald-500 uppercase tracking-widest italic">Authenticating_Batch_Keys...</p>
        </div>
      ) : (
        <div className="w-full max-w-sm rounded-[3rem] overflow-hidden border-4 border-emerald-500/50 shadow-2xl">
          <QRScanner onScan={handleBatchScan} expectedType="BATCH_KEY" />
          <Button onClick={() => setIsScanning(false)} variant="ghost" className="w-full h-14 text-slate-500 uppercase text-[10px] font-black tracking-widest">Cancel</Button>
        </div>
      )}

      <div className="flex items-center gap-2 px-6 py-2 bg-white/5 rounded-full border border-white/5">
        <Smartphone size={12} className="text-slate-500" />
        <span className="text-[9px] text-slate-500 font-mono uppercase tracking-widest italic">L2_Device_Verified • 2026_Standard</span>
      </div>
    </div>
  );
}

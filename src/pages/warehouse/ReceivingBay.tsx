import React, { useState } from 'react';
import { useLanguageContext } from '@/lib/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  QrCode, ShieldCheck, Camera, 
  CheckCircle2, Globe, ArrowLeft, 
  Search, Package, AlertCircle 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import QRScanner from '@/components/QRScanner';

export default function ReceivingBay() {
  const { t, language } = useLanguageContext();
  const navigate = useNavigate();
  const [isScanning, setIsScanning] = useState(false);

  return (
    <div className="p-10 space-y-10 bg-[#0B101B] min-h-screen text-slate-300">
      <div className="flex justify-between items-center bg-[#05080F] p-10 rounded-[3rem] border border-white/5">
        <div className="flex items-center gap-6">
          <Button onClick={() => navigate(-1)} variant="ghost" className="p-0 hover:bg-transparent text-slate-500"><ArrowLeft size={32}/></Button>
          <div>
            <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">
              {language === 'en' ? 'Inbound Bay' : 'ပါဆယ်လက်ခံရေးနေရာ'}
            </h1>
            <p className="text-emerald-500 font-mono text-[10px] mt-1 uppercase tracking-widest italic">SEC-01_TAMPER_PROTOCOL_ACTIVE</p>
          </div>
        </div>
        <Button variant="outline" className="border-white/10 text-white h-12 px-6 rounded-xl">
           <Globe className="mr-2 h-4 w-4" /> {language === 'en' ? "MY" : "EN"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <Card className="lg:col-span-7 bg-[#05080F] border-none ring-1 ring-white/5 rounded-[3rem] p-12 flex flex-col items-center justify-center text-center space-y-10">
          {!isScanning ? (
            <>
              <div className="p-10 border-2 border-dashed border-white/5 rounded-[3rem] opacity-20">
                <QrCode size={120} className="text-white" />
              </div>
              <div className="space-y-4">
                <h2 className="text-2xl font-black text-white uppercase">{language === 'en' ? 'Awaiting Scan' : 'စကင်ဖတ်ရန် အသင့်ဖြစ်သည်'}</h2>
                <p className="text-sm text-slate-500 italic max-w-sm">{language === 'en' ? 'Scan the Merchant AWB or Tamper Tag to verify inbound inventory.' : 'ဂိုဒေါင်အတွင်းသို့သွင်းရန် AWB သို့မဟုတ် Tamper Tag ကို စကင်ဖတ်ပါ။'}</p>
              </div>
              <Button onClick={() => setIsScanning(true)} className="h-16 w-full max-w-sm bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl text-lg uppercase shadow-xl shadow-emerald-900/40">
                {language === 'en' ? 'Open Secure Scanner' : 'စကင်ဖတ်မည်'}
              </Button>
            </>
          ) : (
            <div className="w-full max-w-md rounded-[3rem] overflow-hidden border-4 border-emerald-500/50 shadow-2xl">
               <QRScanner onScan={() => setIsScanning(false)} expectedType="AWB" />
               <Button onClick={() => setIsScanning(false)} variant="ghost" className="w-full h-14 text-slate-500 font-black">CANCEL</Button>
            </div>
          )}
        </Card>

        <div className="lg:col-span-5 space-y-8">
           <Card className="bg-[#05080F] border-none ring-1 ring-white/5 rounded-[2.5rem] p-8 space-y-6">
              <h3 className="text-white font-black uppercase italic border-b border-white/5 pb-4 flex items-center gap-3">
                 <ShieldCheck className="text-emerald-500" /> {language === 'en' ? 'Integrity Rules' : 'လုံခြုံရေး စည်းမျဉ်းများ'}
              </h3>
              <div className="space-y-4 text-xs text-slate-400 italic">
                 <p className="flex gap-3"><CheckCircle2 size={14} className="text-emerald-500 shrink-0"/> {language === 'en' ? 'AWB must be activated by merchant.' : 'ကုန်သည်မှ AWB အား အသက်သွင်းပြီးဖြစ်ရမည်။'}</p>
                 <p className="flex gap-3"><CheckCircle2 size={14} className="text-emerald-500 shrink-0"/> {language === 'en' ? 'Tamper seal must be untorn.' : 'လုံခြုံရေးတံဆိပ်သည် ပျက်စီးမှုမရှိစေရ။'}</p>
              </div>
           </Card>
           <Card className="bg-rose-500/5 border-none ring-1 ring-rose-500/20 rounded-[2.5rem] p-8 flex items-center gap-6">
              <AlertCircle className="text-rose-500 h-10 w-10 shrink-0" />
              <div>
                 <p className="text-white font-black text-sm uppercase italic">{language === 'en' ? 'Found Damage?' : 'ပျက်စီးမှုတွေ့ရှိသလား?'}</p>
                 <p className="text-[10px] text-rose-500/80 font-mono uppercase mt-1">{language === 'en' ? 'Trigger Incident Protocol' : 'ချက်ချင်း တိုင်ကြားရန်'}</p>
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { generateTrackingNumber, SHIPMENT_STATUS, MOCK_TOWNSHIPS } from '@/lib/constants';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, QrCode, MapPin, Truck, Globe, CheckCircle2 } from 'lucide-react';

export default function PickupRequest() {
  const { toggleLang, lang } = useLanguage();
  const [step, setStep] = useState(1);
  const [tracking] = useState(generateTrackingNumber('BTX'));

  return (
    <div className="p-10 space-y-10 bg-[#0B101B] min-h-screen text-slate-300">
      <div className="flex justify-between items-center bg-[#05080F] p-10 rounded-[3rem] border border-white/5 shadow-2xl">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-sky-500/10 rounded-2xl border border-sky-500/20"><Package className="h-8 w-8 text-sky-500" /></div>
          <div>
            <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">
              {lang === 'en' ? 'Pickup Request' : 'ပစ္စည်းလာယူရန် တောင်းဆိုချက်'}
            </h1>
            <p className="text-sky-500 font-mono text-xs mt-1 uppercase tracking-widest">
               {lang === 'en' ? 'L3_MERCHANT_PORTAL' : 'အဆင့်_၃_ကုန်သည်ပေါ်တယ်'}
            </p>
          </div>
        </div>
        <Button onClick={toggleLang} className="bg-white/5 border border-white/10 text-white h-12 px-8 rounded-xl">
           <Globe className="mr-2 h-4 w-4" /> {lang === 'en' ? "မြန်မာစာ" : "English"}
        </Button>
      </div>

      <div className="max-w-4xl mx-auto">
        {step === 1 ? (
          <Card className="bg-[#05080F] border-none ring-1 ring-white/5 rounded-[3rem] p-12 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{lang === 'en' ? 'Receiver Name' : 'လက်ခံသူအမည်'}</label>
                <input className="w-full bg-[#0B101B] border border-white/10 rounded-2xl h-14 px-6 text-white" placeholder="Mg Mg" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{lang === 'en' ? 'Destination Township' : 'ပို့ဆောင်မည့် မြို့နယ်'}</label>
                <select className="w-full bg-[#0B101B] border border-white/10 rounded-2xl h-14 px-6 text-white">
                  {MOCK_TOWNSHIPS.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <Button onClick={() => setStep(2)} className="w-full bg-sky-600 hover:bg-sky-500 text-white font-black h-16 rounded-2xl text-lg uppercase tracking-widest">
              {lang === 'en' ? 'Generate Shipment Tag' : 'ပို့ဆောင်မှု တက်ဂ် ထုတ်ယူမည်'}
            </Button>
          </Card>
        ) : (
          <Card className="bg-[#05080F] border-none ring-1 ring-emerald-500/30 rounded-[3rem] p-12 text-center space-y-6">
            <CheckCircle2 className="h-16 w-16 text-emerald-500 mx-auto" />
            <h2 className="text-3xl font-black text-white">{lang === 'en' ? 'Request Confirmed' : 'တောင်းဆိုမှု အောင်မြင်သည်'}</h2>
            <div className="bg-white p-8 rounded-3xl w-fit mx-auto">
               <QrCode size={180} className="text-black" />
               <p className="text-black font-mono font-bold mt-4 text-xs">{tracking}</p>
            </div>
            <p className="text-slate-500 max-w-md mx-auto italic">
              {lang === 'en' ? 'Status: TT_ASSIGNED_AT_PICKUP. A rider will arrive shortly.' : 'အခြေအနေ: ပစ္စည်းလာယူရန် စောင့်ဆိုင်းဆဲ။'}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}

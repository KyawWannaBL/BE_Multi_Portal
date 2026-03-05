import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode, Camera, PenTool, CheckCircle, Phone, MapPin, Globe, ArrowLeft } from 'lucide-react';

export default function RiderDelivery() {
  const { t, toggleLang, lang } = useLanguage();
  const [activeView, setActiveView] = useState<'scan' | 'pod'>('scan');

  // Mock Data for Rider Jobs
  const currentJobs = [
    { id: 'BTX-9901', name: 'U Ba', address: 'N. Okkalapa', phone: '09792970776' },
    { id: 'BTX-9902', name: 'Daw Mya', address: 'South Dagon', phone: '09450012345' }
  ];

  return (
    <div className="min-h-screen bg-[#0B101B] text-slate-300 flex flex-col">
      {/* Mobile Header (မိုဘိုင်းလ် ခေါင်းစဉ်) */}
      <header className="bg-[#05080F] p-6 border-b border-white/5 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Button onClick={toggleLang} variant="ghost" className="h-10 w-10 p-0 rounded-full border border-white/10">
            <Globe className="h-4 w-4 text-emerald-500" />
          </Button>
          <h1 className="font-black text-white text-sm uppercase tracking-widest">
            {lang === 'en' ? 'RDR Portal' : 'ပို့ဆောင်ရေး ပေါ်တယ်'}
          </h1>
        </div>
        <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full font-bold">L2_ONLINE</span>
      </header>

      <main className="p-6 flex-1 space-y-6">
        {activeView === 'scan' ? (
          <div className="space-y-6">
            <Card className="bg-[#05080F] border-none ring-1 ring-white/5 p-8 rounded-[2.5rem] text-center space-y-4">
              <QrCode size={64} className="mx-auto text-sky-500 mb-2" />
              <h2 className="text-xl font-black text-white">{lang === 'en' ? 'Scan to Deliver' : 'ပို့ဆောင်ရန် စကင်ဖတ်ပါ'}</h2>
              <Button onClick={() => setActiveView('pod')} className="w-full h-16 bg-sky-600 hover:bg-sky-500 text-white font-black rounded-2xl text-lg shadow-xl shadow-sky-900/40">
                <Camera className="mr-2 h-6 w-6" /> {lang === 'en' ? 'Start Scanner' : 'စကင်နာ ဖွင့်မည်'}
              </Button>
            </Card>

            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{lang === 'en' ? 'In-Bag Shipments' : 'အိတ်အတွင်းရှိ ပါဆယ်များ'}</h3>
              {currentJobs.map((job) => (
                <div key={job.id} className="bg-[#05080F] p-5 rounded-2xl border border-white/5 flex justify-between items-center">
                  <div>
                    <p className="text-white font-bold">{job.id}</p>
                    <p className="text-[10px] text-slate-500">{job.name} • {job.address}</p>
                  </div>
                  <Button variant="ghost" className="h-12 w-12 rounded-xl text-emerald-500 bg-emerald-500/5">
                    <Phone size={20} />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Button onClick={() => setActiveView('scan')} variant="ghost" className="text-slate-500">
              <ArrowLeft className="mr-2 h-4 w-4" /> {lang === 'en' ? 'Back' : 'နောက်သို့'}
            </Button>
            <Card className="bg-[#05080F] border-none ring-1 ring-white/5 rounded-[2.5rem] p-8 space-y-8">
              <div className="space-y-4 text-center">
                <PenTool className="mx-auto text-emerald-500 h-10 w-10" />
                <h2 className="text-xl font-black text-white">{lang === 'en' ? 'Capture POD' : 'ပို့ဆောင်မှု အတည်ပြုချက်'}</h2>
              </div>
              
              <div className="space-y-4">
                <div className="bg-[#0B101B] border-2 border-dashed border-white/10 h-48 rounded-2xl flex items-center justify-center relative overflow-hidden">
                   <p className="text-slate-700 text-xs italic">{lang === 'en' ? 'Recipient Signature Here' : 'လက်ခံသူ လက်မှတ်'}</p>
                </div>
                <Button variant="outline" className="w-full h-14 border-white/10 text-slate-400 rounded-xl">
                  <Camera className="mr-2 h-4 w-4" /> {lang === 'en' ? 'Photo Evidence' : 'ဓာတ်ပုံ အထောက်အထား'}
                </Button>
              </div>

              <Button className="w-full h-16 bg-emerald-600 text-white font-black rounded-2xl text-lg uppercase shadow-xl shadow-emerald-900/40">
                {lang === 'en' ? 'Confirm Delivery' : 'ပို့ဆောင်မှု အတည်ပြုမည်'}
              </Button>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}

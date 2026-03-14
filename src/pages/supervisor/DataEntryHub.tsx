import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Keyboard, Upload, FileSpreadsheet, Globe, ArrowLeft, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DataEntryHub() {
  const { lang, toggleLang } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="p-10 space-y-10 bg-[#0B101B] min-h-screen text-slate-300">
      <div className="flex justify-between items-center bg-[#05080F] p-10 rounded-[3rem] border border-white/5">
        <div className="flex items-center gap-6">
          <Button onClick={() => navigate(-1)} variant="ghost" className="p-0 text-slate-500"><ArrowLeft size={32}/></Button>
          <div>
            <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">
              {lang === 'en' ? 'Data Entry Terminal' : 'ဒေတာသွင်းယူရေး'}
            </h1>
            <p className="text-indigo-400 font-mono text-[10px] mt-1 uppercase tracking-widest italic">L4_RAPID_REGISTRY</p>
          </div>
        </div>
        <Button onClick={toggleLang} className="bg-white/5 border border-white/10 text-white h-12 px-8 rounded-xl shadow-lg">
           <Globe className="mr-2 h-4 w-4" /> {lang === 'en' ? "MY" : "EN"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="bg-[#05080F] border-none ring-1 ring-white/5 rounded-[3rem] p-12 text-center space-y-8 group hover:ring-indigo-500/50 transition-all">
           <div className="p-6 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 w-fit mx-auto">
              <Keyboard className="h-10 w-10 text-indigo-500" />
           </div>
           <div>
              <h2 className="text-2xl font-black text-white uppercase italic">{lang === 'en' ? 'Manual Registry' : 'ကိုယ်တိုင် ဖြည့်သွင်းမည်'}</h2>
              <p className="text-sm text-slate-500 mt-2 italic">{lang === 'en' ? 'Enter individual waybill data for immediate tag assignment.' : 'ပါဆယ်အချက်အလက်များကို တစ်ခုချင်း ဖြည့်သွင်းမည်။'}</p>
           </div>
           <Button className="w-full h-16 bg-white/5 border border-white/10 text-white font-black rounded-2xl uppercase tracking-widest hover:bg-white/10">Start Manual Entry</Button>
        </Card>

        <Card className="bg-[#05080F] border-none ring-1 ring-white/5 rounded-[3rem] p-12 text-center space-y-8 group hover:ring-emerald-500/50 transition-all">
           <div className="p-6 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 w-fit mx-auto">
              <FileSpreadsheet className="h-10 w-10 text-emerald-500" />
           </div>
           <div>
              <h2 className="text-2xl font-black text-white uppercase italic">{lang === 'en' ? 'Bulk CSV Upload' : 'CSV အစုလိုက် တင်မည်'}</h2>
              <p className="text-sm text-slate-500 mt-2 italic">{lang === 'en' ? 'Upload high-volume manifests for regional Office Branch processing.' : 'အချက်အလက်များကို CSV ဖိုင်ဖြင့် အစုလိုက် တင်သွင်းမည်။'}</p>
           </div>
           <Button className="w-full h-16 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl uppercase tracking-widest shadow-xl">Upload Manifest</Button>
        </Card>
      </div>
    </div>
  );
}

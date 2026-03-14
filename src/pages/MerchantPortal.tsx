import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  PackagePlus, Upload, Download, Printer, 
  Map as MapIcon, Globe, QrCode, FileSpreadsheet, 
  Search, CheckCircle2, TrendingUp, Truck 
} from 'lucide-react';

export default function MerchantPortal() {
  const { lang, toggleLang } = useLanguage();
  const [activeTab, setActiveTab] = useState('cargo');

  return (
    <div className="p-10 space-y-10 bg-[#0B101B] min-h-screen text-slate-300">
      {/* Dynamic Header (အချက်အလက် စီမံခန့်ခွဲမှု ခေါင်းစဉ်) */}
      <div className="flex justify-between items-center bg-[#05080F] p-10 rounded-[3rem] border border-white/5 shadow-2xl">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-sky-500/10 rounded-2xl border border-sky-500/20">
            <TrendingUp className="h-8 w-8 text-sky-500" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">
              {lang === 'en' ? 'Merchant Gateway' : 'ကုန်သည် စီမံခန့်ခွဲမှု'}
            </h1>
            <p className="text-sky-500 font-mono text-[10px] mt-1 uppercase tracking-widest italic">
              L0_PARTNER_COMMAND • {lang === 'en' ? 'LIVE_CARGO_SYNC' : 'ကုန်စည်_တိုက်ရိုက်စောင့်ကြည့်မှု'}
            </p>
          </div>
        </div>
        <div className="flex gap-4">
          <Button onClick={toggleLang} className="bg-white/5 border border-white/10 text-white h-12 px-8 rounded-xl shadow-lg">
             <Globe className="mr-2 h-4 w-4" /> {lang === 'en' ? "မြန်မာစာ" : "English"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Bulk Management & Registry (ပါဆယ်များ မှတ်ပုံတင်ခြင်း) */}
        <Card className="lg:col-span-7 bg-[#05080F] border-none ring-1 ring-white/5 rounded-[3rem] p-10 space-y-10">
          <div className="flex justify-between items-center">
             <h2 className="text-xl font-black text-white uppercase italic flex items-center gap-3">
                <PackagePlus className="text-emerald-500" /> {lang === 'en' ? 'Waybill Registry' : 'ပို့ဆောင်မှု မှတ်ပုံတင်'}
             </h2>
             <div className="flex gap-2">
                <Button variant="outline" className="h-10 border-white/10 text-xs font-black text-slate-400">
                   <Download size={14} className="mr-2"/> CSV TEMPLATE
                </Button>
                <Button className="h-10 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-6 rounded-xl">
                   <Upload size={14} className="mr-2"/> BULK UPLOAD
                </Button>
             </div>
          </div>

          <div className="border-2 border-dashed border-white/5 rounded-[2.5rem] p-12 text-center space-y-6">
             <FileSpreadsheet className="h-16 w-16 mx-auto text-slate-700 opacity-20" />
             <p className="text-sm text-slate-500 italic max-w-xs mx-auto">
               {lang === 'en' ? 'Upload your CSV manifest or manually register new shipments to generate labels.' : 'CSV ဖိုင်တင်ရန် သို့မဟုတ် အချက်အလက်များကို ကိုယ်တိုင်ဖြည့်သွင်းပါ။'}
             </p>
             <Button className="bg-white/5 hover:bg-white/10 text-white font-black h-14 px-10 rounded-2xl border border-white/10 uppercase tracking-widest">
                {lang === 'en' ? 'Add Single Waybill' : 'ပါဆယ်တစ်ခုချင်း ထည့်မည်'}
             </Button>
          </div>

          <div className="bg-[#0B101B] p-8 rounded-[2.5rem] border border-white/5 space-y-6">
             <div className="flex justify-between items-center">
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest italic">Generated Batch QR</p>
                <Button variant="ghost" className="text-sky-500 h-8 text-[10px] uppercase font-black tracking-widest"><Printer size={12} className="mr-2"/> PRINT ALL LABELS</Button>
             </div>
             <div className="flex items-center gap-10">
                <div className="bg-white p-4 rounded-2xl shadow-[0_0_30px_rgba(255,255,255,0.05)]">
                   <QrCode size={120} className="text-black" />
                </div>
                <div className="space-y-2">
                   <p className="text-white font-bold text-lg italic">Batch_2026_0041</p>
                   <p className="text-xs text-slate-500">12 Pending Shipments Registered</p>
                   <p className="text-[10px] text-emerald-500 font-mono mt-4 uppercase">Status: Ready_For_Rider_Scan</p>
                </div>
             </div>
          </div>
        </Card>

        {/* Live Cargo Surveillance (ကုန်စည်များ တိုက်ရိုက်ကြည့်ရှုမှု) */}
        <Card className="lg:col-span-5 bg-[#05080F] border-none ring-1 ring-white/5 rounded-[3rem] p-10 flex flex-col space-y-6">
          <h2 className="text-xl font-black text-white uppercase italic flex items-center gap-3">
             <MapIcon className="text-sky-400" /> {lang === 'en' ? 'Cargo Movement' : 'ကုန်စည် လှုပ်ရှားမှု'}
          </h2>
          <div className="flex-1 bg-[#0B101B] rounded-[2.5rem] border border-white/5 relative overflow-hidden flex items-center justify-center min-h-[300px]">
             <div className="absolute inset-0 bg-sky-500/5 animate-pulse" />
             <div className="text-center z-10">
                <Truck className="h-10 w-10 text-sky-500/30 mx-auto mb-4" />
                <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Mapbox_Live_Feed_Node_09</p>
             </div>
          </div>
          <div className="space-y-4">
             {[
               { id: 'BE-9901', statusEn: 'IN_TRANSIT', statusMy: 'လမ်းခရီးတွင်' },
               { id: 'BE-9882', statusEn: 'ARRIVED_HUB', statusMy: 'ဗဟိုဌာနသို့ရောက်သည်' }
             ].map((job, i) => (
               <div key={i} className="bg-white/5 p-5 rounded-2xl border border-white/5 flex justify-between items-center">
                  <div>
                    <p className="text-white font-black text-sm">{job.id}</p>
                    <p className="text-[10px] text-sky-400 uppercase font-mono">{lang === 'en' ? job.statusEn : job.statusMy}</p>
                  </div>
                  <Button variant="ghost" className="h-10 w-10 p-0 text-slate-500 hover:text-white"><Search size={16}/></Button>
               </div>
             ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

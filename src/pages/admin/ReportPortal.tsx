import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, FileText, Download, Printer, 
  Globe, ArrowLeft, Filter, Search, 
  TrendingUp, ShieldCheck, Landmark 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ReportPortal() {
  const { lang, toggleLang } = useLanguage();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('LOGISTICS');

  const reportCategories = [
    { id: 'LOGISTICS', nameEn: 'Logistics & Fleet', nameMy: 'ပို့ဆောင်ရေးနှင့် ယာဉ်တန်း', icon: TrendingUp },
    { id: 'FINANCE', nameEn: 'Financial Audit', nameMy: 'ဘဏ္ဍာရေး စစ်ဆေးမှု', icon: Landmark },
    { id: 'SECURITY', nameEn: 'Security & Integrity', nameMy: 'လုံခြုံရေးနှင့် စစ်ဆေးရေး', icon: ShieldCheck }
  ];

  const reportList = {
    LOGISTICS: [
      { id: 'REP-001', nameEn: 'Daily Delivery Success Rate', nameMy: 'နေ့စဉ် ပို့ဆောင်မှု အောင်မြင်မှုနှုန်း' },
      { id: 'REP-002', nameEn: 'Zonal Hub Accumulation', nameMy: 'ဒေသအလိုက် ပါဆယ်စုစည်းမှု' },
      { id: 'REP-003', nameEn: 'Rider Performance KPI', nameMy: 'ယာဉ်မောင်း စွမ်းဆောင်ရည်' }
    ],
    FINANCE: [
      { id: 'REP-101', nameEn: 'Consolidated COD Statement', nameMy: 'စုစည်းထားသော COD စာရင်း' },
      { id: 'REP-102', nameEn: 'Merchant Remittance Log', nameMy: 'ကုန်သည် ငွေထုတ်ယူမှု မှတ်တမ်း' },
      { id: 'REP-103', nameEn: 'Office Branch Vault Audit', nameMy: 'ရုံးခွဲများ၏ ငွေစာရင်း စစ်ဆေးမှု' }
    ],
    SECURITY: [
      { id: 'REP-201', nameEn: 'SEC-01 Tamper Violations', nameMy: 'လုံခြုံရေးတံဆိပ် ချိုးဖောက်မှုများ' },
      { id: 'REP-202', nameEn: 'System Access Audit', nameMy: 'စနစ်အတွင်း ဝင်ရောက်မှု မှတ်တမ်း' }
    ]
  };

  return (
    <div className="p-10 space-y-10 bg-[#0B101B] min-h-screen text-slate-300">
      <div className="flex justify-between items-center bg-[#05080F] p-10 rounded-[3rem] border border-white/5 shadow-2xl">
        <div className="flex items-center gap-6">
          <Button onClick={() => navigate(-1)} variant="ghost" className="p-0 text-slate-500 hover:text-white transition-colors">
            <ArrowLeft size={32}/>
          </Button>
          <div>
            <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">
              {lang === 'en' ? 'Intelligence Portal' : 'အချက်အလက်နှင့် အစီရင်ခံစာ ဗဟို'}
            </h1>
            <p className="text-sky-500 font-mono text-[10px] mt-1 uppercase tracking-widest italic">L4_L5_ANALYTICS_NODE</p>
          </div>
        </div>
        <Button onClick={toggleLang} className="bg-white/5 border border-white/10 text-white h-12 px-8 rounded-xl">
           <Globe className="mr-2 h-4 w-4" /> {lang === 'en' ? "မြန်မာစာ" : "English"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Success Rate', val: '98.4%', icon: TrendingUp, color: 'text-emerald-500' },
          { label: 'Pending COD', val: '12.4M', icon: Landmark, color: 'text-sky-500' },
          { label: 'Active Alerts', val: '00', icon: ShieldCheck, color: 'text-emerald-500' },
          { label: 'Growth Index', val: '+4.2%', icon: BarChart3, color: 'text-indigo-500' }
        ].map((kpi, i) => (
          <Card key={i} className="bg-[#05080F] border-none ring-1 ring-white/5 rounded-[2.5rem] p-8">
             <kpi.icon className={`h-6 w-6 mb-4 ${kpi.color}`} />
             <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{kpi.label}</p>
             <p className="text-3xl text-white font-black mt-2 italic tracking-tighter">{kpi.val}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-3 space-y-4">
           {reportCategories.map((cat) => (
             <button
               key={cat.id}
               onClick={() => setActiveCategory(cat.id)}
               className={`w-full p-6 rounded-[2rem] flex items-center gap-4 transition-all border ${activeCategory === cat.id ? 'bg-sky-600 border-sky-500 text-white shadow-xl shadow-sky-900/20' : 'bg-[#05080F] border-white/5 text-slate-500 hover:border-white/20'}`}
             >
               <cat.icon size={20} />
               <div className="text-left">
                  <p className="text-[10px] font-black uppercase tracking-widest">{cat.id}</p>
                  <p className="font-bold text-sm leading-tight">{lang === 'en' ? cat.nameEn : cat.nameMy}</p>
               </div>
             </button>
           ))}
        </div>

        <Card className="lg:col-span-9 bg-[#05080F] border-none ring-1 ring-white/5 rounded-[3rem] overflow-hidden">
          <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
             <h2 className="text-xl font-black text-white uppercase italic flex items-center gap-3">
                <FileText className="text-sky-500" /> {lang === 'en' ? 'Available Statements' : 'အစီရင်ခံစာများ'}
             </h2>
          </div>
          <div className="divide-y divide-white/5">
            {(reportList as any)[activeCategory].map((report: any) => (
              <div key={report.id} className="p-8 flex justify-between items-center group hover:bg-white/5 transition-all">
                 <div className="flex items-center gap-6">
                    <div className="h-12 w-12 rounded-2xl bg-[#0B101B] flex items-center justify-center border border-white/10 group-hover:border-sky-500/50 transition-colors">
                       <BarChart3 className="text-slate-600 group-hover:text-sky-500 transition-colors" size={20} />
                    </div>
                    <div>
                       <p className="text-white font-bold text-lg">{lang === 'en' ? report.nameEn : report.nameMy}</p>
                       <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest mt-1 italic">{report.id} • EXPORT_READY</p>
                    </div>
                 </div>
                 <div className="flex gap-3">
                    <Button className="h-12 bg-white/5 hover:bg-white/10 text-white border border-white/10 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest">
                       CSV
                    </Button>
                    <Button onClick={() => window.print()} className="h-12 bg-sky-600 hover:bg-sky-500 text-white px-8 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">
                       <Printer size={14} className="mr-2"/> {lang === 'en' ? 'GENERATE PDF' : 'PDF ထုတ်ယူမည်'}
                    </Button>
                 </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

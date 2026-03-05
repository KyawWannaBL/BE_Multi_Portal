import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, BarChart3, PieChart, Target, ArrowUpRight } from 'lucide-react';

export default function ExecutiveKPI() {
  const { lang } = useLanguage();
  
  const kpis = [
    { label: lang === 'en' ? 'Gross Revenue' : 'စုစုပေါင်း ဝင်ငွေ', val: '124.5M', growth: '+12%', color: 'text-emerald-500' },
    { label: lang === 'en' ? 'Net Profit' : 'အသားတင် အမြတ်', val: '26.9M', growth: '+8.4%', color: 'text-sky-500' },
    { label: lang === 'en' ? 'Avg Margin' : 'ပျမ်းမျှ အမြတ်ရာခိုင်နှုန်း', val: '21.6%', growth: '+2%', color: 'text-amber-500' }
  ];

  return (
    <div className="p-10 space-y-10 bg-[#0B101B] min-h-screen text-slate-300">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {kpis.map((k, i) => (
          <Card key={i} className="bg-[#05080F] border-none ring-1 ring-white/5 rounded-[2.5rem] p-8">
            <div className="flex justify-between items-start">
               <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{k.label}</p>
                  <p className="text-4xl text-white font-black mt-2 tracking-tighter">{k.val}</p>
               </div>
               <div className="bg-emerald-500/10 p-2 rounded-lg text-emerald-500 text-xs font-bold flex items-center">
                  <ArrowUpRight size={14} className="mr-1"/> {k.growth}
               </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <Card className="bg-[#05080F] border-none ring-1 ring-white/5 rounded-[3rem] p-10">
            <h3 className="text-xl font-black text-white mb-8 flex items-center gap-3 italic">
               <Target className="text-sky-500"/> {lang === 'en' ? 'Regional Performance' : 'ဒေသအလိုက် လုပ်ဆောင်ချက်'}
            </h3>
            <div className="space-y-6">
               {['Yangon', 'Mandalay', 'Nay Pyi Taw'].map((city) => (
                  <div key={city} className="space-y-2">
                     <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-500">
                        <span>{city}</span>
                        <span>{Math.floor(Math.random() * 30 + 70)}% Success</span>
                     </div>
                     <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-sky-500" style={{width: `${Math.floor(Math.random() * 30 + 70)}%`}}></div>
                     </div>
                  </div>
               ))}
            </div>
         </Card>
         <Card className="bg-[#05080F] border-none ring-1 ring-white/5 rounded-[3rem] p-10 flex items-center justify-center">
            <div className="text-center opacity-20">
               <PieChart size={64} className="mx-auto mb-4 text-emerald-500" />
               <p className="text-sm font-black uppercase tracking-[0.4em]">Advanced Volume Analytics</p>
            </div>
         </Card>
      </div>
    </div>
  );
}

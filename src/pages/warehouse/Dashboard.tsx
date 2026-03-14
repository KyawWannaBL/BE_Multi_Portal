import React from 'react';
import { useLanguageContext } from '@/lib/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Box, Truck, RefreshCw, AlertTriangle, 
  ShieldCheck, Globe, LayoutDashboard, Zap 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function WarehouseDashboard() {
  const { t, language } = useLanguageContext();
  const navigate = useNavigate();

  const stats = [
    { labelEn: 'Awaiting Receipt', labelMy: 'လက်ခံရန်ကျန်ရှိသောစာရင်း', val: '412', icon: Box, color: 'text-sky-500' },
    { labelEn: 'Ready to Dispatch', labelMy: 'ပို့ဆောင်ရန်အဆင်သင့်', val: '128', icon: Truck, color: 'text-emerald-500' },
    { labelEn: 'Damaged / Failed', labelMy: 'ပျက်စီး/ပို့ဆောင်မှုမအောင်မြင်', val: '04', icon: AlertTriangle, color: 'text-rose-500' }
  ];

  return (
    <div className="p-10 space-y-10 bg-[#0B101B] min-h-screen text-slate-300">
      {/* Executive Header */}
      <div className="flex justify-between items-center bg-[#05080F] p-10 rounded-[3rem] border border-white/5 shadow-2xl">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-sky-500/10 rounded-2xl border border-sky-500/20">
            <LayoutDashboard className="h-8 w-8 text-sky-500" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">
              {language === 'en' ? 'Warehouse Command' : 'ဂိုဒေါင်စီမံခန့်ခွဲမှုဗဟို'}
            </h1>
            <p className="text-sky-500 font-mono text-[10px] mt-1 uppercase tracking-widest italic">
              L2_NODE_OVERSIGHT • {language === 'en' ? 'ACTIVE_SORTATION' : 'လက်ရှိ_ပါဆယ်ခွဲခြားမှု_ပြုလုပ်နေသည်'}
            </p>
          </div>
        </div>
        <Button variant="outline" className="border-white/10 text-white h-12 px-6 rounded-xl">
           <Globe className="mr-2 h-4 w-4" /> {language === 'en' ? "English" : "မြန်မာစာ"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {stats.map((s, i) => (
          <Card key={i} className="bg-[#05080F] border-none ring-1 ring-white/5 rounded-[2.5rem] p-8 space-y-4 group hover:ring-sky-500/50 transition-all">
            <div className="flex justify-between">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                {language === 'en' ? s.labelEn : s.labelMy}
              </p>
              <s.icon className={`h-6 w-6 ${s.color}`} />
            </div>
            <p className="text-5xl text-white font-black tracking-tighter italic">{s.val}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card onClick={() => navigate('/admin/warehouse/receiving')} className="bg-[#05080F] border-none ring-1 ring-emerald-500/20 rounded-[3rem] p-12 cursor-pointer hover:bg-emerald-500/5 transition-all text-center space-y-6">
           <Zap className="h-16 w-16 text-emerald-500 mx-auto animate-pulse" />
           <h2 className="text-3xl font-black text-white uppercase italic">{language === 'en' ? 'Inbound Receiving' : 'ဝင်လာသောပါဆယ်များ လက်ခံခြင်း'}</h2>
           <p className="text-sm text-slate-500 italic">{language === 'en' ? 'Scan incoming merchant batches and verify Tamper Tags.' : 'ကုန်သည်များထံမှ ရောက်လာသော ပါဆယ်များကို စစ်ဆေးလက်ခံမည်။'}</p>
        </Card>
        <Card onClick={() => navigate('/admin/warehouse/dispatch')} className="bg-[#05080F] border-none ring-1 ring-sky-500/20 rounded-[3rem] p-12 cursor-pointer hover:bg-sky-500/5 transition-all text-center space-y-6">
           <Truck className="h-16 w-16 text-sky-500 mx-auto" />
           <h2 className="text-3xl font-black text-white uppercase italic">{language === 'en' ? 'Outbound Dispatch' : 'အပြင်သို့ ပို့ဆောင်ရန် စီစဉ်ခြင်း'}</h2>
           <p className="text-sm text-slate-500 italic">{language === 'en' ? 'Group parcels by destination and assign to Rider Batch QR.' : 'မြို့နယ်အလိုက် ပါဆယ်များကို ခွဲခြားပြီး ယာဉ်မောင်းများထံ လွှဲပြောင်းမည်။'}</p>
        </Card>
      </div>
    </div>
  );
}

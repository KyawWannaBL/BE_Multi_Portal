import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatCurrency } from '@/lib/constants';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Trophy, Clock, Zap, Map, 
  Globe, Search, TrendingUp, Users 
} from 'lucide-react';

export default function RiderKPI() {
  const { toggleLang, lang } = useLanguage();

  // Scrutinized Mock Data (Bilingual)
  const riderStats = [
    { name: 'Kyaw Kyaw', hub: 'Yangon', deliveries: 42, speed: '14m', earnings: 85000, status: 'EXCELLENT' },
    { name: 'Min Min', hub: 'Mandalay', deliveries: 38, speed: '18m', earnings: 72000, status: 'GOOD' },
    { name: 'Hsu Myat', hub: 'NPT', deliveries: 31, speed: '22m', earnings: 64000, status: 'STABLE' }
  ];

  return (
    <div className="p-10 space-y-10 bg-[#0B101B] min-h-screen text-slate-300">
      {/* Dynamic Header (ခေါင်းစဉ်အပိုင်း) */}
      <div className="flex justify-between items-center bg-[#05080F] p-10 rounded-[3rem] border border-white/5 shadow-2xl">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20">
            <Trophy className="h-8 w-8 text-amber-500" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">
              {lang === 'en' ? 'Rider KPI Tracker' : 'ယာဉ်မောင်း စွမ်းဆောင်ရည် မှတ်တမ်း'}
            </h1>
            <p className="text-amber-500 font-mono text-xs mt-1 uppercase tracking-widest">
              L5_PERFORMANCE_METRICS • {lang === 'en' ? 'REAL_TIME_SURVEILLANCE' : 'တိုက်ရိုက်_စောင့်ကြည့်စစ်ဆေးမှု'}
            </p>
          </div>
        </div>
        <div className="flex gap-4">
          <Button onClick={toggleLang} className="bg-white/5 border border-white/10 text-white h-12 px-8 rounded-xl hover:bg-emerald-600 transition-all">
             <Globe className="mr-2 h-4 w-4" /> {lang === 'en' ? "မြန်မာစာ" : "English"}
          </Button>
        </div>
      </div>

      {/* Global Performance Cards (အထွေထွေ အချက်အလက်များ) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: lang === 'en' ? 'Active Riders' : 'လက်ရှိ ဝန်ထမ်းများ', val: '334', icon: Users, color: 'text-sky-400' },
          { label: lang === 'en' ? 'Avg Delivery Time' : 'ပျမ်းမျှ ပို့ဆောင်ချိန်', val: '19.4 min', icon: Clock, color: 'text-amber-400' },
          { label: lang === 'en' ? 'Daily Commissions' : 'နေ့စဉ် ကော်မရှင် စုစုပေါင်း', val: '4.2M MMK', icon: TrendingUp, color: 'text-emerald-400' }
        ].map((kpi, i) => (
          <Card key={i} className="bg-[#05080F] border-none ring-1 ring-white/5 rounded-[2.5rem] p-8 flex items-center gap-6">
            <div className="p-3 bg-white/5 rounded-xl"><kpi.icon className={kpi.color} /></div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{kpi.label}</p>
              <p className="text-3xl text-white font-black">{kpi.val}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Personnel Efficiency Matrix (ဝန်ထမ်းများ၏ စွမ်းဆောင်ရည် ဇယား) */}
      <Card className="bg-[#05080F] border-none ring-1 ring-white/5 rounded-[3rem] overflow-hidden">
        <div className="p-8 border-b border-white/5 flex justify-between items-center">
          <h2 className="text-xl font-black text-white uppercase italic">
            {lang === 'en' ? 'Performance Leaderboard' : 'စွမ်းဆောင်ရည် အကောင်းဆုံးစာရင်း'}
          </h2>
          <div className="relative w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input className="w-full bg-[#0B101B] border border-white/10 rounded-full h-12 pl-12 text-sm" placeholder="Filter by Name or Hub..." />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 font-mono text-slate-500 uppercase text-[10px] tracking-widest">
              <tr>
                <th className="p-6">{lang === 'en' ? 'Rider' : 'ယာဉ်မောင်း အမည်'}</th>
                <th className="p-6">{lang === 'en' ? 'Hub' : 'ဗဟိုဌာန'}</th>
                <th className="p-6">{lang === 'en' ? 'EOD Deliveries' : 'ပို့ဆောင်မှု အရေအတွက်'}</th>
                <th className="p-6">{lang === 'en' ? 'Speed' : 'ပျမ်းမျှ အချိန်'}</th>
                <th className="p-6">{lang === 'en' ? 'Earnings' : 'ရရှိငွေ'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {riderStats.map((rider, i) => (
                <tr key={i} className="hover:bg-white/5 transition-all">
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-black text-[10px]">{rider.name[0]}</div>
                      <span className="font-bold text-white">{rider.name}</span>
                    </div>
                  </td>
                  <td className="p-6 text-slate-400 font-mono text-xs">{rider.hub}</td>
                  <td className="p-6 font-black text-white">{rider.deliveries}</td>
                  <td className="p-6 text-sky-400 font-bold">{rider.speed}</td>
                  <td className="p-6 font-black text-emerald-400">{formatCurrency(rider.earnings)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

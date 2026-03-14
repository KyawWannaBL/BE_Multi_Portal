import React, { useState } from 'react';
import { AdminShell } from '@/components/layout/AdminShell';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  BarChart3, TrendingUp, DollarSign, Package, 
  Clock, AlertTriangle, ArrowUpRight, ArrowDownRight 
} from 'lucide-react';

export default function AnalyticsPortal() {
  const { lang } = useLanguage();
  const t = (en: string, my: string) => (lang === 'en' ? en : my);

  return (
    <AdminShell title={t("Executive Intelligence", "အမှုဆောင်အရာရှိချုပ် အစီရင်ခံစာ")}>
      <div className="space-y-8 animate-in fade-in duration-700">
        
        {/* Row 1: Financial & Volume KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Revenue" value="45.2M" unit="Ks" trend="+12%" up={true} icon={<DollarSign className="text-emerald-500" />} />
          <StatCard title="Total Shipments" value="12,450" unit="pkts" trend="+5.2%" up={true} icon={<Package className="text-blue-500" />} />
          <StatCard title="Avg. Delivery Time" value="1.4" unit="Days" trend="-0.2d" up={true} icon={<Clock className="text-amber-500" />} />
          <StatCard title="Dispute Rate" value="0.8%" unit="" trend="+0.1%" up={false} icon={<AlertTriangle className="text-rose-500" />} />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* Row 2 Left: Revenue vs Expense Chart Area */}
          <div className="xl:col-span-8 bg-[#0E1525] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-blue-500" /> {t("Financial Growth", "ဘဏ္ဍာရေး တိုးတက်မှု")}
              </h3>
              <select className="bg-[#05080F] border border-white/10 rounded-lg px-3 py-1 text-[10px] text-gray-400 outline-none">
                <option>Last 30 Days</option>
                <option>Last Quarter</option>
              </select>
            </div>
            
            <div className="h-64 w-full bg-gradient-to-t from-blue-500/5 to-transparent rounded-2xl flex items-end justify-between px-4 pb-2 border-b border-white/5">
              {[40, 70, 45, 90, 65, 80, 95].map((h, i) => (
                <div key={i} className="w-12 bg-blue-600/40 border-t-2 border-blue-400 rounded-t-lg transition-all hover:bg-blue-600" style={{ height: `${h}%` }} />
              ))}
            </div>
            <div className="flex justify-between mt-4 px-4 text-[10px] font-black text-gray-600 uppercase">
              <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
            </div>
          </div>

          {/* Row 2 Right: Top Performing Hubs */}
          <div className="xl:col-span-4 bg-[#0E1525] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl">
            <h3 className="text-xs font-black uppercase tracking-widest text-white mb-6">{t("Hub Efficiency", "ဂိုဒေါင် စွမ်းဆောင်ရည်")}</h3>
            <div className="space-y-6">
              <HubProgress name="Yangon Central" progress={98} color="bg-emerald-500" />
              <HubProgress name="Mandalay City" progress={82} color="bg-blue-500" />
              <HubProgress name="Naypyitaw Hub" progress={75} color="bg-amber-500" />
              <HubProgress name="Bago Station" progress={42} color="bg-rose-500" />
            </div>
          </div>
        </div>

      </div>
    </AdminShell>
  );
}

function StatCard({ title, value, unit, trend, up, icon }: any) {
  return (
    <div className="bg-[#0E1525] border border-white/5 p-6 rounded-[2rem] shadow-xl group hover:border-white/10 transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-white/5 rounded-xl">{icon}</div>
        <div className={`flex items-center gap-1 text-[10px] font-black ${up ? 'text-emerald-500' : 'text-rose-500'}`}>
          {up ? <ArrowUpRight size={12}/> : <ArrowDownRight size={12}/>} {trend}
        </div>
      </div>
      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{title}</p>
      <h2 className="text-3xl font-black text-white mt-1 font-mono">{value} <span className="text-sm font-bold opacity-50">{unit}</span></h2>
    </div>
  );
}

function HubProgress({ name, progress, color }: any) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
        <span className="text-gray-300">{name}</span>
        <span className="text-white">{progress}%</span>
      </div>
      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-1000`} style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}

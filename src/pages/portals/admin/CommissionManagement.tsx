import React, { useState } from 'react';
import { AdminShell } from '@/components/layout/AdminShell';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Users, DollarSign, Settings, 
  CheckCircle2, AlertCircle, Search, Edit3 
} from 'lucide-react';

export default function CommissionManagement() {
  const { lang } = useLanguage();
  const t = (en: string, my: string) => (lang === 'en' ? en : my);

  const [rate, setRate] = useState(500); // Standard rate per delivery

  const riders = [
    { name: 'Aung Kyaw', deliveries: 142, earned: 71000, status: 'PENDING_PAYOUT' },
    { name: 'Zaw Min', deliveries: 98, earned: 49000, status: 'PAID' },
    { name: 'Hla Win', deliveries: 210, earned: 105000, status: 'PENDING_PAYOUT' },
  ];

  return (
    <div className="p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Commission Setting Card */}
      <div className="bg-gradient-to-r from-teal-900/40 to-[#0A0F1C] border border-teal-500/30 rounded-[2.5rem] p-8 shadow-2xl flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-teal-500/10 rounded-2xl border border-teal-500/30">
            <Settings className="h-8 w-8 text-teal-400" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-widest">{t("Global Commission Rate", "ကော်မရှင်နှုန်းထား")}</h2>
            <p className="text-xs text-teal-400 font-bold uppercase mt-1">{t("Per Successful Delivery", "အောင်မြင်သောပို့ဆောင်မှုတစ်ခုလျှင်")}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <input 
            type="number" 
            value={rate} 
            onChange={(e) => setRate(Number(e.target.value))}
            className="w-32 bg-[#05080F] border border-teal-500/30 rounded-xl px-4 py-3 text-2xl font-black text-white font-mono text-center focus:border-teal-500 outline-none"
          />
          <button className="h-12 px-8 bg-teal-600 hover:bg-teal-500 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-teal-500/20">
            {t("Update Rate", "နှုန်းထားပြင်မည်")}
          </button>
        </div>
      </div>

      {/* Rider Performance vs Earnings */}
      <div className="bg-[#0E1525] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-white/5 bg-[#0A0F1C]/50 flex justify-between items-center">
          <h3 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2">
            <Users className="h-4 w-4 text-teal-500" /> {t("Rider Payout Management", "Rider များ၏ ငွေပေးချေမှုစီမံခန့်ခွဲမှု")}
          </h3>
        </div>
        <table className="w-full text-left">
          <thead className="bg-[#0A0F1C] text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 border-b border-white/5">
            <tr>
              <th className="p-4">Rider Name</th>
              <th className="p-4">Deliveries</th>
              <th className="p-4">Total Earned</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-xs">
            {riders.map((rider, idx) => (
              <tr key={idx} className="hover:bg-white/5 transition-colors">
                <td className="p-4 font-bold text-white uppercase">{rider.name}</td>
                <td className="p-4 font-mono">{rider.deliveries}</td>
                <td className="p-4 font-mono font-bold text-teal-400">{rider.earned.toLocaleString()} Ks</td>
                <td className="p-4">
                  <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest ${rider.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'}`}>
                    {rider.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button className="px-4 py-1.5 bg-teal-500/10 text-teal-500 hover:bg-teal-500 hover:text-white rounded-lg transition-all text-[9px] font-black uppercase">
                    Process Payout
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { ExecutionShell } from '@/components/layout/ExecutionShell';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Wallet, TrendingUp, ArrowDownCircle, 
  CheckCircle2, Clock, History, Landmark 
} from 'lucide-react';

export default function RiderWallet() {
  const { lang } = useLanguage();
  const t = (en: string, my: string) => (lang === 'en' ? en : my);

  const [balance, setBalance] = useState(45500);
  const [codHand, setCodHand] = useState(125000); // Cash collected but not yet remitted

  const transactions = [
    { id: 'TX-992', type: 'COMMISSION', amount: 500, label: 'BTM-10293 Delivery', time: '10:30 AM' },
    { id: 'TX-991', type: 'COMMISSION', amount: 500, label: 'BTM-10294 Delivery', time: '11:15 AM' },
    { id: 'TX-990', type: 'PAYOUT', amount: -25000, label: 'Weekly Payout', time: 'Yesterday' },
  ];

  return (
    <ExecutionShell title={t("Rider Wallet", "ပိုက်ဆံအိတ်")}>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Earnings Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-emerald-900/40 to-[#0A0F1C] border border-emerald-500/30 p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10"><TrendingUp className="h-24 w-24 text-emerald-400" /></div>
            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{t("Available Commission", "ရရှိနိုင်သော ကော်မရှင်")}</p>
            <h2 className="text-4xl font-black text-white mt-2 font-mono">{balance.toLocaleString()} <span className="text-sm">Ks</span></h2>
            <button className="mt-6 flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase rounded-xl transition-all shadow-lg shadow-emerald-500/20">
              <Landmark className="h-3 w-3" /> {t("Request Payout", "ငွေထုတ်ရန် တောင်းဆိုမည်")}
            </button>
          </div>

          <div className="bg-[#0E1525] border border-white/5 p-8 rounded-[2.5rem] shadow-xl">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{t("COD Cash in Hand", "လက်ဝယ်ရှိ COD ငွေ")}</p>
            <h2 className="text-4xl font-black text-white mt-2 font-mono">{codHand.toLocaleString()} <span className="text-sm">Ks</span></h2>
            <p className="text-[10px] text-amber-500 font-bold mt-4 flex items-center gap-2">
              <Clock className="h-3 w-3" /> {t("Remit to Hub today", "ယနေ့ ဂိုဒေါင်သို့ အပ်ရန်")}
            </p>
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-[#0E1525] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-white/5 bg-[#0A0F1C]/50 flex justify-between items-center">
            <h3 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2">
              <History className="h-4 w-4 text-emerald-500" /> {t("Recent Activity", "လတ်တလော လုပ်ဆောင်ချက်များ")}
            </h3>
          </div>
          <div className="divide-y divide-white/5">
            {transactions.map((tx) => (
              <div key={tx.id} className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${tx.amount > 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                    {tx.amount > 0 ? <TrendingUp size={16} /> : <ArrowDownCircle size={16} />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{tx.label}</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{tx.time} • {tx.id}</p>
                  </div>
                </div>
                <p className={`text-lg font-black font-mono ${tx.amount > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()} <span className="text-xs">Ks</span>
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </ExecutionShell>
  );
}

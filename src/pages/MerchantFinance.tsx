import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Wallet, DollarSign, ArrowDownCircle, History, 
  Banknote, Globe, ShieldCheck, Download, 
  ArrowLeft, CreditCard, Landmark 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function MerchantFinance() {
  const { toggleLang, lang } = useLanguage();
  const navigate = useNavigate();

  // Integrated Financial Data
  const financialSummary = {
    available: "1,245,000",
    pending: "450,000",
    totalPaid: "12,800,000"
  };

  const transactions = [
    { id: 'REM-8821', type: 'WITHDRAWAL', amount: '500,000', status: 'COMPLETED', date: '2026-03-01' },
    { id: 'COD-9902', type: 'COLLECTION', amount: '15,000', status: 'SETTLED', date: '2026-03-02' },
    { id: 'REM-8819', type: 'WITHDRAWAL', amount: '1,000,000', status: 'PROCESSING', date: '2026-03-02' }
  ];

  return (
    <div className="p-10 space-y-10 bg-[#0B101B] min-h-screen text-slate-300">
      {/* Header (ဘဏ္ဍာရေး စီမံခန့်ခွဲမှု ခေါင်းစဉ်) */}
      <div className="flex justify-between items-center bg-[#05080F] p-10 rounded-[3rem] border border-white/5 shadow-2xl">
        <div className="flex items-center gap-6">
          <button onClick={() => navigate(-1)} className="p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all">
            <ArrowLeft className="h-6 w-6 text-slate-400" />
          </button>
          <div>
            <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">
              {lang === 'en' ? 'Remittance Hub' : 'ငွေလွှဲပြောင်းမှု ဗဟိုဌာန'}
            </h1>
            <p className="text-emerald-500 font-mono text-[10px] mt-1 uppercase tracking-widest italic">
              L0_FINANCIAL_OVERSIGHT • {lang === 'en' ? 'SECURE_SETTLEMENT' : 'လုံခြုံသော_ငွေပေးချေမှု'}
            </p>
          </div>
        </div>
        <Button onClick={toggleLang} className="bg-white/5 border border-white/10 text-white h-12 px-8 rounded-xl shadow-lg">
           <Globe className="mr-2 h-4 w-4" /> {lang === 'en' ? "မြန်မာစာ" : "English"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Wallet Card (ပင်မ ပိုက်ဆံအိတ်) */}
        <Card className="lg:col-span-2 bg-gradient-to-br from-[#05080F] to-[#0B101B] border-none ring-1 ring-emerald-500/20 rounded-[3rem] p-12 relative overflow-hidden">
          <div className="relative z-10 space-y-8">
             <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                   <Wallet className="text-emerald-500 h-6 w-6" />
                </div>
                <p className="text-sm font-black text-slate-400 uppercase tracking-widest">
                  {lang === 'en' ? 'Withdrawable COD Balance' : 'ထုတ်ယူနိုင်သော ငွေပမာဏ'}
                </p>
             </div>
             <div>
                <h2 className="text-6xl font-black text-white tracking-tighter italic">
                  {financialSummary.available} <span className="text-2xl text-emerald-500">MMK</span>
                </h2>
                <p className="text-xs text-slate-500 mt-4 font-mono uppercase tracking-widest">
                   Last Updated: March 2, 2026 • 16:45
                </p>
             </div>
             <div className="flex gap-4 pt-4">
                <Button className="h-16 px-10 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl text-lg uppercase tracking-widest shadow-xl shadow-emerald-900/40">
                   <ArrowDownCircle className="mr-2 h-6 w-6" /> {lang === 'en' ? 'Request Withdrawal' : 'ငွေထုတ်ယူမည်'}
                </Button>
                <Button variant="outline" className="h-16 px-8 border-white/10 text-slate-400 hover:text-white rounded-2xl uppercase font-black text-xs">
                   <CreditCard className="mr-2 h-4 w-4" /> Bank Settings
                </Button>
             </div>
          </div>
          <Landmark className="absolute -right-10 -bottom-10 h-64 w-64 text-emerald-500/5 rotate-12" />
        </Card>

        {/* Secondary Stats (အခြားအချက်အလက်များ) */}
        <div className="space-y-8">
           <Card className="bg-[#05080F] border-none ring-1 ring-white/5 rounded-[2.5rem] p-8">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{lang === 'en' ? 'Pending Settlement' : 'စစ်ဆေးဆဲ ငွေပမာဏ'}</p>
              <p className="text-2xl font-black text-amber-500 mt-2 italic">{financialSummary.pending} K</p>
           </Card>
           <Card className="bg-[#05080F] border-none ring-1 ring-white/5 rounded-[2.5rem] p-8">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{lang === 'en' ? 'Total Remitted' : 'စုစုပေါင်း ထုတ်ယူပြီးငွေ'}</p>
              <p className="text-2xl font-black text-sky-400 mt-2 italic">{financialSummary.totalPaid} K</p>
           </Card>
           <div className="p-6 bg-white/5 rounded-[2.5rem] border border-white/5 flex items-center gap-4">
              <ShieldCheck className="text-emerald-500" />
              <p className="text-[10px] text-slate-500 font-mono uppercase leading-tight italic">
                 {lang === 'en' ? 'All payouts are verified under SEC-01 protocols.' : 'ငွေပေးချေမှု အားလုံးကို လုံခြုံရေးစနစ်ဖြင့် စစ်ဆေးပါသည်။'}
              </p>
           </div>
        </div>
      </div>

      {/* Transaction Audit Table (ငွေကြေးမှတ်တမ်း ဇယား) */}
      <Card className="bg-[#05080F] border-none ring-1 ring-white/5 rounded-[3rem] overflow-hidden">
        <div className="p-8 border-b border-white/5 flex justify-between items-center">
          <h2 className="text-xl font-black text-white uppercase italic flex items-center gap-3">
             <History className="text-sky-500" /> {lang === 'en' ? 'Audit Statement' : 'ငွေစာရင်း စစ်ဆေးချက်'}
          </h2>
          <Button variant="ghost" className="text-[10px] font-black text-sky-500 uppercase tracking-widest hover:bg-sky-500/10">
            <Download size={14} className="mr-2"/> Export PDF Statement
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-[10px] text-slate-500 font-mono uppercase tracking-widest">
              <tr>
                <th className="p-8">Reference ID</th>
                <th className="p-8">Transaction Type</th>
                <th className="p-8">Date</th>
                <th className="p-8">Amount</th>
                <th className="p-8 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {transactions.map((tx) => (
                <tr key={tx.id} className="group hover:bg-white/5 transition-all">
                  <td className="p-8 font-mono text-xs text-white/80">{tx.id}</td>
                  <td className="p-8">
                    <span className="bg-white/5 text-slate-400 px-3 py-1 rounded-full text-[10px] font-black uppercase border border-white/5">
                      {tx.type}
                    </span>
                  </td>
                  <td className="p-8 text-slate-500 text-xs">{tx.date}</td>
                  <td className={`p-8 font-black ${tx.type === 'WITHDRAWAL' ? 'text-rose-500' : 'text-emerald-500'}`}>
                    {tx.type === 'WITHDRAWAL' ? '-' : '+'}{tx.amount} MMK
                  </td>
                  <td className="p-8 text-right">
                    <span className={`text-[10px] font-black uppercase ${tx.status === 'COMPLETED' || tx.status === 'SETTLED' ? 'text-emerald-500' : 'text-amber-500 animate-pulse'}`}>
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

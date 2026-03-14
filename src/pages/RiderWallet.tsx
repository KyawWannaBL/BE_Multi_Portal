import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet, TrendingUp, History, ArrowRight, Globe, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function RiderWallet() {
  const { lang, toggleLang } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0B101B] text-slate-300 p-6 space-y-6">
      <div className="flex justify-between items-center">
        <Button onClick={() => navigate(-1)} variant="ghost" className="text-slate-500"><ArrowLeft /></Button>
        <Button onClick={toggleLang} variant="outline" className="border-white/5 text-xs h-8 rounded-full">
           {lang === 'en' ? "MY" : "EN"}
        </Button>
      </div>

      <Card className="bg-gradient-to-br from-emerald-600 to-emerald-800 p-8 rounded-[2.5rem] border-none shadow-2xl relative overflow-hidden">
        <div className="relative z-10 space-y-2">
           <p className="text-emerald-100 text-xs font-black uppercase tracking-widest">{lang === 'en' ? 'Available Balance' : 'လက်ကျန်ငွေ'}</p>
           <h2 className="text-4xl font-black text-white tracking-tighter">145,000 MMK</h2>
           <div className="pt-4 flex gap-4">
              <Button className="bg-white text-emerald-800 font-black rounded-xl h-10 px-6 uppercase text-[10px]">Withdraw</Button>
           </div>
        </div>
        <Wallet className="absolute -right-6 -bottom-6 h-40 w-40 text-white/10 rotate-12" />
      </Card>

      <div className="space-y-4">
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2 italic flex items-center gap-2">
          <History size={12}/> {lang === 'en' ? 'Recent Earnings' : 'မကြာသေးမီက ဝင်ငွေများ'}
        </h3>
        {[
          { id: 'BE-9901', amt: '1,500', date: 'Today' },
          { id: 'BE-9882', amt: '2,200', date: 'Yesterday' }
        ].map((tx, i) => (
          <div key={i} className="bg-[#05080F] p-5 rounded-2xl border border-white/5 flex justify-between items-center">
            <div>
              <p className="text-white font-bold text-sm">#{tx.id}</p>
              <p className="text-[10px] text-slate-500 uppercase font-mono">{tx.date}</p>
            </div>
            <p className="text-emerald-500 font-black">+{tx.amt} K</p>
          </div>
        ))}
      </div>
    </div>
  );
}

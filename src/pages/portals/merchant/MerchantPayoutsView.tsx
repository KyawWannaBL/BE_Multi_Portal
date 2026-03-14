import React from 'react';
import { MerchantShell } from '@/components/layout/MerchantShell';
import { useLanguage } from '@/contexts/LanguageContext';
import { Wallet, ArrowDownRight, ArrowUpRight, Building2 } from 'lucide-react';

export default function MerchantPayoutsView() {
  const { lang } = useLanguage();
  const t = (en: string, my: string) => (lang === 'en' ? en : my);

  return (
    <MerchantShell title={t("Financials", "ငွေစာရင်းများ")}>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Master Balance Card */}
        <div className="bg-gradient-to-br from-indigo-900/60 to-[#0E1525] border border-indigo-500/30 p-8 rounded-[2rem] shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Wallet className="h-6 w-6 text-indigo-400" />
              <h2 className="text-sm font-black tracking-widest uppercase text-indigo-300">{t("Current Clearing Balance", "လက်ရှိ ရှင်းလင်းရန်ကျန်ငွေ")}</h2>
            </div>
            <p className="text-4xl font-black text-white font-mono mt-2">825,000 <span className="text-lg text-indigo-400">MMK</span></p>
            <p className="text-xs text-indigo-200/50 mt-2">{t("Next payout scheduled for: Tomorrow, 10:00 AM", "နောက်တစ်ကြိမ် ငွေလွှဲမည့်အချိန်: မနက်ဖြန် နံနက် ၁၀ နာရီ")}</p>
          </div>
          <div className="bg-[#0A0F1C]/50 p-4 rounded-xl border border-indigo-500/20 space-y-2 min-w-[250px]">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Gross COD Collected</span>
              <span className="font-mono text-emerald-400">+850,000</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Delivery Fees Owed</span>
              <span className="font-mono text-rose-400">-25,000</span>
            </div>
            <div className="border-t border-white/10 pt-2 flex justify-between text-xs font-bold">
              <span className="text-white">Net Receivable</span>
              <span className="font-mono text-indigo-400">825,000</span>
            </div>
          </div>
        </div>

        {/* Bank Account Info */}
        <div className="bg-[#0E1525] border border-white/5 p-6 rounded-[2rem] flex items-center gap-4">
          <div className="p-4 bg-[#0A0F1C] rounded-full border border-white/5"><Building2 className="h-6 w-6 text-gray-400" /></div>
          <div>
            <p className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">{t("Receiving Bank Account", "ငွေလွှဲလက်ခံမည့် ဘဏ်အကောင့်")}</p>
            <p className="text-sm font-bold text-white mt-1">KBZ Bank • 0123 4567 8910</p>
          </div>
        </div>

        {/* Ledger History */}
        <div className="bg-[#0E1525] border border-white/5 rounded-[2rem] p-6">
          <h2 className="text-sm font-black tracking-widest uppercase text-white mb-6">{t("Payout History", "ငွေလွှဲမှတ်တမ်းများ")}</h2>
          <div className="divide-y divide-white/5">
            {[
              { date: 'Oct 24, 2023', id: 'TRX-9981', amount: 1250000, status: 'COMPLETED' },
              { date: 'Oct 17, 2023', id: 'TRX-8821', amount: 980000, status: 'COMPLETED' },
              { date: 'Oct 10, 2023', id: 'TRX-7712', amount: 1450000, status: 'COMPLETED' },
            ].map(trx => (
              <div key={trx.id} className="flex justify-between items-center py-4">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-emerald-500/10 rounded-lg"><ArrowUpRight className="h-4 w-4 text-emerald-500" /></div>
                  <div>
                    <p className="font-bold text-white text-sm">{trx.date}</p>
                    <p className="text-[10px] font-mono text-gray-500 mt-1">{trx.id}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono font-black text-emerald-400">{trx.amount.toLocaleString()} MMK</p>
                  <p className="text-[10px] font-bold text-emerald-500 tracking-widest uppercase mt-1">{trx.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </MerchantShell>
  );
}

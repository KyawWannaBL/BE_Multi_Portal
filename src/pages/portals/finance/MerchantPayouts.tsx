import React, { useState } from 'react';
import { FinanceShell } from '@/components/layout/FinanceShell';
import { useLanguage } from '@/contexts/LanguageContext';
import { Search, Building2, CreditCard, CheckCircle2 } from 'lucide-react';

interface MerchantBalance { id: string; name: string; bankAccount: string; totalCodCollected: number; totalDeliveryFees: number; awbCount: number; }

export default function MerchantPayouts() {
  const { lang } = useLanguage();
  const t = (en: string, my: string) => (lang === 'en' ? en : my);

  const [merchants, setMerchants] = useState<MerchantBalance[]>([
    { id: 'M-1092', name: 'Fashion Hub MM', bankAccount: 'KBZ - 0123456789', totalCodCollected: 1500000, totalDeliveryFees: 120000, awbCount: 45 },
    { id: 'M-8812', name: 'Tech Store Yangon', bankAccount: 'CB - 9876543210', totalCodCollected: 850000, totalDeliveryFees: 25000, awbCount: 10 },
  ]);

  const [selectedMerchant, setSelectedMerchant] = useState<MerchantBalance | null>(null);

  const handleRemit = () => {
    if (!selectedMerchant) return;
    setMerchants(prev => prev.filter(m => m.id !== selectedMerchant.id));
    setSelectedMerchant(null);
    alert(t("Payout registered to Ledger successfully.", "ငွေလွှဲပြောင်းမှု အောင်မြင်ပါသည်။"));
  };

  return (
    <FinanceShell title={t("Merchant Payouts", "ရောင်းချသူသို့ ငွေလွှဲပြောင်းမှု")}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-140px)] animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        <div className="lg:col-span-5 flex flex-col bg-[#0E1525] border border-white/5 rounded-[2rem] shadow-xl overflow-hidden">
          <div className="p-6 border-b border-white/5 space-y-4 bg-[#0A0F1C]/50">
            <h2 className="text-xs font-black tracking-widest uppercase text-gray-400">{t("Pending Remittances", "လွှဲပြောင်းရန်ကျန်ရှိသော")}</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {merchants.map(m => (
              <button key={m.id} onClick={() => setSelectedMerchant(m)} className={`w-full text-left p-4 rounded-xl border transition-all ${selectedMerchant?.id === m.id ? 'bg-blue-500/10 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.15)]' : 'bg-[#0A0F1C] border-white/5 hover:border-gray-600'}`}>
                <div className="flex justify-between items-start mb-2">
                  <span className={`font-bold ${selectedMerchant?.id === m.id ? 'text-white' : 'text-gray-300'}`}>{m.name}</span>
                  <span className="text-[10px] font-mono text-gray-500">{m.id}</span>
                </div>
                <div className="text-xs text-blue-400 font-black">Net: {(m.totalCodCollected - m.totalDeliveryFees).toLocaleString()} MMK</div>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-7 flex flex-col">
          {selectedMerchant ? (
            <div className="bg-[#0E1525] border border-white/5 rounded-[2rem] shadow-xl flex flex-col h-full overflow-hidden">
              <div className="p-6 border-b border-white/5 bg-[#0A0F1C]/50 flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-full"><Building2 className="h-6 w-6 text-blue-500" /></div>
                <div><h2 className="text-xl font-black text-white uppercase">{selectedMerchant.name}</h2><p className="text-xs text-gray-500 font-mono mt-1">{selectedMerchant.bankAccount}</p></div>
              </div>

              <div className="flex-1 p-8 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#0A0F1C] p-5 rounded-2xl border border-white/5"><p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Total COD Collected</p><p className="text-xl font-black text-white font-mono mt-1">+{selectedMerchant.totalCodCollected.toLocaleString()}</p></div>
                  <div className="bg-[#0A0F1C] p-5 rounded-2xl border border-white/5"><p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Delivery Fees Owed to BE</p><p className="text-xl font-black text-rose-400 font-mono mt-1">-{selectedMerchant.totalDeliveryFees.toLocaleString()}</p></div>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-6 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-blue-500">Net Payout Amount</p>
                    <p className="text-4xl font-black text-white font-mono mt-2">{(selectedMerchant.totalCodCollected - selectedMerchant.totalDeliveryFees).toLocaleString()} <span className="text-lg text-blue-500">MMK</span></p>
                  </div>
                  <CreditCard className="h-10 w-10 text-blue-500 opacity-50" />
                </div>
              </div>

              <div className="p-6 bg-[#0A0F1C] border-t border-white/5">
                <button onClick={handleRemit} className="w-full h-16 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all">
                  <CheckCircle2 className="h-5 w-5" /> {t("Mark as Paid & Clear Ledger", "ငွေပေးချေပြီးဖြစ်ကြောင်း မှတ်သားမည်")}
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full bg-[#0E1525] border border-white/5 rounded-[2rem] flex flex-col items-center justify-center text-gray-600"><Building2 className="h-16 w-16 opacity-20 mb-4" /><p className="text-xs font-bold tracking-widest uppercase">Select a merchant</p></div>
          )}
        </div>
      </div>
    </FinanceShell>
  );
}

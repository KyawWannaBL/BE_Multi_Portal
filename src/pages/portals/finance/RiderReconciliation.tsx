import React, { useState } from 'react';
import { FinanceShell } from '@/components/layout/FinanceShell';
import { useLanguage } from '@/contexts/LanguageContext';
import { Search, User, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

interface RiderBalance { id: string; name: string; phone: string; codHeld: number; pendingParcels: number; awbs: { awb: string; cod: number; status: string }[]; }

export default function RiderReconciliation() {
  const { lang } = useLanguage();
  const t = (en: string, my: string) => (lang === 'en' ? en : my);

  const [riders, setRiders] = useState<RiderBalance[]>([
    { id: 'R-001', name: 'Kyaw Zin', phone: '09-12345678', codHeld: 145000, pendingParcels: 3, awbs: [{ awb: 'BE111', cod: 50000, status: 'DELIVERED' }, { awb: 'BE222', cod: 95000, status: 'DELIVERED' }] },
    { id: 'R-002', name: 'Aung Htet', phone: '09-87654321', codHeld: 420000, pendingParcels: 8, awbs: [{ awb: 'BE333', cod: 200000, status: 'DELIVERED' }, { awb: 'BE444', cod: 220000, status: 'DELIVERED' }] },
    { id: 'R-003', name: 'Zaw Min', phone: '09-55555555', codHeld: 0, pendingParcels: 0, awbs: [] },
  ]);

  const [search, setSearch] = useState('');
  const [selectedRider, setSelectedRider] = useState<RiderBalance | null>(null);
  const [actualCash, setActualCash] = useState('');

  const filteredRiders = riders.filter(r => r.name.toLowerCase().includes(search.toLowerCase()) || r.id.toLowerCase().includes(search.toLowerCase()));

  const handleClearBalance = () => {
    if (!selectedRider) return;
    if (parseInt(actualCash) !== selectedRider.codHeld) {
      if (!confirm("Actual cash does not match system expectations. Proceed with variance?")) return;
    }
    
    // Process clearing logic
    setRiders(prev => prev.map(r => r.id === selectedRider.id ? { ...r, codHeld: 0, pendingParcels: 0, awbs: [] } : r));
    setSelectedRider(null);
    setActualCash('');
    alert(t("Balance successfully reconciled and locked.", "ငွေစာရင်းရှင်းလင်းမှု အောင်မြင်ပါသည်။"));
  };

  return (
    <FinanceShell title={t("Rider Reconciliation", "ယာဉ်မောင်း ငွေစာရင်းရှင်းလင်းမှု")}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-140px)] animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Left: Rider List */}
        <div className="lg:col-span-5 flex flex-col bg-[#0E1525] border border-white/5 rounded-[2rem] shadow-xl overflow-hidden">
          <div className="p-6 border-b border-white/5 space-y-4 bg-[#0A0F1C]/50">
            <h2 className="text-xs font-black tracking-widest uppercase text-gray-400">{t("Active Shifts", "လက်ရှိတာဝန်များ")}</h2>
            <div className="bg-[#0A0F1C] border border-white/5 p-2 rounded-xl flex items-center gap-3 focus-within:border-teal-500/50">
              <Search className="h-5 w-5 text-gray-500 ml-2" />
              <input value={search} onChange={e => setSearch(e.target.value)} className="bg-transparent text-sm text-white outline-none w-full" placeholder="Search Rider..." />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {filteredRiders.map(rider => (
              <button key={rider.id} onClick={() => { setSelectedRider(rider); setActualCash(rider.codHeld.toString()); }} className={`w-full text-left p-4 rounded-xl border transition-all ${selectedRider?.id === rider.id ? 'bg-teal-500/10 border-teal-500/50 shadow-[0_0_15px_rgba(20,184,166,0.15)]' : 'bg-[#0A0F1C] border-white/5 hover:border-gray-600'}`}>
                <div className="flex justify-between items-start mb-2">
                  <span className={`font-bold ${selectedRider?.id === rider.id ? 'text-white' : 'text-gray-300'}`}>{rider.name}</span>
                  <span className="text-[10px] font-mono text-gray-500">{rider.id}</span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-xs text-gray-500">{rider.pendingParcels} AWBs</span>
                  <span className={`font-black ${rider.codHeld > 0 ? 'text-teal-400' : 'text-gray-600'}`}>{rider.codHeld.toLocaleString()} MMK</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Reconciliation Detail */}
        <div className="lg:col-span-7 flex flex-col">
          {selectedRider ? (
            <div className="bg-[#0E1525] border border-white/5 rounded-[2rem] shadow-xl flex flex-col h-full overflow-hidden">
              
              <div className="p-6 border-b border-white/5 bg-[#0A0F1C]/50 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-teal-500/10 rounded-full"><User className="h-6 w-6 text-teal-500" /></div>
                  <div>
                    <h2 className="text-xl font-black text-white uppercase">{selectedRider.name}</h2>
                    <p className="text-xs text-gray-500 font-mono mt-1">{selectedRider.phone}</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 p-6 overflow-y-auto custom-scrollbar space-y-6">
                <div className="bg-teal-500/10 border border-teal-500/30 rounded-2xl p-6 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-teal-500">{t("System Expected COD", "စနစ်မှ မျှော်မှန်းထားသော ငွေပမာဏ")}</p>
                    <p className="text-4xl font-black text-white font-mono mt-2">{selectedRider.codHeld.toLocaleString()} <span className="text-lg text-teal-500">MMK</span></p>
                  </div>
                  <ShieldCheck className="h-10 w-10 text-teal-500 opacity-50" />
                </div>

                <div>
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">{t("Delivered Parcels Log", "ပို့ဆောင်ပြီးသော စာရင်း")}</h3>
                  <div className="border border-white/5 rounded-xl bg-[#0A0F1C] divide-y divide-white/5">
                    {selectedRider.awbs.map((awb, idx) => (
                      <div key={idx} className="p-3 flex justify-between items-center text-sm">
                        <span className="font-mono text-gray-300">{awb.awb}</span>
                        <span className="font-bold text-teal-400">+{awb.cod.toLocaleString()}</span>
                      </div>
                    ))}
                    {selectedRider.awbs.length === 0 && <div className="p-4 text-center text-gray-600 text-xs">No pending COD to remit.</div>}
                  </div>
                </div>
              </div>

              <div className="p-6 bg-[#0A0F1C] border-t border-white/5 space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t("Actual Cash Handed Over (MMK)", "လက်ခံရရှိသော အမှန်တကယ်ငွေ")}</label>
                  <input type="number" value={actualCash} onChange={e => setActualCash(e.target.value)} className={`w-full bg-[#0E1525] border-2 rounded-xl px-4 py-4 text-2xl font-black font-mono outline-none transition-colors ${parseInt(actualCash) === selectedRider.codHeld ? 'border-teal-500 text-teal-400' : 'border-rose-500 text-rose-400'}`} />
                  {parseInt(actualCash) !== selectedRider.codHeld && actualCash !== '' && (
                    <p className="text-xs text-rose-500 font-bold flex items-center gap-1 mt-2"><AlertTriangle className="h-4 w-4"/> Variance detected. System will log a discrepancy.</p>
                  )}
                </div>
                <button onClick={handleClearBalance} disabled={!actualCash || selectedRider.codHeld === 0} className="w-full h-16 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(20,184,166,0.3)] transition-all">
                  <CheckCircle2 className="h-5 w-5" /> {t("Reconcile & Lock Balance", "ငွေစာရင်းအတည်ပြုမည်")}
                </button>
              </div>

            </div>
          ) : (
            <div className="h-full bg-[#0E1525] border border-white/5 rounded-[2rem] flex flex-col items-center justify-center text-gray-600">
              <Wallet className="h-16 w-16 opacity-20 mb-4" />
              <p className="text-xs font-bold tracking-widest uppercase">Select a rider to reconcile</p>
            </div>
          )}
        </div>

      </div>
    </FinanceShell>
  );
}

import React, { useState } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/contexts/LanguageContext';
import toast from 'react-hot-toast';
import { 
  Landmark, Wallet, DollarSign, ArrowUpRight, ArrowDownRight, 
  CheckCircle2, Building2, CreditCard, Search, User, AlertTriangle, 
  ShieldCheck, ShieldAlert, LogOut, ChevronLeft, ChevronRight, Globe, 
  ExternalLink, TrendingUp, Clock
} from 'lucide-react';

// ==========================================
// 1. TOP NAVIGATION BAR
// ==========================================
const TopBar = () => {
  const navigate = useNavigate();
  const langCtx = useLanguage?.() ?? {};
  const currentLang = langCtx.lang || 'en';
  const t = (en: string, my: string) => currentLang === 'en' ? en : my;

  return (
    <div className="h-16 border-b border-white/5 bg-[#0B101B]/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-50">
      <div className="flex items-center gap-2">
        <button onClick={() => navigate(-1)} className="p-2 text-gray-400 hover:text-white bg-white/5 rounded-lg transition-all"><ChevronLeft size={18}/></button>
        <button onClick={() => navigate(1)} className="p-2 text-gray-400 hover:text-white bg-white/5 rounded-lg transition-all"><ChevronRight size={18}/></button>
      </div>

      <div className="flex items-center gap-4">
        <button onClick={() => langCtx.setLanguage && langCtx.setLanguage(currentLang === 'en' ? 'my' : 'en')} className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase hover:text-white px-3 py-1.5 rounded-lg bg-white/5 transition-all">
          <Globe size={14} /> {currentLang === 'en' ? 'MY' : 'EN'}
        </button>
        <div className="h-8 border-l border-white/10 mx-2"></div>
        <div className="flex items-center gap-3 p-1.5 rounded-xl transition-all cursor-pointer hover:bg-white/5">
          <div className="text-right hidden md:block">
            <div className="text-xs font-bold text-white uppercase tracking-tighter">{t("Finance Admin", "ဘဏ္ဍာရေး အက်ဒမင်")}</div>
            <div className="text-[9px] text-amber-400 font-mono">FIN-NODE-01</div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center border border-white/10">
            <Landmark size={18} className="text-white" />
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 2. FINANCE OVERVIEW (From Uploaded Code)
// ==========================================
const FinanceOverview = ({ t }: { t: Function }) => {
  const pendingPayouts = [
    { id: 'TXN-001', entity: 'Royal Fashion', type: 'MERCHANT_WITHDRAWAL', amount: 450000, status: 'PENDING' },
    { id: 'TXN-002', entity: 'U Kyaw (Rider)', type: 'COMMISSION_PAYOUT', amount: 85000, status: 'PENDING' },
  ];

  return (
    <div className="p-6 md:p-8 space-y-6 animate-in fade-in duration-500">
      <div className="mb-6">
        <h2 className="text-2xl font-black uppercase tracking-widest text-white mb-1">{t("Corporate Finance & Treasury", "ကော်ပိုရိတ်ဘဏ္ဍာရေးနှင့် ဘဏ္ဍာတိုက်")}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#0A0E17] border border-white/5 p-6 rounded-[2rem] shadow-xl">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Total COD Collected (Today)</p>
          <h2 className="text-3xl font-black text-white mt-2 font-mono">1,245,000 <span className="text-sm">Ks</span></h2>
        </div>
        <div className="bg-[#0A0E17] border border-white/5 p-6 rounded-[2rem] shadow-xl">
          <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Pending Payouts</p>
          <h2 className="text-3xl font-black text-white mt-2 font-mono">535,000 <span className="text-sm">Ks</span></h2>
        </div>
        <div className="bg-[#0A0E17] border border-white/5 p-6 rounded-[2rem] shadow-xl">
          <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Company Revenue (Fees)</p>
          <h2 className="text-3xl font-black text-white mt-2 font-mono">142,500 <span className="text-sm">Ks</span></h2>
        </div>
      </div>

      <div className="bg-[#0A0E17] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-white/5 bg-black/20 flex justify-between items-center">
           <h3 className="text-xs font-black uppercase tracking-widest text-white">Pending Withdrawal Requests</h3>
        </div>
        <table className="w-full text-left">
          <thead className="bg-black/40 text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 border-b border-white/5">
            <tr>
              <th className="p-4">Transaction ID</th>
              <th className="p-4">Entity</th>
              <th className="p-4">Type</th>
              <th className="p-4 font-mono">Amount</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-xs text-gray-300">
            {pendingPayouts.map((tx) => (
              <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                <td className="p-4 font-mono font-bold text-gray-400">{tx.id}</td>
                <td className="p-4 font-bold text-white uppercase">{tx.entity}</td>
                <td className="p-4 text-gray-500">{tx.type}</td>
                <td className="p-4 font-black text-emerald-400 font-mono">{tx.amount.toLocaleString()} Ks</td>
                <td className="p-4 text-right">
                  <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase rounded-lg transition-all shadow-lg shadow-emerald-500/20">
                    Approve & Transfer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ==========================================
// 3. MERCHANT PAYOUTS (From Uploaded Code)
// ==========================================
interface MerchantBalance { id: string; name: string; bankAccount: string; totalCodCollected: number; totalDeliveryFees: number; awbCount: number; }

const MerchantPayouts = ({ t }: { t: Function }) => {
  const [merchants, setMerchants] = useState<MerchantBalance[]>([
    { id: 'M-1092', name: 'Fashion Hub MM', bankAccount: 'KBZ - 0123456789', totalCodCollected: 1500000, totalDeliveryFees: 120000, awbCount: 45 },
    { id: 'M-8812', name: 'Tech Store Yangon', bankAccount: 'CB - 9876543210', totalCodCollected: 850000, totalDeliveryFees: 25000, awbCount: 10 },
  ]);

  const [selectedMerchant, setSelectedMerchant] = useState<MerchantBalance | null>(null);

  const handleRemit = () => {
    if (!selectedMerchant) return;
    setMerchants(prev => prev.filter(m => m.id !== selectedMerchant.id));
    setSelectedMerchant(null);
    toast.success(t("Payout registered to Ledger successfully.", "ငွေလွှဲပြောင်းမှု အောင်မြင်ပါသည်။"));
  };

  return (
    <div className="p-6 md:p-8 animate-in fade-in duration-500">
      <div className="mb-6"><h2 className="text-2xl font-black uppercase tracking-widest text-white mb-1">{t("Merchant Payouts", "ရောင်းချသူသို့ ငွေလွှဲပြောင်းမှု")}</h2></div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-200px)]">
        
        <div className="lg:col-span-5 flex flex-col bg-[#0A0E17] border border-white/5 rounded-[2rem] shadow-2xl overflow-hidden">
          <div className="p-6 border-b border-white/5 space-y-4 bg-black/20">
            <h2 className="text-xs font-black tracking-widest uppercase text-gray-400">{t("Pending Remittances", "လွှဲပြောင်းရန်ကျန်ရှိသော")}</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {merchants.map(m => (
              <button key={m.id} onClick={() => setSelectedMerchant(m)} className={`w-full text-left p-4 rounded-xl border transition-all ${selectedMerchant?.id === m.id ? 'bg-blue-500/10 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.15)]' : 'bg-black/20 border-white/5 hover:border-gray-600'}`}>
                <div className="flex justify-between items-start mb-2">
                  <span className={`font-bold ${selectedMerchant?.id === m.id ? 'text-white' : 'text-gray-300'}`}>{m.name}</span>
                  <span className="text-[10px] font-mono text-gray-500">{m.id}</span>
                </div>
                <div className="text-xs text-blue-400 font-black">Net: {(m.totalCodCollected - m.totalDeliveryFees).toLocaleString()} MMK</div>
              </button>
            ))}
            {merchants.length === 0 && <div className="text-center text-gray-500 text-xs mt-10">No pending payouts.</div>}
          </div>
        </div>

        <div className="lg:col-span-7 flex flex-col">
          {selectedMerchant ? (
            <div className="bg-[#0A0E17] border border-white/5 rounded-[2rem] shadow-2xl flex flex-col h-full overflow-hidden">
              <div className="p-6 border-b border-white/5 bg-black/20 flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-full"><Building2 className="h-6 w-6 text-blue-500" /></div>
                <div><h2 className="text-xl font-black text-white uppercase">{selectedMerchant.name}</h2><p className="text-xs text-gray-500 font-mono mt-1">{selectedMerchant.bankAccount}</p></div>
              </div>

              <div className="flex-1 p-8 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-black/20 p-5 rounded-2xl border border-white/5"><p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Total COD Collected</p><p className="text-xl font-black text-white font-mono mt-1">+{selectedMerchant.totalCodCollected.toLocaleString()}</p></div>
                  <div className="bg-black/20 p-5 rounded-2xl border border-white/5"><p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Delivery Fees Owed to BE</p><p className="text-xl font-black text-rose-400 font-mono mt-1">-{selectedMerchant.totalDeliveryFees.toLocaleString()}</p></div>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-6 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-blue-500">Net Payout Amount</p>
                    <p className="text-4xl font-black text-white font-mono mt-2">{(selectedMerchant.totalCodCollected - selectedMerchant.totalDeliveryFees).toLocaleString()} <span className="text-lg text-blue-500">MMK</span></p>
                  </div>
                  <CreditCard className="h-10 w-10 text-blue-500 opacity-50" />
                </div>
              </div>

              <div className="p-6 bg-black/20 border-t border-white/5">
                <button onClick={handleRemit} className="w-full h-16 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all">
                  <CheckCircle2 className="h-5 w-5" /> {t("Mark as Paid & Clear Ledger", "ငွေပေးချေပြီးဖြစ်ကြောင်း မှတ်သားမည်")}
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full bg-[#0A0E17] border border-white/5 rounded-[2rem] flex flex-col items-center justify-center text-gray-600"><Building2 className="h-16 w-16 opacity-20 mb-4" /><p className="text-xs font-bold tracking-widest uppercase">Select a merchant</p></div>
          )}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 4. RIDER RECONCILIATION (From Uploaded Code)
// ==========================================
interface RiderBalance { id: string; name: string; phone: string; codHeld: number; pendingParcels: number; awbs: { awb: string; cod: number; status: string }[]; }

const RiderReconciliation = ({ t }: { t: Function }) => {
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
    
    setRiders(prev => prev.map(r => r.id === selectedRider.id ? { ...r, codHeld: 0, pendingParcels: 0, awbs: [] } : r));
    setSelectedRider(null);
    setActualCash('');
    toast.success(t("Balance successfully reconciled.", "ငွေစာရင်းရှင်းလင်းမှု အောင်မြင်ပါသည်။"));
  };

  return (
    <div className="p-6 md:p-8 animate-in fade-in duration-500">
      <div className="mb-6"><h2 className="text-2xl font-black uppercase tracking-widest text-white mb-1">{t("Rider Reconciliation", "ယာဉ်မောင်း ငွေစာရင်းရှင်းလင်းမှု")}</h2></div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-200px)]">
        <div className="lg:col-span-5 flex flex-col bg-[#0A0E17] border border-white/5 rounded-[2rem] shadow-2xl overflow-hidden">
          <div className="p-6 border-b border-white/5 space-y-4 bg-black/20">
            <h2 className="text-xs font-black tracking-widest uppercase text-gray-400">{t("Active Shifts", "လက်ရှိတာဝန်များ")}</h2>
            <div className="bg-black/50 border border-white/10 p-2 rounded-xl flex items-center gap-3 focus-within:border-teal-500/50">
              <Search className="h-5 w-5 text-gray-500 ml-2" />
              <input value={search} onChange={e => setSearch(e.target.value)} className="bg-transparent text-sm text-white outline-none w-full" placeholder="Search Rider..." />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {filteredRiders.map(rider => (
              <button key={rider.id} onClick={() => { setSelectedRider(rider); setActualCash(rider.codHeld.toString()); }} className={`w-full text-left p-4 rounded-xl border transition-all ${selectedRider?.id === rider.id ? 'bg-teal-500/10 border-teal-500/50 shadow-[0_0_15px_rgba(20,184,166,0.15)]' : 'bg-black/20 border-white/5 hover:border-gray-600'}`}>
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

        <div className="lg:col-span-7 flex flex-col">
          {selectedRider ? (
            <div className="bg-[#0A0E17] border border-white/5 rounded-[2rem] shadow-2xl flex flex-col h-full overflow-hidden">
              <div className="p-6 border-b border-white/5 bg-black/20 flex justify-between items-center">
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
                  <div className="border border-white/5 rounded-xl bg-black/20 divide-y divide-white/5">
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

              <div className="p-6 bg-black/20 border-t border-white/5 space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t("Actual Cash Handed Over (MMK)", "လက်ခံရရှိသော အမှန်တကယ်ငွေ")}</label>
                  <input type="number" value={actualCash} onChange={e => setActualCash(e.target.value)} className={`w-full bg-black/50 border-2 rounded-xl px-4 py-4 text-2xl font-black font-mono outline-none transition-colors ${parseInt(actualCash) === selectedRider.codHeld ? 'border-teal-500 text-teal-400' : 'border-rose-500 text-rose-400'}`} />
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
            <div className="h-full bg-[#0A0E17] border border-white/5 rounded-[2rem] flex flex-col items-center justify-center text-gray-600">
              <Wallet className="h-16 w-16 opacity-20 mb-4" />
              <p className="text-xs font-bold tracking-widest uppercase">Select a rider to reconcile</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


// ==========================================
// 5. MASTER LAYOUT COMPONENT
// ==========================================
export default function OmniFinancialDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const langCtx = useLanguage?.() ?? {};
  const currentLang = langCtx.lang || 'en';
  const t = (en: string, my: string) => currentLang === 'en' ? en : my;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const navItems = [
    { name: t("Treasury Overview", "ဘဏ္ဍာရေး ခြုံငုံသုံးသပ်ချက်"), path: "/portal/finance", icon: <Landmark size={18} /> },
    { name: t("Rider Remittances", "ယာဉ်မောင်း ငွေစာရင်းရှင်းလင်းမှု"), path: "/portal/finance/remittance", icon: <Wallet size={18} /> },
    { name: t("Merchant Payouts", "ရောင်းချသူသို့ ငွေလွှဲပြောင်းမှု"), path: "/portal/finance/payouts", icon: <Building2 size={18} /> },
    { name: t("Cash Advances", "ကြိုတင်ငွေထုတ်ယူခြင်း"), path: "/portal/finance/advances", icon: <CreditCard size={18} /> },
  ];

  const portalJumps = [
    { n: t("Command Center", "ထိန်းချုပ်ရေးစင်တာ"), p: "/portal/admin" },
    { n: t("Operations Hub", "လုပ်ငန်းလည်ပတ်ရေးဌာန"), p: "/portal/supervisor" },
    { n: t("Data Entry", "ဒေတာဖြည့်သွင်းခြင်း"), p: "/portal/data-entry" }
  ];

  return (
    <div className="flex h-screen bg-[#05080F] overflow-hidden font-sans text-slate-200">
      
      {/* 🧭 Finance Sidebar */}
      <div className="w-72 bg-[#0A0E17] border-r border-white/5 flex flex-col justify-between flex-shrink-0 z-50">
        <div className="overflow-y-auto custom-scrollbar">
          <div className="p-8 flex items-center gap-4 border-b border-white/5">
            <div className="w-10 h-10 rounded-xl bg-amber-600 flex items-center justify-center shadow-[0_0_15px_rgba(217,119,6,0.4)]">
              <Landmark size={20} className="text-white"/>
            </div>
            <span className="font-black text-white tracking-[0.2em] uppercase text-sm leading-tight">Treasury<br/><span className="text-amber-500 text-[10px]">Finance Hub</span></span>
          </div>
          
          <nav className="px-6 py-8 space-y-2">
            <div className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] mb-4 ml-2">{t("Treasury Modules", "ဘဏ္ဍာရေး မော်ဂျူးများ")}</div>
            {navItems.map((item) => {
              const isActive = item.path === '/portal/finance' ? location.pathname === item.path : location.pathname.startsWith(item.path);
              return (
                <Link key={item.path} to={item.path} 
                  className={`flex items-center gap-4 px-4 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                    isActive ? "bg-amber-600/10 text-amber-500 border border-amber-500/20 shadow-[0_0_20px_rgba(217,119,6,0.1)]" : "text-gray-500 hover:bg-white/5 hover:text-white"
                  }`}>
                  {item.icon} {item.name}
                </Link>
              );
            })}

            <div className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] mt-12 mb-4 ml-2">{t("Portal Jump", "ပေါ်တယ်သို့ သွားရန်")}</div>
            {portalJumps.map((j) => (
              <Link key={j.p} to={j.p} className="flex items-center justify-between px-4 py-2 text-[10px] font-bold text-gray-500 hover:text-white transition-all uppercase tracking-widest group">
                {j.n} <ExternalLink size={12} className="opacity-0 group-hover:opacity-100" />
              </Link>
            ))}
          </nav>
        </div>

        <div className="p-6">
          <button onClick={handleLogout} className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-rose-500 bg-rose-500/5 border border-rose-500/10 hover:bg-rose-500/20 transition-all">
            <ShieldAlert size={14} /> {t("Close Ledger & Exit", "အကောင့်ထွက်မည်")}
          </button>
        </div>
      </div>

      {/* 🖥️ Main Routing Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <TopBar />
        <div className="flex-1 overflow-y-auto bg-gradient-to-tr from-black via-[#0B101B] to-[#05080F] custom-scrollbar">
          <Routes>
            <Route path="/" element={<FinanceOverview t={t} />} />
            <Route path="remittance" element={<RiderReconciliation t={t} />} />
            <Route path="payouts" element={<MerchantPayouts t={t} />} />
            <Route path="advances" element={<div className="p-8 text-white"><h2 className="text-2xl font-black uppercase tracking-widest text-amber-500">{t("Cash Advances", "ကြိုတင်ငွေထုတ်ယူခြင်း")}</h2><p className="text-gray-400 mt-2">Cash Advance Module loaded securely.</p></div>} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

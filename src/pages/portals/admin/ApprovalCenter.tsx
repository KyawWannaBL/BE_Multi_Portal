import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  CheckCircle2, XCircle, Clock, User, 
  ArrowRight, ShieldAlert, Search, Filter 
} from 'lucide-react';

interface EditRequest {
  id: string;
  userEmail: string;
  role: string;
  field: string;
  oldValue: string;
  newValue: string;
  timestamp: string;
}

export default function ApprovalCenter() {
  const { lang } = useLanguage();
  const t = (en: string, my: string) => (lang === 'en' ? en : my);

  const [requests, setRequests] = useState<EditRequest[]>([
    { id: 'REQ-001', userEmail: 'rider_npw00001@britiumexpress.com', role: 'RIDER', field: 'Phone Number', oldValue: '091234567', newValue: '097778889', timestamp: '2 hours ago' },
    { id: 'REQ-002', userEmail: 'cashier_1@britiumexpress.com', role: 'FINANCE_USER', field: 'Full Name', oldValue: 'Cashier One', newValue: 'Daw Hla Hla', timestamp: '5 hours ago' },
  ]);

  const handleAction = (id: string, action: 'APPROVE' | 'REJECT') => {
    alert(`${action}: ${id}`);
    setRequests(requests.filter(r => r.id !== id));
  };

  return (
    <div className="p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="bg-gradient-to-br from-amber-900/20 to-[#0A0F1C] border border-amber-500/30 rounded-[2rem] p-8 shadow-2xl flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-widest">{t("Approval Center", "ခွင့်ပြုချက် စင်တာ")}</h2>
          <p className="text-xs text-amber-500 font-bold mt-2 uppercase tracking-[0.2em]">{t("Review Profile Edit Requests", "ပရိုဖိုင်ပြင်ဆင်ခွင့် တောင်းဆိုမှုများကို စစ်ဆေးရန်")}</p>
        </div>
        <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20">
          <Clock className="h-8 w-8 text-amber-500" />
        </div>
      </div>

      <div className="bg-[#0E1525] border border-white/5 rounded-[2rem] overflow-hidden shadow-xl">
        <div className="p-6 border-b border-white/5 flex flex-col md:flex-row justify-between gap-4 bg-[#0A0F1C]/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input className="w-full bg-[#05080F] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white outline-none focus:border-amber-500" placeholder="Search requests..." />
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-[#05080F] border border-white/10 rounded-xl text-[10px] font-black uppercase text-gray-400 flex items-center gap-2">
              <Filter className="h-3 w-3" /> {t("Filter", "စစ်ထုတ်မည်")}
            </button>
          </div>
        </div>

        <div className="divide-y divide-white/5">
          {requests.length === 0 ? (
            <div className="p-20 text-center flex flex-col items-center gap-4">
              <CheckCircle2 className="h-12 w-12 text-emerald-500/20" />
              <p className="text-sm font-bold text-gray-600 uppercase tracking-widest">{t("All caught up!", "လုပ်ဆောင်ရန် မရှိတော့ပါ။")}</p>
            </div>
          ) : (
            requests.map((req) => (
              <div key={req.id} className="p-6 flex flex-col xl:flex-row xl:items-center justify-between gap-6 hover:bg-[#131C31] transition-colors">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white/5 rounded-full border border-white/10"><User className="h-5 w-5 text-gray-400" /></div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-white">{req.userEmail}</p>
                      <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[8px] font-black rounded uppercase">{req.role}</span>
                    </div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{t("Requested Field:", "ပြင်ဆင်လိုသည့် အချက်အလက်:")} <span className="text-white">{req.field}</span></p>
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-[#0A0F1C] p-4 rounded-2xl border border-white/5">
                  <div className="text-center min-w-[100px]">
                    <p className="text-[8px] text-gray-500 uppercase font-black mb-1">{t("Current", "လက်ရှိ")}</p>
                    <p className="text-xs text-rose-400 font-mono line-through">{req.oldValue}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-700" />
                  <div className="text-center min-w-[100px]">
                    <p className="text-[8px] text-emerald-500 uppercase font-black mb-1">{t("Proposed", "အသစ်")}</p>
                    <p className="text-xs text-emerald-400 font-mono font-bold">{req.newValue}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleAction(req.id, 'REJECT')}
                    className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl transition-all"
                  >
                    <XCircle className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={() => handleAction(req.id, 'APPROVE')}
                    className="flex-1 xl:flex-none px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-emerald-500/20"
                  >
                    {t("Approve", "ခွင့်ပြုမည်")}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

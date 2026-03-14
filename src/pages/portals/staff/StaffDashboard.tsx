import React from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/supabase';
import { UserCheck, Package, ChevronLeft, ChevronRight, Globe, User, LogOut, Search } from 'lucide-react';

export default function StaffDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const langCtx = useLanguage?.() ?? {};
  const currentLang = langCtx.lang || 'en';
  const t = (en: string, my: string) => currentLang === 'en' ? en : my;

  return (
    <div className="flex h-screen bg-[#05080F] text-slate-200 font-sans">
      <div className="w-72 bg-[#0A0E17] border-r border-white/5 flex flex-col justify-between">
        <div>
            <div className="p-8 border-b border-white/5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-600 flex items-center justify-center"><UserCheck size={20} className="text-white"/></div>
                <span className="font-black text-white tracking-[0.2em] uppercase text-sm">General<br/><span className="text-slate-400 text-[10px]">Staff</span></span>
            </div>
            <nav className="px-6 py-8">
                <Link to="/portal/staff" className="flex items-center gap-4 px-4 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest bg-slate-600/10 text-slate-400"><Package size={18}/> {t("Recent Shipments", "လတ်တလော အော်ဒါများ")}</Link>
            </nav>
        </div>
        <div className="p-6">
          <button onClick={() => { supabase.auth.signOut(); navigate('/login'); }} className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-rose-500 bg-rose-500/5 border border-rose-500/10 hover:bg-rose-500/20 transition-all">
            <LogOut size={14} /> {t("Sign Out", "အကောင့်ထွက်မည်")}
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="h-16 border-b border-white/5 bg-[#0B101B]/80 flex items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <button onClick={()=>navigate(-1)} className="p-2 text-gray-400 hover:text-white transition-all"><ChevronLeft size={18}/></button>
            <button onClick={()=>navigate(1)} className="p-2 text-gray-400 hover:text-white transition-all"><ChevronRight size={18}/></button>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => langCtx.setLanguage && langCtx.setLanguage(currentLang === 'en' ? 'my' : 'en')} className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase hover:text-white px-3 py-1.5 rounded-lg bg-white/5 transition-all">
              <Globe size={14} /> {currentLang === 'en' ? 'MY' : 'EN'}
            </button>
            <div className="h-8 border-l border-white/10 mx-2"></div>
            <div className="flex items-center gap-3 p-1.5 rounded-xl">
                <div className="text-right hidden md:block">
                    <div className="text-xs font-bold text-white uppercase tracking-tighter">{t("General Staff", "အထွေထွေ ဝန်ထမ်း")}</div>
                    <div className="text-[9px] text-slate-400 font-mono">STF-001</div>
                </div>
                <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center border border-white/10"><User size={18} className="text-white"/></div>
            </div>
          </div>
        </div>
        <div className="flex-1 p-8 overflow-y-auto">
            <Routes>
                <Route path="/" element={
                    <div className="animate-in fade-in">
                        <h2 className="text-2xl font-black uppercase text-white mb-6">{t("Recent Shipments", "လတ်တလော အော်ဒါများ")}</h2>
                        <div className="bg-[#0A0E17] border border-white/5 rounded-2xl p-8 text-center text-gray-500 text-xs">
                            {t("Shipment list loading...", "အော်ဒါစာရင်း ရယူနေသည်...")}
                        </div>
                    </div>
                } />
            </Routes>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/supabase';
import { GitMerge, ArrowDownToLine, ArrowUpFromLine, Building, LogOut, ChevronLeft, ChevronRight, Globe, User } from 'lucide-react';

export default function BranchDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const langCtx = useLanguage?.() ?? {};
  const currentLang = langCtx.lang || 'en';
  const t = (en: string, my: string) => currentLang === 'en' ? en : my;

  const navItems = [
    { name: t("Branch Overview", "ရုံးခွဲ ခြုံငုံသုံးသပ်ချက်"), path: "/portal/branch", icon: <GitMerge size={18} /> },
    { name: t("Inbound Cargo", "ဝင်လာသော ကုန်များ"), path: "/portal/branch/inbound", icon: <ArrowDownToLine size={18} /> },
    { name: t("Outbound Dispatch", "ထွက်သွားသော ကုန်များ"), path: "/portal/branch/outbound", icon: <ArrowUpFromLine size={18} /> },
    { name: t("Office Setup", "ရုံးခွဲ ပြင်ဆင်ချက်"), path: "/portal/branch/office", icon: <Building size={18} /> },
  ];

  return (
    <div className="flex h-screen bg-[#05080F] text-slate-200 font-sans">
      <div className="w-72 bg-[#0A0E17] border-r border-white/5 flex flex-col justify-between">
        <div>
          <div className="p-8 flex items-center gap-4 border-b border-white/5">
            <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center"><GitMerge size={20} className="text-white"/></div>
            <span className="font-black text-white tracking-[0.2em] uppercase text-sm">Local<br/><span className="text-teal-400 text-[10px]">Branch</span></span>
          </div>
          <nav className="px-6 py-8 space-y-2">
            {navItems.map((item) => {
              const isActive = item.path === '/portal/branch' ? location.pathname === item.path : location.pathname.startsWith(item.path);
              return (
                <Link key={item.path} to={item.path} className={`flex items-center gap-4 px-4 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${isActive ? "bg-teal-600/10 text-teal-400" : "text-gray-500 hover:text-white"}`}>
                  {item.icon} {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="p-6"><button onClick={() => { supabase.auth.signOut(); navigate('/login'); }} className="flex items-center gap-3 w-full py-4 text-[10px] font-black uppercase text-rose-500"><LogOut size={14}/> {t("Log Out", "ထွက်မည်")}</button></div>
      </div>
      <div className="flex-1 flex flex-col">
        <div className="h-16 border-b border-white/5 bg-[#0B101B]/80 flex items-center justify-between px-6">
          <div className="flex items-center gap-2"><button onClick={()=>navigate(-1)} className="p-2 text-gray-400"><ChevronLeft size={18}/></button></div>
          <div className="flex items-center gap-4"><Globe size={14} className="text-gray-400"/> <User size={18} className="text-teal-400"/></div>
        </div>
        <div className="flex-1 overflow-y-auto p-8">
          <Routes>
            <Route path="/" element={<h2 className="text-2xl font-black uppercase text-white">{t("Branch Dashboard", "ရုံးခွဲ စာမျက်နှာ")}</h2>} />
            <Route path="inbound" element={<h2 className="text-2xl font-black uppercase text-teal-400">{t("Inbound Center", "ဝင်လာသော ကုန်များ ဗဟို")}</h2>} />
            <Route path="outbound" element={<h2 className="text-2xl font-black uppercase text-teal-400">{t("Outbound Dispatch", "ထွက်သွားသော ကုန်များ")}</h2>} />
            <Route path="office" element={<h2 className="text-2xl font-black uppercase text-teal-400">{t("Office Master Data", "ရုံးခွဲ အချက်အလက်များ")}</h2>} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

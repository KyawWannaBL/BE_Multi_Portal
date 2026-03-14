import React from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/supabase';
import { Activity, Map, QrCode, ClipboardList, LogOut, ChevronLeft, Globe, User } from 'lucide-react';

export default function OperationsDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { lang } = useLanguage?.() ?? { lang: 'en' };
  const t = (en: string, my: string) => lang === 'en' ? en : my;

  const navItems = [
    { name: t("Global Ops", "စနစ်တစ်ခုလုံး"), path: "/portal/operations", icon: <Activity size={18} /> },
    { name: t("Live Tracking", "ခြေရာခံခြင်း"), path: "/portal/operations/tracking", icon: <Map size={18} /> },
    { name: t("QR Intake", "QR ဖတ်ရန်"), path: "/portal/operations/qr-scan", icon: <QrCode size={18} /> },
    { name: t("Waybill Center", "အော်ဒါဗဟို"), path: "/portal/operations/waybills", icon: <ClipboardList size={18} /> },
  ];

  return (
    <div className="flex h-screen bg-[#05080F] text-slate-200 font-sans">
      <div className="w-72 bg-[#0A0E17] border-r border-white/5 flex flex-col justify-between">
        <div>
          <div className="p-8 flex items-center gap-4 border-b border-white/5">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center"><Activity size={20} className="text-white"/></div>
            <span className="font-black text-white tracking-[0.2em] uppercase text-sm">Master<br/><span className="text-blue-400 text-[10px]">Operations</span></span>
          </div>
          <nav className="px-6 py-8 space-y-2">
            {navItems.map((item) => {
              const isActive = item.path === '/portal/operations' ? location.pathname === item.path : location.pathname.startsWith(item.path);
              return (
                <Link key={item.path} to={item.path} className={`flex items-center gap-4 px-4 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${isActive ? "bg-blue-600/10 text-blue-400" : "text-gray-500 hover:text-white"}`}>
                  {item.icon} {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
      <div className="flex-1 flex flex-col">
        <div className="h-16 border-b border-white/5 bg-[#0B101B]/80 flex items-center justify-between px-6"><button onClick={()=>navigate(-1)} className="p-2 text-gray-400"><ChevronLeft size={18}/></button><User size={18} className="text-blue-400"/></div>
        <div className="flex-1 overflow-y-auto p-8">
          <Routes>
            <Route path="/" element={<h2 className="text-2xl font-black uppercase text-white">{t("Master Operations", "လုပ်ငန်းလည်ပတ်မှု")}</h2>} />
            <Route path="tracking" element={<h2 className="text-2xl font-black uppercase text-blue-400">{t("Global Fleet Tracking", "ယာဉ်တန်း ခြေရာခံစနစ်")}</h2>} />
            <Route path="qr-scan" element={<h2 className="text-2xl font-black uppercase text-blue-400">{t("QR / Barcode Intake", "QR ဖတ်၍ လက်ခံခြင်း")}</h2>} />
            <Route path="waybills" element={<h2 className="text-2xl font-black uppercase text-blue-400">{t("Waybill Data Center", "အော်ဒါ အချက်အလက်ဗဟို")}</h2>} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

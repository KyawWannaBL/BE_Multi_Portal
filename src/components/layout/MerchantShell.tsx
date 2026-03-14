import React, { useMemo } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, Store, UploadCloud, Printer, Wallet, Package } from "lucide-react";

export function MerchantShell({ title, children }: { title: string; children: React.ReactNode }) {
  const { lang, toggleLang } = useLanguage();
  const { logout } = useAuth() as any;
  const navigate = useNavigate();
  const t = (en: string, mm: string) => (lang === "en" ? en : mm);

  const items = useMemo(() => [
    { to: "/portal/merchant", label: t("Dashboard", "ထိန်းချုပ်ခန်း"), icon: <Store className="h-4 w-4" />, end: true },
    { to: "/portal/merchant/bulk", label: t("Bulk Upload", "အများအပြား အပ်နှံရန်"), icon: <UploadCloud className="h-4 w-4" /> },
    { to: "/portal/merchant/shipments", label: t("My Shipments", "ပို့ဆောင်မှုများ"), icon: <Package className="h-4 w-4" /> },
    { to: "/portal/merchant/wallet", label: t("My Wallet", "ငွေစာရင်း"), icon: <Wallet className="h-4 w-4" /> },
  ], [lang]);

  return (
    <div className="min-h-screen bg-[#05080F] text-slate-200 font-sans flex flex-col">
      <header className="sticky top-0 z-50 bg-[#0A0F1C]/95 backdrop-blur-md border-b border-amber-500/20 px-6 py-4 flex justify-between items-center shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-900/30 border border-amber-500/50 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.3)]">
            <Store className="h-5 w-5 text-amber-400" />
          </div>
          <h1 className="text-sm font-black text-white tracking-widest uppercase">{title}</h1>
        </div>
        <div className="flex gap-4 items-center">
          <button onClick={toggleLang} className="px-4 py-2 bg-[#0E1525] border border-white/5 text-gray-400 hover:text-white rounded-full text-[10px] font-black uppercase">
            {lang === 'en' ? 'MY' : 'EN'}
          </button>
          <button onClick={() => { logout(); navigate('/login'); }} className="p-2 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-full transition-colors">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex max-w-[1600px] w-full mx-auto p-6 gap-8">
        <aside className="w-64 shrink-0 hidden xl:block">
          <div className="bg-[#0E1525] border border-white/5 rounded-[2.5rem] p-4 space-y-2 sticky top-[100px] shadow-2xl">
            {items.map((i) => (
              <NavLink key={i.to} to={i.to} end={i.end} className={({ isActive }) => `flex items-center gap-3 px-6 py-4 rounded-2xl text-xs font-black tracking-wider uppercase transition-all ${isActive ? "bg-amber-500 text-navy-900 shadow-lg shadow-amber-500/25" : "text-gray-400 hover:bg-white/5 hover:text-white"}`}>
                {i.icon} {i.label}
              </NavLink>
            ))}
          </div>
        </aside>
        <section className="flex-1 w-full">{children}</section>
      </div>
    </div>
  );
}

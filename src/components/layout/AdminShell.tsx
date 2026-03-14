import React, { useMemo } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { 
  LogOut, ShieldAlert, CheckCircle2, 
  Trophy, Wallet, BarChart3, Settings 
} from "lucide-react";

export function AdminShell({ title, children }: { title: string; children: React.ReactNode }) {
  const { lang, toggleLang } = useLanguage();
  const { logout } = useAuth() as any;
  const navigate = useNavigate();
  const t = (en: string, mm: string) => (lang === "en" ? en : mm);

  const items = useMemo(() => [
    { to: "/portal/admin", label: t("Command Center", "ပင်မဌာန"), icon: <BarChart3 className="h-4 w-4" />, end: true },
    { to: "/portal/admin/approvals", label: t("Approvals", "ခွင့်ပြုချက်များ"), icon: <CheckCircle2 className="h-4 w-4" /> },
    { to: "/portal/admin/leaderboard", label: t("Leaderboard", "စွမ်းဆောင်ရည်ဇယား"), icon: <Trophy className="h-4 w-4" /> },
    { to: "/portal/admin/partners", label: t("Partner Wallets", "မိတ်ဖက်စာရင်း"), icon: <Wallet className="h-4 w-4" /> },
    { to: "/portal/admin/tariffs", label: t("Tariff Master", "ဈေးနှုန်းသတ်မှတ်ချက်"), icon: <Settings className="h-4 w-4" /> },
  ], [lang]);

  return (
    <div className="min-h-screen bg-[#05080F] text-slate-200 font-sans">
      <header className="sticky top-0 z-50 bg-[#0A0F1C]/95 backdrop-blur-md border-b border-amber-500/20 px-6 py-4 flex justify-between items-center shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-900/30 border border-amber-500/50 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.3)]">
            <ShieldAlert className="h-5 w-5 text-amber-400" />
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

      <div className="p-6 max-w-[1600px] mx-auto grid grid-cols-1 xl:grid-cols-12 gap-8">
        <aside className="xl:col-span-3">
          <div className="bg-[#0E1525] border border-white/5 rounded-[2.5rem] p-4 space-y-2 sticky top-[100px] shadow-2xl">
            {items.map((i) => (
              <NavLink key={i.to} to={i.to} end={i.end} className={({ isActive }) => `flex items-center gap-3 px-6 py-4 rounded-2xl text-xs font-black tracking-wider uppercase transition-all ${isActive ? "bg-amber-600 text-white shadow-lg shadow-amber-500/25" : "text-gray-400 hover:bg-white/5 hover:text-white"}`}>
                {i.icon} {i.label}
              </NavLink>
            ))}
          </div>
        </aside>
        <section className="xl:col-span-9">{children}</section>
      </div>
    </div>
  );
}

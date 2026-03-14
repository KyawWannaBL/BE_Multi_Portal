import React, { useMemo } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, Activity, Map, Navigation, ShieldCheck } from "lucide-react";

export function OperationsShell({ title, children }: { title: string; children: React.ReactNode }) {
  const { lang, toggleLang } = useLanguage();
  const { user, legacyUser, logout } = useAuth() as any;
  const navigate = useNavigate();
  const t = (en: string, mm: string) => (lang === "en" ? en : mm);

  const activeEmail = user?.email || legacyUser?.email || "ops@britium.com";

  const items = useMemo(() => [
    { to: "/portal/operations", label: t("Ops Dashboard", "လုပ်ငန်းစဉ် Dashboard"), icon: <Activity className="h-4 w-4" />, end: true },
    { to: "/portal/operations/logistics-planning", label: t("Way Planning & Generation", "လမ်းကြောင်းနှင့် ဘေလ်ထုတ်ရန်"), icon: <Navigation className="h-4 w-4" /> },
    { to: "/portal/operations/logistics-monitoring", label: t("Live Monitoring", "တိုက်ရိုက်စောင့်ကြည့်မှု"), icon: <Map className="h-4 w-4" /> },
  ], [lang]);

  return (
    <div className="min-h-screen bg-[#05080F] text-slate-200 font-sans selection:bg-blue-500/30">
      <header className="sticky top-0 z-50 bg-[#0A0F1C]/90 backdrop-blur-xl border-b border-blue-500/20 px-6 py-4 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-900/30 border border-blue-500/50 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.2)]">
            <ShieldCheck className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-sm font-black text-white tracking-widest uppercase">{title}</h1>
            <p className="text-[10px] text-blue-400 tracking-[0.2em] font-bold uppercase">National Operations</p>
          </div>
        </div>
        <div className="flex gap-4 items-center">
          <span className="text-xs font-bold text-white hidden md:block">{activeEmail}</span>
          <button onClick={toggleLang} className="px-4 py-2 bg-[#0E1525] border border-white/5 text-gray-400 hover:text-white rounded-full text-[10px] font-black">
            {lang === 'en' ? 'MY' : 'EN'}
          </button>
          <button onClick={() => { logout(); navigate('/login'); }} className="p-2 bg-rose-500/10 border border-rose-500/30 text-rose-500 hover:bg-rose-500 hover:text-white rounded-full transition-colors">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="p-6 max-w-[1600px] mx-auto grid grid-cols-1 xl:grid-cols-12 gap-8">
        <aside className="xl:col-span-3">
          <div className="bg-[#0E1525] border border-white/5 rounded-[2rem] p-4 space-y-2 sticky top-[100px] shadow-2xl">
            {items.map((i) => (
              <NavLink key={i.to} to={i.to} end={i.end} className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold tracking-wider uppercase transition-all ${isActive ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25" : "text-gray-400 hover:bg-white/5 hover:text-white"}`}>
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

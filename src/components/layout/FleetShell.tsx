import React, { useMemo } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, Truck, Settings, Fuel, Wrench, Activity, LayoutDashboard } from "lucide-react";

export function FleetShell({ title, children }: { title: string; children: React.ReactNode }) {
  const { lang, toggleLang } = useLanguage();
  const { logout } = useAuth() as any;
  const navigate = useNavigate();
  const t = (en: string, mm: string) => (lang === "en" ? en : mm);

  const items = useMemo(() => [
    { to: "/portal/fleet", label: t("Fleet Overview", "ယာဉ်စု ခြုံငုံသုံးသပ်ချက်"), icon: <LayoutDashboard className="h-4 w-4" />, end: true },
    { to: "/portal/fleet/vehicles", label: t("Vehicle List", "ယာဉ်စာရင်း"), icon: <Truck className="h-4 w-4" /> },
    { to: "/portal/fleet/maintenance", label: t("Maintenance", "ပြုပြင်ထိန်းသိမ်းမှု"), icon: <Wrench className="h-4 w-4" /> },
    { to: "/portal/fleet/fuel", label: t("Fuel Tracking", "ဆီစားနှုန်း ခြေရာခံခြင်း"), icon: <Fuel className="h-4 w-4" /> },
  ], [lang]);

  return (
    <div className="min-h-screen bg-[#05080F] text-slate-200 font-sans">
      <header className="sticky top-0 z-50 bg-[#0A0F1C]/95 backdrop-blur-md border-b border-slate-500/20 px-6 py-4 flex justify-between items-center shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-900/30 border border-slate-500/50 flex items-center justify-center shadow-[0_0_15px_rgba(100,116,139,0.3)]">
            <Truck className="h-5 w-5 text-slate-400" />
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
              <NavLink key={i.to} to={i.to} end={i.end} className={({ isActive }) => `flex items-center gap-3 px-6 py-4 rounded-2xl text-xs font-black tracking-wider uppercase transition-all ${isActive ? "bg-slate-600 text-white shadow-lg shadow-slate-500/25" : "text-gray-400 hover:bg-white/5 hover:text-white"}`}>
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

import React, { useMemo } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, Users, CalendarClock, Briefcase, FileSpreadsheet, LayoutDashboard } from "lucide-react";

export function HrShell({ title, children }: { title: string; children: React.ReactNode }) {
  const { lang, toggleLang } = useLanguage();
  const { user, legacyUser, logout } = useAuth() as any;
  const navigate = useNavigate();
  const t = (en: string, mm: string) => (lang === "en" ? en : mm);

  const activeEmail = user?.email || legacyUser?.email || "hr@britium.com";

  const items = useMemo(() => [
    { to: "/portal/hr", label: t("Overview", "ခြုံငုံသုံးသပ်ချက်"), icon: <LayoutDashboard className="h-4 w-4" />, end: true },
    { to: "/portal/hr/directory", label: t("Employee Directory", "ဝန်ထမ်းစာရင်း"), icon: <Users className="h-4 w-4" /> },
    { to: "/portal/hr/attendance", label: t("Time & Attendance", "အချိန်စာရင်းနှင့် တက်ရောက်မှု"), icon: <CalendarClock className="h-4 w-4" /> },
    { to: "/portal/hr/leaves", label: t("Leave Management", "ခွင့်ခံစားမှု စီမံရန်"), icon: <Briefcase className="h-4 w-4" /> },
    { to: "/portal/hr/payroll", label: t("Payroll & Advances", "လစာနှင့် ကြိုတင်ငွေ"), icon: <FileSpreadsheet className="h-4 w-4" /> },
  ], [lang]);

  return (
    <div className="min-h-screen bg-[#0A0F1C] text-slate-200 font-sans selection:bg-violet-500/30">
      {/* App Bar */}
      <header className="sticky top-0 z-50 bg-[#0A0F1C]/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-violet-900/20 border border-violet-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.2)]">
            <Users className="h-5 w-5 text-violet-500" />
          </div>
          <div>
            <h1 className="text-sm font-black text-white tracking-widest uppercase">{title}</h1>
            <p className="text-[10px] text-violet-500 tracking-[0.2em] font-bold uppercase">Human Resources</p>
          </div>
        </div>
        <div className="flex gap-3 items-center">
          <span className="text-xs text-gray-500 hidden md:block">{activeEmail}</span>
          <button onClick={toggleLang} className="px-4 py-2 bg-[#0E1525] border border-white/5 text-gray-400 hover:text-white rounded-full text-[10px] font-black">
            {lang === 'en' ? 'MY' : 'EN'}
          </button>
          <button onClick={() => { logout(); navigate('/login'); }} className="p-2 bg-rose-500/10 border border-rose-500/30 text-rose-500 hover:bg-rose-500 hover:text-white rounded-full transition-colors">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Layout Grid */}
      <div className="p-6 max-w-[1600px] mx-auto grid grid-cols-1 xl:grid-cols-12 gap-8">
        <aside className="xl:col-span-3">
          <div className="bg-[#0E1525] border border-white/5 rounded-[2rem] p-4 space-y-2 sticky top-[100px] shadow-2xl">
            <div className="text-[10px] font-bold text-gray-500 tracking-widest uppercase px-4 py-2">
              {t("HR Modules", "HR လုပ်ငန်းစဉ်များ")}
            </div>
            {items.map((i) => (
              <NavLink key={i.to} to={i.to} end={i.end}
                className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold tracking-wider uppercase transition-all ${
                  isActive ? "bg-violet-600 text-white shadow-lg shadow-violet-500/25" : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`}
              >
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

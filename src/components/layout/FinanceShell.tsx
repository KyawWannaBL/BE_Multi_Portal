import React, { useMemo } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, DollarSign, Wallet, ArrowRightLeft, FileSpreadsheet, LayoutDashboard } from "lucide-react";

export function FinanceShell({ title, children }: { title: string; children: React.ReactNode }) {
  const { logout } = useAuth() as any;
  const navigate = useNavigate();

  const items = useMemo(() => [
    { to: "/portal/finance", label: "Financial Overview", icon: <LayoutDashboard className="h-4 w-4" />, end: true },
    { to: "/portal/finance/wallets", label: "Merchant Wallets", icon: <Wallet className="h-4 w-4" /> },
    { to: "/portal/finance/payouts", label: "Pending Payouts", icon: <ArrowRightLeft className="h-4 w-4" /> },
    { to: "/portal/finance/ledger", label: "Master Ledger", icon: <FileSpreadsheet className="h-4 w-4" /> },
  ], []);

  return (
    <div className="min-h-screen bg-[#05080F] text-slate-200 font-sans">
      <header className="sticky top-0 z-50 bg-[#0A0F1C]/95 backdrop-blur-md border-b border-emerald-500/20 px-6 py-4 flex justify-between items-center shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-900/30 border border-emerald-500/50 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            <DollarSign className="h-5 w-5 text-emerald-400" />
          </div>
          <h1 className="text-sm font-black text-white tracking-widest uppercase">{title}</h1>
        </div>
        <button onClick={() => { logout(); navigate('/login'); }} className="p-2 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-full transition-colors">
          <LogOut className="h-4 w-4" />
        </button>
      </header>

      <div className="p-6 max-w-[1600px] mx-auto grid grid-cols-1 xl:grid-cols-12 gap-8">
        <aside className="xl:col-span-3">
          <div className="bg-[#0E1525] border border-white/5 rounded-[2.5rem] p-4 space-y-2 sticky top-[100px] shadow-2xl">
            {items.map((i) => (
              <NavLink key={i.to} to={i.to} end={i.end} className={({ isActive }) => `flex items-center gap-3 px-6 py-4 rounded-2xl text-xs font-black tracking-wider uppercase transition-all ${isActive ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/25" : "text-gray-400 hover:bg-white/5 hover:text-white"}`}>
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

import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { LogOut } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { navForRole } from "@/config/navigation";
import type { AppRole } from "@/types/roles";
import LanguageSelect from "@/components/LanguageSelect";

export default function Layout() {
  const { role, logout } = useAuth();
  const navItems = navForRole((role as AppRole) ?? null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-72 border-r border-white/10 bg-white/5 backdrop-blur">
          <div className="p-5 flex items-start justify-between gap-3">
            <div>
              <div className="text-lg font-semibold">Britium Express</div>
              <div className="text-xs text-white/60">Enterprise Portal</div>
            </div>
            <LanguageSelect />
          </div>

          <nav className="px-3 pb-6">
            <div className="space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ` +
                    (isActive
                      ? "bg-white/15 text-white"
                      : "text-white/70 hover:bg-white/10 hover:text-white")
                  }
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </NavLink>
              ))}
            </div>
          </nav>

          <div className="mt-auto p-4">
            <button
              onClick={logout}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1">
          <header className="sticky top-0 z-10 border-b border-white/10 bg-slate-950/40 backdrop-blur">
            <div className="flex items-center justify-between px-6 py-4">
              <div>
                <div className="text-sm text-white/60">Role</div>
                <div className="text-base font-semibold">{role ?? "—"}</div>
              </div>
              <div className="text-xs text-white/50">v0.2</div>
            </div>
          </header>

          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

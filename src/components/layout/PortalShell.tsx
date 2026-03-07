import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import TierBadge from "@/components/TierBadge";
import { PortalSidebar } from "@/components/layout/PortalSidebar";

export function PortalShell({
  title,
  links,
  children,
}: {
  title: string;
  links?: { to: string; label: string }[];
  children: React.ReactNode;
}) {
  const { logout, role, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-[#05080F] text-white">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#05080F]/80 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden h-10 px-3 rounded-xl border border-white/10 hover:bg-white/5 text-xs font-black tracking-widest uppercase"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              Menu
            </button>

            <div className="h-9 w-9 rounded-2xl bg-emerald-500/20 border border-emerald-500/30" />
            <div>
              <div className="text-sm font-black tracking-widest uppercase">{title}</div>
              <div className="text-[10px] opacity-70">{(user as any)?.email ?? "—"} • {role ?? "NO_ROLE"}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <TierBadge role={role} />
            <button
              className="text-xs px-3 py-2 rounded-xl border border-white/10 hover:border-white/20 hover:bg-white/5"
              onClick={() => void logout()}
            >
              Sign out
            </button>
          </div>
        </div>

        {links?.length ? (
          <div className="mx-auto max-w-7xl px-4 pb-3 flex gap-2 flex-wrap">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="text-xs px-3 py-1.5 rounded-xl border border-white/10 hover:border-white/20 hover:bg-white/5"
              >
                {l.label}
              </Link>
            ))}
          </div>
        ) : null}
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 flex gap-6">
        <PortalSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}

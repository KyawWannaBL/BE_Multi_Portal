import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export function PortalShell({
  title,
  links,
  children,
}: {
  title: string;
  links?: { to: string; label: string }[];
  children: React.ReactNode;
}) {
  const { logout, role } = useAuth();

  return (
    <div className="min-h-screen bg-[#05080F] text-white">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#05080F]/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30" />
            <div>
              <div className="text-sm font-black tracking-widest uppercase">{title}</div>
              <div className="text-[10px] opacity-70">{role ?? "NO_ROLE"}</div>
            </div>
          </div>
          <button
            className="text-xs px-3 py-2 rounded-xl border border-white/10 hover:border-white/20 hover:bg-white/5"
            onClick={() => void logout()}
          >
            Sign out
          </button>
        </div>
        {links?.length ? (
          <div className="mx-auto max-w-6xl px-4 pb-3 flex gap-2 flex-wrap">
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

      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}

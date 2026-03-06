// @ts-nocheck
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { PortalShell } from "@/components/layout/PortalShell";
import { getAvailablePortals, portalCountAll } from "@/lib/portalRegistry";

export default function SuperAdminPortal() {
  const auth = useAuth() as any;
  const portals = getAvailablePortals(auth);

  return (
    <PortalShell title="Command Center" links={[{to: "/portal/admin/accounts", label: "Account Control"}]}>
      <div className="mb-6">
        <h1 className="text-2xl font-black uppercase text-white italic">Platform Portals</h1>
        <p className="text-sm text-slate-400">Total active modules: {portalCountAll}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {portals.map((p: any) => {
          const Icon = p.icon;
          return (
            <Link key={p.id} to={p.href} className="block group">
              <div className="p-5 rounded-2xl bg-[#0B101B] border border-white/10 group-hover:border-emerald-500/50 group-hover:bg-emerald-500/5 transition-all h-full">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-emerald-500/20 group-hover:text-emerald-400 text-slate-300 transition-colors">
                    {Icon ? <Icon className="h-6 w-6" /> : <div className="h-6 w-6 bg-slate-500 rounded" />}
                  </div>
                  <div>
                    <div className="text-white font-bold uppercase tracking-widest">{p.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-1">{p.description}</div>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </PortalShell>
  );
}

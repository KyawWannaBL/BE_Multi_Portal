import React from "react";
import { PortalShell } from "@/components/layout/PortalShell";
import { NavLink } from "react-router-dom";
export function ExecutionShell({ title, children }: { title: string; children: React.ReactNode }) {
  const base = "block px-4 py-3 rounded-2xl border border-white/10 hover:bg-white/5 text-sm font-semibold";
  return (
    <PortalShell title={title}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <aside className="lg:col-span-3 space-y-2">
          <NavLink to="/portal/execution" className={base}>Worklist</NavLink>
          <NavLink to="/portal/execution/intake" className={base}>Parcel Intake (OCR)</NavLink>
        </aside>
        <section className="lg:col-span-9">{children}</section>
      </div>
    </PortalShell>
  );
}

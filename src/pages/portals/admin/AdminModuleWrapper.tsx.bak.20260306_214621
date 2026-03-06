import React from "react";
import { PortalShell } from "@/components/layout/PortalShell";

export default function AdminModuleWrapper({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <PortalShell title={title}>
      <div className="rounded-3xl border border-white/5 bg-[#0B101B] p-6 shadow-2xl min-h-[70vh]">
        {children}
      </div>
    </PortalShell>
  );
}

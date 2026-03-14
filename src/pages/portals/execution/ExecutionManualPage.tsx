import React from "react";
import { PortalShell } from "@/components/layout/PortalShell";

export default function ExecutionManualPage() {
  return (
    <PortalShell
      title="Execution Manual"
      links={[
        { to: "/portal/execution", label: "Dashboard" },
        { to: "/portal/execution/navigation", label: "Navigation" },
      ]}
    >
      <div className="space-y-3">
        <div className="text-sm opacity-80">
          Placeholder manual execution page. Replace with your rider/driver forms or checklist module.
        </div>
        <div className="text-xs font-mono text-slate-500">
          Path: /portal/execution/manual
        </div>
      </div>
    </PortalShell>
  );
}

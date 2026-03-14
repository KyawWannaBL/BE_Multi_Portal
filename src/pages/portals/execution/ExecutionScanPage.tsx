import React from "react";
import { PortalShell } from "@/components/layout/PortalShell";
import { QROpsConsole } from "@/components/supplychain/QROpsConsole";
import { TraceTimeline } from "@/components/supplychain/TraceTimeline";

export default function ExecutionScanPage() {
  return (
    <PortalShell
      title="QR Scan Ops • Execution"
      prevTo="/portal/execution"
      nextTo="/portal/execution/navigation"
      links={[
        { to: "/portal/execution", label: "Worklist" },
        { to: "/portal/execution/navigation", label: "Navigation" },
      ]}
    >
      <div className="space-y-6">
        <QROpsConsole
          segment="EXECUTION"
          title="Execution QR Scan / Rider QR Scan"
          defaultEventType="EXEC_OUT_FOR_DELIVERY"
          eventTypes={["EXEC_OUT_FOR_DELIVERY", "EXEC_DELIVERED", "EXEC_RETURNED"]}
        />
        <TraceTimeline />
      </div>
    </PortalShell>
  );
}

import React from "react";
import { PortalShell } from "@/components/layout/PortalShell";
import { QROpsConsole } from "@/components/supplychain/QROpsConsole";
import { TraceTimeline } from "@/components/supplychain/TraceTimeline";

export default function QROpsScanPage() {
  return (
    <PortalShell
      title="QR Ops • Unified Scan Console"
      links={[
        { to: "/portal/operations", label: "Operations" },
        { to: "/portal/warehouse", label: "Warehouse" },
        { to: "/portal/supervisor", label: "Supervisor" },
        { to: "/portal/branch", label: "Branch" },
        { to: "/portal/finance", label: "Finance" },
      ]}
    >
      <div className="space-y-6">
        <QROpsConsole
          segment="BRANCH"
          title="Unified QR Scan / Unified QR Scan"
          defaultEventType="BR_INBOUND"
          eventTypes={[
            "DE_CREATED",
            "BR_INBOUND",
            "BR_OUTBOUND",
            "WH_RECEIVED",
            "WH_PUTAWAY",
            "WH_PICKED",
            "WH_DISPATCHED",
            "EXEC_OUT_FOR_DELIVERY",
            "EXEC_DELIVERED",
            "EXEC_RETURNED",
            "SUPV_EXCEPTION_OPENED",
            "SUPV_EXCEPTION_RESOLVED",
            "FIN_COD_COLLECTED",
            "FIN_DEPOSITED",
          ]}
        />
        <TraceTimeline />
      </div>
    </PortalShell>
  );
}

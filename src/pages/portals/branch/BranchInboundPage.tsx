import React from "react";
import { PortalShell } from "@/components/layout/PortalShell";
import { QROpsConsole } from "@/components/supplychain/QROpsConsole";
import { TraceTimeline } from "@/components/supplychain/TraceTimeline";

export default function BranchInboundPage() {
  return (
    <PortalShell
      title="Branch Ops • Inbound"
      links={[
        { to: "/portal/branch", label: "Branch" },
        { to: "/portal/operations/qr-scan", label: "QR Ops" },
      ]}
    >
      <div className="space-y-6">
        <QROpsConsole segment="BRANCH" title="BR Inbound / Branch လက်ခံ" defaultEventType="BR_INBOUND" eventTypes={["BR_INBOUND","BR_SORTED","BR_AUDIT"]} />
        <TraceTimeline />
      </div>
    </PortalShell>
  );
}

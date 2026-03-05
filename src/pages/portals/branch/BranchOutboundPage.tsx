import React from "react";
import { PortalShell } from "@/components/layout/PortalShell";
import { QROpsConsole } from "@/components/supplychain/QROpsConsole";
import { TraceTimeline } from "@/components/supplychain/TraceTimeline";

export default function BranchOutboundPage() {
  return (
    <PortalShell
      title="Branch Ops • Outbound"
      links={[
        { to: "/portal/branch", label: "Branch" },
        { to: "/portal/operations/qr-scan", label: "QR Ops" },
      ]}
    >
      <div className="space-y-6">
        <QROpsConsole segment="BRANCH" title="BR Outbound / Branch ထုတ်ပို့" defaultEventType="BR_OUTBOUND" eventTypes={["BR_OUTBOUND","BR_AUDIT"]} />
        <TraceTimeline />
      </div>
    </PortalShell>
  );
}

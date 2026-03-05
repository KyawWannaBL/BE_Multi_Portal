import React from "react";
import { PortalShell } from "@/components/layout/PortalShell";
import { QROpsConsole } from "@/components/supplychain/QROpsConsole";
import { TraceTimeline } from "@/components/supplychain/TraceTimeline";

export default function SupervisorApprovalPage() {
  return (
    <PortalShell 
      title="Supervisor Approval Gateway"
      links={[
        { to: "/portal/supervisor", label: "Dashboard" },
        { to: "/portal/supervisor/fraud", label: "Fraud Signals" }
      ]}
    >
      <div className="space-y-6">
        <QROpsConsole 
          segment="SUPERVISOR" 
          title="Security Approval / အတည်ပြုခြင်း"
          defaultEventType="SUPV_APPROVED"
          eventTypes={["SUPV_APPROVED", "SUPV_REJECTED", "SUPV_EXCEPTION_OPENED", "SUPV_EXCEPTION_RESOLVED"]}
        />
        <TraceTimeline />
      </div>
    </PortalShell>
  );
}

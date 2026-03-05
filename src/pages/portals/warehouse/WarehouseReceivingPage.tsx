import React from "react";
import { PortalShell } from "@/components/layout/PortalShell";
import { QROpsConsole } from "@/components/supplychain/QROpsConsole";
import { TraceTimeline } from "@/components/supplychain/TraceTimeline";

export default function WarehouseReceivingPage() {
  return (
    <PortalShell
      title="Warehouse Ops • Receiving"
      links={[
        { to: "/portal/warehouse", label: "Warehouse" },
        { to: "/portal/operations/qr-scan", label: "QR Ops" },
      ]}
    >
      <div className="space-y-6">
        <QROpsConsole
          segment="WAREHOUSE"
          title="WH Receiving / Warehouse လက်ခံခြင်း"
          defaultEventType="WH_RECEIVED"
          eventTypes={["WH_RECEIVED","WH_PUTAWAY","WH_AUDIT"]}
        />
        <TraceTimeline />
      </div>
    </PortalShell>
  );
}

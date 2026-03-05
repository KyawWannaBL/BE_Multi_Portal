import React from "react";
import { PortalShell } from "@/components/layout/PortalShell";
import { QROpsConsole } from "@/components/supplychain/QROpsConsole";
import { TraceTimeline } from "@/components/supplychain/TraceTimeline";

export default function WarehouseDispatchPage() {
  return (
    <PortalShell
      title="Warehouse Ops • Dispatch"
      links={[
        { to: "/portal/warehouse", label: "Warehouse" },
        { to: "/portal/operations/qr-scan", label: "QR Ops" },
      ]}
    >
      <div className="space-y-6">
        <QROpsConsole
          segment="WAREHOUSE"
          title="WH Dispatch / Warehouse ထုတ်ပို့ခြင်း"
          defaultEventType="WH_DISPATCHED"
          eventTypes={["WH_PICKED","WH_DISPATCHED","WH_AUDIT"]}
        />
        <TraceTimeline />
      </div>
    </PortalShell>
  );
}

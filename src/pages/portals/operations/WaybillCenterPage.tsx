import React, { useState } from "react";
import { PortalShell } from "@/components/layout/PortalShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Waybill4x6 } from "@/components/waybill/Waybill4x6";

export default function WaybillCenterPage() {
  const [wayId, setWayId] = useState("");
  return (
    <PortalShell title="Waybill Center">
      <div className="p-6 space-y-6">
        <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10">
          <h2 className="text-xl font-black text-white uppercase mb-4">Print Waybill</h2>
          <div className="flex gap-4">
            <Input placeholder="Enter Waybill ID" value={wayId} onChange={e => setWayId(e.target.value)} className="h-14 bg-black" />
            <Button className="h-14 bg-emerald-600 px-8">Load</Button>
          </div>
        </div>
      </div>
    </PortalShell>
  );
}

import React, { useState } from "react";
import { PortalShell } from "@/components/layout/PortalShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function WaybillCenterPage() {
  const [wayId, setWayId] = useState("");
  return (
    <PortalShell title="Waybill Center • 4x6 Label Print">
      <div className="p-6 space-y-6">
        <div className="bg-white/5 p-6 rounded-[2.5rem] border border-white/10 backdrop-blur-xl">
          <h2 className="text-xl font-black text-white uppercase mb-4 tracking-tighter">Enterprise Waybill Print</h2>
          <p className="text-xs text-slate-400 mb-6 uppercase tracking-widest font-bold">Standard 4x6 Thermal Format</p>
          <div className="flex gap-4">
            <Input 
              placeholder="Enter Waybill ID (e.g. YGN123456...)" 
              value={wayId} 
              onChange={e => setWayId(e.target.value)} 
              className="h-14 bg-black border-white/10 text-white rounded-2xl" 
            />
            <Button className="h-14 bg-emerald-600 hover:bg-emerald-500 px-8 rounded-2xl font-black uppercase tracking-widest">
              Load Waybill
            </Button>
          </div>
        </div>
      </div>
    </PortalShell>
  );
}

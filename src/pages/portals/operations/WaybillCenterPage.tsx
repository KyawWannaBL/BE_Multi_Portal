import React, { useState } from "react";
import { PortalShell } from "@/components/layout/PortalShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function WaybillCenterPage() {
  const [wayId, setWayId] = useState("");
  return (
    <PortalShell title="Waybill Center • 4x6 Label Print">
      <div className="p-6 space-y-6">
        <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 backdrop-blur-xl shadow-2xl">
          <h2 className="text-2xl font-black text-white uppercase mb-2 tracking-tighter">Waybill Generator</h2>
          <p className="text-[10px] text-emerald-500 mb-8 uppercase tracking-[0.2em] font-bold">Standard 4x6 Thermal Output Active</p>
          <div className="flex flex-col md:flex-row gap-4">
            <Input 
              placeholder="Enter Waybill ID (e.g. YGN000...)" 
              value={wayId} 
              onChange={e => setWayId(e.target.value)} 
              className="h-16 bg-black/50 border-white/10 text-white rounded-2xl px-6 text-lg font-mono" 
            />
            <Button className="h-16 bg-emerald-600 hover:bg-emerald-500 px-10 rounded-2xl font-black uppercase tracking-widest transition-all">
              Generate Label
            </Button>
          </div>
        </div>
      </div>
    </PortalShell>
  );
}

import React, { useEffect, useState } from "react";
import { PortalShell } from "@/components/layout/PortalShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Activity, Map as MapIcon } from "lucide-react";
import { getExecKPIs } from "@/services/executiveCenter";

export default function ExecutiveCommandCenter() {
  const [kpi, setKpi] = useState<any>(null);
  const [busy, setBusy] = useState(false);

  const refresh = async () => {
    setBusy(true);
    try { setKpi(await getExecKPIs()); } catch (e) {}
    finally { setBusy(false); }
  };

  useEffect(() => { refresh(); }, []);

  return (
    <PortalShell title="Executive Command Hub">
      <div className="p-8 space-y-8 bg-[#0B101B] min-h-screen">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-black/40 border-white/5 rounded-3xl p-6">
             <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Active Fleet</div>
             <div className="text-4xl font-black text-white mt-2">{kpi?.active_couriers || "0"}</div>
          </Card>
          <Card className="bg-black/40 border-white/5 rounded-3xl p-6">
             <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Total Volume</div>
             <div className="text-4xl font-black text-white mt-2">{kpi?.shipments_total || "0"}</div>
          </Card>
          <Card className="bg-black/40 border-white/5 rounded-3xl p-6">
             <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Pending COD</div>
             <div className="text-4xl font-black text-emerald-500 mt-2">{kpi?.cod_pending || "0"}</div>
          </Card>
          <Button className="h-full bg-emerald-600 rounded-3xl p-6 flex flex-col items-center justify-center" onClick={refresh}>
             <RefreshCw className={busy ? "animate-spin" : ""} />
             <span className="text-[10px] font-bold uppercase mt-2">Sync Stats</span>
          </Button>
        </div>
      </div>
    </PortalShell>
  );
}

import React, { useEffect, useState } from "react";
import { PortalShell } from "@/components/layout/PortalShell";
import { listFraudSignals } from "@/services/supplyChain";
import { TraceTimeline } from "@/components/supplychain/TraceTimeline";

export default function SupervisorFraudPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setErr(null);
        const data = await listFraudSignals(200);
        setRows(data);
      } catch (e: any) {
        setErr(e?.message || String(e));
      }
    })();
  }, []);

  return (
    <PortalShell
      title="Supervisor • Fraud Signals"
      links={[
        { to: "/portal/supervisor", label: "Supervisor" },
        { to: "/portal/operations/qr-scan", label: "QR Ops" },
      ]}
    >
      <div className="space-y-6">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="text-sm font-bold">Signals / သတိပေးချက်များ</div>
          <div className="text-xs opacity-70 mt-1">
            EN: This is a basic fraud rule view. Expand rules for enterprise controls. <br/>
            MY: Fraud rule view အခြေခံပါ။ Enterprise အတွက် rules များ တိုးချဲ့နိုင်သည်။
          </div>
          {err ? <div className="mt-3 text-xs text-red-300">Error: {err}</div> : null}
          <div className="mt-3 grid gap-2">
            {rows.map((r, i) => (
              <div key={i} className="rounded-2xl border border-white/10 bg-black/20 p-3">
                <div className="flex items-center justify-between">
                  <div className="font-mono text-xs">{r.way_id}</div>
                  <div className="text-[10px] opacity-70">{r.rule_code}</div>
                </div>
                <div className="text-xs opacity-70 mt-1">COD: {r.cod_amount ?? 0} • Delivered: {r.actual_delivery_time ? new Date(r.actual_delivery_time).toLocaleString() : "-"}</div>
              </div>
            ))}
            {!rows.length && !err ? <div className="text-xs opacity-60">No signals.</div> : null}
          </div>
        </div>

        <TraceTimeline />
      </div>
    </PortalShell>
  );
}

// @ts-nocheck
import React from "react";
import { PortalShell } from "@/components/layout/PortalShell";
import { useLanguage } from "@/contexts/LanguageContext";
import { traceByWayId } from "@/services/supplyChain";

export default function CustomerPortal() {
  const langCtx:any = useLanguage() as any;
  const lang = langCtx?.lang ?? "en";
  const t = langCtx?.t ?? ((en:string, mm:string)=> (lang==="my"||lang==="mm")?mm:en);

  const [wayId, setWayId] = React.useState("");
  const [rows, setRows] = React.useState<any[]>([]);

  const track = async () => {
    const d = await traceByWayId(wayId.trim());
    setRows(Array.isArray(d) ? d : []);
  };

  return (
    <PortalShell title={t("Customer Portal","Customer Portal (Customer)")}>
      <div className="space-y-4">
        <div className="rounded-3xl bg-[#0B101B] border border-white/10 p-6 space-y-3">
          <div className="text-xs font-mono text-slate-500 tracking-widest uppercase">{t("Track shipment","Shipment tracking")}</div>
          <input value={wayId} onChange={e=>setWayId(e.target.value)} placeholder="BR-2026-xx-xxxx"
            className="w-full bg-black/40 border border-white/10 rounded-xl h-10 px-3 text-xs text-slate-200"/>
          <button onClick={track} className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-widest">
            {t("Track","Track")}
          </button>
        </div>

        <div className="rounded-3xl bg-[#0B101B] border border-white/10 overflow-hidden">
          <div className="p-4 text-[10px] font-mono text-slate-500 tracking-widest uppercase">{t("Timeline","Timeline")} • {rows.length}</div>
          <div className="divide-y divide-white/5">
            {rows.map((x:any, idx) => (
              <div key={idx} className="p-4 flex items-center justify-between">
                <div className="text-xs font-mono text-white">{x.status ?? x.event_type ?? "EVENT"}</div>
                <div className="text-[10px] font-mono text-slate-500">{x.at ?? x.created_at ?? "—"}</div>
              </div>
            ))}
            {rows.length === 0 ? <div className="p-6 text-xs text-slate-500 font-mono">{t("No events (stub).","Events မရှိပါ (stub).")}</div> : null}
          </div>
        </div>
      </div>
    </PortalShell>
  );
}

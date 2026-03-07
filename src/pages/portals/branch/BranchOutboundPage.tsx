// @ts-nocheck
import React from "react";
import { PortalShell } from "@/components/layout/PortalShell";
import { useLanguage } from "@/contexts/LanguageContext";
import { outboundWayId } from "@/services/branch";

export default function BranchOutboundPage() {
  const langCtx:any = useLanguage() as any;
  const lang = langCtx?.lang ?? "en";
  const t = langCtx?.t ?? ((en:string, mm:string)=> (lang==="my"||lang==="mm")?mm:en);

  const [wayId, setWayId] = React.useState("");
  const [msg, setMsg] = React.useState("");

  const submit = async () => {
    if (!wayId.trim()) return setMsg(t("Enter Waybill ID.","Waybill ID ထည့်ပါ။"));
    await outboundWayId(wayId.trim());
    setMsg(t("Recorded BR_OUTBOUND (stub).","BR_OUTBOUND မှတ်တမ်းတင်ပြီးပါပြီ (stub)."));
    setWayId("");
  };

  return (
    <PortalShell title={t("Branch Outbound","Branch Outbound (အထွက်)")}>
      <div className="rounded-3xl bg-[#0B101B] border border-white/10 p-6 space-y-3">
        <input value={wayId} onChange={e=>setWayId(e.target.value)} placeholder="BR-2026-xx-xxxx"
          className="w-full bg-black/40 border border-white/10 rounded-xl h-10 px-3 text-xs text-slate-200"/>
        <button onClick={submit} className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-widest">
          {t("Confirm Outbound","Outbound အတည်ပြု")}
        </button>
        {msg ? <div className="text-xs font-mono text-emerald-300">{msg}</div> : null}
      </div>
    </PortalShell>
  );
}

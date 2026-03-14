// @ts-nocheck
import React from "react";
import { PortalShell } from "@/components/layout/PortalShell";
import { useLanguage } from "@/contexts/LanguageContext";
import { dispatchWayId } from "@/services/warehouse";

export default function WarehouseDispatchPage() {
  const langCtx:any = useLanguage() as any;
  const lang = langCtx?.lang ?? "en";
  const t = langCtx?.t ?? ((en:string, mm:string)=> (lang==="my"||lang==="mm")?mm:en);

  const [wayId, setWayId] = React.useState("");
  const [msg, setMsg] = React.useState("");

  const submit = async () => {
    if (!wayId.trim()) return setMsg(t("Enter Waybill ID.","Waybill ID ထည့်ပါ။"));
    await dispatchWayId(wayId.trim());
    setMsg(t("Recorded WH_DISPATCHED (stub).","WH_DISPATCHED မှတ်တမ်းတင်ပြီးပါပြီ (stub)."));
    setWayId("");
  };

  return (
    <PortalShell title={t("Warehouse Dispatch","Warehouse Dispatch (ထုတ်ပေး)")}>
      <div className="rounded-3xl bg-[#0B101B] border border-white/10 p-6 space-y-3">
        <div className="text-xs font-mono text-slate-500 tracking-widest uppercase">{t("Scan/Enter Waybill","Waybill စကန်/ထည့်")}</div>
        <input value={wayId} onChange={e=>setWayId(e.target.value)} placeholder="BR-2026-xx-xxxx"
          className="w-full bg-black/40 border border-white/10 rounded-xl h-10 px-3 text-xs text-slate-200"/>
        <button onClick={submit} className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-widest">
          {t("Confirm Dispatch","ထုတ်ပေးအတည်ပြု")}
        </button>
        {msg ? <div className="text-xs font-mono text-emerald-300">{msg}</div> : null}
      </div>
    </PortalShell>
  );
}

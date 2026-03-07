// @ts-nocheck
import React from "react";
import { PortalShell } from "@/components/layout/PortalShell";
import { useLanguage } from "@/contexts/LanguageContext";
import { recordSupplyEvent } from "@/services/supplyChain";
import { addTrackingNote } from "@/services/shipments";

export default function QROpsScanPage() {
  const langCtx:any = useLanguage() as any;
  const lang = langCtx?.lang ?? "en";
  const t = langCtx?.t ?? ((en:string, mm:string)=> (lang==="my"||lang==="mm")?mm:en);

  const [wayId, setWayId] = React.useState("");
  const [note, setNote] = React.useState("");
  const [msg, setMsg] = React.useState("");

  const submit = async () => {
    setMsg("");
    if (!wayId.trim()) { setMsg(t("Enter Waybill ID.","Waybill ID ထည့်ပါ။")); return; }
    await recordSupplyEvent("OPS_QR_SCAN", { way_id: wayId.trim() });
    if (note.trim()) await addTrackingNote(wayId.trim(), note.trim(), { source: "QROpsScan" });
    setMsg(t("QR event recorded (stub).","QR event မှတ်တမ်းတင်ပြီးပါပြီ (stub)."));
    setWayId(""); setNote("");
  };

  return (
    <PortalShell title={t("QR Scan Ops","QR Scan Ops (စကန်)")}>
      <div className="rounded-3xl bg-[#0B101B] border border-white/10 p-6 space-y-3">
        <input value={wayId} onChange={e=>setWayId(e.target.value)} placeholder="BR-2026-xx-xxxx"
          className="w-full bg-black/40 border border-white/10 rounded-xl h-10 px-3 text-xs text-slate-200"/>
        <input value={note} onChange={e=>setNote(e.target.value)} placeholder={t("Optional note","Optional note")}
          className="w-full bg-black/40 border border-white/10 rounded-xl h-10 px-3 text-xs text-slate-200"/>
        <button onClick={submit} className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-widest">
          {t("Record Scan","Scan မှတ်တမ်းတင်")}
        </button>
        {msg ? <div className="text-xs font-mono text-emerald-300">{msg}</div> : null}
      </div>
    </PortalShell>
  );
}

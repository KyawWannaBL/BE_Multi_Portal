// @ts-nocheck
import React from "react";
import { PortalShell } from "@/components/layout/PortalShell";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/lib/supabase";

export default function DataEntryOpsPage() {
  const langCtx:any = useLanguage() as any;
  const lang = langCtx?.lang ?? "en";
  const t = langCtx?.t ?? ((en:string, mm:string)=> (lang==="my"||lang==="mm")?mm:en);

  const [receiver, setReceiver] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [addr, setAddr] = React.useState("");
  const [city, setCity] = React.useState("");
  const [msg, setMsg] = React.useState("");

  const create = async () => {
    setMsg("");
    if (!receiver.trim() || !phone.trim() || !addr.trim() || !city.trim()) {
      setMsg(t("Fill mandatory fields.","မဖြစ်မနေ field များ ဖြည့်ပါ။"));
      return;
    }

    try {
      // EN: attempt insert; if table missing it will error but UI remains stable
      // MY: table မရှိလည်း UI မပျက်
      const payload = { receiver_name: receiver, receiver_phone: phone, receiver_address: addr, receiver_city: city, status: "PENDING" };
      const res = await supabase.from("shipments").insert(payload).select("*").maybeSingle();
      if (res?.error) {
        setMsg(t("Insert failed (check table/RLS).","Insert မရပါ (table/RLS စစ်ပါ)."));
      } else {
        setMsg(t("Shipment created (PENDING).","Shipment ဖန်တီးပြီးပါပြီ (PENDING)."));
        setReceiver(""); setPhone(""); setAddr(""); setCity("");
      }
    } catch {
      setMsg(t("Insert failed (schema missing).","Insert မရပါ (schema မရှိနိုင်)."));
    }
  };

  return (
    <PortalShell title={t("Manual / Data Entry","Manual / Data Entry")}>
      <div className="rounded-3xl bg-[#0B101B] border border-white/10 p-6 space-y-3">
        <div className="text-xs font-mono text-slate-500 tracking-widest uppercase">{t("Create Shipment","Shipment ဖန်တီး")}</div>
        <input value={receiver} onChange={e=>setReceiver(e.target.value)} placeholder={t("Receiver name*","လက်ခံသူ အမည်*")}
          className="w-full bg-black/40 border border-white/10 rounded-xl h-10 px-3 text-xs text-slate-200"/>
        <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder={t("Receiver phone*","ဖုန်းနံပါတ်*")}
          className="w-full bg-black/40 border border-white/10 rounded-xl h-10 px-3 text-xs text-slate-200"/>
        <input value={addr} onChange={e=>setAddr(e.target.value)} placeholder={t("Address*","လိပ်စာ*")}
          className="w-full bg-black/40 border border-white/10 rounded-xl h-10 px-3 text-xs text-slate-200"/>
        <input value={city} onChange={e=>setCity(e.target.value)} placeholder={t("City*","မြို့*")}
          className="w-full bg-black/40 border border-white/10 rounded-xl h-10 px-3 text-xs text-slate-200"/>
        <button onClick={create} className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-widest">
          {t("Create","ဖန်တီး")}
        </button>
        {msg ? <div className="text-xs font-mono text-emerald-300">{msg}</div> : null}
      </div>
    </PortalShell>
  );
}

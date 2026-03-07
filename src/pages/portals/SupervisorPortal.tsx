// @ts-nocheck
import React from "react";
import { PortalShell } from "@/components/layout/PortalShell";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";

export default function SupervisorPortal() {
  const nav = useNavigate();
  const langCtx:any = useLanguage() as any;
  const lang = langCtx?.lang ?? "en";
  const t = langCtx?.t ?? ((en:string, mm:string)=> (lang==="my"||lang==="mm")?mm:en);

  const tiles = [
    { to: "/portal/supervisor/approval", en: "Approval Gateway", mm: "Approval Gateway (အတည်ပြု)" },
    { to: "/portal/supervisor/fraud", en: "Fraud Signals", mm: "Fraud Signals (လိမ်လည်မှု)" },
  ];

  return (
    <PortalShell title={t("Supervisor Portal","Supervisor Portal (ကြီးကြပ်)")}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tiles.map((x) => (
          <button key={x.to} onClick={() => nav(x.to)}
            className="p-6 rounded-3xl bg-[#0B101B] border border-white/10 hover:border-emerald-500/30 hover:bg-emerald-500/5 text-left transition">
            <div className="text-lg font-black tracking-widest uppercase text-white">{t(x.en,x.mm)}</div>
            <div className="text-xs font-mono text-slate-500 mt-2">{x.to}</div>
          </button>
        ))}
      </div>
    </PortalShell>
  );
}

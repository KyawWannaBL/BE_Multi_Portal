// @ts-nocheck
import React from "react";
import { PortalShell } from "@/components/layout/PortalShell";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";

export default function HrPortal() {
  const nav = useNavigate();
  const langCtx:any = useLanguage() as any;
  const lang = langCtx?.lang ?? "en";
  const t = langCtx?.t ?? ((en:string, mm:string)=> (lang==="my"||lang==="mm")?mm:en);

  return (
    <PortalShell title={t("HR Portal","HR Portal (HR)")}>
      <button onClick={() => nav("/portal/hr/admin")}
        className="p-6 rounded-3xl bg-[#0B101B] border border-white/10 hover:border-emerald-500/30 hover:bg-emerald-500/5 text-left transition w-full">
        <div className="text-lg font-black tracking-widest uppercase text-white">{t("HR Admin Ops","HR Admin Ops")}</div>
        <div className="text-xs font-mono text-slate-500 mt-2">/portal/hr/admin</div>
      </button>
    </PortalShell>
  );
}

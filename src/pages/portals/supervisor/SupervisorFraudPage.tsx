// @ts-nocheck
import React from "react";
import { PortalShell } from "@/components/layout/PortalShell";
import { useLanguage } from "@/contexts/LanguageContext";
import EmptyState from "@/components/common/EmptyState";

export default function SupervisorFraudPage() {
  const langCtx:any = useLanguage() as any;
  const lang = langCtx?.lang ?? "en";
  const t = langCtx?.t ?? ((en:string, mm:string)=> (lang==="my"||lang==="mm")?mm:en);

  return (
    <PortalShell title={t("Fraud Signals","Fraud Signals (လိမ်လည်မှု)")}>
      <EmptyState
        title={t("Fraud engine placeholder","Fraud engine placeholder")}
        hint={t("Integrate fraud_signals view + rules engine later (enterprise).","enterprise အတွက် fraud_signals view + rules engine ကို နောက်မှချိတ်ပါ။")}
      />
    </PortalShell>
  );
}

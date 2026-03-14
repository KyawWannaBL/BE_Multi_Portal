// @ts-nocheck
import React from "react";
import { PortalShell } from "@/components/layout/PortalShell";
import { useLanguage } from "@/contexts/LanguageContext";
import EmptyState from "@/components/common/EmptyState";

export default function MarketingPortal() {
  const langCtx:any = useLanguage() as any;
  const lang = langCtx?.lang ?? "en";
  const t = langCtx?.t ?? ((en:string, mm:string)=> (lang==="my"||lang==="mm")?mm:en);
  return (
    <PortalShell title={t("Marketing Portal","Marketing Portal")}>
      <EmptyState title={t("Marketing module placeholder","Marketing placeholder")} hint={t("Integrate campaigns + segmentation later.","Campaigns/segmentation ကို နောက်မှချိတ်ပါ။")} />
    </PortalShell>
  );
}

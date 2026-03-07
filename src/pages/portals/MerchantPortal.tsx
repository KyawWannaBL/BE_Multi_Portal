// @ts-nocheck
import React from "react";
import { PortalShell } from "@/components/layout/PortalShell";
import { useLanguage } from "@/contexts/LanguageContext";
import EmptyState from "@/components/common/EmptyState";

export default function MerchantPortal() {
  const langCtx:any = useLanguage() as any;
  const lang = langCtx?.lang ?? "en";
  const t = langCtx?.t ?? ((en:string, mm:string)=> (lang==="my"||lang==="mm")?mm:en);
  return (
    <PortalShell title={t("Merchant Portal","Merchant Portal (ကုန်သည်)")}>
      <EmptyState title={t("Merchant tools placeholder","Merchant tools placeholder")} hint={t("Add bulk CSV intake + shipment tracking view later.","CSV intake + tracking view ကို နောက်မှထည့်ပါ။")} />
    </PortalShell>
  );
}

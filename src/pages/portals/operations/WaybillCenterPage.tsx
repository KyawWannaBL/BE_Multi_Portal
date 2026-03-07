// @ts-nocheck
import React from "react";
import { PortalShell } from "@/components/layout/PortalShell";
import { useLanguage } from "@/contexts/LanguageContext";
import EmptyState from "@/components/common/EmptyState";

export default function WaybillCenterPage() {
  const langCtx:any = useLanguage() as any;
  const lang = langCtx?.lang ?? "en";
  const t = langCtx?.t ?? ((en:string, mm:string)=> (lang==="my"||lang==="mm")?mm:en);

  return (
    <PortalShell title={t("Waybill Center","Waybill Center")}>
      <EmptyState
        title={t("Waybill printing pipeline ready","Waybill printing pipeline ready")}
        hint={t("Implement 4x6 HTML template + browser print + audit print jobs next.","4x6 HTML template + browser print + print audit ကို နောက်တစ်ဆင့် ထည့်ပါ။")}
      />
    </PortalShell>
  );
}

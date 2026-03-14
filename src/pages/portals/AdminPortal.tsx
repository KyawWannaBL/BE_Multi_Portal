// @ts-nocheck
import React from "react";
import { PortalShell } from "@/components/layout/PortalShell";
import { useLanguage } from "@/contexts/LanguageContext";
import EmptyState from "@/components/common/EmptyState";

export default function AdminPortal() {
  const langCtx:any = useLanguage() as any;
  const lang = langCtx?.lang ?? "en";
  const t = langCtx?.t ?? ((en:string, mm:string)=> (lang==="my"||lang==="mm")?mm:en);
  return (
    <PortalShell title={t("Admin Portal (Legacy)","Admin Portal (Legacy)")}>
      <EmptyState title={t("Legacy Admin portal placeholder","Legacy Admin placeholder")} hint={t("Use /portal/admin for Super Admin.","Super Admin အတွက် /portal/admin ကိုသုံးပါ။")} />
    </PortalShell>
  );
}

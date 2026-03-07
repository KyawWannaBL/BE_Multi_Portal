import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { PortalShell } from "@/components/layout/PortalShell";

function isController(role?: string | null) {
  const r = String(role ?? "").toUpperCase().trim();
  return [
    "WAREHOUSE_CONTROLLER",
    "WAREHOUSE_SUPERVISOR",
    "WH_CONTROLLER",
    "WH_SUPERVISOR",
    "WH_CTRL",
    "WH_SUP",
    "SUPERVISOR",
    "OPERATIONS_ADMIN",
    "SUPER_ADMIN",
    "SYS",
    "APP_OWNER",
  ].includes(r);
}

export default function WarehousePortal() {
  const { role } = useAuth();
  const { lang } = useLanguage();
  const nav = useNavigate();
  const t = (en: string, mm: string) => (lang === "en" ? en : mm);

  useEffect(() => {
    nav(isController(role as any) ? "/portal/warehouse/controller" : "/portal/warehouse/staff", { replace: true });
  }, [role]);

  return (
    <PortalShell title={t("Warehouse", "Warehouse")}>
      <div className="p-6 text-white/70 text-sm">{t("Redirecting…", "ပြောင်းနေပါသည်…")}</div>
    </PortalShell>
  );
}

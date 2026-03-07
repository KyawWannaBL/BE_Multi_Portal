import React, { useMemo } from "react";
import { NavLink } from "react-router-dom";
import { PortalShell } from "@/components/layout/PortalShell";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";

const base =
  "block px-4 py-3 rounded-2xl border border-white/10 hover:border-white/20 hover:bg-white/5 text-sm font-semibold";

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

export function WarehouseShell({ title, children }: { title: string; children: React.ReactNode }) {
  const { lang } = useLanguage();
  const { role } = useAuth();
  const t = (en: string, mm: string) => (lang === "en" ? en : mm);

  const ctrl = useMemo(() => isController(role as any), [role]);

  const items = useMemo(() => {
    if (ctrl) {
      return [
        { to: "/portal/warehouse/controller", label: t("Dashboard", "Dashboard") },
        { to: "/portal/warehouse/controller/tasks", label: t("Task Board", "Task Board") },
        { to: "/portal/warehouse/controller/master", label: t("Master Data", "Master Data") },
        { to: "/portal/warehouse/controller/inbound", label: t("Inbound", "Inbound") },
        { to: "/portal/warehouse/controller/outbound", label: t("Outbound", "Outbound") },
        { to: "/portal/warehouse/controller/inventory", label: t("Inventory", "Inventory") },
        { to: "/portal/warehouse/controller/reports", label: t("Reports", "Reports") },
      ];
    }

    return [
      { to: "/portal/warehouse/staff", label: t("My Tasks", "မိမိ Task များ") },
      { to: "/portal/warehouse/staff/inbound", label: t("Inbound Ops", "Inbound Ops") },
      { to: "/portal/warehouse/staff/outbound", label: t("Outbound Ops", "Outbound Ops") },
      { to: "/portal/warehouse/staff/cycle-count", label: t("Cycle Count", "Cycle Count") },
    ];
  }, [ctrl, lang]);

  return (
    <PortalShell title={title}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <aside className="lg:col-span-3">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-3 space-y-2 sticky top-[88px]">
            <div className="text-[10px] font-mono text-white/60 tracking-widest uppercase px-2 py-1">
              {t("Warehouse Menu", "Warehouse မီနူး")}
            </div>

            {items.map((i) => (
              <NavLink
                key={i.to}
                to={i.to}
                className={({ isActive }) => `${base} ${isActive ? "bg-emerald-500/10 border-emerald-500/30" : ""}`}
              >
                {i.label}
              </NavLink>
            ))}
          </div>
        </aside>

        <section className="lg:col-span-9">{children}</section>
      </div>
    </PortalShell>
  );
}

export default WarehouseShell;

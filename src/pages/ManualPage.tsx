import React from "react";
import { OperationalManual } from "@/components/OperationalManual";
import { PortalShell } from "@/components/layout/PortalShell";
import { useAuth } from "@/contexts/AuthContext";

const OPS_ROLES = new Set([
  "OPERATIONS_ADMIN",
  "STAFF",
  "DATA_ENTRY",
  "ADM",
  "MGR",
  "SUPER_ADMIN",
  "SYS",
  "APP_OWNER",
]);

const EXEC_ROLES = new Set(["RIDER", "DRIVER", "HELPER"]);

export default function ManualPage() {
  const { role } = useAuth();
  const r = (role ?? "").trim().toUpperCase();

  const links =
    OPS_ROLES.has(r) || !r
      ? [{ to: "/portal/operations", label: "Operations Portal" }]
      : EXEC_ROLES.has(r)
        ? [{ to: "/portal/execution", label: "Execution Portal" }]
        : [
            { to: "/portal/operations", label: "Operations Portal" },
            { to: "/portal/execution", label: "Execution Portal" },
          ];

  return (
    <PortalShell title="QR Operations Manual" links={links}>
      <OperationalManual />
    </PortalShell>
  );
}

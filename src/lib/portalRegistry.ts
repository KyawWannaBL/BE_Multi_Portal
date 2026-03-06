import type { LucideIcon } from "lucide-react";
import { Activity, Building2, HardDrive, ShieldCheck, Users, UserCheck } from "lucide-react";

export type PortalId = "OPERATIONS" | "FINANCE" | "EXECUTION" | "ADMIN_EXEC" | "ACCOUNT_CONTROL" | "HR" | "SECURITY";

export type PortalDefinition = {
  id: PortalId;
  path: string;
  title_en: string;
  title_mm: string;
  desc_en: string;
  desc_mm: string;
  icon: LucideIcon;
  allowRoles?: string[];
};

export const PORTALS: PortalDefinition[] = [
  {
    id: "OPERATIONS",
    path: "/portal/operations",
    title_en: "Operations Portal",
    title_mm: "လုပ်ငန်းလည်ပတ်မှု Portal",
    desc_en: "Core operational modules and daily workflows.",
    desc_mm: "နေ့စဉ်လုပ်ငန်းစဉ်များနှင့် အဓိက modules များ။",
    icon: Building2,
  },
  {
    id: "FINANCE",
    path: "/portal/finance",
    title_en: "Finance Portal",
    title_mm: "ငွေစာရင်း Portal",
    desc_en: "Invoices, reconciliation, payouts, and finance controls.",
    desc_mm: "ဘောက်ချာများ၊ စာရင်းညှိနှိုင်းမှု၊ ငွေပေးချေမှုများ။",
    icon: HardDrive,
    allowRoles: ["FINANCE", "FINANCE_ADMIN", "ACCOUNTANT", "SUPER_ADMIN", "APP_OWNER", "SYS"],
  },
  {
    id: "EXECUTION",
    path: "/portal/execution",
    title_en: "Execution Portal",
    title_mm: "ဆောင်ရွက်မှု Portal",
    desc_en: "Riders/drivers operational execution modules.",
    desc_mm: "Rider/Driver ဆောင်ရွက်မှု modules များ။",
    icon: Activity,
    allowRoles: ["RIDER", "RDR", "DRIVER", "HELPER", "SUPERVISOR", "SUPER_ADMIN", "SYS", "APP_OWNER"],
  },
  {
    id: "ADMIN_EXEC",
    path: "/portal/admin/executive",
    title_en: "Executive Command",
    title_mm: "Executive Command",
    desc_en: "High-privilege administrative command center.",
    desc_mm: "အမြင့်ဆုံးအာဏာရှိ စီမံခန့်ခွဲမှု Command Center။",
    icon: ShieldCheck,
    allowRoles: ["SYS", "APP_OWNER", "SUPER_ADMIN"],
  },
  {
    id: "ACCOUNT_CONTROL",
    path: "/admin/accounts",
    title_en: "Account Control",
    title_mm: "အကောင့်စီမံခန့်ခွဲမှု",
    desc_en: "Approval workflow, roles, and delegated authorities.",
    desc_mm: "အတည်ပြုလုပ်ငန်းစဉ်၊ Role များ၊ Authority များ။",
    icon: UserCheck,
    allowRoles: ["SYS", "APP_OWNER", "SUPER_ADMIN", "ADMIN", "ADM", "MGR"],
  },
  {
    id: "HR",
    path: "/admin/hr",
    title_en: "HR Portal",
    title_mm: "HR Portal",
    desc_en: "Employee records, departmental assignments, schedules.",
    desc_mm: "ဝန်ထမ်းမှတ်တမ်း၊ ဌာနခွဲ၊ အလုပ်ချိန်များ။",
    icon: Users,
    allowRoles: ["HR", "HR_ADMIN", "SUPER_ADMIN", "APP_OWNER", "SYS"],
  },
  {
    id: "SECURITY",
    path: "/admin/security",
    title_en: "Security Monitor",
    title_mm: "လုံခြုံရေးစောင့်ကြည့်မှု",
    desc_en: "Audit feed, incident reviews, and access anomalies.",
    desc_mm: "Audit မှတ်တမ်း၊ Incident စစ်ဆေးမှုများ။",
    icon: ShieldCheck,
    allowRoles: ["SYS", "APP_OWNER", "SUPER_ADMIN", "SECURITY", "SECURITY_ADMIN"],
  },
];

export function normalizeRole(role?: string | null): string {
  const r = (role ?? "").trim().toUpperCase();
  if (!r) return "GUEST";
  if (r === "SUPER_A") return "SUPER_ADMIN";
  if (r.startsWith("SUPER")) return "SUPER_ADMIN";
  if (r.startsWith("APP")) return "APP_OWNER";
  if (r.startsWith("SYS")) return "SYS";
  return r;
}

export function canAccessPortal(role: string | null | undefined, portal: PortalDefinition): boolean {
  const r = normalizeRole(role);
  if (r === "GUEST") return false;
  if (!portal.allowRoles || portal.allowRoles.length === 0) return true;
  return portal.allowRoles.map((x) => x.toUpperCase()).includes(r);
}

export function getAvailablePortals(role: string | null | undefined): PortalDefinition[] {
  return PORTALS.filter((p) => canAccessPortal(role, p));
}

export function defaultPortalForRole(role: string | null | undefined): string {
  const available = getAvailablePortals(role);
  if (available.length > 0) return available[0].path;
  return "/portal/operations";
}

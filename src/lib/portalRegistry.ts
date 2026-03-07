import type { LucideIcon } from "lucide-react";
import {
  Building2,
  ShieldCheck,
  Activity,
  Wallet,
  Megaphone,
  Users,
  LifeBuoy,
  Truck,
  Warehouse,
  GitBranch,
  UserCheck,
  ClipboardList,
  ShieldAlert,
  KeyRound,
} from "lucide-react";
import { normalizeRole } from "@/lib/rbac";

export type NavItem = {
  id: string;
  label_en: string;
  label_mm: string;
  path: string;
  icon: LucideIcon;
  allowRoles?: string[];
  children?: NavItem[];
};

export type NavSection = {
  id: string;
  title_en: string;
  title_mm: string;
  items: NavItem[];
};

const isPrivileged = (role: string | null | undefined) => {
  const r = normalizeRole(role);
  return r === "SYS" || r === "APP_OWNER" || r === "SUPER_ADMIN";
};

const allow = (role: string | null | undefined, roles?: string[]) => {
  if (!roles || roles.length === 0) return true;
  const r = normalizeRole(role);
  if (!r) return false;
  return roles.map((x) => x.toUpperCase()).includes(r.toUpperCase());
};

export const NAV_SECTIONS: NavSection[] = [
  {
    id: "super_admin",
    title_en: "SUPER ADMIN",
    title_mm: "SUPER ADMIN",
    items: [
      {
        id: "sa_home",
        label_en: "Super Admin Portal",
        label_mm: "Super Admin Portal",
        path: "/portal/admin",
        icon: ShieldCheck,
        allowRoles: ["SYS", "APP_OWNER", "SUPER_ADMIN"],
        children: [
          { id: "sa_exec", label_en: "Executive Command", label_mm: "Executive Command", path: "/portal/admin/executive", icon: ShieldAlert },
          { id: "sa_accounts", label_en: "Account Control", label_mm: "အကောင့်စီမံခန့်ခွဲမှု", path: "/portal/admin/accounts", icon: UserCheck },
          { id: "sa_admin_dash", label_en: "Admin Dashboard", label_mm: "Admin Dashboard", path: "/portal/admin/dashboard", icon: ClipboardList },
          { id: "sa_audit", label_en: "Audit Logs", label_mm: "Audit Logs", path: "/portal/admin/audit", icon: ShieldAlert },
          { id: "sa_users", label_en: "Admin Users", label_mm: "Admin Users", path: "/portal/admin/users", icon: Users },
          { id: "sa_perm", label_en: "Permission Assignment", label_mm: "Permission Assignment", path: "/portal/admin/permission-assignment", icon: KeyRound },
        ],
      },
    ],
  },
  {
    id: "portals",
    title_en: "PORTALS",
    title_mm: "PORTAL များ",
    items: [
      {
        id: "ops",
        label_en: "Operations",
        label_mm: "လုပ်ငန်းလည်ပတ်မှု",
        path: "/portal/operations",
        icon: Building2,
        children: [
          { id: "ops_manual", label_en: "Manual / Data Entry", label_mm: "Manual / Data Entry", path: "/portal/operations/manual", icon: ClipboardList },
          { id: "ops_qr", label_en: "QR Scan Ops", label_mm: "QR Scan Ops", path: "/portal/operations/qr-scan", icon: Activity },
          { id: "ops_track", label_en: "Tracking", label_mm: "Tracking", path: "/portal/operations/tracking", icon: Activity },
          { id: "ops_waybill", label_en: "Waybill Center", label_mm: "Waybill Center", path: "/portal/operations/waybill", icon: ClipboardList },
        ],
      },
      {
        id: "finance",
        label_en: "Finance",
        label_mm: "ငွေစာရင်း",
        path: "/portal/finance",
        icon: Wallet,
        allowRoles: ["SYS", "APP_OWNER", "SUPER_ADMIN", "FINANCE_USER", "FINANCE_STAFF"],
        children: [
          { id: "fin_recon", label_en: "Reconciliation", label_mm: "Reconciliation", path: "/portal/finance/recon", icon: ClipboardList },
        ],
      },
      {
        id: "marketing",
        label_en: "Marketing",
        label_mm: "Marketing",
        path: "/portal/marketing",
        icon: Megaphone,
        allowRoles: ["SYS", "APP_OWNER", "SUPER_ADMIN", "MARKETING_ADMIN"],
      },
      {
        id: "hr",
        label_en: "HR",
        label_mm: "HR",
        path: "/portal/hr",
        icon: Users,
        allowRoles: ["SYS", "APP_OWNER", "SUPER_ADMIN", "HR_ADMIN"],
        children: [
          { id: "hr_admin", label_en: "HR Admin Ops", label_mm: "HR Admin Ops", path: "/portal/hr/admin", icon: ClipboardList },
        ],
      },
      {
        id: "support",
        label_en: "Support",
        label_mm: "Support",
        path: "/portal/support",
        icon: LifeBuoy,
        allowRoles: ["SYS", "APP_OWNER", "SUPER_ADMIN", "CUSTOMER_SERVICE"],
      },
      {
        id: "execution",
        label_en: "Execution",
        label_mm: "Execution",
        path: "/portal/execution",
        icon: Truck,
        allowRoles: ["SYS", "APP_OWNER", "SUPER_ADMIN", "RIDER", "DRIVER", "HELPER", "SUPERVISOR"],
        children: [
          { id: "exec_nav", label_en: "Navigation", label_mm: "Navigation", path: "/portal/execution/navigation", icon: Activity },
          { id: "exec_manual", label_en: "Manual", label_mm: "Manual", path: "/portal/execution/manual", icon: ClipboardList },
        ],
      },
      {
        id: "warehouse",
        label_en: "Warehouse",
        label_mm: "Warehouse",
        path: "/portal/warehouse",
        icon: Warehouse,
        allowRoles: ["SYS", "APP_OWNER", "SUPER_ADMIN", "WAREHOUSE_MANAGER"],
        children: [
          { id: "wh_recv", label_en: "Receiving", label_mm: "Receiving", path: "/portal/warehouse/receiving", icon: ClipboardList },
          { id: "wh_disp", label_en: "Dispatch", label_mm: "Dispatch", path: "/portal/warehouse/dispatch", icon: ClipboardList },
        ],
      },
      {
        id: "branch",
        label_en: "Branch",
        label_mm: "Branch",
        path: "/portal/branch",
        icon: GitBranch,
        allowRoles: ["SYS", "APP_OWNER", "SUPER_ADMIN", "SUBSTATION_MANAGER"],
        children: [
          { id: "br_in", label_en: "Inbound", label_mm: "Inbound", path: "/portal/branch/inbound", icon: ClipboardList },
          { id: "br_out", label_en: "Outbound", label_mm: "Outbound", path: "/portal/branch/outbound", icon: ClipboardList },
        ],
      },
      {
        id: "supervisor",
        label_en: "Supervisor",
        label_mm: "Supervisor",
        path: "/portal/supervisor",
        icon: UserCheck,
        allowRoles: ["SYS", "APP_OWNER", "SUPER_ADMIN", "SUPERVISOR"],
        children: [
          { id: "sup_approval", label_en: "Approval Gateway", label_mm: "Approval Gateway", path: "/portal/supervisor/approval", icon: ShieldCheck },
          { id: "sup_fraud", label_en: "Fraud Signals", label_mm: "Fraud Signals", path: "/portal/supervisor/fraud", icon: ShieldAlert },
        ],
      },
      {
        id: "merchant",
        label_en: "Merchant",
        label_mm: "Merchant",
        path: "/portal/merchant",
        icon: Building2,
        allowRoles: ["SYS", "APP_OWNER", "SUPER_ADMIN", "MERCHANT"],
      },
      {
        id: "customer",
        label_en: "Customer",
        label_mm: "Customer",
        path: "/portal/customer",
        icon: Users,
        allowRoles: ["SYS", "APP_OWNER", "SUPER_ADMIN", "CUSTOMER"],
      },
    ],
  },
];

function filterItem(role: string | null | undefined, item: NavItem): NavItem | null {
  const priv = isPrivileged(role);
  if (!priv && item.allowRoles && !allow(role, item.allowRoles)) return null;

  const children = item.children
    ? item.children.map((c) => filterItem(role, c)).filter(Boolean) as NavItem[]
    : undefined;

  return { ...item, children };
}

export function navForRole(role: string | null | undefined): NavSection[] {
  return NAV_SECTIONS
    .map((sec) => {
      const items = sec.items.map((it) => filterItem(role, it)).filter(Boolean) as NavItem[];
      return { ...sec, items };
    })
    .filter((sec) => sec.items.length > 0);
}

export function portalCountAll(): number {
  const portals = NAV_SECTIONS.find((s) => s.id === "portals")?.items ?? [];
  return portals.length;
}

export function portalCountForRole(role: string | null | undefined): number {
  const portals = navForRole(role).find((s) => s.id === "portals")?.items ?? [];
  return portals.length;
}

export function portalsForRole(role: string | null | undefined): NavItem[] {
  return navForRole(role).find((s) => s.id === "portals")?.items ?? [];
}

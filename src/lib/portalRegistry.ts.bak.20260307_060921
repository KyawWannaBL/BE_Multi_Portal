// @ts-nocheck
import type { LucideIcon } from "lucide-react";
import { Building2, ShieldCheck, Activity, Wallet, Megaphone, Users, LifeBuoy, Truck, Warehouse, GitBranch, UserCheck, ClipboardList, ShieldAlert, KeyRound } from "lucide-react";
import { allowedByRole, normalizeRole } from "./permissionResolver";
export { normalizeRole } from "./permissionResolver";

export function defaultPortalForRole(role?: string | null): string {
  const r = normalizeRole(role);
  if (["SYS", "APP_OWNER", "SUPER_ADMIN"].includes(r)) return "/portal/admin";
  if (["FINANCE_USER", "FINANCE_STAFF"].includes(r)) return "/portal/finance";
  if (["HR_ADMIN"].includes(r)) return "/portal/hr";
  if (["MARKETING_ADMIN"].includes(r)) return "/portal/marketing";
  if (["CUSTOMER_SERVICE"].includes(r)) return "/portal/support";
  if (["WAREHOUSE_MANAGER"].includes(r)) return "/portal/warehouse";
  if (["SUBSTATION_MANAGER"].includes(r)) return "/portal/branch";
  if (["SUPERVISOR"].includes(r)) return "/portal/supervisor";
  if (["MERCHANT"].includes(r)) return "/portal/merchant";
  if (["CUSTOMER"].includes(r)) return "/portal/customer";
  if (["RIDER", "DRIVER", "HELPER"].includes(r)) return "/portal/execution";
  return "/portal/operations";
}

export type NavItem = { id: string; label_en: string; label_mm: string; path: string; icon: LucideIcon; allowRoles?: string[]; requiredPermissions?: string[]; children?: NavItem[]; };
export type NavSection = { id: string; title_en: string; title_mm: string; items: NavItem[]; };

export const NAV_SECTIONS: NavSection[] = [
  {
    id: "super_admin", title_en: "SUPER ADMIN", title_mm: "SUPER ADMIN",
    items: [
      {
        id: "sa_home", label_en: "Super Admin Portal", label_mm: "Super Admin Portal", path: "/portal/admin", icon: ShieldCheck, allowRoles: ["SYS", "APP_OWNER", "SUPER_ADMIN"], requiredPermissions: ["ADMIN_PORTAL_READ"],
        children: [
          { id: "sa_exec", label_en: "Executive Command", label_mm: "Executive Command", path: "/portal/admin/executive", icon: ShieldAlert, requiredPermissions: ["EXEC_COMMAND_READ"] },
          { id: "sa_accounts", label_en: "Account Control", label_mm: "အကောင့်စီမံခန့်ခွဲမှု", path: "/portal/admin/accounts", icon: UserCheck, requiredPermissions: ["USER_READ", "AUTHORITY_MANAGE", "USER_CREATE", "USER_APPROVE"] },
          { id: "sa_admin_dash", label_en: "Admin Dashboard", label_mm: "Admin Dashboard", path: "/portal/admin/dashboard", icon: ClipboardList, requiredPermissions: ["ADMIN_DASH_READ"] },
          { id: "sa_audit", label_en: "Audit Logs", label_mm: "Audit Logs", path: "/portal/admin/audit", icon: ShieldAlert, requiredPermissions: ["AUDIT_READ"] },
          { id: "sa_users", label_en: "Admin Users", label_mm: "Admin Users", path: "/portal/admin/users", icon: Users, requiredPermissions: ["ADMIN_USER_READ"] },
          { id: "sa_perm", label_en: "Permission Assignment", label_mm: "Permission Assignment", path: "/portal/admin/permission-assignment", icon: KeyRound, requiredPermissions: ["AUTHORITY_MANAGE"] },
        ],
      },
    ],
  },
  {
    id: "portals", title_en: "PORTALS", title_mm: "PORTAL များ",
    items: [
      {
        id: "ops", label_en: "Operations", label_mm: "လုပ်ငန်းလည်ပတ်မှု", path: "/portal/operations", icon: Building2, requiredPermissions: ["PORTAL_OPERATIONS"],
        children: [
          { id: "ops_manual", label_en: "Manual / Data Entry", label_mm: "Manual / Data Entry", path: "/portal/operations/manual", icon: ClipboardList },
          { id: "ops_qr", label_en: "QR Scan Ops", label_mm: "QR Scan Ops", path: "/portal/operations/qr-scan", icon: Activity },
          { id: "ops_track", label_en: "Tracking", label_mm: "Tracking", path: "/portal/operations/tracking", icon: Activity },
          { id: "ops_waybill", label_en: "Waybill Center", label_mm: "Waybill Center", path: "/portal/operations/waybill", icon: ClipboardList },
        ],
      },
      {
        id: "finance", label_en: "Finance", label_mm: "ငွေစာရင်း", path: "/portal/finance", icon: Wallet, allowRoles: ["SYS", "APP_OWNER", "SUPER_ADMIN", "FINANCE_USER", "FINANCE_STAFF"], requiredPermissions: ["PORTAL_FINANCE"],
        children: [{ id: "fin_recon", label_en: "Reconciliation", label_mm: "Reconciliation", path: "/portal/finance/recon", icon: ClipboardList }],
      },
      { id: "marketing", label_en: "Marketing", label_mm: "Marketing", path: "/portal/marketing", icon: Megaphone, allowRoles: ["SYS", "APP_OWNER", "SUPER_ADMIN", "MARKETING_ADMIN"], requiredPermissions: ["PORTAL_MARKETING"] },
      {
        id: "hr", label_en: "HR", label_mm: "HR", path: "/portal/hr", icon: Users, allowRoles: ["SYS", "APP_OWNER", "SUPER_ADMIN", "HR_ADMIN"], requiredPermissions: ["PORTAL_HR"],
        children: [{ id: "hr_admin", label_en: "HR Admin Ops", label_mm: "HR Admin Ops", path: "/portal/hr/admin", icon: ClipboardList }],
      },
      { id: "support", label_en: "Support", label_mm: "Support", path: "/portal/support", icon: LifeBuoy, allowRoles: ["SYS", "APP_OWNER", "SUPER_ADMIN", "CUSTOMER_SERVICE"], requiredPermissions: ["PORTAL_SUPPORT"] },
      {
        id: "execution", label_en: "Execution", label_mm: "Execution", path: "/portal/execution", icon: Truck, allowRoles: ["SYS", "APP_OWNER", "SUPER_ADMIN", "RIDER", "DRIVER", "HELPER", "SUPERVISOR"], requiredPermissions: ["PORTAL_EXECUTION"],
        children: [
          { id: "exec_nav", label_en: "Navigation", label_mm: "Navigation", path: "/portal/execution/navigation", icon: Activity },
          { id: "exec_manual", label_en: "Manual", label_mm: "Manual", path: "/portal/execution/manual", icon: ClipboardList },
        ],
      },
      {
        id: "warehouse", label_en: "Warehouse", label_mm: "Warehouse", path: "/portal/warehouse", icon: Warehouse, allowRoles: ["SYS", "APP_OWNER", "SUPER_ADMIN", "WAREHOUSE_MANAGER"], requiredPermissions: ["PORTAL_WAREHOUSE"],
        children: [
          { id: "wh_recv", label_en: "Receiving", label_mm: "Receiving", path: "/portal/warehouse/receiving", icon: ClipboardList },
          { id: "wh_disp", label_en: "Dispatch", label_mm: "Dispatch", path: "/portal/warehouse/dispatch", icon: ClipboardList },
        ],
      },
      {
        id: "branch", label_en: "Branch", label_mm: "Branch", path: "/portal/branch", icon: GitBranch, allowRoles: ["SYS", "APP_OWNER", "SUPER_ADMIN", "SUBSTATION_MANAGER"], requiredPermissions: ["PORTAL_BRANCH"],
        children: [
          { id: "br_in", label_en: "Inbound", label_mm: "Inbound", path: "/portal/branch/inbound", icon: ClipboardList },
          { id: "br_out", label_en: "Outbound", label_mm: "Outbound", path: "/portal/branch/outbound", icon: ClipboardList },
        ],
      },
      {
        id: "supervisor", label_en: "Supervisor", label_mm: "Supervisor", path: "/portal/supervisor", icon: UserCheck, allowRoles: ["SYS", "APP_OWNER", "SUPER_ADMIN", "SUPERVISOR"], requiredPermissions: ["PORTAL_SUPERVISOR"],
        children: [
          { id: "sup_approval", label_en: "Approval Gateway", label_mm: "Approval Gateway", path: "/portal/supervisor/approval", icon: ShieldCheck },
          { id: "sup_fraud", label_en: "Fraud Signals", label_mm: "Fraud Signals", path: "/portal/supervisor/fraud", icon: ShieldAlert },
        ],
      },
      { id: "merchant", label_en: "Merchant", label_mm: "Merchant", path: "/portal/merchant", icon: Building2, allowRoles: ["SYS", "APP_OWNER", "SUPER_ADMIN", "MERCHANT"], requiredPermissions: ["PORTAL_MERCHANT"] },
      { id: "customer", label_en: "Customer", label_mm: "Customer", path: "/portal/customer", icon: Users, allowRoles: ["SYS", "APP_OWNER", "SUPER_ADMIN", "CUSTOMER"], requiredPermissions: ["PORTAL_CUSTOMER"] },
    ],
  },
];

export type FlatNavItem = NavItem & { sectionId: string; sectionTitle_en: string; sectionTitle_mm: string; parentId?: string };

export function flattenNav(sections: NavSection[]): FlatNavItem[] {
  const out: FlatNavItem[] = [];
  for (const sec of sections) {
    for (const it of sec.items) {
      out.push({ ...it, sectionId: sec.id, sectionTitle_en: sec.title_en, sectionTitle_mm: sec.title_mm });
      if (it.children) {
        for (const c of it.children) {
          out.push({ ...c, sectionId: sec.id, sectionTitle_en: sec.title_en, sectionTitle_mm: sec.title_mm, parentId: it.id });
        }
      }
    }
  }
  return out;
}

export function flatByPath(sections: NavSection[]): Record<string, FlatNavItem> {
  const out: Record<string, FlatNavItem> = {};
  for (const it of flattenNav(sections)) out[it.path] = it;
  return out;
}

// --- Fully Implemented Legacy Functions ---
export const PORTALS = NAV_SECTIONS.flatMap(sec => sec.items.map(item => ({
  ...item,
  name: item.label_en,
  href: item.path,
  description: item.label_mm,
})));

export const getAvailablePortals = (authOrRole?: any): any[] => {
  const role = typeof authOrRole === 'string' ? authOrRole : authOrRole?.role;
  return PORTALS.filter(p => allowedByRole({ role }, p.allowRoles));
};

export const portalCountAll = PORTALS.length;
export const portalCountForRole = (role?: any) => getAvailablePortals(role).length;
export const portalsForRole = getAvailablePortals;

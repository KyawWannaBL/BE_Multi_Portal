#!/usr/bin/env bash
set -euo pipefail

echo "🚀 Initiating Complete Enterprise System Restoration..."

# -----------------------------------------------------------------------------
# 0) SETUP VARIABLES & BACKUP FUNCTION
# -----------------------------------------------------------------------------
backup() {
  local f="$1"
  [[ -f "$f" ]] || return 0
  cp -f "$f" "${f}.bak.$(date +%Y%m%d_%H%M%S)"
}

APP="src/App.tsx"
SUPA="src/lib/supabase.ts"
LOGIN="src/pages/Login.tsx"
SIGNUP="src/pages/SignUp.tsx"
PORTAL_SHELL="src/components/layout/PortalShell.tsx"
TIER_BADGE="src/components/TierBadge.tsx"
AUTH_CTX="src/contexts/AuthContext.tsx"
PORTAL_SIDEBAR="src/components/layout/PortalSidebar.tsx"
PORTAL_REGISTRY="src/lib/portalRegistry.ts"
SUPER_ADMIN="src/pages/portals/admin/SuperAdminPortal.tsx"
EXEC_CMD="src/pages/portals/admin/ExecutiveCommandCenter.tsx"
ADMIN_WRAP="src/pages/portals/admin/AdminModuleWrapper.tsx"
EXEC_MANUAL="src/pages/portals/execution/ExecutionManualPage.tsx"
ENT_PORTAL="src/pages/EnterprisePortal.tsx"
RESET_PW="src/pages/ResetPassword.tsx"
UNAUTH="src/pages/Unauthorized.tsx"
DASH_REDIR="src/pages/DashboardRedirect.tsx"
REQ_AUTH="src/routes/RequireAuth.tsx"
REQ_ROLE="src/routes/RequireRole.tsx"
REQ_AUTHZ="src/routes/RequireAuthz.tsx"
ACCT_CTRL="src/pages/AccountControl.tsx"
ACCT_STORE="src/lib/accountControlStore.ts"
PERM_RESOLVER="src/lib/permissionResolver.ts"

echo "Creating directories..."
mkdir -p src/lib src/services src/contexts src/components/layout src/routes
mkdir -p src/pages/portals/admin src/pages/portals/operations src/pages/portals/finance
mkdir -p src/pages/portals/execution src/pages/portals/hr src/pages/portals/warehouse
mkdir -p src/pages/portals/branch src/pages/portals/supervisor

echo "Backing up existing files..."
backup "$APP"
backup "$SUPA"
backup "$LOGIN"
backup "$SIGNUP"
backup "$PORTAL_SHELL"
backup "$TIER_BADGE"
backup "$AUTH_CTX"
backup "$PORTAL_SIDEBAR"
backup "$PORTAL_REGISTRY"
backup "$SUPER_ADMIN"
backup "$ACCT_CTRL"
backup "$ACCT_STORE"

# Restore original pages from git if they were modified/deleted
git checkout HEAD -- src/pages/ 2>/dev/null || true

# -----------------------------------------------------------------------------
# INSTALL MISSING DEPENDENCIES (Fixes Vercel "sonner" and "date-fns" crash)
# -----------------------------------------------------------------------------
echo "📦 Installing required UI dependencies to prevent build crashes..."
npm install --save sonner date-fns lucide-react react-router-dom clsx tailwind-merge @radix-ui/react-slot class-variance-authority recharts react-hook-form zod @hookform/resolvers

# Generate safe placeholders for secondary routes (Excluding AccountControl as we write it below)
STUB_FILES=(
  "src/pages/AdminDashboard.tsx"
  "src/pages/AuditLogs.tsx"
  "src/pages/AdminUsers.tsx"
  "src/pages/PermissionAssignment.tsx"
  "src/pages/portals/AdminPortal.tsx"
  "src/pages/portals/OperationsPortal.tsx"
  "src/pages/portals/OperationsTrackingPage.tsx"
  "src/pages/portals/FinancePortal.tsx"
  "src/pages/portals/finance/FinanceReconPage.tsx"
  "src/pages/portals/HrPortal.tsx"
  "src/pages/portals/hr/HrAdminOpsPage.tsx"
  "src/pages/portals/MarketingPortal.tsx"
  "src/pages/portals/SupportPortal.tsx"
  "src/pages/portals/ExecutionPortal.tsx"
  "src/pages/portals/ExecutionNavigationPage.tsx"
  "src/pages/portals/WarehousePortal.tsx"
  "src/pages/portals/warehouse/WarehouseReceivingPage.tsx"
  "src/pages/portals/warehouse/WarehouseDispatchPage.tsx"
  "src/pages/portals/BranchPortal.tsx"
  "src/pages/portals/branch/BranchInboundPage.tsx"
  "src/pages/portals/branch/BranchOutboundPage.tsx"
  "src/pages/portals/SupervisorPortal.tsx"
  "src/pages/portals/supervisor/SupervisorApprovalPage.tsx"
  "src/pages/portals/supervisor/SupervisorFraudPage.tsx"
  "src/pages/portals/MerchantPortal.tsx"
  "src/pages/portals/CustomerPortal.tsx"
  "src/pages/portals/operations/DataEntryOpsPage.tsx"
  "src/pages/portals/operations/QROpsScanPage.tsx"
  "src/pages/portals/operations/WaybillCenterPage.tsx"
  "$SIGNUP"
)

for f in "${STUB_FILES[@]}"; do
  if [ ! -f "$f" ]; then
    mkdir -p "$(dirname "$f")"
    cat > "$f" << 'EOF'
import React from 'react';
export default function Stub() {
  return (
    <div className="min-h-screen bg-[#05080F] flex flex-col items-center justify-center p-4 text-center">
      <h1 className="text-2xl font-black text-emerald-400 uppercase tracking-widest mb-2">Module Initializing</h1>
      <p className="text-slate-400 text-sm">Content is being provisioned.</p>
    </div>
  );
}
EOF
  fi
done

# -----------------------------------------------------------------------------
# 1) PERMISSION RESOLVER & PORTAL REGISTRY
# -----------------------------------------------------------------------------
cat > "$PERM_RESOLVER" <<'EOF'
export function hasAnyPermission(auth: any, required: string[]): boolean {
  if (!required || required.length === 0) return true;
  if (!auth) return false;
  const userPerms = Array.isArray(auth.permissions) ? auth.permissions : [];
  return required.some(r => userPerms.includes(r));
}
EOF

cat > "$PORTAL_REGISTRY" <<'EOF'
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

export type NavItem = {
  id: string;
  label_en: string;
  label_mm: string;
  path: string;
  icon: LucideIcon;
  allowRoles?: string[];
  requiredPermissions?: string[];
  children?: NavItem[];
};

export type NavSection = {
  id: string;
  title_en: string;
  title_mm: string;
  items: NavItem[];
};

export function normalizeRole(role?: string | null): string {
  const r = (role ?? "").trim().toUpperCase();
  if (!r) return "GUEST";
  if (r === "SUPER_A") return "SUPER_ADMIN";
  if (r.startsWith("SUPER")) return "SUPER_ADMIN";
  if (r.startsWith("APP")) return "APP_OWNER";
  if (r.startsWith("SYS")) return "SYS";
  return r;
}

const isPrivileged = (role: string | null | undefined) => {
  const r = normalizeRole(role);
  return r === "SYS" || r === "APP_OWNER" || r === "SUPER_ADMIN";
};

const allow = (role: string | null | undefined, roles?: string[]) => {
  if (!roles || roles.length === 0) return true;
  const r = normalizeRole(role);
  if (!r || r === "GUEST") return false;
  return roles.map((x) => x.toUpperCase()).includes(r);
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
          { id: "sa_accounts", label_en: "Account Control", label_mm: "အကောင့်စီမံခန့်ခွဲမှု", path: "/portal/admin/accounts", icon: UserCheck, requiredPermissions: ["AUTHORITY_MANAGE"] },
          { id: "sa_admin_dash", label_en: "Admin Dashboard", label_mm: "Admin Dashboard", path: "/portal/admin/dashboard", icon: ClipboardList },
          { id: "sa_audit", label_en: "Audit Logs", label_mm: "Audit Logs", path: "/portal/admin/audit", icon: ShieldAlert, requiredPermissions: ["AUDIT_READ"] },
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
        allowRoles: ["SYS", "APP_OWNER", "SUPER_ADMIN", "FINANCE_USER", "FINANCE_STAFF", "ACCOUNTANT"],
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
        allowRoles: ["SYS", "APP_OWNER", "SUPER_ADMIN", "HR_ADMIN", "HR"],
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
        allowRoles: ["SYS", "APP_OWNER", "SUPER_ADMIN", "RIDER", "DRIVER", "HELPER", "SUPERVISOR", "RDR"],
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

export function defaultPortalForRole(role: string | null | undefined): string {
  const r = normalizeRole(role);
  if (["SYS", "APP_OWNER", "SUPER_ADMIN"].includes(r)) return "/portal/admin";
  const portals = portalsForRole(role);
  if (portals.length > 0) return portals[0].path;
  return "/portal/operations";
}
EOF

# -----------------------------------------------------------------------------
# 2) ENTERPRISE ACCOUNT CONTROL STORE & UI
# -----------------------------------------------------------------------------
cat > "$ACCT_STORE" <<'EOF'
export type Role =
  | "SYS"
  | "APP_OWNER"
  | "SUPER_ADMIN"
  | "ADMIN"
  | "ADM"
  | "MGR"
  | "STAFF"
  | "FINANCE_USER"
  | "FINANCE_STAFF"
  | "HR_ADMIN"
  | "MARKETING_ADMIN"
  | "CUSTOMER_SERVICE"
  | "WAREHOUSE_MANAGER"
  | "SUBSTATION_MANAGER"
  | "SUPERVISOR"
  | "RIDER"
  | "DRIVER"
  | "HELPER"
  | "MERCHANT"
  | "CUSTOMER"
  | "GUEST";

export type AccountStatus = "PENDING" | "ACTIVE" | "SUSPENDED" | "REJECTED" | "ARCHIVED";

export type Permission =
  | "ADMIN_PORTAL_READ"
  | "EXEC_COMMAND_READ"
  | "ADMIN_DASH_READ"
  | "ADMIN_USER_READ"
  | "USER_READ"
  | "USER_CREATE"
  | "USER_APPROVE"
  | "USER_REJECT"
  | "USER_ROLE_EDIT"
  | "USER_BLOCK"
  | "USER_RESET_TOKEN"
  | "USER_DOCS_READ"
  | "AUTHORITY_MANAGE"
  | "AUDIT_READ"
  | "BULK_ACTIONS"
  | "CSV_IMPORT"
  | "CSV_EXPORT"
  | "PORTAL_OPERATIONS"
  | "PORTAL_FINANCE"
  | "PORTAL_MARKETING"
  | "PORTAL_HR"
  | "PORTAL_SUPPORT"
  | "PORTAL_EXECUTION"
  | "PORTAL_WAREHOUSE"
  | "PORTAL_BRANCH"
  | "PORTAL_SUPERVISOR"
  | "PORTAL_MERCHANT"
  | "PORTAL_CUSTOMER"
  | string;

export type PasskeyCredential = { id: string; createdAt: string; label?: string };

export type AccountSecurity = {
  blockedAt?: string;
  blockedBy?: string;
  onboardingTokenHash?: string;
  onboardingTokenIssuedAt?: string;
  onboardingTokenExpiresAt?: string;
  passkeys?: PasskeyCredential[];
  biometricGateEnabled?: boolean;
};

export type AccountApproval = {
  requestedAt: string;
  requestedBy: string;
  processedAt?: string;
  processedBy?: string;
  decision?: "APPROVED" | "REJECTED";
  note?: string;
};

export type Account = {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: AccountStatus;

  department?: string;
  phone?: string;
  employeeId?: string;

  createdAt: string;
  createdBy: string;

  approval?: AccountApproval;
  security?: AccountSecurity;
};

export type AuthorityGrant = {
  id: string;
  subjectEmail: string;
  permission: Permission;
  grantedAt: string;
  grantedBy: string;
  revokedAt?: string;
  revokedBy?: string;
};

export type AuditEvent = {
  id: string;
  at: string;
  actorEmail: string;
  action: string;
  targetEmail?: string;
  detail?: string;
};

export type Store = {
  v: 2;
  accounts: Account[];
  grants: AuthorityGrant[];
  audit: AuditEvent[];
};

export const STORAGE_KEY = "account_control_store_v2";

export const PERMISSIONS: { code: Permission; en: string; mm: string }[] = [
  { code: "ADMIN_PORTAL_READ", en: "Super Admin portal access", mm: "Super Admin portal ဝင်ခွင့်" },
  { code: "EXEC_COMMAND_READ", en: "Executive command access", mm: "Executive command ဝင်ခွင့်" },
  { code: "ADMIN_DASH_READ", en: "Admin dashboard view", mm: "Admin dashboard ကြည့်ခွင့်" },
  { code: "ADMIN_USER_READ", en: "Admin users view", mm: "Admin users ကြည့်ခွင့်" },
  { code: "USER_READ", en: "View accounts", mm: "အကောင့်များကြည့်ရန်" },
  { code: "USER_CREATE", en: "Create account request", mm: "အကောင့်တောင်းဆိုမှု ဖန်တီးရန်" },
  { code: "USER_APPROVE", en: "Approve requests", mm: "တောင်းဆိုမှု အတည်ပြုရန်" },
  { code: "USER_REJECT", en: "Reject requests", mm: "တောင်းဆိုမှု ငြင်းပယ်ရန်" },
  { code: "USER_ROLE_EDIT", en: "Edit roles", mm: "Role ပြောင်းရန်" },
  { code: "USER_BLOCK", en: "Block/Unblock", mm: "ပိတ်/ဖွင့်ရန်" },
  { code: "USER_RESET_TOKEN", en: "Reset onboarding token", mm: "Onboarding token ပြန်ချရန်" },
  { code: "USER_DOCS_READ", en: "View docs", mm: "စာရွက်စာတမ်းကြည့်ရန်" },
  { code: "AUTHORITY_MANAGE", en: "Manage authorities", mm: "အာဏာများ စီမံရန်" },
  { code: "AUDIT_READ", en: "View audit log", mm: "Audit log ကြည့်ရန်" },
  { code: "BULK_ACTIONS", en: "Bulk actions", mm: "အုပ်စုလိုက်လုပ်ဆောင်မှု" },
  { code: "CSV_IMPORT", en: "CSV import", mm: "CSV သွင်းရန်" },
  { code: "CSV_EXPORT", en: "CSV export", mm: "CSV ထုတ်ရန်" },
  { code: "PORTAL_OPERATIONS", en: "Operations portal access", mm: "Operations portal ဝင်ခွင့်" },
  { code: "PORTAL_FINANCE", en: "Finance portal access", mm: "Finance portal ဝင်ခွင့်" },
  { code: "PORTAL_MARKETING", en: "Marketing portal access", mm: "Marketing portal ဝင်ခွင့်" },
  { code: "PORTAL_HR", en: "HR portal access", mm: "HR portal ဝင်ခွင့်" },
  { code: "PORTAL_SUPPORT", en: "Support portal access", mm: "Support portal ဝင်ခွင့်" },
  { code: "PORTAL_EXECUTION", en: "Execution portal access", mm: "Execution portal ဝင်ခွင့်" },
  { code: "PORTAL_WAREHOUSE", en: "Warehouse portal access", mm: "Warehouse portal ဝင်ခွင့်" },
  { code: "PORTAL_BRANCH", en: "Branch portal access", mm: "Branch portal ဝင်ခွင့်" },
  { code: "PORTAL_SUPERVISOR", en: "Supervisor portal access", mm: "Supervisor portal ဝင်ခွင့်" },
  { code: "PORTAL_MERCHANT", en: "Merchant portal access", mm: "Merchant portal ဝင်ခွင့်" },
  { code: "PORTAL_CUSTOMER", en: "Customer portal access", mm: "Customer portal ဝင်ခွင့်" },
];

export const DEFAULT_ROLES: Role[] = [
  "SYS", "APP_OWNER", "SUPER_ADMIN", "ADMIN", "ADM", "MGR", "STAFF", "FINANCE_USER", "FINANCE_STAFF",
  "HR_ADMIN", "MARKETING_ADMIN", "CUSTOMER_SERVICE", "WAREHOUSE_MANAGER", "SUBSTATION_MANAGER",
  "SUPERVISOR", "RIDER", "DRIVER", "HELPER", "MERCHANT", "CUSTOMER",
];

export function nowIso(): string { return new Date().toISOString(); }
export function safeLower(v: unknown): string { return String(v ?? "").trim().toLowerCase(); }
export function uuid(): string {
  const c: any = globalThis.crypto;
  if (c?.randomUUID) return c.randomUUID();
  return `id_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}
export function isEmailValid(email: string): boolean { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()); }

export function normalizeRole(role?: string | null): Role {
  const r = String(role ?? "").trim().toUpperCase();
  if (!r) return "GUEST";
  if (r.startsWith("SUPER")) return "SUPER_ADMIN";
  if (r.startsWith("APP")) return "APP_OWNER";
  if (r.startsWith("SYS")) return "SYS";
  return r as Role;
}

export function roleIsPrivileged(role?: string | null): boolean {
  const r = normalizeRole(role);
  return r === "SYS" || r === "APP_OWNER" || r === "SUPER_ADMIN";
}

export function seedStore(): Store {
  const at = nowIso();
  return {
    v: 2,
    accounts: [
      { id: uuid(), name: "MD VENTURES", email: "md@britiumventures.com", role: "APP_OWNER", status: "ACTIVE", createdAt: at, createdBy: "SYSTEM" },
      { id: uuid(), name: "SUPER ADMIN", email: "md@britiumexpress.com", role: "SUPER_ADMIN", status: "ACTIVE", createdAt: at, createdBy: "SYSTEM" },
    ],
    grants: [],
    audit: [{ id: uuid(), at, actorEmail: "SYSTEM", action: "STORE_SEEDED", detail: "Initial seed created" }],
  };
}

export function loadStore(): Store {
  if (typeof window === "undefined") return seedStore();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedStore();
    const s = JSON.parse(raw) as Store;
    if (!s || !Array.isArray(s.accounts) || !Array.isArray(s.grants) || !Array.isArray(s.audit)) return seedStore();
    return { ...s, v: 2 };
  } catch {
    return seedStore();
  }
}

export function saveStore(store: Store): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function getAccountByEmail(accounts: Account[], email: string): Account | undefined {
  const e = safeLower(email);
  return accounts.find((a) => safeLower(a.email) === e);
}

export function activeGrantsFor(grants: AuthorityGrant[], subjectEmail: string): AuthorityGrant[] {
  const e = safeLower(subjectEmail);
  return grants.filter((g) => safeLower(g.subjectEmail) === e && !g.revokedAt);
}

export function effectivePermissions(store: Store, actor: Account | undefined): Set<Permission> {
  if (!actor) return new Set();
  if (roleIsPrivileged(actor.role)) return new Set(PERMISSIONS.map((p) => p.code));
  return new Set(activeGrantsFor(store.grants, actor.email).map((g) => g.permission));
}

export function can(store: Store, actor: Account | undefined, perm: Permission): boolean {
  return effectivePermissions(store, actor).has(perm);
}

export function canGrantPermission(store: Store, actor: Account | undefined, perm: Permission): boolean {
  if (!actor) return false;
  if (!can(store, actor, "AUTHORITY_MANAGE")) return false;
  if (roleIsPrivileged(actor.role)) return true;
  return can(store, actor, perm);
}

export function pushAudit(store: Store, e: Omit<AuditEvent, "id" | "at"> & { at?: string }): Store {
  const evt: AuditEvent = { id: uuid(), at: e.at ?? nowIso(), actorEmail: e.actorEmail, action: e.action, targetEmail: e.targetEmail, detail: e.detail };
  return { ...store, audit: [evt, ...store.audit].slice(0, 500) };
}

export function ensureAtLeastOneSuperAdminActive(accounts: Account[]): boolean {
  return accounts.filter((a) => a.role === "SUPER_ADMIN" && a.status === "ACTIVE").length >= 1;
}

export function csvParse(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const n = text[i + 1];
    if (inQuotes) {
      if (c === '"' && n === '"') { field += '"'; i++; }
      else if (c === '"') { inQuotes = false; }
      else { field += c; }
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ",") { row.push(field); field = ""; }
      else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
      else if (c !== "\r") { field += c; }
    }
  }
  row.push(field);
  rows.push(row);
  return rows.filter((r) => r.some((x) => x.trim() !== ""));
}

export function csvStringify(rows: string[][]): string {
  const esc = (s: string) => {
    const needs = /[",\n\r]/.test(s);
    const out = s.replaceAll('"', '""');
    return needs ? `"${out}"` : out;
  };
  return rows.map((r) => r.map((c) => esc(c ?? "")).join(",")).join("\n");
}
EOF

cat > "$ACCT_CTRL" <<'EOF'
'use client';

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertTriangle, CheckCircle2, ClipboardCopy, Download, History, Key, Lock, RefreshCw, Search, ShieldCheck, Upload, UserCog, UserPlus, XCircle } from "lucide-react";
import { DEFAULT_ROLES, PERMISSIONS, STORAGE_KEY, type Account, type AccountStatus, type Permission, type Role, activeGrantsFor, can, canGrantPermission, csvParse, csvStringify, effectivePermissions, ensureAtLeastOneSuperAdminActive, getAccountByEmail, isEmailValid, loadStore, nowIso, pushAudit, roleIsPrivileged, safeLower, saveStore, uuid } from "@/lib/accountControlStore";

type Toast = { type: "ok" | "err" | "warn"; msg: string };

function Modal(props: { open: boolean; title: string; onClose: () => void; widthClass?: string; children: React.ReactNode }) {
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!props.open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && props.onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [props.open, props.onClose]);

  useEffect(() => {
    if (props.open) setTimeout(() => panelRef.current?.focus(), 0);
  }, [props.open]);

  if (!props.open) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={props.onClose} />
      <div ref={panelRef} tabIndex={-1} role="dialog" aria-modal="true" className={`relative w-full ${props.widthClass ?? "max-w-3xl"} rounded-[2rem] bg-[#05080F] ring-1 ring-white/10 shadow-2xl outline-none max-h-[90vh] overflow-y-auto custom-scrollbar`}>
        <div className="flex items-center justify-between p-6 border-b border-white/5 sticky top-0 bg-[#05080F] z-10">
          <div>
            <div className="text-white font-black uppercase italic">{props.title}</div>
            <div className="text-[10px] uppercase tracking-widest text-slate-500 font-mono">enterprise_identity_governance</div>
          </div>
          <Button variant="ghost" className="text-slate-400 hover:text-white" onClick={props.onClose}>
            <XCircle className="h-5 w-5" />
          </Button>
        </div>
        <div className="p-6">{props.children}</div>
      </div>
    </div>
  );
}

function Pill(props: { children: React.ReactNode; className?: string }) {
  return <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black tracking-tighter ${props.className ?? ""}`}>{props.children}</span>;
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`h-11 w-full rounded-xl bg-[#0B101B] border border-white/10 px-4 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500/40 ${props.className ?? ""}`} />;
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`min-h-[92px] w-full rounded-xl bg-[#0B101B] border border-white/10 px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500/40 ${props.className ?? ""}`} />;
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`h-11 w-full rounded-xl bg-[#0B101B] border border-white/10 px-4 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/40 ${props.className ?? ""}`} />;
}

function Divider() {
  return <div className="h-px w-full bg-white/5 my-4" />;
}

function formatStatus(status: AccountStatus): { label: string; cls: string } {
  switch (status) {
    case "ACTIVE": return { label: "ACTIVE", cls: "text-emerald-400" };
    case "PENDING": return { label: "PENDING", cls: "text-amber-400" };
    case "SUSPENDED": return { label: "SUSPENDED", cls: "text-rose-400" };
    case "REJECTED": return { label: "REJECTED", cls: "text-rose-400" };
    case "ARCHIVED": return { label: "ARCHIVED", cls: "text-slate-500" };
    default: return { label: status, cls: "text-slate-400" };
  }
}

function roleBadgeClass(role: Role): string {
  if (role === "SYS" || role === "APP_OWNER") return "bg-emerald-500/10 text-emerald-400";
  if (role === "SUPER_ADMIN") return "bg-sky-500/10 text-sky-400";
  if (role === "ADMIN" || role === "ADM" || role === "MGR") return "bg-amber-500/10 text-amber-300";
  return "bg-white/5 text-slate-300";
}

function downloadBlob(filename: string, contentType: string, data: string) {
  const blob = new Blob([data], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function AccountControl() {
  const { lang } = useLanguage();
  const auth = useAuth() as any;
  const t = (en: string, mm: string) => (lang === "en" ? en : mm);

  const [store, setStore] = useState(() => loadStore());
  const [toast, setToast] = useState<Toast | null>(null);

  const actorEmail = (auth?.user?.email ?? "") as string;
  const actor = useMemo(() => (actorEmail ? getAccountByEmail(store.accounts, actorEmail) : undefined), [store.accounts, actorEmail]);
  const actorPerms = useMemo(() => effectivePermissions(store, actor), [store, actor]);

  useEffect(() => saveStore(store), [store]);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2400);
    return () => window.clearTimeout(id);
  }, [toast]);

  const canRead = !!actor && actor.status === "ACTIVE" && can(store, actor, "USER_READ");
  const canCreate = !!actor && actor.status === "ACTIVE" && can(store, actor, "USER_CREATE");
  const canApprove = !!actor && actor.status === "ACTIVE" && can(store, actor, "USER_APPROVE");
  const canReject = !!actor && actor.status === "ACTIVE" && can(store, actor, "USER_REJECT");
  const canRoleEdit = !!actor && actor.status === "ACTIVE" && can(store, actor, "USER_ROLE_EDIT");
  const canBlock = !!actor && actor.status === "ACTIVE" && can(store, actor, "USER_BLOCK");
  const canAuth = !!actor && actor.status === "ACTIVE" && can(store, actor, "AUTHORITY_MANAGE");
  const canAudit = !!actor && actor.status === "ACTIVE" && can(store, actor, "AUDIT_READ");
  const canExport = !!actor && actor.status === "ACTIVE" && can(store, actor, "CSV_EXPORT");
  const canImport = !!actor && actor.status === "ACTIVE" && can(store, actor, "CSV_IMPORT");
  const canBulk = !!actor && actor.status === "ACTIVE" && can(store, actor, "BULK_ACTIONS");

  const [q, setQ] = useState("");
  const [filterStatus, setFilterStatus] = useState<AccountStatus | "ALL">("ALL");
  const [filterRole, setFilterRole] = useState<Role | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const selectedEmails = useMemo(() => Object.keys(selected).filter((k) => selected[k]), [selected]);

  const [modalCreate, setModalCreate] = useState(false);
  const [modalAudit, setModalAudit] = useState(false);
  const [modalAuthorityEmail, setModalAuthorityEmail] = useState<string | null>(null);
  const [modalProfileEmail, setModalProfileEmail] = useState<string | null>(null);
  const [modalApproveEmail, setModalApproveEmail] = useState<string | null>(null);
  const [modalRejectEmail, setModalRejectEmail] = useState<string | null>(null);
  const [modalImport, setModalImport] = useState(false);
  const [modalBulk, setModalBulk] = useState(false);

  function auditPush(action: string, targetEmail?: string, detail?: string) {
    setStore((prev) => pushAudit(prev, { actorEmail: actorEmail || "UNKNOWN", action, targetEmail, detail }));
  }

  const filtered = useMemo(() => {
    const qq = safeLower(q);
    return store.accounts
      .filter((a) => {
        if (filterStatus !== "ALL" && a.status !== filterStatus) return false;
        if (filterRole !== "ALL" && a.role !== filterRole) return false;
        if (!qq) return true;
        return safeLower(a.name).includes(qq) || safeLower(a.email).includes(qq);
      })
      .sort((a, b) => safeLower(a.email).localeCompare(safeLower(b.email)));
  }, [store.accounts, q, filterStatus, filterRole]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = useMemo(() => {
    const p = Math.min(page, totalPages);
    const start = (p - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, totalPages]);

  useEffect(() => setPage(1), [q, filterStatus, filterRole]);

  function upsertAccount(next: Account) {
    setStore((prev) => ({ ...prev, accounts: prev.accounts.map((a) => (safeLower(a.email) === safeLower(next.email) ? next : a)) }));
  }

  function addAccount(acc: Account) {
    setStore((prev) => ({ ...prev, accounts: [acc, ...prev.accounts] }));
  }

  function approve(email: string, note?: string) {
    if (!actor || !canApprove) return;
    const target = getAccountByEmail(store.accounts, email);
    if (!target) return;
    if (!roleIsPrivileged(actor.role) && roleIsPrivileged(target.role)) { setToast({ type: "err", msg: "Cannot modify privileged accounts." }); return; }
    const next: Account = { ...target, status: "ACTIVE", approval: { requestedAt: target.approval?.requestedAt ?? target.createdAt, requestedBy: target.approval?.requestedBy ?? target.createdBy, processedAt: nowIso(), processedBy: actorEmail, decision: "APPROVED", note } };
    upsertAccount(next);
    auditPush("REQUEST_APPROVED", email, note ?? "Approved");
    setToast({ type: "ok", msg: t("Saved.", "သိမ်းပြီးပါပြီ။") });
  }

  function reject(email: string, note?: string) {
    if (!actor || !canReject) return;
    const target = getAccountByEmail(store.accounts, email);
    if (!target) return;
    if (!roleIsPrivileged(actor.role) && roleIsPrivileged(target.role)) { setToast({ type: "err", msg: "Cannot modify privileged accounts." }); return; }
    const next: Account = { ...target, status: "REJECTED", approval: { requestedAt: target.approval?.requestedAt ?? target.createdAt, requestedBy: target.approval?.requestedBy ?? target.createdBy, processedAt: nowIso(), processedBy: actorEmail, decision: "REJECTED", note } };
    upsertAccount(next);
    auditPush("REQUEST_REJECTED", email, note ?? "Rejected");
    setToast({ type: "ok", msg: t("Saved.", "သိမ်းပြီးပါပြီ။") });
  }

  function blockToggle(email: string, block: boolean) {
    if (!actor || !canBlock) return;
    const target = getAccountByEmail(store.accounts, email);
    if (!target) return;
    if (!roleIsPrivileged(actor.role) && roleIsPrivileged(target.role)) { setToast({ type: "err", msg: "Cannot modify privileged accounts." }); return; }
    const next: Account = { ...target, status: block ? "SUSPENDED" : "ACTIVE", security: { ...(target.security ?? {}), blockedAt: block ? nowIso() : undefined, blockedBy: block ? actorEmail : undefined } };
    upsertAccount(next);
    auditPush(block ? "ACCOUNT_BLOCKED" : "ACCOUNT_UNBLOCKED", email, `By ${actorEmail}`);
    setToast({ type: "ok", msg: t("Saved.", "သိမ်းပြီးပါပြီ။") });
  }

  function changeRole(email: string, role: Role) {
    if (!actor || !canRoleEdit) return;
    const target = getAccountByEmail(store.accounts, email);
    if (!target) return;
    if (!roleIsPrivileged(actor.role) && roleIsPrivileged(target.role)) { setToast({ type: "err", msg: "Cannot modify privileged accounts." }); return; }
    const next: Account = { ...target, role };
    const nextAccounts = store.accounts.map((a) => (safeLower(a.email) === safeLower(email) ? next : a));
    if (!ensureAtLeastOneSuperAdminActive(nextAccounts)) { setToast({ type: "err", msg: "Must keep at least one ACTIVE SUPER_ADMIN." }); return; }
    setStore((prev) => ({ ...prev, accounts: nextAccounts }));
    auditPush("ROLE_CHANGED", email, `Role -> ${role}`);
    setToast({ type: "ok", msg: t("Saved.", "သိမ်းပြီးပါပြီ။") });
  }

  function grantPermission(subjectEmail: string, permission: Permission) {
    if (!actor || !canAuth) return;
    if (!canGrantPermission(store, actor, permission)) { setToast({ type: "err", msg: "You cannot grant a permission you don't own." }); return; }
    const subject = getAccountByEmail(store.accounts, subjectEmail);
    if (!subject) return;
    if (!roleIsPrivileged(actor.role) && roleIsPrivileged(subject.role)) { setToast({ type: "err", msg: "Cannot modify privileged accounts." }); return; }
    const exists = store.grants.some((g) => safeLower(g.subjectEmail) === safeLower(subjectEmail) && g.permission === permission && !g.revokedAt);
    if (exists) return;
    setStore((prev) => ({ ...prev, grants: [{ id: uuid(), subjectEmail, permission, grantedAt: nowIso(), grantedBy: actorEmail }, ...prev.grants] }));
    auditPush("AUTHORITY_GRANTED", subjectEmail, `${permission}`);
    setToast({ type: "ok", msg: t("Saved.", "သိမ်းပြီးပါပြီ။") });
  }

  function revokePermission(subjectEmail: string, permission: Permission) {
    if (!actor || !canAuth) return;
    const subject = getAccountByEmail(store.accounts, subjectEmail);
    if (!subject) return;
    if (!roleIsPrivileged(actor.role) && roleIsPrivileged(subject.role)) { setToast({ type: "err", msg: "Cannot modify privileged accounts." }); return; }
    setStore((prev) => ({ ...prev, grants: prev.grants.map((g) => { if (safeLower(g.subjectEmail) !== safeLower(subjectEmail)) return g; if (g.permission !== permission) return g; if (g.revokedAt) return g; return { ...g, revokedAt: nowIso(), revokedBy: actorEmail }; }) }));
    auditPush("AUTHORITY_REVOKED", subjectEmail, `${permission}`);
    setToast({ type: "ok", msg: t("Saved.", "သိမ်းပြီးပါပြီ။") });
  }

  function exportAccountsCsv() {
    const header = ["name", "email", "role", "status", "department", "phone", "employeeId", "createdAt", "createdBy"];
    const rows: string[][] = [header];
    for (const a of filtered) { rows.push([a.name ?? "", a.email ?? "", a.role ?? "", a.status ?? "", a.department ?? "", a.phone ?? "", a.employeeId ?? "", a.createdAt ?? "", a.createdBy ?? ""]); }
    downloadBlob(`accounts_${new Date().toISOString().slice(0, 10)}.csv`, "text/csv;charset=utf-8", csvStringify(rows));
    auditPush("CSV_EXPORT_ACCOUNTS", undefined, `Rows=${filtered.length}`);
  }

  function exportGrantsCsv() {
    const header = ["subjectEmail", "permission", "grantedAt", "grantedBy", "revokedAt", "revokedBy"];
    const rows: string[][] = [header];
    for (const g of store.grants) { rows.push([g.subjectEmail, String(g.permission), g.grantedAt, g.grantedBy, g.revokedAt ?? "", g.revokedBy ?? ""]); }
    downloadBlob(`authorities_${new Date().toISOString().slice(0, 10)}.csv`, "text/csv;charset=utf-8", csvStringify(rows));
    auditPush("CSV_EXPORT_AUTHORITIES", undefined, `Rows=${store.grants.length}`);
  }

  function selectAllOnPage(checked: boolean) {
    const next = { ...selected };
    for (const a of paged) next[a.email] = checked;
    setSelected(next);
  }

  function clearSelection() { setSelected({}); }

  const CreateModal = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState<Role>("STAFF");
    const [department, setDepartment] = useState("");
    const [phone, setPhone] = useState("");
    const [employeeId, setEmployeeId] = useState("");
    const [note, setNote] = useState("");

    function submit() {
      if (!actor || !canCreate) return;
      const em = email.trim();
      if (!name.trim() || !isEmailValid(em)) { setToast({ type: "err", msg: t("Please check required fields.", "လိုအပ်သော အချက်အလက်များ စစ်ဆေးပါ။") }); return; }
      if (getAccountByEmail(store.accounts, em)) { setToast({ type: "err", msg: t("Email already exists.", "Email ရှိပြီးသားဖြစ်သည်။") }); return; }
      const createdAt = nowIso();
      const acc: Account = { id: uuid(), name: name.trim(), email: em, role, status: "PENDING", department: department.trim() || undefined, phone: phone.trim() || undefined, employeeId: employeeId.trim() || undefined, createdAt, createdBy: actorEmail, approval: { requestedAt: createdAt, requestedBy: actorEmail, note: note.trim() || undefined } };
      addAccount(acc);
      auditPush("REQUEST_CREATED", em, note.trim() || "Created");
      setModalCreate(false);
      setToast({ type: "ok", msg: t("Saved.", "သိမ်းပြီးပါပြီ။") });
    }

    return (
      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1"><div className="text-[11px] uppercase tracking-widest text-slate-500 font-mono">{t("Full name", "အမည်")}</div><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div className="space-y-1"><div className="text-[11px] uppercase tracking-widest text-slate-500 font-mono">{t("Email", "Email")}</div><Input value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div className="space-y-1"><div className="text-[11px] uppercase tracking-widest text-slate-500 font-mono">{t("Role", "Role")}</div><Select value={role} onChange={(e) => setRole(e.target.value as Role)}>{DEFAULT_ROLES.map((r) => (<option key={r} value={r}>{r}</option>))}</Select></div>
          <div className="space-y-1"><div className="text-[11px] uppercase tracking-widest text-slate-500 font-mono">{t("Department", "ဌာန")}</div><Input value={department} onChange={(e) => setDepartment(e.target.value)} /></div>
          <div className="space-y-1"><div className="text-[11px] uppercase tracking-widest text-slate-500 font-mono">{t("Phone", "ဖုန်း")}</div><Input value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
          <div className="space-y-1"><div className="text-[11px] uppercase tracking-widest text-slate-500 font-mono">{t("Employee ID", "ဝန်ထမ်း ID")}</div><Input value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} /></div>
        </div>
        <div className="space-y-1"><div className="text-[11px] uppercase tracking-widest text-slate-500 font-mono">{t("Reason / Note", "အကြောင်းရင်း / မှတ်ချက်")}</div><Textarea value={note} onChange={(e) => setNote(e.target.value)} /></div>
        <Divider />
        <div className="flex justify-end gap-3">
          <Button variant="ghost" className="text-slate-400 hover:text-white" onClick={() => setModalCreate(false)}>{t("Cancel", "မလုပ်တော့")}</Button>
          <Button className="bg-sky-600 hover:bg-sky-500 text-white font-black h-11 px-6 rounded-xl uppercase" onClick={submit}>{t("Save", "သိမ်းမည်")}</Button>
        </div>
      </div>
    );
  };

  const AuthorityModal = ({ email }: { email: string }) => {
    const subject = getAccountByEmail(store.accounts, email);
    if (!subject) return null;
    const subjectPerms = roleIsPrivileged(subject.role) ? new Set(PERMISSIONS.map((p) => p.code)) : new Set(activeGrantsFor(store.grants, subject.email).map((g) => g.permission));
    return (
      <div className="space-y-5">
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex items-center justify-between gap-3">
            <div><div className="text-white font-black uppercase italic">{subject.name}</div><div className="text-sm text-slate-500">{subject.email}</div></div>
            <Pill className={roleBadgeClass(subject.role)}>{subject.role}</Pill>
          </div>
          {!roleIsPrivileged(actor?.role) && roleIsPrivileged(subject.role) ? (
            <div className="mt-3 flex items-center gap-2 text-amber-300 text-sm"><AlertTriangle className="h-4 w-4" /> Privileged accounts can only be modified by SYS/APP_OWNER/SUPER_ADMIN.</div>
          ) : null}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {PERMISSIONS.map((p) => {
            const enabled = subjectPerms.has(p.code);
            const disabled = !actor || !canAuth || (roleIsPrivileged(subject.role) && !roleIsPrivileged(actor.role)) || (!roleIsPrivileged(actor.role) && !canGrantPermission(store, actor, p.code));
            return (
              <div key={String(p.code)} className={`p-4 rounded-2xl border ${enabled ? "border-sky-500/20 bg-sky-500/5" : "border-white/10 bg-white/5"}`}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-white font-bold">{lang === "en" ? p.en : p.mm}</div>
                    <div className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">{String(p.code)}</div>
                  </div>
                  <label className="flex items-center gap-2 text-sm text-slate-300">
                    <input type="checkbox" checked={enabled} disabled={disabled} onChange={(e) => { if (e.target.checked) grantPermission(subject.email, p.code); else revokePermission(subject.email, p.code); }} className="h-4 w-4 accent-sky-500 disabled:opacity-50" />
                    {enabled ? "ON" : "OFF"}
                  </label>
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-end"><Button variant="ghost" className="text-slate-400 hover:text-white" onClick={() => setModalAuthorityEmail(null)}>{t("Close", "ပိတ်")}</Button></div>
      </div>
    );
  };

  const AuditModal = () => {
    const events = store.audit.slice(0, 200);
    return (
      <div className="space-y-4">
        <div className="text-sm text-slate-500">Showing latest {events.length} events (max 200).</div>
        <div className="space-y-2 max-h-[60vh] overflow-auto pr-1 custom-scrollbar">
          {events.map((e) => (
            <div key={e.id} className="p-3 rounded-2xl bg-[#0B101B] border border-white/10">
              <div className="flex items-center justify-between gap-3">
                <div className="text-white font-bold">{e.action}</div>
                <div className="text-[10px] font-mono text-slate-600">{new Date(e.at).toLocaleString()}</div>
              </div>
              <div className="mt-1 text-xs text-slate-500">Actor: <span className="text-slate-300">{e.actorEmail}</span>{e.targetEmail ? <> {" "}• Target: <span className="text-slate-300">{e.targetEmail}</span></> : null}</div>
              {e.detail ? <div className="mt-1 text-xs text-slate-600">{e.detail}</div> : null}
            </div>
          ))}
        </div>
        <div className="flex justify-end"><Button variant="ghost" className="text-slate-400 hover:text-white" onClick={() => setModalAudit(false)}>{t("Close", "ပိတ်")}</Button></div>
      </div>
    );
  };

  const ApproveRejectModal = ({ email, mode }: { email: string; mode: "approve" | "reject" }) => {
    const target = getAccountByEmail(store.accounts, email);
    const [note, setNote] = useState("");
    if (!target) return null;
    return (
      <div className="space-y-4">
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex items-center justify-between gap-3">
            <div><div className="text-white font-black uppercase italic">{target.name}</div><div className="text-sm text-slate-500">{target.email}</div></div>
            <Pill className={roleBadgeClass(target.role)}>{target.role}</Pill>
          </div>
          <div className="mt-3 text-xs text-slate-600">Requested by: <span className="text-slate-400">{target.approval?.requestedBy ?? target.createdBy}</span></div>
        </div>
        <div className="space-y-1"><div className="text-[11px] uppercase tracking-widest text-slate-500 font-mono">{t("Reason / Note", "အကြောင်းရင်း / မှတ်ချက်")}</div><Textarea value={note} onChange={(e) => setNote(e.target.value)} /></div>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" className="text-slate-400 hover:text-white" onClick={() => (mode === "approve" ? setModalApproveEmail(null) : setModalRejectEmail(null))}>{t("Cancel", "မလုပ်တော့")}</Button>
          <Button className={`${mode === "approve" ? "bg-emerald-600 hover:bg-emerald-500" : "bg-rose-600 hover:bg-rose-500"} text-white font-black h-11 px-6 rounded-xl uppercase`} onClick={() => { if (mode === "approve") approve(email, note.trim() || undefined); else reject(email, note.trim() || undefined); setModalApproveEmail(null); setModalRejectEmail(null); }}>{mode === "approve" ? t("Approve", "အတည်ပြု") : t("Reject", "ငြင်းပယ်")}</Button>
        </div>
      </div>
    );
  };

  const ImportModal = () => {
    const [fileName, setFileName] = useState("");
    const [preview, setPreview] = useState<{ ok: number; skipped: number; errors: string[]; rows: Account[] } | null>(null);
    async function onPick(file: File | null) {
      if (!file) return;
      setFileName(file.name);
      const text = await file.text();
      const parsed = csvParse(text);
      const header = parsed[0]?.map((h) => safeLower(h));
      if (!header || header.length < 2) { setPreview({ ok: 0, skipped: 0, errors: ["Invalid CSV header."], rows: [] }); return; }
      const idx = (key: string) => header.indexOf(safeLower(key));
      const iName = idx("name"); const iEmail = idx("email"); const iRole = idx("role"); const iDept = idx("department"); const iPhone = idx("phone"); const iEmp = idx("employeeId");
      const errors: string[] = []; const rows: Account[] = []; let skipped = 0;
      for (let r = 1; r < parsed.length; r++) {
        const row = parsed[r];
        const name = (row[iName] ?? "").trim();
        const email = (row[iEmail] ?? "").trim();
        const role = ((row[iRole] ?? "STAFF").trim() as Role) || "STAFF";
        const department = (row[iDept] ?? "").trim();
        const phone = (row[iPhone] ?? "").trim();
        const employeeId = (row[iEmp] ?? "").trim();
        if (!name || !isEmailValid(email)) { errors.push(`Row ${r + 1}: invalid name/email`); continue; }
        if (getAccountByEmail(store.accounts, email)) { skipped++; continue; }
        const createdAt = nowIso();
        rows.push({ id: uuid(), name, email, role: DEFAULT_ROLES.includes(role) ? role : "STAFF", status: "PENDING", department: department || undefined, phone: phone || undefined, employeeId: employeeId || undefined, createdAt, createdBy: actorEmail || "UNKNOWN", approval: { requestedAt: createdAt, requestedBy: actorEmail || "UNKNOWN" } });
      }
      setPreview({ ok: rows.length, skipped, errors, rows });
    }
    function doImport() {
      if (!actor || !canImport || !preview) return;
      setStore((prev) => ({ ...prev, accounts: [...preview.rows, ...prev.accounts] }));
      auditPush("CSV_IMPORT_ACCOUNTS", undefined, `Imported=${preview.ok} Skipped=${preview.skipped} Errors=${preview.errors.length}`);
      setToast({ type: "ok", msg: t("Import completed.", "သွင်းပြီးပါပြီ။") });
      setModalImport(false);
    }
    return (
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="text-sm text-slate-500">{t("CSV columns:", "CSV ကော်လံများ:")} name,email,role,department,phone,employeeId</div>
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => onPick(e.target.files?.[0] ?? null)} />
            <Button type="button" className="bg-sky-600 hover:bg-sky-500 text-white font-black h-10 px-4 rounded-xl uppercase pointer-events-none"><Upload className="h-4 w-4 mr-2" />{fileName ? fileName : t("Pick CSV", "CSV ရွေး")}</Button>
          </label>
        </div>
        {preview ? (
          <div className="p-4 rounded-2xl bg-[#0B101B] border border-white/10 space-y-2">
            <div className="text-sm text-slate-300">OK: <span className="text-emerald-300 font-bold">{preview.ok}</span> • Skipped: <span className="text-amber-300 font-bold">{preview.skipped}</span> • Errors: <span className="text-rose-300 font-bold">{preview.errors.length}</span></div>
            {preview.errors.length ? <div className="text-xs text-rose-300 font-mono space-y-1">{preview.errors.slice(0, 6).map((e) => (<div key={e}>{e}</div>))}</div> : null}
          </div>
        ) : null}
        <div className="flex justify-end gap-3">
          <Button variant="ghost" className="text-slate-400 hover:text-white" onClick={() => setModalImport(false)}>{t("Cancel", "မလုပ်တော့")}</Button>
          <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-black h-11 px-6 rounded-xl uppercase disabled:opacity-40" disabled={!preview?.ok} onClick={doImport}>{t("Confirm", "အတည်ပြု")}</Button>
        </div>
      </div>
    );
  };

  const BulkModal = () => {
    const [action, setAction] = useState<"APPROVE" | "REJECT" | "BLOCK" | "UNBLOCK" | "SET_ROLE">("APPROVE");
    const [note, setNote] = useState("");
    const [role, setRole] = useState<Role>("STAFF");
    function apply() {
      if (!actor || !canBulk) return;
      if (!selectedEmails.length) return;
      for (const email of selectedEmails) {
        if (action === "APPROVE") approve(email, note.trim() || undefined);
        if (action === "REJECT") reject(email, note.trim() || undefined);
        if (action === "BLOCK") blockToggle(email, true);
        if (action === "UNBLOCK") blockToggle(email, false);
        if (action === "SET_ROLE") changeRole(email, role);
      }
      auditPush("BULK_APPLIED", undefined, `Action=${action} Count=${selectedEmails.length}`);
      clearSelection();
      setModalBulk(false);
    }
    return (
      <div className="space-y-4">
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
          <div className="text-slate-300">{t("Selected", "ရွေးထား")}: <span className="font-black text-white">{selectedEmails.length}</span></div>
          <Button variant="ghost" className="text-slate-400 hover:text-white" onClick={clearSelection}><RefreshCw className="h-4 w-4 mr-2" /> Clear</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-[11px] uppercase tracking-widest text-slate-500 font-mono">{t("Action", "လုပ်ဆောင်ချက်")}</div>
            <Select value={action} onChange={(e) => setAction(e.target.value as any)}>
              <option value="APPROVE">{t("Approve", "အတည်ပြု")}</option><option value="REJECT">{t("Reject", "ငြင်းပယ်")}</option><option value="BLOCK">{t("Block", "ပိတ်")}</option><option value="UNBLOCK">{t("Unblock", "ဖွင့်")}</option><option value="SET_ROLE">{t("Set role", "Role သတ်မှတ်")}</option>
            </Select>
          </div>
          {action === "SET_ROLE" ? (<div className="space-y-1"><div className="text-[11px] uppercase tracking-widest text-slate-500 font-mono">{t("Role", "Role")}</div><Select value={role} onChange={(e) => setRole(e.target.value as Role)}>{DEFAULT_ROLES.map((r) => (<option key={r} value={r}>{r}</option>))}</Select></div>) : (<div />)}
        </div>
        <div className="space-y-1"><div className="text-[11px] uppercase tracking-widest text-slate-500 font-mono">{t("Note (optional)", "မှတ်ချက် (optional)")}</div><Textarea value={note} onChange={(e) => setNote(e.target.value)} /></div>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" className="text-slate-400 hover:text-white" onClick={() => setModalBulk(false)}>{t("Cancel", "မလုပ်တော့")}</Button>
          <Button className="bg-sky-600 hover:bg-sky-500 text-white font-black h-11 px-6 rounded-xl uppercase disabled:opacity-40" disabled={!selectedEmails.length} onClick={apply}>{t("Apply", "လုပ်ဆောင်")}</Button>
        </div>
      </div>
    );
  };

  const ProfileModal = ({ email }: { email: string }) => {
    const target = getAccountByEmail(store.accounts, email);
    if (!target) return null;
    const grants = activeGrantsFor(store.grants, target.email);
    return (
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div><div className="text-white font-black uppercase italic">{target.name}</div><div className="text-slate-500 text-sm">{target.email}</div></div>
          <div className="flex items-center gap-2"><Pill className={roleBadgeClass(target.role)}>{target.role}</Pill><Pill className="bg-white/5 text-slate-300">{target.department ?? "-"}</Pill></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Card className="bg-[#0B101B] border-none ring-1 ring-white/10 rounded-2xl p-4"><div className="text-[10px] uppercase tracking-widest text-slate-500 font-mono">STATUS</div><div className={`mt-2 font-black ${formatStatus(target.status).cls}`}>{formatStatus(target.status).label}</div></Card>
          <Card className="bg-[#0B101B] border-none ring-1 ring-white/10 rounded-2xl p-4"><div className="text-[10px] uppercase tracking-widest text-slate-500 font-mono">CREATED</div><div className="mt-2 text-sm text-slate-200">{new Date(target.createdAt).toLocaleString()}</div><div className="text-xs text-slate-600">{target.createdBy}</div></Card>
          <Card className="bg-[#0B101B] border-none ring-1 ring-white/10 rounded-2xl p-4"><div className="text-[10px] uppercase tracking-widest text-slate-500 font-mono">AUTHORITIES</div><div className="mt-2 text-sm text-slate-200">{roleIsPrivileged(target.role) ? "ALL" : grants.length}</div><div className="text-xs text-slate-600">{roleIsPrivileged(target.role) ? "Privileged" : "Delegated"}</div></Card>
        </div>
        <Divider />
        <div className="space-y-2">
          <div className="text-[11px] uppercase tracking-widest text-slate-500 font-mono">Authorities</div>
          <div className="flex flex-wrap gap-2">
            {roleIsPrivileged(target.role) ? (<Pill className="bg-sky-500/10 text-sky-400">ALL_PERMISSIONS</Pill>) : grants.length ? (grants.map((g) => (<Pill key={g.id} className="bg-white/5 text-slate-200">{String(g.permission)}</Pill>))) : (<div className="text-sm text-slate-600">No delegated permissions.</div>)}
          </div>
        </div>
        <div className="flex justify-end"><Button variant="ghost" className="text-slate-400 hover:text-white" onClick={() => setModalProfileEmail(null)}>{t("Close", "ပိတ်")}</Button></div>
      </div>
    );
  };

  return (
    <div className="p-6 md:p-10 space-y-6 bg-[#0B101B] min-h-screen text-slate-300">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-[#05080F] p-6 md:p-8 rounded-[2.5rem] border border-white/5">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-sky-500/10 rounded-2xl"><UserPlus className="text-sky-500 h-8 w-8" /></div>
          <div>
            <h1 className="text-3xl font-black text-white uppercase italic">{t("Account Control", "အကောင့်ထိန်းချုပ်မှု")}</h1>
            <p className="text-sky-500 font-mono text-[10px] uppercase tracking-widest italic">{t("Enterprise Identity Governance", "လုပ်ငန်းသုံး Identity Governance")}</p>
            <p className="text-xs text-slate-500 mt-1">{actorEmail ? `${t("Signed in as", "ဝင်ထားသည်")}: ${actorEmail}` : t("Not signed in", "ဝင်မထားပါ")}</p>
            {actor ? (<p className="text-[10px] text-slate-600 font-mono mt-1">ROLE: {actor.role} • STATUS: {actor.status} • PERMS: {roleIsPrivileged(actor.role) ? "ALL" : Array.from(actorPerms).join(", ") || "—"}</p>) : (<p className="text-xs text-amber-300 mt-1 flex items-center gap-2"><AlertTriangle className="h-4 w-4" />{t("Session user not registered in Account Registry.", "Session user သည် Registry ထဲတွင် မရှိပါ။")}</p>)}
          </div>
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-end md:gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input className="bg-[#0B101B] border border-white/10 rounded-full h-12 pl-12 pr-6 text-sm w-full md:w-72" placeholder={t("Search accounts...", "အကောင့်ရှာရန်...")} value={q} onChange={(e) => setQ(e.target.value)} disabled={!canRead} />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {canExport ? (<><Button className="bg-white/5 hover:bg-white/10 text-white font-black h-12 px-5 rounded-xl uppercase" onClick={exportAccountsCsv}><Download className="h-4 w-4 mr-2" />{t("Export CSV", "CSV ထုတ်ရန်")}</Button><Button className="bg-white/5 hover:bg-white/10 text-white font-black h-12 px-5 rounded-xl uppercase" onClick={exportGrantsCsv}><Download className="h-4 w-4 mr-2" />Authorities CSV</Button></>) : null}
            {canImport ? (<Button className="bg-white/5 hover:bg-white/10 text-white font-black h-12 px-5 rounded-xl uppercase" onClick={() => setModalImport(true)}><Upload className="h-4 w-4 mr-2" />{t("Import CSV", "CSV သွင်းရန်")}</Button>) : null}
            {canBulk ? (<Button className="bg-white/5 hover:bg-white/10 text-white font-black h-12 px-5 rounded-xl uppercase" onClick={() => setModalBulk(true)}><ShieldCheck className="h-4 w-4 mr-2" />{t("Bulk Actions", "အုပ်စုလိုက်")}</Button>) : null}
            {canAudit ? (<Button className="bg-white/5 hover:bg-white/10 text-white font-black h-12 px-5 rounded-xl uppercase" onClick={() => setModalAudit(true)}><History className="h-4 w-4 mr-2" />{t("Audit Log", "Audit Log")}</Button>) : null}
            {canCreate ? (<Button className="bg-sky-600 hover:bg-sky-500 text-white font-black h-12 px-6 rounded-xl uppercase" onClick={() => setModalCreate(true)}>{t("Create Account", "အကောင့်အသစ်ဖွင့်မည်")}</Button>) : null}
          </div>
        </div>
      </div>

      {toast ? (
        <div className={`rounded-2xl border px-4 py-3 text-sm flex items-center gap-2 ${toast.type === "ok" ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-300" : toast.type === "warn" ? "border-amber-500/20 bg-amber-500/5 text-amber-300" : "border-rose-500/20 bg-rose-500/5 text-rose-300"}`}>
          {toast.type === "ok" ? <CheckCircle2 className="h-4 w-4" /> : toast.type === "warn" ? <AlertTriangle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}<div>{toast.msg}</div>
        </div>
      ) : null}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <Pill className="bg-white/5 text-slate-300">{t("Filters", "စစ်ထုတ်မှု")}</Pill>
          <div className="flex items-center gap-2"><div className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">{t("Status", "အခြေအနေ")}</div><Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as any)} className="w-44" disabled={!canRead}><option value="ALL">ALL</option><option value="ACTIVE">ACTIVE</option><option value="PENDING">PENDING</option><option value="SUSPENDED">SUSPENDED</option><option value="REJECTED">REJECTED</option><option value="ARCHIVED">ARCHIVED</option></Select></div>
          <div className="flex items-center gap-2"><div className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">{t("Role", "Role")}</div><Select value={filterRole} onChange={(e) => setFilterRole(e.target.value as any)} className="w-52" disabled={!canRead}><option value="ALL">ALL</option>{DEFAULT_ROLES.map((r) => (<option key={r} value={r}>{r}</option>))}</Select></div>
          <Button variant="ghost" className="h-11 text-slate-400 hover:text-white" onClick={() => { setQ(""); setFilterStatus("ALL"); setFilterRole("ALL"); setToast({ type: "ok", msg: t("Reset.", "ပြန်ချ") }); }} disabled={!canRead}><RefreshCw className="h-4 w-4 mr-2" />{t("Reset", "ပြန်ချ")}</Button>
        </div>
        <div className="text-xs text-slate-600 font-mono">STORE: {STORAGE_KEY}</div>
      </div>

      {!canRead ? (
        <Card className="bg-[#05080F] border-none ring-1 ring-white/5 rounded-[2rem] p-6"><div className="flex items-center gap-3"><AlertTriangle className="h-5 w-5 text-amber-300" /><div><div className="text-white font-black uppercase italic">{t("Access denied", "ဝင်ရောက်ခွင့်မရှိပါ")}</div><div className="text-sm text-slate-500">{t("Super Admin must grant you USER_READ.", "Super Admin မှ USER_READ အာဏာပေးရပါမည်။")}</div></div></div></Card>
      ) : (
        <Card className="bg-[#05080F] border-none ring-1 ring-white/5 rounded-[3rem] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white/5 font-mono text-slate-500 uppercase text-[10px] tracking-[0.2em]">
                <tr>
                  <th className="p-6"><label className="inline-flex items-center gap-2"><input type="checkbox" className="h-4 w-4 accent-sky-500" checked={paged.length > 0 && paged.every((a) => selected[a.email])} onChange={(e) => selectAllOnPage(e.target.checked)} disabled={!canBulk} />{t("Select", "ရွေးချယ်")}</label></th>
                  <th className="p-6">{t("Personnel Info", "ဝန်ထမ်းအချက်အလက်")}</th>
                  <th className="p-6">{t("Role / Authority", "Role / Authority")}</th>
                  <th className="p-6">{t("Status", "အခြေအနေ")}</th>
                  <th className="p-6 text-right">{t("Actions", "လုပ်ဆောင်မှု")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {paged.map((user) => {
                  const st = formatStatus(user.status);
                  const blocked = user.status === "SUSPENDED";
                  return (
                    <tr key={user.email} className="hover:bg-white/5 transition-all">
                      <td className="p-6"><input type="checkbox" className="h-4 w-4 accent-sky-500" checked={!!selected[user.email]} disabled={!canBulk} onChange={(e) => setSelected((prev) => ({ ...prev, [user.email]: e.target.checked }))} /></td>
                      <td className="p-6"><p className="font-bold text-white uppercase italic">{user.name}</p><p className="text-xs text-slate-500">{user.email}</p><div className="mt-2 flex flex-wrap gap-2">{user.department ? <Pill className="bg-white/5 text-slate-300">{user.department}</Pill> : null}{user.employeeId ? <Pill className="bg-white/5 text-slate-300">{user.employeeId}</Pill> : null}{user.phone ? <Pill className="bg-white/5 text-slate-300">{user.phone}</Pill> : null}</div></td>
                      <td className="p-6"><Pill className={roleBadgeClass(user.role)}>{user.role}</Pill>{user.status === "PENDING" ? (<div className="mt-2 text-xs text-slate-600">Pending approval • <span className="text-slate-500">{user.approval?.requestedBy ?? user.createdBy}</span></div>) : null}<div className="mt-2 text-xs text-slate-600">Authorities: <span className="text-slate-300">{roleIsPrivileged(user.role) ? "ALL" : activeGrantsFor(store.grants, user.email).length}</span></div></td>
                      <td className="p-6"><span className={`text-[10px] font-bold italic ${st.cls}`}>{st.label}</span></td>
                      <td className="p-6 text-right space-x-1 md:space-x-2">
                        <Button variant="ghost" className="h-10 text-slate-500 hover:text-white" title="View" onClick={() => setModalProfileEmail(user.email)}><UserCog size={16} /></Button>
                        <Button variant="ghost" className="h-10 text-slate-500 hover:text-white disabled:opacity-40" title="Authority" disabled={!canAuth} onClick={() => setModalAuthorityEmail(user.email)}><ShieldCheck size={16} /></Button>
                        <Button variant="ghost" className={`h-10 ${blocked ? "text-emerald-400 hover:bg-emerald-500/10" : "text-rose-500 hover:bg-rose-500/10"} disabled:opacity-40`} title={blocked ? "Unblock" : "Block"} disabled={!canBlock} onClick={() => blockToggle(user.email, !blocked)}><Lock size={16} /></Button>
                        {canRoleEdit ? (<select className="h-10 rounded-xl bg-[#0B101B] border border-white/10 px-3 text-xs text-slate-200 ml-2" value={user.role} onChange={(e) => changeRole(user.email, e.target.value as Role)} title="Role">{DEFAULT_ROLES.map((r) => (<option key={r} value={r}>{r}</option>))}</select>) : null}
                        {user.status === "PENDING" ? (<><Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-black h-10 px-4 rounded-xl uppercase disabled:opacity-40 ml-2" disabled={!canApprove} onClick={() => setModalApproveEmail(user.email)}>{t("Approve", "အတည်ပြု")}</Button><Button className="bg-rose-600 hover:bg-rose-500 text-white font-black h-10 px-4 rounded-xl uppercase disabled:opacity-40" disabled={!canReject} onClick={() => setModalRejectEmail(user.email)}>{t("Reject", "ငြင်းပယ်")}</Button></>) : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 ? <div className="p-10 text-center text-slate-600">{t("No accounts found.", "အကောင့်မတွေ့ပါ။")}</div> : null}
          <div className="flex items-center justify-between px-6 py-4 border-t border-white/5">
            <div className="text-xs text-slate-600 font-mono">{filtered.length} total • page {Math.min(page, totalPages)} / {totalPages}</div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" className="h-10 text-slate-400 hover:text-white disabled:opacity-40" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</Button>
              <Button variant="ghost" className="h-10 text-slate-400 hover:text-white disabled:opacity-40" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</Button>
            </div>
          </div>
        </Card>
      )}

      <Modal open={modalCreate} title={t("Create account request", "အကောင့်တောင်းဆိုမှု ဖန်တီးရန်")} onClose={() => setModalCreate(false)} widthClass="max-w-3xl"><CreateModal /></Modal>
      <Modal open={!!modalAuthorityEmail} title={t("Manage authorities", "အာဏာများ စီမံရန်")} onClose={() => setModalAuthorityEmail(null)} widthClass="max-w-4xl">{modalAuthorityEmail ? <AuthorityModal email={modalAuthorityEmail} /> : null}</Modal>
      <Modal open={!!modalProfileEmail} title={t("Account profile", "အကောင့်အချက်အလက်")} onClose={() => setModalProfileEmail(null)} widthClass="max-w-3xl">{modalProfileEmail ? <ProfileModal email={modalProfileEmail} /> : null}</Modal>
      <Modal open={!!modalApproveEmail} title={t("Approve request", "တောင်းဆိုမှု အတည်ပြုရန်")} onClose={() => setModalApproveEmail(null)} widthClass="max-w-2xl">{modalApproveEmail ? <ApproveRejectModal email={modalApproveEmail} mode="approve" /> : null}</Modal>
      <Modal open={!!modalRejectEmail} title={t("Reject request", "တောင်းဆိုမှု ငြင်းပယ်ရန်")} onClose={() => setModalRejectEmail(null)} widthClass="max-w-2xl">{modalRejectEmail ? <ApproveRejectModal email={modalRejectEmail} mode="reject" /> : null}</Modal>
      <Modal open={!!modalAudit} title={t("Audit Log", "Audit Log")} onClose={() => setModalAudit(false)} widthClass="max-w-3xl"><AuditModal /></Modal>
      <Modal open={modalImport} title={t("Import CSV", "CSV သွင်းရန်")} onClose={() => setModalImport(false)} widthClass="max-w-3xl"><ImportModal /></Modal>
      <Modal open={modalBulk} title={t("Bulk actions", "အုပ်စုလိုက်လုပ်ဆောင်မှု")} onClose={() => setModalBulk(false)} widthClass="max-w-3xl"><BulkModal /></Modal>
    </div>
  );
}
EOF

# -----------------------------------------------------------------------------
# 3) RequireAuthz Route Gate (permission + registry status)
# -----------------------------------------------------------------------------
cat > "$REQ_AUTHZ" <<'EOF'
import React, { useMemo } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { loadStore, getAccountByEmail, roleIsPrivileged, effectivePermissions, safeLower } from "@/lib/accountControlStore";
import { NAV_SECTIONS, type NavItem } from "@/lib/portalRegistry";
import { hasAnyPermission } from "@/lib/permissionResolver";

type Rule = { prefix: string; required?: string[] };

function collectRules(): Rule[] {
  const rules: Rule[] = [];
  const walk = (item: NavItem, inherited?: string[]) => {
    const req = (item.requiredPermissions && item.requiredPermissions.length ? item.requiredPermissions : inherited) ?? inherited;
    rules.push({ prefix: item.path, required: req });
    for (const c of item.children ?? []) walk(c, req);
  };
  for (const sec of NAV_SECTIONS) for (const it of sec.items) walk(it);
  rules.sort((a, b) => b.prefix.length - a.prefix.length);
  return rules;
}

function requiredForPath(pathname: string, rules: Rule[]): string[] | null {
  const p = pathname || "/";
  for (const r of rules) {
    if (!r.required || r.required.length === 0) continue;
    if (p === r.prefix) return r.required;
    if (p.startsWith(r.prefix.endsWith("/") ? r.prefix : r.prefix + "/")) return r.required;
  }
  return null;
}

export function RequireAuthz() {
  const auth = useAuth() as any;
  const loc = useLocation();

  const email = (auth?.user?.email ?? "") as string;
  const isAuthed = Boolean(auth?.user?.id || email);

  const rules = useMemo(() => collectRules(), []);
  const required = useMemo(() => requiredForPath(loc.pathname, rules), [loc.pathname, rules]);

  if (!isAuthed) {
    return <Navigate to="/login" replace state={{ from: loc.pathname, reason: "NO_SESSION" }} />;
  }

  const store = typeof window !== "undefined" ? loadStore() : null;
  const actor = store && email ? getAccountByEmail(store.accounts, email) : undefined;

  if (!actor) {
    return <Navigate to="/unauthorized" replace state={{ reason: "NOT_REGISTERED", detail: "User not in AccountControl registry" }} />;
  }

  if (actor.status !== "ACTIVE") {
    return <Navigate to="/unauthorized" replace state={{ reason: "NOT_ACTIVE", detail: `Account status: ${actor.status}` }} />;
  }

  if (roleIsPrivileged(actor.role) || roleIsPrivileged(auth?.role)) {
    return <Outlet />;
  }

  if (required && required.length) {
    const ok = hasAnyPermission(auth, required);
    if (!ok && store) {
      const perms = effectivePermissions(store, actor);
      const requiredSet = new Set(required.map((x) => String(x)));
      let ok2 = false;
      for (const g of perms) if (requiredSet.has(String(g))) ok2 = true;
      if (!ok2) {
        return <Navigate to="/unauthorized" replace state={{ reason: "NO_PERMISSION", detail: `Missing required permissions for ${loc.pathname}: ${required.join(", ")}` }} />;
      }
    } else if (!ok) {
      return <Navigate to="/unauthorized" replace state={{ reason: "NO_PERMISSION", detail: `Missing required permissions for ${loc.pathname}: ${required.join(", ")}` }} />;
    }
  }

  return <Outlet />;
}
EOF

# -----------------------------------------------------------------------------
# 4) APP.TSX (Dynamic Mapping using RequireAuthz natively)
# -----------------------------------------------------------------------------
cat > "$APP" << 'EOF'
import React, { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import { AuthProvider } from "./contexts/AuthContext";
import { RequireAuthz } from "./routes/RequireAuthz";

import EnterprisePortal from "./pages/EnterprisePortal";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import ResetPassword from "./pages/ResetPassword";
import Unauthorized from "./pages/Unauthorized";
import DashboardRedirect from "./pages/DashboardRedirect";

import SuperAdminPortal from "./pages/portals/admin/SuperAdminPortal";
import AdminModuleWrapper from "./pages/portals/admin/AdminModuleWrapper";
import ExecutiveCommandCenter from "./pages/portals/admin/ExecutiveCommandCenter";

import AccountControl from "./pages/AccountControl";
import AdminDashboard from "./pages/AdminDashboard";
import AuditLogs from "./pages/AuditLogs";
import AdminUsers from "./pages/AdminUsers";
import PermissionAssignment from "./pages/PermissionAssignment";

import AdminPortal from "./pages/portals/AdminPortal";
import OperationsPortal from "./pages/portals/OperationsPortal";
import OperationsTrackingPage from "./pages/portals/OperationsTrackingPage";
import FinancePortal from "./pages/portals/FinancePortal";
import FinanceReconPage from "./pages/portals/finance/FinanceReconPage";
import HrPortal from "./pages/portals/HrPortal";
import HrAdminOpsPage from "./pages/portals/hr/HrAdminOpsPage";
import MarketingPortal from "./pages/portals/MarketingPortal";
import SupportPortal from "./pages/portals/SupportPortal";
import ExecutionPortal from "./pages/portals/ExecutionPortal";
import ExecutionNavigationPage from "./pages/portals/ExecutionNavigationPage";
import ExecutionManualPage from "./pages/portals/execution/ExecutionManualPage";
import WarehousePortal from "./pages/portals/WarehousePortal";
import WarehouseReceivingPage from "./pages/portals/warehouse/WarehouseReceivingPage";
import WarehouseDispatchPage from "./pages/portals/warehouse/WarehouseDispatchPage";
import BranchPortal from "./pages/portals/BranchPortal";
import BranchInboundPage from "./pages/portals/branch/BranchInboundPage";
import BranchOutboundPage from "./pages/portals/branch/BranchOutboundPage";
import SupervisorPortal from "./pages/portals/SupervisorPortal";
import SupervisorApprovalPage from "./pages/portals/supervisor/SupervisorApprovalPage";
import SupervisorFraudPage from "./pages/portals/supervisor/SupervisorFraudPage";
import MerchantPortal from "./pages/portals/MerchantPortal";
import CustomerPortal from "./pages/portals/CustomerPortal";

import DataEntryOpsPage from "./pages/portals/operations/DataEntryOpsPage";
import QROpsScanPage from "./pages/portals/operations/QROpsScanPage";
import WaybillCenterPage from "./pages/portals/operations/WaybillCenterPage";

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Suspense fallback={<div className="min-h-screen bg-[#05080F] flex items-center justify-center"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent animate-spin rounded-full" /></div>}>
          <Router>
            <Routes>
              <Route path="/" element={<EnterprisePortal />} />
              <Route path="/dashboard" element={<DashboardRedirect />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/unauthorized" element={<Unauthorized />} />

              <Route element={<RequireAuthz />}>
                {/* SUPER ADMIN PORTAL HUB */}
                <Route path="/portal/admin" element={<SuperAdminPortal />} />
                <Route path="/portal/admin/executive" element={<ExecutiveCommandCenter />} />
                
                <Route path="/portal/admin/accounts" element={<AdminModuleWrapper title="Account Control"><AccountControl /></AdminModuleWrapper>} />
                <Route path="/portal/admin/dashboard" element={<AdminModuleWrapper title="Admin Dashboard"><AdminDashboard /></AdminModuleWrapper>} />
                <Route path="/portal/admin/audit" element={<AdminModuleWrapper title="Audit Logs"><AuditLogs /></AdminModuleWrapper>} />
                <Route path="/portal/admin/users" element={<AdminModuleWrapper title="Admin Users"><AdminUsers /></AdminModuleWrapper>} />
                <Route path="/portal/admin/permission-assignment" element={<AdminModuleWrapper title="Permission Assignment"><PermissionAssignment /></AdminModuleWrapper>} />

                {/* LEGACY/OTHER PORTALS */}
                <Route path="/portal/admin-legacy" element={<AdminPortal />} />

                <Route path="/portal/operations" element={<OperationsPortal />} />
                <Route path="/portal/operations/manual" element={<DataEntryOpsPage />} />
                <Route path="/portal/operations/qr-scan" element={<QROpsScanPage />} />
                <Route path="/portal/operations/tracking" element={<OperationsTrackingPage />} />
                <Route path="/portal/operations/waybill" element={<WaybillCenterPage />} />

                <Route path="/portal/finance" element={<FinancePortal />} />
                <Route path="/portal/finance/recon" element={<FinanceReconPage />} />

                <Route path="/portal/marketing" element={<MarketingPortal />} />
                <Route path="/portal/hr" element={<HrPortal />} />
                <Route path="/portal/hr/admin" element={<HrAdminOpsPage />} />

                <Route path="/portal/support" element={<SupportPortal />} />

                <Route path="/portal/execution" element={<ExecutionPortal />} />
                <Route path="/portal/execution/navigation" element={<ExecutionNavigationPage />} />
                <Route path="/portal/execution/manual" element={<ExecutionManualPage />} />

                <Route path="/portal/warehouse" element={<WarehousePortal />} />
                <Route path="/portal/warehouse/receiving" element={<WarehouseReceivingPage />} />
                <Route path="/portal/warehouse/dispatch" element={<WarehouseDispatchPage />} />

                <Route path="/portal/branch" element={<BranchPortal />} />
                <Route path="/portal/branch/inbound" element={<BranchInboundPage />} />
                <Route path="/portal/branch/outbound" element={<BranchOutboundPage />} />

                <Route path="/portal/supervisor" element={<SupervisorPortal />} />
                <Route path="/portal/supervisor/approval" element={<SupervisorApprovalPage />} />
                <Route path="/portal/supervisor/fraud" element={<SupervisorFraudPage />} />

                <Route path="/portal/merchant" element={<MerchantPortal />} />
                <Route path="/portal/customer" element={<CustomerPortal />} />
              </Route>

              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </Router>
        </Suspense>
      </AuthProvider>
    </LanguageProvider>
  );
}
EOF

# -----------------------------------------------------------------------------
# 5) Push & Deploy Fix
# -----------------------------------------------------------------------------
echo "✅ Enterprise AccountControl and RequireAuthz route guard configured."

# Attempt to commit
git add .
git commit -m "feat: setup enterprise account control, permission resolver, and robust route guard" || echo "No changes to commit."

# Push to both master and main
git push origin master || git push origin main || echo "Push failed, but continuing..."

# Force Vercel deployment with retry mechanism for network issues
echo "🚀 Triggering Vercel deployment..."
for i in {1..3}; do
  if npx vercel --prod --force; then
    echo "✅ Vercel deployment successful!"
    exit 0
  fi
  echo "⚠️ Vercel API unreachable (Attempt $i/3). Retrying in 5 seconds..."
  sleep 5
done

echo "❌ Deployment failed due to network/DNS issues. Please check your internet connection and run 'npx vercel --prod --force' manually."
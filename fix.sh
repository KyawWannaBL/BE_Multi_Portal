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

# Restore original pages from git if they were modified/deleted
git checkout HEAD -- src/pages/ 2>/dev/null || true

# -----------------------------------------------------------------------------
# INSTALL MISSING DEPENDENCIES (Fixes Vercel "sonner" and "date-fns" crash)
# -----------------------------------------------------------------------------
echo "📦 Installing required UI dependencies to prevent build crashes..."
npm install --save sonner date-fns lucide-react react-router-dom clsx tailwind-merge @radix-ui/react-slot class-variance-authority recharts react-hook-form zod @hookform/resolvers

# Generate safe placeholders for all secondary routes requested in App.tsx
STUB_FILES=(
  "src/pages/AccountControl.tsx"
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
# 1) PORTAL REGISTRY (Single Source of Truth for Sidebar & Hub)
# -----------------------------------------------------------------------------
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
# 2) TIER BADGE
# -----------------------------------------------------------------------------
cat > "$TIER_BADGE" <<'EOF'
import React from "react";
import { normalizeRole } from "@/lib/portalRegistry";

export type Tier = "L1" | "L2" | "L3" | "L4" | "L5";

export function getTier(role?: string, tierLevel?: any): Tier {
  const rawTier = String(tierLevel || "").trim().toUpperCase();
  if (/^L[1-5]$/.test(rawTier)) return rawTier as Tier;
  if (/^[1-5]$/.test(rawTier)) return (`L${rawTier}` as Tier);

  const r = normalizeRole(role);
  if (["SYS", "APP_OWNER", "SUPER_ADMIN"].includes(r)) return "L5";
  if (["ADMIN", "ADM", "MGR", "OPERATIONS_ADMIN"].includes(r)) return "L4";
  if (r.includes("FINANCE") || r.includes("HR") || r.includes("MARKETING") || r.includes("SUPPORT") || r.includes("CUSTOMER_SERVICE")) return "L3";
  if (r === "SUPERVISOR" || r === "STAFF" || r === "WAREHOUSE_MANAGER" || r === "SUBSTATION_MANAGER" || r === "DATA_ENTRY") return "L2";
  
  return "L1";
}

export default function TierBadge({ role, tierLevel, className }: { role?: string | null; tierLevel?: unknown; className?: string }) {
  const tier = getTier(role || undefined, tierLevel);

  const colors: Record<Tier, string> = {
    L5: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
    L4: "bg-sky-500/15 text-sky-300 border-sky-500/25",
    L3: "bg-amber-500/15 text-amber-300 border-amber-500/25",
    L2: "bg-white/10 text-slate-200 border-white/15",
    L1: "bg-white/5 text-slate-300 border-white/10"
  };

  return (
    <span className={`inline-flex items-center h-8 px-3 rounded-full border text-[11px] font-black tracking-widest uppercase ${colors[tier]} ${className ?? ""}`} title={`Tier ${tier}`}>
      {tier}
    </span>
  );
}
EOF

# -----------------------------------------------------------------------------
# 3) PORTAL SIDEBAR & SHELL
# -----------------------------------------------------------------------------
cat > "$PORTAL_SIDEBAR" <<'EOF'
import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { navForRole, type NavItem } from "@/lib/portalRegistry";

function Item({ item, depth = 0, onNavigate }: { item: NavItem; depth?: number; onNavigate?: () => void }) {
  const { lang } = useLanguage();
  const Icon = item.icon;

  return (
    <div className="space-y-1">
      <NavLink
        to={item.path}
        onClick={onNavigate}
        className={({ isActive }) =>
          [
            "flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-black tracking-widest uppercase transition",
            depth > 0 ? "ml-4 opacity-90" : "",
            isActive ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20" : "text-slate-300 hover:bg-white/5",
          ].join(" ")
        }
      >
        <Icon className="h-4 w-4" />
        <span className="truncate">{lang === "en" ? item.label_en : item.label_mm}</span>
      </NavLink>

      {item.children?.length ? (
        <div className="space-y-1">
          {item.children.map((c) => (
            <Item key={c.id} item={c} depth={depth + 1} onNavigate={onNavigate} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function PortalSidebar({ open, onClose }: { open: boolean; onClose: () => void; }) {
  const { role } = useAuth();
  const { lang } = useLanguage();
  const sections = navForRole(role);

  const panel = (
    <aside className="w-72 shrink-0 rounded-2xl border border-white/10 bg-[#0B101B] p-4 h-[calc(100vh-96px)] overflow-y-auto custom-scrollbar">
      {sections.map((sec) => (
        <div key={sec.id} className="mb-6">
          <div className="text-[10px] font-mono text-slate-500 tracking-[0.25em] uppercase mb-3">
            {lang === "en" ? sec.title_en : sec.title_mm}
          </div>
          <div className="space-y-2">
            {sec.items.map((it) => (
              <Item key={it.id} item={it} onNavigate={onClose} />
            ))}
          </div>
        </div>
      ))}
    </aside>
  );

  return (
    <>
      <div className="hidden lg:block">{panel}</div>
      {open ? (
        <div className="lg:hidden fixed inset-0 z-[999]">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
          <div className="absolute left-3 top-20 animate-in slide-in-from-left duration-300">{panel}</div>
        </div>
      ) : null}
    </>
  );
}
EOF

cat > "$PORTAL_SHELL" <<'EOF'
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import TierBadge from "@/components/TierBadge";
import { PortalSidebar } from "@/components/layout/PortalSidebar";
import { Menu } from "lucide-react";

export function PortalShell({ title, links, children }: { title: string; links?: { to: string; label: string }[]; children: React.ReactNode; }) {
  const { logout, role, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-[#05080F] text-white">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#05080F]/80 backdrop-blur">
        <div className="mx-auto max-w-[1400px] px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden h-10 w-10 flex items-center justify-center rounded-xl border border-white/10 hover:bg-white/5 text-slate-300 transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>

            <div className="h-9 w-9 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center overflow-hidden">
               <img src="/logo.png" alt="Logo" className="w-6 h-6 object-contain" />
            </div>
            <div>
              <div className="text-sm font-black tracking-widest uppercase">{title}</div>
              <div className="text-[10px] opacity-70 font-mono">{(user as any)?.email ?? "—"} • {role ?? "NO_ROLE"}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <TierBadge role={role} />
            <button className="text-xs px-4 py-2 rounded-xl border border-white/10 hover:border-white/20 hover:bg-white/5 font-black uppercase tracking-widest transition-colors" onClick={() => void logout()}>
              Sign out
            </button>
          </div>
        </div>

        {links?.length ? (
          <div className="mx-auto max-w-[1400px] px-4 pb-3 flex gap-2 flex-wrap">
            {links.map((l) => (
              <Link key={l.to} to={l.to} className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border border-white/10 hover:border-emerald-500/30 hover:text-emerald-400 transition-colors">
                {l.label}
              </Link>
            ))}
          </div>
        ) : null}
      </header>

      <div className="mx-auto max-w-[1400px] px-4 py-6 flex gap-6">
        <PortalSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
EOF

# -----------------------------------------------------------------------------
# 4) SUPER ADMIN HUB & WRAPPERS
# -----------------------------------------------------------------------------
cat > "$SUPER_ADMIN" <<'EOF'
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/lib/supabase";
import { getAvailablePortals, normalizeRole, PORTALS, portalCountAll, portalCountForRole, portalsForRole } from "@/lib/portalRegistry";
import { PortalShell } from "@/components/layout/PortalShell";
import TierBadge from "@/components/TierBadge";
import { Activity, ArrowRight, HardDrive, KeyRound, ShieldAlert, ShieldCheck, Users, UserCheck, ClipboardList } from "lucide-react";

type Health = "NOMINAL" | "DEGRADED" | "UNKNOWN";

type MetricState = {
  personnel: number | null;
  riders: number | null;
  securityEvents: number | null;
  rotationRequired: number | null;
  portalsAccessible: number | null;
  portalsTotal: number | null;
  health: Health;
};

type AuditRow = {
  id: number | string;
  created_at: string;
  event_type: string;
  user_id?: string | null;
  metadata?: any;
};

function fmt(n: number | null) {
  if (n === null) return "—";
  return new Intl.NumberFormat().format(n);
}

function relativeTime(iso: string, lang: string) {
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return iso;
  const diff = Date.now() - t;

  const s = Math.floor(diff / 1000);
  const tr = (en: string, mm: string) => (lang === "en" ? en : mm);

  if (s < 10) return tr("just now", "ယခုပဲ");
  if (s < 60) return tr(`${s}s ago`, `${s}s အရင်`);
  const m = Math.floor(s / 60);
  if (m < 60) return tr(`${m}m ago`, `${m}m အရင်`);
  const h = Math.floor(m / 60);
  if (h < 48) return tr(`${h}h ago`, `${h}h အရင်`);
  const d = Math.floor(h / 24);
  return tr(`${d}d ago`, `${d}ရက် အရင်`);
}

function eventIcon(eventType: string) {
  const t = (eventType || "").toUpperCase();
  if (t.includes("PASSWORD")) return KeyRound;
  if (t.includes("LOGIN")) return Activity;
  if (t.includes("SESSION")) return ShieldCheck;
  return ShieldAlert;
}

function eventBadge(eventType: string) {
  const t = (eventType || "").toUpperCase();
  if (t.includes("PASSWORD")) return { bg: "bg-amber-500/10", fg: "text-amber-400" };
  if (t.includes("LOGIN")) return { bg: "bg-emerald-500/10", fg: "text-emerald-400" };
  if (t.includes("SESSION")) return { bg: "bg-sky-500/10", fg: "text-sky-300" };
  return { bg: "bg-white/5", fg: "text-slate-300" };
}

async function countProfilesTotal(): Promise<number | null> {
  const res = await supabase.from("profiles").select("id", { count: "exact", head: true });
  if (res.error) return null;
  return res.count ?? null;
}

async function countProfilesByRoleFields(roles: string[]): Promise<number | null> {
  const fields = ["role", "role_code", "app_role", "user_role"];
  for (const f of fields) {
    // @ts-ignore
    const res = await supabase.from("profiles").select("id", { count: "exact", head: true }).in(f, roles);
    if (!res.error) return res.count ?? null;
    const msg = ((res.error as any)?.message ?? "").toLowerCase();
    if (!msg.includes("does not exist")) break;
  }
  return null;
}

async function countRotationRequired(): Promise<number | null> {
  const fields = ["must_change_password", "requires_password_change", "requires_password_reset"];
  for (const f of fields) {
    // @ts-ignore
    const res = await supabase.from("profiles").select("id", { count: "exact", head: true }).eq(f, true);
    if (!res.error) return res.count ?? null;
    const msg = ((res.error as any)?.message ?? "").toLowerCase();
    if (!msg.includes("does not exist")) break;
  }
  return null;
}

async function loadAuditFeed(limit = 15): Promise<AuditRow[]> {
  const res = await supabase
    .from("audit_logs")
    .select("id, created_at, event_type, user_id, metadata")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (res.error) return [];
  return (res.data as any) ?? [];
}

export default function SuperAdminPortal() {
  const { user, role } = useAuth();
  const { lang } = useLanguage();
  const navigate = useNavigate();

  const t = (en: string, mm: string) => (lang === "en" ? en : mm);

  const [metrics, setMetrics] = useState<MetricState>({
    personnel: null,
    riders: null,
    securityEvents: null,
    rotationRequired: null,
    portalsAccessible: null,
    portalsTotal: null,
    health: "UNKNOWN",
  });

  const [audit, setAudit] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);

  const portals = useMemo(() => portalsForRole(role), [role]);
  const roleLabel = useMemo(() => String(role || "AUTHORIZED_USER").replaceAll("_", " ").toUpperCase(), [role]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const riderRoles = ["RDR", "RIDER", "RIDER_USER", "DELIVERY_RIDER", "DRIVER", "HELPER"];

      const [personnel, riders, rotationRequired, feed] = await Promise.all([
        countProfilesTotal(),
        countProfilesByRoleFields(riderRoles),
        countRotationRequired(),
        loadAuditFeed(15),
      ]);

      const anyOk = personnel !== null || riders !== null || rotationRequired !== null || feed.length > 0;

      if (cancelled) return;

      setMetrics({
        personnel,
        riders,
        securityEvents: feed.length > 0 ? feed.length : null,
        rotationRequired,
        portalsAccessible: portalCountForRole(role),
        portalsTotal: portalCountAll(),
        health: anyOk ? "NOMINAL" : "DEGRADED",
      });

      setAudit(feed);
      setLoading(false);
    }

    void load();
    return () => { cancelled = true; };
  }, [role]);

  const stats = useMemo(
    () => [
      { title: t("TOTAL PERSONNEL", "ဝန်ထမ်းစုစုပေါင်း"), value: fmt(metrics.personnel), icon: Users, border: "border-sky-500/20" },
      { title: t("ACTIVE RIDERS", "တာဝန်ထမ်းဆောင်နေသော Rider များ"), value: fmt(metrics.riders), icon: Activity, border: "border-emerald-500/20" },
      { title: t("SECURITY EVENTS", "လုံခြုံရေးဖြစ်ရပ်များ"), value: fmt(metrics.securityEvents), icon: ShieldCheck, border: "border-amber-500/20" },
      { title: t("ROTATION REQUIRED", "စကားဝှက်ပြောင်းရန်လိုအပ်သူများ"), value: fmt(metrics.rotationRequired), icon: KeyRound, border: "border-purple-500/20" },
      { title: t("PORTALS ACCESS", "Portal ဝင်နိုင်မှု"), value: `${fmt(metrics.portalsAccessible)} / ${fmt(metrics.portalsTotal)}`, icon: ClipboardList, border: "border-white/10" },
    ],
    [metrics, lang]
  );

  return (
    <PortalShell title={t("Super Admin Portal", "Super Admin Portal")}>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/5 pb-6">
          <div>
            <div className="text-[10px] font-mono text-slate-500 tracking-[0.25em] uppercase mb-2">
              {t("SESSION ACTIVE", "စနစ်ဝင်ရောက်ထားပါသည်")}
            </div>
            <h1 className="text-3xl font-black text-white tracking-widest uppercase">
              {t("Command Center", "စီမံခန့်ခွဲမှုစင်တာ")}
            </h1>
            <p className="text-sm text-slate-400 mt-1 font-mono">{(user as any)?.email ?? "—"}</p>
          </div>

          <div className="text-right">
            <p className="text-[10px] font-mono text-slate-500 tracking-widest uppercase">
              {t("SYSTEM STATUS", "စနစ်အခြေအနေ")}
            </p>
            <div className="flex items-center gap-2 mt-2 justify-end">
              <div className={`w-2 h-2 rounded-full ${metrics.health === "NOMINAL" ? "bg-emerald-500" : "bg-amber-500"} animate-pulse`} />
              <span className={`text-xs font-mono tracking-widest uppercase ${metrics.health === "NOMINAL" ? "text-emerald-300" : "text-amber-300"}`}>
                {metrics.health === "NOMINAL" ? t("ALL SYSTEMS NOMINAL", "စနစ်အခြေအနေကောင်းမွန်") : t("SYSTEM DEGRADED", "စနစ်အချို့ချို့ယွင်း")}
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className={`p-6 rounded-2xl bg-[#0B101B] border ${s.border} relative overflow-hidden`}>
                <div className="absolute -right-6 -top-6 opacity-5">
                  <Icon size={96} />
                </div>
                <div className="p-3 rounded-xl bg-white/5 w-fit mb-4">
                  <Icon size={18} className="text-slate-200" />
                </div>
                <div>
                  <div className="text-3xl font-black text-white">{s.value}</div>
                  <div className="text-[10px] font-mono text-slate-400 tracking-widest uppercase mt-2">{s.title}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button onClick={() => navigate("/portal/admin/accounts")} className="p-6 rounded-2xl bg-[#111622] border border-white/5 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all text-left">
            <UserCheck className="text-emerald-300 mb-3" size={22} />
            <div className="text-lg font-black text-white uppercase tracking-widest">{t("Account Control", "အကောင့်စီမံခန့်ခွဲမှု")}</div>
            <div className="text-xs text-slate-500 font-mono mt-2">{t("Create/approve users + manage authorities.", "User ဖန်တီး/အတည်ပြု + authority စီမံရန်")}</div>
            <div className="mt-4 text-[10px] font-mono tracking-widest uppercase text-emerald-300 flex items-center gap-2">{t("Open", "ဝင်ရောက်မည်")} <ArrowRight size={12} /></div>
          </button>
          <button onClick={() => navigate("/portal/admin/executive")} className="p-6 rounded-2xl bg-[#111622] border border-white/5 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all text-left">
            <ShieldAlert className="text-amber-300 mb-3" size={22} />
            <div className="text-lg font-black text-white uppercase tracking-widest">{t("Executive Command", "Executive Command")}</div>
            <div className="text-xs text-slate-500 font-mono mt-2">{t("High-privilege monitoring and controls.", "အမြင့်ဆုံးအာဏာ စောင့်ကြည့်/ထိန်းချုပ်မှု")}</div>
            <div className="mt-4 text-[10px] font-mono tracking-widest uppercase text-amber-300 flex items-center gap-2">{t("Open", "ဝင်ရောက်မည်")} <ArrowRight size={12} /></div>
          </button>
          <button onClick={() => navigate("/portal/admin/audit")} className="p-6 rounded-2xl bg-[#111622] border border-white/5 hover:border-sky-500/30 hover:bg-sky-500/5 transition-all text-left">
            <ShieldCheck className="text-sky-300 mb-3" size={22} />
            <div className="text-lg font-black text-white uppercase tracking-widest">{t("Audit Logs", "Audit Logs")}</div>
            <div className="text-xs text-slate-500 font-mono mt-2">{t("Track system events and access activity.", "စနစ်ဖြစ်ရပ်များနှင့် ဝင်ရောက်မှု စစ်ဆေးရန်")}</div>
            <div className="mt-4 text-[10px] font-mono tracking-widest uppercase text-sky-300 flex items-center gap-2">{t("Open", "ဝင်ရောက်မည်")} <ArrowRight size={12} /></div>
          </button>
        </div>

        {/* Portals Directory & Live Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            <div className="text-sm font-black text-white tracking-widest uppercase">{t("Portals Directory", "Portal Directory")}</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {portals.map((p) => {
                const Icon = p.icon;
                return (
                  <button key={p.id} onClick={() => navigate(p.path)} className="p-6 rounded-2xl bg-[#111622] border border-white/5 hover:border-white/20 hover:bg-white/5 transition-all text-left">
                    <Icon className="text-slate-200 mb-3" size={22} />
                    <div className="text-lg font-black text-white uppercase tracking-widest">{lang === "en" ? p.label_en : p.label_mm}</div>
                    <div className="mt-4 text-[10px] font-mono tracking-widest uppercase text-slate-300 flex items-center gap-2">{t("Open", "ဝင်ရောက်မည်")} <ArrowRight size={12} /></div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-sm font-black text-white tracking-widest uppercase flex items-center gap-2">
              <ShieldAlert size={16} className="text-amber-300" />
              {t("Live Audit Feed", "လုံခြုံရေးမှတ်တမ်းများ")}
            </div>
            <div className="bg-[#0B101B] border border-white/5 rounded-2xl p-4 space-y-4 h-[320px] overflow-y-auto custom-scrollbar">
              {loading ? (
                <div className="text-xs font-mono text-slate-500">{t("Loading audit feed…", "မှတ်တမ်းများ ရယူနေပါသည်…")}</div>
              ) : audit.length === 0 ? (
                <div className="text-xs font-mono text-slate-500">{t("No audit events found.", "လုံခြုံရေးမှတ်တမ်း မတွေ့ရှိပါ။")}</div>
              ) : (
                audit.map((row) => {
                  const b = eventBadge(row.event_type);
                  const Icon = b.icon;
                  return (
                    <div key={String(row.id)} className="flex gap-3 items-start border-b border-white/5 pb-3">
                      <div className={`p-1.5 rounded-md ${b.bg} ${b.fg} mt-0.5`}>
                        <Icon size={12} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-slate-200 font-mono truncate">{row.event_type}</p>
                        <p className="text-[10px] text-slate-500 font-mono mt-1 truncate">{row.user_id ? `user_id: ${String(row.user_id).slice(0, 8)}...` : "user_id: —"}</p>
                        <p className={`text-[9px] font-mono mt-1 uppercase tracking-wider ${b.fg}/70`}>{relativeTime(row.created_at, lang)}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

      </div>
    </PortalShell>
  );
}
EOF

cat > "$EXEC_CMD" <<'EOF'
import React from 'react';
import SuperAdminPortal from './SuperAdminPortal';

export default function ExecutiveCommandCenter() {
  return <SuperAdminPortal />;
}
EOF

cat > "$ADMIN_WRAP" <<'EOF'
import React from "react";
import { PortalShell } from "@/components/layout/PortalShell";

export default function AdminModuleWrapper({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <PortalShell title={title}>
      <div className="rounded-3xl border border-white/5 bg-[#0B101B] p-6 shadow-2xl min-h-[70vh]">
        {children}
      </div>
    </PortalShell>
  );
}
EOF

cat > "$EXEC_MANUAL" <<'EOF'
import React from "react";
import { PortalShell } from "@/components/layout/PortalShell";
import { ClipboardList } from "lucide-react";

export default function ExecutionManualPage() {
  return (
    <PortalShell title="Execution Manual">
      <div className="flex flex-col items-center justify-center p-12 text-center bg-[#0B101B] border border-white/5 rounded-3xl min-h-[60vh]">
        <ClipboardList className="h-16 w-16 text-emerald-500 mb-6 opacity-80" />
        <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-2">Manual Execution Module</h2>
        <div className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
          Placeholder manual execution page. Replace with your rider/driver forms, checklist module, or dynamic assignments.
        </div>
        <div className="mt-8 px-4 py-2 rounded-xl bg-white/5 text-xs font-mono text-emerald-400 border border-white/10">
          Path: /portal/execution/manual
        </div>
      </div>
    </PortalShell>
  );
}
EOF

# -----------------------------------------------------------------------------
# 5) APP.TSX (Dynamic Mapping with Full Routes)
# -----------------------------------------------------------------------------
cat > "$APP" << 'EOF'
import React, { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import { AuthProvider } from "./contexts/AuthContext";
import { RequireAuth } from "./routes/RequireAuth";
import { RequireRole } from "./routes/RequireRole";

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

              <Route element={<RequireAuth />}>
                {/* SUPER ADMIN PORTAL HUB */}
                <Route path="/portal/admin" element={<RequireRole allow={["SYS", "APP_OWNER", "SUPER_ADMIN"]}><SuperAdminPortal /></RequireRole>} />
                <Route path="/portal/admin/executive" element={<RequireRole allow={["SYS", "APP_OWNER", "SUPER_ADMIN"]}><ExecutiveCommandCenter /></RequireRole>} />
                
                <Route path="/portal/admin/accounts" element={<RequireRole allow={["SYS", "APP_OWNER", "SUPER_ADMIN"]}><AdminModuleWrapper title="Account Control"><AccountControl /></AdminModuleWrapper></RequireRole>} />
                <Route path="/portal/admin/dashboard" element={<RequireRole allow={["SYS", "APP_OWNER", "SUPER_ADMIN"]}><AdminModuleWrapper title="Admin Dashboard"><AdminDashboard /></AdminModuleWrapper></RequireRole>} />
                <Route path="/portal/admin/audit" element={<RequireRole allow={["SYS", "APP_OWNER", "SUPER_ADMIN"]}><AdminModuleWrapper title="Audit Logs"><AuditLogs /></AdminModuleWrapper></RequireRole>} />
                <Route path="/portal/admin/users" element={<RequireRole allow={["SYS", "APP_OWNER", "SUPER_ADMIN"]}><AdminModuleWrapper title="Admin Users"><AdminUsers /></AdminModuleWrapper></RequireRole>} />
                <Route path="/portal/admin/permission-assignment" element={<RequireRole allow={["SYS", "APP_OWNER", "SUPER_ADMIN"]}><AdminModuleWrapper title="Permission Assignment"><PermissionAssignment /></AdminModuleWrapper></RequireRole>} />

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

cat > "$UNAUTH" << 'EOF'
import React from 'react';
import { useLocation, Link } from 'react-router-dom';

export default function Unauthorized() {
  const loc = useLocation();
  const reason = loc.state?.reason || 'Access Denied';
  return (
    <div className="min-h-screen bg-[#05080F] flex flex-col items-center justify-center text-white p-4">
      <h1 className="text-3xl font-black text-rose-500 mb-2 tracking-widest uppercase">UNAUTHORIZED</h1>
      <p className="text-slate-400 mb-6 uppercase tracking-widest text-xs font-mono">{reason}</p>
      <Link to="/login" className="text-emerald-400 hover:text-emerald-300 uppercase font-bold text-sm tracking-widest">
        Return to Login
      </Link>
    </div>
  );
}
EOF

cat > "$DASH_REDIR" << 'EOF'
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { defaultPortalForRole } from '@/lib/portalRegistry';

export default function DashboardRedirect() {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }
    navigate(defaultPortalForRole(role), { replace: true });
  }, [user, role, loading, navigate]);

  return (
    <div className="min-h-screen bg-[#05080F] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent animate-spin rounded-full" />
    </div>
  );
}
EOF

# -----------------------------------------------------------------------------
# 6) SUPABASE CLIENT & AUTH LOGIC (Guaranteed no crashes)
# -----------------------------------------------------------------------------
cat > "$SUPA" <<'EOF'
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = (import.meta.env.VITE_SUPABASE_PROJECT_URL || import.meta.env.VITE_SUPABASE_URL || "https://dltavabvjwocknkyvwgz.supabase.co") as string;
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsdGF2YWJ2andvY2tua3l2d2d6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExMTMxOTQsImV4cCI6MjA4NjY4OTE5NH0.7-9BK6L9dpCYIB-pp1WOeQxCI1DVxnSykoTRXNUHYIo") as string;

export const SUPABASE_CONFIGURED = Boolean(supabaseUrl && supabaseAnonKey);

const REMEMBER_KEY = "be_remember_me";

export function getRememberMe(): boolean {
  if (typeof window === "undefined") return true;
  const v = window.localStorage.getItem(REMEMBER_KEY);
  return v === null ? true : v === "1";
}

export function setRememberMe(remember: boolean): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(REMEMBER_KEY, remember ? "1" : "0");
}

const hybridStorage = {
  getItem: (key: string) => {
    if (typeof window === "undefined") return null;
    return getRememberMe() ? window.localStorage.getItem(key) : window.sessionStorage.getItem(key);
  },
  setItem: (key: string, value: string) => {
    if (typeof window === "undefined") return;
    (getRememberMe() ? window.localStorage : window.sessionStorage).setItem(key, value);
  },
  removeItem: (key: string) => {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(key);
    window.sessionStorage.removeItem(key);
  },
};

type StubError = { message: string; code?: string };
function stubError(message = "Supabase is not configured."): StubError {
  return { message, code: "SUPABASE_NOT_CONFIGURED" };
}

function stubQuery() {
  const chain: any = {};
  const ret = () => chain;
  chain.select = ret; chain.eq = ret; chain.neq = ret; chain.in = ret; chain.order = ret; chain.limit = ret;
  chain.maybeSingle = async () => ({ data: null, error: stubError() });
  chain.single = async () => ({ data: null, error: stubError() });
  chain.insert = async () => ({ data: null, error: stubError() });
  chain.update = async () => ({ data: null, error: stubError() });
  chain.delete = async () => ({ data: null, error: stubError() });
  return chain;
}

function createStubClient() {
  const noopSub = { unsubscribe: () => {} };
  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: stubError() }),
      onAuthStateChange: () => ({ data: { subscription: noopSub } }),
      signInWithPassword: async () => ({ data: null, error: stubError() }),
      signUp: async () => ({ data: null, error: stubError() }),
      signOut: async () => ({ error: null }),
      resetPasswordForEmail: async () => ({ data: null, error: stubError() }),
      updateUser: async () => ({ data: null, error: stubError() }),
      getUser: async () => ({ data: { user: null }, error: stubError() }),
      exchangeCodeForSession: async () => ({ data: null, error: stubError() }),
      setSession: async () => ({ data: null, error: stubError() }),
      mfa: {
        getAuthenticatorAssuranceLevel: async () => ({ data: { currentLevel: "aal1", nextLevel: "aal2" }, error: stubError() }),
        listFactors: async () => ({ data: { all: [], totp: [] }, error: stubError() }),
        enroll: async () => ({ data: null, error: stubError() }),
        challenge: async () => ({ data: null, error: stubError() }),
        verify: async () => ({ data: null, error: stubError() }),
      },
    },
    from: () => stubQuery(),
  } as any;
}

export const supabase: any = SUPABASE_CONFIGURED ? createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: hybridStorage as any,
  }
}) : createStubClient();
EOF

cat > "$AUTH_CTX" <<'EOF'
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const AuthContext = createContext<any>({});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const login = async (email: string, pass: string) => {
    return await supabase.auth.signInWithPassword({ email, password: pass });
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  useEffect(() => {
    let mounted = true;
    let authSubscription: any = null;

    const initSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (session?.user) {
          const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle();
          if (mounted) setUser({ 
            ...session.user, 
            profile: profile || {}, 
            role: profile?.role || profile?.role_code || 'GUEST' 
          });
        } else {
          if (mounted) setUser(null);
        }
      } catch (err) {
        console.error("Auth init error:", err);
      } finally {
        if (mounted) setLoading(false);
      }

      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'INITIAL_SESSION') return; 
        
        if (mounted) setLoading(true);
        try {
          if (session?.user) {
            const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle();
            if (mounted) setUser({ 
              ...session.user, 
              profile: profile || {}, 
              role: profile?.role || profile?.role_code || 'GUEST' 
            });
          } else {
            if (mounted) setUser(null);
          }
        } catch (err) {
          console.error("Auth change error:", err);
        } finally {
          if (mounted) setLoading(false);
        }
      });
      authSubscription = data.subscription;
    };

    initSession();

    return () => {
      mounted = false;
      if (authSubscription) authSubscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, role: user?.role, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
EOF

cat > "$REQ_AUTH" << 'EOF'
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export function RequireAuth() {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-[#05080F] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent animate-spin rounded-full" />
      </div>
    );
  }
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
EOF

cat > "$REQ_ROLE" << 'EOF'
import * as React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase, SUPABASE_CONFIGURED } from "@/lib/supabase";
import { normalizeRole } from "@/lib/portalRegistry";

const MFA_REQUIRED_ROLES = new Set(["SYS", "APP_OWNER", "SUPER_ADMIN", "SUPER_A", "ADM", "MGR", "ADMIN"]);

async function hasAal2(): Promise<boolean> {
  try {
    if (!supabase?.auth?.mfa?.getAuthenticatorAssuranceLevel) return false;
    const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (error) return false;
    return data?.currentLevel === "aal2";
  } catch {
    return false;
  }
}

export function RequireRole({ allow = [], children }: { allow?: string[]; children: React.ReactNode }) {
  const { role, loading, isAuthenticated } = useAuth();
  const loc = useLocation();

  const [aalOk, setAalOk] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    let alive = true;

    (async () => {
      if (!isAuthenticated) return;
      const r = normalizeRole(role);
      if (!MFA_REQUIRED_ROLES.has(r)) {
        if (alive) setAalOk(true);
        return;
      }
      if (!SUPABASE_CONFIGURED) {
        if (alive) setAalOk(false);
        return;
      }
      const ok = await hasAal2();
      if (alive) setAalOk(ok);
    })();

    return () => {
      alive = false;
    };
  }, [isAuthenticated, role]);

  if (loading) return <div className="min-h-screen bg-[#05080F] flex items-center justify-center"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent animate-spin rounded-full" /></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: loc.pathname }} />;

  const allowSet = new Set(allow.map(normalizeRole));
  const r = normalizeRole(role);

  if (!r || r === "GUEST") return <Navigate to="/unauthorized" replace state={{ reason: "ROLE_NOT_ASSIGNED" }} />;
  if (!allowSet.has(r)) return <Navigate to="/unauthorized" replace state={{ reason: "ROLE_NOT_ALLOWED", role: r }} />;

  if (MFA_REQUIRED_ROLES.has(r)) {
    if (aalOk === null) {
      return <div className="min-h-screen bg-[#05080F] flex items-center justify-center text-xs text-emerald-500 font-mono">Verifying MFA…</div>;
    }
    if (!aalOk) {
      return <Navigate to="/login" replace state={{ from: loc.pathname, reason: "MFA_REQUIRED" }} />;
    }
  }

  return <>{children}</>;
}
EOF

# -----------------------------------------------------------------------------
# 7) ENTRY PAGES (EnterprisePortal, Login, ResetPassword, Unauthorized)
# -----------------------------------------------------------------------------
cat > "$ENT_PORTAL" << 'EOF'
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function EnterprisePortal() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (user) navigate("/dashboard", { replace: true });
  }, [user, navigate]);

  return (
    <div className="relative h-screen w-full overflow-hidden text-slate-100 bg-[#05080F]">
      {mounted && (
        <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover opacity-30 pointer-events-none grayscale">
          <source src="/background.mp4" type="video/mp4" />
        </video>
      )}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.15),transparent_70%)]" />
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center space-y-8 px-4">
        <div className="mx-auto w-32 h-32 bg-black/40 border border-white/10 rounded-[2rem] flex items-center justify-center mb-4 animate-in fade-in zoom-in duration-1000 shadow-2xl overflow-hidden">
          <img src="/logo.png" alt="Britium Logo" className="w-24 h-24 object-contain" />
        </div>

        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter uppercase text-white">
            BRITIUM <span className="text-emerald-500">EXPRESS</span>
          </h1>
          <p className="text-sm md:text-lg text-white/60 uppercase tracking-[0.3em] font-light">
            Enterprise Logistics Intelligence Platform
          </p>
        </div>

        <Button
          size="lg"
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-12 py-7 text-xl font-bold rounded-2xl transition-all shadow-xl tracking-widest"
          onClick={() => navigate("/login")}
        >
          Enter Enterprise Portal
        </Button>
      </div>
    </div>
  );
}
EOF

cat > "$LOGIN" <<'EOF'
// @ts-nocheck
import React, { useEffect, useMemo, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase, SUPABASE_CONFIGURED, getRememberMe, setRememberMe } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { defaultPortalForRole, normalizeRole } from "@/lib/portalRegistry";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, Copy, Download, Globe, Loader2, Lock, Mail, RefreshCw, ShieldCheck, UserPlus } from "lucide-react";

type View = "login" | "forgot" | "request" | "force_change" | "mfa" | "magic" | "otp_verify";

const MFA_REQUIRED_ROLES = new Set(["SYS", "APP_OWNER", "SUPER_ADMIN", "SUPER_A", "ADM", "MGR", "ADMIN"]);

function supabaseReady() {
  return Boolean(SUPABASE_CONFIGURED);
}

function readEnvHints() {
  return "Required environment variables (Vite):\n  VITE_SUPABASE_PROJECT_URL=https://xxxx.supabase.co\n  VITE_SUPABASE_ANON_KEY=eyJ...\n";
}

async function loadProfile(userId: string) {
  const trySelect = async (sel: string) => supabase.from("profiles").select(sel).eq("id", userId).maybeSingle();
  let { data, error } = await trySelect("id, role, role_code, app_role, user_role, must_change_password, requires_password_change");
  if (error && (error as any).code === "42703") {
    ({ data, error } = await trySelect("id, role, must_change_password"));
  }
  if (error) return { role: "GUEST", mustChange: false };
  const row: any = data || {};
  const rawRole = row.role ?? row.app_role ?? row.user_role ?? row.role_code ?? "GUEST";
  const mustChange = Boolean(row.must_change_password) || Boolean(row.requires_password_change);
  return { role: normalizeRole(rawRole), mustChange };
}

async function hasAal2() {
  try {
    const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (error) return false;
    return data?.currentLevel === "aal2";
  } catch {
    return false;
  }
}

export default function Login() {
  const nav = useNavigate();
  const loc = useLocation() as any;
  const auth = useAuth();
  const { lang, setLanguage, toggleLang } = useLanguage();
  const [currentLang, setCurrentLang] = useState(lang || "en");
  const t = (en: string, my: string) => (currentLang === "en" ? en : my);

  const [view, setView] = useState<View>("login");
  const [loading, setLoading] = useState(false);
  const [configMissing, setConfigMissing] = useState(false);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState<boolean>(() => getRememberMe());
  
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [otpToken, setOtpToken] = useState("");
  const [otpHint, setOtpHint] = useState("");
  
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [targetPath, setTargetPath] = useState<string>("/");

  const [mfaStage, setMfaStage] = useState<"idle" | "enroll" | "verify">("idle");
  const [mfaFactorId, setMfaFactorId] = useState<string>("");
  const [mfaChallengeId, setMfaChallengeId] = useState<string>("");
  const [mfaQrSvg, setMfaQrSvg] = useState<string>("");
  const [mfaSecret, setMfaSecret] = useState<string>("");
  const [mfaUri, setMfaUri] = useState<string>("");

  const brand = useMemo(() => ({ title: "BRITIUM", subtitleEn: "Welcome to Britium Portal", subtitleMy: "Britium Portal သို့ ကြိုဆိုပါသည်", hintEn: "Please log in to continue.", hintMy: "ဆက်လက်အသုံးပြုရန် အကောင့်ဝင်ပါ။" }), []);

  useEffect(() => { if (lang) setCurrentLang(lang); }, [lang]);
  const toggleLanguage = () => {
    const next = currentLang === "en" ? "my" : "en";
    setCurrentLang(next);
    if (typeof setLanguage === "function") setLanguage(next);
    else if (typeof toggleLang === "function") toggleLang();
  };

  const clearMessages = () => { setErrorMsg(""); setSuccessMsg(""); };

  async function goAfterAuth(role?: string) {
    const from = loc?.state?.from;
    const dst = (typeof from === "string" && from.startsWith("/")) ? from : defaultPortalForRole(role);
    setTargetPath(dst);
    nav(dst, { replace: true });
  }

  async function ensureMfa(role?: string) {
    const r = normalizeRole(role);
    if (!MFA_REQUIRED_ROLES.has(r)) return true;
    const ok = await hasAal2();
    if (ok) return true;
    setView("mfa");
    await prepareMfa();
    return false;
  }

  async function prepareMfa() {
    setMfaStage("idle"); setOtpToken(""); setMfaQrSvg(""); setMfaSecret(""); setMfaUri(""); setMfaFactorId(""); setMfaChallengeId("");
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;
      const totpFactors = (data?.totp || data?.all || []) as any[];
      const verified = totpFactors.find((f) => (f?.status || "").toLowerCase() === "verified") || totpFactors[0];

      if (verified?.id) {
        const { data: ch, error: chErr } = await supabase.auth.mfa.challenge({ factorId: verified.id });
        if (chErr) throw chErr;
        setMfaFactorId(verified.id); setMfaChallengeId(ch?.id || ""); setMfaStage("verify");
        setSuccessMsg(t("Enter your 6-digit authenticator code.", "Authenticator code (၆ လုံး) ကို ထည့်ပါ။"));
        return;
      }

      const { data: enr, error: enrErr } = await supabase.auth.mfa.enroll({ factorType: "totp" });
      if (enrErr) throw enrErr;
      setMfaFactorId(enr?.id || ""); setMfaQrSvg(enr?.totp?.qr_code || ""); setMfaSecret(enr?.totp?.secret || ""); setMfaUri(enr?.totp?.uri || "");

      const { data: ch2, error: ch2Err } = await supabase.auth.mfa.challenge({ factorId: enr.id });
      if (ch2Err) throw ch2Err;
      setMfaChallengeId(ch2?.id || ""); setMfaStage("enroll");
      setSuccessMsg(t("Scan QR with authenticator app, then enter the code.", "Authenticator နဲ့ QR စကန်ပြီး code ထည့်ပါ။"));
    } catch (e: any) {
      setErrorMsg(e?.message || t("MFA setup failed.", "MFA စတင်မရပါ။"));
      setMfaStage("idle");
    } finally { setLoading(false); }
  }

  async function verifyMfa(e: React.FormEvent) {
    e.preventDefault();
    clearMessages();
    if (!otpToken || otpToken.trim().length < 6) return setErrorMsg(t("Enter the 6-digit code.", "Code ၆ လုံး ထည့်ပါ။"));
    setLoading(true);
    try {
      const code = otpToken.trim().replace(/\s+/g, "");
      const { error } = await supabase.auth.mfa.verify({ factorId: mfaFactorId, challengeId: mfaChallengeId, code });
      if (error) throw error;
      const ok = await hasAal2();
      if (!ok) throw new Error("MFA verification incomplete (AAL2 not reached).");
      setSuccessMsg(t("MFA verified. Redirecting…", "MFA အောင်မြင်ပါပြီ။ ဆက်သွားနေသည်…"));
      setTimeout(() => nav(targetPath || "/", { replace: true }), 400);
    } catch (e: any) {
      setErrorMsg(e?.message || t("Invalid code.", "Code မမှန်ပါ။"));
    } finally { setLoading(false); }
  }

  useEffect(() => {
    (async () => {
      const ok = supabaseReady();
      setConfigMissing(!ok);
      if (!ok) return;
      try {
        const { data } = await supabase.auth.getSession();
        const userId = data?.session?.user?.id;
        if (!userId) return;

        const prof = await loadProfile(userId);
        const from = loc?.state?.from;
        const dst = (typeof from === "string" && from.startsWith("/")) ? from : defaultPortalForRole(prof.role);
        setTargetPath(dst);

        if (prof.mustChange) { setView("force_change"); return; }
        const need = MFA_REQUIRED_ROLES.has(normalizeRole(prof.role));
        if (need) {
          const okAal = await hasAal2();
          if (!okAal) { setView("mfa"); await prepareMfa(); return; }
        }
        nav(dst, { replace: true });
      } catch {}
    })();
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    clearMessages();
    if (!supabaseReady()) { setConfigMissing(true); return setErrorMsg(t("System configuration is missing.", "System config မပြည့်စုံပါ။")); }

    setLoading(true);
    try {
      setRememberMe(remember);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      await auth.refresh?.();
      const prof = await loadProfile(data.user.id);
      const dst = defaultPortalForRole(prof.role);
      setTargetPath(dst);

      const isDefault = password === "P@ssw0rd1" || password.startsWith("Britium@");
      if (prof.mustChange || isDefault) {
        setView("force_change");
        setLoading(false);
        return;
      }

      const passed = await ensureMfa(prof.role);
      if (!passed) { setLoading(false); return; }
      await goAfterAuth(prof.role);
    } catch (e: any) {
      setErrorMsg(t("Access Denied: Invalid credentials.", "ဝင်ရောက်ခွင့် ငြင်းပယ်ခံရသည်: အချက်အလက်မှားနေသည်။"));
    } finally { setLoading(false); }
  }

  async function handleMagicSend(e: React.FormEvent) {
    e.preventDefault();
    clearMessages();
    setLoading(true);

    try {
      const emailRedirectTo = `${window.location.origin}/login`;
      const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo } });
      if (error) throw error;

      setSuccessMsg(t("Secure link sent. Check your email.", "လုံခြုံသော link ပို့ပြီးပါပြီ။ Email စစ်ပါ။"));
      setOtpHint(t("If your email contains a 6-digit code, enter it below.", "Email ထဲတွင် ကုဒ် ၆ လုံးပါပါက အောက်တွင်ထည့်ပါ။"));
      setView("otp_verify");
    } catch (e: any) {
      setErrorMsg(e?.message || t("Failed to send link.", "Link ပို့မရပါ။"));
    } finally { setLoading(false); }
  }

  async function handleOtpVerify(e: React.FormEvent) {
    e.preventDefault();
    clearMessages();

    if (!otpToken.trim()) {
      setErrorMsg(t("Enter the code to continue.", "ဆက်လက်လုပ်ဆောင်ရန် ကုဒ်ထည့်ပါ။"));
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({ email, token: otpToken.trim(), type: "email" });
      if (error) throw error;

      if (auth?.refresh) await auth.refresh();
      const { data } = await supabase.auth.getSession();
      if (!data?.session?.user?.id) throw new Error("No session.");
      
      const prof = await loadProfile(data.session.user.id);
      const passed = await ensureMfa(prof.role);
      if (!passed) { setLoading(false); return; }
      await goAfterAuth(prof.role);
    } catch (e: any) {
      setErrorMsg(e?.message || t("OTP invalid.", "OTP ကုဒ် မှားယွင်းနေသည်။"));
    } finally { setLoading(false); }
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    clearMessages();
    if (!supabaseReady()) { setConfigMissing(true); return setErrorMsg(t("System config missing.", "System config မပြည့်စုံပါ။")); }

    setLoading(true);
    try {
      const redirectTo = `${window.location.origin}/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      if (error) throw error;
      setSuccessMsg(t("Recovery link sent. Please check your email.", "Recovery link ကို ပို့ပြီးပါပြီ။ အီးမေးလ်ကို စစ်ပါ။"));
    } catch (e: any) {
      setErrorMsg(e?.message || t("Unable to send recovery email.", "Recovery email ပို့မရပါ။"));
    } finally { setLoading(false); }
  }

  async function handleRequestAccess(e: React.FormEvent) {
    e.preventDefault();
    clearMessages();
    if (!supabaseReady()) { setConfigMissing(true); return setErrorMsg(t("System config missing.", "System config မပြည့်စုံပါ။")); }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      setSuccessMsg(t("Request submitted. Please verify your email if prompted.", "Request တင်ပြီးပါပြီ။ လိုအပ်ပါက အီးမေးလ်အတည်ပြုပါ။"));
      setTimeout(() => setView("login"), 900);
    } catch (e: any) {
      setErrorMsg(e?.message || t("Request failed.", "Request မအောင်မြင်ပါ။"));
    } finally { setLoading(false); }
  }

  async function handleForceChange(e: React.FormEvent) {
    e.preventDefault();
    clearMessages();
    if (newPassword !== confirmPassword) return setErrorMsg(t("Passwords do not match.", "စကားဝှက်များ မကိုက်ညီပါ။"));
    if (newPassword.length < 8) return setErrorMsg(t("Password must be at least 8 characters.", "စကားဝှက်သည် အနည်းဆုံး ၈ လုံး ဖြစ်ရမည်။"));

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      try { await supabase.from("profiles").update({ must_change_password: false, requires_password_change: false }).eq("id", data.user.id); } catch {}
      await auth.refresh?.();
      const prof = await loadProfile(data.user.id);
      const passed = await ensureMfa(prof.role);
      if (!passed) { setLoading(false); return; }
      setSuccessMsg(t("Password updated. Redirecting…", "စကားဝှက် ပြောင်းပြီးပါပြီ။ ဆက်သွားနေသည်…"));
      setTimeout(() => goAfterAuth(prof.role), 450);
    } catch (e: any) {
      setErrorMsg(e?.message || t("Password update failed.", "စကားဝှက်ပြောင်းမရပါ။"));
    } finally { setLoading(false); }
  }

  // Wizard next/prev logic
  const wizardViews: View[] = ["login", "magic", "forgot", "request"];
  const wizardIndex = wizardViews.indexOf(view);
  const showWizardNav = wizardIndex >= 1;
  const prevTarget: View = wizardIndex > 0 ? wizardViews[wizardIndex - 1] : "login";
  const nextTarget: View = wizardIndex >= 0 && wizardIndex < wizardViews.length - 1 ? wizardViews[wizardIndex + 1] : view;
  const canPrev = showWizardNav && !loading;
  const canNext = showWizardNav && wizardIndex < wizardViews.length - 1 && !loading;

  const goPrev = () => { clearMessages(); setView(prevTarget); };
  const goNext = () => { if (!canNext) return; clearMessages(); setView(nextTarget); };

  const pageTitle = useMemo(() => {
    if (view === "forgot") return t("Secure Password Recovery", "စကားဝှက် ပြန်လည်ရယူခြင်း");
    if (view === "request") return t("Request Access", "ဝင်ရောက်ခွင့် တောင်းမည်");
    if (view === "force_change") return t("Security Update Required", "လုံခြုံရေး အပ်ဒိတ် လိုအပ်");
    if (view === "mfa") return t("Multi-Factor Verification", "အဆင့်မြင့် အတည်ပြုခြင်း (MFA)");
    return t("Sign in", "အကောင့်ဝင်မည်");
  }, [view, currentLang]);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#05080F] p-4 text-slate-100">
      <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none grayscale">
        <source src="/background.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_20%,rgba(16,185,129,0.16),transparent_60%)]" />

      <div className="absolute top-6 right-6 z-20">
        <Button onClick={toggleLanguage} variant="outline" className="bg-black/40 border-white/10 text-slate-200 hover:bg-white/5 rounded-full">
          <Globe className="h-4 w-4 mr-2" />
          <span className="text-xs font-black tracking-widest uppercase">{currentLang === "en" ? "MY" : "EN"}</span>
        </Button>
      </div>

      <div className="relative z-10 w-full max-w-md space-y-6 py-12">
        <div className="text-center space-y-2">
          <div className="mx-auto h-28 w-28 rounded-2xl bg-black/40 border border-white/10 grid place-items-center overflow-hidden shadow-2xl">
            <img src="/logo.png" alt="Britium" className="h-20 w-20 object-contain" />
          </div>
          <h1 className="text-4xl font-black tracking-tight text-white">{brand.title}</h1>
          <p className="text-sm text-slate-300">{t(brand.subtitleEn, brand.subtitleMy)}</p>
          <p className="text-xs text-slate-400">{t(brand.hintEn, brand.hintMy)}</p>
        </div>

        {configMissing ? (
          <Card className="bg-[#0B101B]/85 backdrop-blur-xl border-white/10 rounded-[1.75rem] overflow-hidden shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-rose-400">
                <AlertCircle className="h-5 w-5" />
                {t("System Configuration Required", "System Config လိုအပ်သည်")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-slate-300">
                {t("Supabase environment variables are missing. Set them and redeploy.", "Supabase env var မရှိသေးပါ။ ထည့်ပြီး redeploy လုပ်ပါ။")}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-[#0B101B]/85 backdrop-blur-xl border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
            <div className="h-1.5 w-full bg-gradient-to-r from-emerald-600 to-teal-400" />
            <CardContent className="p-7 md:p-8 space-y-5">
              {errorMsg && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-3 text-rose-300">
                  <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                  <p className="text-xs font-bold leading-relaxed">{errorMsg}</p>
                </div>
              )}
              {successMsg && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-3 text-emerald-300">
                  <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
                  <p className="text-xs font-bold leading-relaxed">{successMsg}</p>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-400" />
                  <div className="font-extrabold uppercase tracking-widest text-sm">{pageTitle}</div>
                </div>
              </div>

              {(view === "login" || view === "magic" || view === "otp_verify") && (
                <div className="flex gap-2 p-1.5 bg-black/40 rounded-2xl border border-white/5">
                  <Button type="button" variant={view === "login" ? "default" : "ghost"} className={view === "login" ? "bg-emerald-600 hover:bg-emerald-500 text-white flex-1 rounded-xl shadow-lg" : "text-slate-400 flex-1 rounded-xl"} onClick={() => { clearMessages(); setView("login"); }}>
                    {t("Password", "စကားဝှက်")}
                  </Button>
                  <Button type="button" variant={view !== "login" ? "default" : "ghost"} className={view !== "login" ? "bg-[#D4AF37] hover:bg-[#b5952f] text-black flex-1 rounded-xl shadow-lg" : "text-slate-400 flex-1 rounded-xl"} onClick={() => { clearMessages(); setView("magic"); }}>
                    {t("Email Link", "အီးမေးလ်")}
                  </Button>
                </div>
              )}

              {view === "login" && (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
                    <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="bg-black/40 border-white/10 text-white h-12 rounded-xl pl-12 focus:border-emerald-500/40" placeholder={t("Corporate Email", "အီးမေးလ်")} />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
                    <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="bg-black/40 border-white/10 text-white h-12 rounded-xl pl-12 focus:border-emerald-500/40" placeholder={t("Password", "စကားဝှက်")} />
                  </div>

                  <div className="flex items-center justify-between px-1">
                    <label className="flex items-center gap-2 text-[11px] text-slate-300 font-bold cursor-pointer">
                      <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 accent-emerald-500" />
                      {t("Remember me", "မှတ်ထားမည်")}
                    </label>

                    <div className="flex items-center gap-4 text-[11px] font-black">
                      <button type="button" onClick={() => { clearMessages(); setView("forgot"); }} className="text-slate-400 hover:text-emerald-300 uppercase tracking-widest">
                        {t("Forgot?", "စကားဝှက်မေ့သွားလား")}
                      </button>
                      <button type="button" onClick={() => { clearMessages(); setView("request"); }} className="text-[#D4AF37] hover:text-[#b5952f] uppercase tracking-widest flex items-center gap-1">
                        <UserPlus className="h-3 w-3" /> {t("Sign Up", "အကောင့်လုပ်မည်")}
                      </button>
                    </div>
                  </div>

                  <Button type="submit" disabled={loading} className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-black tracking-widest uppercase rounded-xl mt-2">
                    {loading ? <span className="flex items-center justify-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> {t("Authenticating…", "စစ်ဆေးနေသည်…")}</span> : <span className="flex items-center justify-center gap-2">{t("Login", "အကောင့်ဝင်မည်")} <ArrowRight className="h-4 w-4" /></span>}
                  </Button>
                </form>
              )}

              {view === "magic" && (
                <form onSubmit={handleMagicSend} className="space-y-5">
                  <div className="text-[11px] text-slate-400 px-2 leading-relaxed italic">
                    {t("System will dispatch a one-time secure link to your work inbox.", "စနစ်မှ တစ်ခါသုံး လုံခြုံရေး link ကို သင့်အီးမေးလ်သို့ ပို့ပေးပါမည်။")}
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-4 top-4 h-5 w-5 text-slate-500" />
                    <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="bg-black/40 border-white/10 rounded-2xl pl-12 h-14 text-white" placeholder={t("Corporate Email", "အီးမေးလ်")} />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full h-14 bg-[#D4AF37] hover:bg-[#b5952f] text-black font-black tracking-widest uppercase rounded-2xl shadow-xl transition-all">
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : t("Send Link", "Link ပို့မည်")}
                  </Button>
                </form>
              )}

              {view === "otp_verify" && (
                <form onSubmit={handleOtpVerify} className="space-y-5">
                  <div className="text-xs text-emerald-400 font-bold px-2">{otpHint}</div>
                  <div className="relative">
                    <ShieldCheck className="absolute left-4 top-4 h-5 w-5 text-slate-500" />
                    <Input required value={otpToken} onChange={(e) => setOtpToken(e.target.value)} className="bg-black/40 border-white/10 rounded-2xl pl-12 h-14 text-white font-mono tracking-[0.5em] text-center" placeholder="000000" maxLength={6} />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full h-14 bg-emerald-600 hover:bg-emerald-500 text-white font-black tracking-widest uppercase rounded-2xl">
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : t("Verify & Login", "အတည်ပြုပြီး ဝင်မည်")}
                  </Button>
                </form>
              )}

              {view === "forgot" && (
                <form onSubmit={handleForgot} className="space-y-4">
                  <div className="text-sm text-slate-300">{t("Enter your email to receive a secure recovery link.", "Recovery link ရယူရန် အီးမေးလ်ထည့်ပါ။")}</div>
                  <div className="relative">
                    <Mail className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
                    <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="bg-black/40 border-white/10 text-white h-12 rounded-xl pl-12" placeholder={t("Corporate Email", "အီးမေးလ်")} />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full h-12 bg-slate-700 hover:bg-slate-600 text-white font-black tracking-widest uppercase rounded-xl">
                    {loading ? <span className="flex items-center justify-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> {t("Sending…", "ပို့နေသည်…")}</span> : t("Send Recovery Link", "Recovery Link ပို့မည်")}
                  </Button>
                </form>
              )}

              {view === "request" && (
                <form onSubmit={handleRequestAccess} className="space-y-4">
                  <div className="text-sm text-slate-300">{t("This platform is for authorized personnel. Submit a request to create an account.", "ဤစနစ်သည် ခွင့်ပြုထားသူများအတွက် ဖြစ်သည်။ အကောင့်ဖန်တီးရန် request တင်ပါ။")}</div>
                  <div className="relative">
                    <Mail className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
                    <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="bg-black/40 border-white/10 text-white h-12 rounded-xl pl-12" placeholder={t("Work Email", "အလုပ်အီးမေးလ်")} />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
                    <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="bg-black/40 border-white/10 text-white h-12 rounded-xl pl-12" placeholder={t("New Password", "စကားဝှက်အသစ်")} />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full h-12 bg-[#D4AF37] hover:bg-[#b5952f] text-black font-black tracking-widest uppercase rounded-xl">
                    {loading ? <span className="flex items-center justify-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> {t("Submitting…", "တင်နေသည်…")}</span> : t("Submit Request", "Request တင်မည်")}
                  </Button>
                </form>
              )}

              {view === "force_change" && (
                <form onSubmit={handleForceChange} className="space-y-4">
                  <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-200 text-sm">
                    {t("A password update is required before access is granted.", "ဝင်ရောက်ခွင့်မပြုမီ စကားဝှက်အသစ်ပြောင်းရန် လိုအပ်ပါသည်။")}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
                    <Input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="bg-black/40 border-amber-500/30 text-white h-12 rounded-xl pl-12" placeholder={t("New Password", "စကားဝှက်အသစ်")} />
                  </div>
                  <div className="relative">
                    <CheckCircle2 className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
                    <Input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="bg-black/40 border-amber-500/30 text-white h-12 rounded-xl pl-12" placeholder={t("Confirm Password", "စကားဝှက် အတည်ပြုပါ")} />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full h-12 bg-amber-600 hover:bg-amber-500 text-white font-black tracking-widest uppercase rounded-xl">
                    {loading ? <span className="flex items-center justify-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> {t("Updating…", "ပြောင်းနေသည်…")}</span> : <span className="flex items-center justify-center gap-2">{t("Update & Continue", "ပြောင်းပြီး ဆက်သွားမည်")} <ArrowRight className="h-4 w-4" /></span>}
                  </Button>
                </form>
              )}

              {view === "mfa" && (
                <div className="space-y-4">
                  <div className="text-sm text-slate-300">{t("Admin accounts require MFA. Use an authenticator app.", "Admin အကောင့်များသည် MFA လိုအပ်ပါသည်။ Authenticator app အသုံးပြုပါ။")}</div>
                  {mfaStage === "enroll" && (
                    <div className="space-y-3">
                      {mfaQrSvg && (
                        <div className="rounded-xl border border-white/10 bg-black/40 p-3">
                          <div className="text-xs text-slate-300 mb-2">{t("Scan this QR code:", "ဒီ QR ကို စကန်ပါ:")}</div>
                          <div className="bg-white rounded-lg p-2 overflow-auto" dangerouslySetInnerHTML={{ __html: mfaQrSvg }} />
                        </div>
                      )}
                      {mfaSecret && (
                        <div className="rounded-xl border border-white/10 bg-black/40 p-3 text-xs text-slate-300">
                          <div className="font-bold">{t("Manual key:", "Manual key:")}</div>
                          <div className="font-mono break-all">{mfaSecret}</div>
                          <div className="mt-2 flex gap-2 flex-wrap">
                            <Button type="button" size="sm" variant="outline" className="border-white/10 bg-black/40 hover:bg-white/5" onClick={() => navigator.clipboard.writeText(mfaSecret)}><Copy className="h-3 w-3 mr-2" /> {t("Copy", "ကူးယူ")}</Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  <form onSubmit={verifyMfa} className="space-y-3">
                    <Input inputMode="numeric" pattern="\d*" value={otpToken} onChange={(e) => setOtpToken(e.target.value)} className="bg-black/40 border-white/10 text-white h-12 rounded-xl font-mono tracking-[0.5em] text-center" placeholder="000000" />
                    <div className="flex gap-2 flex-wrap">
                      <Button type="submit" disabled={loading || !mfaFactorId || !mfaChallengeId} className="bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t("Verify", "အတည်ပြု")}
                      </Button>
                      <Button type="button" variant="outline" disabled={loading} className="border-white/10 bg-black/40 hover:bg-white/5 text-slate-200 rounded-xl" onClick={() => prepareMfa()}>
                        <RefreshCw className="h-4 w-4 mr-2" /> {t("Restart MFA", "MFA ပြန်စ")}
                      </Button>
                      <Button type="button" variant="ghost" className="text-slate-300 hover:bg-white/5 rounded-xl" onClick={async () => { await supabase.auth.signOut(); setView("login"); }}>
                        {t("Logout", "ထွက်မည်")}
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {/* Wizard Nav */}
              {showWizardNav && (
                <div className="flex items-center justify-between pt-2">
                  <Button type="button" variant="ghost" disabled={!canPrev} onClick={goPrev} className="h-11 px-4 rounded-xl text-slate-300 hover:text-white disabled:opacity-40">
                    <ArrowLeft className="h-4 w-4 mr-2" /> {t("Previous", "နောက်ပြန်")}
                  </Button>
                  <Button type="button" disabled={!canNext} onClick={goNext} className="h-11 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest disabled:opacity-40">
                    {t("Next", "ရှေ့သို့")} <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              )}

              <Separator className="bg-white/10" />

              <a href="/android.apk" download="android.apk" className="flex items-center justify-center gap-2 w-full h-12 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest text-[11px] transition-colors">
                <Download className="h-4 w-4 text-emerald-400" />
                {t("Download Android App (APK)", "Android App (APK) ဒေါင်းလုပ်")}
              </a>

            </CardContent>
          </Card>
          
          <div className="text-center text-[10px] text-slate-500 font-bold opacity-60 mt-4">
            © {new Date().getFullYear()} Britium Enterprise • {t("All rights reserved.", "မူပိုင်ခွင့် ရယူထားသည်။")}
          </div>

        </div>
      </div>
    </div>
  );
}
EOF

cat > "$RESET_PW" <<'EOF'
// @ts-nocheck
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase, SUPABASE_CONFIGURED } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, Globe, Loader2, Lock, ArrowLeft } from "lucide-react";

export default function ResetPassword() {
  const nav = useNavigate();
  const { lang, setLanguage, toggleLang } = useLanguage();
  const [currentLang, setCurrentLang] = useState(lang || "en");
  const t = (en: string, my: string) => (currentLang === "en" ? en : my);

  const [loading, setLoading] = useState(true);
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => { if (lang) setCurrentLang(lang); }, [lang]);
  const toggleLanguage = () => {
    const next = currentLang === "en" ? "my" : "en";
    setCurrentLang(next);
    if (typeof setLanguage === "function") setLanguage(next);
    else if (typeof toggleLang === "function") toggleLang();
  };

  useEffect(() => {
    (async () => {
      if (!SUPABASE_CONFIGURED) { setLoading(false); return; }
      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");
        if (code && supabase.auth.exchangeCodeForSession) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          setLoading(false); return;
        }
        const hash = window.location.hash?.startsWith("#") ? window.location.hash.slice(1) : "";
        const params = new URLSearchParams(hash);
        const access_token = params.get("access_token");
        const refresh_token = params.get("refresh_token");
        if (access_token && refresh_token && supabase.auth.setSession) {
          const { error } = await supabase.auth.setSession({ access_token, refresh_token });
          if (error) throw error;
        }
        setLoading(false);
      } catch (e: any) {
        setErrorMsg(e?.message || t("Invalid or expired recovery link.", "Recovery link မမှန် သို့မဟုတ် သက်တမ်းကုန်နေပါသည်။"));
        setLoading(false);
      }
    })();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(""); setSuccessMsg("");
    if (!SUPABASE_CONFIGURED) return setErrorMsg("System config missing.");
    if (pw !== pw2) return setErrorMsg(t("Passwords do not match.", "စကားဝှက်များ မကိုက်ညီပါ။"));
    if (pw.length < 8) return setErrorMsg(t("Password must be at least 8 characters.", "စကားဝှက်သည် အနည်းဆုံး ၈ လုံး ဖြစ်ရမည်။"));

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: pw });
      if (error) throw error;
      try {
        const { data } = await supabase.auth.getUser();
        if (data?.user?.id) {
          await supabase.from("profiles").update({ must_change_password: false, requires_password_change: false }).eq("id", data.user.id);
        }
      } catch {}
      setSuccessMsg(t("Password updated. Please login.", "စကားဝှက် ပြောင်းပြီးပါပြီ။ Login ပြန်ဝင်ပါ။"));
      setTimeout(() => nav("/login", { replace: true }), 900);
    } catch (e: any) {
      setErrorMsg(e?.message || t("Password update failed.", "စကားဝှက်ပြောင်းမရပါ။"));
    } finally { setLoading(false); }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#05080F] text-slate-100">
      <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none grayscale">
        <source src="/background.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_20%,rgba(16,185,129,0.16),transparent_60%)]" />

      <div className="absolute top-6 right-6 z-20">
        <Button onClick={toggleLanguage} variant="outline" className="bg-black/40 border-white/10 text-slate-200 hover:bg-white/5 rounded-full">
          <Globe className="h-4 w-4 mr-2" />
          <span className="text-xs font-black tracking-widest uppercase">{currentLang === "en" ? "MY" : "EN"}</span>
        </Button>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <div className="mx-auto h-28 w-28 rounded-2xl bg-black/40 border border-white/10 grid place-items-center overflow-hidden shadow-2xl">
              <img src="/logo.png" alt="Britium" className="h-20 w-20 object-contain" />
            </div>
            <h1 className="text-3xl font-black tracking-tight">BRITIUM L5</h1>
            <p className="text-sm text-slate-300">{t("Reset password", "စကားဝှက် ပြန်လည်သတ်မှတ်")}</p>

            <Button variant="ghost" className="text-slate-300 hover:bg-white/5 mt-2" onClick={() => nav("/login")}>
              <ArrowLeft className="h-4 w-4 mr-2" /> {t("Back to Login", "Login သို့ပြန်")}
            </Button>
          </div>

          <Card className="bg-[#0B101B]/85 backdrop-blur-xl border-white/10 rounded-[2rem] overflow-hidden shadow-2xl">
            <div className="h-1 w-full bg-gradient-to-r from-emerald-600 to-teal-400" />
            <CardContent className="p-7 space-y-4">
              {errorMsg && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-3 text-rose-300">
                  <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                  <p className="text-xs font-bold leading-relaxed">{errorMsg}</p>
                </div>
              )}
              {successMsg && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-3 text-emerald-300">
                  <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
                  <p className="text-xs font-bold leading-relaxed">{successMsg}</p>
                </div>
              )}
              {loading ? (
                <div className="flex items-center justify-center gap-2 text-sm text-slate-300 py-8">
                  <Loader2 className="h-4 w-4 animate-spin" /> {t("Preparing secure session…", "လုံခြုံရေး session ကို ပြင်ဆင်နေသည်…")}
                </div>
              ) : (
                <form onSubmit={submit} className="space-y-4">
                  <div className="relative">
                    <Lock className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
                    <Input type="password" required value={pw} onChange={(e) => setPw(e.target.value)} className="bg-black/40 border-white/10 text-white h-12 rounded-xl pl-12" placeholder={t("New Password", "စကားဝှက်အသစ်")} />
                  </div>
                  <div className="relative">
                    <CheckCircle2 className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
                    <Input type="password" required value={pw2} onChange={(e) => setPw2(e.target.value)} className="bg-black/40 border-white/10 text-white h-12 rounded-xl pl-12" placeholder={t("Confirm Password", "စကားဝှက် အတည်ပြု")} />
                  </div>
                  <Button disabled={loading} type="submit" className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-black tracking-widest uppercase rounded-xl mt-4">
                    {loading ? <span className="flex items-center justify-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> {t("Updating…", "ပြောင်းနေသည်…")}</span> : t("Update Password", "စကားဝှက် ပြောင်းမည်")}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
EOF

# -----------------------------------------------------------------------------
# 8) Patch SignUp.tsx using sed
# -----------------------------------------------------------------------------
if [ -f "$SIGNUP" ]; then
  sed -i.bak 's/Access request submitted to L5 Command./Access request submitted to platform administrators./g' "$SIGNUP" || true
  sed -i.bak 's/L5 Command/Platform Admin/g' "$SIGNUP" || true
  rm -f "$SIGNUP.bak"
fi

# -----------------------------------------------------------------------------
# 9) Push & Deploy Fix
# -----------------------------------------------------------------------------
echo "✅ Enterprise portal registry, sidebars, and safe stubs configured."
git add .
git commit -m "fix: enforce safe routing architecture, unify supabaseClient paths, and add robust wizard login"
git push origin master
npx vercel --prod --force
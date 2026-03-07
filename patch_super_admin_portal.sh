#!/usr/bin/env bash
set -euo pipefail

# ==============================================================================
# Super Admin Portal + Unified Portal Sidebar (based on BE_Multi_Portal_2.zip structure)
# - Adds a single sidebar menu across ALL portals (via PortalShell)
# - Adds Super Admin Portal hub at: /portal/admin
# - Registers ALL portal routes + key sub-pages in App.tsx
# - Includes bilingual labels (EN/MM) for sidebar + portal hub
#
# Run from repo root:
#   bash apply-super-admin-portal-sidebar.sh
# ==============================================================================

backup() {
  local f="$1"
  [[ -f "$f" ]] || return 0
  cp -f "$f" "${f}.bak.$(date +%Y%m%d_%H%M%S)"
}

# ----------- Paths (matching your ZIP layout) -----------
APP="src/App.tsx"
PORTAL_SHELL="src/components/layout/PortalShell.tsx"
PORTAL_SIDEBAR="src/components/layout/PortalSidebar.tsx"
PORTAL_REGISTRY="src/lib/portalRegistry.ts"
TIER_BADGE="src/components/TierBadge.tsx"
SUPER_ADMIN_PORTAL="src/pages/portals/admin/SuperAdminPortal.tsx"
ADMIN_WRAP="src/pages/portals/admin/AdminModuleWrapper.tsx"
EXEC_MANUAL="src/pages/portals/execution/ExecutionManualPage.tsx"

mkdir -p \
  "$(dirname "$APP")" \
  "$(dirname "$PORTAL_SHELL")" \
  "$(dirname "$PORTAL_SIDEBAR")" \
  "$(dirname "$PORTAL_REGISTRY")" \
  "$(dirname "$TIER_BADGE")" \
  "$(dirname "$SUPER_ADMIN_PORTAL")" \
  "$(dirname "$ADMIN_WRAP")" \
  "$(dirname "$EXEC_MANUAL")"

backup "$APP"
backup "$PORTAL_SHELL"
backup "$PORTAL_SIDEBAR"
backup "$PORTAL_REGISTRY"
backup "$TIER_BADGE"
backup "$SUPER_ADMIN_PORTAL"
backup "$ADMIN_WRAP"
backup "$EXEC_MANUAL"

# ==============================================================================
# 1) Portal Registry (single source of truth for sidebar items + portal hub)
# ==============================================================================
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
EOF

# ==============================================================================
# 2) Tier Badge (post-login only, for PortalShell header)
# ==============================================================================
cat > "$TIER_BADGE" <<'EOF'
import React from "react";
import { ROLE_MATRIX, normalizeRole } from "@/lib/rbac";

export default function TierBadge({ role }: { role: string | null | undefined }) {
  const r = normalizeRole(role);
  const info = r ? (ROLE_MATRIX as any)[r] : null;

  const level = info?.level ?? (r === "SYS" || r === "APP_OWNER" || r === "SUPER_ADMIN" ? "L5" : "L1");
  const scope = info?.scope ?? "S1";

  const color =
    level === "L5"
      ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/25"
      : level === "L4"
        ? "bg-sky-500/15 text-sky-300 border-sky-500/25"
        : level === "L3"
          ? "bg-amber-500/15 text-amber-300 border-amber-500/25"
          : "bg-white/5 text-slate-300 border-white/10";

  return (
    <span className={`inline-flex items-center h-7 px-3 rounded-full border text-[10px] font-black tracking-widest uppercase ${color}`} title={`${r ?? "NO_ROLE"}`}>
      {level} • {scope}
    </span>
  );
}
EOF

# ==============================================================================
# 3) Portal Sidebar (NavLink menu + children)
# ==============================================================================
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

export function PortalSidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { role } = useAuth();
  const { lang } = useLanguage();
  const sections = navForRole(role);

  const panel = (
    <aside className="w-72 shrink-0 rounded-2xl border border-white/10 bg-[#0B101B] p-4 h-[calc(100vh-96px)] overflow-auto">
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
      {/* Desktop */}
      <div className="hidden lg:block">{panel}</div>

      {/* Mobile Drawer */}
      {open ? (
        <div className="lg:hidden fixed inset-0 z-[999]">
          <div className="absolute inset-0 bg-black/70" onClick={onClose} />
          <div className="absolute left-3 top-20">{panel}</div>
        </div>
      ) : null}
    </>
  );
}
EOF

# ==============================================================================
# 4) PortalShell upgrade: Header + Tier + Sidebar + responsive
# ==============================================================================
cat > "$PORTAL_SHELL" <<'EOF'
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import TierBadge from "@/components/TierBadge";
import { PortalSidebar } from "@/components/layout/PortalSidebar";

export function PortalShell({
  title,
  links,
  children,
}: {
  title: string;
  links?: { to: string; label: string }[];
  children: React.ReactNode;
}) {
  const { logout, role, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-[#05080F] text-white">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#05080F]/80 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden h-10 px-3 rounded-xl border border-white/10 hover:bg-white/5 text-xs font-black tracking-widest uppercase"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              Menu
            </button>

            <div className="h-9 w-9 rounded-2xl bg-emerald-500/20 border border-emerald-500/30" />
            <div>
              <div className="text-sm font-black tracking-widest uppercase">{title}</div>
              <div className="text-[10px] opacity-70">{(user as any)?.email ?? "—"} • {role ?? "NO_ROLE"}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <TierBadge role={role} />
            <button
              className="text-xs px-3 py-2 rounded-xl border border-white/10 hover:border-white/20 hover:bg-white/5"
              onClick={() => void logout()}
            >
              Sign out
            </button>
          </div>
        </div>

        {links?.length ? (
          <div className="mx-auto max-w-7xl px-4 pb-3 flex gap-2 flex-wrap">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="text-xs px-3 py-1.5 rounded-xl border border-white/10 hover:border-white/20 hover:bg-white/5"
              >
                {l.label}
              </Link>
            ))}
          </div>
        ) : null}
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 flex gap-6">
        <PortalSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
EOF

# ==============================================================================
# 5) Super Admin Portal Hub: /portal/admin
# ==============================================================================
cat > "$SUPER_ADMIN_PORTAL" <<'EOF'
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PortalShell } from "@/components/layout/PortalShell";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/lib/supabase";
import { portalCountAll, portalCountForRole, portalsForRole } from "@/lib/portalRegistry";
import {
  Activity,
  ArrowRight,
  KeyRound,
  ShieldAlert,
  ShieldCheck,
  Users,
  UserCheck,
  ClipboardList,
} from "lucide-react";

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

    const code = (res.error as any)?.code ?? "";
    const msg = ((res.error as any)?.message ?? "").toLowerCase();
    const missing = code === "42703" || msg.includes("does not exist") || (msg.includes("column") && msg.includes(f));
    if (!missing) break;
  }
  return null;
}

async function countRotationRequired(): Promise<number | null> {
  const fields = ["must_change_password", "requires_password_change", "requires_password_reset"];
  for (const f of fields) {
    // @ts-ignore
    const res = await supabase.from("profiles").select("id", { count: "exact", head: true }).eq(f, true);
    if (!res.error) return res.count ?? null;

    const code = (res.error as any)?.code ?? "";
    const msg = ((res.error as any)?.message ?? "").toLowerCase();
    const missing = code === "42703" || msg.includes("does not exist") || (msg.includes("column") && msg.includes(f));
    if (!missing) break;
  }
  return null;
}

async function countAuditEvents(): Promise<number | null> {
  const res = await supabase.from("audit_logs").select("id", { count: "exact", head: true });
  if (res.error) return null;
  return res.count ?? null;
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

function eventBadge(eventType: string) {
  const t = (eventType || "").toUpperCase();
  if (t.includes("PASSWORD")) return { bg: "bg-amber-500/10", fg: "text-amber-300", icon: KeyRound };
  if (t.includes("LOGIN")) return { bg: "bg-emerald-500/10", fg: "text-emerald-300", icon: Activity };
  if (t.includes("SESSION")) return { bg: "bg-sky-500/10", fg: "text-sky-300", icon: ShieldCheck };
  return { bg: "bg-white/5", fg: "text-slate-300", icon: ShieldAlert };
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

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);

      const riderRoles = ["RDR", "RIDER", "RIDER_USER", "DELIVERY_RIDER", "DRIVER", "HELPER"];

      const [personnel, riders, securityEvents, rotationRequired, feed] = await Promise.all([
        countProfilesTotal(),
        countProfilesByRoleFields(riderRoles),
        countAuditEvents(),
        countRotationRequired(),
        loadAuditFeed(15),
      ]);

      const anyOk =
        personnel !== null ||
        riders !== null ||
        securityEvents !== null ||
        rotationRequired !== null ||
        (feed?.length ?? 0) > 0;

      if (cancelled) return;

      setMetrics({
        personnel,
        riders,
        securityEvents,
        rotationRequired,
        portalsAccessible: portalCountForRole(role),
        portalsTotal: portalCountAll(),
        health: anyOk ? "NOMINAL" : "DEGRADED",
      });

      setAudit(feed);
      setLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
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
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/5 pb-6">
          <div>
            <div className="text-[10px] font-mono text-slate-500 tracking-[0.25em] uppercase">
              {t("SESSION ACTIVE", "စနစ်ဝင်ရောက်ထားပါသည်")}
            </div>
            <h1 className="text-3xl font-black text-white tracking-widest uppercase mt-2">
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
                <div className="p-3 rounded-xl bg-white/5 w-fit">
                  <Icon size={18} className="text-slate-200" />
                </div>
                <div className="mt-4">
                  <div className="text-3xl font-black text-white">{s.value}</div>
                  <div className="text-[10px] font-mono text-slate-400 tracking-widest uppercase mt-2">{s.title}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate("/portal/admin/accounts")}
            className="p-6 rounded-2xl bg-[#111622] border border-white/5 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all text-left"
          >
            <UserCheck className="text-emerald-300 mb-3" size={22} />
            <div className="text-lg font-black text-white uppercase tracking-widest">{t("Account Control", "အကောင့်စီမံခန့်ခွဲမှု")}</div>
            <div className="text-xs text-slate-500 font-mono mt-2">
              {t("Create/approve users + manage authorities.", "User ဖန်တီး/အတည်ပြု + authority စီမံရန်")}
            </div>
            <div className="mt-4 text-[10px] font-mono tracking-widest uppercase text-emerald-300 flex items-center gap-2">
              {t("Open", "ဝင်ရောက်မည်")} <ArrowRight size={12} />
            </div>
          </button>

          <button
            onClick={() => navigate("/portal/admin/executive")}
            className="p-6 rounded-2xl bg-[#111622] border border-white/5 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all text-left"
          >
            <ShieldAlert className="text-amber-300 mb-3" size={22} />
            <div className="text-lg font-black text-white uppercase tracking-widest">{t("Executive Command", "Executive Command")}</div>
            <div className="text-xs text-slate-500 font-mono mt-2">
              {t("High-privilege monitoring and controls.", "အမြင့်ဆုံးအာဏာ စောင့်ကြည့်/ထိန်းချုပ်မှု")}
            </div>
            <div className="mt-4 text-[10px] font-mono tracking-widest uppercase text-amber-300 flex items-center gap-2">
              {t("Open", "ဝင်ရောက်မည်")} <ArrowRight size={12} />
            </div>
          </button>

          <button
            onClick={() => navigate("/portal/admin/audit")}
            className="p-6 rounded-2xl bg-[#111622] border border-white/5 hover:border-sky-500/30 hover:bg-sky-500/5 transition-all text-left"
          >
            <ShieldCheck className="text-sky-300 mb-3" size={22} />
            <div className="text-lg font-black text-white uppercase tracking-widest">{t("Audit Logs", "Audit Logs")}</div>
            <div className="text-xs text-slate-500 font-mono mt-2">
              {t("Track system events and access activity.", "စနစ်ဖြစ်ရပ်များနှင့် ဝင်ရောက်မှု စစ်ဆေးရန်")}
            </div>
            <div className="mt-4 text-[10px] font-mono tracking-widest uppercase text-sky-300 flex items-center gap-2">
              {t("Open", "ဝင်ရောက်မည်")} <ArrowRight size={12} />
            </div>
          </button>
        </div>

        {/* Portals Directory */}
        <div className="space-y-3">
          <div className="text-sm font-black text-white tracking-widest uppercase">
            {t("Portals Directory", "Portal Directory")}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {portals.map((p) => {
              const Icon = p.icon;
              return (
                <button
                  key={p.id}
                  onClick={() => navigate(p.path)}
                  className="p-6 rounded-2xl bg-[#111622] border border-white/5 hover:border-white/20 hover:bg-white/5 transition-all text-left"
                >
                  <Icon className="text-slate-200 mb-3" size={22} />
                  <div className="text-lg font-black text-white uppercase tracking-widest">
                    {lang === "en" ? p.label_en : p.label_mm}
                  </div>
                  <div className="mt-4 text-[10px] font-mono tracking-widest uppercase text-slate-300 flex items-center gap-2">
                    {t("Open", "ဝင်ရောက်မည်")} <ArrowRight size={12} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Audit Feed */}
        <div className="space-y-3">
          <div className="text-sm font-black text-white tracking-widest uppercase flex items-center gap-2">
            <ShieldAlert size={16} className="text-amber-300" />
            {t("Live Audit Feed", "လုံခြုံရေးမှတ်တမ်းများ")}
          </div>

          <div className="bg-[#0B101B] border border-white/5 rounded-2xl p-4 space-y-4 h-[320px] overflow-y-auto">
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
                      <p className="text-[10px] text-slate-500 font-mono mt-1 truncate">
                        {row.user_id ? `user_id: ${String(row.user_id).slice(0, 8)}...` : "user_id: —"}
                      </p>
                      <p className={`text-[9px] font-mono mt-1 uppercase tracking-wider ${b.fg}/70`}>
                        {relativeTime(row.created_at, lang)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </PortalShell>
  );
}
EOF

# ==============================================================================
# 6) Admin module wrapper (keeps sidebar while viewing admin screens)
# ==============================================================================
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
      <div className="rounded-2xl border border-white/5 bg-[#0B101B] p-4">
        {children}
      </div>
    </PortalShell>
  );
}
EOF

# ==============================================================================
# 7) Missing route support: Execution Manual page (link exists in ExecutionPortal)
# ==============================================================================
cat > "$EXEC_MANUAL" <<'EOF'
import React from "react";
import { PortalShell } from "@/components/layout/PortalShell";

export default function ExecutionManualPage() {
  return (
    <PortalShell
      title="Execution Manual"
      links={[
        { to: "/portal/execution", label: "Dashboard" },
        { to: "/portal/execution/navigation", label: "Navigation" },
      ]}
    >
      <div className="space-y-3">
        <div className="text-sm opacity-80">
          Placeholder manual execution page. Replace with your rider/driver forms or checklist module.
        </div>
        <div className="text-xs font-mono text-slate-500">
          Path: /portal/execution/manual
        </div>
      </div>
    </PortalShell>
  );
}
EOF

# ==============================================================================
# 8) App.tsx: Register ALL portal routes + super admin portal routes
# ==============================================================================
cat > "$APP" <<'EOF'
import React, { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import { RequireAuth } from "@/routes/RequireAuth";
import { RequireRole } from "@/routes/RequireRole";

import Login from "./pages/Login";
import Unauthorized from "./pages/Unauthorized";
import DashboardRedirect from "./pages/DashboardRedirect";

import SuperAdminPortal from "@/pages/portals/admin/SuperAdminPortal";
import AdminModuleWrapper from "@/pages/portals/admin/AdminModuleWrapper";
import ExecutiveCommandCenter from "@/pages/portals/admin/ExecutiveCommandCenter";

import AccountControl from "@/pages/AccountControl";
import AdminDashboard from "@/pages/AdminDashboard";
import AuditLogs from "@/pages/AuditLogs";
import AdminUsers from "@/pages/AdminUsers";
import PermissionAssignment from "@/pages/PermissionAssignment";

import AdminPortal from "@/pages/portals/AdminPortal";
import OperationsPortal from "@/pages/portals/OperationsPortal";
import OperationsTrackingPage from "@/pages/portals/OperationsTrackingPage";
import FinancePortal from "@/pages/portals/FinancePortal";
import FinanceReconPage from "@/pages/portals/finance/FinanceReconPage";
import HrPortal from "@/pages/portals/HrPortal";
import HrAdminOpsPage from "@/pages/portals/hr/HrAdminOpsPage";
import MarketingPortal from "@/pages/portals/MarketingPortal";
import SupportPortal from "@/pages/portals/SupportPortal";
import ExecutionPortal from "@/pages/portals/ExecutionPortal";
import ExecutionNavigationPage from "@/pages/portals/ExecutionNavigationPage";
import ExecutionManualPage from "@/pages/portals/execution/ExecutionManualPage";
import WarehousePortal from "@/pages/portals/WarehousePortal";
import WarehouseReceivingPage from "@/pages/portals/warehouse/WarehouseReceivingPage";
import WarehouseDispatchPage from "@/pages/portals/warehouse/WarehouseDispatchPage";
import BranchPortal from "@/pages/portals/BranchPortal";
import BranchInboundPage from "@/pages/portals/branch/BranchInboundPage";
import BranchOutboundPage from "@/pages/portals/branch/BranchOutboundPage";
import SupervisorPortal from "@/pages/portals/SupervisorPortal";
import SupervisorApprovalPage from "@/pages/portals/supervisor/SupervisorApprovalPage";
import SupervisorFraudPage from "@/pages/portals/supervisor/SupervisorFraudPage";
import MerchantPortal from "@/pages/portals/MerchantPortal";
import CustomerPortal from "@/pages/portals/CustomerPortal";

import DataEntryOpsPage from "@/pages/portals/operations/DataEntryOpsPage";
import QROpsScanPage from "@/pages/portals/operations/QROpsScanPage";
import WaybillCenterPage from "@/pages/portals/operations/WaybillCenterPage";

export default function App() {
  return (
    <LanguageProvider>
      <Suspense fallback={<div className="bg-[#05080F] min-h-screen" />}>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            <Route element={<RequireAuth />}>
              <Route path="/" element={<DashboardRedirect />} />

              {/* ===========================
                  SUPER ADMIN PORTAL (L5)
                 =========================== */}
              <Route
                path="/portal/admin"
                element={
                  <RequireRole allow={["SYS", "APP_OWNER", "SUPER_ADMIN"]}>
                    <SuperAdminPortal />
                  </RequireRole>
                }
              />
              <Route
                path="/portal/admin/executive"
                element={
                  <RequireRole allow={["SYS", "APP_OWNER", "SUPER_ADMIN"]}>
                    <ExecutiveCommandCenter />
                  </RequireRole>
                }
              />
              <Route
                path="/portal/admin/accounts"
                element={
                  <RequireRole allow={["SYS", "APP_OWNER", "SUPER_ADMIN"]}>
                    <AdminModuleWrapper title="Account Control">
                      <AccountControl />
                    </AdminModuleWrapper>
                  </RequireRole>
                }
              />
              <Route
                path="/portal/admin/dashboard"
                element={
                  <RequireRole allow={["SYS", "APP_OWNER", "SUPER_ADMIN"]}>
                    <AdminModuleWrapper title="Admin Dashboard">
                      <AdminDashboard />
                    </AdminModuleWrapper>
                  </RequireRole>
                }
              />
              <Route
                path="/portal/admin/audit"
                element={
                  <RequireRole allow={["SYS", "APP_OWNER", "SUPER_ADMIN"]}>
                    <AdminModuleWrapper title="Audit Logs">
                      <AuditLogs />
                    </AdminModuleWrapper>
                  </RequireRole>
                }
              />
              <Route
                path="/portal/admin/users"
                element={
                  <RequireRole allow={["SYS", "APP_OWNER", "SUPER_ADMIN"]}>
                    <AdminModuleWrapper title="Admin Users">
                      <AdminUsers />
                    </AdminModuleWrapper>
                  </RequireRole>
                }
              />
              <Route
                path="/portal/admin/permission-assignment"
                element={
                  <RequireRole allow={["SYS", "APP_OWNER", "SUPER_ADMIN"]}>
                    <AdminModuleWrapper title="Permission Assignment">
                      <PermissionAssignment />
                    </AdminModuleWrapper>
                  </RequireRole>
                }
              />

              {/* ===========================
                  PORTALS
                 =========================== */}
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
    </LanguageProvider>
  );
}
EOF

# ==============================================================================
# Stage
# ==============================================================================
git add \
  "$APP" \
  "$PORTAL_SHELL" \
  "$PORTAL_SIDEBAR" \
  "$PORTAL_REGISTRY" \
  "$TIER_BADGE" \
  "$SUPER_ADMIN_PORTAL" \
  "$ADMIN_WRAP" \
  "$EXEC_MANUAL" \
  2>/dev/null || true

echo "✅ Super Admin Portal + Sidebar created."
echo
echo "Test:"
echo "  npm run dev"
echo
echo "Commit:"
echo "  git commit -m \"feat(portals): super admin portal hub + unified sidebar navigation\""
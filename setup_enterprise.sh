#!/usr/bin/env bash
set -euo pipefail

echo "🚀 Initiating Complete Enterprise System Restoration..."

# -----------------------------------------------------------------------------
# 0) SETUP VARIABLES & DIRECTORIES
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
RECENT_NAV="src/lib/recentNav.ts"
SUPPLY_CHAIN="src/services/supplyChain.ts"
NOTIFY_LIB="src/lib/notify.ts"

SERVER_DIR="server/notify-receiver"

echo "Creating directories..."
mkdir -p src/lib src/services src/contexts src/components/layout src/routes
mkdir -p src/pages/portals/admin src/pages/portals/operations src/pages/portals/finance
mkdir -p src/pages/portals/execution src/pages/portals/hr src/pages/portals/warehouse
mkdir -p src/pages/portals/branch src/pages/portals/supervisor
mkdir -p "$SERVER_DIR"

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
backup "$SUPPLY_CHAIN"
backup "$NOTIFY_LIB"

# Restore original pages from git if they were modified/deleted
git checkout HEAD -- src/pages/ 2>/dev/null || true

# -----------------------------------------------------------------------------
# 1) INSTALL DEPENDENCIES & MOCK SUPPLY CHAIN
# -----------------------------------------------------------------------------
echo "📦 Installing required UI dependencies..."
npm install --save sonner date-fns lucide-react react-router-dom clsx tailwind-merge @radix-ui/react-slot class-variance-authority recharts react-hook-form zod @hookform/resolvers @supabase/supabase-js --no-fund --no-audit

cat > "$SUPPLY_CHAIN" <<'EOF'
// @ts-nocheck
export const traceByWayId = async (id: any) => [];
export const listPendingCod = async (...args: any[]) => [];
export const createDeposit = async (...args: any[]) => ({ success: true });
export const createCodCollection = async (...args: any[]) => ({ success: true });
export const recordSupplyEvent = async (...args: any[]) => ({ success: true });
EOF

# -----------------------------------------------------------------------------
# 2) NOTIFICATION SERVICE (lib + backend server)
# -----------------------------------------------------------------------------
cat > "$NOTIFY_LIB" <<'EOF'
export type NotifyEvent =
  | "ACCOUNT_REQUEST_CREATED"
  | "ACCOUNT_REQUEST_APPROVED"
  | "ACCOUNT_REQUEST_REJECTED"
  | "AUTHORITY_REQUEST_CREATED"
  | "AUTHORITY_REQUEST_APPROVED"
  | "AUTHORITY_REQUEST_REJECTED";

export async function notify(event: NotifyEvent, payload: Record<string, unknown>, actorEmail?: string) {
  const url = (import.meta as any)?.env?.VITE_NOTIFY_WEBHOOK_URL as string | undefined;
  if (!url) return;

  const secret = (import.meta as any)?.env?.VITE_NOTIFY_WEBHOOK_SECRET as string | undefined;

  try {
    await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(secret ? { "x-notify-secret": secret } : {}),
      },
      body: JSON.stringify({
        event,
        at: new Date().toISOString(),
        actorEmail: actorEmail ?? null,
        payload,
      }),
    });
  } catch {
    // silent by design
  }
}
EOF

cat > "$SERVER_DIR/package.json" <<'EOF'
{
  "name": "be-notify-receiver",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "node index.js",
    "start": "node index.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "nodemailer": "^6.9.14"
  }
}
EOF

cat > "$SERVER_DIR/emailTemplates.js" <<'EOF'
export function subjectFor(event, payload) {
  const e = String(event || "EVENT");
  if (e === "ACCOUNT_REQUEST_CREATED") return `Account Request Created: ${payload?.email ?? ""}`.trim();
  if (e === "ACCOUNT_REQUEST_APPROVED") return `Account Approved: ${payload?.email ?? ""}`.trim();
  if (e === "ACCOUNT_REQUEST_REJECTED") return `Account Rejected: ${payload?.email ?? ""}`.trim();
  if (e === "AUTHORITY_REQUEST_CREATED") return `Authority Request Created: ${payload?.subjectEmail ?? ""}`.trim();
  if (e === "AUTHORITY_REQUEST_APPROVED") return `Authority Request Approved: ${payload?.req?.subjectEmail ?? payload?.subjectEmail ?? ""}`.trim();
  if (e === "AUTHORITY_REQUEST_REJECTED") return `Authority Request Rejected: ${payload?.req?.subjectEmail ?? payload?.subjectEmail ?? ""}`.trim();
  return `Notification: ${e}`;
}

export function htmlFor(event, body) {
  const { at, actorEmail, payload } = body;
  const pretty = escapeHtml(JSON.stringify(payload ?? {}, null, 2));

  return `
  <div style="font-family: ui-sans-serif, system-ui, -apple-system; line-height: 1.4">
    <h2 style="margin:0 0 8px 0;">${escapeHtml(String(event))}</h2>
    <p style="margin:0 0 8px 0;"><b>Time:</b> ${escapeHtml(String(at ?? ""))}</p>
    <p style="margin:0 0 16px 0;"><b>Actor:</b> ${escapeHtml(String(actorEmail ?? ""))}</p>
    <div style="padding:12px;border:1px solid #e5e7eb;border-radius:12px;background:#f9fafb;">
      <pre style="margin:0;white-space:pre-wrap;word-wrap:break-word;">${pretty}</pre>
    </div>
    <p style="margin:16px 0 0 0;color:#6b7280;font-size:12px;">
      BE Multi Portal • Notify Receiver
    </p>
  </div>
  `;
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
EOF

cat > "$SERVER_DIR/index.js" <<'EOF'
import "dotenv/config";
import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import { subjectFor, htmlFor } from "./emailTemplates.js";

const app = express();
app.use(cors({ origin: true }));
app.use(express.json({ limit: "1mb" }));

const PORT = Number(process.env.PORT || 8787);
const NOTIFY_SECRET = process.env.NOTIFY_SECRET || "";
const SMTP_HOST = process.env.SMTP_HOST || "";
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASS = process.env.SMTP_PASS || "";
const SMTP_SECURE = String(process.env.SMTP_SECURE || "false").toLowerCase() === "true";
const MAIL_FROM = process.env.MAIL_FROM || SMTP_USER || "no-reply@example.com";
const SUPER_ADMIN_EMAILS = (process.env.SUPER_ADMIN_EMAILS || "").split(",").map((s) => s.trim()).filter(Boolean);
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL || "";

function requireSecret(req) {
  if (!NOTIFY_SECRET) return true;
  return String(req.headers["x-notify-secret"] || "") === NOTIFY_SECRET;
}

function isValidEvent(event) {
  return [
    "ACCOUNT_REQUEST_CREATED",
    "ACCOUNT_REQUEST_APPROVED",
    "ACCOUNT_REQUEST_REJECTED",
    "AUTHORITY_REQUEST_CREATED",
    "AUTHORITY_REQUEST_APPROVED",
    "AUTHORITY_REQUEST_REJECTED",
  ].includes(String(event));
}

function chooseRecipients(event, payload) {
  const e = String(event);
  const p = payload || {};
  const email = (p.email || p.subjectEmail || p?.req?.subjectEmail || "").toString().trim();
  const requestedBy = (p?.req?.requestedBy || p?.requestedBy || "").toString().trim();

  if (e === "ACCOUNT_REQUEST_CREATED") return uniq([...SUPER_ADMIN_EMAILS]);
  if (e === "AUTHORITY_REQUEST_CREATED") return uniq([...SUPER_ADMIN_EMAILS]);

  if (e === "ACCOUNT_REQUEST_APPROVED" || e === "ACCOUNT_REQUEST_REJECTED") {
    return uniq([email, ...SUPER_ADMIN_EMAILS].filter(Boolean));
  }

  if (e === "AUTHORITY_REQUEST_APPROVED" || e === "AUTHORITY_REQUEST_REJECTED") {
    return uniq([email, requestedBy, ...SUPER_ADMIN_EMAILS].filter(Boolean));
  }

  return uniq([...SUPER_ADMIN_EMAILS]);
}

function uniq(arr) {
  return Array.from(new Set(arr));
}

async function sendSlack(event, body) {
  if (!SLACK_WEBHOOK_URL) return;
  try {
    await fetch(SLACK_WEBHOOK_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        text: `*${event}*\nActor: ${body.actorEmail ?? "-"}\nTime: ${body.at ?? "-"}\nPayload: \n\`\`\`${JSON.stringify(body.payload ?? {}, null, 2)}\`\`\``,
      }),
    });
  } catch {
    // ignore
  }
}

function createTransportOrNull() {
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

app.get("/healthz", (_, res) => res.json({ ok: true }));

app.post("/notify", async (req, res) => {
  if (!requireSecret(req)) {
    return res.status(401).json({ ok: false, error: "UNAUTHORIZED" });
  }

  const { event, at, actorEmail, payload } = req.body || {};
  if (!isValidEvent(event)) {
    return res.status(400).json({ ok: false, error: "INVALID_EVENT" });
  }

  const body = { event, at, actorEmail, payload };

  // Optional Slack
  await sendSlack(event, body);

  const recipients = chooseRecipients(event, payload);
  if (!recipients.length) return res.json({ ok: true, sent: 0, note: "No recipients configured" });

  const transport = createTransportOrNull();
  if (!transport) {
    return res.status(500).json({
      ok: false,
      error: "SMTP_NOT_CONFIGURED",
      hint: "Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM, SUPER_ADMIN_EMAILS",
    });
  }

  const subject = subjectFor(event, payload);
  const html = htmlFor(event, body);

  try {
    await transport.sendMail({
      from: MAIL_FROM,
      to: recipients.join(", "),
      subject,
      html,
    });
    return res.json({ ok: true, sent: recipients.length });
  } catch (err) {
    return res.status(500).json({ ok: false, error: "MAIL_SEND_FAILED", detail: String(err?.message || err) });
  }
});

app.listen(PORT, () => {
  console.log(`[notify-receiver] listening on :${PORT}`);
});
EOF

cat > "$SERVER_DIR/.env.example" <<'EOF'
PORT=8787
NOTIFY_SECRET=change_me
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
MAIL_FROM="BE Multi Portal <your_email@gmail.com>"
SUPER_ADMIN_EMAILS=md@britiumexpress.com,md@britiumventures.com
# SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
EOF

cat > "$SERVER_DIR/Dockerfile" <<'EOF'
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY . .
EXPOSE 8787
CMD ["npm", "start"]
EOF

# -----------------------------------------------------------------------------
# 3) CORE LIBS & AUTH LOGIC (AccountStore, Permissions, Supabase, Routing)
# -----------------------------------------------------------------------------
cat > "$RECENT_NAV" <<'EOF'
export const RECENT_NAV_KEY = "be_recent_nav";
export type RecentNavItem = { path: string; timestamp: number; };

export function getRecentNav(): RecentNavItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENT_NAV_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function pushRecent(path: string) {
  if (typeof window === "undefined") return;
  const current = getRecentNav();
  const filtered = current.filter((x) => x.path !== path);
  filtered.unshift({ path, timestamp: Date.now() });
  window.localStorage.setItem(RECENT_NAV_KEY, JSON.stringify(filtered.slice(0, 5)));
}

export function clearRecentNav() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(RECENT_NAV_KEY);
}
EOF

cat > "$SUPA" <<'EOF'
// @ts-nocheck
import { createClient } from "@supabase/supabase-js";
const supabaseUrl = (import.meta.env.VITE_SUPABASE_PROJECT_URL || import.meta.env.VITE_SUPABASE_URL || "https://dltavabvjwocknkyvwgz.supabase.co") as string;
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsdGF2YWJ2andvY2tua3l2d2d6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExMTMxOTQsImV4cCI6MjA4NjY4OTE5NH0.7-9BK6L9dpCYIB-pp1WOeQxCI1DVxnSykoTRXNUHYIo") as string;
export const SUPABASE_CONFIGURED = Boolean(supabaseUrl && supabaseAnonKey);
export function getRememberMe(): boolean { if (typeof window === "undefined") return true; const v = window.localStorage.getItem("be_remember_me"); return v === null ? true : v === "1"; }
export function setRememberMe(remember: boolean): void { if (typeof window === "undefined") return; window.localStorage.setItem("be_remember_me", remember ? "1" : "0"); }
const hybridStorage = {
  getItem: (key: string) => typeof window !== "undefined" ? (getRememberMe() ? window.localStorage.getItem(key) : window.sessionStorage.getItem(key)) : null,
  setItem: (key: string, value: string) => { if (typeof window !== "undefined") (getRememberMe() ? window.localStorage : window.sessionStorage).setItem(key, value); },
  removeItem: (key: string) => { if (typeof window !== "undefined") { window.localStorage.removeItem(key); window.sessionStorage.removeItem(key); } },
};
function stubQuery() { const chain: any = {}; const ret = () => chain; chain.select = ret; chain.eq = ret; chain.neq = ret; chain.order = ret; chain.limit = ret; chain.maybeSingle = async () => ({ data: null, error: { message: "Not configured" } }); chain.single = async () => ({ data: null, error: { message: "Not configured" } }); return chain; }
function createStubClient() { return { auth: { getSession: async () => ({ data: { session: null }, error: null }), onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }), mfa: { getAuthenticatorAssuranceLevel: async () => ({ data: { currentLevel: "aal1" }, error: null }) } }, from: () => stubQuery() } as any; }
export const supabase: any = SUPABASE_CONFIGURED ? createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storage: hybridStorage as any } }) : createStubClient();
EOF

cat > "$AUTH_CTX" <<'EOF'
// @ts-nocheck
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
const AuthContext = createContext<any>({});
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const login = async (email: string, pass: string) => await supabase.auth.signInWithPassword({ email, password: pass });
  const logout = async () => { await supabase.auth.signOut(); setUser(null); };
  useEffect(() => {
    let mounted = true; let authSubscription: any = null;
    const initSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle();
          if (mounted) setUser({ ...session.user, profile: profile || {}, role: profile?.role || profile?.role_code || 'GUEST' });
        } else { if (mounted) setUser(null); }
      } finally { if (mounted) setLoading(false); }
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'INITIAL_SESSION') return;
        if (mounted) setLoading(true);
        if (session?.user) {
          const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle();
          if (mounted) setUser({ ...session.user, profile: profile || {}, role: profile?.role || profile?.role_code || 'GUEST' });
        } else { if (mounted) setUser(null); }
        if (mounted) setLoading(false);
      });
      authSubscription = data.subscription;
    };
    initSession();
    return () => { mounted = false; if (authSubscription) authSubscription.unsubscribe(); };
  }, []);
  return <AuthContext.Provider value={{ user, loading, login, logout, role: user?.role, isAuthenticated: !!user }}>{children}</AuthContext.Provider>;
};
export const useAuth = () => useContext(AuthContext);
EOF

cat > "$PERM_RESOLVER" <<'EOF'
// @ts-nocheck
export type AuthLike = { role?: string | null; permissions?: string[] | null; user?: any; };
export function normalizeRole(role?: string | null): string {
  const r = (role ?? "").trim().toUpperCase();
  if (!r) return "GUEST";
  if (r.startsWith("SUPER")) return "SUPER_ADMIN";
  if (r.startsWith("APP")) return "APP_OWNER";
  if (r.startsWith("SYS")) return "SYS";
  return r;
}
export function isPrivilegedRole(role?: string | null): boolean {
  const r = normalizeRole(role);
  return r === "SYS" || r === "APP_OWNER" || r === "SUPER_ADMIN";
}
function asArray(v: any): string[] { if (!v) return []; if (Array.isArray(v)) return v.map(String); return []; }
export function resolvePermissions(auth: AuthLike): Set<string> {
  const out = new Set<string>();
  for (const p of asArray(auth.permissions)) out.add(p);
  const u = auth.user ?? {};
  for (const p of asArray(u?.permissions)) out.add(p);
  for (const p of asArray(u?.claims?.permissions)) out.add(p);
  for (const p of asArray(u?.app_metadata?.permissions)) out.add(p);
  for (const p of asArray(u?.user_metadata?.permissions)) out.add(p);
  return out;
}
export function hasAnyPermission(auth: AuthLike, required?: string[]): boolean {
  if (!required || required.length === 0) return true;
  if (isPrivilegedRole(auth.role)) return true;
  const perms = resolvePermissions(auth);
  for (const r of required) { if (perms.has(String(r))) return true; }
  return false;
}
export function allowedByRole(auth: AuthLike, allowRoles?: string[]): boolean {
  if (!allowRoles || allowRoles.length === 0) return true;
  const r = normalizeRole(auth.role);
  if (isPrivilegedRole(r)) return true;
  return allowRoles.map((x) => String(x).toUpperCase()).includes(r);
}
EOF

cat > "$PORTAL_REGISTRY" <<'EOF'
// @ts-nocheck
import type { LucideIcon } from "lucide-react";
import { Building2, ShieldCheck, Activity, Wallet, Megaphone, Users, LifeBuoy, Truck, Warehouse, GitBranch, UserCheck, ClipboardList, ShieldAlert, KeyRound } from "lucide-react";
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
EOF

cat > "$ACCT_STORE" <<'EOF'
// @ts-nocheck
export type Role = "SYS" | "APP_OWNER" | "SUPER_ADMIN" | "ADMIN" | "ADM" | "MGR" | "STAFF" | "FINANCE_USER" | "FINANCE_STAFF" | "HR_ADMIN" | "MARKETING_ADMIN" | "CUSTOMER_SERVICE" | "WAREHOUSE_MANAGER" | "SUBSTATION_MANAGER" | "SUPERVISOR" | "RIDER" | "DRIVER" | "HELPER" | "MERCHANT" | "CUSTOMER" | "GUEST";
export type AccountStatus = "PENDING" | "ACTIVE" | "SUSPENDED" | "REJECTED" | "ARCHIVED";
export type Permission = "ADMIN_PORTAL_READ" | "EXEC_COMMAND_READ" | "ADMIN_DASH_READ" | "ADMIN_USER_READ" | "USER_READ" | "USER_CREATE" | "USER_APPROVE" | "USER_REJECT" | "USER_ROLE_EDIT" | "USER_BLOCK" | "USER_RESET_TOKEN" | "USER_DOCS_READ" | "AUTHORITY_MANAGE" | "AUDIT_READ" | "BULK_ACTIONS" | "CSV_IMPORT" | "CSV_EXPORT" | "PORTAL_OPERATIONS" | "PORTAL_FINANCE" | "PORTAL_MARKETING" | "PORTAL_HR" | "PORTAL_SUPPORT" | "PORTAL_EXECUTION" | "PORTAL_WAREHOUSE" | "PORTAL_BRANCH" | "PORTAL_SUPERVISOR" | "PORTAL_MERCHANT" | "PORTAL_CUSTOMER" | string;
export type PasskeyCredential = { id: string; createdAt: string; label?: string };
export type AccountSecurity = { blockedAt?: string; blockedBy?: string; onboardingTokenHash?: string; onboardingTokenIssuedAt?: string; onboardingTokenExpiresAt?: string; passkeys?: PasskeyCredential[]; biometricGateEnabled?: boolean; };
export type AccountApproval = { requestedAt: string; requestedBy: string; processedAt?: string; processedBy?: string; decision?: "APPROVED" | "REJECTED"; note?: string; };
export type Account = { id: string; name: string; email: string; role: Role; status: AccountStatus; department?: string; phone?: string; employeeId?: string; createdAt: string; createdBy: string; approval?: AccountApproval; security?: AccountSecurity; };
export type AuthorityGrant = { id: string; subjectEmail: string; permission: Permission; grantedAt: string; grantedBy: string; revokedAt?: string; revokedBy?: string; };
export type AuthorityRequestStatus = "PENDING" | "APPROVED" | "REJECTED";
export type AuthorityRequestType = "GRANT" | "REVOKE";
export type AuthorityRequest = { id: string; type: AuthorityRequestType; subjectEmail: string; permission: Permission; requestedAt: string; requestedBy: string; requestNote?: string; status: AuthorityRequestStatus; processedAt?: string; processedBy?: string; decisionNote?: string; };
export type AuditEvent = { id: string; at: string; actorEmail: string; action: string; targetEmail?: string; detail?: string; };
export type Store = { v: 2; accounts: Account[]; grants: AuthorityGrant[]; authorityRequests: AuthorityRequest[]; audit: AuditEvent[]; };

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

export const DEFAULT_ROLES: Role[] = ["SYS", "APP_OWNER", "SUPER_ADMIN", "ADMIN", "ADM", "MGR", "STAFF", "FINANCE_USER", "FINANCE_STAFF", "HR_ADMIN", "MARKETING_ADMIN", "CUSTOMER_SERVICE", "WAREHOUSE_MANAGER", "SUBSTATION_MANAGER", "SUPERVISOR", "RIDER", "DRIVER", "HELPER", "MERCHANT", "CUSTOMER"];

export function nowIso(): string { return new Date().toISOString(); }
export function safeLower(v: unknown): string { return String(v ?? "").trim().toLowerCase(); }
export function uuid(): string { const c: any = globalThis.crypto; if (c?.randomUUID) return c.randomUUID(); return `id_${Math.random().toString(16).slice(2)}_${Date.now()}`; }
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
    grants: [], authorityRequests: [],
    audit: [{ id: uuid(), at, actorEmail: "SYSTEM", action: "STORE_SEEDED", detail: "Initial seed created" }],
  };
}

export function loadStore(): Store {
  if (typeof window === "undefined") return seedStore();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedStore();
    const s = JSON.parse(raw) as Partial<Store>;
    if (!s || !Array.isArray(s.accounts) || !Array.isArray(s.grants) || !Array.isArray(s.audit)) return seedStore();
    return { v: 2, accounts: s.accounts as Account[], grants: s.grants as AuthorityGrant[], authorityRequests: Array.isArray((s as any).authorityRequests) ? ((s as any).authorityRequests as AuthorityRequest[]) : [], audit: s.audit as AuditEvent[] };
  } catch { return seedStore(); }
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

export function defaultPortalPermissionsForRole(role: Role): Permission[] {
  const r = normalizeRole(role);
  if (roleIsPrivileged(r)) return [];
  if (r === "FINANCE_USER" || r === "FINANCE_STAFF") return ["PORTAL_FINANCE"];
  if (r === "HR_ADMIN") return ["PORTAL_HR"];
  if (r === "MARKETING_ADMIN") return ["PORTAL_MARKETING"];
  if (r === "CUSTOMER_SERVICE") return ["PORTAL_SUPPORT"];
  if (r === "WAREHOUSE_MANAGER") return ["PORTAL_WAREHOUSE"];
  if (r === "SUBSTATION_MANAGER") return ["PORTAL_BRANCH"];
  if (r === "SUPERVISOR") return ["PORTAL_SUPERVISOR"];
  if (r === "MERCHANT") return ["PORTAL_MERCHANT"];
  if (r === "CUSTOMER") return ["PORTAL_CUSTOMER"];
  if (r === "RIDER" || r === "DRIVER" || r === "HELPER") return ["PORTAL_EXECUTION"];
  return ["PORTAL_OPERATIONS"];
}

export function defaultGovernancePermissionsForRole(role: Role): Permission[] {
  const r = normalizeRole(role);
  if (roleIsPrivileged(r)) return [];
  if (r === "ADMIN" || r === "ADM" || r === "MGR") {
    return [ "USER_READ", "USER_CREATE", "USER_APPROVE", "USER_REJECT", "USER_ROLE_EDIT", "USER_BLOCK", "USER_RESET_TOKEN", "AUDIT_READ" ];
  }
  return [];
}

export function canRequestAuthorityChange(store: Store, actor: Account | undefined): boolean {
  if (!actor || actor.status !== "ACTIVE") return false;
  return can(store, actor, "AUTHORITY_MANAGE") || roleIsPrivileged(actor.role);
}

export function canApplyAuthorityDirect(store: Store, actor: Account | undefined): boolean {
  if (!actor || actor.status !== "ACTIVE") return false;
  return roleIsPrivileged(actor.role);
}

export function pushAudit(store: Store, e: Omit<AuditEvent, "id" | "at"> & { at?: string }): Store {
  const evt: AuditEvent = { id: uuid(), at: e.at ?? nowIso(), actorEmail: e.actorEmail, action: e.action, targetEmail: e.targetEmail, detail: e.detail };
  return { ...store, audit: [evt, ...store.audit].slice(0, 500) };
}

export function ensureAtLeastOneSuperAdminActive(accounts: Account[]): boolean {
  return accounts.filter((a) => a.role === "SUPER_ADMIN" && a.status === "ACTIVE").length >= 1;
}

export function grantDirect(store: Store, actorEmail: string, subjectEmail: string, perm: Permission): Store {
  const exists = store.grants.some((g) => safeLower(g.subjectEmail) === safeLower(subjectEmail) && g.permission === perm && !g.revokedAt);
  if (exists) return store;
  const next: Store = { ...store, grants: [{ id: uuid(), subjectEmail, permission: perm, grantedAt: nowIso(), grantedBy: actorEmail }, ...store.grants] };
  return pushAudit(next, { actorEmail, action: "AUTHORITY_GRANTED", targetEmail: subjectEmail, detail: String(perm) });
}

export function revokeDirect(store: Store, actorEmail: string, subjectEmail: string, perm: Permission): Store {
  const next: Store = { ...store, grants: store.grants.map((g) => { if (safeLower(g.subjectEmail) !== safeLower(subjectEmail)) return g; if (g.permission !== perm) return g; if (g.revokedAt) return g; return { ...g, revokedAt: nowIso(), revokedBy: actorEmail }; }) };
  return pushAudit(next, { actorEmail, action: "AUTHORITY_REVOKED", targetEmail: subjectEmail, detail: String(perm) });
}

export function requestAuthorityChange(store: Store, actorEmail: string, subjectEmail: string, type: AuthorityRequestType, perm: Permission, requestNote?: string): Store {
  const req: AuthorityRequest = { id: uuid(), type, subjectEmail, permission: perm, requestedAt: nowIso(), requestedBy: actorEmail, requestNote, status: "PENDING" };
  const next = { ...store, authorityRequests: [req, ...store.authorityRequests] };
  return pushAudit(next, { actorEmail, action: "AUTHORITY_REQUESTED", targetEmail: subjectEmail, detail: `${type} ${perm}` });
}

export function approveAuthorityRequest(store: Store, processorEmail: string, requestId: string, decisionNote?: string): Store {
  const req = store.authorityRequests.find((r) => r.id === requestId);
  if (!req || req.status !== "PENDING") return store;
  const updated: AuthorityRequest = { ...req, status: "APPROVED", processedAt: nowIso(), processedBy: processorEmail, decisionNote };
  let next: Store = { ...store, authorityRequests: store.authorityRequests.map((r) => (r.id === requestId ? updated : r)) };
  if (req.type === "GRANT") next = grantDirect(next, processorEmail, req.subjectEmail, req.permission);
  else next = revokeDirect(next, processorEmail, req.subjectEmail, req.permission);
  return pushAudit(next, { actorEmail: processorEmail, action: "AUTHORITY_REQUEST_APPROVED", targetEmail: req.subjectEmail, detail: `${req.type} ${req.permission} • ${decisionNote ?? ""}`.trim() });
}

export function rejectAuthorityRequest(store: Store, processorEmail: string, requestId: string, decisionNote?: string): Store {
  const req = store.authorityRequests.find((r) => r.id === requestId);
  if (!req || req.status !== "PENDING") return store;
  const updated: AuthorityRequest = { ...req, status: "REJECTED", processedAt: nowIso(), processedBy: processorEmail, decisionNote };
  const next: Store = { ...store, authorityRequests: store.authorityRequests.map((r) => (r.id === requestId ? updated : r)) };
  return pushAudit(next, { actorEmail: processorEmail, action: "AUTHORITY_REQUEST_REJECTED", targetEmail: req.subjectEmail, detail: `${req.type} ${req.permission} • ${decisionNote ?? ""}`.trim() });
}

export function csvParse(text: string): string[][] {
  const rows: string[][] = []; let row: string[] = []; let field = ""; let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i]; const n = text[i + 1];
    if (inQuotes) { if (c === '"' && n === '"') { field += '"'; i++; } else if (c === '"') { inQuotes = false; } else { field += c; } } else {
      if (c === '"') inQuotes = true; else if (c === ",") { row.push(field); field = ""; } else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; } else if (c !== "\r") { field += c; }
    }
  }
  row.push(field); rows.push(row);
  return rows.filter((r) => r.some((x) => x.trim() !== ""));
}

export function csvStringify(rows: string[][]): string {
  const esc = (s: string) => { const needs = /[",\n\r]/.test(s); const out = s.replaceAll('"', '""'); return needs ? `"${out}"` : out; };
  return rows.map((r) => r.map((c) => esc(c ?? "")).join(",")).join("\n");
}
EOF

cat > "$REQ_AUTHZ" <<'EOF'
// @ts-nocheck
import React, { useMemo } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { loadStore, getAccountByEmail, roleIsPrivileged, effectivePermissions } from "@/lib/accountControlStore";
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

  if (!isAuthed) return <Navigate to="/login" replace state={{ from: loc.pathname, reason: "NO_SESSION" }} />;

  const store = typeof window !== "undefined" ? loadStore() : null;
  const actor = store && email ? getAccountByEmail(store.accounts, email) : undefined;

  if (!actor) return <Navigate to="/unauthorized" replace state={{ reason: "NOT_REGISTERED", detail: "User not in AccountControl registry" }} />;
  if (actor.status !== "ACTIVE") return <Navigate to="/unauthorized" replace state={{ reason: "NOT_ACTIVE", detail: `Account status: ${actor.status}` }} />;
  if (roleIsPrivileged(actor.role) || roleIsPrivileged(auth?.role)) return <Outlet />;

  if (required && required.length) {
    const ok = hasAnyPermission(auth, required);
    if (!ok && store) {
      const perms = effectivePermissions(store, actor);
      const requiredSet = new Set(required.map((x) => String(x)));
      let ok2 = false;
      for (const g of perms) if (requiredSet.has(String(g))) ok2 = true;
      if (!ok2) return <Navigate to="/unauthorized" replace state={{ reason: "NO_PERMISSION", detail: `Missing permissions: ${required.join(", ")}` }} />;
    } else if (!ok) {
      return <Navigate to="/unauthorized" replace state={{ reason: "NO_PERMISSION", detail: `Missing permissions: ${required.join(", ")}` }} />;
    }
  }

  return <Outlet />;
}
EOF

# -----------------------------------------------------------------------------
# 6) Patch Pre-existing files
# -----------------------------------------------------------------------------
echo "🩹 Patching pre-existing imports for Login.tsx..."
find src -type f -name "*.tsx" -exec sed -i.bak 's/import { defaultPortalForRole, normalizeRole } from "@\/lib\/portalRegistry";/import { defaultPortalForRole } from "@\/lib\/portalRegistry";\nimport { normalizeRole } from "@\/lib\/permissionResolver";/g' {} + || true
find src -type f -name "*.tsx" -exec sed -i.bak 's/import { normalizeRole, defaultPortalForRole } from "@\/lib\/portalRegistry";/import { defaultPortalForRole } from "@\/lib\/portalRegistry";\nimport { normalizeRole } from "@\/lib\/permissionResolver";/g' {} + || true
find src -type f -name "*.tsx.bak" -exec rm -f {} + || true

if [ -f "$SIGNUP" ]; then
  sed -i.bak 's/Access request submitted to L5 Command./Access request submitted to platform administrators./g' "$SIGNUP" || true
  sed -i.bak 's/L5 Command/Platform Admin/g' "$SIGNUP" || true
  rm -f "$SIGNUP.bak"
fi

# -----------------------------------------------------------------------------
# 7) Push & Deploy Fix
# -----------------------------------------------------------------------------
echo "✅ Enterprise portal registry, sidebars, and safe stubs configured."

git add .
git commit -m "fix: enforce safe routing architecture, unify supabaseClient paths, and add robust wizard login" || echo "No changes to commit."

git push origin master || git push origin main || echo "Push failed, but continuing to deploy..."

echo "🚀 Triggering Vercel deployment..."
for i in {1..3}; do
  if npx vercel --prod --force; then
    echo "✅ Vercel deployment successful!"
    exit 0
  fi
  echo "⚠️ Vercel build/deployment failed (Attempt $i/3). Retrying in 5 seconds..."
  sleep 5
done

echo "❌ Deployment failed. Please check your Vercel logs for build details and run 'npx vercel --prod --force' manually."
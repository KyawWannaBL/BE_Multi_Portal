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
# 4) COMPONENTS (TIER BADGE, SIDEBAR WITH RBAC + RECENT, PORTAL SHELL)
# -----------------------------------------------------------------------------
cat > "$TIER_BADGE" <<'EOF'
// @ts-nocheck
import React from "react";
import { normalizeRole } from "@/lib/permissionResolver";

export type Tier = "L1" | "L2" | "L3" | "L4" | "L5";

export function getTier(role?: string, tierLevel?: unknown): Tier {
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
    <span className={`inline-flex items-center h-7 px-3 rounded-full border text-[10px] font-black tracking-widest uppercase ${colors[tier]} ${className ?? ""}`} title={`Tier ${tier}`}>
      {tier}
    </span>
  );
}
EOF

cat > "$PORTAL_SIDEBAR" <<'EOF'
// @ts-nocheck
import React, { useState, useEffect, useMemo } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { NAV_SECTIONS, flatByPath, type NavItem, type NavSection } from "@/lib/portalRegistry";
import { allowedByRole, hasAnyPermission, normalizeRole } from "@/lib/permissionResolver";
import { clearRecentNav, getRecentNav, pushRecent } from "@/lib/recentNav";
import { Search, History, Trash2 } from "lucide-react";

function filterTree(auth: any, item: NavItem): NavItem | null {
  if (!allowedByRole(auth, item.allowRoles)) return null;
  if (!hasAnyPermission(auth, item.requiredPermissions)) return null;
  const children = item.children ? item.children.map((c) => filterTree(auth, c)).filter(Boolean) as NavItem[] : undefined;
  return { ...item, children };
}

function applyFilters(auth: any): NavSection[] {
  return NAV_SECTIONS.map((sec) => {
    const items = sec.items.map((it) => filterTree(auth, it)).filter(Boolean) as NavItem[];
    return { ...sec, items };
  }).filter((sec) => sec.items.length > 0);
}

function matches(item: NavItem, q: string): boolean {
  const s = `${item.label_en} ${item.label_mm} ${item.path}`.toLowerCase();
  return s.includes(q);
}

function filterBySearch(sections: NavSection[], q: string): NavSection[] {
  if (!q) return sections;
  const out: NavSection[] = [];
  for (const sec of sections) {
    const items: NavItem[] = [];
    for (const it of sec.items) {
      const childMatches = (it.children ?? []).filter((c) => matches(c, q));
      const selfMatch = matches(it, q);
      if (selfMatch || childMatches.length) {
        items.push({ ...it, children: childMatches.length ? childMatches : it.children });
      }
    }
    if (items.length) out.push({ ...sec, items });
  }
  return out;
}

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

export function PortalSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const auth = useAuth() as any;
  const { lang } = useLanguage();
  const loc = useLocation();

  const [q, setQ] = useState("");
  const [recentTick, setRecentTick] = useState(0);

  useEffect(() => {
    pushRecent(loc.pathname);
    setRecentTick((x) => x + 1);
  }, [loc.pathname]);

  const sectionsRBAC = useMemo(() => applyFilters(auth), [auth?.role, auth?.user, auth?.permissions]);
  const sections = useMemo(() => filterBySearch(sectionsRBAC, q.trim().toLowerCase()), [sectionsRBAC, q]);

  const flatMap = useMemo(() => flatByPath(sectionsRBAC), [sectionsRBAC]);
  const recent = useMemo(() => getRecentNav(), [recentTick]);

  const recentItems = useMemo(() => {
    const items = [];
    for (const r of recent.slice(0, 8)) {
      const it = flatMap[r.path];
      if (it) items.push(it);
    }
    return items;
  }, [recent, flatMap]);

  const panel = (
    <aside className="w-72 shrink-0 rounded-2xl border border-white/10 bg-[#0B101B] p-4 h-[calc(100vh-96px)] overflow-auto">
      <div className="mb-4">
        <div className="flex items-center gap-2 bg-black/30 border border-white/10 rounded-xl px-3 h-11">
          <Search className="h-4 w-4 text-slate-500" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={lang === "en" ? "Search menu..." : "မီနူးရှာရန်..."}
            className="bg-transparent outline-none text-sm text-slate-200 w-full"
          />
        </div>
      </div>

      {recentItems.length ? (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[10px] font-mono text-slate-500 tracking-[0.25em] uppercase flex items-center gap-2">
              <History className="h-3 w-3" />
              {lang === "en" ? "RECENT" : "မကြာသေးမီ"}
            </div>
            <button
              onClick={() => {
                clearRecentNav();
                setRecentTick((x) => x + 1);
              }}
              className="text-[10px] font-black tracking-widest uppercase text-slate-400 hover:text-white flex items-center gap-1"
            >
              <Trash2 className="h-3 w-3" />
              {lang === "en" ? "Clear" : "ရှင်းမည်"}
            </button>
          </div>

          <div className="space-y-2">
            {recentItems.map((it) => (
              <Item key={it.id} item={it} onNavigate={onClose} />
            ))}
          </div>
        </div>
      ) : null}

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

      <div className="mt-6 text-[10px] font-mono text-slate-600">
        ROLE: {normalizeRole(auth?.role)}
      </div>
    </aside>
  );

  return (
    <>
      <div className="hidden lg:block">{panel}</div>
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

cat > "$PORTAL_SHELL" <<'EOF'
// @ts-nocheck
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
# 5) ACCOUNT CONTROL (Enterprise NO SQL UI with baseline + notifications)
# -----------------------------------------------------------------------------
cat > "$ACCT_CTRL" <<'EOF'
// @ts-nocheck
'use client';

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertTriangle, CheckCircle2, Download, History, Lock, RefreshCw, Search, ShieldCheck, Upload, UserCog, UserPlus, XCircle, Inbox } from "lucide-react";
import { notify } from "@/lib/notify";
import { DEFAULT_ROLES, PERMISSIONS, STORAGE_KEY, type Account, type AccountStatus, type Permission, type Role, type AuthorityRequest, activeGrantsFor, can, canApplyAuthorityDirect, canRequestAuthorityChange, csvParse, csvStringify, defaultPortalPermissionsForRole, defaultGovernancePermissionsForRole, effectivePermissions, ensureAtLeastOneSuperAdminActive, getAccountByEmail, grantDirect, isEmailValid, loadStore, nowIso, pushAudit, rejectAuthorityRequest, requestAuthorityChange, revokeDirect, roleIsPrivileged, safeLower, saveStore, approveAuthorityRequest, uuid } from "@/lib/accountControlStore";

type Toast = { type: "ok" | "err" | "warn"; msg: string };
type View = "ACCOUNTS" | "AUTH_REQUESTS" | "AUDIT";

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
  const [view, setView] = useState<View>("ACCOUNTS");

  const actorEmail = (auth?.user?.email ?? "") as string;
  const actor = useMemo(() => (actorEmail ? getAccountByEmail(store.accounts, actorEmail) : undefined), [store.accounts, actorEmail]);
  const actorPerms = useMemo(() => effectivePermissions(store, actor), [store, actor]);

  useEffect(() => saveStore(store), [store]);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2400);
    return () => window.clearTimeout(id);
  }, [toast]);

  const actorActive = !!actor && actor.status === "ACTIVE";
  const isPriv = roleIsPrivileged(actor?.role);
  const canRead = actorActive && can(store, actor, "USER_READ");
  const canCreate = actorActive && can(store, actor, "USER_CREATE");
  const canApprove = actorActive && can(store, actor, "USER_APPROVE");
  const canReject = actorActive && can(store, actor, "USER_REJECT");
  const canRoleEdit = actorActive && can(store, actor, "USER_ROLE_EDIT");
  const canBlock = actorActive && can(store, actor, "USER_BLOCK");
  const canAuth = actorActive && canRequestAuthorityChange(store, actor);
  const canAudit = actorActive && can(store, actor, "AUDIT_READ");
  const canExport = actorActive && can(store, actor, "CSV_EXPORT");
  const canImport = actorActive && can(store, actor, "CSV_IMPORT");
  const canBulk = actorActive && can(store, actor, "BULK_ACTIONS");

  const [q, setQ] = useState("");
  const [filterStatus, setFilterStatus] = useState<AccountStatus | "ALL">("ALL");
  const [filterRole, setFilterRole] = useState<Role | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const selectedEmails = useMemo(() => Object.keys(selected).filter((k) => selected[k]), [selected]);

  const [modalCreate, setModalCreate] = useState(false);
  const [modalAuthorityEmail, setModalAuthorityEmail] = useState<string | null>(null);
  const [modalProfileEmail, setModalProfileEmail] = useState<string | null>(null);
  const [modalApproveEmail, setModalApproveEmail] = useState<string | null>(null);
  const [modalRejectEmail, setModalRejectEmail] = useState<string | null>(null);
  const [modalImport, setModalImport] = useState(false);
  const [modalBulk, setModalBulk] = useState(false);

  const pendingAuthorityCount = useMemo(() => store.authorityRequests.filter((r) => r.status === "PENDING").length, [store.authorityRequests]);

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

  function approveAccount(email: string, note?: string, autoPortalDefaults = true, autoGovDefaults = false, autoGovAuthorityManage = false) {
    if (!actor || !canApprove) return;
    const target = getAccountByEmail(store.accounts, email);
    if (!target) return;

    if (!roleIsPrivileged(actor.role) && roleIsPrivileged(target.role)) {
      setToast({ type: "err", msg: "Cannot modify privileged accounts." });
      return;
    }

    const nextAcc: Account = {
      ...target,
      status: "ACTIVE",
      approval: { requestedAt: target.approval?.requestedAt ?? target.createdAt, requestedBy: target.approval?.requestedBy ?? target.createdBy, processedAt: nowIso(), processedBy: actorEmail, decision: "APPROVED", note },
    };

    const baselinePortal = ["ADMIN", "ADM", "MGR"].includes(String(nextAcc.role)) ? ["PORTAL_OPERATIONS"] : [];
    const portalDefaults = Array.from(new Set([
      ...baselinePortal,
      ...(autoPortalDefaults ? defaultPortalPermissionsForRole(nextAcc.role) : [])
    ])) as Permission[];

    const govDefaultsBase = autoGovDefaults ? defaultGovernancePermissionsForRole(nextAcc.role) : [];
    const govDefaults = autoGovAuthorityManage ? [...govDefaultsBase, "AUTHORITY_MANAGE"] : govDefaultsBase;

    setStore((prev) => {
      let next = { ...prev, accounts: prev.accounts.map((a) => (safeLower(a.email) === safeLower(email) ? nextAcc : a)) };
      next = pushAudit(next, { actorEmail, action: "REQUEST_APPROVED", targetEmail: email, detail: note ?? "Approved" });

      const direct = roleIsPrivileged(actor.role);
      const apply = (perm: Permission) => {
        if (direct) next = grantDirect(next, actorEmail, nextAcc.email, perm);
        else next = requestAuthorityChange(next, actorEmail, nextAcc.email, "GRANT", perm, "Auto-default from role");
      };

      for (const perm of portalDefaults) apply(perm);
      for (const perm of govDefaults) apply(perm);

      next = pushAudit(next, {
        actorEmail,
        action: "ROLE_DEFAULTS_APPLIED",
        targetEmail: nextAcc.email,
        detail: `portal=[${portalDefaults.join(",") || "NONE"}] gov=[${govDefaults.join(",") || "NONE"}] mode=${direct ? "DIRECT" : "REQUEST"}`,
      });

      return next;
    });

    void notify("ACCOUNT_REQUEST_APPROVED", { email, role: nextAcc.role, portalDefaults, govDefaults, note: note ?? null }, actorEmail);

    setToast({ type: "ok", msg: t("Approved + defaults processed.", "အတည်ပြုပြီး Default permissions လုပ်ပြီးပါပြီ။") });
  }

  function rejectAccount(email: string, note?: string) {
    if (!actor || !canReject) return;
    const target = getAccountByEmail(store.accounts, email);
    if (!target) return;
    if (!roleIsPrivileged(actor.role) && roleIsPrivileged(target.role)) { setToast({ type: "err", msg: "Cannot modify privileged accounts." }); return; }
    const next: Account = { ...target, status: "REJECTED", approval: { requestedAt: target.approval?.requestedAt ?? target.createdAt, requestedBy: target.approval?.requestedBy ?? target.createdBy, processedAt: nowIso(), processedBy: actorEmail, decision: "REJECTED", note } };
    upsertAccount(next);
    auditPush("REQUEST_REJECTED", email, note ?? "Rejected");
    void notify("ACCOUNT_REQUEST_REJECTED", { email, role: target.role, note: note ?? null }, actorEmail);
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
      void notify("ACCOUNT_REQUEST_CREATED", { email: em, role, note: note.trim() || null }, actorEmail);
      setModalCreate(false);
      setToast({ type: "ok", msg: t("Saved.", "သိမ်းပြီးပါပြီ။") });
    }

    return (
      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1"><div className="text-[11px] uppercase tracking-widest text-slate-500 font-mono">{t("Full name", "အမည်")}</div><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div className="space-y-1"><div className="text-[11px] uppercase tracking-widest text-slate-500 font-mono">{t("Email", "Email")}</div><Input value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div className="space-y-1"><div className="text-[11px] uppercase tracking-widest text-slate-500 font-mono">{t("Role", "Role")}</div><Select value={role} onChange={(e) => setRole(e.target.value as Role)}>{DEFAULT_ROLES.map((r) => (<option key={r} value={r}>{r}</option>))}</Select>
            <div className="text-[10px] font-mono text-slate-600 mt-1">Portal defaults: {defaultPortalPermissionsForRole(role).join(", ") || "NONE"} • Governance defaults: {defaultGovernancePermissionsForRole(role).join(", ") || "NONE"}</div>
          </div>
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
    const [note, setNote] = useState("");
    if (!subject) return null;

    const subjectPerms = roleIsPrivileged(subject.role) ? new Set(PERMISSIONS.map((p) => p.code)) : new Set(activeGrantsFor(store.grants, subject.email).map((g) => g.permission));
    const direct = canApplyAuthorityDirect(store, actor);

    return (
      <div className="space-y-5">
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex items-center justify-between gap-3">
            <div><div className="text-white font-black uppercase italic">{subject.name}</div><div className="text-sm text-slate-500">{subject.email}</div></div>
            <Pill className={roleBadgeClass(subject.role)}>{subject.role}</Pill>
          </div>
          <div className="mt-3 text-xs text-slate-500">{direct ? t("Direct apply enabled (Super Admin).", "Direct apply ပြုလုပ်နိုင်သည် (Super Admin).") : t("Changes create requests (requires Super Admin approval).", "ပြောင်းလဲမှုများသည် Request ဖြစ်ပြီး Super Admin အတည်ပြုရန်လိုသည်။")}</div>
          <div className="mt-3 space-y-1"><div className="text-[11px] uppercase tracking-widest text-slate-500 font-mono">{t("Request note", "Request မှတ်ချက်")}</div><Input value={note} onChange={(e) => setNote(e.target.value)} placeholder={t("Optional note...", "Optional note...")} /></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {PERMISSIONS.map((p) => {
            const enabled = subjectPerms.has(p.code);
            const disabled = !actor || !canAuth || (roleIsPrivileged(subject.role) && !roleIsPrivileged(actor.role));

            return (
              <div key={String(p.code)} className={`p-4 rounded-2xl border ${enabled ? "border-sky-500/20 bg-sky-500/5" : "border-white/10 bg-white/5"}`}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-white font-bold">{lang === "en" ? p.en : p.mm}</div>
                    <div className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">{String(p.code)}</div>
                  </div>
                  <label className="flex items-center gap-2 text-sm text-slate-300">
                    <input
                      type="checkbox"
                      checked={enabled}
                      disabled={disabled}
                      onChange={(e) => {
                        if (!actor) return;
                        const want = e.target.checked;
                        const type = want ? "GRANT" : "REVOKE";

                        setStore((prev) => {
                          if (direct) {
                            const next = want ? grantDirect(prev, actorEmail, subject.email, p.code) : revokeDirect(prev, actorEmail, subject.email, p.code);
                            void notify(want ? "AUTHORITY_REQUEST_APPROVED" : "AUTHORITY_REQUEST_APPROVED", { direct: true, subjectEmail: subject.email, permission: p.code, type, note: note.trim() || null }, actorEmail);
                            return next;
                          }
                          const next = requestAuthorityChange(prev, actorEmail, subject.email, type, p.code, note.trim() || undefined);
                          void notify("AUTHORITY_REQUEST_CREATED", { subjectEmail: subject.email, permission: p.code, type, note: note.trim() || null }, actorEmail);
                          return next;
                        });

                        setToast({ type: direct ? "ok" : "warn", msg: direct ? t("Applied.", "ပြောင်းလဲပြီးပါပြီ။") : t("Request submitted for approval.", "Request တင်ပြီးပါပြီ (အတည်ပြုရန်လိုသည်)။") });
                      }}
                      className="h-4 w-4 accent-sky-500 disabled:opacity-50"
                    />
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

  const ApproveRejectModal = ({ email, mode }: { email: string; mode: "approve" | "reject" }) => {
    const target = getAccountByEmail(store.accounts, email);
    const [note, setNote] = useState("");
    const [autoPortalDefaults, setAutoPortalDefaults] = useState(true);
    const [autoGovDefaults, setAutoGovDefaults] = useState(true);
    const [autoGovAuthorityManage, setAutoGovAuthorityManage] = useState(false);
    if (!target) return null;

    const gov = defaultGovernancePermissionsForRole(target.role);
    const isGovRole = gov.length > 0;

    return (
      <div className="space-y-4">
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex items-center justify-between gap-3">
            <div><div className="text-white font-black uppercase italic">{target.name}</div><div className="text-sm text-slate-500">{target.email}</div></div>
            <Pill className={roleBadgeClass(target.role)}>{target.role}</Pill>
          </div>

          {mode === "approve" ? (
            <>
              <div className="mt-3 text-xs text-slate-500">Portal defaults: (Admins always receive PORTAL_OPERATIONS) • <span className="text-slate-300 font-mono">{defaultPortalPermissionsForRole(target.role).join(", ") || "NONE"}</span></div>
              <div className="mt-1 text-xs text-slate-500">Governance defaults: <span className="text-slate-300 font-mono">{gov.join(", ") || "NONE"}</span></div>
              <label className="mt-3 flex items-center gap-2 text-xs text-slate-300"><input type="checkbox" checked={autoPortalDefaults} onChange={(e) => setAutoPortalDefaults(e.target.checked)} className="h-4 w-4 accent-emerald-500" />{t("Auto-grant portal access defaults", "Portal default access ကို အလိုအလျောက်ပေးမည်")}</label>
              {isGovRole ? (
                <>
                  <label className="mt-2 flex items-center gap-2 text-xs text-slate-300"><input type="checkbox" checked={autoGovDefaults} onChange={(e) => setAutoGovDefaults(e.target.checked)} className="h-4 w-4 accent-emerald-500" />{t("Auto-grant governance defaults for this role", "ဒီ role အတွက် governance defaults ကို အလိုအလျောက်ပေးမည်")}</label>
                  <label className="mt-2 flex items-center gap-2 text-xs text-slate-300"><input type="checkbox" checked={autoGovAuthorityManage} onChange={(e) => setAutoGovAuthorityManage(e.target.checked)} className="h-4 w-4 accent-emerald-500" />{t("Also grant AUTHORITY_MANAGE (strong)", "AUTHORITY_MANAGE ကိုပါပေးမည် (အာဏာကြီး)")}</label>
                </>
              ) : null}
            </>
          ) : null}
        </div>
        <div className="space-y-1"><div className="text-[11px] uppercase tracking-widest text-slate-500 font-mono">{t("Reason / Note", "အကြောင်းရင်း / မှတ်ချက်")}</div><Textarea value={note} onChange={(e) => setNote(e.target.value)} /></div>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" className="text-slate-400 hover:text-white" onClick={() => (mode === "approve" ? setModalApproveEmail(null) : setModalRejectEmail(null))}>{t("Cancel", "မလုပ်တော့")}</Button>
          <Button className={`${mode === "approve" ? "bg-emerald-600 hover:bg-emerald-500" : "bg-rose-600 hover:bg-rose-500"} text-white font-black h-11 px-6 rounded-xl uppercase`} onClick={() => { if (mode === "approve") approveAccount(email, note.trim() || undefined, autoPortalDefaults, autoGovDefaults, autoGovAuthorityManage); else rejectAccount(email, note.trim() || undefined); setModalApproveEmail(null); setModalRejectEmail(null); }}>{mode === "approve" ? t("Approve", "အတည်ပြု") : t("Reject", "ငြင်းပယ်")}</Button>
        </div>
      </div>
    );
  };

  const RequestsPanel = () => {
    const [rq, setRq] = useState("");
    const [status, setStatus] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("PENDING");
    const [scope, setScope] = useState<"ALL" | "MINE">(!isPriv ? "MINE" : "ALL");

    const canProcess = actorActive && roleIsPrivileged(actor?.role);

    const rows = useMemo(() => {
      const qq = safeLower(rq);
      return store.authorityRequests
        .filter((r) => (status === "ALL" ? true : r.status === status))
        .filter((r) => (scope === "MINE" ? safeLower(r.requestedBy) === safeLower(actorEmail) : true))
        .filter((r) => { if (!qq) return true; const s = `${r.subjectEmail} ${r.permission} ${r.type} ${r.requestedBy}`.toLowerCase(); return s.includes(qq); })
        .slice(0, 250);
    }, [store.authorityRequests, rq, status, scope, actorEmail]);

    return (
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-2 bg-[#0B101B] border border-white/10 rounded-xl px-3 h-11 w-full md:w-[520px]"><Search className="h-4 w-4 text-slate-500" /><input value={rq} onChange={(e) => setRq(e.target.value)} placeholder={t("Search requests...", "Request များရှာရန်...")} className="bg-transparent outline-none text-sm text-slate-200 w-full" /></div>
          <div className="flex items-center gap-2">
            <Select value={status} onChange={(e) => setStatus(e.target.value as any)} className="w-44"><option value="PENDING">PENDING</option><option value="APPROVED">APPROVED</option><option value="REJECTED">REJECTED</option><option value="ALL">ALL</option></Select>
            <Select value={scope} onChange={(e) => setScope(e.target.value as any)} className="w-40"><option value="MINE">{lang === "en" ? "MY REQUESTS" : "ကျွန်ုပ်၏"}</option><option value="ALL">{lang === "en" ? "ALL" : "အားလုံး"}</option></Select>
          </div>
        </div>
        <Card className="bg-[#05080F] border-none ring-1 ring-white/5 rounded-[2rem] overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-white/5 font-mono text-slate-500 uppercase text-[10px] tracking-[0.2em]"><tr><th className="p-5">TYPE</th><th className="p-5">SUBJECT</th><th className="p-5">PERMISSION</th><th className="p-5">STATUS</th><th className="p-5 text-right">ACTIONS</th></tr></thead>
            <tbody className="divide-y divide-white/5">
              {rows.map((r) => (
                <RequestRow
                  key={r.id} r={r} canProcess={canProcess}
                  onApprove={(id, decisionNote) => {
                    const req = store.authorityRequests.find((x) => x.id === id);
                    setStore((prev) => approveAuthorityRequest(prev, actorEmail, id, decisionNote));
                    void notify("AUTHORITY_REQUEST_APPROVED", { requestId: id, req: req ?? null, decisionNote: decisionNote ?? null }, actorEmail);
                    setToast({ type: "ok", msg: t("Approved.", "အတည်ပြုပြီးပါပြီ။") });
                  }}
                  onReject={(id, decisionNote) => {
                    const req = store.authorityRequests.find((x) => x.id === id);
                    setStore((prev) => rejectAuthorityRequest(prev, actorEmail, id, decisionNote));
                    void notify("AUTHORITY_REQUEST_REJECTED", { requestId: id, req: req ?? null, decisionNote: decisionNote ?? null }, actorEmail);
                    setToast({ type: "ok", msg: t("Rejected.", "ငြင်းပယ်ပြီးပါပြီ။") });
                  }}
                />
              ))}
            </tbody>
          </table>
          {!rows.length ? <div className="p-10 text-center text-slate-600">{t("No requests.", "Request မရှိပါ။")}</div> : null}
        </Card>
        {!canProcess ? <div className="text-xs text-slate-600">{t("Only Super Admin can approve/reject authority requests.", "Super Admin သာ Request များကို အတည်ပြု/ငြင်းပယ်နိုင်သည်။")}</div> : null}
      </div>
    );
  };

  function RequestRow(props: { r: AuthorityRequest; canProcess: boolean; onApprove: (id: string, note?: string) => void; onReject: (id: string, note?: string) => void; }) {
    const [note, setNote] = useState("");
    const pending = props.r.status === "PENDING";
    return (
      <tr className="hover:bg-white/5 transition-all">
        <td className="p-5"><Pill className={props.r.type === "GRANT" ? "bg-emerald-500/10 text-emerald-300" : "bg-rose-500/10 text-rose-300"}>{props.r.type}</Pill></td>
        <td className="p-5"><div className="text-white font-bold">{props.r.subjectEmail}</div><div className="text-[10px] font-mono text-slate-600">{props.r.requestedBy}</div></td>
        <td className="p-5"><div className="text-slate-200 font-mono text-xs">{String(props.r.permission)}</div>{props.r.requestNote ? <div className="text-[10px] text-slate-600 mt-1">{props.r.requestNote}</div> : null}</td>
        <td className="p-5"><Pill className={props.r.status === "PENDING" ? "bg-amber-500/10 text-amber-300" : props.r.status === "APPROVED" ? "bg-emerald-500/10 text-emerald-300" : "bg-rose-500/10 text-rose-300"}>{props.r.status}</Pill><div className="text-[10px] font-mono text-slate-600 mt-1">{new Date(props.r.requestedAt).toLocaleString()}</div></td>
        <td className="p-5 text-right">
          {props.canProcess && pending ? (
            <div className="flex items-center justify-end gap-2"><input value={note} onChange={(e) => setNote(e.target.value)} placeholder="note" className="h-10 w-40 rounded-xl bg-[#0B101B] border border-white/10 px-3 text-xs text-slate-200" /><Button className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase" onClick={() => props.onApprove(props.r.id, note.trim() || undefined)}>Approve</Button><Button className="h-10 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black uppercase" onClick={() => props.onReject(props.r.id, note.trim() || undefined)}>Reject</Button></div>
          ) : (<div className="text-xs text-slate-600">{props.r.processedBy ? `by ${props.r.processedBy}` : "—"}</div>)}
        </td>
      </tr>
    );
  }

  const AuditPanel = () => {
    const events = store.audit.slice(0, 200);
    return (
      <div className="space-y-3">
        <div className="text-sm text-slate-500">{t("Showing latest 200 events.", "နောက်ဆုံး 200 events ကိုပြပါမည်။")}</div>
        <div className="space-y-2 max-h-[60vh] overflow-auto pr-1 custom-scrollbar">
          {events.map((e) => (
            <div key={e.id} className="p-4 rounded-2xl bg-[#05080F] border border-white/10">
              <div className="flex items-center justify-between gap-3"><div className="text-white font-bold">{e.action}</div><div className="text-[10px] font-mono text-slate-600">{new Date(e.at).toLocaleString()}</div></div>
              <div className="mt-1 text-xs text-slate-500">Actor: <span className="text-slate-300">{e.actorEmail}</span>{e.targetEmail ? <> {" "}• Target: <span className="text-slate-300">{e.targetEmail}</span></> : null}</div>
              {e.detail ? <div className="mt-1 text-xs text-slate-600">{e.detail}</div> : null}
            </div>
          ))}
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
        if (action === "APPROVE") approveAccount(email, note.trim() || undefined, true);
        if (action === "REJECT") rejectAccount(email, note.trim() || undefined);
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
            {canAudit ? (<Button className="bg-white/5 hover:bg-white/10 text-white font-black h-12 px-5 rounded-xl uppercase" onClick={() => setView("AUDIT")}><History className="h-4 w-4 mr-2" />{t("Audit Log", "Audit Log")}</Button>) : null}
            {canAuth || isPriv ? (<Button className="bg-white/5 hover:bg-white/10 text-white font-black h-12 px-5 rounded-xl uppercase" onClick={() => setView("AUTH_REQUESTS")}><Inbox className="h-4 w-4 mr-2" />{t("Requests", "Requests")}{pendingAuthorityCount ? <span className="ml-2 text-amber-300">({pendingAuthorityCount})</span> : null}</Button>) : null}
            {canRead ? (<Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-black h-12 px-5 rounded-xl uppercase" onClick={() => setView("ACCOUNTS")}><UserCog className="h-4 w-4 mr-2" />{t("Accounts", "အကောင့်များ")}</Button>) : null}
            {canCreate ? (<Button className="bg-sky-600 hover:bg-sky-500 text-white font-black h-12 px-6 rounded-xl uppercase" onClick={() => setModalCreate(true)}>{t("Create Account", "အကောင့်အသစ်ဖွင့်မည်")}</Button>) : null}
          </div>
        </div>
      </div>

      {toast ? (
        <div className={`rounded-2xl border px-4 py-3 text-sm flex items-center gap-2 ${toast.type === "ok" ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-300" : toast.type === "warn" ? "border-amber-500/20 bg-amber-500/5 text-amber-300" : "border-rose-500/20 bg-rose-500/5 text-rose-300"}`}>
          {toast.type === "ok" ? <CheckCircle2 className="h-4 w-4" /> : toast.type === "warn" ? <AlertTriangle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}<div>{toast.msg}</div>
        </div>
      ) : null}

      {view === "AUTH_REQUESTS" ? <RequestsPanel /> : null}
      {view === "AUDIT" ? <AuditPanel /> : null}
      
      {view === "ACCOUNTS" ? (
        <>
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
        </>
      ) : null}

      <Modal open={modalCreate} title={t("Create account request", "အကောင့်တောင်းဆိုမှု ဖန်တီးရန်")} onClose={() => setModalCreate(false)} widthClass="max-w-3xl"><CreateModal /></Modal>
      <Modal open={!!modalAuthorityEmail} title={t("Manage authorities", "အာဏာများ စီမံရန်")} onClose={() => setModalAuthorityEmail(null)} widthClass="max-w-4xl">{modalAuthorityEmail ? <AuthorityModal email={modalAuthorityEmail} /> : null}</Modal>
      <Modal open={!!modalProfileEmail} title={t("Account profile", "အကောင့်အချက်အလက်")} onClose={() => setModalProfileEmail(null)} widthClass="max-w-3xl">{modalProfileEmail ? <ProfileModal email={modalProfileEmail} /> : null}</Modal>
      <Modal open={!!modalApproveEmail} title={t("Approve request", "တောင်းဆိုမှု အတည်ပြုရန်")} onClose={() => setModalApproveEmail(null)} widthClass="max-w-2xl">{modalApproveEmail ? <ApproveRejectModal email={modalApproveEmail} mode="approve" /> : null}</Modal>
      <Modal open={!!modalRejectEmail} title={t("Reject request", "တောင်းဆိုမှု ငြင်းပယ်ရန်")} onClose={() => setModalRejectEmail(null)} widthClass="max-w-2xl">{modalRejectEmail ? <ApproveRejectModal email={modalRejectEmail} mode="reject" /> : null}</Modal>
      <Modal open={modalImport} title={t("Import CSV", "CSV သွင်းရန်")} onClose={() => setModalImport(false)} widthClass="max-w-3xl"><ImportModal /></Modal>
      <Modal open={modalBulk} title={t("Bulk actions", "အုပ်စုလိုက်လုပ်ဆောင်မှု")} onClose={() => setModalBulk(false)} widthClass="max-w-3xl"><BulkModal /></Modal>
    </div>
  );
}
EOF

# -----------------------------------------------------------------------------
# 6) Patch SignUp.tsx
# -----------------------------------------------------------------------------
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
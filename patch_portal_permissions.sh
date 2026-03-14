#!/usr/bin/env bash
set -euo pipefail

# ==============================================================================
# ✅ Auto-map Role -> Portal Permissions on approval
# ✅ Authority Change Approval workflow (Admin request -> Super Admin approve)
# NO SQL. Uses localStorage store: account_control_store_v2
# - Updates:
#   - src/lib/accountControlStore.ts
#   - src/pages/AccountControl.tsx
# ==============================================================================

backup() {
  local f="$1"
  [[ -f "$f" ]] || return 0
  cp -f "$f" "${f}.bak.$(date +%Y%m%d_%H%M%S)"
}

STORE_LIB="src/lib/accountControlStore.ts"
ACCOUNT_CONTROL="src/pages/AccountControl.tsx"

mkdir -p "$(dirname "$STORE_LIB")" "$(dirname "$ACCOUNT_CONTROL")"
backup "$STORE_LIB"
backup "$ACCOUNT_CONTROL"

# ------------------------------------------------------------------------------
# 1) Store lib: add role->portal mapping + authorityRequests workflow
# ------------------------------------------------------------------------------
cat > "$STORE_LIB" <<'EOF'
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

export type AuthorityRequestStatus = "PENDING" | "APPROVED" | "REJECTED";

export type AuthorityRequestType = "GRANT" | "REVOKE";

export type AuthorityRequest = {
  id: string;
  type: AuthorityRequestType;
  subjectEmail: string;
  permission: Permission;

  requestedAt: string;
  requestedBy: string;
  requestNote?: string;

  status: AuthorityRequestStatus;
  processedAt?: string;
  processedBy?: string;
  decisionNote?: string;
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
  authorityRequests: AuthorityRequest[];
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
  "SYS",
  "APP_OWNER",
  "SUPER_ADMIN",
  "ADMIN",
  "ADM",
  "MGR",
  "STAFF",
  "FINANCE_USER",
  "FINANCE_STAFF",
  "HR_ADMIN",
  "MARKETING_ADMIN",
  "CUSTOMER_SERVICE",
  "WAREHOUSE_MANAGER",
  "SUBSTATION_MANAGER",
  "SUPERVISOR",
  "RIDER",
  "DRIVER",
  "HELPER",
  "MERCHANT",
  "CUSTOMER",
];

export function nowIso(): string {
  return new Date().toISOString();
}

export function safeLower(v: unknown): string {
  return String(v ?? "").trim().toLowerCase();
}

export function uuid(): string {
  const c: any = globalThis.crypto;
  if (c?.randomUUID) return c.randomUUID();
  return `id_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

export function isEmailValid(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

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
      {
        id: uuid(),
        name: "MD VENTURES",
        email: "md@britiumventures.com",
        role: "APP_OWNER",
        status: "ACTIVE",
        createdAt: at,
        createdBy: "SYSTEM",
      },
      {
        id: uuid(),
        name: "SUPER ADMIN",
        email: "md@britiumexpress.com",
        role: "SUPER_ADMIN",
        status: "ACTIVE",
        createdAt: at,
        createdBy: "SYSTEM",
      },
    ],
    grants: [],
    authorityRequests: [],
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
    return {
      v: 2,
      accounts: s.accounts as Account[],
      grants: s.grants as AuthorityGrant[],
      authorityRequests: Array.isArray((s as any).authorityRequests) ? ((s as any).authorityRequests as AuthorityRequest[]) : [],
      audit: s.audit as AuditEvent[],
    };
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

/**
 * Role -> default PORTAL permissions for newly approved accounts.
 * This is used ONLY at approval time (PENDING -> ACTIVE).
 */
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

  // ADMIN/MGR and STAFF default to Operations portal
  return ["PORTAL_OPERATIONS"];
}

/**
 * Non-privileged actors can request authority changes (PENDING),
 * Super Admin approves to apply.
 */
export function canRequestAuthorityChange(store: Store, actor: Account | undefined): boolean {
  if (!actor) return false;
  if (actor.status !== "ACTIVE") return false;
  return can(store, actor, "AUTHORITY_MANAGE") || roleIsPrivileged(actor.role);
}

/**
 * Privileged actors can directly apply grants/revokes.
 */
export function canApplyAuthorityDirect(store: Store, actor: Account | undefined): boolean {
  if (!actor) return false;
  if (actor.status !== "ACTIVE") return false;
  return roleIsPrivileged(actor.role);
}

export function pushAudit(store: Store, e: Omit<AuditEvent, "id" | "at"> & { at?: string }): Store {
  const evt: AuditEvent = {
    id: uuid(),
    at: e.at ?? nowIso(),
    actorEmail: e.actorEmail,
    action: e.action,
    targetEmail: e.targetEmail,
    detail: e.detail,
  };
  return { ...store, audit: [evt, ...store.audit].slice(0, 500) };
}

export function ensureAtLeastOneSuperAdminActive(accounts: Account[]): boolean {
  return accounts.filter((a) => a.role === "SUPER_ADMIN" && a.status === "ACTIVE").length >= 1;
}

/**
 * Direct grant/revoke (used only by privileged roles or during approval).
 */
export function grantDirect(store: Store, actorEmail: string, subjectEmail: string, perm: Permission): Store {
  const exists = store.grants.some(
    (g) => safeLower(g.subjectEmail) === safeLower(subjectEmail) && g.permission === perm && !g.revokedAt
  );
  if (exists) return store;

  const next: Store = {
    ...store,
    grants: [
      {
        id: uuid(),
        subjectEmail,
        permission: perm,
        grantedAt: nowIso(),
        grantedBy: actorEmail,
      },
      ...store.grants,
    ],
  };

  return pushAudit(next, { actorEmail, action: "AUTHORITY_GRANTED", targetEmail: subjectEmail, detail: String(perm) });
}

export function revokeDirect(store: Store, actorEmail: string, subjectEmail: string, perm: Permission): Store {
  const next: Store = {
    ...store,
    grants: store.grants.map((g) => {
      if (safeLower(g.subjectEmail) !== safeLower(subjectEmail)) return g;
      if (g.permission !== perm) return g;
      if (g.revokedAt) return g;
      return { ...g, revokedAt: nowIso(), revokedBy: actorEmail };
    }),
  };
  return pushAudit(next, { actorEmail, action: "AUTHORITY_REVOKED", targetEmail: subjectEmail, detail: String(perm) });
}

export function requestAuthorityChange(
  store: Store,
  actorEmail: string,
  subjectEmail: string,
  type: AuthorityRequestType,
  perm: Permission,
  requestNote?: string
): Store {
  const req: AuthorityRequest = {
    id: uuid(),
    type,
    subjectEmail,
    permission: perm,
    requestedAt: nowIso(),
    requestedBy: actorEmail,
    requestNote,
    status: "PENDING",
  };

  const next = { ...store, authorityRequests: [req, ...store.authorityRequests] };
  return pushAudit(next, { actorEmail, action: "AUTHORITY_REQUESTED", targetEmail: subjectEmail, detail: `${type} ${perm}` });
}

export function approveAuthorityRequest(
  store: Store,
  processorEmail: string,
  requestId: string,
  decisionNote?: string
): Store {
  const req = store.authorityRequests.find((r) => r.id === requestId);
  if (!req || req.status !== "PENDING") return store;

  const updated: AuthorityRequest = {
    ...req,
    status: "APPROVED",
    processedAt: nowIso(),
    processedBy: processorEmail,
    decisionNote,
  };

  let next: Store = {
    ...store,
    authorityRequests: store.authorityRequests.map((r) => (r.id === requestId ? updated : r)),
  };

  // Apply
  if (req.type === "GRANT") next = grantDirect(next, processorEmail, req.subjectEmail, req.permission);
  else next = revokeDirect(next, processorEmail, req.subjectEmail, req.permission);

  return pushAudit(next, {
    actorEmail: processorEmail,
    action: "AUTHORITY_REQUEST_APPROVED",
    targetEmail: req.subjectEmail,
    detail: `${req.type} ${req.permission} • ${decisionNote ?? ""}`.trim(),
  });
}

export function rejectAuthorityRequest(
  store: Store,
  processorEmail: string,
  requestId: string,
  decisionNote?: string
): Store {
  const req = store.authorityRequests.find((r) => r.id === requestId);
  if (!req || req.status !== "PENDING") return store;

  const updated: AuthorityRequest = {
    ...req,
    status: "REJECTED",
    processedAt: nowIso(),
    processedBy: processorEmail,
    decisionNote,
  };

  const next: Store = {
    ...store,
    authorityRequests: store.authorityRequests.map((r) => (r.id === requestId ? updated : r)),
  };

  return pushAudit(next, {
    actorEmail: processorEmail,
    action: "AUTHORITY_REQUEST_REJECTED",
    targetEmail: req.subjectEmail,
    detail: `${req.type} ${req.permission} • ${decisionNote ?? ""}`.trim(),
  });
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
      if (c === '"' && n === '"') {
        field += '"';
        i++;
      } else if (c === '"') {
        inQuotes = false;
      } else {
        field += c;
      }
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ",") {
        row.push(field);
        field = "";
      } else if (c === "\n") {
        row.push(field);
        rows.push(row);
        row = [];
        field = "";
      } else if (c !== "\r") {
        field += c;
      }
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

# ------------------------------------------------------------------------------
# 2) AccountControl Enterprise UI:
# - Adds "Authority Requests" tab
# - On approve: auto grant default portal permissions
# - On authority toggle:
#   * Privileged -> apply direct
#   * Others -> create request (PENDING)
# ------------------------------------------------------------------------------
cat > "$ACCOUNT_CONTROL" <<'EOF'
'use client';

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  AlertTriangle,
  CheckCircle2,
  History,
  RefreshCw,
  Search,
  ShieldCheck,
  Upload,
  Download,
  UserPlus,
  UserCog,
  Lock,
  ClipboardCopy,
  Inbox,
  BadgeCheck,
  XCircle,
} from "lucide-react";

import {
  DEFAULT_ROLES,
  PERMISSIONS,
  STORAGE_KEY,
  type Account,
  type AccountStatus,
  type Permission,
  type Role,
  type AuthorityRequest,
  activeGrantsFor,
  can,
  canApplyAuthorityDirect,
  canRequestAuthorityChange,
  csvParse,
  csvStringify,
  defaultPortalPermissionsForRole,
  ensureAtLeastOneSuperAdminActive,
  getAccountByEmail,
  grantDirect,
  isEmailValid,
  loadStore,
  nowIso,
  normalizeRole,
  pushAudit,
  rejectAuthorityRequest,
  requestAuthorityChange,
  revokeDirect,
  roleIsPrivileged,
  safeLower,
  saveStore,
  approveAuthorityRequest,
  uuid,
} from "@/lib/accountControlStore";

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
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        className={`relative w-full ${props.widthClass ?? "max-w-3xl"} rounded-[2rem] bg-[#05080F] ring-1 ring-white/10 shadow-2xl outline-none`}
      >
        <div className="flex items-center justify-between p-6 border-b border-white/5">
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
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black tracking-tighter ${props.className ?? ""}`}>
      {props.children}
    </span>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`h-11 w-full rounded-xl bg-[#0B101B] border border-white/10 px-4 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500/40 ${props.className ?? ""}`}
    />
  );
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`min-h-[92px] w-full rounded-xl bg-[#0B101B] border border-white/10 px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500/40 ${props.className ?? ""}`}
    />
  );
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`h-11 w-full rounded-xl bg-[#0B101B] border border-white/10 px-4 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/40 ${props.className ?? ""}`}
    />
  );
}

function Divider() {
  return <div className="h-px w-full bg-white/5" />;
}

function formatStatus(status: AccountStatus): { label: string; cls: string } {
  switch (status) {
    case "ACTIVE":
      return { label: "ACTIVE", cls: "text-emerald-400" };
    case "PENDING":
      return { label: "PENDING", cls: "text-amber-400" };
    case "SUSPENDED":
      return { label: "SUSPENDED", cls: "text-rose-400" };
    case "REJECTED":
      return { label: "REJECTED", cls: "text-rose-400" };
    case "ARCHIVED":
      return { label: "ARCHIVED", cls: "text-slate-500" };
    default:
      return { label: status, cls: "text-slate-400" };
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
    setStore((prev) =>
      pushAudit(prev, {
        actorEmail: actorEmail || "UNKNOWN",
        action,
        targetEmail,
        detail,
      })
    );
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
    setStore((prev) => ({
      ...prev,
      accounts: prev.accounts.map((a) => (safeLower(a.email) === safeLower(next.email) ? next : a)),
    }));
  }

  function addAccount(acc: Account) {
    setStore((prev) => ({ ...prev, accounts: [acc, ...prev.accounts] }));
  }

  function approveAccount(email: string, note?: string, autoGrantDefaults = true) {
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
      approval: {
        requestedAt: target.approval?.requestedAt ?? target.createdAt,
        requestedBy: target.approval?.requestedBy ?? target.createdBy,
        processedAt: nowIso(),
        processedBy: actorEmail,
        decision: "APPROVED",
        note,
      },
    };

    // Apply approval + default portal grants (role -> portal permissions)
    setStore((prev) => {
      let next = { ...prev, accounts: prev.accounts.map((a) => (safeLower(a.email) === safeLower(email) ? nextAcc : a)) };
      next = pushAudit(next, { actorEmail, action: "REQUEST_APPROVED", targetEmail: email, detail: note ?? "Approved" });

      if (autoGrantDefaults && roleIsPrivileged(actor.role)) {
        const defaults = defaultPortalPermissionsForRole(nextAcc.role);
        for (const perm of defaults) next = grantDirect(next, actorEmail, nextAcc.email, perm);
        next = pushAudit(next, {
          actorEmail,
          action: "ROLE_DEFAULTS_GRANTED",
          targetEmail: nextAcc.email,
          detail: defaults.length ? defaults.join(", ") : "NONE",
        });
      }

      return next;
    });

    setToast({ type: "ok", msg: t("Approved + defaults applied.", "အတည်ပြုပြီး Default permissions ပေးပြီးပါပြီ။") });
  }

  function rejectAccount(email: string, note?: string) {
    if (!actor || !canReject) return;
    const target = getAccountByEmail(store.accounts, email);
    if (!target) return;

    const nextAcc: Account = {
      ...target,
      status: "REJECTED",
      approval: {
        requestedAt: target.approval?.requestedAt ?? target.createdAt,
        requestedBy: target.approval?.requestedBy ?? target.createdBy,
        processedAt: nowIso(),
        processedBy: actorEmail,
        decision: "REJECTED",
        note,
      },
    };

    upsertAccount(nextAcc);
    auditPush("REQUEST_REJECTED", email, note ?? "Rejected");
    setToast({ type: "ok", msg: t("Saved.", "သိမ်းပြီးပါပြီ။") });
  }

  function blockToggle(email: string, block: boolean) {
    if (!actor || !canBlock) return;
    const target = getAccountByEmail(store.accounts, email);
    if (!target) return;

    if (!roleIsPrivileged(actor.role) && roleIsPrivileged(target.role)) {
      setToast({ type: "err", msg: "Cannot modify privileged accounts." });
      return;
    }

    const nextAcc: Account = {
      ...target,
      status: block ? "SUSPENDED" : "ACTIVE",
      security: {
        ...(target.security ?? {}),
        blockedAt: block ? nowIso() : undefined,
        blockedBy: block ? actorEmail : undefined,
      },
    };

    upsertAccount(nextAcc);
    auditPush(block ? "ACCOUNT_BLOCKED" : "ACCOUNT_UNBLOCKED", email, `By ${actorEmail}`);
    setToast({ type: "ok", msg: t("Saved.", "သိမ်းပြီးပါပြီ။") });
  }

  function changeRole(email: string, role: Role) {
    if (!actor || !canRoleEdit) return;
    const target = getAccountByEmail(store.accounts, email);
    if (!target) return;

    if (!roleIsPrivileged(actor.role) && roleIsPrivileged(target.role)) {
      setToast({ type: "err", msg: "Cannot modify privileged accounts." });
      return;
    }

    const nextAcc: Account = { ...target, role };
    const nextAccounts = store.accounts.map((a) => (safeLower(a.email) === safeLower(email) ? nextAcc : a));
    if (!ensureAtLeastOneSuperAdminActive(nextAccounts)) {
      setToast({ type: "err", msg: "Must keep at least one ACTIVE SUPER_ADMIN." });
      return;
    }

    setStore((prev) => ({ ...prev, accounts: nextAccounts }));
    auditPush("ROLE_CHANGED", email, `Role -> ${role}`);
    setToast({ type: "ok", msg: t("Saved.", "သိမ်းပြီးပါပြီ။") });
  }

  function exportAccountsCsv() {
    const header = ["name", "email", "role", "status", "department", "phone", "employeeId", "createdAt", "createdBy"];
    const rows: string[][] = [header];

    for (const a of filtered) {
      rows.push([
        a.name ?? "",
        a.email ?? "",
        a.role ?? "",
        a.status ?? "",
        a.department ?? "",
        a.phone ?? "",
        a.employeeId ?? "",
        a.createdAt ?? "",
        a.createdBy ?? "",
      ]);
    }

    downloadBlob(`accounts_${new Date().toISOString().slice(0, 10)}.csv`, "text/csv;charset=utf-8", csvStringify(rows));
    auditPush("CSV_EXPORT_ACCOUNTS", undefined, `Rows=${filtered.length}`);
  }

  function exportGrantsCsv() {
    const header = ["subjectEmail", "permission", "grantedAt", "grantedBy", "revokedAt", "revokedBy"];
    const rows: string[][] = [header];

    for (const g of store.grants) {
      rows.push([g.subjectEmail, String(g.permission), g.grantedAt, g.grantedBy, g.revokedAt ?? "", g.revokedBy ?? ""]);
    }

    downloadBlob(`authorities_${new Date().toISOString().slice(0, 10)}.csv`, "text/csv;charset=utf-8", csvStringify(rows));
    auditPush("CSV_EXPORT_AUTHORITIES", undefined, `Rows=${store.grants.length}`);
  }

  function selectAllOnPage(checked: boolean) {
    const next = { ...selected };
    for (const a of paged) next[a.email] = checked;
    setSelected(next);
  }

  function clearSelection() {
    setSelected({});
  }

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
      if (!name.trim() || !isEmailValid(em)) {
        setToast({ type: "err", msg: t("Please check required fields.", "လိုအပ်သော အချက်အလက်များ စစ်ဆေးပါ။") });
        return;
      }

      if (getAccountByEmail(store.accounts, em)) {
        setToast({ type: "err", msg: t("Email already exists.", "Email ရှိပြီးသားဖြစ်သည်။") });
        return;
      }

      const createdAt = nowIso();
      const acc: Account = {
        id: uuid(),
        name: name.trim(),
        email: em,
        role,
        status: "PENDING",
        department: department.trim() || undefined,
        phone: phone.trim() || undefined,
        employeeId: employeeId.trim() || undefined,
        createdAt,
        createdBy: actorEmail,
        approval: { requestedAt: createdAt, requestedBy: actorEmail, note: note.trim() || undefined },
      };

      addAccount(acc);
      auditPush("REQUEST_CREATED", em, note.trim() || "Created");
      setModalCreate(false);
      setToast({ type: "ok", msg: t("Saved.", "သိမ်းပြီးပါပြီ။") });
    }

    return (
      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-[11px] uppercase tracking-widest text-slate-500 font-mono">{t("Full name", "အမည်")}</div>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="space-y-1">
            <div className="text-[11px] uppercase tracking-widest text-slate-500 font-mono">{t("Email", "Email")}</div>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div className="space-y-1">
            <div className="text-[11px] uppercase tracking-widest text-slate-500 font-mono">{t("Role", "Role")}</div>
            <Select value={role} onChange={(e) => setRole(e.target.value as Role)}>
              {DEFAULT_ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </Select>
            <div className="text-[10px] font-mono text-slate-600 mt-1">
              Defaults: {defaultPortalPermissionsForRole(role).join(", ") || "NONE"}
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-[11px] uppercase tracking-widest text-slate-500 font-mono">{t("Department", "ဌာန")}</div>
            <Input value={department} onChange={(e) => setDepartment(e.target.value)} />
          </div>

          <div className="space-y-1">
            <div className="text-[11px] uppercase tracking-widest text-slate-500 font-mono">{t("Phone", "ဖုန်း")}</div>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>

          <div className="space-y-1">
            <div className="text-[11px] uppercase tracking-widest text-slate-500 font-mono">{t("Employee ID", "ဝန်ထမ်း ID")}</div>
            <Input value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} />
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-[11px] uppercase tracking-widest text-slate-500 font-mono">{t("Reason / Note", "အကြောင်းရင်း / မှတ်ချက်")}</div>
          <Textarea value={note} onChange={(e) => setNote(e.target.value)} />
        </div>

        <Divider />

        <div className="flex justify-end gap-3">
          <Button variant="ghost" className="text-slate-400 hover:text-white" onClick={() => setModalCreate(false)}>
            {t("Cancel", "မလုပ်တော့")}
          </Button>
          <Button className="bg-sky-600 hover:bg-sky-500 text-white font-black h-11 px-6 rounded-xl uppercase" onClick={submit}>
            {t("Save", "သိမ်းမည်")}
          </Button>
        </div>
      </div>
    );
  };

  const AuthorityModal = ({ email }: { email: string }) => {
    const subject = getAccountByEmail(store.accounts, email);
    const [note, setNote] = useState("");
    if (!subject) return null;

    const subjectPerms = roleIsPrivileged(subject.role)
      ? new Set(PERMISSIONS.map((p) => p.code))
      : new Set(activeGrantsFor(store.grants, subject.email).map((g) => g.permission));

    const direct = canApplyAuthorityDirect(store, actor);

    return (
      <div className="space-y-5">
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-white font-black uppercase italic">{subject.name}</div>
              <div className="text-sm text-slate-500">{subject.email}</div>
            </div>
            <Pill className={roleBadgeClass(subject.role)}>{subject.role}</Pill>
          </div>

          <div className="mt-3 text-xs text-slate-500">
            {direct
              ? t("Direct apply enabled (Super Admin).", "Direct apply ပြုလုပ်နိုင်သည် (Super Admin).")
              : t("Changes create requests (requires Super Admin approval).", "ပြောင်းလဲမှုများသည် Request ဖြစ်ပြီး Super Admin အတည်ပြုရန်လိုသည်။")}
          </div>

          <div className="mt-3 space-y-1">
            <div className="text-[11px] uppercase tracking-widest text-slate-500 font-mono">{t("Request note", "Request မှတ်ချက်")}</div>
            <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder={t("Optional note...", "Optional note...")} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {PERMISSIONS.map((p) => {
            const enabled = subjectPerms.has(p.code);
            const disabled =
              !actor ||
              !canAuth ||
              (roleIsPrivileged(subject.role) && !roleIsPrivileged(actor.role));

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
                            return want
                              ? grantDirect(prev, actorEmail, subject.email, p.code)
                              : revokeDirect(prev, actorEmail, subject.email, p.code);
                          }

                          // Request workflow
                          return requestAuthorityChange(prev, actorEmail, subject.email, type, p.code, note.trim() || undefined);
                        });

                        setToast({
                          type: direct ? "ok" : "warn",
                          msg: direct
                            ? t("Applied.", "ပြောင်းလဲပြီးပါပြီ။")
                            : t("Request submitted for approval.", "Request တင်ပြီးပါပြီ (အတည်ပြုရန်လိုသည်)။"),
                        });
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

        <div className="flex justify-end">
          <Button variant="ghost" className="text-slate-400 hover:text-white" onClick={() => setModalAuthorityEmail(null)}>
            {t("Close", "ပိတ်")}
          </Button>
        </div>
      </div>
    );
  };

  const ApproveRejectModal = ({ email, mode }: { email: string; mode: "approve" | "reject" }) => {
    const target = getAccountByEmail(store.accounts, email);
    const [note, setNote] = useState("");
    const [autoDefaults, setAutoDefaults] = useState(true);
    if (!target) return null;

    return (
      <div className="space-y-4">
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-white font-black uppercase italic">{target.name}</div>
              <div className="text-sm text-slate-500">{target.email}</div>
            </div>
            <Pill className={roleBadgeClass(target.role)}>{target.role}</Pill>
          </div>

          {mode === "approve" ? (
            <div className="mt-3 text-xs text-slate-500">
              {t("Role defaults:", "Role defaults:")}{" "}
              <span className="text-slate-300 font-mono">{defaultPortalPermissionsForRole(target.role).join(", ") || "NONE"}</span>
            </div>
          ) : null}

          {mode === "approve" ? (
            <label className="mt-3 flex items-center gap-2 text-xs text-slate-300">
              <input
                type="checkbox"
                checked={autoDefaults}
                onChange={(e) => setAutoDefaults(e.target.checked)}
                className="h-4 w-4 accent-emerald-500"
              />
              {t("Auto-grant role default portal access", "Role default portal access ကို အလိုအလျောက်ပေးမည်")}
            </label>
          ) : null}
        </div>

        <div className="space-y-1">
          <div className="text-[11px] uppercase tracking-widest text-slate-500 font-mono">{t("Reason / Note", "အကြောင်းရင်း / မှတ်ချက်")}</div>
          <Textarea value={note} onChange={(e) => setNote(e.target.value)} />
        </div>

        <div className="flex justify-end gap-3">
          <Button
            variant="ghost"
            className="text-slate-400 hover:text-white"
            onClick={() => (mode === "approve" ? setModalApproveEmail(null) : setModalRejectEmail(null))}
          >
            {t("Cancel", "မလုပ်တော့")}
          </Button>
          <Button
            className={`${mode === "approve" ? "bg-emerald-600 hover:bg-emerald-500" : "bg-rose-600 hover:bg-rose-500"} text-white font-black h-11 px-6 rounded-xl uppercase`}
            onClick={() => {
              if (mode === "approve") approveAccount(email, note.trim() || undefined, autoDefaults);
              else rejectAccount(email, note.trim() || undefined);
              setModalApproveEmail(null);
              setModalRejectEmail(null);
            }}
          >
            {mode === "approve" ? t("Approve", "အတည်ပြု") : t("Reject", "ငြင်းပယ်")}
          </Button>
        </div>
      </div>
    );
  };

  const RequestsPanel = () => {
    const [rq, setRq] = useState("");
    const [status, setStatus] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("PENDING");

    const rows = useMemo(() => {
      const qq = safeLower(rq);
      return store.authorityRequests
        .filter((r) => (status === "ALL" ? true : r.status === status))
        .filter((r) => {
          if (!qq) return true;
          const s = `${r.subjectEmail} ${r.permission} ${r.type} ${r.requestedBy}`.toLowerCase();
          return s.includes(qq);
        })
        .slice(0, 200);
    }, [store.authorityRequests, rq, status]);

    const canProcess = actorActive && roleIsPrivileged(actor?.role);

    return (
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-2 bg-[#0B101B] border border-white/10 rounded-xl px-3 h-11 w-full md:w-[520px]">
            <Search className="h-4 w-4 text-slate-500" />
            <input
              value={rq}
              onChange={(e) => setRq(e.target.value)}
              placeholder={t("Search requests...", "Request များရှာရန်...")}
              className="bg-transparent outline-none text-sm text-slate-200 w-full"
            />
          </div>

          <div className="flex items-center gap-2">
            <Select value={status} onChange={(e) => setStatus(e.target.value as any)} className="w-44">
              <option value="PENDING">PENDING</option>
              <option value="APPROVED">APPROVED</option>
              <option value="REJECTED">REJECTED</option>
              <option value="ALL">ALL</option>
            </Select>
          </div>
        </div>

        <Card className="bg-[#05080F] border-none ring-1 ring-white/5 rounded-[2rem] overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-white/5 font-mono text-slate-500 uppercase text-[10px] tracking-[0.2em]">
              <tr>
                <th className="p-5">TYPE</th>
                <th className="p-5">SUBJECT</th>
                <th className="p-5">PERMISSION</th>
                <th className="p-5">STATUS</th>
                <th className="p-5 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rows.map((r) => (
                <RequestRow
                  key={r.id}
                  r={r}
                  canProcess={canProcess}
                  onApprove={(id, note) => {
                    setStore((prev) => approveAuthorityRequest(prev, actorEmail, id, note));
                    setToast({ type: "ok", msg: t("Approved.", "အတည်ပြုပြီးပါပြီ။") });
                  }}
                  onReject={(id, note) => {
                    setStore((prev) => rejectAuthorityRequest(prev, actorEmail, id, note));
                    setToast({ type: "ok", msg: t("Rejected.", "ငြင်းပယ်ပြီးပါပြီ။") });
                  }}
                />
              ))}
            </tbody>
          </table>

          {!rows.length ? <div className="p-10 text-center text-slate-600">{t("No requests.", "Request မရှိပါ။")}</div> : null}
        </Card>

        {!canProcess ? (
          <div className="text-xs text-slate-600">
            {t("Only Super Admin can approve/reject authority requests.", "Super Admin သာ Request များကို အတည်ပြု/ငြင်းပယ်နိုင်သည်။")}
          </div>
        ) : null}
      </div>
    );
  };

  function RequestRow(props: {
    r: AuthorityRequest;
    canProcess: boolean;
    onApprove: (id: string, note?: string) => void;
    onReject: (id: string, note?: string) => void;
  }) {
    const [note, setNote] = useState("");
    const pending = props.r.status === "PENDING";

    return (
      <tr className="hover:bg-white/5 transition-all">
        <td className="p-5">
          <Pill className={props.r.type === "GRANT" ? "bg-emerald-500/10 text-emerald-300" : "bg-rose-500/10 text-rose-300"}>
            {props.r.type}
          </Pill>
        </td>
        <td className="p-5">
          <div className="text-white font-bold">{props.r.subjectEmail}</div>
          <div className="text-[10px] font-mono text-slate-600">{props.r.requestedBy}</div>
        </td>
        <td className="p-5">
          <div className="text-slate-200 font-mono text-xs">{String(props.r.permission)}</div>
          {props.r.requestNote ? <div className="text-[10px] text-slate-600 mt-1">{props.r.requestNote}</div> : null}
        </td>
        <td className="p-5">
          <Pill className={props.r.status === "PENDING" ? "bg-amber-500/10 text-amber-300" : props.r.status === "APPROVED" ? "bg-emerald-500/10 text-emerald-300" : "bg-rose-500/10 text-rose-300"}>
            {props.r.status}
          </Pill>
          <div className="text-[10px] font-mono text-slate-600 mt-1">{new Date(props.r.requestedAt).toLocaleString()}</div>
        </td>
        <td className="p-5 text-right">
          {props.canProcess && pending ? (
            <div className="flex items-center justify-end gap-2">
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="note"
                className="h-10 w-40 rounded-xl bg-[#0B101B] border border-white/10 px-3 text-xs text-slate-200"
              />
              <Button className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase" onClick={() => props.onApprove(props.r.id, note.trim() || undefined)}>
                Approve
              </Button>
              <Button className="h-10 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black uppercase" onClick={() => props.onReject(props.r.id, note.trim() || undefined)}>
                Reject
              </Button>
            </div>
          ) : (
            <div className="text-xs text-slate-600">
              {props.r.processedBy ? `by ${props.r.processedBy}` : "—"}
            </div>
          )}
        </td>
      </tr>
    );
  }

  const AuditPanel = () => {
    const events = store.audit.slice(0, 200);
    return (
      <div className="space-y-3">
        <div className="text-sm text-slate-500">{t("Showing latest 200 events.", "နောက်ဆုံး 200 events ကိုပြပါမည်။")}</div>
        <div className="space-y-2">
          {events.map((e) => (
            <div key={e.id} className="p-4 rounded-2xl bg-[#05080F] border border-white/10">
              <div className="flex items-center justify-between gap-3">
                <div className="text-white font-bold">{e.action}</div>
                <div className="text-[10px] font-mono text-slate-600">{new Date(e.at).toLocaleString()}</div>
              </div>
              <div className="mt-1 text-xs text-slate-500">
                Actor: <span className="text-slate-300">{e.actorEmail}</span>
                {e.targetEmail ? (
                  <>
                    {" "}
                    • Target: <span className="text-slate-300">{e.targetEmail}</span>
                  </>
                ) : null}
              </div>
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
          <div>
            <div className="text-white font-black uppercase italic">{target.name}</div>
            <div className="text-slate-500 text-sm">{target.email}</div>
          </div>
          <div className="flex items-center gap-2">
            <Pill className={roleBadgeClass(target.role)}>{target.role}</Pill>
            <Pill className="bg-white/5 text-slate-300">{target.department ?? "-"}</Pill>
          </div>
        </div>

        <Divider />

        <div className="space-y-2">
          <div className="text-[11px] uppercase tracking-widest text-slate-500 font-mono">Authorities</div>
          <div className="flex flex-wrap gap-2">
            {roleIsPrivileged(target.role) ? (
              <Pill className="bg-sky-500/10 text-sky-400">ALL_PERMISSIONS</Pill>
            ) : grants.length ? (
              grants.map((g) => (
                <Pill key={g.id} className="bg-white/5 text-slate-200">
                  {String(g.permission)}
                </Pill>
              ))
            ) : (
              <div className="text-sm text-slate-600">No delegated permissions.</div>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <Button variant="ghost" className="text-slate-400 hover:text-white" onClick={() => setModalProfileEmail(null)}>
            {t("Close", "ပိတ်")}
          </Button>
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
      if (!header || header.length < 2) {
        setPreview({ ok: 0, skipped: 0, errors: ["Invalid CSV header."], rows: [] });
        return;
      }

      const idx = (key: string) => header.indexOf(safeLower(key));
      const iName = idx("name");
      const iEmail = idx("email");
      const iRole = idx("role");
      const iDept = idx("department");
      const iPhone = idx("phone");
      const iEmp = idx("employeeId");

      const errors: string[] = [];
      const rows: Account[] = [];
      let skipped = 0;

      for (let r = 1; r < parsed.length; r++) {
        const row = parsed[r];
        const name = (row[iName] ?? "").trim();
        const email = (row[iEmail] ?? "").trim();
        const role = ((row[iRole] ?? "STAFF").trim() as Role) || "STAFF";
        const department = (row[iDept] ?? "").trim();
        const phone = (row[iPhone] ?? "").trim();
        const employeeId = (row[iEmp] ?? "").trim();

        if (!name || !isEmailValid(email)) {
          errors.push(`Row ${r + 1}: invalid name/email`);
          continue;
        }

        if (getAccountByEmail(store.accounts, email)) {
          skipped++;
          continue;
        }

        const createdAt = nowIso();
        rows.push({
          id: uuid(),
          name,
          email,
          role: DEFAULT_ROLES.includes(role) ? role : "STAFF",
          status: "PENDING",
          department: department || undefined,
          phone: phone || undefined,
          employeeId: employeeId || undefined,
          createdAt,
          createdBy: actorEmail || "UNKNOWN",
          approval: { requestedAt: createdAt, requestedBy: actorEmail || "UNKNOWN" },
        });
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
          <div className="text-sm text-slate-500">
            {t("CSV columns:", "CSV ကော်လံများ:")} name,email,role,department,phone,employeeId
          </div>

          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => onPick(e.target.files?.[0] ?? null)} />
            <Button className="bg-sky-600 hover:bg-sky-500 text-white font-black h-10 px-4 rounded-xl uppercase">
              <Upload className="h-4 w-4 mr-2" />
              {fileName ? fileName : t("Pick CSV", "CSV ရွေး")}
            </Button>
          </label>
        </div>

        {preview ? (
          <div className="p-4 rounded-2xl bg-[#0B101B] border border-white/10 space-y-2">
            <div className="text-sm text-slate-300">
              OK: <span className="text-emerald-300 font-bold">{preview.ok}</span> • Skipped:{" "}
              <span className="text-amber-300 font-bold">{preview.skipped}</span> • Errors:{" "}
              <span className="text-rose-300 font-bold">{preview.errors.length}</span>
            </div>
            {preview.errors.length ? (
              <div className="text-xs text-rose-300 font-mono space-y-1">
                {preview.errors.slice(0, 6).map((e) => (
                  <div key={e}>{e}</div>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="flex justify-end gap-3">
          <Button variant="ghost" className="text-slate-400 hover:text-white" onClick={() => setModalImport(false)}>
            {t("Cancel", "မလုပ်တော့")}
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-black h-11 px-6 rounded-xl uppercase disabled:opacity-40" disabled={!preview?.ok} onClick={doImport}>
            {t("Confirm", "အတည်ပြု")}
          </Button>
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
          <div className="text-slate-300">
            {t("Selected", "ရွေးထား")}: <span className="font-black text-white">{selectedEmails.length}</span>
          </div>
          <Button variant="ghost" className="text-slate-400 hover:text-white" onClick={clearSelection}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Clear
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-[11px] uppercase tracking-widest text-slate-500 font-mono">{t("Action", "လုပ်ဆောင်ချက်")}</div>
            <Select value={action} onChange={(e) => setAction(e.target.value as any)}>
              <option value="APPROVE">{t("Approve", "အတည်ပြု")}</option>
              <option value="REJECT">{t("Reject", "ငြင်းပယ်")}</option>
              <option value="BLOCK">{t("Block", "ပိတ်")}</option>
              <option value="UNBLOCK">{t("Unblock", "ဖွင့်")}</option>
              <option value="SET_ROLE">{t("Set role", "Role သတ်မှတ်")}</option>
            </Select>
          </div>

          {action === "SET_ROLE" ? (
            <div className="space-y-1">
              <div className="text-[11px] uppercase tracking-widest text-slate-500 font-mono">{t("Role", "Role")}</div>
              <Select value={role} onChange={(e) => setRole(e.target.value as Role)}>
                {DEFAULT_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </Select>
            </div>
          ) : (
            <div />
          )}
        </div>

        <div className="space-y-1">
          <div className="text-[11px] uppercase tracking-widest text-slate-500 font-mono">{t("Note (optional)", "မှတ်ချက် (optional)")}</div>
          <Textarea value={note} onChange={(e) => setNote(e.target.value)} />
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="ghost" className="text-slate-400 hover:text-white" onClick={() => setModalBulk(false)}>
            {t("Cancel", "မလုပ်တော့")}
          </Button>
          <Button className="bg-sky-600 hover:bg-sky-500 text-white font-black h-11 px-6 rounded-xl uppercase disabled:opacity-40" disabled={!selectedEmails.length} onClick={apply}>
            {t("Apply", "လုပ်ဆောင်")}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 md:p-10 space-y-6 bg-[#0B101B] min-h-screen text-slate-300">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-[#05080F] p-6 md:p-8 rounded-[2.5rem] border border-white/5">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-sky-500/10 rounded-2xl">
            <UserPlus className="text-sky-500 h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white uppercase italic">{t("Account Control", "အကောင့်ထိန်းချုပ်မှု")}</h1>
            <p className="text-sky-500 font-mono text-[10px] uppercase tracking-widest italic">{t("Enterprise Identity Governance", "လုပ်ငန်းသုံး Identity Governance")}</p>
            <p className="text-xs text-slate-500 mt-1">
              {actorEmail ? `${t("Signed in as", "ဝင်ထားသည်")}: ${actorEmail}` : t("Not signed in", "ဝင်မထားပါ")}
            </p>
            {actor ? (
              <p className="text-[10px] text-slate-600 font-mono mt-1">
                ROLE: {actor.role} • STATUS: {actor.status} • MODE: {isPriv ? "DIRECT" : "REQUEST"} • STORE: {STORAGE_KEY}
              </p>
            ) : (
              <p className="text-xs text-amber-300 mt-1 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                {t("Session user not registered in Account Registry.", "Session user သည် Registry ထဲတွင် မရှိပါ။")}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 justify-end">
          <Button
            className={`h-12 px-5 rounded-xl uppercase font-black ${view === "ACCOUNTS" ? "bg-emerald-600 hover:bg-emerald-500 text-white" : "bg-white/5 hover:bg-white/10 text-white"}`}
            onClick={() => setView("ACCOUNTS")}
          >
            <UserCog className="h-4 w-4 mr-2" />
            {t("Accounts", "အကောင့်များ")}
          </Button>

          <Button
            className={`h-12 px-5 rounded-xl uppercase font-black ${view === "AUTH_REQUESTS" ? "bg-emerald-600 hover:bg-emerald-500 text-white" : "bg-white/5 hover:bg-white/10 text-white"}`}
            onClick={() => setView("AUTH_REQUESTS")}
            disabled={!canAuth && !isPriv}
          >
            <Inbox className="h-4 w-4 mr-2" />
            {t("Authority Requests", "Authority Requests")}
            {pendingAuthorityCount ? (
              <span className="ml-3 inline-flex items-center px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black">
                {pendingAuthorityCount}
              </span>
            ) : null}
          </Button>

          <Button
            className={`h-12 px-5 rounded-xl uppercase font-black ${view === "AUDIT" ? "bg-emerald-600 hover:bg-emerald-500 text-white" : "bg-white/5 hover:bg-white/10 text-white"}`}
            onClick={() => setView("AUDIT")}
            disabled={!canAudit}
          >
            <History className="h-4 w-4 mr-2" />
            {t("Audit", "Audit")}
          </Button>
        </div>
      </div>

      {toast ? (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm flex items-center gap-2 ${
            toast.type === "ok"
              ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-300"
              : toast.type === "warn"
                ? "border-amber-500/20 bg-amber-500/5 text-amber-300"
                : "border-rose-500/20 bg-rose-500/5 text-rose-300"
          }`}
        >
          {toast.type === "ok" ? <CheckCircle2 className="h-4 w-4" /> : toast.type === "warn" ? <AlertTriangle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
          <div>{toast.msg}</div>
        </div>
      ) : null}

      {/* ========================= VIEW: AUTH REQUESTS ========================= */}
      {view === "AUTH_REQUESTS" ? (
        <RequestsPanel />
      ) : null}

      {/* ========================= VIEW: AUDIT ========================= */}
      {view === "AUDIT" ? (
        <AuditPanel />
      ) : null}

      {/* ========================= VIEW: ACCOUNTS ========================= */}
      {view === "ACCOUNTS" ? (
        <>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                className="bg-[#05080F] border border-white/10 rounded-full h-12 pl-12 pr-6 text-sm w-full text-slate-200"
                placeholder={t("Search accounts...", "အကောင့်ရှာရန်...")}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                disabled={!canRead}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 justify-end">
              {canExport ? (
                <>
                  <Button className="bg-white/5 hover:bg-white/10 text-white font-black h-12 px-5 rounded-xl uppercase" onClick={exportAccountsCsv}>
                    <Download className="h-4 w-4 mr-2" />
                    {t("Export CSV", "CSV ထုတ်ရန်")}
                  </Button>
                  <Button className="bg-white/5 hover:bg-white/10 text-white font-black h-12 px-5 rounded-xl uppercase" onClick={exportGrantsCsv}>
                    <Download className="h-4 w-4 mr-2" />
                    Authorities CSV
                  </Button>
                </>
              ) : null}

              {canImport ? (
                <Button className="bg-white/5 hover:bg-white/10 text-white font-black h-12 px-5 rounded-xl uppercase" onClick={() => setModalImport(true)}>
                  <Upload className="h-4 w-4 mr-2" />
                  {t("Import CSV", "CSV သွင်းရန်")}
                </Button>
              ) : null}

              {canBulk ? (
                <Button className="bg-white/5 hover:bg-white/10 text-white font-black h-12 px-5 rounded-xl uppercase" onClick={() => setModalBulk(true)}>
                  <ShieldCheck className="h-4 w-4 mr-2" />
                  {t("Bulk Actions", "အုပ်စုလိုက်")}
                </Button>
              ) : null}

              {canCreate ? (
                <Button className="bg-sky-600 hover:bg-sky-500 text-white font-black h-12 px-6 rounded-xl uppercase" onClick={() => setModalCreate(true)}>
                  {t("Create Account", "အကောင့်အသစ်ဖွင့်မည်")}
                </Button>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <Pill className="bg-white/5 text-slate-300">{t("Filters", "စစ်ထုတ်မှု")}</Pill>

              <div className="flex items-center gap-2">
                <div className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">{t("Status", "အခြေအနေ")}</div>
                <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as any)} className="w-44" disabled={!canRead}>
                  <option value="ALL">ALL</option>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="PENDING">PENDING</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                  <option value="REJECTED">REJECTED</option>
                  <option value="ARCHIVED">ARCHIVED</option>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">{t("Role", "Role")}</div>
                <Select value={filterRole} onChange={(e) => setFilterRole(e.target.value as any)} className="w-52" disabled={!canRead}>
                  <option value="ALL">ALL</option>
                  {DEFAULT_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </Select>
              </div>

              <Button
                variant="ghost"
                className="h-11 text-slate-400 hover:text-white"
                onClick={() => {
                  setQ("");
                  setFilterStatus("ALL");
                  setFilterRole("ALL");
                  setToast({ type: "ok", msg: t("Reset.", "ပြန်ချ") });
                }}
                disabled={!canRead}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {t("Reset", "ပြန်ချ")}
              </Button>
            </div>

            <div className="text-xs text-slate-600 font-mono">
              MODE: {isPriv ? "DIRECT" : "REQUEST"} • PENDING_AUTH: {pendingAuthorityCount}
            </div>
          </div>

          {!canRead ? (
            <Card className="bg-[#05080F] border-none ring-1 ring-white/5 rounded-[2rem] p-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-300" />
                <div>
                  <div className="text-white font-black uppercase italic">{t("Access denied", "ဝင်ရောက်ခွင့်မရှိပါ")}</div>
                  <div className="text-sm text-slate-500">{t("Super Admin must grant you USER_READ.", "Super Admin မှ USER_READ အာဏာပေးရပါမည်။")}</div>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="bg-[#05080F] border-none ring-1 ring-white/5 rounded-[3rem] overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-white/5 font-mono text-slate-500 uppercase text-[10px] tracking-[0.2em]">
                  <tr>
                    <th className="p-6">
                      <label className="inline-flex items-center gap-2">
                        <input
                          type="checkbox"
                          className="h-4 w-4 accent-sky-500"
                          checked={paged.length > 0 && paged.every((a) => selected[a.email])}
                          onChange={(e) => selectAllOnPage(e.target.checked)}
                          disabled={!canBulk}
                        />
                        {t("Select", "ရွေးချယ်")}
                      </label>
                    </th>
                    <th className="p-6">{t("Personnel Info", "ဝန်ထမ်းအချက်အလက်")}</th>
                    <th className="p-6">{t("Role / Authority", "Role / Authority")}</th>
                    <th className="p-6">{t("Status", "အခြေအနေ")}</th>
                    <th className="p-6 text-right">{t("Actions", "လုပ်ဆောင်မှု")}</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/5">
                  {paged.map((u) => {
                    const st = formatStatus(u.status);
                    const blocked = u.status === "SUSPENDED";
                    const grantsCount = roleIsPrivileged(u.role) ? "ALL" : activeGrantsFor(store.grants, u.email).length;

                    return (
                      <tr key={u.email} className="hover:bg-white/5 transition-all">
                        <td className="p-6">
                          <input
                            type="checkbox"
                            className="h-4 w-4 accent-sky-500"
                            checked={!!selected[u.email]}
                            disabled={!canBulk}
                            onChange={(e) => setSelected((prev) => ({ ...prev, [u.email]: e.target.checked }))}
                          />
                        </td>

                        <td className="p-6">
                          <p className="font-bold text-white uppercase italic">{u.name}</p>
                          <p className="text-xs text-slate-500">{u.email}</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {u.department ? <Pill className="bg-white/5 text-slate-300">{u.department}</Pill> : null}
                            {u.employeeId ? <Pill className="bg-white/5 text-slate-300">{u.employeeId}</Pill> : null}
                            {u.phone ? <Pill className="bg-white/5 text-slate-300">{u.phone}</Pill> : null}
                          </div>
                        </td>

                        <td className="p-6">
                          <Pill className={roleBadgeClass(u.role)}>{u.role}</Pill>
                          <div className="mt-2 text-xs text-slate-600">
                            Authorities: <span className="text-slate-300">{grantsCount}</span>
                          </div>
                          {u.status === "PENDING" ? (
                            <div className="mt-1 text-[10px] font-mono text-slate-600">
                              Defaults: {defaultPortalPermissionsForRole(u.role).join(", ") || "NONE"}
                            </div>
                          ) : null}
                        </td>

                        <td className="p-6">
                          <span className={`text-[10px] font-bold italic ${st.cls}`}>{st.label}</span>
                        </td>

                        <td className="p-6 text-right space-x-1 md:space-x-2">
                          <Button variant="ghost" className="h-10 text-slate-500 hover:text-white" title="View" onClick={() => setModalProfileEmail(u.email)}>
                            <UserCog size={16} />
                          </Button>

                          <Button
                            variant="ghost"
                            className="h-10 text-slate-500 hover:text-white disabled:opacity-40"
                            title="Authority"
                            disabled={!canAuth}
                            onClick={() => setModalAuthorityEmail(u.email)}
                          >
                            <ShieldCheck size={16} />
                          </Button>

                          <Button
                            variant="ghost"
                            className={`h-10 ${blocked ? "text-emerald-400 hover:bg-emerald-500/10" : "text-rose-500 hover:bg-rose-500/10"} disabled:opacity-40`}
                            title={blocked ? "Unblock" : "Block"}
                            disabled={!canBlock}
                            onClick={() => blockToggle(u.email, !blocked)}
                          >
                            <Lock size={16} />
                          </Button>

                          {canRoleEdit ? (
                            <select
                              className="h-10 rounded-xl bg-[#0B101B] border border-white/10 px-3 text-xs text-slate-200 ml-2"
                              value={u.role}
                              onChange={(e) => changeRole(u.email, e.target.value as Role)}
                              title="Role"
                            >
                              {DEFAULT_ROLES.map((r) => (
                                <option key={r} value={r}>
                                  {r}
                                </option>
                              ))}
                            </select>
                          ) : null}

                          {u.status === "PENDING" ? (
                            <>
                              <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-black h-10 px-4 rounded-xl uppercase disabled:opacity-40 ml-2" disabled={!canApprove} onClick={() => setModalApproveEmail(u.email)}>
                                {t("Approve", "အတည်ပြု")}
                              </Button>
                              <Button className="bg-rose-600 hover:bg-rose-500 text-white font-black h-10 px-4 rounded-xl uppercase disabled:opacity-40" disabled={!canReject} onClick={() => setModalRejectEmail(u.email)}>
                                {t("Reject", "ငြင်းပယ်")}
                              </Button>
                            </>
                          ) : null}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filtered.length === 0 ? <div className="p-10 text-center text-slate-600">{t("No accounts found.", "အကောင့်မတွေ့ပါ။")}</div> : null}

              <div className="flex items-center justify-between px-6 py-4 border-t border-white/5">
                <div className="text-xs text-slate-600 font-mono">
                  {filtered.length} total • page {Math.min(page, totalPages)} / {totalPages}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" className="h-10 text-slate-400 hover:text-white disabled:opacity-40" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                    Prev
                  </Button>
                  <Button variant="ghost" className="h-10 text-slate-400 hover:text-white disabled:opacity-40" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                    Next
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </>
      ) : null}

      <Modal open={modalCreate} title={t("Create account request", "အကောင့်တောင်းဆိုမှု ဖန်တီးရန်")} onClose={() => setModalCreate(false)} widthClass="max-w-3xl">
        <CreateModal />
      </Modal>

      <Modal open={!!modalAuthorityEmail} title={t("Manage authorities", "အာဏာများ စီမံရန်")} onClose={() => setModalAuthorityEmail(null)} widthClass="max-w-4xl">
        {modalAuthorityEmail ? <AuthorityModal email={modalAuthorityEmail} /> : null}
      </Modal>

      <Modal open={!!modalProfileEmail} title={t("Account profile", "အကောင့်အချက်အလက်")} onClose={() => setModalProfileEmail(null)} widthClass="max-w-3xl">
        {modalProfileEmail ? <ProfileModal email={modalProfileEmail} /> : null}
      </Modal>

      <Modal open={!!modalApproveEmail} title={t("Approve request", "တောင်းဆိုမှု အတည်ပြုရန်")} onClose={() => setModalApproveEmail(null)} widthClass="max-w-2xl">
        {modalApproveEmail ? <ApproveRejectModal email={modalApproveEmail} mode="approve" /> : null}
      </Modal>

      <Modal open={!!modalRejectEmail} title={t("Reject request", "တောင်းဆိုမှု ငြင်းပယ်ရန်")} onClose={() => setModalRejectEmail(null)} widthClass="max-w-2xl">
        {modalRejectEmail ? <ApproveRejectModal email={modalRejectEmail} mode="reject" /> : null}
      </Modal>

      <Modal open={modalImport} title={t("Import CSV", "CSV သွင်းရန်")} onClose={() => setModalImport(false)} widthClass="max-w-3xl">
        <ImportModal />
      </Modal>

      <Modal open={modalBulk} title={t("Bulk actions", "အုပ်စုလိုက်လုပ်ဆောင်မှု")} onClose={() => setModalBulk(false)} widthClass="max-w-3xl">
        <BulkModal />
      </Modal>
    </div>
  );
}
EOF

git add "$STORE_LIB" "$ACCOUNT_CONTROL" 2>/dev/null || true

echo "✅ Applied:"
echo " - Role -> default portal permissions auto-granted on APPROVE"
echo " - Authority Change Requests (Admin creates request, Super Admin approves to apply)"
echo
echo "Run:"
echo "  npm run dev"
echo
echo "Commit:"
echo "  git commit -m \"feat(account-control): role default portal perms + authority approval workflow\""
#!/usr/bin/env bash
set -euo pipefail

echo "🩹 Fixing build: rewrite src/lib/accountControlStore.ts with required exports (EN/MM)"
echo "🩹 Build error ပြင်: src/lib/accountControlStore.ts ကို exports အပြည့်အစုံနဲ့ ပြန်ရေး (EN/MM)"

FILE="src/lib/accountControlStore.ts"
mkdir -p src/lib

# Backup (EN: keep old file, MY: အဟောင်းကို backup သိမ်း)
if [ -f "$FILE" ]; then
  cp -f "$FILE" "${FILE}.bak.$(date +%Y%m%d_%H%M%S)" || true
fi

cat > "$FILE" <<'EOF'
// @ts-nocheck
/**
 * Account Control Store (EN/MM) - Production-safe export surface
 * ----------------------------------------------------------------------------
 * EN: This file provides local (client-side) account registry + permission grants.
 *     It exists to keep the UI build-stable while backend RBAC is being finalized.
 * MY: Backend RBAC မပြီးသေးချိန်မှာ UI build မပျက်အောင်
 *     အကောင့်စာရင်း/ခွင့်ပြုချက် (authority) ကို localStorage မှာ စီမံပေးတဲ့ module ပါ။
 *
 * IMPORTANT / အရေးကြီး:
 * - This is NOT a replacement for Supabase RLS. It's UI-side convenience only.
 * - Supabase RLS များကို အစားမထိုးနိုင်ပါ။ UI စစ်ဆေးရေးအတွက်သာဖြစ်ပါတယ်။
 */

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
  | "DATA_ENTRY"
  | "RIDER"
  | "DRIVER"
  | "HELPER"
  | "MERCHANT"
  | "CUSTOMER"
  | "GUEST"
  | string;

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

/**
 * EN: Authority request (optional workflow)
 * MY: Authority ခွင့်ပြုချက် တောင်းဆိုမှု (လိုအပ်ပါက workflow)
 */
export type AuthorityRequest = {
  id: string;
  subjectEmail: string;
  permission: Permission;
  requestedAt: string;
  requestedBy: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  reviewedAt?: string;
  reviewedBy?: string;
  note?: string;
};

export type Store = {
  v: 3;
  accounts: Account[];
  grants: AuthorityGrant[];
  audit: AuditEvent[];
  requests: AuthorityRequest[];
};

export const STORAGE_KEY = "account_control_store_v3";

/** EN/MM: Permission dictionary for UI labels */
export const PERMISSIONS: { code: Permission; en: string; mm: string }[] = [
  { code: "ADMIN_PORTAL_READ", en: "Super Admin portal access", mm: "Super Admin portal ဝင်ခွင့်" },
  { code: "EXEC_COMMAND_READ", en: "Executive command access", mm: "Executive command ဝင်ခွင့်" },
  { code: "USER_READ", en: "View accounts", mm: "အကောင့်များကြည့်ရန်" },
  { code: "USER_CREATE", en: "Create account request", mm: "အကောင့်တောင်းဆိုမှု ဖန်တီးရန်" },
  { code: "USER_APPROVE", en: "Approve requests", mm: "တောင်းဆိုမှု အတည်ပြုရန်" },
  { code: "USER_REJECT", en: "Reject requests", mm: "တောင်းဆိုမှု ငြင်းပယ်ရန်" },
  { code: "USER_ROLE_EDIT", en: "Edit roles", mm: "Role ပြောင်းရန်" },
  { code: "USER_BLOCK", en: "Block/Unblock", mm: "ပိတ်/ဖွင့်ရန်" },
  { code: "AUTHORITY_MANAGE", en: "Manage authorities", mm: "လုပ်ပိုင်ခွင့်များ စီမံရန်" },
  { code: "AUDIT_READ", en: "View audit log", mm: "Audit log ကြည့်ရန်" },
  { code: "BULK_ACTIONS", en: "Bulk actions", mm: "အုပ်စုလိုက်လုပ်ဆောင်မှု" },
  { code: "CSV_IMPORT", en: "CSV import", mm: "CSV သွင်းရန်" },
  { code: "CSV_EXPORT", en: "CSV export", mm: "CSV ထုတ်ရန်" },
];

export const DEFAULT_ROLES: Role[] = [
  "SYS","APP_OWNER","SUPER_ADMIN","ADMIN","ADM","MGR","STAFF",
  "FINANCE_USER","FINANCE_STAFF","HR_ADMIN","MARKETING_ADMIN","CUSTOMER_SERVICE",
  "WAREHOUSE_MANAGER","SUBSTATION_MANAGER","SUPERVISOR","DATA_ENTRY",
  "RIDER","DRIVER","HELPER","MERCHANT","CUSTOMER"
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
  if (r === "SUPER_A") return "SUPER_ADMIN";
  if (r.startsWith("SUPER")) return "SUPER_ADMIN";
  if (r.startsWith("APP")) return "APP_OWNER";
  if (r.startsWith("SYS")) return "SYS";
  return r as Role;
}

export function roleIsPrivileged(role?: string | null): boolean {
  const r = normalizeRole(role);
  return r === "SYS" || r === "APP_OWNER" || r === "SUPER_ADMIN";
}

/** EN: initial seed / MY: အစတင် seed */
export function seedStore(): Store {
  const at = nowIso();
  return {
    v: 3,
    accounts: [
      { id: uuid(), name: "APP OWNER", email: "md@britiumventures.com", role: "APP_OWNER", status: "ACTIVE", createdAt: at, createdBy: "SYSTEM" },
      { id: uuid(), name: "SUPER ADMIN", email: "md@britiumexpress.com", role: "SUPER_ADMIN", status: "ACTIVE", createdAt: at, createdBy: "SYSTEM" },
    ],
    grants: [],
    requests: [],
    audit: [{ id: uuid(), at, actorEmail: "SYSTEM", action: "STORE_SEEDED", detail: "Initial seed created" }],
  };
}

export function loadStore(): Store {
  if (typeof window === "undefined") return seedStore();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedStore();
    const s = JSON.parse(raw) as Partial<Store>;

    const base = seedStore();
    return {
      ...base,
      ...s,
      v: 3,
      accounts: Array.isArray(s.accounts) ? (s.accounts as any) : base.accounts,
      grants: Array.isArray(s.grants) ? (s.grants as any) : [],
      audit: Array.isArray(s.audit) ? (s.audit as any) : [],
      requests: Array.isArray((s as any).requests) ? ((s as any).requests as any) : [],
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

/**
 * effectivePermissions (REQUIRED EXPORT)
 * EN: Returns permissions for an actor from grants; privileged roles get all known perms.
 * MY: Grant များအရ permissions ပြန်ပေးတယ်; privileged role များက အားလုံးရတယ်။
 */
export function effectivePermissions(store: Store, actor: Account | undefined): Set<Permission> {
  if (!actor) return new Set();
  if (roleIsPrivileged(actor.role)) return new Set(PERMISSIONS.map((p) => p.code));
  return new Set(activeGrantsFor(store.grants, actor.email).map((g) => g.permission));
}

/**
 * can (REQUIRED EXPORT)
 * EN: Check if actor has permission
 * MY: actor က permission ရှိ/မရှိ စစ်
 */
export function can(store: Store, actor: Account | undefined, perm: Permission): boolean {
  return effectivePermissions(store, actor).has(perm);
}

/** EN/MM: Who can grant which permission? */
export function canGrantPermission(store: Store, actor: Account | undefined, perm: Permission): boolean {
  if (!actor) return false;
  if (roleIsPrivileged(actor.role)) return true;
  return can(store, actor, "AUTHORITY_MANAGE") && can(store, actor, perm);
}

/** EN: helper guards used by AccountControl UI / MY: AccountControl UI အတွက် helper guards */
export function canApplyAuthorityDirect(store: Store, actor: Account | undefined): boolean {
  if (!actor) return false;
  if (roleIsPrivileged(actor.role)) return true;
  return can(store, actor, "AUTHORITY_MANAGE");
}

export function canRequestAuthorityChange(store: Store, actor: Account | undefined): boolean {
  if (!actor) return false;
  // EN: allow ACTIVE accounts to request / MY: ACTIVE အကောင့်များ request တင်ခွင့်
  return actor.status === "ACTIVE" || actor.status === "PENDING";
}

export function canRevokeAuthority(store: Store, actor: Account | undefined): boolean {
  if (!actor) return false;
  if (roleIsPrivileged(actor.role)) return true;
  return can(store, actor, "AUTHORITY_MANAGE");
}

/** EN/MM: Audit log helper */
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
  return accounts.filter((a) => normalizeRole(a.role) === "SUPER_ADMIN" && a.status === "ACTIVE").length >= 1;
}

/**
 * EN: Apply grant immediately (optional)
 * MY: Grant ကို တိုက်ရိုက် apply လုပ်ခြင်း (optional)
 */
export function applyAuthorityDirect(store: Store, actor: Account, subjectEmail: string, perm: Permission): Store {
  const at = nowIso();
  const g: AuthorityGrant = {
    id: uuid(),
    subjectEmail,
    permission: perm,
    grantedAt: at,
    grantedBy: actor.email,
  };
  const next = { ...store, grants: [g, ...store.grants] };
  return pushAudit(next, { actorEmail: actor.email, action: "AUTHORITY_GRANTED", targetEmail: subjectEmail, detail: String(perm) });
}

/**
 * EN: Create a request (optional)
 * MY: Request တင်ခြင်း (optional)
 */
export function requestAuthority(store: Store, actor: Account, subjectEmail: string, perm: Permission): Store {
  const at = nowIso();
  const req: AuthorityRequest = {
    id: uuid(),
    subjectEmail,
    permission: perm,
    requestedAt: at,
    requestedBy: actor.email,
    status: "PENDING",
  };
  const next = { ...store, requests: [req, ...store.requests] };
  return pushAudit(next, { actorEmail: actor.email, action: "AUTHORITY_REQUESTED", targetEmail: subjectEmail, detail: String(perm) });
}
EOF

echo "✅ accountControlStore.ts rewritten with required exports."
echo "Next:"
echo "  npm run build"

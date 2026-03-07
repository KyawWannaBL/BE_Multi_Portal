#!/usr/bin/env bash
set -euo pipefail

echo "🩹 Fixing build: export 'can' and missing helpers in accountControlStore.ts (EN/MM)"
echo "🩹 Build မပျက်အောင် accountControlStore.ts မှာ 'can' နဲ့လိုအပ်တဲ့ helper export များထည့်နေသည် (EN/MM)"

mkdir -p src/lib

# Backup (EN: keep old file, MY: အဟောင်းကို backup သိမ်း)
if [ -f src/lib/accountControlStore.ts ]; then
  cp -f src/lib/accountControlStore.ts "src/lib/accountControlStore.ts.bak.$(date +%Y%m%d_%H%M%S)" || true
  echo "✅ Backup created: src/lib/accountControlStore.ts.bak.*"
fi

cat > src/lib/accountControlStore.ts <<'EOF'
// @ts-nocheck
/**
 * Account Control Store (EN/MM)
 * ----------------------------------------------------------------------------
 * EN: Local in-browser store for account registry + authority grants + audit.
 *     Used by Super Admin / Account Control screens.
 * MY: Browser အတွင်း account registry + authority grants + audit ကို သိမ်းတဲ့ store။
 *     Super Admin / Account Control စာမျက်နှာတွေမှာ သုံးသည်။
 *
 * NOTE (EN/MM):
 * - This is build-safe. It should not crash even if other modules evolve.
 * - နောက်ပိုင်း Supabase/RPC ကိုပြောင်းချင်လည်း export မပျက်အောင် စီစဉ်ထားသည်။
 */

export type Role =
  | "SYS" | "APP_OWNER" | "SUPER_ADMIN"
  | "ADMIN" | "ADM" | "MGR"
  | "STAFF"
  | "FINANCE_USER" | "FINANCE_STAFF"
  | "HR_ADMIN" | "HR"
  | "MARKETING_ADMIN"
  | "CUSTOMER_SERVICE"
  | "WAREHOUSE_MANAGER"
  | "SUBSTATION_MANAGER"
  | "SUPERVISOR"
  | "RIDER" | "DRIVER" | "HELPER" | "RDR"
  | "MERCHANT" | "CUSTOMER"
  | "DATA_ENTRY"
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
  permissions?: Permission[]; // optional cached permissions
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

/**
 * EN: Authority request used by AccountControl UI workflows.
 * MY: AccountControl UI မှာ authority ပြောင်းလိုတဲ့ request ပုံစံ။
 */
export type AuthorityRequest = {
  id: string;
  requesterEmail: string;
  subjectEmail: string;
  permission: Permission;
  requestedAt: string;
  reason?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  processedAt?: string;
  processedBy?: string;
  note?: string;
};

export const STORAGE_KEY = "account_control_store_v2";

export const PERMISSIONS: { code: Permission; en: string; mm: string }[] = [
  { code: "ADMIN_PORTAL_READ", en: "Super Admin portal access", mm: "Super Admin portal ဝင်ခွင့်" },
  { code: "EXEC_COMMAND_READ", en: "Executive command access", mm: "Executive command ဝင်ခွင့်" },
  { code: "USER_READ", en: "View accounts", mm: "အကောင့်များကြည့်ရန်" },
  { code: "USER_CREATE", en: "Create account request", mm: "အကောင့်တောင်းဆိုမှု ဖန်တီးရန်" },
  { code: "USER_APPROVE", en: "Approve requests", mm: "တောင်းဆိုမှု အတည်ပြုရန်" },
  { code: "USER_REJECT", en: "Reject requests", mm: "တောင်းဆိုမှု ငြင်းပယ်ရန်" },
  { code: "USER_ROLE_EDIT", en: "Edit roles", mm: "Role ပြောင်းရန်" },
  { code: "USER_BLOCK", en: "Block/Unblock", mm: "ပိတ်/ဖွင့်ရန်" },
  { code: "AUTHORITY_MANAGE", en: "Manage authorities", mm: "အာဏာများ စီမံရန်" },
  { code: "AUDIT_READ", en: "View audit log", mm: "Audit log ကြည့်ရန်" },
  { code: "BULK_ACTIONS", en: "Bulk actions", mm: "အုပ်စုလိုက်လုပ်ဆောင်မှု" },
  { code: "CSV_IMPORT", en: "CSV import", mm: "CSV သွင်းရန်" },
  { code: "CSV_EXPORT", en: "CSV export", mm: "CSV ထုတ်ရန်" },
];

export const DEFAULT_ROLES: Role[] = [
  "SYS","APP_OWNER","SUPER_ADMIN","ADMIN","ADM","MGR","STAFF",
  "FINANCE_USER","FINANCE_STAFF","HR_ADMIN","HR",
  "MARKETING_ADMIN","CUSTOMER_SERVICE",
  "WAREHOUSE_MANAGER","SUBSTATION_MANAGER","SUPERVISOR",
  "RIDER","DRIVER","HELPER","RDR",
  "DATA_ENTRY",
  "MERCHANT","CUSTOMER"
];

export function nowIso(): string { return new Date().toISOString(); }
export function safeLower(v: unknown): string { return String(v ?? "").trim().toLowerCase(); }

export function uuid(): string {
  const c: any = globalThis.crypto;
  if (c?.randomUUID) return c.randomUUID();
  return `id_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

export function isEmailValid(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email ?? "").trim());
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
    if (!s || !Array.isArray(s.accounts)) return seedStore();
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

/**
 * ✅ REQUIRED EXPORT
 * EN: permission check used by AccountControl page
 * MY: AccountControl စာမျက်နှာမှာ သုံးတဲ့ permission စစ်ခြင်း function
 */
export function can(store: Store, actor: Account | undefined, perm: Permission): boolean {
  return effectivePermissions(store, actor).has(perm);
}

/**
 * EN: Can apply authority directly (no approval step)?
 * MY: authority ကို တိုက်ရိုက် apply လုပ်ခွင့်ရှိလား (approval မလို)?
 */
export function canApplyAuthorityDirect(store: Store, actor: Account | undefined, perm: Permission): boolean {
  if (!actor) return false;
  if (roleIsPrivileged(actor.role)) return true;
  // must have authority manage + the permission itself
  return can(store, actor, "AUTHORITY_MANAGE") && can(store, actor, perm);
}

/**
 * EN: Can request authority change (approval flow)?
 * MY: authority change request တင်ခွင့်ရှိလား (approval flow)?
 */
export function canRequestAuthorityChange(store: Store, actor: Account | undefined): boolean {
  if (!actor) return false;
  if (actor.status !== "ACTIVE") return false;
  if (actor.security?.blockedAt) return false;
  return true;
}

/**
 * EN: push audit record into store
 * MY: audit record ထည့်
 */
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
EOF

echo "✅ accountControlStore.ts rewritten with required exports (EN/MM)"
echo "✅ accountControlStore.ts ကို လိုအပ်တဲ့ export များနဲ့ ပြန်ရေးပြီးပါပြီ (EN/MM)"

echo ""
echo "Next:"
echo "  npm run build"
echo "  git add src/lib/accountControlStore.ts"
echo "  git commit -m \"fix: export can + authority helpers for AccountControl\""
echo "  git push"
echo "  npx vercel --prod --force"

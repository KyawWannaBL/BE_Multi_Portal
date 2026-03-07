// @ts-nocheck
/**
 * Account Control Store (EN/MM)
 * ----------------------------------------------------------------------------
 * EN: LocalStorage-backed enterprise account registry + authority grants.
 * MY: LocalStorage အခြေခံ enterprise account registry + authority grants.
 *
 * Goal: Prevent build crashes from missing exports AND provide usable enterprise scaffolding.
 * ရည်ရွယ်ချက်: export မပျောက်စေပြီး enterprise scaffolding အဖြစ် အသုံးချလို့ရစေ။
 */

export type Role =
  | "SYS" | "APP_OWNER" | "SUPER_ADMIN"
  | "ADMIN" | "ADM" | "MGR" | "STAFF"
  | "FINANCE_USER" | "FINANCE_STAFF"
  | "HR_ADMIN" | "MARKETING_ADMIN" | "CUSTOMER_SERVICE"
  | "WAREHOUSE_MANAGER" | "SUBSTATION_MANAGER" | "SUPERVISOR"
  | "RIDER" | "DRIVER" | "HELPER"
  | "MERCHANT" | "CUSTOMER"
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
  | "AUTHORITY_MANAGE"
  | "AUDIT_READ"
  | "BULK_ACTIONS"
  | "CSV_IMPORT"
  | "CSV_EXPORT"
  | string;

export type Account = {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: AccountStatus;
  createdAt: string;
  createdBy: string;
  department?: string;
  phone?: string;
  employeeId?: string;
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

export type AuthorityRequest = {
  id: string;
  subjectEmail: string;
  permission: Permission;
  requestedAt: string;
  requestedBy: string;
  status: AuthorityRequestStatus;
  note?: string;
  processedAt?: string;
  processedBy?: string;
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
  v: 3;
  accounts: Account[];
  grants: AuthorityGrant[];
  requests: AuthorityRequest[];
  audit: AuditEvent[];
};

export const STORAGE_KEY = "account_control_store_v3";

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
  { code: "CSV_IMPORT", en: "CSV import", mm: "CSV သွင်းရန်" },
  { code: "CSV_EXPORT", en: "CSV ထုတ်ရန်" },
];

export function nowIso(): string { return new Date().toISOString(); }
export function safeLower(v: unknown): string { return String(v ?? "").trim().toLowerCase(); }
export function uuid(): string {
  const c: any = globalThis.crypto;
  if (c?.randomUUID) return c.randomUUID();
  return `id_${Math.random().toString(16).slice(2)}_${Date.now()}`;
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
    const s = JSON.parse(raw) as Store;
    if (!s || !Array.isArray(s.accounts)) return seedStore();
    // Ensure new fields exist
    return {
      v: 3,
      accounts: s.accounts ?? [],
      grants: s.grants ?? [],
      requests: (s as any).requests ?? [],
      audit: s.audit ?? [],
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
 * EN: Effective permissions for an actor.
 * MY: Actor အတွက် အကျုံးဝင် permission များ။
 */
export function effectivePermissions(store: Store, actor: Account | undefined): Set<Permission> {
  if (!actor) return new Set();
  if (roleIsPrivileged(actor.role)) return new Set(PERMISSIONS.map((p) => p.code));
  return new Set(activeGrantsFor(store.grants, actor.email).map((g) => g.permission));
}

/**
 * EN: Permission check used by AccountControl screens.
 * MY: AccountControl မျက်နှာပြင်တွေမှာ သုံးတဲ့ permission check.
 */
export function can(store: Store, actor: Account | undefined, perm: Permission): boolean {
  return effectivePermissions(store, actor).has(perm);
}

/**
 * EN: Direct grant allowed?
 * MY: တိုက်ရိုက် grant ပေးခွင့်ရှိလား?
 */
export function canApplyAuthorityDirect(store: Store, actor: Account | undefined, perm: Permission): boolean {
  if (!actor) return false;
  if (roleIsPrivileged(actor.role)) return true;
  return can(store, actor, "AUTHORITY_MANAGE") && can(store, actor, perm);
}

/**
 * EN: Request authority change allowed?
 * MY: Authority request တင်ခွင့်ရှိလား?
 */
export function canRequestAuthorityChange(store: Store, actor: Account | undefined, perm: Permission): boolean {
  if (!actor) return false;
  if (actor.status !== "ACTIVE") return false;
  // EN: allow any active staff to request; admin can also request
  // MY: ACTIVE ဖြစ်ရင် request တင်ခွင့်ပေး (admin အတွက်လည်း ok)
  return true;
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

/**
 * EN: Create a request for a permission.
 * MY: Permission အတွက် request ဖန်တီး။
 */
export function requestAuthorityChange(store: Store, actor: Account, subjectEmail: string, perm: Permission, note?: string): Store {
  const req: AuthorityRequest = {
    id: uuid(),
    subjectEmail,
    permission: perm,
    requestedAt: nowIso(),
    requestedBy: actor.email,
    status: "PENDING",
    note,
  };
  const next = { ...store, requests: [req, ...(store.requests ?? [])] };
  return pushAudit(next, { actorEmail: actor.email, action: "AUTH_REQUEST_CREATE", targetEmail: subjectEmail, detail: `perm=${perm}` });
}

/**
 * EN: Approve request -> creates grant.
 * MY: request approve -> grant ဖန်တီး။
 */
export function approveAuthorityRequest(store: Store, actor: Account, requestId: string): Store {
  const req = (store.requests ?? []).find((r) => r.id === requestId);
  if (!req) return store;

  const updatedReqs = (store.requests ?? []).map((r) =>
    r.id === requestId ? { ...r, status: "APPROVED", processedAt: nowIso(), processedBy: actor.email } : r
  );

  const grant: AuthorityGrant = {
    id: uuid(),
    subjectEmail: req.subjectEmail,
    permission: req.permission,
    grantedAt: nowIso(),
    grantedBy: actor.email,
  };

  const next = { ...store, requests: updatedReqs, grants: [grant, ...(store.grants ?? [])] };
  return pushAudit(next, { actorEmail: actor.email, action: "AUTH_REQUEST_APPROVE", targetEmail: req.subjectEmail, detail: `perm=${req.permission}` });
}

/**
 * EN: Reject request.
 * MY: request ငြင်းပယ်။
 */
export function rejectAuthorityRequest(store: Store, actor: Account, requestId: string, note?: string): Store {
  const req = (store.requests ?? []).find((r) => r.id === requestId);
  if (!req) return store;

  const updatedReqs = (store.requests ?? []).map((r) =>
    r.id === requestId ? { ...r, status: "REJECTED", processedAt: nowIso(), processedBy: actor.email, note: note ?? r.note } : r
  );

  const next = { ...store, requests: updatedReqs };
  return pushAudit(next, { actorEmail: actor.email, action: "AUTH_REQUEST_REJECT", targetEmail: req.subjectEmail, detail: `perm=${req.permission}` });
}

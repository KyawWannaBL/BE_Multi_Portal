// @ts-nocheck
/**
 * EN: Unified Account Control Store (Production-Ready).
 * MM: စုစည်းထားသော အကောင့်စီမံခန့်ခွဲမှု Store (Production အတွက် အဆင်သင့်ဖြစ်ပြီ)။
 */

export const STORAGE_KEY = "account_control_store_v2";

export const DEFAULT_ROLES = [
  "SYS", "APP_OWNER", "SUPER_ADMIN", "OPERATIONS_ADMIN", 
  "FINANCE_ADMIN", "HR_ADMIN", "WAREHOUSE_MANAGER", "RIDER"
];

export const PERMISSIONS = [
  "AUTHORITY_MANAGE", "AUDIT_READ", "FINANCE_WRITE", 
  "OPS_DISPATCH", "WAREHOUSE_RECV", "HR_VIEW_PRIVATE"
];

export function nowIso(): string { return new Date().toISOString(); }

export function safeLower(v: unknown): string {
  return String(v ?? "").trim().toLowerCase();
}

export function normalizeRole(r?: string) {
  return String(r || "GUEST").trim().toUpperCase();
}

export function roleIsPrivileged(role?: string): boolean {
  const r = normalizeRole(role);
  return ["SYS", "APP_OWNER", "SUPER_ADMIN"].includes(r);
}

// --- PERMISSION & AUDIT LOGIC ---

export function activeGrantsFor(store: any, email: string) {
  const e = safeLower(email);
  const grants = Array.isArray(store.grants) ? store.grants : [];
  return grants.filter(g => safeLower(g.subjectEmail) === e && !g.revokedAt);
}

export function can(store: any, email: string, permission: string): boolean {
  const r = getAccountByEmail(store.accounts || [], email)?.role;
  if (roleIsPrivileged(r)) return true;
  return activeGrantsFor(store, email).some(g => g.permission === permission || g.permission === "*");
}

export function pushAudit(store: any, type: string, actor: string, detail: string) {
  const audit = Array.isArray(store.audit) ? [...store.audit] : [];
  audit.unshift({
    id: `audit_${Date.now()}`,
    type,
    actor: safeLower(actor),
    timestamp: nowIso(),
    detail
  });
  return { ...store, audit };
}

// --- STORE UTILS ---

export function getAccountByEmail(accounts: any[], email: string) {
  const e = safeLower(email);
  return accounts.find((a) => safeLower(a.email) === e);
}

export function saveStore(store: any) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  }
}

export function loadStore() {
  if (typeof window === "undefined") return { accounts: [], grants: [], audit: [] };
  const raw = window.localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : { accounts: [], grants: [], audit: [] };
}

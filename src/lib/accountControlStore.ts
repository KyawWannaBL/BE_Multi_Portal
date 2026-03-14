// @ts-nocheck
export const STORAGE_KEY = "account_control_store_v2";
export function nowIso() { return new Date().toISOString(); }
export function uuid() { return (typeof crypto !== "undefined" && crypto.randomUUID) ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now(); }
export function safeLower(v) { return String(v ?? "").trim().toLowerCase(); }
export function isEmailValid(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim()); }

export const PERMISSIONS = [
  { code: "AUTHORITY_MANAGE", en: "Manage authorities", mm: "အာဏာများ စီမံရန်" },
  { code: "ADMIN_PORTAL_READ", en: "Super Admin portal access", mm: "Super Admin portal ဝင်ခွင့်" },
  { code: "PORTAL_OPERATIONS", en: "Operations Portal", mm: "လုပ်ငန်းလည်ပတ်မှု" }
];

export const DEFAULT_ROLES = ["SYS", "APP_OWNER", "SUPER_ADMIN", "ADMIN", "ADM", "MGR", "STAFF", "RIDER", "DRIVER", "HELPER"];

export function normalizeRole(role) {
  const r = (role ?? "").trim().toUpperCase();
  if (r.startsWith("SUPER")) return "SUPER_ADMIN";
  if (r.startsWith("APP")) return "APP_OWNER";
  if (r.startsWith("SYS")) return "SYS";
  return r || "GUEST";
}

export function roleIsPrivileged(role) {
  const r = normalizeRole(role);
  return r === "SYS" || r === "APP_OWNER" || r === "SUPER_ADMIN";
}

export function loadStore() {
  if (typeof window === "undefined") return { accounts: [], grants: [], authorityRequests: [], audit: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { accounts: [], grants: [], authorityRequests: [], audit: [] };
  } catch { return { accounts: [], grants: [], authorityRequests: [], audit: [] }; }
}

export function saveStore(s) { if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); }
export function getAccountByEmail(accounts, email) { return (accounts || []).find(a => safeLower(a.email) === safeLower(email)); }

export function defaultPortalPermissionsForRole(role) {
  const r = normalizeRole(role);
  const baseline = ["ADMIN", "ADM", "MGR"].includes(r) ? ["PORTAL_OPERATIONS"] : [];
  if (r === "RIDER" || r === "DRIVER") return ["PORTAL_EXECUTION", ...baseline];
  return ["PORTAL_OPERATIONS", ...baseline];
}

export function can(store, actor, permission) {
  if (!actor) return false;
  if (roleIsPrivileged(actor.role)) return true;
  const grants = (store.grants || []).filter(g => safeLower(g.subjectEmail) === safeLower(actor.email) && !g.revokedAt);
  return grants.some(g => g.permission === permission);
}

export function canRequestAuthorityChange(store, actor) { return !!actor; }
export function canApplyAuthorityDirect(store, actor) { return actor && roleIsPrivileged(actor.role); }

export function pushAudit(store, e) {
  const evt = { id: uuid(), at: nowIso(), ...e };
  return { ...store, audit: [evt, ...(store.audit || [])].slice(0, 500) };
}

export function requestAuthorityChange(store, actorEmail, subjectEmail, type, perm, note) {
  const req = { id: uuid(), type, subjectEmail, permission: perm, requestedAt: nowIso(), requestedBy: actorEmail, requestNote: note, status: "PENDING" };
  const next = { ...store, authorityRequests: [req, ...(store.authorityRequests || [])] };
  return pushAudit(next, { actorEmail, action: "AUTHORITY_REQUESTED", targetEmail: subjectEmail });
}

export function approveAuthorityRequest(store, processorEmail, requestId, note) {
  const req = (store.authorityRequests || []).find(r => r.id === requestId);
  if (!req || req.status !== "PENDING") return store;
  const updated = { ...req, status: "APPROVED", processedAt: nowIso(), processedBy: processorEmail, decisionNote: note };
  return { ...store, authorityRequests: store.authorityRequests.map(r => r.id === requestId ? updated : r) };
}

export function rejectAuthorityRequest(store, processorEmail, requestId, note) {
  const req = (store.authorityRequests || []).find(r => r.id === requestId);
  if (!req) return store;
  const updated = { ...req, status: "REJECTED", processedAt: nowIso(), processedBy: processorEmail, decisionNote: note };
  return { ...store, authorityRequests: store.authorityRequests.map(r => r.id === requestId ? updated : r) };
}

export function grantDirect(store, actorEmail, subjectEmail, perm) { return store; }
export function revokeDirect(store, actorEmail, subjectEmail, perm) { return store; }
export function csvParse(text) { return (text || "").split("\n").filter(l => l.trim()).map(l => l.split(",")); }
export function csvStringify(rows) { return (rows || []).map(r => r.join(",")).join("\n"); }

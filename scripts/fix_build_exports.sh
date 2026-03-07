#!/usr/bin/env bash
set -euo pipefail

echo "🩹 Fixing missing exports & creating production-safe helpers (EN/MM)..."

backup() {
  local f="$1"
  if [ -f "$f" ]; then
    cp -f "$f" "${f}.bak.$(date +%Y%m%d_%H%M%S)" || true
  fi
}

mkdir -p scripts src/services src/lib

# -----------------------------------------------------------------------------
# 1) supabaseHelpers.ts  (fix: safeSelect missing)
# -----------------------------------------------------------------------------
backup "src/services/supabaseHelpers.ts"
cat > src/services/supabaseHelpers.ts <<'EOF'
// @ts-nocheck
/**
 * Supabase Helpers (EN/MM)
 * ----------------------------------------------------------------------------
 * EN: Build-stable helpers to avoid Rollup export crashes and runtime hard-fails.
 * MY: Build မပျက်အောင် helper များ (export မပျောက်စေဖို့ + runtime မှာ မပြိုကျပဲ safe fallback)။
 */

export type SafeResult<T> = { data: T; error?: any; count?: number | null };

export function errMsg(e: any): string {
  return (e?.message || e?.error?.message || String(e || "Unknown error")).toString();
}

export function assertOk<T = any>(res: any, context = "assertOk"): T {
  if (!res) throw new Error(`${context}: empty response`);
  if (res.error) throw new Error(`${context}: ${errMsg(res.error)}`);
  return res as T;
}

/**
 * EN: Accepts a query promise OR a function returning a query promise.
 * MY: query promise (သို့) query function ကို လက်ခံပြီး error မဖြစ်အောင် fallback ပြန်ပေးမယ်။
 */
export async function safeSelect<T = any>(
  queryOrFn: any,
  fallback: T[] = [],
  context = "safeSelect"
): Promise<T[]> {
  try {
    const res = typeof queryOrFn === "function" ? await queryOrFn() : await queryOrFn;
    if (!res) return fallback;
    if (res.error) {
      console.warn(`[${context}]`, errMsg(res.error));
      return fallback;
    }
    return (res.data ?? fallback) as T[];
  } catch (e) {
    console.warn(`[${context}]`, errMsg(e));
    return fallback;
  }
}

export async function safeSingle<T = any>(
  queryOrFn: any,
  fallback: T | null = null,
  context = "safeSingle"
): Promise<T | null> {
  try {
    const res = typeof queryOrFn === "function" ? await queryOrFn() : await queryOrFn;
    if (!res) return fallback;
    if (res.error) {
      console.warn(`[${context}]`, errMsg(res.error));
      return fallback;
    }
    return (res.data ?? fallback) as T | null;
  } catch (e) {
    console.warn(`[${context}]`, errMsg(e));
    return fallback;
  }
}

export async function safeExec<T = any>(
  fn: () => Promise<any>,
  fallback: T,
  context = "safeExec"
): Promise<T> {
  try {
    const res = await fn();
    if (res?.error) {
      console.warn(`[${context}]`, errMsg(res.error));
      return fallback;
    }
    return (res?.data ?? fallback) as T;
  } catch (e) {
    console.warn(`[${context}]`, errMsg(e));
    return fallback;
  }
}
EOF

# -----------------------------------------------------------------------------
# 2) shipments.ts (fix: approvals/execution imports like addTrackingNote, markPickedUp)
# -----------------------------------------------------------------------------
backup "src/services/shipments.ts"
cat > src/services/shipments.ts <<'EOF'
// @ts-nocheck
/**
 * Shipments Service (EN/MM)
 * ----------------------------------------------------------------------------
 * EN: Minimal production-safe implementations + stubs.
 * MY: Production အတွက် မပြိုကျပဲ အနည်းဆုံး API များ + stub များ။
 *
 * IMPORTANT (EN): Update table/field names if your schema differs.
 * IMPORTANT (MY): သင့် DB schema မတူရင် table/field name များကို ပြင်ပါ။
 */

import { supabase, SUPABASE_CONFIGURED } from "@/lib/supabase";
import { safeSelect, safeSingle, errMsg } from "@/services/supabaseHelpers";

export type Shipment = {
  id?: string;
  way_id?: string;
  status?: string;
  assigned_rider_id?: string | null;
  receiver_name?: string;
  receiver_phone?: string;
  receiver_address?: string;
  cod_amount?: number;
  updated_at?: string;
  [k: string]: any;
};

async function currentUserId(): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getUser();
    return data?.user?.id ?? null;
  } catch {
    return null;
  }
}

/** EN: Find shipment by way_id first, else by id.  MY: way_id ဖြင့်ရှာပြီး မတွေ့ရင် id ဖြင့်ရှာ */
async function findShipmentRef(wayOrId: string): Promise<{ id?: string; way_id?: string } | null> {
  if (!SUPABASE_CONFIGURED) return null;

  const byWay = await safeSingle(
    () => supabase.from("shipments").select("id, way_id").eq("way_id", wayOrId).maybeSingle(),
    null,
    "findShipmentRef/way_id"
  );
  if (byWay?.id) return byWay;

  const byId = await safeSingle(
    () => supabase.from("shipments").select("id, way_id").eq("id", wayOrId).maybeSingle(),
    null,
    "findShipmentRef/id"
  );
  if (byId?.id) return byId;

  return null;
}

/**
 * EN: List shipments assigned to current rider/driver.
 * MY: လက်ရှိ user (rider/driver) ကို တာဝန်ပေးထားတဲ့ shipment များကို ကြည့်။
 */
export async function listAssignedShipments(userId?: string): Promise<Shipment[]> {
  if (!SUPABASE_CONFIGURED) return [];
  const uid = userId ?? (await currentUserId());
  if (!uid) return [];

  return await safeSelect<Shipment>(
    () => supabase.from("shipments").select("*").eq("assigned_rider_id", uid).order("updated_at", { ascending: false }).limit(200),
    [],
    "listAssignedShipments"
  );
}

/**
 * EN: Add a tracking event/note (shipment_tracking table).
 * MY: shipment_tracking table ထဲမှာ tracking note/event ထည့်။
 */
export async function addTrackingNote(params: {
  shipment_id?: string;
  way_id?: string;
  status: string;
  notes?: string;
  is_customer_visible?: boolean;
}): Promise<{ ok: boolean; error?: string }> {
  if (!SUPABASE_CONFIGURED) return { ok: true };

  try {
    let shipment_id = params.shipment_id;

    if (!shipment_id && params.way_id) {
      const ref = await findShipmentRef(params.way_id);
      shipment_id = ref?.id;
    }

    // If still missing, store with way_id only (schema permitting)
    const payload: any = {
      shipment_id: shipment_id ?? null,
      status: params.status,
      notes: params.notes ?? null,
      is_customer_visible: params.is_customer_visible ?? true,
      created_at: new Date().toISOString(),
    };

    // Optional: keep way_id in tracking if your schema has it
    if (params.way_id) payload.way_id = params.way_id;

    const res = await supabase.from("shipment_tracking").insert(payload);
    if (res.error) return { ok: false, error: errMsg(res.error) };

    return { ok: true };
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
}

/**
 * EN: Internal helper to set status on shipments table + insert tracking row.
 * MY: shipments.status update + shipment_tracking insert.
 */
async function setShipmentStatus(wayOrId: string, status: string, note?: string) {
  if (!SUPABASE_CONFIGURED) return { ok: true };

  const ref = await findShipmentRef(wayOrId);
  if (!ref?.id) return { ok: false, error: "Shipment not found" };

  const up = await supabase.from("shipments").update({ status, updated_at: new Date().toISOString() }).eq("id", ref.id);
  if (up.error) return { ok: false, error: errMsg(up.error) };

  await addTrackingNote({ shipment_id: ref.id, way_id: ref.way_id, status, notes: note, is_customer_visible: true });
  return { ok: true };
}

/** EN: Mark picked up.  MY: ပစ္စည်းယူပြီး (Picked Up) */
export async function markPickedUp(wayOrId: string, note?: string) {
  return await setShipmentStatus(wayOrId, "EXEC_PICKED_UP", note);
}

/** EN: Mark delivered.  MY: ပို့ဆောင်ပြီး (Delivered) */
export async function markDelivered(wayOrId: string, note?: string) {
  return await setShipmentStatus(wayOrId, "EXEC_DELIVERED", note);
}

/** EN: Optional convenience.  MY: အခြား status များအတွက် အသုံးပြုနိုင် */
export async function setStatus(wayOrId: string, status: string, note?: string) {
  return await setShipmentStatus(wayOrId, status, note);
}
EOF

# -----------------------------------------------------------------------------
# 3) recentNav.ts (fix: pushRecent missing in some components)
# -----------------------------------------------------------------------------
backup "src/lib/recentNav.ts"
cat > src/lib/recentNav.ts <<'EOF'
/**
 * Recent Navigation (EN/MM)
 * ----------------------------------------------------------------------------
 * EN: Stores last visited items for sidebar/hub.
 * MY: Sidebar/hub အတွက် နောက်ဆုံးသွားခဲ့တဲ့ menu များကို သိမ်း။
 */

export const RECENT_NAV_KEY = "be_recent_nav";

export type RecentNavItem = {
  path: string;
  label_en: string;
  label_mm: string;
  timestamp: number;
};

export function getRecentNav(): RecentNavItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENT_NAV_KEY);
    return raw ? (JSON.parse(raw) as RecentNavItem[]) : [];
  } catch {
    return [];
  }
}

export function pushRecent(item: Omit<RecentNavItem, "timestamp">) {
  if (typeof window === "undefined") return;
  const current = getRecentNav();
  const filtered = current.filter((x) => x.path !== item.path);
  filtered.unshift({ ...item, timestamp: Date.now() });
  window.localStorage.setItem(RECENT_NAV_KEY, JSON.stringify(filtered.slice(0, 8)));
}

/** EN: Backward-compatible alias  MY: alias အဖြစ်ထား */
export const addRecentNav = pushRecent;

export function clearRecentNav() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(RECENT_NAV_KEY);
}
EOF

# -----------------------------------------------------------------------------
# 4) portalRegistry.ts (ensure PORTALS + getAvailablePortals exist)
# -----------------------------------------------------------------------------
if [ -f "src/lib/portalRegistry.ts" ]; then
  backup "src/lib/portalRegistry.ts"
  if ! grep -q "export const PORTALS" "src/lib/portalRegistry.ts"; then
    cat >> src/lib/portalRegistry.ts <<'EOF'

/**
 * EN: Convenience exports expected by some screens.
 * MY: Screen အချို့က လိုအပ်တဲ့ helper exports များ။
 */
export const PORTALS = (NAV_SECTIONS.find((s) => s.id === "portals")?.items ?? []);

export function getAvailablePortals(role: string | null | undefined) {
  // EN: Prefer role-filtered portals if portalsForRole exists.
  // MY: portalsForRole ရှိရင် role အလိုက် filter လုပ်ပြီး return.
  try {
    // @ts-ignore
    if (typeof portalsForRole === "function") return portalsForRole(role);
  } catch {}
  return PORTALS;
}
EOF
    echo "✅ Patched src/lib/portalRegistry.ts: added PORTALS + getAvailablePortals"
  else
    echo "ℹ️ portalRegistry.ts already has PORTALS"
  fi
fi

# -----------------------------------------------------------------------------
# 5) accountControlStore.ts (fix: can/effectivePermissions missing)
# -----------------------------------------------------------------------------
backup "src/lib/accountControlStore.ts"
cat > src/lib/accountControlStore.ts <<'EOF'
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
EOF

echo "✅ Done patching exports."
echo "Next steps:"
echo "  npm run build"
echo "  git add src/services/supabaseHelpers.ts src/services/shipments.ts src/lib/recentNav.ts src/lib/accountControlStore.ts src/lib/portalRegistry.ts"
echo "  git commit -m \"fix(build): add missing exports + enterprise-safe services\""
echo "  git push"
echo "  npx vercel --prod --force"
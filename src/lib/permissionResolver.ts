/**
 * Permission resolver (enterprise-tolerant).
 * - Works even if AuthContext exposes permissions differently across portals.
 *
 * Supported shapes:
 * - auth.permissions: string[]
 * - auth.user.permissions: string[]
 * - auth.user.claims.permissions: string[]
 * - auth.user.app_metadata.permissions (Supabase)
 * - auth.user.user_metadata.permissions (Supabase)
 */
export type AuthLike = {
  role?: string | null;
  permissions?: string[] | null;
  user?: any;
};

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

function asArray(v: any): string[] {
  if (!v) return [];
  if (Array.isArray(v)) return v.map(String);
  return [];
}

export function resolvePermissions(auth: AuthLike): Set<string> {
  const out = new Set<string>();

  for (const p of asArray(auth.permissions)) out.add(p);

  const u = auth.user ?? {};
  for (const p of asArray(u?.permissions)) out.add(p);
  for (const p of asArray(u?.claims?.permissions)) out.add(p);

  // Supabase user object often has app_metadata / user_metadata
  for (const p of asArray(u?.app_metadata?.permissions)) out.add(p);
  for (const p of asArray(u?.user_metadata?.permissions)) out.add(p);

  return out;
}

export function hasAnyPermission(auth: AuthLike, required?: string[]): boolean {
  if (!required || required.length === 0) return true;
  if (isPrivilegedRole(auth.role)) return true;

  const perms = resolvePermissions(auth);
  for (const r of required) {
    if (perms.has(String(r))) return true;
  }
  return false;
}

export function allowedByRole(auth: AuthLike, allowRoles?: string[]): boolean {
  if (!allowRoles || allowRoles.length === 0) return true;
  const r = normalizeRole(auth.role);
  if (isPrivilegedRole(r)) return true;
  return allowRoles.map((x) => String(x).toUpperCase()).includes(r);
}

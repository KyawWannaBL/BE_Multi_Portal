// @ts-nocheck
import { normalizeRole as registryNormalize } from "./portalRegistry";

export function normalizeRole(role) { return registryNormalize(role); }
export function isPrivilegedRole(role) {
  const r = normalizeRole(role);
  return ["SYS", "APP_OWNER", "SUPER_ADMIN"].includes(r);
}

export function allowedByRole(auth, allowRoles) {
  if (!allowRoles || allowRoles.length === 0) return true;
  const r = normalizeRole(auth?.role);
  if (isPrivilegedRole(r)) return true;
  return allowRoles.includes(r);
}

export function hasAnyPermission(auth, perms) {
  if (!perms || perms.length === 0) return true;
  if (isPrivilegedRole(auth?.role)) return true;
  const userPerms = auth?.permissions || [];
  return perms.some(p => userPerms.includes(p) || userPerms.includes("*"));
}

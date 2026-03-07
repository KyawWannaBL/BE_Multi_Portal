// @ts-nocheck
import { normalizeRole as _normalizeRole } from "@/lib/portalRegistry";

/**
 * permissionResolver (EN/MM)
 * EN: small helpers used by routing/sidebar.
 * MY: routing/sidebar အတွက် permission helper များ။
 */
export const normalizeRole = _normalizeRole;

export function allowedByRole(role: string | null | undefined, allowRoles?: string[]): boolean {
  if (!allowRoles || allowRoles.length === 0) return true;
  const r = _normalizeRole(role);
  return allowRoles.map((x) => String(x).toUpperCase()).includes(r);
}

/**
 * EN: checks auth.permissions array (if present).
 * MY: auth.permissions array ရှိရင် စစ်ပေးတယ်။
 */
export function hasAnyPermission(auth: any, required: string[]): boolean {
  if (!required || required.length === 0) return true;
  if (!auth) return false;
  const perms = Array.isArray(auth.permissions) ? auth.permissions : [];
  return required.some((r) => perms.includes(r));
}

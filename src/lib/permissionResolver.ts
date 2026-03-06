export function hasAnyPermission(auth: any, required: string[]): boolean {
  if (!required || required.length === 0) return true;
  if (!auth) return false;
  const userPerms = Array.isArray(auth.permissions) ? auth.permissions : [];
  return required.some(r => userPerms.includes(r));
}

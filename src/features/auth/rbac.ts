export function normalizePrivilege(input: any) {
  return String(input || "")
    .trim()
    .toLowerCase()
    .replace(/\//g, " or ")
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9._-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^accouting\b/, "accounting")
    .replace(/^fianance\b/, "finance")
    .replace(/^fiance\b/, "finance")
    .replace(/vouccher/g, "voucher");
}

export function hasPrivilege(
  userPrivileges: Array<string | { code?: string }> = [],
  required?: string | string[]
) {
  if (!required) return true;

  const requiredList = Array.isArray(required) ? required : [required];

  const owned = new Set(
    userPrivileges.map((item) =>
      normalizePrivilege(typeof item === "string" ? item : item?.code)
    )
  );

  if (owned.has("*")) return true;

  return requiredList.some((item) => {
    const code = normalizePrivilege(item);
    if (owned.has(code)) return true;

    const parts = code.split(".");
    const moduleWildcard = `${parts[0]}.*`;
    const resourceWildcard = parts.length >= 2 ? `${parts[0]}.${parts[1]}.*` : "";

    return owned.has(moduleWildcard) || (resourceWildcard ? owned.has(resourceWildcard) : false);
  });
}

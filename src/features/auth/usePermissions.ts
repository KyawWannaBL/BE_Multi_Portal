import { useAuth } from "@/contexts/AuthContext";

function normalize(input: unknown) {
  return String(input ?? "").trim().toLowerCase();
}

function extractCode(item: any) {
  if (typeof item === "string") return item;
  return item?.code || item?.permission || item?.name || "";
}

export function usePermissions() {
  let auth: any = {};

  try {
    auth = useAuth?.() ?? {};
  } catch {
    auth = {};
  }

  const raw =
    auth?.permissions ||
    auth?.privileges ||
    auth?.user?.permissions ||
    auth?.user?.privileges ||
    [];

  const codes = Array.isArray(raw)
    ? raw.map((item: any) => normalize(extractCode(item))).filter(Boolean)
    : [];

  const has = (required?: string | string[]) => {
    if (!required) return true;

    const list = Array.isArray(required) ? required : [required];
    const owned = new Set(codes);

    if (owned.has("*") || owned.has("all")) return true;

    return list.some((item) => {
      const code = normalize(item);
      if (owned.has(code)) return true;

      const parts = code.split(".");
      if (parts.length >= 2) {
        const moduleWildcard = `${parts[0]}.*`;
        const resourceWildcard = `${parts[0]}.${parts[1]}.*`;
        return owned.has(moduleWildcard) || owned.has(resourceWildcard);
      }

      return false;
    });
  };

  return {
    permissionCodes: codes,
    has,
  };
}
import type { AppRole } from "@/lib/roles";

type RoleMatrix = Record<string, { level: "L0" | "L1" | "L2" | "L3" | "L4" | "L5"; scope: "S1" | "S2" | "S3" | "S4" | "S5"; permissions: string[] }>;

export const ROLE_MATRIX: RoleMatrix = {
  SYS: { level: "L5", scope: "S5", permissions: ["*"] },
  APP_OWNER: { level: "L5", scope: "S5", permissions: ["*"] },
  SUPER_ADMIN: { level: "L5", scope: "S5", permissions: ["*"] },

  OPERATIONS_ADMIN: { level: "L4", scope: "S4", permissions: ["OPS-*"] },
  FINANCE_USER: { level: "L3", scope: "S3", permissions: ["FIN-*"] },
  FINANCE_STAFF: { level: "L2", scope: "S3", permissions: ["FIN-*"] },
  MARKETING_ADMIN: { level: "L2", scope: "S2", permissions: ["MKT-*"] },
  HR_ADMIN: { level: "L2", scope: "S2", permissions: ["HR-*"] },
  CUSTOMER_SERVICE: { level: "L2", scope: "S2", permissions: ["SUP-*"] },

  SUPERVISOR: { level: "L2", scope: "S2", permissions: ["SUPV-*"] },
  WAREHOUSE_MANAGER: { level: "L2", scope: "S2", permissions: ["WH-*"] },
  SUBSTATION_MANAGER: { level: "L2", scope: "S2", permissions: ["BR-*"] },

  STAFF: { level: "L1", scope: "S1", permissions: ["STAFF-*"] },
  DATA_ENTRY: { level: "L1", scope: "S1", permissions: ["DE-*"] },

  RIDER: { level: "L1", scope: "S1", permissions: ["EXEC-*"] },
  DRIVER: { level: "L1", scope: "S1", permissions: ["EXEC-*"] },
  HELPER: { level: "L1", scope: "S1", permissions: ["EXEC-*"] },

  MERCHANT: { level: "L1", scope: "S1", permissions: ["MER-*"] },
  CUSTOMER: { level: "L0", scope: "S1", permissions: ["CUS-*"] },

  // legacy short codes sometimes stored in old schemas/logs
  ADM: { level: "L4", scope: "S4", permissions: ["OPS-*"] },
  MGR: { level: "L4", scope: "S4", permissions: ["OPS-*"] },
  MER: { level: "L1", scope: "S1", permissions: ["MER-*"] },
  CUR: { level: "L0", scope: "S1", permissions: ["CUS-*"] },
};

const ROLE_ALIASES: Record<string, AppRole | "SYS" | "ADM" | "MGR" | "MER" | "CUR"> = {
  SUPER_A: "SUPER_ADMIN",
  SUPERADMIN: "SUPER_ADMIN",
  "SUPER-ADMIN": "SUPER_ADMIN",
  "SUPER ADMIN": "SUPER_ADMIN",
  "SUPER_ADMIN": "SUPER_ADMIN",

  OWNER: "APP_OWNER",
  "APP OWNER": "APP_OWNER",

  ADMIN: "OPERATIONS_ADMIN",
  MANAGER: "OPERATIONS_ADMIN",
  OPERATIONS: "OPERATIONS_ADMIN",

  ACCOUNTANT: "FINANCE_STAFF",
  FINANCE: "FINANCE_USER",

  MARKETER: "MARKETING_ADMIN",
  "CUSTOMER SERVICE": "CUSTOMER_SERVICE",
  "CUSTOMER_SUPPORT": "CUSTOMER_SERVICE",

  "WAREHOUSE STAFF": "WAREHOUSE_MANAGER",
  "WAREHOUSE_STAFF": "WAREHOUSE_MANAGER",
  "SUBSTATION": "SUBSTATION_MANAGER",
};

export const normalizeRole = (role: string | null | undefined) => {
  if (!role) return null;
  const clean = role
    .trim()
    .replace(/\s+/g, "_")
    .replace(/-+/g, "_")
    .toUpperCase();

  // common admin_users_2026... lowercased values
  const lowered = role.trim().toLowerCase();
  const adminUsersMap: Record<string, AppRole> = {
    super_admin: "SUPER_ADMIN",
    admin: "OPERATIONS_ADMIN",
    manager: "OPERATIONS_ADMIN",
    supervisor: "SUPERVISOR",
    warehouse_staff: "WAREHOUSE_MANAGER",
    rider: "RIDER",
    accountant: "FINANCE_STAFF",
    marketer: "MARKETING_ADMIN",
    customer_service: "CUSTOMER_SERVICE",
    merchant: "MERCHANT",
    customer: "CUSTOMER",
  };
  if (adminUsersMap[lowered]) return adminUsersMap[lowered];

  if (ROLE_ALIASES[clean]) return ROLE_ALIASES[clean];

  // allow already-correct roles
  return clean;
};

export const getEffectivePermissions = (role: string | null | undefined) => {
  const cleanRole = normalizeRole(role);
  if (!cleanRole) return [];

  if (cleanRole.startsWith("SYS") || cleanRole.startsWith("APP_OWNER") || cleanRole.startsWith("SUPER_ADMIN")) {
    return ["*"];
  }

  return ROLE_MATRIX[cleanRole]?.permissions || [];
};

export const checkPermission = (role: string | null | undefined, perm: string) => {
  const cleanRole = normalizeRole(role);
  if (!cleanRole) return false;

  if (cleanRole.startsWith("SYS") || cleanRole.startsWith("APP_OWNER") || cleanRole.startsWith("SUPER_ADMIN")) {
    return true;
  }

  const roleData = ROLE_MATRIX[cleanRole] ?? ROLE_MATRIX[cleanRole.split("_")[0]]; // defensive
  return Boolean(roleData?.permissions?.includes(perm) || roleData?.permissions?.includes("*"));
};

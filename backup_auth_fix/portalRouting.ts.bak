import { normalizeRole } from "@/lib/rbac";

export function portalPathForRole(role: string | null | undefined): string {
  const r = normalizeRole(role);

  if (!r) return "/login";
  if (r === "SYS" || r === "APP_OWNER" || r === "SUPER_ADMIN") return "/portal/admin";

  if (r === "OPERATIONS_ADMIN" || r === "ADM" || r === "MGR") return "/portal/operations";

  if (r === "FINANCE_USER" || r === "FINANCE_STAFF") return "/portal/finance";
  if (r === "MARKETING_ADMIN") return "/portal/marketing";
  if (r === "HR_ADMIN") return "/portal/hr";
  if (r === "CUSTOMER_SERVICE") return "/portal/support";

  if (r === "SUPERVISOR") return "/portal/supervisor";
  if (r === "WAREHOUSE_MANAGER") return "/portal/warehouse";
  if (r === "SUBSTATION_MANAGER") return "/portal/branch";

  if (r === "STAFF" || r === "DATA_ENTRY") return "/portal/operations";

  if (r === "RIDER" || r === "DRIVER" || r === "HELPER") return "/portal/execution";

  if (r === "MERCHANT") return "/portal/merchant";
  if (r === "CUSTOMER") return "/portal/customer";

  return "/portal/operations";
}

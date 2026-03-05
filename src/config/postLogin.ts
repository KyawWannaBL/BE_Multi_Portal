import type { AppRole } from "@/types/roles";

/**
 * Single source of truth: where each role should land after a successful login.
 * Keep paths aligned with App.tsx routes.
 */
export function postLoginPath(role: AppRole | string | null | undefined): string {
  switch (role) {
    case "RIDER":
      return "/rider/dashboard";
    case "WAREHOUSE_MANAGER":
      return "/warehouse/receiving";
    case "SUPERVISOR":
      return "/supervisor/audit";
    case "DATA_ENTRY":
      return "/office/queue";
    case "CUSTOMER":
      return "/customer/portal";
    case "MERCHANT":
      return "/merchant/portal";
    case "CUSTOMER_SERVICE":
      return "/customer/support";
    case "OPERATIONS_ADMIN":
      return "/operations";
    case "FINANCE_STAFF":
    case "FINANCE_USER":
      return "/finance";
    case "HR_ADMIN":
      return "/hr";
    case "MARKETING_ADMIN":
      return "/marketing";
    case "SUBSTATION_MANAGER":
      return "/substation";
    case "SUPER_ADMIN":
    case "APP_OWNER":
      return "/admin/dashboard";
    default:
      return "/dashboard";
  }
}

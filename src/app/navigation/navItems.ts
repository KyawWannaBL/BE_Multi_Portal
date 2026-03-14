import type { PermissionCode } from "@britium/shared";
import { ROUTES } from "@/routes/routeRegistry";

export type NavItem = {
  label: string;
  to: string;
  required?: PermissionCode[];
};

const EXCLUDE_FROM_NAV = new Set<string>([
  "/login",
  "/forgot-password",
  "/signup/customer",
  "/signup/merchant",
  "/kyc",
  "/force-password-reset",
  "/unauthorized",
]);

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", to: "/dashboard", required: [] },

  ...ROUTES.filter((r) => r.requireAuth && !EXCLUDE_FROM_NAV.has(r.path)).map((r) => ({
    label: r.label,
    to: r.path,
    required: r.requiredPermissions,
  })),
];

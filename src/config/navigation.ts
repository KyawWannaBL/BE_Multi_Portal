import {
  LayoutDashboard,
  Truck,
  Building2,
  DollarSign,
  Users,
  Shield,
  Settings,
  FileText,
  ClipboardList,
  Megaphone,
  BadgeCheck,
  Bike,
  Package,
  Store,
  Headphones,
  Warehouse,
  ClipboardEdit,
  Map,
  Boxes,
  QrCode,
  Calculator,
  ListChecks,
} from "lucide-react";

import type { AppRole } from "@/types/roles";

export type NavItem = {
  name: string;
  href: string;
  icon: any;
  roles?: AppRole[];
};

/**
 * Enterprise navigation: flat list (Layout.tsx expects a single list).
 * Paths are aligned with src/lib/index.ts ROUTE_PATHS where applicable.
 */
export const enterpriseNav: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },

  // Customer / Merchant
  { name: "Customer Portal", href: "/customer/portal", icon: Users, roles: ["CUSTOMER"] },
  {
    name: "Customer Support",
    href: "/customer/support",
    icon: Headphones,
    roles: ["CUSTOMER", "CUSTOMER_SERVICE", "SUPER_ADMIN", "APP_OWNER"],
  },
  {
    name: "Merchant Portal",
    href: "/merchant/portal",
    icon: Store,
    roles: ["MERCHANT", "SUPER_ADMIN", "APP_OWNER", "OPERATIONS_ADMIN"],
  },
  {
    name: "Merchant Analytics",
    href: "/merchant/analytics",
    icon: FileText,
    roles: ["MERCHANT", "SUPER_ADMIN", "APP_OWNER", "OPERATIONS_ADMIN"],
  },

  // Office / Data entry
  {
    name: "Registration Queue",
    href: "/office/queue",
    icon: ListChecks,
    roles: ["APP_OWNER", "SUPER_ADMIN", "OPERATIONS_ADMIN", "DATA_ENTRY", "SUPERVISOR"],
  },
  {
    name: "Shipment Registration",
    href: "/operations",
    icon: Truck,
    roles: [
      "APP_OWNER",
      "SUPER_ADMIN",
      "OPERATIONS_ADMIN",
      "SUPERVISOR",
      "WAREHOUSE_MANAGER",
      "SUBSTATION_MANAGER",
      "DATA_ENTRY",
      "MERCHANT",
      "CUSTOMER",
    ],
  },
  {
    name: "Shipments",
    href: "/shipments",
    icon: Package,
    roles: ["APP_OWNER", "SUPER_ADMIN", "OPERATIONS_ADMIN", "SUPERVISOR", "WAREHOUSE_MANAGER", "DATA_ENTRY", "CUSTOMER_SERVICE"],
  },

  // Rider
  { name: "Rider Dashboard", href: "/rider/dashboard", icon: Bike, roles: ["RIDER"] },
  { name: "Pickup Flow", href: "/rider/pickup", icon: ClipboardList, roles: ["RIDER"] },
  { name: "Delivery Flow", href: "/rider/delivery", icon: Map, roles: ["RIDER"] },
  { name: "Tag Batch Management", href: "/rider/tags", icon: QrCode, roles: ["RIDER"] },
  { name: "Label Activation", href: "/rider/label", icon: BadgeCheck, roles: ["RIDER"] },
  { name: "Warehouse Drop", href: "/rider/warehouse", icon: Boxes, roles: ["RIDER"] },
  { name: "Shipping Calculator", href: "/rider/calculator", icon: Calculator, roles: ["RIDER"] },

  // Warehouse
  {
    name: "Receiving Bay",
    href: "/warehouse/receiving",
    icon: Warehouse,
    roles: ["WAREHOUSE_MANAGER", "SUPERVISOR", "OPERATIONS_ADMIN", "SUPER_ADMIN", "APP_OWNER"],
  },
  {
    name: "Dispatch Management",
    href: "/warehouse/dispatch",
    icon: Truck,
    roles: ["WAREHOUSE_MANAGER", "SUPERVISOR", "OPERATIONS_ADMIN", "SUPER_ADMIN", "APP_OWNER"],
  },

  // Supervisor
  {
    name: "Supervisor Audit",
    href: "/supervisor/audit",
    icon: BadgeCheck,
    roles: ["SUPERVISOR", "OPERATIONS_ADMIN", "SUPER_ADMIN", "APP_OWNER"],
  },
  {
    name: "Tag Inventory",
    href: "/supervisor/inventory",
    icon: ClipboardEdit,
    roles: ["SUPERVISOR", "WAREHOUSE_MANAGER", "OPERATIONS_ADMIN", "SUPER_ADMIN", "APP_OWNER"],
  },
  {
    name: "Tracking Map",
    href: "/supervisor/tracking-map",
    icon: Map,
    roles: ["SUPERVISOR", "OPERATIONS_ADMIN", "SUPER_ADMIN", "APP_OWNER"],
  },

  // Substation
  {
    name: "Substation",
    href: "/substation",
    icon: Building2,
    roles: ["APP_OWNER", "SUPER_ADMIN", "SUBSTATION_MANAGER", "SUPERVISOR", "OPERATIONS_ADMIN"],
  },
  {
    name: "Substation Receiving",
    href: "/substation/receiving",
    icon: Building2,
    roles: ["APP_OWNER", "SUPER_ADMIN", "SUBSTATION_MANAGER", "SUPERVISOR", "OPERATIONS_ADMIN"],
  },

  // Finance / HR / Marketing
  { name: "Finance", href: "/finance", icon: DollarSign, roles: ["APP_OWNER", "SUPER_ADMIN", "FINANCE_STAFF", "FINANCE_USER"] },
  { name: "Human Resources", href: "/hr", icon: ClipboardList, roles: ["APP_OWNER", "SUPER_ADMIN", "HR_ADMIN"] },
  { name: "Marketing", href: "/marketing", icon: Megaphone, roles: ["APP_OWNER", "SUPER_ADMIN", "MARKETING_ADMIN"] },

  // Admin
  { name: "Admin Dashboard", href: "/admin/dashboard", icon: Shield, roles: ["APP_OWNER", "SUPER_ADMIN"] },
  { name: "User Management", href: "/admin/users", icon: Users, roles: ["APP_OWNER", "SUPER_ADMIN"] },
  { name: "Role Management", href: "/admin/roles", icon: Shield, roles: ["APP_OWNER", "SUPER_ADMIN"] },
  { name: "System Settings", href: "/settings", icon: Settings, roles: ["APP_OWNER", "SUPER_ADMIN"] },
  { name: "Audit Logs", href: "/audit", icon: BadgeCheck, roles: ["APP_OWNER", "SUPER_ADMIN"] },
  {
    name: "Reports",
    href: "/reports",
    icon: FileText,
    roles: ["APP_OWNER", "SUPER_ADMIN", "FINANCE_STAFF", "FINANCE_USER", "OPERATIONS_ADMIN", "SUPERVISOR"],
  },
];

export function navForRole(role: AppRole | null | undefined): NavItem[] {
  return enterpriseNav.filter((item) => {
    if (!item.roles || item.roles.length === 0) return true;
    if (!role) return false;
    return item.roles.includes(role);
  });
}

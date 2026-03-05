// src/config/RoleSidebar.ts (or rolesidebar.ts)
import { AppRole } from "@/types/roles";

export interface SidebarItem {
  id: string; // Added ID to match Layout.tsx logic
  label: string;
  path: string;
  roles: string[]; // Use string[] to match the Supabase role strings
}

export const roleSidebar: SidebarItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    path: "/dashboard",
    roles: [
      "APP_OWNER", "SUPER_ADMIN", "OPERATIONS_ADMIN", "HR_ADMIN", 
      "MARKETING_ADMIN", "FINANCE_ADMIN", "SUPERVISOR", 
      "SUBSTATION_MANAGER", "WAREHOUSE_MANAGER", "STAFF"
    ],
  },
  {
    id: "shipments",
    label: "Shipments",
    path: "/shipments",
    roles: [
      "OPERATIONS_ADMIN", "SUPERVISOR", "SUBSTATION_MANAGER", 
      "WAREHOUSE_MANAGER", "OPERATIONS_STAFF", "RIDER", "DRIVER", "STAFF"
    ],
  },
  {
    id: "qr",
    label: "QR Operations",
    path: "/qr",
    roles: ["SUPERVISOR", "SUBSTATION_MANAGER", "DATA_ENTRY", "WAREHOUSE_MANAGER", "OPERATIONS_ADMIN"],
  },
  {
    id: "finance",
    label: "Finance",
    path: "/finance",
    roles: ["FINANCE_ADMIN", "FINANCE_STAFF", "FINANCE_USER", "APP_OWNER", "SUPER_ADMIN"],
  },
  {
    id: "hub",
    label: "Hub Ops",
    path: "/hub",
    roles: ["OPERATIONS_ADMIN", "SUPERVISOR", "WAREHOUSE_MANAGER", "SUBSTATION_MANAGER"],
  },
  {
    id: "courier",
    label: "Courier App",
    path: "/courier",
    roles: ["RIDER", "DRIVER", "HELPER"],
  },
];
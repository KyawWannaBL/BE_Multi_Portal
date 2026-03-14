// @ts-nocheck
import { ShieldCheck, LayoutDashboard, Truck, Building2 } from "lucide-react";

export const normalizeRole = (role?: string | null): string => {
  const r = (role ?? "").trim().toUpperCase();
  if (!r) return "GUEST";
  if (r.startsWith("SUPER")) return "SUPER_ADMIN";
  if (r.startsWith("APP")) return "APP_OWNER";
  if (r.startsWith("SYS")) return "SYS";
  return r || "GUEST";
};

export const defaultPortalForRole = (role?: string | null): string => {
  const r = normalizeRole(role);
  if (["SYS", "APP_OWNER", "SUPER_ADMIN"].includes(r)) return "/portal/admin";
  return "/portal/operations";
};

export const NAV_SECTIONS = [
  {
    id: "main", title_en: "Core", title_mm: "ပင်မ",
    items: [
      { id: "dash", label_en: "Dashboard", label_mm: "ဒက်ရှ်ဘုတ်", path: "/dashboard", icon: LayoutDashboard },
      { id: "exec", label_en: "Execution", label_mm: "လုပ်ငန်းဆောင်ရွက်မှု", path: "/portal/execution", icon: Truck },
      { id: "admin", label_en: "Admin", label_mm: "အက်ဒမင်", path: "/portal/admin", icon: ShieldCheck }
    ]
  }
];

export const flatByPath = (sections: any[]) => {
  const map = {};
  (sections || []).forEach(s => (s.items || []).forEach(it => { 
    map[it.path] = it; 
    if (it.children) it.children.forEach(c => map[c.path] = c); 
  }));
  return map;
};

export const navForRole = () => NAV_SECTIONS;
export const portalsForRole = () => [];
export const portalCountAll = () => 5;
export const portalCountForRole = (role?: string | null) => portalCountAll();

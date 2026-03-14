import { NavLink } from "react-router-dom";
import {
  Package,
  ClipboardCheck,
  Warehouse,
  Truck,
  MapPinned,
  Route,
  ShieldAlert,
} from "lucide-react";
import { enterpriseRoutes } from "@/navigation/enterpriseRoutes";
import { useI18n } from "@/i18n";
import { usePermissions } from "@/features/auth/usePermissions";

function iconFor(key?: string) {
  switch (key) {
    case "pickup":
      return <ClipboardCheck className="h-4 w-4" />;
    case "warehouse-in":
      return <Warehouse className="h-4 w-4" />;
    case "warehouse-out":
      return <Route className="h-4 w-4" />;
    case "delivery":
      return <Truck className="h-4 w-4" />;
    case "tracking":
      return <MapPinned className="h-4 w-4" />;
    case "exception":
      return <ShieldAlert className="h-4 w-4" />;
    case "way":
    default:
      return <Package className="h-4 w-4" />;
  }
}

export function EnterpriseSidebar({
  onNavigate,
}: {
  onNavigate?: () => void;
}) {
  const { language, bi } = useI18n() as any;
  const { has } = usePermissions();

  const visibleRoutes = enterpriseRoutes.filter(
    (route) => route.showInSidebar && has(route.permission)
  );

  return (
    <aside className="h-full w-72 border-r bg-background">
      <div className="border-b p-4">
        <div className="text-lg font-bold">
          {bi("Enterprise Logistics", "Enterprise Logistics")}
        </div>
        <div className="text-xs text-muted-foreground">
          {bi("Unified bilingual operations", "တစ်စုတစ်စည်းတည်း bilingual operations")}
        </div>
      </div>

      <nav className="space-y-1 p-3">
        {visibleRoutes.map((route) => (
          <NavLink
            key={route.key}
            to={route.path}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`
            }
          >
            {iconFor(route.iconKey)}
            <span>{language === "my" ? route.labelMy : route.labelEn}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
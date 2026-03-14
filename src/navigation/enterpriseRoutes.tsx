import WayManagement from "@/pages/WayManagement";
import PickupExecutionScreen from "@/pages/PickupExecutionScreen";
import WarehouseReceiving from "@/pages/WarehouseReceiving";
import WarehouseDispatch from "@/pages/WarehouseDispatch";
import DeliveryFlow from "@/pages/DeliveryFlow";
import TrackingMap from "@/pages/TrackingMap";
import { PERMISSIONS } from "@/features/auth/permissions";

export type EnterpriseRouteItem = {
  path: string;
  key: string;
  labelEn: string;
  labelMy: string;
  permission?: string | string[];
  element: React.ComponentType;
  showInSidebar?: boolean;
  iconKey?: string;
};

export const enterpriseRoutes: EnterpriseRouteItem[] = [
  {
    path: "/way-management",
    key: "way-management",
    labelEn: "Way Management",
    labelMy: "Way စီမံခန့်ခွဲမှု",
    permission: PERMISSIONS.WAY_MANAGEMENT_READ,
    element: WayManagement,
    showInSidebar: true,
    iconKey: "way",
  },
  {
    path: "/pickup-execution",
    key: "pickup-execution",
    labelEn: "Pickup Execution",
    labelMy: "Pickup ဆောင်ရွက်မှု",
    permission: PERMISSIONS.PICKUP_EXECUTE,
    element: PickupExecutionScreen,
    showInSidebar: true,
    iconKey: "pickup",
  },
  {
    path: "/warehouse-receiving",
    key: "warehouse-receiving",
    labelEn: "Warehouse Receiving",
    labelMy: "Warehouse လက်ခံခြင်း",
    permission: PERMISSIONS.WAREHOUSE_RECEIVE,
    element: WarehouseReceiving,
    showInSidebar: true,
    iconKey: "warehouse-in",
  },
  {
    path: "/warehouse-dispatch",
    key: "warehouse-dispatch",
    labelEn: "Warehouse Dispatch",
    labelMy: "Warehouse ထုတ်ပို့ခြင်း",
    permission: [PERMISSIONS.WAREHOUSE_DISPATCH, PERMISSIONS.ROUTE_OPTIMIZE],
    element: WarehouseDispatch,
    showInSidebar: true,
    iconKey: "warehouse-out",
  },
  {
    path: "/delivery-flow",
    key: "delivery-flow",
    labelEn: "Delivery Flow",
    labelMy: "Delivery ဆောင်ရွက်မှု",
    permission: PERMISSIONS.DELIVERY_EXECUTE,
    element: DeliveryFlow,
    showInSidebar: true,
    iconKey: "delivery",
  },
  {
    path: "/tracking-map",
    key: "tracking-map",
    labelEn: "Tracking Map",
    labelMy: "ခြေရာခံ မြေပုံ",
    permission: PERMISSIONS.TRACKING_READ,
    element: TrackingMap,
    showInSidebar: true,
    iconKey: "tracking",
  },
];
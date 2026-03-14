export const PERMISSIONS = {
  WAY_MANAGEMENT_READ: "way.management.read",
  PICKUP_EXECUTE: "pickup.execute",
  WAREHOUSE_RECEIVE: "warehouse.receive",
  WAREHOUSE_DISPATCH: "warehouse.dispatch",
  DELIVERY_EXECUTE: "delivery.execute",
  TRACKING_READ: "tracking.read",
  ROUTE_OPTIMIZE: "route.optimize",
  RIDER_DISPATCH: "dispatch.rider.assign",
} as const;

export type PermissionCode = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
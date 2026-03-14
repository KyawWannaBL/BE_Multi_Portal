export const DELIVERY_PERMISSIONS = {
  ORDER_CREATE: "delivery.order.create",
  ORDER_READ: "delivery.order.read",
  ORDER_UPDATE: "delivery.order.update",
  ORDER_ASSIGN: "delivery.order.assign",
  ORDER_CANCEL: "delivery.order.cancel",

  PICKUP_EXECUTE: "delivery.pickup.execute",
  PICKUP_OVERRIDE: "delivery.pickup.override",

  WAREHOUSE_INBOUND_SCAN: "warehouse.inbound.scan",
  WAREHOUSE_INBOUND_QC: "warehouse.inbound.qc",
  WAREHOUSE_SLOT_ASSIGN: "warehouse.slot.assign",
  WAREHOUSE_DISPATCH_RELEASE: "warehouse.dispatch.release",

  ROUTE_READ: "delivery.route.read",
  ROUTE_LIVE_MAP: "delivery.route.live_map",

  POD_CAPTURE: "delivery.pod.capture",
  EXCEPTION_RESOLVE: "delivery.exception.resolve",

  MEDIA_UPLOAD: "media.upload",
  MEDIA_REVIEW: "media.review",

  OCR_EXTRACT: "ocr.extract",
  OCR_REVIEW: "ocr.review",

  AUDIT_READ: "audit.read",
  WAY_MANAGEMENT_READ: "admin.way_management.read",
} as const;

export type DeliveryPermissionCode =
  (typeof DELIVERY_PERMISSIONS)[keyof typeof DELIVERY_PERMISSIONS];

export function normalizePermission(input: any) {
  return String(input || "").trim().toLowerCase();
}

export function extractPermissionList(authLike: any): string[] {
  const raw =
    authLike?.privileges ||
    authLike?.permissions ||
    authLike?.user?.privileges ||
    authLike?.user?.permissions ||
    authLike?.rolePrivileges ||
    [];
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item: any) => {
      if (typeof item === "string") return item;
      return item?.code || item?.privilegeCode || item?.permission || item?.name || "";
    })
    .map(normalizePermission)
    .filter(Boolean);
}

export function hasPermission(
  ownedPermissions: string[],
  required?: string | string[]
): boolean {
  if (!required) return true;
  const list = Array.isArray(required) ? required : [required];
  const owned = new Set(ownedPermissions.map(normalizePermission));

  if (owned.has("*") || owned.has("admin.*")) return true;

  return list.some((item) => {
    const code = normalizePermission(item);
    if (owned.has(code)) return true;
    const parts = code.split(".");
    if (parts.length >= 2) {
      const moduleWildcard = `${parts[0]}.*`;
      const resourceWildcard = `${parts[0]}.${parts[1]}.*`;
      if (owned.has(moduleWildcard) || owned.has(resourceWildcard)) return true;
    }
    return false;
  });
}

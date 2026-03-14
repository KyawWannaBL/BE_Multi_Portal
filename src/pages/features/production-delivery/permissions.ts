export const DELIVERY_PERMISSIONS = {
  ORDER_CREATE: 'delivery.order.create',
  ORDER_READ: 'delivery.order.read',
  ORDER_UPDATE: 'delivery.order.update',
  PICKUP_EXECUTE: 'delivery.pickup.execute',
  WAREHOUSE_INBOUND: 'warehouse.inbound.scan',
  WAREHOUSE_DISPATCH: 'warehouse.dispatch.release',
  DELIVERY_PROOF: 'delivery.pod.capture',
  DELIVERY_FAIL: 'delivery.exception.resolve',
  WAY_MANAGEMENT: 'admin.way_management.read',
  OCR_USE: 'ocr.extract',
  MAP_READ: 'delivery.route.live_map',
  MEDIA_UPLOAD: 'media.upload',
};

export function normalizePermission(input: any) {
  return String(input || '').trim().toLowerCase();
}

export function getOwnedPermissions(auth?: any): string[] {
  const raw = auth?.privileges || auth?.permissions || auth?.user?.privileges || auth?.user?.permissions || [];
  if (!Array.isArray(raw)) return [];
  return raw.map((item: any) => {
    if (typeof item === 'string') return item;
    return item?.code || item?.privilegeCode || item?.permission || item?.name || '';
  }).map(normalizePermission).filter(Boolean);
}

export function canAccess(auth: any, required?: string | string[]) {
  if (!required) return true;
  const list = Array.isArray(required) ? required : [required];
  const owned = new Set(getOwnedPermissions(auth));
  if (!owned.size) return true;
  if (owned.has('*') || owned.has('admin.*')) return true;
  return list.some((req) => {
    const code = normalizePermission(req);
    if (owned.has(code)) return true;
    const parts = code.split('.');
    if (parts.length >= 2) {
      if (owned.has(`${parts[0]}.*`) || owned.has(`${parts[0]}.${parts[1]}.*`)) return true;
    }
    return false;
  });
}

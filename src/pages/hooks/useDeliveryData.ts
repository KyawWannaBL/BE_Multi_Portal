import { useCallback, useEffect, useMemo, useState } from 'react';
import { DeliveryBackend } from '@/features/production-delivery/api';

export type DeliveryWayLike = {
  id?: string;
  deliveryId?: string;
  trackingNo?: string;
  wayNo?: string;
  wayId?: string;
  qrCode?: string;
  merchant?: string;
  merchantName?: string;
  merchantPhone?: string;
  receiver?: string;
  receiverName?: string;
  receiverPhone?: string;
  township?: string;
  address?: string;
  receiverAddress?: string;
  type?: string;
  wayType?: string;
  flowType?: string;
  serviceType?: string;
  status?: string;
  currentStage?: string;
  parcelLocation?: string;
  lat?: number;
  lng?: number;
  [key: string]: any;
};

function normalize(value: any) {
  return String(value || '').trim().toLowerCase();
}

function safeNumber(value: any) {
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function mapBackendWay(item: any): DeliveryWayLike {
  return {
    ...item,
    id: item?.id || item?.deliveryId || item?.wayId || item?.trackingNo || item?.wayNo,
    deliveryId: item?.deliveryId || item?.id,
    trackingNo: item?.trackingNo || item?.wayNo || item?.awb || item?.barcode || item?.qrCode,
    wayNo: item?.wayNo || item?.trackingNo,
    merchant: item?.merchant || item?.merchantName || item?.senderName || item?.shopName || '',
    merchantName: item?.merchantName || item?.merchant || item?.senderName || '',
    merchantPhone: item?.merchantPhone || item?.senderPhone || '',
    receiver: item?.receiver || item?.receiverName || item?.customerName || '',
    receiverName: item?.receiverName || item?.receiver || item?.customerName || '',
    receiverPhone: item?.receiverPhone || item?.customerPhone || item?.phone || '',
    township: item?.township || item?.deliveryTownship || item?.pickupTownship || '',
    address: item?.address || item?.receiverAddress || item?.deliveryAddress || '',
    receiverAddress: item?.receiverAddress || item?.deliveryAddress || item?.address || '',
    type: item?.type || item?.wayType || item?.flowType || item?.serviceType || item?.jobType || '',
    wayType: item?.wayType || item?.type || '',
    flowType: item?.flowType || item?.type || item?.wayType || '',
    serviceType: item?.serviceType || item?.type || '',
    status: item?.status || item?.wayStatus || item?.deliveryStatus || item?.state || '',
    currentStage: item?.currentStage || item?.stage || item?.workflowStage || '',
    parcelLocation: item?.parcelLocation || item?.warehouse || item?.hub || '',
    lat: safeNumber(item?.lat || item?.latitude),
    lng: safeNumber(item?.lng || item?.longitude),
  };
}

function getStatus(way: DeliveryWayLike) {
  return normalize(way.status);
}

function getStage(way: DeliveryWayLike) {
  return normalize(way.currentStage);
}

function getFlow(way: DeliveryWayLike) {
  return normalize(way.type || way.wayType || way.flowType || way.serviceType);
}

function isPickupWay(way: DeliveryWayLike) {
  const flow = getFlow(way);
  const stage = getStage(way);
  const status = getStatus(way);
  return (
    flow.includes('pickup') ||
    stage.includes('pickup') ||
    stage === 'pickup_secured' ||
    ['to-assign', 'assigned', 'pickup-pending', 'pickup_assigned'].includes(status)
  );
}

function isDeliveryWay(way: DeliveryWayLike) {
  const flow = getFlow(way);
  const stage = getStage(way);
  const status = getStatus(way);
  return (
    flow.includes('deliver') ||
    flow.includes('delivery') ||
    stage.includes('delivery') ||
    stage.includes('out_for_delivery') ||
    ['on-way', 'successful', 'delivery_assigned', 'out-for-delivery'].includes(status)
  );
}

function isFailedWay(way: DeliveryWayLike) {
  const stage = getStage(way);
  const status = getStatus(way);
  return status.includes('failed') || stage.includes('failed') || stage.includes('exception');
}

function isReturnWay(way: DeliveryWayLike) {
  const stage = getStage(way);
  const status = getStatus(way);
  return status.includes('return') || stage.includes('return');
}

function isParcelWay(way: DeliveryWayLike) {
  const flow = getFlow(way);
  const stage = getStage(way);
  return Boolean(
    way.parcelLocation ||
    flow.includes('parcel') ||
    flow.includes('warehouse') ||
    stage.includes('warehouse') ||
    stage.includes('inbound') ||
    stage.includes('dispatch')
  );
}

function isTransitWay(way: DeliveryWayLike) {
  const stage = getStage(way);
  const status = getStatus(way);
  return (
    stage.includes('route') ||
    stage.includes('transit') ||
    status.includes('transit') ||
    status === 'on-way' ||
    status === 'in-transit'
  );
}

function isTrackingWay(way: DeliveryWayLike) {
  return Boolean(
    (way.lat && way.lng) ||
      isTransitWay(way) ||
      getStatus(way) === 'successful' ||
      getStage(way).includes('delivery')
  );
}

export function useDeliveryWays() {
  const [ways, setWays] = useState<DeliveryWayLike[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshSeed, setRefreshSeed] = useState(0);

  const refreshWays = useCallback(() => {
    setRefreshSeed((prev) => prev + 1);
  }, []);

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(async () => {
      try {
        setLoading(true);
        setError('');
        const response = await DeliveryBackend.searchWays({ search: searchQuery || undefined, limit: 500 });
        const items = Array.isArray(response?.items)
          ? response.items
          : Array.isArray(response)
          ? response
          : [];
        if (!active) return;
        setWays(items.map(mapBackendWay));
      } catch (err: any) {
        if (!active) return;
        setError(err?.message || 'Unable to load delivery ways.');
        setWays([]);
      } finally {
        if (active) setLoading(false);
      }
    }, 300);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [searchQuery, refreshSeed]);

  const grouped = useMemo(() => {
    const pickupWays = ways.filter(isPickupWay);
    const deliveryWays = ways.filter(isDeliveryWay);
    const failedWays = ways.filter(isFailedWay);
    const returnWays = ways.filter(isReturnWay);
    const parcelWays = ways.filter(isParcelWay);
    const transitWays = ways.filter(isTransitWay);
    const trackingWays = ways.filter(isTrackingWay);

    return {
      pickupWays,
      deliveryWays,
      failedWays,
      returnWays,
      parcelWays,
      transitWays,
      trackingWays,
    };
  }, [ways]);

  return {
    ways,
    ...grouped,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    refreshWays,
  };
}

export default useDeliveryWays;

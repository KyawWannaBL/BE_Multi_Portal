import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";

export interface DeliveryWay {
  id: string;
  way_id?: string;
  code?: string;
  status?: string;
  way_status?: string;
  delivery_status?: string;
  type?: string;
  way_type?: string;
  flow_type?: string;
  service_type?: string;
  job_type?: string;
  merchant?: string;
  merchant_name?: string;
  customer?: string;
  customer_name?: string;
  receiver_name?: string;
  phone?: string;
  receiver_phone?: string;
  town?: string;
  township?: string;
  rider_id?: string;
  vehicle_id?: string;
  latitude?: number;
  longitude?: number;
  updated_at?: string;
  created_at?: string;
  [key: string]: any;
}

type WaysApiResponse =
  | DeliveryWay[]
  | {
      items?: DeliveryWay[];
      data?: DeliveryWay[];
    };

function normalize(value: unknown): string {
  return String(value ?? "").trim().toLowerCase();
}

function getWayStatus(way: DeliveryWay): string {
  return normalize(way.status || way.way_status || way.delivery_status);
}

function getWayType(way: DeliveryWay): string {
  return normalize(
    way.type || way.way_type || way.flow_type || way.service_type || way.job_type
  );
}

function isPickupWay(way: DeliveryWay): boolean {
  const type = getWayType(way);
  return type.includes("pickup") || type === "pu";
}

function isDeliveryWay(way: DeliveryWay): boolean {
  const type = getWayType(way);
  return type.includes("delivery") || type.includes("deliver") || type === "do";
}

function isFailedWay(way: DeliveryWay): boolean {
  const status = getWayStatus(way);
  return status === "failed" || status === "failed-delivery" || status === "unsuccessful";
}

function isReturnWay(way: DeliveryWay): boolean {
  const status = getWayStatus(way);
  return status === "return" || status === "returned" || status === "returning";
}

function isParcelWay(way: DeliveryWay): boolean {
  const type = getWayType(way);
  return (
    type.includes("parcel") ||
    type.includes("warehouse") ||
    type.includes("inbound") ||
    type.includes("outbound")
  );
}

function isTransitWay(way: DeliveryWay): boolean {
  const status = getWayStatus(way);
  const type = getWayType(way);
  return (
    status === "on-way" ||
    status === "in-transit" ||
    status === "transit" ||
    type.includes("transit")
  );
}

function isTrackingWay(way: DeliveryWay): boolean {
  const status = getWayStatus(way);
  return status === "on-way" || status === "in-transit" || status === "successful";
}

export function useDeliveryWays() {
  const [ways, setWays] = useState<DeliveryWay[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchWays = useCallback(async (query?: string) => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get<WaysApiResponse>("/api/v1/ways", {
        params: query ? { q: query } : {},
      });

      const payload = response.data;
      const items = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.items)
        ? payload.items
        : Array.isArray(payload?.data)
        ? payload.data
        : [];

      setWays(items);
    } catch (err: any) {
      setWays([]);
      setError(err?.response?.data?.message || err?.message || "Failed to load ways.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchWays(searchQuery);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [searchQuery, fetchWays]);

  const pickupWays = useMemo(() => ways.filter(isPickupWay), [ways]);
  const deliveryWays = useMemo(() => ways.filter(isDeliveryWay), [ways]);
  const failedWays = useMemo(() => ways.filter(isFailedWay), [ways]);
  const returnWays = useMemo(() => ways.filter(isReturnWay), [ways]);
  const parcelWays = useMemo(() => ways.filter(isParcelWay), [ways]);
  const transitWays = useMemo(() => ways.filter(isTransitWay), [ways]);
  const trackingWays = useMemo(() => ways.filter(isTrackingWay), [ways]);

  const refreshWays = useCallback(async () => {
    await fetchWays(searchQuery);
  }, [fetchWays, searchQuery]);

  return {
    ways,
    pickupWays,
    deliveryWays,
    failedWays,
    returnWays,
    parcelWays,
    transitWays,
    trackingWays,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    refreshWays,
  };
}
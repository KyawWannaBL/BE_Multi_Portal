export type Bilingual = {
  en: string;
  my: string;
};

export type ParcelStatus =
  | "created"
  | "pickup_pending"
  | "picked_up"
  | "warehouse_received"
  | "racked"
  | "dispatched"
  | "in_transit"
  | "out_for_delivery"
  | "delivered"
  | "failed"
  | "return_pending"
  | "returned";

export interface ParcelPhotoAnalysis {
  blurScore: number;
  brightnessScore: number;
  contrastScore: number;
  possibleFraudScore: number;
  guidance: string[];
  labelDetected?: boolean;
}

export interface ParcelRecord {
  id: string;
  waybillNo: string;
  orderNo?: string;
  merchantName: string;
  customerName: string;
  phone: string;
  township: string;
  address?: string;
  parcelCount: number;
  weightKg?: number;
  codAmount?: number;
  status: ParcelStatus;
  rackCode?: string;
  routeCode?: string;
  riderId?: string;
  slaDeadlineAt?: string;
  createdAt?: string;
  updatedAt?: string;
  latitude?: number;
  longitude?: number;
  photoAnalysis?: ParcelPhotoAnalysis;
  anomalyFlags?: string[];
  [key: string]: any;
}

export interface RiderRecord {
  id: string;
  name: string;
  phone?: string;
  vehicleType?: string;
  online: boolean;
  currentLoad: number;
  maxCapacity: number;
  activeRouteCode?: string;
  latitude?: number;
  longitude?: number;
}

export interface RackCell {
  rackCode: string;
  zone: string;
  occupiedCount: number;
  capacity: number;
}

export interface RouteStop {
  parcelId: string;
  customerName: string;
  township: string;
  lat: number;
  lng: number;
  sequence?: number;
}

export interface RoutePlan {
  routeCode: string;
  riderId?: string;
  estimatedDistanceKm: number;
  estimatedDurationMin: number;
  optimizationScore?: number;
  stops: RouteStop[];
}

export interface SlaSummary {
  total: number;
  healthy: number;
  warning: number;
  breached: number;
}
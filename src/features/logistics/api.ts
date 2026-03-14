import axios from "axios";
import type {
  ParcelRecord,
  RiderRecord,
  RackCell,
  RoutePlan,
  SlaSummary,
  ParcelPhotoAnalysis,
} from "./types";

const api = axios.create({
  baseURL: "/api/v1",
  withCredentials: true,
});

export const LogisticsApi = {
  async searchInboundParcels(q: string) {
    const res = await api.get<{ items: ParcelRecord[] }>("/warehouse/inbound", {
      params: { q },
    });
    return res.data.items || [];
  },

  async receiveParcel(payload: {
    parcelId: string;
    receivedBy: string;
    rackCode?: string;
    note?: string;
    qrCode?: string;
    weightKg?: number;
    photoUrls?: string[];
  }) {
    const res = await api.post("/warehouse/receive", payload);
    return res.data;
  },

  async getRackHeatmap() {
    const res = await api.get<{ items: RackCell[] }>("/warehouse/racks/heatmap");
    return res.data.items || [];
  },

  async getDispatchReadyParcels(q: string) {
    const res = await api.get<{ items: ParcelRecord[] }>("/warehouse/dispatch-ready", {
      params: { q },
    });
    return res.data.items || [];
  },

  async getRiders() {
    const res = await api.get<{ items: RiderRecord[] }>("/dispatch/riders");
    return res.data.items || [];
  },

  async optimizeRoute(payload: {
    parcelIds: string[];
    riderId?: string;
    mode?: "balanced" | "fastest" | "lowest_cost";
  }) {
    const res = await api.post<RoutePlan>("/routes/optimize", payload);
    return res.data;
  },

  async dispatchRoute(payload: {
    parcelIds: string[];
    riderId: string;
    routeCode?: string;
    optimized: boolean;
  }) {
    const res = await api.post("/warehouse/dispatch", payload);
    return res.data;
  },

  async getSlaSummary() {
    const res = await api.get<SlaSummary>("/sla/summary");
    return res.data;
  },

  async pickupSearch(q: string) {
    const res = await api.get<{ items: ParcelRecord[] }>("/pickup/orders", {
      params: { q },
    });
    return res.data.items || [];
  },

  async markPickup(payload: {
    parcelId: string;
    qrCode?: string;
    signerName?: string;
    signatureDataUrl?: string;
    photoUrls?: string[];
    note?: string;
  }) {
    const res = await api.post("/pickup/confirm", payload);
    return res.data;
  },

  async uploadFile(file: File) {
    const form = new FormData();
    form.append("file", file);
    const res = await api.post<{ url: string }>("/media/upload", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.url;
  },

  async analyzeParcelPhoto(file: File) {
    const form = new FormData();
    form.append("file", file);
    const res = await api.post<ParcelPhotoAnalysis>("/vision/parcel-photo-analyze", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  async detectPhotoFraud(file: File) {
    const form = new FormData();
    form.append("file", file);
    const res = await api.post<{
      score: number;
      flags: string[];
    }>("/vision/photo-fraud-detect", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  async detectParcelAnomaly(parcelId: string) {
    const res = await api.get<{ flags: string[] }>(`/parcels/${parcelId}/anomaly`);
    return res.data.flags || [];
  },
};
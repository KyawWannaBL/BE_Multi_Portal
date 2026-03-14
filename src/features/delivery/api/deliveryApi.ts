import axios from "axios";

export interface DeliveryLineItem {
  id?: string;
  description: string;
  quantity: number;
  weightKg?: number;
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
  declaredValue?: number;
}

export interface CreateDeliveryPayload {
  merchantId?: string;
  merchantName?: string;
  senderName?: string;
  senderPhone?: string;
  pickupAddress?: string;
  pickupTownship?: string;
  receiverName: string;
  receiverPhone: string;
  deliveryAddress: string;
  deliveryTownship?: string;
  serviceType?: string;
  paymentType?: string;
  codAmount?: number;
  deliveryFee?: number;
  note?: string;
  priority?: "normal" | "express" | "urgent";
  scheduledAt?: string | null;
  items: DeliveryLineItem[];
}

export interface CreateDeliveryResponse {
  id: string;
  awbNumber?: string;
  status?: string;
  message?: string;
}

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

export const deliveryApi = {
  async createDelivery(payload: CreateDeliveryPayload) {
    const res = await api.post<CreateDeliveryResponse>(
      "/admin/create-delivery",
      payload
    );
    return res.data;
  },

  async validateReceiverPhone(phone: string) {
    const res = await api.get<{ valid: boolean; normalized?: string }>(
      "/admin/validate-phone",
      { params: { phone } }
    );
    return res.data;
  },
};

export default deliveryApi;
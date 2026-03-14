export type ApiOptions = {
  baseUrl?: string;
  getToken?: () => string | undefined | Promise<string | undefined>;
};

export class ApiError extends Error {
  status: number;
  payload: any;
  constructor(message: string, status: number, payload?: any) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

export class DeliveryEnterpriseApi {
  baseUrl: string;
  getToken?: ApiOptions['getToken'];

  constructor(options: ApiOptions = {}) {
    this.baseUrl = options.baseUrl || (typeof window !== 'undefined' ? ((window as any).__ENTERPRISE_API_BASE__ || '/api/v1') : '/api/v1');
    this.getToken = options.getToken;
  }

  private async token() {
    if (this.getToken) return await this.getToken();
    if (typeof window === 'undefined') return undefined;
    return localStorage.getItem('access_token') || localStorage.getItem('token') || undefined;
  }

  private async headers(extra?: HeadersInit) {
    const token = await this.token();
    return {
      ...(extra || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    } as HeadersInit;
  }

  async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: await this.headers(init.headers),
    });

    const contentType = res.headers.get('content-type') || '';
    let payload: any = null;
    if (contentType.includes('application/json')) payload = await res.json().catch(() => null);
    else payload = await res.text().catch(() => '');

    if (!res.ok) {
      throw new ApiError(payload?.message || res.statusText || 'Request failed', res.status, payload);
    }
    return payload as T;
  }

  get<T>(path: string) { return this.request<T>(path, { method: 'GET' }); }
  post<T>(path: string, body?: any) {
    const isForm = typeof FormData !== 'undefined' && body instanceof FormData;
    return this.request<T>(path, {
      method: 'POST',
      body: isForm ? body : body === undefined ? undefined : JSON.stringify(body),
      headers: isForm ? undefined : { 'Content-Type': 'application/json' },
    });
  }
  patch<T>(path: string, body?: any) {
    return this.request<T>(path, {
      method: 'PATCH',
      body: body === undefined ? undefined : JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export const deliveryApi = new DeliveryEnterpriseApi();

export const DeliveryBackend = {
  createOrder: (payload: any) => deliveryApi.post<any>('/deliveries', payload),
  updateOrder: (id: string, payload: any) => deliveryApi.patch<any>(`/deliveries/${id}`, payload),
  resolveScan: (payload: { code: string }) => deliveryApi.post<any>('/scan/resolve', payload),
  pickupSecure: (payload: any) => deliveryApi.post<any>('/workflow/pickup-secured', payload),
  warehouseInbound: (payload: any) => deliveryApi.post<any>('/workflow/warehouse-inbound', payload),
  warehouseDispatch: (payload: any) => deliveryApi.post<any>('/workflow/warehouse-dispatch', payload),
  proofOfDelivery: (payload: any) => deliveryApi.post<any>('/workflow/proof-of-delivery', payload),
  markFailure: (payload: any) => deliveryApi.post<any>('/workflow/failure', payload),
  searchWays: (query: Record<string, any>) => {
    const params = new URLSearchParams();
    Object.entries(query || {}).forEach(([k, v]) => {
      if (v !== undefined && v !== null && String(v) !== '') params.set(k, String(v));
    });
    return deliveryApi.get<any>(`/deliveries/search?${params.toString()}`);
  },
  getWorkflowEvents: (deliveryId: string) => deliveryApi.get<any>(`/deliveries/${deliveryId}/events`),
  getLiveTracking: (deliveryId?: string) => deliveryApi.get<any>(`/tracking/live${deliveryId ? `?deliveryId=${encodeURIComponent(deliveryId)}` : ''}`),
  uploadEvidence: async (file: File, metadata: Record<string, any>) => {
    const form = new FormData();
    form.append('file', file);
    Object.entries(metadata || {}).forEach(([k, v]) => form.append(k, String(v ?? '')));
    return deliveryApi.post<any>('/media/evidence/upload', form);
  },
  normalizeOcrText: (rawText: string) => deliveryApi.post<any>('/ocr/normalize', { rawText }),
  extractOcrFromImage: async (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return deliveryApi.post<any>('/ocr/extract', form);
  },
};

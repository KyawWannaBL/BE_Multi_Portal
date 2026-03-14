export type ApiClientOptions = {
  baseUrl?: string;
  getAccessToken?: () => Promise<string | undefined> | string | undefined;
  onUnauthorized?: () => void;
};

export class EnterpriseApiError extends Error {
  status: number;
  payload: any;

  constructor(message: string, status: number, payload?: any) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

export class EnterpriseApiClient {
  private baseUrl: string;
  private getAccessToken?: ApiClientOptions["getAccessToken"];
  private onUnauthorized?: ApiClientOptions["onUnauthorized"];

  constructor(options: ApiClientOptions = {}) {
    this.baseUrl = options.baseUrl || "/api";
    this.getAccessToken = options.getAccessToken;
    this.onUnauthorized = options.onUnauthorized;
  }

  private async buildHeaders(init?: HeadersInit) {
    const token =
      typeof this.getAccessToken === "function"
        ? await this.getAccessToken()
        : undefined;

    return {
      "Content-Type": "application/json",
      ...(init || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: await this.buildHeaders(init.headers),
    });

    let payload: any = null;
    const text = await response.text();
    try {
      payload = text ? JSON.parse(text) : null;
    } catch {
      payload = text;
    }

    if (!response.ok) {
      if (response.status === 401) this.onUnauthorized?.();
      throw new EnterpriseApiError(
        payload?.message || response.statusText || "Request failed",
        response.status,
        payload
      );
    }

    return payload as T;
  }

  get<T>(path: string) {
    return this.request<T>(path, { method: "GET" });
  }

  post<T>(path: string, body?: any) {
    return this.request<T>(path, {
      method: "POST",
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  }

  patch<T>(path: string, body?: any) {
    return this.request<T>(path, {
      method: "PATCH",
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  }

  put<T>(path: string, body?: any) {
    return this.request<T>(path, {
      method: "PUT",
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  }
}

export const enterpriseApi = new EnterpriseApiClient();

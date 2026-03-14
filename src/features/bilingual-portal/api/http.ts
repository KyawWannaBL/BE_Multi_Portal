const API_BASE =
  (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_API_BASE_URL) || "";

export async function http<T>(path: string): Promise<T> {
  const url = API_BASE ? `${API_BASE}${path}` : path;

  const response = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include"
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return [] as T;
  }

  return response.json() as Promise<T>;
}

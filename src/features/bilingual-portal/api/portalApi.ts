import { http } from "./http";

export type PortalRow = Record<string, unknown>;

export async function getPortalList(endpoint: string): Promise<PortalRow[]> {
  const result = await http<PortalRow[] | { items?: PortalRow[] }>(endpoint);
  if (Array.isArray(result)) return result;
  return Array.isArray(result.items) ? result.items : [];
}

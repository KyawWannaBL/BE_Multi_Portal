/**
 * Recent Navigation (EN/MM)
 * ----------------------------------------------------------------------------
 * EN: Stores last visited items for sidebar/hub.
 * MY: Sidebar/hub အတွက် နောက်ဆုံးသွားခဲ့တဲ့ menu များကို သိမ်း။
 */

export const RECENT_NAV_KEY = "be_recent_nav";

export type RecentNavItem = {
  path: string;
  label_en: string;
  label_mm: string;
  timestamp: number;
};

export function getRecentNav(): RecentNavItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENT_NAV_KEY);
    return raw ? (JSON.parse(raw) as RecentNavItem[]) : [];
  } catch {
    return [];
  }
}

export function pushRecent(item: Omit<RecentNavItem, "timestamp">) {
  if (typeof window === "undefined") return;
  const current = getRecentNav();
  const filtered = current.filter((x) => x.path !== item.path);
  filtered.unshift({ ...item, timestamp: Date.now() });
  window.localStorage.setItem(RECENT_NAV_KEY, JSON.stringify(filtered.slice(0, 8)));
}

/** EN: Backward-compatible alias  MY: alias အဖြစ်ထား */
export const addRecentNav = pushRecent;

export function clearRecentNav() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(RECENT_NAV_KEY);
}

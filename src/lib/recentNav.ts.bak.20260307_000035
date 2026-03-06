export type RecentEntry = {
  path: string;
  at: number;
};

const KEY = "be_recent_nav_v1";

function read(): RecentEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const v = JSON.parse(raw);
    if (!Array.isArray(v)) return [];
    return v
      .filter((x) => x && typeof x.path === "string" && typeof x.at === "number")
      .slice(0, 50);
  } catch {
    return [];
  }
}

function write(rows: RecentEntry[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(rows.slice(0, 50)));
}

export function pushRecent(path: string) {
  if (typeof window === "undefined") return;
  if (!path || path === "/login") return;

  const rows = read();
  const now = Date.now();
  const next = [{ path, at: now }, ...rows.filter((r) => r.path !== path)];
  write(next);
}

export function getRecent(limit = 8): RecentEntry[] {
  return read().slice(0, limit);
}

export function clearRecent() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}

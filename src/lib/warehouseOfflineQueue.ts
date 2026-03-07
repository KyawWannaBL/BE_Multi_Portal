export type WhActionKind =
  | "TASK_START"
  | "TASK_HOLD"
  | "TASK_COMPLETE"
  | "RECEIVE"
  | "PUTAWAY"
  | "PICK"
  | "PACK"
  | "DISPATCH"
  | "CYCLE_COUNT";

export type WhOfflineAction = {
  id: string;
  kind: WhActionKind;
  taskId?: string | null;
  payload: Record<string, unknown>;
  createdAtIso: string;
};

const KEY = "wh_offline_queue_v1";

function uuid() {
  const c: any = globalThis.crypto;
  return c?.randomUUID ? c.randomUUID() : `q_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function safeJson<T>(raw: string | null, fallback: T): T {
  try {
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function loadWhQueue(): WhOfflineAction[] {
  if (typeof window === "undefined") return [];
  const v = safeJson<WhOfflineAction[]>(window.localStorage.getItem(KEY), []);
  return Array.isArray(v) ? v : [];
}

export function saveWhQueue(items: WhOfflineAction[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(items.slice(0, 1000)));
}

export function enqueueWhAction(a: Omit<WhOfflineAction, "id" | "createdAtIso">) {
  const cur = loadWhQueue();
  const next: WhOfflineAction = { ...a, id: uuid(), createdAtIso: new Date().toISOString() };
  saveWhQueue([next, ...cur]);
  return next;
}

export function removeWhAction(id: string) {
  const cur = loadWhQueue();
  saveWhQueue(cur.filter((x) => x.id !== id));
}

export async function syncWhQueue(handlers: {
  onStart: (taskId: string, payload: Record<string, unknown>) => Promise<void>;
  onHold: (taskId: string, payload: Record<string, unknown>) => Promise<void>;
  onComplete: (taskId: string, payload: Record<string, unknown>) => Promise<void>;
  onOp: (kind: WhActionKind, payload: Record<string, unknown>) => Promise<void>;
}) {
  const cur = loadWhQueue();
  const remaining: WhOfflineAction[] = [];
  let ok = 0;
  let fail = 0;

  // oldest first
  for (const item of [...cur].reverse()) {
    try {
      if (item.kind === "TASK_START") await handlers.onStart(String(item.taskId), item.payload);
      else if (item.kind === "TASK_HOLD") await handlers.onHold(String(item.taskId), item.payload);
      else if (item.kind === "TASK_COMPLETE") await handlers.onComplete(String(item.taskId), item.payload);
      else await handlers.onOp(item.kind, item.payload);
      ok++;
    } catch {
      remaining.push(item);
      fail++;
    }
  }

  saveWhQueue(remaining.reverse());
  return { ok, fail, remaining: remaining.length };
}

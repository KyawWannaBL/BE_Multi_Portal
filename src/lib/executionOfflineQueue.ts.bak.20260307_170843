export type ExecutionActionKind = "PICKUP" | "DELIVER" | "NDR";

export type ExecutionOfflineAction = {
  id: string;
  kind: ExecutionActionKind;
  shipmentId: string;
  createdAtIso: string;
  payload: Record<string, unknown>;
};

const KEY = "execution_offline_queue_v1";

function safeJsonParse<T>(raw: string | null, fallback: T): T {
  try {
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function loadExecutionQueue(): ExecutionOfflineAction[] {
  if (typeof window === "undefined") return [];
  const v = safeJsonParse<ExecutionOfflineAction[]>(window.localStorage.getItem(KEY), []);
  return Array.isArray(v) ? v : [];
}

export function saveExecutionQueue(items: ExecutionOfflineAction[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(items.slice(0, 500)));
}

export function enqueueExecutionAction(a: Omit<ExecutionOfflineAction, "id" | "createdAtIso">) {
  const id = globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : `q_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  const next: ExecutionOfflineAction = { ...a, id, createdAtIso: new Date().toISOString() };
  const cur = loadExecutionQueue();
  saveExecutionQueue([next, ...cur]);
  return next;
}

export function removeExecutionAction(id: string) {
  const cur = loadExecutionQueue();
  saveExecutionQueue(cur.filter((x) => x.id !== id));
}

export async function syncExecutionQueue(handlers: {
  pickup: (shipmentId: string, payload: Record<string, unknown>) => Promise<void>;
  deliver: (shipmentId: string, payload: Record<string, unknown>) => Promise<void>;
  ndr: (shipmentId: string, payload: Record<string, unknown>) => Promise<void>;
}) {
  const cur = loadExecutionQueue();
  const remaining: ExecutionOfflineAction[] = [];
  let ok = 0;
  let fail = 0;

  for (const item of cur.reverse()) {
    try {
      if (item.kind === "PICKUP") await handlers.pickup(item.shipmentId, item.payload);
      else if (item.kind === "DELIVER") await handlers.deliver(item.shipmentId, item.payload);
      else await handlers.ndr(item.shipmentId, item.payload);
      ok += 1;
    } catch {
      remaining.push(item);
      fail += 1;
    }
  }

  saveExecutionQueue(remaining.reverse());
  return { ok, fail, remaining: remaining.length };
}

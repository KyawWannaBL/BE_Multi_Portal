// @ts-nocheck
/**
 * Support Service (EN/MM)
 * EN: Local-only ticket store (build-safe). Replace with real DB later.
 * MY: Local-only ticket store. နောက်မှ DB ထည့်။
 */
const KEY = "be_support_tickets";

export type Ticket = {
  id: string;
  at: string;
  email?: string;
  subject: string;
  body: string;
  status: "OPEN" | "CLOSED";
};

function uid() {
  const c: any = globalThis.crypto;
  return c?.randomUUID ? c.randomUUID() : `t_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

export function listTickets(): Ticket[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function createTicket(email: string, subject: string, body: string): Ticket {
  const t: Ticket = { id: uid(), at: new Date().toISOString(), email, subject, body, status: "OPEN" };
  const all = [t, ...listTickets()].slice(0, 200);
  if (typeof window !== "undefined") window.localStorage.setItem(KEY, JSON.stringify(all));
  return t;
}

export function closeTicket(id: string) {
  const all = listTickets().map((x) => (x.id === id ? { ...x, status: "CLOSED" } : x));
  if (typeof window !== "undefined") window.localStorage.setItem(KEY, JSON.stringify(all));
}

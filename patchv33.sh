#!/usr/bin/env bash
set -euo pipefail

# ==============================================================================
# Enterprise Rider Portal Upgrade (Execution Portal)
# - Adds offline queue + sync
# - Fixes shipments service missing exports
# - Adds Delivery proof modal (signature/photo/GPS/time)
# - Adds ExecutionShell with sidebar
# - Adds proper /portal/execution routes in src/App.tsx
#
# NOTE: Uses demo-safe keys/placeholders only. No secrets.
# ==============================================================================

backup() { [[ -f "$1" ]] && cp -f "$1" "$1.bak.$(date +%Y%m%d_%H%M%S)" || true; }

APP="src/App.tsx"
SHIPMENTS="src/services/shipments.ts"
OFFLINE="src/lib/executionOfflineQueue.ts"
EXEC_SHELL="src/components/layout/ExecutionShell.tsx"
EXEC_PORTAL="src/pages/portals/ExecutionPortal.tsx"

UNAUTH="src/pages/Unauthorized.tsx"
LOGIN="src/pages/Login.tsx"
DASH_REDIRECT="src/pages/DashboardRedirect.tsx"
MANUAL="src/pages/ManualPage.tsx"
PORTAL_HOME="src/pages/portal/PortalHome.tsx"
EXEC_NAV="src/pages/portals/ExecutionNavigationPage.tsx"

mkdir -p "$(dirname "$APP")" "$(dirname "$SHIPMENTS")" "$(dirname "$OFFLINE")" \
  "$(dirname "$EXEC_SHELL")" "$(dirname "$EXEC_PORTAL")"

backup "$APP"
backup "$SHIPMENTS"
backup "$OFFLINE"
backup "$EXEC_SHELL"
backup "$EXEC_PORTAL"

# ------------------------------------------------------------------------------
# 1) Offline queue (localStorage)
# ------------------------------------------------------------------------------
cat > "$OFFLINE" <<'EOF'
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
EOF

# ------------------------------------------------------------------------------
# 2) Shipments service: keep createShipment + add Execution exports (enterprise)
# ------------------------------------------------------------------------------
cat > "$SHIPMENTS" <<'EOF'
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { insertShipmentTrackingEvent } from "@/services/shipmentTracking";

export type Shipment = {
  id: string;
  wayId?: string | null;
  trackingNumber?: string | null;
  status?: string | null;

  receiverName?: string | null;
  receiverPhone?: string | null;
  receiverAddress?: string | null;

  codAmount?: number | null;
  updatedAt?: string | null;
};

/**
 * Existing API (kept): create shipment via RPC.
 */
export async function createShipment(input: {
  sender_name?: string;
  sender_phone?: string;
  sender_address?: string;
  sender_city?: string;
  sender_state?: string;

  receiver_name: string;
  receiver_phone: string;
  receiver_address: string;
  receiver_city: string;
  receiver_state?: string;

  item_price: number;
  delivery_fee: number;
  cod_amount?: number;
  package_weight?: number | null;
  cbm?: number;
  delivery_type?: string;
  remarks?: string;

  pickup_branch_id?: string | null;
  delivery_branch_id?: string | null;
}): Promise<{ shipmentId: string; wayId: string }> {
  const { data, error } = await supabase.rpc("create_shipment_portal", {
    p_sender_name: input.sender_name ?? null,
    p_sender_phone: input.sender_phone ?? null,
    p_sender_address: input.sender_address ?? null,
    p_sender_city: input.sender_city ?? null,
    p_sender_state: input.sender_state ?? null,

    p_receiver_name: input.receiver_name,
    p_receiver_phone: input.receiver_phone,
    p_receiver_address: input.receiver_address,
    p_receiver_city: input.receiver_city,
    p_receiver_state: input.receiver_state ?? "MM",

    p_item_price: Number(input.item_price || 0),
    p_delivery_fee: Number(input.delivery_fee || 0),
    p_cod_amount: Number(input.cod_amount || 0),
    p_package_weight: input.package_weight ?? null,
    p_cbm: Number(input.cbm ?? 1),
    p_delivery_type: input.delivery_type ?? "Normal",
    p_remarks: input.remarks ?? null,

    p_pickup_branch_id: input.pickup_branch_id ?? null,
    p_delivery_branch_id: input.delivery_branch_id ?? null,
  });

  if (error) throw new Error(error.message);
  const row = Array.isArray(data) ? data[0] : data;
  return { shipmentId: row.shipment_id, wayId: row.way_id };
}

export async function createShipmentDataEntry(input: Parameters<typeof createShipment>[0]) {
  return createShipment(input);
}

function mapShipmentRow(row: any): Shipment {
  return {
    id: String(row?.id ?? row?.shipment_id ?? row?.shipmentId ?? ""),
    wayId: row?.way_id ?? row?.wayId ?? null,
    trackingNumber: row?.tracking_number ?? row?.trackingNumber ?? row?.awb ?? row?.way_id ?? null,
    status: row?.status ?? null,

    receiverName: row?.receiver_name ?? row?.receiverName ?? null,
    receiverPhone: row?.receiver_phone ?? row?.receiverPhone ?? null,
    receiverAddress: row?.receiver_address ?? row?.receiverAddress ?? null,

    codAmount: typeof row?.cod_amount === "number" ? row.cod_amount : row?.codAmount ?? null,
    updatedAt: row?.updated_at ?? row?.updatedAt ?? null,
  };
}

async function currentActor() {
  try {
    const { data } = await supabase.auth.getSession();
    const u = data?.session?.user;
    return { userId: u?.id ?? null, email: u?.email ?? null, role: (u?.app_metadata as any)?.role ?? (u?.user_metadata as any)?.role ?? null };
  } catch {
    return { userId: null, email: null, role: null };
  }
}

/**
 * Enterprise: list shipments assigned to current executor (schema-resilient).
 */
export async function listAssignedShipments(): Promise<Shipment[]> {
  if (!isSupabaseConfigured) {
    try {
      const mod = await import("@/data/mockData");
      const rows = (mod as any).mockShipments ?? [];
      return rows.map((r: any) =>
        mapShipmentRow({
          id: r.id,
          tracking_number: r.trackingNumber,
          status: r.status,
          receiver_name: r.receiverName,
          receiver_address: r.receiverAddress,
        })
      );
    } catch {
      return [];
    }
  }

  const actor = await currentActor();
  const userId = actor.userId;
  const email = actor.email;

  const selects = [
    "id,way_id,tracking_number,status,receiver_name,receiver_phone,receiver_address,cod_amount,updated_at",
    "id,way_id,status,receiver_name,receiver_phone,receiver_address,updated_at",
    "*",
  ];

  // Try likely assignment columns by user id
  const idCols = ["assigned_to", "assigned_rider_id", "executor_id", "rider_id", "assigned_user_id"];
  for (const sel of selects) {
    for (const col of idCols) {
      try {
        if (!userId) continue;
        const res = await supabase.from("shipments").select(sel).eq(col as any, userId).order("updated_at", { ascending: false }).limit(200);
        if (!res.error && Array.isArray(res.data)) return res.data.map(mapShipmentRow);
      } catch {}
    }
  }

  // Try assignment columns by email
  const emailCols = ["assigned_email", "rider_email", "executor_email"];
  for (const sel of selects) {
    for (const col of emailCols) {
      try {
        if (!email) continue;
        const res = await supabase.from("shipments").select(sel).eq(col as any, email).order("updated_at", { ascending: false }).limit(200);
        if (!res.error && Array.isArray(res.data)) return res.data.map(mapShipmentRow);
      } catch {}
    }
  }

  // Fallback: actionable statuses
  const fallbackStatuses = ["OUT_FOR_DELIVERY", "PICKED_UP", "IN_TRANSIT", "DELIVERY_FAILED_NDR"];
  for (const sel of selects) {
    try {
      const res = await supabase.from("shipments").select(sel).in("status" as any, fallbackStatuses as any).order("updated_at", { ascending: false }).limit(200);
      if (!res.error && Array.isArray(res.data)) return res.data.map(mapShipmentRow);
    } catch {}
  }

  return [];
}

async function transitionShipmentBestEffort(shipmentId: string, nextStatusCandidates: string[]) {
  for (const status of nextStatusCandidates) {
    // 1) RPC transition
    try {
      const rpc = await supabase.rpc("transition_shipment", { p_shipment_id: shipmentId, p_next_status: status });
      if (!rpc.error) return;
    } catch {}

    // 2) direct update
    try {
      const upd = await supabase.from("shipments").update({ status, updated_at: new Date().toISOString() } as any).eq("id", shipmentId);
      if (!upd.error) return;
    } catch {}
  }

  throw new Error("Unable to transition shipment (schema mismatch or permission denied).");
}

async function track(eventType: string, shipmentId: string, metadata: any) {
  try {
    const actor = await currentActor();
    await insertShipmentTrackingEvent({
      shipmentId,
      eventType,
      actorId: actor.userId,
      actorRole: actor.role,
      metadata: metadata ?? {},
    });
  } catch {
    // best-effort
  }
}

export async function markPickedUp(shipmentId: string, evidence?: Record<string, unknown>) {
  await transitionShipmentBestEffort(shipmentId, ["PICKED_UP", "OUT_FOR_DELIVERY", "PICKED_UP_PENDING_REGISTRATION"]);
  await track("EXEC_PICKUP", shipmentId, evidence ?? {});
}

export async function markDelivered(shipmentId: string, evidence?: Record<string, unknown>) {
  await transitionShipmentBestEffort(shipmentId, ["DELIVERED", "DELIVERED_POD_CAPTURED", "DELIVERED_OK"]);
  await track("EXEC_DELIVERED", shipmentId, evidence ?? {});
}

export async function markDeliveryFailed(shipmentId: string, evidence?: Record<string, unknown>) {
  await transitionShipmentBestEffort(shipmentId, ["DELIVERY_FAILED_NDR", "DELIVERY_FAILED"]);
  await track("EXEC_NDR", shipmentId, evidence ?? {});
}
EOF

# ------------------------------------------------------------------------------
# 3) ExecutionShell (sidebar)
# ------------------------------------------------------------------------------
cat > "$EXEC_SHELL" <<'EOF'
import React, { useMemo } from "react";
import { NavLink } from "react-router-dom";
import { PortalShell } from "@/components/layout/PortalShell";
import { useLanguage } from "@/contexts/LanguageContext";

const linkBase =
  "block px-4 py-3 rounded-2xl border border-white/10 hover:border-white/20 hover:bg-white/5 text-sm font-semibold";

export function ExecutionShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const { lang } = useLanguage();
  const t = useMemo(() => (lang === "en" ? "en" : "my"), [lang]);

  const items = useMemo(
    () => [
      { to: "/portal/execution", en: "Worklist", my: "လုပ်ငန်းစာရင်း" },
      { to: "/portal/execution/navigation", en: "Navigation", my: "လမ်းညွှန်" },
      { to: "/portal/execution/manual", en: "QR Manual", my: "QR လမ်းညွှန်" },
    ],
    []
  );

  return (
    <PortalShell title={title} links={[]}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <aside className="lg:col-span-3">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-3 space-y-2 sticky top-[88px]">
            <div className="text-[10px] font-mono text-white/60 tracking-widest uppercase px-2 py-1">
              {t === "en" ? "Execution Menu" : "Execution မီနူး"}
            </div>
            {items.map((i) => (
              <NavLink
                key={i.to}
                to={i.to}
                className={({ isActive }) =>
                  `${linkBase} ${isActive ? "bg-emerald-500/10 border-emerald-500/30" : ""}`
                }
              >
                {t === "en" ? i.en : i.my}
              </NavLink>
            ))}
          </div>
        </aside>

        <section className="lg:col-span-9">{children}</section>
      </div>
    </PortalShell>
  );
}
EOF

# ------------------------------------------------------------------------------
# 4) ExecutionPortal (enterprise worklist + proof modal + offline sync)
# ------------------------------------------------------------------------------
cat > "$EXEC_PORTAL" <<'EOF'
import React, { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, CloudOff, RefreshCw, Search, ShieldCheck, XCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ExecutionShell } from "@/components/layout/ExecutionShell";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SignaturePad from "@/components/SignaturePad";
import PhotoCapture from "@/components/PhotoCapture";
import { toast } from "@/components/ui/use-toast";

import { enqueueExecutionAction, loadExecutionQueue, syncExecutionQueue } from "@/lib/executionOfflineQueue";
import { listAssignedShipments, markDelivered, markDeliveryFailed, markPickedUp, type Shipment } from "@/services/shipments";

type DeliverMode = "DELIVERED" | "NDR";

type DeliverDraft = {
  shipmentId: string;
  mode: DeliverMode;
  recipientName: string;
  relationship: "Self" | "Family" | "Neighbor" | "Guard" | "Other";
  otp: string;
  note: string;
  signature?: string;
  photo?: string;
};

function statusBadge(status?: string | null) {
  const s = String(status ?? "").toUpperCase();
  if (s.includes("DELIVER")) return { cls: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20", label: s };
  if (s.includes("FAIL") || s.includes("NDR")) return { cls: "bg-rose-500/10 text-rose-300 border-rose-500/20", label: s };
  if (s.includes("OUT_FOR_DELIVERY") || s.includes("PICKED")) return { cls: "bg-amber-500/10 text-amber-300 border-amber-500/20", label: s };
  return { cls: "bg-white/5 text-white/70 border-white/10", label: s || "UNKNOWN" };
}

async function getGeo(): Promise<{ lat: number; lng: number; accuracyM: number } | null> {
  if (!("geolocation" in navigator)) return null;
  return await new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude, accuracyM: p.coords.accuracy }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  });
}

export default function ExecutionPortal() {
  const { lang } = useLanguage();
  const { user, role } = useAuth();

  const t = useMemo(() => (lang === "en" ? "en" : "my"), [lang]);
  const isExec = useMemo(() => ["RIDER", "DRIVER", "HELPER"].includes(String(role ?? "").trim().toUpperCase()), [role]);

  const [rows, setRows] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [online, setOnline] = useState<boolean>(typeof navigator !== "undefined" ? navigator.onLine : true);

  const [queueCount, setQueueCount] = useState<number>(0);
  const [syncing, setSyncing] = useState(false);

  const [deliverOpen, setDeliverOpen] = useState(false);
  const [draft, setDraft] = useState<DeliverDraft | null>(null);

  const refreshTimer = useRef<number | null>(null);

  async function refresh() {
    setLoading(true);
    setErr(null);
    try {
      const r = await listAssignedShipments();
      setRows(r);
    } catch (e: any) {
      setErr(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  function updateQueueCount() {
    setQueueCount(loadExecutionQueue().length);
  }

  useEffect(() => {
    updateQueueCount();
    void refresh();

    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);

    refreshTimer.current = window.setInterval(() => {
      if (navigator.onLine) void refresh();
      updateQueueCount();
    }, 30000);

    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
      if (refreshTimer.current) window.clearInterval(refreshTimer.current);
    };
  }, []);

  async function syncNow() {
    setSyncing(true);
    try {
      const res = await syncExecutionQueue({
        pickup: async (shipmentId, payload) => markPickedUp(shipmentId, payload),
        deliver: async (shipmentId, payload) => markDelivered(shipmentId, payload),
        ndr: async (shipmentId, payload) => markDeliveryFailed(shipmentId, payload),
      });

      updateQueueCount();
      await refresh();

      toast({
        title: t === "en" ? "Sync completed" : "Sync ပြီးပါပြီ",
        description: `ok=${res.ok} fail=${res.fail} remaining=${res.remaining}`,
      });
    } catch (e: any) {
      toast({ title: "Sync failed", description: e?.message || String(e), variant: "destructive" as any });
    } finally {
      setSyncing(false);
    }
  }

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return rows
      .filter((r) => {
        if (statusFilter !== "ALL" && String(r.status ?? "").toUpperCase() !== statusFilter) return false;
        if (!qq) return true;
        const hay = `${r.trackingNumber ?? ""} ${r.wayId ?? ""} ${r.receiverName ?? ""} ${r.receiverPhone ?? ""} ${r.receiverAddress ?? ""}`.toLowerCase();
        return hay.includes(qq);
      })
      .slice(0, 250);
  }, [rows, q, statusFilter]);

  const statusOptions = useMemo(() => {
    const set = new Set<string>();
    for (const r of rows) set.add(String(r.status ?? "UNKNOWN").toUpperCase());
    return ["ALL", ...Array.from(set).sort()];
  }, [rows]);

  async function pickup(shipmentId: string) {
    try {
      const geo = await getGeo();
      await markPickedUp(shipmentId, { geo, at: new Date().toISOString() });
      toast({ title: t === "en" ? "Picked up" : "Pickup ပြီးပါပြီ" });
      await refresh();
    } catch (e: any) {
      // offline queue
      const geo = await getGeo();
      enqueueExecutionAction({ kind: "PICKUP", shipmentId, payload: { geo, at: new Date().toISOString() } });
      updateQueueCount();
      toast({ title: t === "en" ? "Queued (offline)" : "Queue ထဲထည့်ပြီးပါပြီ", description: "Will sync when online.", variant: "destructive" as any });
    }
  }

  function openDeliver(shipmentId: string) {
    setDraft({
      shipmentId,
      mode: "DELIVERED",
      recipientName: "",
      relationship: "Self",
      otp: "",
      note: "",
    });
    setDeliverOpen(true);
  }

  async function submitDeliver() {
    if (!draft) return;
    if (!draft.recipientName.trim()) {
      toast({ title: t === "en" ? "Recipient required" : "လက်ခံသူအမည်လိုအပ်ပါသည်", variant: "destructive" as any });
      return;
    }

    const geo = await getGeo();
    const payload = {
      mode: draft.mode,
      recipientName: draft.recipientName,
      relationship: draft.relationship,
      otp: draft.otp || null,
      note: draft.note || null,
      signature: draft.signature || null,
      photo: draft.photo || null,
      geo,
      at: new Date().toISOString(),
    };

    try {
      if (draft.mode === "DELIVERED") await markDelivered(draft.shipmentId, payload);
      else await markDeliveryFailed(draft.shipmentId, payload);

      toast({ title: t === "en" ? "Saved" : "သိမ်းပြီးပါပြီ" });
      setDeliverOpen(false);
      setDraft(null);
      await refresh();
    } catch {
      // Queue for sync
      enqueueExecutionAction({
        kind: draft.mode === "DELIVERED" ? "DELIVER" : "NDR",
        shipmentId: draft.shipmentId,
        payload,
      });
      updateQueueCount();
      toast({ title: t === "en" ? "Queued (offline)" : "Queue ထဲထည့်ပြီးပါပြီ", description: "Will sync when online.", variant: "destructive" as any });
      setDeliverOpen(false);
      setDraft(null);
    }
  }

  const title = t === "en" ? "Execution Portal" : "Execution Portal";

  return (
    <ExecutionShell title={title}>
      <div className="space-y-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-300" />
              <div>
                <div className="text-sm font-black tracking-widest uppercase">
                  {t === "en" ? "Rider Worklist" : "Rider လုပ်ငန်းစာရင်း"}
                </div>
                <div className="text-xs text-white/60">
                  {user?.email ?? "—"} • {String(role ?? "NO_ROLE")}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className={online ? "border-emerald-500/30 text-emerald-300" : "border-rose-500/30 text-rose-300"}>
                {online ? (t === "en" ? "ONLINE" : "ONLINE") : (t === "en" ? "OFFLINE" : "OFFLINE")}
              </Badge>

              <Badge variant="outline" className={queueCount ? "border-amber-500/30 text-amber-300" : "border-white/10 text-white/60"}>
                {queueCount ? `${queueCount} queued` : "queue=0"}
              </Badge>

              <Button onClick={() => void syncNow()} disabled={syncing} className="bg-emerald-600 hover:bg-emerald-500">
                {syncing ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                {t === "en" ? "Sync" : "Sync"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-7 relative">
            <Search className="h-4 w-4 text-white/40 absolute left-4 top-1/2 -translate-y-1/2" />
            <Input className="pl-11 bg-[#05080F] border-white/10" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t === "en" ? "Search…" : "ရှာရန်…"} />
          </div>
          <div className="md:col-span-5">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-[#05080F] border-white/10">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {err ? (
          <Card className="bg-rose-500/5 border-rose-500/20">
            <CardContent className="p-4 text-rose-200 text-sm flex items-center gap-2">
              <XCircle className="h-4 w-4" /> {err}
            </CardContent>
          </Card>
        ) : null}

        <Card className="bg-[#05080F] border-white/10">
          <CardContent className="p-0">
            <div className="divide-y divide-white/5">
              {loading ? (
                <div className="p-6 text-sm text-white/60">{t === "en" ? "Loading…" : "ရယူနေပါသည်…"}</div>
              ) : filtered.length === 0 ? (
                <div className="p-6 text-sm text-white/60">{t === "en" ? "No assigned shipments." : "တာဝန်ပေးထားသော Shipment မရှိပါ။"}</div>
              ) : (
                filtered.map((r) => {
                  const b = statusBadge(r.status);
                  return (
                    <div key={r.id} className="p-4 md:p-5 flex items-start justify-between gap-4 flex-wrap">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="font-black text-white">
                            {r.trackingNumber ?? r.wayId ?? r.id}
                          </div>
                          <Badge variant="outline" className={b.cls}>{b.label}</Badge>
                          {!online ? (
                            <Badge variant="outline" className="border-rose-500/30 text-rose-300">
                              <CloudOff className="h-3 w-3 mr-1" /> offline
                            </Badge>
                          ) : null}
                        </div>
                        <div className="text-sm text-white/70 mt-1">
                          {r.receiverName ?? "—"} • {r.receiverPhone ?? "—"}
                        </div>
                        <div className="text-xs text-white/50 mt-1 break-words">
                          {r.receiverAddress ?? "—"}
                        </div>
                        <div className="text-[10px] text-white/40 mt-2 font-mono">
                          id={r.id} • updated={r.updatedAt ?? "—"}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button variant="outline" className="border-white/10" onClick={() => void pickup(r.id)}>
                          {t === "en" ? "Pickup" : "Pickup"}
                        </Button>
                        <Button className="bg-sky-600 hover:bg-sky-500" onClick={() => openDeliver(r.id)}>
                          {t === "en" ? "Deliver" : "Deliver"}
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Delivery / NDR Modal */}
        <Dialog open={deliverOpen} onOpenChange={(v) => { setDeliverOpen(v); if (!v) setDraft(null); }}>
          <DialogContent className="bg-[#05080F] border-white/10 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-black tracking-widest uppercase">
                {t === "en" ? "Delivery Proof" : "Delivery Proof"}
              </DialogTitle>
            </DialogHeader>

            {draft ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>{t === "en" ? "Mode" : "အမျိုးအစား"}</Label>
                    <Select value={draft.mode} onValueChange={(v) => setDraft((x) => x ? { ...x, mode: v as DeliverMode } : x)}>
                      <SelectTrigger className="bg-[#0B101B] border-white/10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DELIVERED">{t === "en" ? "Delivered" : "Delivered"}</SelectItem>
                        <SelectItem value="NDR">{t === "en" ? "Failed (NDR)" : "Failed (NDR)"}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>{t === "en" ? "Relationship" : "ဆက်ဆံရေး"}</Label>
                    <Select value={draft.relationship} onValueChange={(v) => setDraft((x) => x ? { ...x, relationship: v as any } : x)}>
                      <SelectTrigger className="bg-[#0B101B] border-white/10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["Self","Family","Neighbor","Guard","Other"].map((x) => (
                          <SelectItem key={x} value={x}>{x}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>{t === "en" ? "Recipient name" : "လက်ခံသူအမည်"}</Label>
                    <Input className="bg-[#0B101B] border-white/10" value={draft.recipientName} onChange={(e) => setDraft((x) => x ? { ...x, recipientName: e.target.value } : x)} />
                  </div>
                  <div className="space-y-2">
                    <Label>{t === "en" ? "OTP (optional)" : "OTP (optional)"}</Label>
                    <Input className="bg-[#0B101B] border-white/10" value={draft.otp} onChange={(e) => setDraft((x) => x ? { ...x, otp: e.target.value } : x)} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{t === "en" ? "Note (optional)" : "မှတ်ချက် (optional)"}</Label>
                  <Input className="bg-[#0B101B] border-white/10" value={draft.note} onChange={(e) => setDraft((x) => x ? { ...x, note: e.target.value } : x)} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 rounded-2xl border border-white/10 bg-white/5">
                    <div className="text-xs font-mono text-white/60 tracking-widest uppercase mb-2">signature</div>
                    <SignaturePad onSave={(sig) => setDraft((x) => x ? { ...x, signature: sig } : x)} />
                  </div>

                  <div className="p-3 rounded-2xl border border-white/10 bg-white/5">
                    <div className="text-xs font-mono text-white/60 tracking-widest uppercase mb-2">photo</div>
                    <PhotoCapture
                      onCapture={(p) => setDraft((x) => x ? { ...x, photo: p } : x)}
                      watermarkData={{
                        ttId: draft.shipmentId,
                        userId: user?.id ?? "unknown",
                        timestamp: new Date().toISOString(),
                        gps: "auto",
                      }}
                      required={false}
                    />
                  </div>
                </div>
              </div>
            ) : null}

            <DialogFooter className="gap-2">
              <Button variant="outline" className="border-white/10" onClick={() => { setDeliverOpen(false); setDraft(null); }}>
                {t === "en" ? "Cancel" : "မလုပ်တော့"}
              </Button>
              <Button className="bg-emerald-600 hover:bg-emerald-500" onClick={() => void submitDeliver()}>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                {t === "en" ? "Confirm" : "အတည်ပြု"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="text-xs text-white/40">
          {isExec
            ? (t === "en"
                ? "Enterprise mode: offline queue + audit events (best-effort)."
                : "Enterprise mode: offline queue + audit events (best-effort).")
            : (t === "en"
                ? "Non-execution roles may be read-only."
                : "Execution မဟုတ်သော role များအတွက် read-only ဖြစ်နိုင်ပါသည်။")}
        </div>
      </div>
    </ExecutionShell>
  );
}
EOF

# ------------------------------------------------------------------------------
# 5) App.tsx: wire routes for portals (focus: execution/rider)
# ------------------------------------------------------------------------------
cat > "$APP" <<'EOF'
import React, { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import { LanguageProvider } from "./contexts/LanguageContext";
import { RequireAuth } from "@/routes/RequireAuth";
import { RequireRole } from "@/routes/RequireRole";

import Login from "./pages/Login";
import Unauthorized from "./pages/Unauthorized";
import DashboardRedirect from "./pages/DashboardRedirect";
import ManualPage from "./pages/ManualPage";
import PortalHome from "./pages/portal/PortalHome";

import ExecutionPortal from "@/pages/portals/ExecutionPortal";
import ExecutionNavigationPage from "@/pages/portals/ExecutionNavigationPage";

export default function App() {
  return (
    <LanguageProvider>
      <Suspense fallback={<div className="bg-[#05080F] min-h-screen" />}>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            <Route element={<RequireAuth />}>
              <Route path="/" element={<DashboardRedirect />} />
              <Route path="/portal" element={<PortalHome />} />

              {/* Rider / Driver / Helper (Execution portal) */}
              <Route
                path="/portal/execution"
                element={
                  <RequireRole allow={["RIDER", "DRIVER", "HELPER", "SUPER_ADMIN", "SYS", "APP_OWNER"]}>
                    <ExecutionPortal />
                  </RequireRole>
                }
              />
              <Route
                path="/portal/execution/navigation"
                element={
                  <RequireRole allow={["RIDER", "DRIVER", "HELPER", "SUPER_ADMIN", "SYS", "APP_OWNER"]}>
                    <ExecutionNavigationPage />
                  </RequireRole>
                }
              />
              <Route
                path="/portal/execution/manual"
                element={
                  <RequireRole allow={["RIDER", "DRIVER", "HELPER", "OPERATIONS_ADMIN", "STAFF", "DATA_ENTRY", "SUPER_ADMIN", "SYS", "APP_OWNER"]}>
                    <ManualPage />
                  </RequireRole>
                }
              />
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </Suspense>
    </LanguageProvider>
  );
}
EOF

git add "$OFFLINE" "$SHIPMENTS" "$EXEC_SHELL" "$EXEC_PORTAL" "$APP" 2>/dev/null || true

echo "✅ Rider portal upgraded (enterprise):"
echo " - Execution portal worklist + delivery proof + offline queue"
echo " - Missing shipment exports fixed"
echo " - /portal/execution routes wired"
echo
echo "Next:"
echo "  npm run dev"
echo "Commit:"
echo "  git commit -m \"feat(execution): enterprise rider portal (offline sync + proof + routes)\""
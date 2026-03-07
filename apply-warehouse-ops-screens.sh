#!/usr/bin/env bash
set -euo pipefail

# ==============================================================================
# WAREHOUSE OPERATIONS (Enterprise Starter) — Bilingual + Separate Screens
# - Controller/Supervisor Portal
# - Staff Portal
# - Shared WarehouseShell sidebar (role-aware)
# - WarehouseOps service (Supabase best-effort + Local fallback)
# - WarehousePortal redirect based on role
# - App.tsx route patch (best-effort)
#
# Run from repo root:
#   bash apply-warehouse-ops-screens.sh
# ==============================================================================

backup(){ [[ -f "$1" ]] && cp -f "$1" "$1.bak.$(date +%Y%m%d_%H%M%S)" || true; }

WAREHOUSE_SHELL="src/components/layout/WarehouseShell.tsx"
WAREHOUSE_OPS="src/services/warehouseOps.ts"
WH_CTRL="src/pages/portals/warehouse/WarehouseControllerPortal.tsx"
WH_STAFF="src/pages/portals/warehouse/WarehouseStaffPortal.tsx"
WH_PORTAL="src/pages/portals/WarehousePortal.tsx"
APP="src/App.tsx"

mkdir -p \
  "$(dirname "$WAREHOUSE_SHELL")" \
  "$(dirname "$WAREHOUSE_OPS")" \
  "$(dirname "$WH_CTRL")" \
  "$(dirname "$WH_STAFF")" \
  "$(dirname "$WH_PORTAL")"

backup "$WAREHOUSE_SHELL"
backup "$WAREHOUSE_OPS"
backup "$WH_CTRL"
backup "$WH_STAFF"
backup "$WH_PORTAL"
backup "$APP"

# ------------------------------------------------------------------------------
# 1) WarehouseShell (sidebar, role-aware, bilingual)
# ------------------------------------------------------------------------------
cat > "$WAREHOUSE_SHELL" <<'EOF'
import React, { useMemo } from "react";
import { NavLink } from "react-router-dom";
import { PortalShell } from "@/components/layout/PortalShell";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";

const base =
  "block px-4 py-3 rounded-2xl border border-white/10 hover:border-white/20 hover:bg-white/5 text-sm font-semibold";

function roleBucket(role?: string | null): "controller" | "staff" {
  const r = String(role ?? "").toUpperCase().trim();
  const ctrl = new Set([
    "WAREHOUSE_CONTROLLER",
    "WAREHOUSE_SUPERVISOR",
    "WH_CONTROLLER",
    "WH_SUPERVISOR",
    "WH_CTRL",
    "WH_SUP",
    "SUPERVISOR",
    "OPERATIONS_ADMIN",
    "SUPER_ADMIN",
    "SYS",
    "APP_OWNER",
  ]);
  return ctrl.has(r) ? "controller" : "staff";
}

export function WarehouseShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const { lang } = useLanguage();
  const { role } = useAuth();
  const t = (en: string, mm: string) => (lang === "en" ? en : mm);

  const bucket = useMemo(() => roleBucket(role as any), [role]);

  const items = useMemo(() => {
    if (bucket === "controller") {
      return [
        { to: "/portal/warehouse/controller", label: t("Controller Dashboard", "Controller Dashboard") },
        { to: "/portal/warehouse/controller?tab=TASKS", label: t("All Tasks", "Task အားလုံး") },
        { to: "/portal/warehouse/controller?tab=ASSIGN", label: t("Assignments", "တာဝန်ခွဲခြား") },
        { to: "/portal/warehouse/controller?tab=REPORTS", label: t("Reports", "အစီရင်ခံစာ") },
      ];
    }

    return [
      { to: "/portal/warehouse/staff", label: t("My Tasks", "မိမိ Task များ") },
      { to: "/portal/warehouse/staff?tab=RECEIVING", label: t("Receiving", "လက်ခံယူခြင်း") },
      { to: "/portal/warehouse/staff?tab=DISPATCH", label: t("Dispatch", "ပို့ထုတ်ခြင်း") },
    ];
  }, [bucket, lang]);

  return (
    <PortalShell title={title}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <aside className="lg:col-span-3">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-3 space-y-2 sticky top-[88px]">
            <div className="text-[10px] font-mono text-white/60 tracking-widest uppercase px-2 py-1">
              {t("Warehouse Menu", "Warehouse မီနူး")}
            </div>

            {items.map((i) => (
              <NavLink
                key={i.to}
                to={i.to}
                className={({ isActive }) =>
                  `${base} ${isActive ? "bg-emerald-500/10 border-emerald-500/30" : ""}`
                }
              >
                {i.label}
              </NavLink>
            ))}
          </div>
        </aside>

        <section className="lg:col-span-9">{children}</section>
      </div>
    </PortalShell>
  );
}

export default WarehouseShell;
EOF

# ------------------------------------------------------------------------------
# 2) WarehouseOps service (Supabase best-effort + Local fallback)
# ------------------------------------------------------------------------------
cat > "$WAREHOUSE_OPS" <<'EOF'
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export type WarehouseTaskType =
  | "RECEIVE"
  | "PUTAWAY"
  | "PICK"
  | "PACK"
  | "DISPATCH"
  | "CYCLE_COUNT"
  | "QC_HOLD";

export type WarehouseTaskStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "HOLD"
  | "CANCELLED";

export type WarehouseTask = {
  id: string;
  created_at: string;
  created_by_email: string | null;

  type: WarehouseTaskType;
  status: WarehouseTaskStatus;

  reference: string | null; // e.g., AWB/PO/Batch
  sku: string | null;
  qty: number | null;

  from_location: string | null;
  to_location: string | null;

  assigned_to_email: string | null;
  note: string | null;

  meta?: Record<string, unknown> | null;
};

const LS_KEY = "wh_tasks_v1";

function nowIso() {
  return new Date().toISOString();
}

function uuid() {
  const c: any = globalThis.crypto;
  return c?.randomUUID ? c.randomUUID() : `wh_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function safeJson<T>(raw: string | null, fallback: T): T {
  try {
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function loadLocal(): WarehouseTask[] {
  if (typeof window === "undefined") return [];
  const v = safeJson<WarehouseTask[]>(window.localStorage.getItem(LS_KEY), []);
  return Array.isArray(v) ? v : [];
}

function saveLocal(tasks: WarehouseTask[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LS_KEY, JSON.stringify(tasks.slice(0, 3000)));
}

async function actor() {
  try {
    const { data } = await supabase.auth.getSession();
    const u = data?.session?.user;
    return { email: u?.email ?? null, userId: u?.id ?? null };
  } catch {
    return { email: null, userId: null };
  }
}

async function audit(eventType: string, metadata: Record<string, unknown>) {
  if (!isSupabaseConfigured) return;
  try {
    await supabase.from("audit_logs").insert({
      event_type: eventType,
      user_id: null,
      metadata,
    } as any);
  } catch {
    // best-effort
  }
}

function mapRow(r: any): WarehouseTask {
  return {
    id: String(r?.id ?? ""),
    created_at: String(r?.created_at ?? nowIso()),
    created_by_email: r?.created_by_email ?? r?.created_by ?? null,
    type: (String(r?.type ?? "RECEIVE").toUpperCase() as WarehouseTaskType),
    status: (String(r?.status ?? "PENDING").toUpperCase() as WarehouseTaskStatus),
    reference: r?.reference ?? r?.ref ?? null,
    sku: r?.sku ?? null,
    qty: r?.qty ?? null,
    from_location: r?.from_location ?? r?.fromLocation ?? null,
    to_location: r?.to_location ?? r?.toLocation ?? null,
    assigned_to_email: r?.assigned_to_email ?? r?.assignedTo ?? null,
    note: r?.note ?? null,
    meta: r?.meta ?? r?.metadata ?? null,
  };
}

export async function listWarehouseTasks(scope: "ALL" | "MINE"): Promise<WarehouseTask[]> {
  if (!isSupabaseConfigured) {
    const { email } = await actor();
    const all = loadLocal().sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
    return scope === "ALL" ? all : all.filter((t) => (t.assigned_to_email ?? "") === (email ?? ""));
  }

  const { email } = await actor();
  let q = supabase
    .from("warehouse_tasks")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);

  if (scope === "MINE" && email) q = q.eq("assigned_to_email" as any, email);

  const res = await q;
  if (res.error) throw new Error(res.error.message);
  return (res.data ?? []).map(mapRow);
}

export async function createWarehouseTask(input: Omit<WarehouseTask, "id" | "created_at" | "created_by_email">): Promise<WarehouseTask> {
  const a = await actor();
  const task: WarehouseTask = {
    id: uuid(),
    created_at: nowIso(),
    created_by_email: a.email,
    ...input,
  };

  if (!isSupabaseConfigured) {
    const cur = loadLocal();
    saveLocal([task, ...cur]);
    return task;
  }

  const ins = await supabase.from("warehouse_tasks").insert({
    id: task.id,
    created_at: task.created_at,
    created_by_email: task.created_by_email,
    type: task.type,
    status: task.status,
    reference: task.reference,
    sku: task.sku,
    qty: task.qty,
    from_location: task.from_location,
    to_location: task.to_location,
    assigned_to_email: task.assigned_to_email,
    note: task.note,
    meta: task.meta ?? null,
  } as any);

  if (ins.error) throw new Error(ins.error.message);

  await audit("WH_TASK_CREATED", {
    taskId: task.id,
    type: task.type,
    reference: task.reference,
    assignedTo: task.assigned_to_email,
    actorEmail: a.email,
  });

  return task;
}

export async function updateWarehouseTaskStatus(id: string, status: WarehouseTaskStatus, note?: string | null): Promise<void> {
  const a = await actor();

  if (!isSupabaseConfigured) {
    const cur = loadLocal();
    const next = cur.map((t) => (t.id === id ? { ...t, status, note: note ?? t.note } : t));
    saveLocal(next);
    return;
  }

  const upd = await supabase.from("warehouse_tasks").update({
    status,
    note: note ?? null,
    updated_at: nowIso(),
  } as any).eq("id", id);

  if (upd.error) throw new Error(upd.error.message);

  await audit("WH_TASK_STATUS", {
    taskId: id,
    status,
    note: note ?? null,
    actorEmail: a.email,
  });
}

export async function assignWarehouseTask(id: string, assignedToEmail: string | null): Promise<void> {
  const a = await actor();

  if (!isSupabaseConfigured) {
    const cur = loadLocal();
    const next = cur.map((t) => (t.id === id ? { ...t, assigned_to_email: assignedToEmail } : t));
    saveLocal(next);
    return;
  }

  const upd = await supabase.from("warehouse_tasks").update({
    assigned_to_email: assignedToEmail,
    updated_at: nowIso(),
  } as any).eq("id", id);

  if (upd.error) throw new Error(upd.error.message);

  await audit("WH_TASK_ASSIGNED", {
    taskId: id,
    assignedTo: assignedToEmail,
    actorEmail: a.email,
  });
}

export async function listWarehouseStaffEmails(): Promise<string[]> {
  // best-effort; if profiles table differs, return []
  if (!isSupabaseConfigured) return [];

  const staffRoles = ["WAREHOUSE_STAFF", "WH_STAFF", "STAFF", "WAREHOUSE"];
  try {
    const res = await supabase.from("profiles").select("email, role").in("role" as any, staffRoles as any).limit(200);
    if (res.error) return [];
    const emails = (res.data ?? [])
      .map((r: any) => String(r?.email ?? "").trim())
      .filter(Boolean);
    return Array.from(new Set(emails)).sort();
  } catch {
    return [];
  }
}
EOF

# ------------------------------------------------------------------------------
# 3) Controller/Supervisor screen
# ------------------------------------------------------------------------------
cat > "$WH_CTRL" <<'EOF'
import React, { useEffect, useMemo, useState } from "react";
import { WarehouseShell } from "@/components/layout/WarehouseShell";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ClipboardList, Plus, RefreshCw, UserCheck } from "lucide-react";
import {
  assignWarehouseTask,
  createWarehouseTask,
  listWarehouseStaffEmails,
  listWarehouseTasks,
  type WarehouseTask,
  type WarehouseTaskStatus,
  type WarehouseTaskType,
} from "@/services/warehouseOps";

function badgeForStatus(s: WarehouseTaskStatus) {
  const x = String(s).toUpperCase();
  if (x === "COMPLETED") return "border-emerald-500/30 text-emerald-300 bg-emerald-500/10";
  if (x === "IN_PROGRESS") return "border-amber-500/30 text-amber-300 bg-amber-500/10";
  if (x === "HOLD") return "border-rose-500/30 text-rose-300 bg-rose-500/10";
  return "border-white/10 text-white/70 bg-white/5";
}

export default function WarehouseControllerPortal() {
  const { lang } = useLanguage();
  const { user, role } = useAuth();
  const t = (en: string, mm: string) => (lang === "en" ? en : mm);

  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<WarehouseTask[]>([]);
  const [staffEmails, setStaffEmails] = useState<string[]>([]);

  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("ALL");

  const [createOpen, setCreateOpen] = useState(false);
  const [draft, setDraft] = useState({
    type: "RECEIVE" as WarehouseTaskType,
    reference: "",
    sku: "",
    qty: "",
    from_location: "",
    to_location: "",
    assigned_to_email: "",
    note: "",
  });

  async function refresh() {
    setLoading(true);
    try {
      const [all, staff] = await Promise.all([listWarehouseTasks("ALL"), listWarehouseStaffEmails()]);
      setTasks(all);
      setStaffEmails(staff);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return tasks.filter((x) => {
      if (status !== "ALL" && String(x.status).toUpperCase() !== status) return false;
      if (!qq) return true;
      const hay = `${x.type} ${x.status} ${x.reference ?? ""} ${x.sku ?? ""} ${x.from_location ?? ""} ${x.to_location ?? ""} ${x.assigned_to_email ?? ""}`.toLowerCase();
      return hay.includes(qq);
    });
  }, [tasks, q, status]);

  const kpis = useMemo(() => {
    const total = tasks.length;
    const pending = tasks.filter((x) => x.status === "PENDING").length;
    const inprog = tasks.filter((x) => x.status === "IN_PROGRESS").length;
    const done = tasks.filter((x) => x.status === "COMPLETED").length;
    return { total, pending, inprog, done };
  }, [tasks]);

  async function createTask() {
    const qty = draft.qty ? Number(draft.qty) : null;

    await createWarehouseTask({
      type: draft.type,
      status: "PENDING",
      reference: draft.reference.trim() || null,
      sku: draft.sku.trim() || null,
      qty: Number.isFinite(qty as any) ? qty : null,
      from_location: draft.from_location.trim() || null,
      to_location: draft.to_location.trim() || null,
      assigned_to_email: draft.assigned_to_email.trim() || null,
      note: draft.note.trim() || null,
      meta: {
        createdFrom: "WarehouseControllerPortal",
        actorEmail: (user as any)?.email ?? null,
        actorRole: role ?? null,
      },
    });

    setCreateOpen(false);
    setDraft({ type: "RECEIVE", reference: "", sku: "", qty: "", from_location: "", to_location: "", assigned_to_email: "", note: "" });
    await refresh();
  }

  async function assign(id: string, email: string | null) {
    await assignWarehouseTask(id, email);
    await refresh();
  }

  return (
    <WarehouseShell title={t("Warehouse Controller", "Warehouse Controller")}>
      <div className="space-y-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-emerald-300" />
              <div>
                <div className="text-sm font-black tracking-widest uppercase">{t("Warehouse Operations", "Warehouse Operations")}</div>
                <div className="text-xs text-white/60">{(user as any)?.email ?? "—"} • {String(role ?? "NO_ROLE")}</div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="border-white/10 text-white/70">{t("TOTAL", "စုစုပေါင်း")}: {kpis.total}</Badge>
              <Badge variant="outline" className="border-white/10 text-white/70">{t("PENDING", "စောင့်ဆိုင်း")}: {kpis.pending}</Badge>
              <Badge variant="outline" className="border-white/10 text-white/70">{t("IN PROGRESS", "လုပ်ဆောင်နေ")}: {kpis.inprog}</Badge>
              <Badge variant="outline" className="border-white/10 text-white/70">{t("DONE", "ပြီးဆုံး")}: {kpis.done}</Badge>

              <Button variant="outline" className="border-white/10" onClick={() => void refresh()} disabled={loading}>
                <RefreshCw className="h-4 w-4 mr-2" /> {t("Refresh", "ပြန်တင်")}
              </Button>

              <Button className="bg-emerald-600 hover:bg-emerald-500" onClick={() => setCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-2" /> {t("Create Task", "Task ဖန်တီး")}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-7">
            <Input className="bg-[#05080F] border-white/10" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("Search tasks…", "Task ရှာရန်…")} />
          </div>
          <div className="md:col-span-5">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="bg-[#05080F] border-white/10"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                {["ALL","PENDING","IN_PROGRESS","COMPLETED","HOLD","CANCELLED"].map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card className="bg-[#05080F] border-white/10">
          <CardContent className="p-0">
            <div className="p-4 border-b border-white/10 text-xs font-mono text-white/60 tracking-widest uppercase">
              {t("All Tasks", "Task အားလုံး")} • {filtered.length}
            </div>

            <div className="overflow-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 text-white/70">
                  <tr>
                    <th className="p-3 text-xs font-mono tracking-widest uppercase">{t("Type", "အမျိုးအစား")}</th>
                    <th className="p-3 text-xs font-mono tracking-widest uppercase">{t("Status", "အခြေအနေ")}</th>
                    <th className="p-3 text-xs font-mono tracking-widest uppercase">{t("Reference", "ရည်ညွှန်း")}</th>
                    <th className="p-3 text-xs font-mono tracking-widest uppercase">SKU</th>
                    <th className="p-3 text-xs font-mono tracking-widest uppercase">{t("Qty", "အရေအတွက်")}</th>
                    <th className="p-3 text-xs font-mono tracking-widest uppercase">{t("From", "မှ")}</th>
                    <th className="p-3 text-xs font-mono tracking-widest uppercase">{t("To", "သို့")}</th>
                    <th className="p-3 text-xs font-mono tracking-widest uppercase">{t("Assigned", "တာဝန်ပေး")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filtered.map((x) => (
                    <tr key={x.id} className="hover:bg-white/5">
                      <td className="p-3 font-semibold text-white">{x.type}</td>
                      <td className="p-3">
                        <Badge variant="outline" className={badgeForStatus(x.status)}>{x.status}</Badge>
                      </td>
                      <td className="p-3 text-white/80">{x.reference ?? "—"}</td>
                      <td className="p-3 text-white/70">{x.sku ?? "—"}</td>
                      <td className="p-3 text-white/70">{x.qty ?? "—"}</td>
                      <td className="p-3 text-white/70">{x.from_location ?? "—"}</td>
                      <td className="p-3 text-white/70">{x.to_location ?? "—"}</td>
                      <td className="p-3">
                        <Select
                          value={x.assigned_to_email ?? "UNASSIGNED"}
                          onValueChange={(v) => void assign(x.id, v === "UNASSIGNED" ? null : v)}
                        >
                          <SelectTrigger className="bg-black/30 border-white/10 h-10">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="UNASSIGNED">{t("Unassigned", "မပေးသေး")}</SelectItem>
                            {staffEmails.map((e) => (
                              <SelectItem key={e} value={e}>{e}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                  ))}

                  {!loading && filtered.length === 0 ? (
                    <tr><td colSpan={8} className="p-6 text-white/60">{t("No tasks found.", "Task မတွေ့ပါ။")}</td></tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Dialog open={createOpen} onOpenChange={(v) => setCreateOpen(v)}>
          <DialogContent className="bg-[#05080F] border-white/10 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-black tracking-widest uppercase flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-emerald-300" /> {t("Create Warehouse Task", "Warehouse Task ဖန်တီး")}
              </DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <div className="text-[10px] font-mono text-white/60 tracking-widest uppercase">{t("Type", "အမျိုးအစား")}</div>
                <Select value={draft.type} onValueChange={(v) => setDraft((p) => ({ ...p, type: v as any }))}>
                  <SelectTrigger className="bg-[#0B101B] border-white/10"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["RECEIVE","PUTAWAY","PICK","PACK","DISPATCH","CYCLE_COUNT","QC_HOLD"].map((x) => (
                      <SelectItem key={x} value={x}>{x}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="text-[10px] font-mono text-white/60 tracking-widest uppercase">{t("Assign to", "တာဝန်ပေး")}</div>
                <Select value={draft.assigned_to_email || "UNASSIGNED"} onValueChange={(v) => setDraft((p) => ({ ...p, assigned_to_email: v === "UNASSIGNED" ? "" : v }))}>
                  <SelectTrigger className="bg-[#0B101B] border-white/10"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UNASSIGNED">{t("Unassigned", "မပေးသေး")}</SelectItem>
                    {staffEmails.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                  </SelectContent>
                </Select>
                <div className="text-[10px] text-white/40">{t("If staff list is empty, configure profiles roles.", "Staff list မရှိလျှင် profiles role များကို ပြင်ပါ။")}</div>
              </div>

              <div className="space-y-2">
                <div className="text-[10px] font-mono text-white/60 tracking-widest uppercase">{t("Reference (AWB/PO)", "Reference (AWB/PO)")}</div>
                <Input className="bg-[#0B101B] border-white/10" value={draft.reference} onChange={(e) => setDraft((p) => ({ ...p, reference: e.target.value }))} />
              </div>

              <div className="space-y-2">
                <div className="text-[10px] font-mono text-white/60 tracking-widest uppercase">SKU</div>
                <Input className="bg-[#0B101B] border-white/10" value={draft.sku} onChange={(e) => setDraft((p) => ({ ...p, sku: e.target.value }))} />
              </div>

              <div className="space-y-2">
                <div className="text-[10px] font-mono text-white/60 tracking-widest uppercase">{t("Qty", "အရေအတွက်")}</div>
                <Input className="bg-[#0B101B] border-white/10" value={draft.qty} onChange={(e) => setDraft((p) => ({ ...p, qty: e.target.value }))} />
              </div>

              <div className="space-y-2">
                <div className="text-[10px] font-mono text-white/60 tracking-widest uppercase">{t("Note", "မှတ်ချက်")}</div>
                <Input className="bg-[#0B101B] border-white/10" value={draft.note} onChange={(e) => setDraft((p) => ({ ...p, note: e.target.value }))} />
              </div>

              <div className="space-y-2">
                <div className="text-[10px] font-mono text-white/60 tracking-widest uppercase">{t("From location", "မှ Location")}</div>
                <Input className="bg-[#0B101B] border-white/10" value={draft.from_location} onChange={(e) => setDraft((p) => ({ ...p, from_location: e.target.value }))} />
              </div>

              <div className="space-y-2">
                <div className="text-[10px] font-mono text-white/60 tracking-widest uppercase">{t("To location", "သို့ Location")}</div>
                <Input className="bg-[#0B101B] border-white/10" value={draft.to_location} onChange={(e) => setDraft((p) => ({ ...p, to_location: e.target.value }))} />
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" className="border-white/10" onClick={() => setCreateOpen(false)}>
                {t("Cancel", "မလုပ်တော့")}
              </Button>
              <Button className="bg-emerald-600 hover:bg-emerald-500" onClick={() => void createTask()}>
                {t("Create", "ဖန်တီး")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </WarehouseShell>
  );
}
EOF

# ------------------------------------------------------------------------------
# 4) Staff screen
# ------------------------------------------------------------------------------
cat > "$WH_STAFF" <<'EOF'
import React, { useEffect, useMemo, useState } from "react";
import { WarehouseShell } from "@/components/layout/WarehouseShell";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClipboardCheck, RefreshCw, PlayCircle, CheckCircle2, PauseCircle } from "lucide-react";
import {
  listWarehouseTasks,
  updateWarehouseTaskStatus,
  type WarehouseTask,
  type WarehouseTaskStatus,
} from "@/services/warehouseOps";

function badgeForStatus(s: WarehouseTaskStatus) {
  const x = String(s).toUpperCase();
  if (x === "COMPLETED") return "border-emerald-500/30 text-emerald-300 bg-emerald-500/10";
  if (x === "IN_PROGRESS") return "border-amber-500/30 text-amber-300 bg-amber-500/10";
  if (x === "HOLD") return "border-rose-500/30 text-rose-300 bg-rose-500/10";
  return "border-white/10 text-white/70 bg-white/5";
}

export default function WarehouseStaffPortal() {
  const { lang } = useLanguage();
  const { user, role } = useAuth();
  const t = (en: string, mm: string) => (lang === "en" ? en : mm);

  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<WarehouseTask[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("ALL");

  async function refresh() {
    setLoading(true);
    try {
      const mine = await listWarehouseTasks("MINE");
      setTasks(mine);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return tasks.filter((x) => {
      if (status !== "ALL" && String(x.status).toUpperCase() !== status) return false;
      if (!qq) return true;
      const hay = `${x.type} ${x.status} ${x.reference ?? ""} ${x.sku ?? ""} ${x.from_location ?? ""} ${x.to_location ?? ""}`.toLowerCase();
      return hay.includes(qq);
    });
  }, [tasks, q, status]);

  async function setStatusFor(id: string, next: WarehouseTaskStatus) {
    await updateWarehouseTaskStatus(id, next);
    await refresh();
  }

  return (
    <WarehouseShell title={t("Warehouse Staff", "Warehouse Staff")}>
      <div className="space-y-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-emerald-300" />
              <div>
                <div className="text-sm font-black tracking-widest uppercase">{t("My Warehouse Tasks", "မိမိ Warehouse Task များ")}</div>
                <div className="text-xs text-white/60">{(user as any)?.email ?? "—"} • {String(role ?? "NO_ROLE")}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-white/10 text-white/70">{t("Assigned", "ပေးထား")}: {tasks.length}</Badge>
              <Button variant="outline" className="border-white/10" onClick={() => void refresh()} disabled={loading}>
                <RefreshCw className="h-4 w-4 mr-2" /> {t("Refresh", "ပြန်တင်")}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-7">
            <Input className="bg-[#05080F] border-white/10" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("Search my tasks…", "မိမိ Task ရှာရန်…")} />
          </div>
          <div className="md:col-span-5">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="bg-[#05080F] border-white/10"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                {["ALL","PENDING","IN_PROGRESS","COMPLETED","HOLD","CANCELLED"].map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card className="bg-[#05080F] border-white/10">
          <CardContent className="p-0">
            <div className="p-4 border-b border-white/10 text-xs font-mono text-white/60 tracking-widest uppercase">
              {t("My Tasks", "မိမိ Task များ")} • {filtered.length}
            </div>

            <div className="divide-y divide-white/5">
              {loading ? (
                <div className="p-6 text-sm text-white/60">{t("Loading…", "ရယူနေပါသည်…")}</div>
              ) : filtered.length === 0 ? (
                <div className="p-6 text-sm text-white/60">{t("No tasks assigned.", "Task မပေးသေးပါ။")}</div>
              ) : (
                filtered.map((x) => (
                  <div key={x.id} className="p-4 md:p-5 flex items-start justify-between gap-4 flex-wrap">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="font-black text-white">{x.type}</div>
                        <Badge variant="outline" className={badgeForStatus(x.status)}>{x.status}</Badge>
                      </div>

                      <div className="text-sm text-white/70 mt-1">
                        {t("Reference", "Reference")}: {x.reference ?? "—"} • SKU: {x.sku ?? "—"} • {t("Qty", "Qty")}: {x.qty ?? "—"}
                      </div>

                      <div className="text-xs text-white/50 mt-1">
                        {t("From", "မှ")}: {x.from_location ?? "—"} → {t("To", "သို့")}: {x.to_location ?? "—"}
                      </div>

                      {x.note ? <div className="text-xs text-white/40 mt-2">{t("Note", "မှတ်ချက်")}: {x.note}</div> : null}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        className="border-white/10"
                        onClick={() => void setStatusFor(x.id, "IN_PROGRESS")}
                        disabled={x.status === "IN_PROGRESS" || x.status === "COMPLETED"}
                      >
                        <PlayCircle className="h-4 w-4 mr-2" /> {t("Start", "စလုပ်")}
                      </Button>

                      <Button
                        variant="outline"
                        className="border-white/10"
                        onClick={() => void setStatusFor(x.id, "HOLD")}
                        disabled={x.status === "HOLD" || x.status === "COMPLETED"}
                      >
                        <PauseCircle className="h-4 w-4 mr-2" /> {t("Hold", "ခဏရပ်")}
                      </Button>

                      <Button
                        className="bg-emerald-600 hover:bg-emerald-500"
                        onClick={() => void setStatusFor(x.id, "COMPLETED")}
                        disabled={x.status === "COMPLETED"}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" /> {t("Complete", "ပြီးဆုံး")}
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </WarehouseShell>
  );
}
EOF

# ------------------------------------------------------------------------------
# 5) WarehousePortal redirect based on role (keeps /portal/warehouse route clean)
# ------------------------------------------------------------------------------
cat > "$WH_PORTAL" <<'EOF'
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { PortalShell } from "@/components/layout/PortalShell";
import { useLanguage } from "@/contexts/LanguageContext";

function isControllerRole(role?: string | null) {
  const r = String(role ?? "").toUpperCase().trim();
  return [
    "WAREHOUSE_CONTROLLER",
    "WAREHOUSE_SUPERVISOR",
    "WH_CONTROLLER",
    "WH_SUPERVISOR",
    "WH_CTRL",
    "WH_SUP",
    "SUPERVISOR",
    "OPERATIONS_ADMIN",
    "SUPER_ADMIN",
    "SYS",
    "APP_OWNER",
  ].includes(r);
}

export default function WarehousePortal() {
  const { role } = useAuth();
  const { lang } = useLanguage();
  const nav = useNavigate();
  const t = (en: string, mm: string) => (lang === "en" ? en : mm);

  useEffect(() => {
    const to = isControllerRole(role as any) ? "/portal/warehouse/controller" : "/portal/warehouse/staff";
    nav(to, { replace: true });
  }, [role]);

  return (
    <PortalShell title={t("Warehouse", "Warehouse")}>
      <div className="p-6 text-white/70 text-sm">{t("Redirecting…", "ပြောင်းနေပါသည်…")}</div>
    </PortalShell>
  );
}
EOF

# ------------------------------------------------------------------------------
# 6) App.tsx patch (best-effort): add routes if missing
# ------------------------------------------------------------------------------
python3 - <<'PY'
from pathlib import Path
import re

p = Path("src/App.tsx")
if not p.exists():
    print("[warn] src/App.tsx not found. Add routes manually:")
    print('  /portal/warehouse -> WarehousePortal')
    print('  /portal/warehouse/controller -> WarehouseControllerPortal (RequireRole controller roles)')
    print('  /portal/warehouse/staff -> WarehouseStaffPortal (RequireRole staff roles)')
    raise SystemExit(0)

s = p.read_text(encoding="utf-8", errors="ignore")

# ensure imports
def ensure_import(name, path):
    nonlocal_s = globals().get("s")
PY
python3 - <<'PY'
from pathlib import Path
import re

p = Path("src/App.tsx")
s = p.read_text(encoding="utf-8", errors="ignore")

def add_import_once(symbol: str, import_path: str):
  global s
  if re.search(rf"\b{re.escape(symbol)}\b", s):
    return
  # append after last import line
  imports = list(re.finditer(r"^import .*;$", s, flags=re.M))
  if not imports:
    s = f'import {symbol} from "{import_path}";\n' + s
    return
  idx = imports[-1].end()
  s = s[:idx] + f'\nimport {symbol} from "{import_path}";' + s[idx:]

add_import_once("WarehousePortal", "@/pages/portals/WarehousePortal")
add_import_once("WarehouseControllerPortal", "@/pages/portals/warehouse/WarehouseControllerPortal")
add_import_once("WarehouseStaffPortal", "@/pages/portals/warehouse/WarehouseStaffPortal")

# add routes if missing
if "/portal/warehouse/controller" not in s:
  # find an existing warehouse route, replace its element to WarehousePortal redirect, then add controller/staff
  # 1) ensure /portal/warehouse route uses WarehousePortal
  s = re.sub(
      r'path="/portal/warehouse"\s+element=\{\s*<[^>]*WarehousePortal[^>]*>\s*\}\s*/>',
      'path="/portal/warehouse" element={<WarehousePortal />} />',
      s
  )

  # 2) insert routes near /portal/warehouse if exists, else before catch-all
  insert = """
              <Route
                path="/portal/warehouse/controller"
                element={
                  <RequireRole allow={["WAREHOUSE_CONTROLLER","WAREHOUSE_SUPERVISOR","WH_CONTROLLER","WH_SUPERVISOR","WH_CTRL","WH_SUP","SUPERVISOR","OPERATIONS_ADMIN","SUPER_ADMIN","SYS","APP_OWNER"]}>
                    <WarehouseControllerPortal />
                  </RequireRole>
                }
              />
              <Route
                path="/portal/warehouse/staff"
                element={
                  <RequireRole allow={["WAREHOUSE_STAFF","WH_STAFF","STAFF","WAREHOUSE","SUPER_ADMIN","SYS","APP_OWNER"]}>
                    <WarehouseStaffPortal />
                  </RequireRole>
                }
              />
"""
  if "/portal/warehouse" in s:
    m = re.search(r'path="/portal/warehouse"[^\n]*\n', s)
    if m:
      # insert after the /portal/warehouse route block end, best-effort by inserting after first occurrence of that line
      s = s[:m.end()] + insert + s[m.end():]
    else:
      s = s.replace('<Route path="*" element={<Navigate to="/login" replace />} />', insert + '\n              <Route path="*" element={<Navigate to="/login" replace />} />')
  else:
    s = s.replace('<Route path="*" element={<Navigate to="/login" replace />} />', insert + '\n              <Route path="*" element={<Navigate to="/login" replace />} />')

p.write_text(s, encoding="utf-8")
print("[ok] App.tsx patched (best-effort) with warehouse controller/staff routes")
PY

git add "$WAREHOUSE_SHELL" "$WAREHOUSE_OPS" "$WH_CTRL" "$WH_STAFF" "$WH_PORTAL" "$APP" 2>/dev/null || true

echo "✅ Warehouse ops screens created:"
echo " - Controller/Supervisor: $WH_CTRL"
echo " - Staff: $WH_STAFF"
echo " - Redirect portal: $WH_PORTAL"
echo " - Service: $WAREHOUSE_OPS"
echo
echo "Commit:"
echo "  git commit -m \"feat(warehouse): controller+staff portals (bilingual)\""
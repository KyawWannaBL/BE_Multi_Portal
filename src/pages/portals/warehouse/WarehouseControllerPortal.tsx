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

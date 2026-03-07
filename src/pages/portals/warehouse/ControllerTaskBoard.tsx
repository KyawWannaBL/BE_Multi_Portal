import React, { useEffect, useMemo, useState } from "react";
import WarehouseShell from "@/components/layout/WarehouseShell";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import WarehouseStatusBadge from "@/components/warehouse/WarehouseStatusBadge";
import { assignTask, createTask, listStaffEmails, listTasks, type WhTask, type WhTaskType } from "@/services/warehousePlatform";
import { Plus, RefreshCw, Users } from "lucide-react";

export default function ControllerTaskBoard() {
  const { lang } = useLanguage();
  const { user } = useAuth();
  const t = (en: string, mm: string) => (lang === "en" ? en : mm);

  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<WhTask[]>([]);
  const [staff, setStaff] = useState<string[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("ALL");
  const [type, setType] = useState<string>("ALL");

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({
    type: "RECEIVE" as WhTaskType,
    reference: "",
    sku: "",
    qty: "",
    from: "",
    to: "",
    assigned: "",
    note: "",
  });

  async function refresh() {
    setLoading(true);
    try {
      const [ts, emails] = await Promise.all([listTasks("ALL"), listStaffEmails()]);
      setTasks(ts);
      setStaff(emails);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void refresh(); }, []);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return tasks.filter((x) => {
      if (status !== "ALL" && x.status !== status) return false;
      if (type !== "ALL" && x.type !== type) return false;
      if (!qq) return true;
      const hay = `${x.type} ${x.status} ${x.reference ?? ""} ${x.sku ?? ""} ${x.from_location ?? ""} ${x.to_location ?? ""} ${x.assigned_to_email ?? ""}`.toLowerCase();
      return hay.includes(qq);
    });
  }, [tasks, q, status, type]);

  async function createOne() {
    const qty = draft.qty ? Number(draft.qty) : null;
    await createTask({
      type: draft.type,
      status: "PENDING",
      reference: draft.reference.trim() || null,
      sku: draft.sku.trim() || null,
      qty: Number.isFinite(qty as any) ? qty : null,
      from_location: draft.from.trim() ? draft.from.trim().toUpperCase() : null,
      to_location: draft.to.trim() ? draft.to.trim().toUpperCase() : null,
      assigned_to_email: draft.assigned.trim() || null,
      note: draft.note.trim() || null,
      meta: { createdFrom: "ControllerTaskBoard", actorEmail: (user as any)?.email ?? null },
    });
    setOpen(false);
    setDraft({ type: "RECEIVE", reference: "", sku: "", qty: "", from: "", to: "", assigned: "", note: "" });
    await refresh();
  }

  async function doAssign(taskId: string, email: string | null) {
    await assignTask(taskId, email);
    await refresh();
  }

  return (
    <WarehouseShell title={t("Task Board", "Task Board")}>
      <div className="space-y-4">
        <Card className="bg-white/5 border-white/10"><CardContent className="p-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-emerald-300" />
            <div>
              <div className="text-sm font-black tracking-widest uppercase">{t("Task Board", "Task Board")}</div>
              <div className="text-xs text-white/60">{t("Assign and monitor warehouse tasks.", "Warehouse task များကို တာဝန်ခွဲပြီး စောင့်ကြည့်ပါ။")}</div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="border-white/10" onClick={() => void refresh()} disabled={loading}>
              <RefreshCw className="h-4 w-4 mr-2" /> {t("Refresh", "ပြန်တင်")}
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-500" onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4 mr-2" /> {t("Create", "ဖန်တီး")}
            </Button>
          </div>
        </CardContent></Card>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-6"><Input className="bg-[#05080F] border-white/10" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("Search…", "ရှာရန်…")} /></div>
          <div className="md:col-span-3">
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="bg-[#05080F] border-white/10"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>{["ALL","RECEIVE","PUTAWAY","PICK","PACK","DISPATCH","CYCLE_COUNT","QC_HOLD"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="md:col-span-3">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="bg-[#05080F] border-white/10"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>{["ALL","PENDING","IN_PROGRESS","COMPLETED","HOLD","CANCELLED"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>

        <Card className="bg-[#05080F] border-white/10"><CardContent className="p-0">
          <div className="p-4 border-b border-white/10 text-xs font-mono text-white/60 tracking-widest uppercase">
            {t("All Tasks", "Task အားလုံး")} • {filtered.length}
          </div>

          <div className="overflow-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-white/70">
                <tr>
                  <th className="p-3 text-xs font-mono tracking-widest uppercase">TYPE</th>
                  <th className="p-3 text-xs font-mono tracking-widest uppercase">STATUS</th>
                  <th className="p-3 text-xs font-mono tracking-widest uppercase">REF</th>
                  <th className="p-3 text-xs font-mono tracking-widest uppercase">SKU</th>
                  <th className="p-3 text-xs font-mono tracking-widest uppercase">QTY</th>
                  <th className="p-3 text-xs font-mono tracking-widest uppercase">FROM</th>
                  <th className="p-3 text-xs font-mono tracking-widest uppercase">TO</th>
                  <th className="p-3 text-xs font-mono tracking-widest uppercase">{t("ASSIGNED", "တာဝန်ပေး")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filtered.map((x) => (
                  <tr key={x.id} className="hover:bg-white/5">
                    <td className="p-3 font-semibold text-white">{x.type}</td>
                    <td className="p-3"><WarehouseStatusBadge status={x.status} /></td>
                    <td className="p-3 text-white/80">{x.reference ?? "—"}</td>
                    <td className="p-3 text-white/70">{x.sku ?? "—"}</td>
                    <td className="p-3 text-white/70">{x.qty ?? "—"}</td>
                    <td className="p-3 text-white/70">{x.from_location ?? "—"}</td>
                    <td className="p-3 text-white/70">{x.to_location ?? "—"}</td>
                    <td className="p-3">
                      <Select value={x.assigned_to_email ?? "UNASSIGNED"} onValueChange={(v) => void doAssign(x.id, v === "UNASSIGNED" ? null : v)}>
                        <SelectTrigger className="bg-black/30 border-white/10 h-10"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UNASSIGNED">{t("Unassigned", "မပေးသေး")}</SelectItem>
                          {staff.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </td>
                  </tr>
                ))}
                {!loading && filtered.length === 0 ? <tr><td colSpan={8} className="p-6 text-white/60">{t("No tasks.", "Task မရှိပါ။")}</td></tr> : null}
              </tbody>
            </table>
          </div>
        </CardContent></Card>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="bg-[#05080F] border-white/10 text-white max-w-2xl">
            <DialogHeader><DialogTitle className="font-black tracking-widest uppercase">{t("Create Task", "Task ဖန်တီး")}</DialogTitle></DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <div className="text-[10px] font-mono text-white/60 tracking-widest uppercase">TYPE</div>
                <Select value={draft.type} onValueChange={(v) => setDraft((p) => ({ ...p, type: v as any }))}>
                  <SelectTrigger className="bg-[#0B101B] border-white/10"><SelectValue /></SelectTrigger>
                  <SelectContent>{["RECEIVE","PUTAWAY","PICK","PACK","DISPATCH","CYCLE_COUNT","QC_HOLD"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="text-[10px] font-mono text-white/60 tracking-widest uppercase">{t("ASSIGN TO", "တာဝန်ပေး")}</div>
                <Select value={draft.assigned || "UNASSIGNED"} onValueChange={(v) => setDraft((p) => ({ ...p, assigned: v === "UNASSIGNED" ? "" : v }))}>
                  <SelectTrigger className="bg-[#0B101B] border-white/10"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UNASSIGNED">{t("Unassigned", "မပေးသေး")}</SelectItem>
                    {staff.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="text-[10px] font-mono text-white/60 tracking-widest uppercase">REFERENCE</div>
                <Input className="bg-[#0B101B] border-white/10" value={draft.reference} onChange={(e) => setDraft((p) => ({ ...p, reference: e.target.value }))} />
              </div>

              <div className="space-y-2">
                <div className="text-[10px] font-mono text-white/60 tracking-widest uppercase">SKU</div>
                <Input className="bg-[#0B101B] border-white/10" value={draft.sku} onChange={(e) => setDraft((p) => ({ ...p, sku: e.target.value }))} />
              </div>

              <div className="space-y-2">
                <div className="text-[10px] font-mono text-white/60 tracking-widest uppercase">QTY</div>
                <Input className="bg-[#0B101B] border-white/10" value={draft.qty} onChange={(e) => setDraft((p) => ({ ...p, qty: e.target.value }))} />
              </div>

              <div className="space-y-2">
                <div className="text-[10px] font-mono text-white/60 tracking-widest uppercase">NOTE</div>
                <Input className="bg-[#0B101B] border-white/10" value={draft.note} onChange={(e) => setDraft((p) => ({ ...p, note: e.target.value }))} />
              </div>

              <div className="space-y-2">
                <div className="text-[10px] font-mono text-white/60 tracking-widest uppercase">FROM</div>
                <Input className="bg-[#0B101B] border-white/10" value={draft.from} onChange={(e) => setDraft((p) => ({ ...p, from: e.target.value }))} />
              </div>

              <div className="space-y-2">
                <div className="text-[10px] font-mono text-white/60 tracking-widest uppercase">TO</div>
                <Input className="bg-[#0B101B] border-white/10" value={draft.to} onChange={(e) => setDraft((p) => ({ ...p, to: e.target.value }))} />
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" className="border-white/10" onClick={() => setOpen(false)}>{t("Cancel", "မလုပ်တော့")}</Button>
              <Button className="bg-emerald-600 hover:bg-emerald-500" onClick={() => void createOne()}>{t("Create", "ဖန်တီး")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </WarehouseShell>
  );
}

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

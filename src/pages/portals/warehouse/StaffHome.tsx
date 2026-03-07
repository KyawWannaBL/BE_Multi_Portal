import React, { useEffect, useMemo, useState } from "react";
import WarehouseShell from "@/components/layout/WarehouseShell";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import WarehouseStatusBadge from "@/components/warehouse/WarehouseStatusBadge";
import { listTasks, setTaskStatus, type WhTask } from "@/services/warehousePlatform";
import { enqueueWhAction, loadWhQueue, syncWhQueue } from "@/lib/warehouseOfflineQueue";
import { RefreshCw, CloudOff, CheckCircle2, PauseCircle, PlayCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function StaffHome() {
  const { lang } = useLanguage();
  const { user } = useAuth();
  const t = (en: string, mm: string) => (lang === "en" ? en : mm);

  const [tasks, setTasks] = useState<WhTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [queue, setQueue] = useState<number>(0);
  const [syncing, setSyncing] = useState(false);

  async function refresh() {
    setLoading(true);
    try {
      setTasks(await listTasks("MINE"));
      setQueue(loadWhQueue().length);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void refresh(); }, []);

  async function applyStatus(id: string, status: any) {
    try {
      await setTaskStatus(id, status);
      await refresh();
    } catch {
      enqueueWhAction({ kind: status === "IN_PROGRESS" ? "TASK_START" : status === "HOLD" ? "TASK_HOLD" : "TASK_COMPLETE", taskId: id, payload: { status, at: new Date().toISOString() } });
      await refresh();
    }
  }

  async function syncNow() {
    setSyncing(true);
    try {
      await syncWhQueue({
        onStart: async (taskId, payload) => setTaskStatus(taskId, "IN_PROGRESS", String(payload.note ?? "")),
        onHold: async (taskId, payload) => setTaskStatus(taskId, "HOLD", String(payload.note ?? "")),
        onComplete: async (taskId, payload) => setTaskStatus(taskId, "COMPLETED", String(payload.note ?? "")),
        onOp: async () => {},
      });
    } finally {
      setSyncing(false);
      await refresh();
    }
  }

  const kpi = useMemo(() => {
    const pending = tasks.filter((x) => x.status === "PENDING").length;
    const inprog = tasks.filter((x) => x.status === "IN_PROGRESS").length;
    return { pending, inprog };
  }, [tasks]);

  return (
    <WarehouseShell title={t("Warehouse Staff", "Warehouse Staff")}>
      <div className="space-y-4">
        <Card className="bg-white/5 border-white/10"><CardContent className="p-4 flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="text-sm font-black tracking-widest uppercase">{t("My Tasks", "မိမိ Task များ")}</div>
            <div className="text-xs text-white/60">{(user as any)?.email ?? "—"}</div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="border-white/10">PENDING {kpi.pending}</Badge>
            <Badge variant="outline" className="border-white/10">IN_PROGRESS {kpi.inprog}</Badge>
            <Badge variant="outline" className={queue ? "border-amber-500/30 text-amber-300 bg-amber-500/10" : "border-white/10 text-white/60"}>
              {queue ? `${queue} queued` : "queue=0"}
            </Badge>
            <Button className="bg-emerald-600 hover:bg-emerald-500" onClick={() => void syncNow()} disabled={syncing}>
              <RefreshCw className={"h-4 w-4 mr-2 " + (syncing ? "animate-spin" : "")} />
              {t("Sync", "Sync")}
            </Button>
            <Button variant="outline" className="border-white/10" onClick={() => void refresh()} disabled={loading}>
              <RefreshCw className="h-4 w-4 mr-2" /> {t("Refresh", "ပြန်တင်")}
            </Button>
          </div>
        </CardContent></Card>

        <Card className="bg-[#05080F] border-white/10"><CardContent className="p-0">
          <div className="divide-y divide-white/5">
            {loading ? (
              <div className="p-6 text-white/60">{t("Loading…", "ရယူနေပါသည်…")}</div>
            ) : tasks.length === 0 ? (
              <div className="p-6 text-white/60">{t("No tasks assigned.", "Task မပေးသေးပါ။")}</div>
            ) : (
              tasks.map((x) => (
                <div key={x.id} className="p-4 flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="font-black text-white">{x.type}</div>
                      <WarehouseStatusBadge status={x.status} />
                      {x.reference ? <Badge variant="outline" className="border-white/10">{x.reference}</Badge> : null}
                      {!navigator.onLine ? <Badge variant="outline" className="border-rose-500/30 text-rose-300 bg-rose-500/10"><CloudOff className="h-3 w-3 mr-1" /> offline</Badge> : null}
                    </div>
                    <div className="text-sm text-white/70 mt-1">SKU: {x.sku ?? "—"} • QTY: {x.qty ?? "—"}</div>
                    <div className="text-xs text-white/50 mt-1">FROM: {x.from_location ?? "—"} → TO: {x.to_location ?? "—"}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" className="border-white/10" onClick={() => void applyStatus(x.id, "IN_PROGRESS")} disabled={x.status === "COMPLETED"}>
                      <PlayCircle className="h-4 w-4 mr-2" /> {t("Start", "စလုပ်")}
                    </Button>
                    <Button variant="outline" className="border-white/10" onClick={() => void applyStatus(x.id, "HOLD")} disabled={x.status === "COMPLETED"}>
                      <PauseCircle className="h-4 w-4 mr-2" /> {t("Hold", "ခဏရပ်")}
                    </Button>
                    <Button className="bg-emerald-600 hover:bg-emerald-500" onClick={() => void applyStatus(x.id, "COMPLETED")} disabled={x.status === "COMPLETED"}>
                      <CheckCircle2 className="h-4 w-4 mr-2" /> {t("Complete", "ပြီးဆုံး")}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent></Card>
      </div>
    </WarehouseShell>
  );
}

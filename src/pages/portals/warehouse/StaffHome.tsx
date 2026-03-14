import React, { useEffect, useMemo, useState } from "react";
import WarehouseShell from "@/components/layout/WarehouseShell";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { listTasks, setTaskStatus, type WhTask } from "@/services/warehousePlatform";
import { enqueueWhAction, loadWhQueue, syncWhQueue } from "@/lib/warehouseOfflineQueue";
import { RefreshCw, CloudOff, CheckCircle2, PauseCircle, PlayCircle, ClipboardList, Loader2 } from "lucide-react";

export default function StaffHome() {
  const { lang } = useLanguage();
  const { user, legacyUser } = useAuth() as any;
  const t = (en: string, my: string) => (lang === "en" ? en : my);

  const activeEmail = user?.email || legacyUser?.email || "staff";

  const [tasks, setTasks] = useState<WhTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [queueCount, setQueueCount] = useState<number>(0);
  const [syncing, setSyncing] = useState(false);

  async function refresh() {
    setLoading(true);
    try {
      setTasks(await listTasks("MINE"));
      setQueueCount(loadWhQueue().length);
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
    return {
      pending: tasks.filter((x) => x.status === "PENDING").length,
      inprog: tasks.filter((x) => x.status === "IN_PROGRESS").length,
    };
  }, [tasks]);

  return (
    <WarehouseShell title={t("Staff Dashboard", "ဝန်ထမ်း Dashboard")}>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Header Dashboard */}
        <div className="bg-[#0E1525] border border-white/5 rounded-[2rem] p-6 shadow-xl flex flex-col md:flex-row justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 rounded-2xl"><ClipboardList className="h-6 w-6 text-emerald-500" /></div>
            <div>
              <h2 className="text-lg font-black tracking-widest uppercase text-white">{t("My Task Queue", "မိမိ လုပ်ဆောင်ရန်အလုပ်များ")}</h2>
              <p className="text-xs text-gray-500 mt-1">{activeEmail}</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex gap-2 bg-[#0A0F1C] p-1.5 rounded-xl border border-white/5">
              <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-lg text-[10px] font-black tracking-widest uppercase">PENDING {kpi.pending}</span>
              <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg text-[10px] font-black tracking-widest uppercase">IN PROG {kpi.inprog}</span>
            </div>

            {queueCount > 0 && (
              <button onClick={syncNow} disabled={syncing} className="px-4 py-2 bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(244,63,94,0.2)]">
                {syncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CloudOff className="h-4 w-4" />}
                {queueCount} {t("Offline", "အော့ဖ်လိုင်း")}
              </button>
            )}

            <button onClick={refresh} disabled={loading} className="p-3 bg-[#0A0F1C] border border-white/5 hover:border-emerald-500 text-gray-400 hover:text-emerald-500 rounded-xl transition-all">
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Task List */}
        <div className="bg-[#0E1525] border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl">
          <div className="divide-y divide-white/5">
            {loading ? (
              <div className="p-8 text-center text-gray-500 text-sm font-bold tracking-widest uppercase flex flex-col items-center gap-3"><Loader2 className="h-8 w-8 animate-spin text-emerald-500" /> {t("Loading Tasks...", "ရယူနေပါသည်...")}</div>
            ) : tasks.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm font-bold tracking-widest uppercase"><ClipboardList className="h-12 w-12 mx-auto mb-3 opacity-20" /> {t("No tasks assigned.", "တာဝန်ပေးထားသောအလုပ် မရှိပါ။")}</div>
            ) : (
              tasks.map((x) => (
                <div key={x.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-[#131C31] transition-colors group">
                  
                  {/* Task Info */}
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-lg font-black text-white uppercase tracking-wider">{x.type}</span>
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black tracking-widest border ${
                        x.status === 'COMPLETED' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                        x.status === 'IN_PROGRESS' ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' :
                        x.status === 'HOLD' ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' :
                        'bg-gray-800 border-gray-600 text-gray-400'
                      }`}>
                        {x.status}
                      </span>
                      {x.reference && <span className="text-xs font-mono text-gray-400 bg-black/50 px-2 py-1 rounded border border-white/10">{x.reference}</span>}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 bg-[#0A0F1C] p-3 rounded-xl border border-white/5 w-fit">
                      <div><p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">SKU</p><p className="text-sm font-mono text-white">{x.sku || "—"}</p></div>
                      <div><p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">QTY</p><p className="text-sm font-mono text-white">{x.qty || "—"}</p></div>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest">
                      <span className="text-emerald-500">FR:</span> {x.from_location || "—"} <span className="mx-2 text-gray-700">➔</span> <span className="text-blue-500">TO:</span> {x.to_location || "—"}
                    </div>
                  </div>

                  {/* Task Actions */}
                  <div className="flex items-center gap-2 grid-cols-3 md:flex-row w-full md:w-auto">
                    <button onClick={() => applyStatus(x.id, "IN_PROGRESS")} disabled={x.status === "COMPLETED" || x.status === "IN_PROGRESS"} className="flex-1 md:flex-none p-4 md:p-3 bg-blue-600/10 border border-blue-500/30 hover:bg-blue-600 hover:text-white text-blue-400 rounded-xl transition-all disabled:opacity-30 flex justify-center items-center">
                      <PlayCircle className="h-5 w-5" />
                    </button>
                    <button onClick={() => applyStatus(x.id, "HOLD")} disabled={x.status === "COMPLETED" || x.status === "HOLD"} className="flex-1 md:flex-none p-4 md:p-3 bg-amber-600/10 border border-amber-500/30 hover:bg-amber-600 hover:text-white text-amber-500 rounded-xl transition-all disabled:opacity-30 flex justify-center items-center">
                      <PauseCircle className="h-5 w-5" />
                    </button>
                    <button onClick={() => applyStatus(x.id, "COMPLETED")} disabled={x.status === "COMPLETED"} className="flex-1 md:flex-none px-6 py-4 md:py-3 bg-emerald-600 border border-emerald-500 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all disabled:opacity-30 shadow-[0_0_15px_rgba(5,150,105,0.2)] flex justify-center items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" /> <span className="hidden md:inline">{t("Done", "ပြီးပြီ")}</span>
                    </button>
                  </div>

                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </WarehouseShell>
  );
}

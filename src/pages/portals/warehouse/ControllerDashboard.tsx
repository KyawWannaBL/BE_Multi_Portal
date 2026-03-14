import React, { useEffect, useMemo, useState } from "react";
import WarehouseShell from "@/components/layout/WarehouseShell";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { RefreshCw, LayoutDashboard, Package, ArrowRight, ArrowLeft, Database } from "lucide-react";
import { listInventory, listLocations, listSkus, listTasks, type WhTask } from "@/services/warehousePlatform";

export default function ControllerDashboard() {
  const { lang } = useLanguage();
  const { user, legacyUser, role } = useAuth() as any;
  const t = (en: string, my: string) => (lang === "en" ? en : my);

  const activeEmail = user?.email || legacyUser?.email || "—";
  const activeRole = role || legacyUser?.role || "CONTROLLER";

  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<WhTask[]>([]);
  const [skuCount, setSkuCount] = useState(0);
  const [locCount, setLocCount] = useState(0);
  const [invCount, setInvCount] = useState(0);

  async function refresh() {
    setLoading(true);
    try {
      const [ts, skus, locs, inv] = await Promise.all([listTasks("ALL"), listSkus(), listLocations(), listInventory()]);
      setTasks(ts);
      setSkuCount(skus.length);
      setLocCount(locs.length);
      setInvCount(inv.length);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void refresh(); }, []);

  const kpi = useMemo(() => {
    return {
      total: tasks.length,
      pending: tasks.filter((x) => x.status === "PENDING").length,
      inprog: tasks.filter((x) => x.status === "IN_PROGRESS").length,
      done: tasks.filter((x) => x.status === "COMPLETED").length,
      inbound: tasks.filter((x) => x.type === "RECEIVE" || x.type === "PUTAWAY").length,
      outbound: tasks.filter((x) => x.type === "PICK" || x.type === "PACK" || x.type === "DISPATCH").length,
    };
  }, [tasks]);

  return (
    <WarehouseShell title={t("Controller Hub", "စီမံခန့်ခွဲမှု Dashboard")}>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Header Header */}
        <div className="bg-[#0E1525] border border-white/5 rounded-[2rem] p-6 flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-2xl"><LayoutDashboard className="h-6 w-6 text-blue-500" /></div>
            <div>
              <h2 className="text-lg font-black tracking-widest uppercase text-white">{t("Operations Overview", "လုပ်ငန်းစဉ် ခြုံငုံသုံးသပ်ချက်")}</h2>
              <p className="text-xs text-gray-500 mt-1">{activeEmail} • <span className="text-blue-400 font-mono">{activeRole}</span></p>
            </div>
          </div>
          <button onClick={refresh} disabled={loading} className="px-4 py-2 bg-[#0A0F1C] border border-white/5 hover:border-blue-500 text-gray-400 hover:text-blue-500 rounded-xl transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-widest disabled:opacity-50">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> {t("Refresh", "ပြန်တင်မည်")}
          </button>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Tasks KPI */}
          <div className="bg-[#0E1525] border border-white/5 rounded-[2rem] p-6 space-y-4 hover:border-blue-500/30 transition-colors">
            <div className="flex items-center gap-3 mb-2">
              <Package className="h-5 w-5 text-blue-400" />
              <h3 className="text-xs font-black tracking-widest text-gray-400 uppercase">{t("Task Queue", "လုပ်ဆောင်ရန်အလုပ်များ")}</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-[#0A0F1C] p-3 rounded-xl border border-white/5"><p className="text-[10px] text-gray-500 font-bold uppercase">Total</p><p className="text-xl font-black text-white">{kpi.total}</p></div>
              <div className="bg-amber-500/10 p-3 rounded-xl border border-amber-500/20"><p className="text-[10px] text-amber-500 font-bold uppercase">Pending</p><p className="text-xl font-black text-amber-500">{kpi.pending}</p></div>
              <div className="bg-blue-500/10 p-3 rounded-xl border border-blue-500/20"><p className="text-[10px] text-blue-400 font-bold uppercase">In Progress</p><p className="text-xl font-black text-blue-400">{kpi.inprog}</p></div>
              <div className="bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20"><p className="text-[10px] text-emerald-500 font-bold uppercase">Done</p><p className="text-xl font-black text-emerald-500">{kpi.done}</p></div>
            </div>
          </div>

          {/* Flow KPI */}
          <div className="bg-[#0E1525] border border-white/5 rounded-[2rem] p-6 space-y-4 hover:border-emerald-500/30 transition-colors">
            <div className="flex items-center gap-3 mb-2">
              <ArrowRight className="h-5 w-5 text-emerald-400" />
              <h3 className="text-xs font-black tracking-widest text-gray-400 uppercase">{t("Throughput", "အဝင်/အထွက်")}</h3>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <div className="flex justify-between items-center bg-[#0A0F1C] p-4 rounded-xl border border-white/5">
                <div className="flex items-center gap-2"><ArrowLeft className="h-4 w-4 text-emerald-500"/><span className="text-xs font-bold text-gray-300 uppercase">Inbound</span></div>
                <span className="text-xl font-black text-white">{kpi.inbound}</span>
              </div>
              <div className="flex justify-between items-center bg-[#0A0F1C] p-4 rounded-xl border border-white/5">
                <div className="flex items-center gap-2"><ArrowRight className="h-4 w-4 text-amber-500"/><span className="text-xs font-bold text-gray-300 uppercase">Outbound</span></div>
                <span className="text-xl font-black text-white">{kpi.outbound}</span>
              </div>
            </div>
          </div>

          {/* Master Data KPI */}
          <div className="bg-[#0E1525] border border-white/5 rounded-[2rem] p-6 space-y-4 hover:border-indigo-500/30 transition-colors">
            <div className="flex items-center gap-3 mb-2">
              <Database className="h-5 w-5 text-indigo-400" />
              <h3 className="text-xs font-black tracking-widest text-gray-400 uppercase">{t("Master Data", "အခြေခံအချက်အလက်")}</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-[#0A0F1C] p-3 rounded-xl border border-white/5"><p className="text-[10px] text-gray-500 font-bold uppercase">SKUs</p><p className="text-xl font-black text-white">{skuCount}</p></div>
              <div className="bg-[#0A0F1C] p-3 rounded-xl border border-white/5"><p className="text-[10px] text-gray-500 font-bold uppercase">Locations</p><p className="text-xl font-black text-white">{locCount}</p></div>
              <div className="col-span-2 bg-indigo-500/10 p-3 rounded-xl border border-indigo-500/20"><p className="text-[10px] text-indigo-400 font-bold uppercase">Active Inventory Rows</p><p className="text-xl font-black text-indigo-400">{invCount}</p></div>
            </div>
          </div>

        </div>
      </div>
    </WarehouseShell>
  );
}

import React, { useEffect, useMemo, useState } from "react";
import WarehouseShell from "@/components/layout/WarehouseShell";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, LayoutDashboard } from "lucide-react";
import { listInventory, listLocations, listSkus, listTasks, type WhTask } from "@/services/warehousePlatform";

export default function ControllerDashboard() {
  const { lang } = useLanguage();
  const { user, role } = useAuth();
  const t = (en: string, mm: string) => (lang === "en" ? en : mm);

  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<WhTask[]>([]);
  const [skuCount, setSkuCount] = useState<number>(0);
  const [locCount, setLocCount] = useState<number>(0);
  const [invCount, setInvCount] = useState<number>(0);

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
    const total = tasks.length;
    const pending = tasks.filter((x) => x.status === "PENDING").length;
    const inprog = tasks.filter((x) => x.status === "IN_PROGRESS").length;
    const done = tasks.filter((x) => x.status === "COMPLETED").length;
    const inbound = tasks.filter((x) => x.type === "RECEIVE" || x.type === "PUTAWAY").length;
    const outbound = tasks.filter((x) => x.type === "PICK" || x.type === "PACK" || x.type === "DISPATCH").length;
    return { total, pending, inprog, done, inbound, outbound };
  }, [tasks]);

  const title = t("Warehouse Controller", "Warehouse Controller");

  return (
    <WarehouseShell title={title}>
      <div className="space-y-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <LayoutDashboard className="h-5 w-5 text-emerald-300" />
              <div>
                <div className="text-sm font-black tracking-widest uppercase">{t("Controller Dashboard", "Controller Dashboard")}</div>
                <div className="text-xs text-white/60">{(user as any)?.email ?? "—"} • {String(role ?? "NO_ROLE")}</div>
              </div>
            </div>
            <Button variant="outline" className="border-white/10" onClick={() => void refresh()} disabled={loading}>
              <RefreshCw className="h-4 w-4 mr-2" /> {t("Refresh", "ပြန်တင်")}
            </Button>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Card className="bg-[#05080F] border-white/10"><CardContent className="p-4 space-y-2">
            <div className="text-xs font-mono text-white/60 tracking-widest uppercase">{t("Tasks", "Tasks")}</div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="border-white/10">TOTAL {kpi.total}</Badge>
              <Badge variant="outline" className="border-white/10">PENDING {kpi.pending}</Badge>
              <Badge variant="outline" className="border-white/10">IN_PROGRESS {kpi.inprog}</Badge>
              <Badge variant="outline" className="border-white/10">DONE {kpi.done}</Badge>
            </div>
            <div className="text-xs text-white/50">{t("Monitor operational throughput and backlog.", "လုပ်ငန်းအလုပ်များ၏ အလုပ်ကျန်/ပြီးစီးမှုကို စောင့်ကြည့်ပါ။")}</div>
          </CardContent></Card>

          <Card className="bg-[#05080F] border-white/10"><CardContent className="p-4 space-y-2">
            <div className="text-xs font-mono text-white/60 tracking-widest uppercase">{t("Inbound / Outbound", "Inbound / Outbound")}</div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="border-white/10">INBOUND {kpi.inbound}</Badge>
              <Badge variant="outline" className="border-white/10">OUTBOUND {kpi.outbound}</Badge>
            </div>
            <div className="text-xs text-white/50">{t("Control receiving, putaway, pick/pack/dispatch.", "Receiving/Putaway နှင့် Pick/Pack/Dispatch ကို ထိန်းချုပ်ပါ။")}</div>
          </CardContent></Card>

          <Card className="bg-[#05080F] border-white/10"><CardContent className="p-4 space-y-2">
            <div className="text-xs font-mono text-white/60 tracking-widest uppercase">{t("Master + Inventory", "Master + Inventory")}</div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="border-white/10">SKUs {skuCount}</Badge>
              <Badge variant="outline" className="border-white/10">LOC {locCount}</Badge>
              <Badge variant="outline" className="border-white/10">INV ROWS {invCount}</Badge>
            </div>
            <div className="text-xs text-white/50">{t("Maintain SKUs/locations and inventory accuracy.", "SKU/Location နှင့် Stock တိကျမှုကို ထိန်းသိမ်းပါ။")}</div>
          </CardContent></Card>
        </div>
      </div>
    </WarehouseShell>
  );
}

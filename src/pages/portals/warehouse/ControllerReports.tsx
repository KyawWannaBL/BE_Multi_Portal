import React, { useEffect, useMemo, useState } from "react";
import WarehouseShell from "@/components/layout/WarehouseShell";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw } from "lucide-react";
import * as XLSX from "xlsx";
import { listInventory, listTasks, type WhTask } from "@/services/warehousePlatform";

export default function ControllerReports() {
  const { lang } = useLanguage();
  const t = (en: string, mm: string) => (lang === "en" ? en : mm);

  const [tasks, setTasks] = useState<WhTask[]>([]);
  const [inv, setInv] = useState<any[]>([]);

  async function refresh() {
    const [ts, iv] = await Promise.all([listTasks("ALL"), listInventory()]);
    setTasks(ts);
    setInv(iv);
  }

  useEffect(() => { void refresh(); }, []);

  const headersTasks = useMemo(() => (lang === "en"
    ? ["TYPE","STATUS","REFERENCE","SKU","QTY","FROM","TO","ASSIGNED","CREATED_AT"]
    : ["TYPE","STATUS","REFERENCE","SKU","QTY","FROM","TO","ASSIGNED","CREATED_AT"]), [lang]);

  const headersInv = useMemo(() => (lang === "en"
    ? ["SKU","LOCATION","QTY"]
    : ["SKU","LOCATION","QTY"]), [lang]);

  function exportTasks() {
    const aoa = [
      headersTasks,
      ...tasks.map((x) => [
        x.type, x.status, x.reference ?? "", x.sku ?? "", x.qty ?? "", x.from_location ?? "", x.to_location ?? "", x.assigned_to_email ?? "", x.created_at,
      ]),
    ];
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "TASKS");
    XLSX.writeFile(wb, `warehouse_tasks_${new Date().toISOString().slice(0,10)}.xlsx`);
  }

  function exportInventory() {
    const aoa = [
      headersInv,
      ...inv.map((r: any) => [r.sku, r.location_code, r.qty]),
    ];
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "INVENTORY");
    XLSX.writeFile(wb, `warehouse_inventory_${new Date().toISOString().slice(0,10)}.xlsx`);
  }

  return (
    <WarehouseShell title={t("Reports", "Reports")}>
      <div className="space-y-4">
        <Card className="bg-white/5 border-white/10"><CardContent className="p-4 flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="text-sm font-black tracking-widest uppercase">{t("Exports", "Exports")}</div>
            <div className="text-xs text-white/60">{t("Export tasks and inventory to Excel.", "Task နှင့် Stock ကို Excel ထုတ်နိုင်သည်။")}</div>
          </div>
          <Button variant="outline" className="border-white/10" onClick={() => void refresh()}>
            <RefreshCw className="h-4 w-4 mr-2" /> {t("Refresh", "ပြန်တင်")}
          </Button>
        </CardContent></Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Card className="bg-[#05080F] border-white/10"><CardContent className="p-4 space-y-3">
            <div className="text-xs font-mono text-white/60 tracking-widest uppercase">{t("Tasks Export", "Tasks Export")}</div>
            <div className="text-sm text-white/70">{tasks.length} rows</div>
            <Button className="bg-emerald-600 hover:bg-emerald-500" onClick={exportTasks}>
              <Download className="h-4 w-4 mr-2" /> {t("Download Tasks XLSX", "Tasks XLSX ဒေါင်း")}
            </Button>
          </CardContent></Card>

          <Card className="bg-[#05080F] border-white/10"><CardContent className="p-4 space-y-3">
            <div className="text-xs font-mono text-white/60 tracking-widest uppercase">{t("Inventory Export", "Inventory Export")}</div>
            <div className="text-sm text-white/70">{inv.length} rows</div>
            <Button className="bg-sky-600 hover:bg-sky-500" onClick={exportInventory}>
              <Download className="h-4 w-4 mr-2" /> {t("Download Inventory XLSX", "Stock XLSX ဒေါင်း")}
            </Button>
          </CardContent></Card>
        </div>
      </div>
    </WarehouseShell>
  );
}

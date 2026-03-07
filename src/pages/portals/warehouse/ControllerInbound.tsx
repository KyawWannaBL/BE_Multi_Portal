import React, { useEffect, useMemo, useState } from "react";
import WarehouseShell from "@/components/layout/WarehouseShell";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import WarehouseStatusBadge from "@/components/warehouse/WarehouseStatusBadge";
import { listTasks, type WhTask } from "@/services/warehousePlatform";

export default function ControllerInbound() {
  const { lang } = useLanguage();
  const t = (en: string, mm: string) => (lang === "en" ? en : mm);

  const [tasks, setTasks] = useState<WhTask[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    (async () => {
      const all = await listTasks("ALL");
      setTasks(all.filter((x) => x.type === "RECEIVE" || x.type === "PUTAWAY"));
    })();
  }, []);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return tasks;
    return tasks.filter((x) => `${x.type} ${x.reference ?? ""} ${x.sku ?? ""} ${x.assigned_to_email ?? ""}`.toLowerCase().includes(qq));
  }, [tasks, q]);

  return (
    <WarehouseShell title={t("Inbound", "Inbound")}>
      <div className="space-y-4">
        <Card className="bg-white/5 border-white/10"><CardContent className="p-4 flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="text-sm font-black tracking-widest uppercase">{t("Inbound Overview", "Inbound Overview")}</div>
            <div className="text-xs text-white/60">{t("Receiving + Putaway backlog.", "Receiving + Putaway အလုပ်ကျန်။")}</div>
          </div>
          <Badge variant="outline" className="border-white/10">{filtered.length} {t("tasks", "tasks")}</Badge>
        </CardContent></Card>

        <Input className="bg-[#05080F] border-white/10" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("Search…", "ရှာရန်…")} />

        <Card className="bg-[#05080F] border-white/10"><CardContent className="p-0">
          <div className="divide-y divide-white/5">
            {filtered.map((x) => (
              <div key={x.id} className="p-4 flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="font-black text-white">{x.type}</div>
                    <WarehouseStatusBadge status={x.status} />
                    <Badge variant="outline" className="border-white/10">{x.reference ?? "—"}</Badge>
                  </div>
                  <div className="text-sm text-white/70 mt-1">
                    SKU: {x.sku ?? "—"} • QTY: {x.qty ?? "—"} • {t("Assigned", "တာဝန်ပေး")}: {x.assigned_to_email ?? "—"}
                  </div>
                  <div className="text-xs text-white/50 mt-1">
                    {t("From", "မှ")}: {x.from_location ?? "—"} → {t("To", "သို့")}: {x.to_location ?? "—"}
                  </div>
                </div>
              </div>
            ))}
            {filtered.length === 0 ? <div className="p-6 text-white/60">{t("No inbound tasks.", "Inbound task မရှိပါ။")}</div> : null}
          </div>
        </CardContent></Card>
      </div>
    </WarehouseShell>
  );
}

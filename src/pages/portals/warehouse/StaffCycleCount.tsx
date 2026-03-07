import React, { useMemo, useState } from "react";
import WarehouseShell from "@/components/layout/WarehouseShell";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import WarehouseScanInput from "@/components/warehouse/WarehouseScanInput";
import { adjustInventory } from "@/services/warehousePlatform";
import { enqueueWhAction } from "@/lib/warehouseOfflineQueue";
import { toast } from "@/components/ui/use-toast";

function norm(s: string) { return s.trim().toUpperCase(); }

export default function StaffCycleCount() {
  const { lang } = useLanguage();
  const t = (en: string, mm: string) => (lang === "en" ? en : mm);

  const [location, setLocation] = useState("");
  const [sku, setSku] = useState("");
  const [counted, setCounted] = useState("0");

  const canSubmit = useMemo(() => Boolean(location.trim() && sku.trim()), [location, sku]);

  async function submit() {
    try {
      await adjustInventory({ sku, location_code: location, qty: Number(counted || 0), reason: "CYCLE_COUNT" });
      toast({ title: t("Saved", "သိမ်းပြီး"), description: `${sku} @ ${location} = ${counted}` });
    } catch {
      enqueueWhAction({ kind: "CYCLE_COUNT", payload: { sku, location, counted: Number(counted || 0), at: new Date().toISOString() } });
      toast({ title: t("Queued offline", "Offline queue ထဲထည့်ပြီး"), description: `${sku} @ ${location}`, variant: "destructive" as any });
    }
    setSku(""); setCounted("0");
  }

  return (
    <WarehouseShell title={t("Cycle Count", "Cycle Count")}>
      <div className="space-y-4">
        <Card className="bg-white/5 border-white/10"><CardContent className="p-4 space-y-1">
          <div className="text-sm font-black tracking-widest uppercase">{t("Cycle Count", "Cycle Count")}</div>
          <div className="text-xs text-white/60">{t("Scan location + SKU, enter counted qty.", "Location + SKU စကန်၊ qty ထည့်ပါ။")}</div>
        </CardContent></Card>

        <Card className="bg-[#05080F] border-white/10"><CardContent className="p-4 space-y-3">
          <WarehouseScanInput label={t("Scan Location Code", "Location code စကန်")} onValue={(v) => setLocation(norm(v))} normalize={norm} />
          <WarehouseScanInput label={t("Scan SKU / Barcode", "SKU / Barcode စကန်")} onValue={(v) => setSku(norm(v))} normalize={norm} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <Input className="bg-black/30 border-white/10" placeholder={t("Counted Qty", "ရေတွက် qty")} value={counted} onChange={(e) => setCounted(e.target.value)} />
            <div className="text-xs text-white/50 flex items-center">{location ? `LOC: ${location}` : ""}</div>
          </div>

          <Button className="bg-emerald-600 hover:bg-emerald-500" disabled={!canSubmit} onClick={() => void submit()}>
            {t("Submit Count", "Count တင်မည်")}
          </Button>
        </CardContent></Card>
      </div>
    </WarehouseShell>
  );
}

import React, { useMemo, useState } from "react";
import WarehouseShell from "@/components/layout/WarehouseShell";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import WarehouseScanInput from "@/components/warehouse/WarehouseScanInput";
import { createPutawayTask, createReceiveTask, setTaskStatus } from "@/services/warehousePlatform";
import { enqueueWhAction } from "@/lib/warehouseOfflineQueue";
import { toast } from "@/components/ui/use-toast";

function norm(s: string) { return s.trim().toUpperCase(); }

export default function StaffInbound() {
  const { lang } = useLanguage();
  const { user } = useAuth();
  const t = (en: string, mm: string) => (lang === "en" ? en : mm);

  const [awb, setAwb] = useState("");
  const [sku, setSku] = useState("");
  const [qty, setQty] = useState("1");
  const [toLoc, setToLoc] = useState("");

  const canCreate = useMemo(() => Boolean(awb.trim()), [awb]);

  async function receive() {
    if (!awb.trim()) return;
    try {
      const task = await createReceiveTask({ reference: awb, sku: sku || null, qty: Number(qty || 1), note: `Received by ${(user as any)?.email ?? "staff"}`, assignedTo: (user as any)?.email ?? null });
      await setTaskStatus(task.id, "COMPLETED");
      toast({ title: t("Received", "လက်ခံပြီး"), description: `AWB=${awb}` });
    } catch {
      enqueueWhAction({ kind: "RECEIVE", payload: { awb, sku, qty: Number(qty || 1), at: new Date().toISOString() } });
      toast({ title: t("Queued offline", "Offline queue ထဲထည့်ပြီး"), description: `AWB=${awb}`, variant: "destructive" as any });
    }
    setAwb(""); setSku(""); setQty("1");
  }

  async function createPutaway() {
    if (!awb.trim() || !toLoc.trim()) return;
    try {
      await createPutawayTask({ reference: awb, sku: sku || null, qty: Number(qty || 1), fromLoc: "DOCK", toLoc: toLoc, assignedTo: (user as any)?.email ?? null });
      toast({ title: t("Putaway task created", "Putaway task ဖန်တီးပြီး"), description: `AWB=${awb} → ${toLoc}` });
    } catch {
      enqueueWhAction({ kind: "PUTAWAY", payload: { awb, sku, qty: Number(qty || 1), toLoc, at: new Date().toISOString() } });
      toast({ title: t("Queued offline", "Offline queue ထဲထည့်ပြီး"), description: `PUTAWAY ${awb} → ${toLoc}`, variant: "destructive" as any });
    }
    setAwb(""); setToLoc(""); setSku(""); setQty("1");
  }

  return (
    <WarehouseShell title={t("Inbound Ops", "Inbound Ops")}>
      <div className="space-y-4">
        <Card className="bg-white/5 border-white/10"><CardContent className="p-4 space-y-1">
          <div className="text-sm font-black tracking-widest uppercase">{t("Receive & Putaway", "Receive & Putaway")}</div>
          <div className="text-xs text-white/60">{t("Scan AWB → receive → create putaway.", "AWB စကန် → လက်ခံ → putaway ဖန်တီး")}</div>
        </CardContent></Card>

        <Card className="bg-[#05080F] border-white/10"><CardContent className="p-4 space-y-3">
          <WarehouseScanInput label={t("Scan AWB / Waybill", "AWB / Waybill စကန်")} onValue={(v) => setAwb(norm(v))} normalize={norm} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <Input className="bg-black/30 border-white/10" placeholder="SKU (optional)" value={sku} onChange={(e) => setSku(e.target.value)} />
            <Input className="bg-black/30 border-white/10" placeholder="QTY" value={qty} onChange={(e) => setQty(e.target.value)} />
            <Input className="bg-black/30 border-white/10" placeholder={t("TO Location (Putaway)", "TO Location (Putaway)")} value={toLoc} onChange={(e) => setToLoc(e.target.value)} />
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button className="bg-emerald-600 hover:bg-emerald-500" disabled={!canCreate} onClick={() => void receive()}>
              {t("Receive (Complete)", "လက်ခံ (ပြီးဆုံး)")}
            </Button>
            <Button className="bg-sky-600 hover:bg-sky-500" disabled={!awb.trim() || !toLoc.trim()} onClick={() => void createPutaway()}>
              {t("Create Putaway Task", "Putaway Task ဖန်တီး")}
            </Button>
          </div>

          {awb ? <div className="text-xs text-white/50">AWB: {awb}</div> : null}
        </CardContent></Card>
      </div>
    </WarehouseShell>
  );
}

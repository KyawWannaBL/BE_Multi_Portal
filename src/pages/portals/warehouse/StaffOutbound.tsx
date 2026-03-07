import React, { useMemo, useState } from "react";
import WarehouseShell from "@/components/layout/WarehouseShell";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import WarehouseScanInput from "@/components/warehouse/WarehouseScanInput";
import { createPickTask, createTask, setTaskStatus } from "@/services/warehousePlatform";
import { enqueueWhAction } from "@/lib/warehouseOfflineQueue";
import { toast } from "@/components/ui/use-toast";

function norm(s: string) { return s.trim().toUpperCase(); }

export default function StaffOutbound() {
  const { lang } = useLanguage();
  const { user } = useAuth();
  const t = (en: string, mm: string) => (lang === "en" ? en : mm);

  const [ref, setRef] = useState(""); // order/awb/batch
  const [sku, setSku] = useState("");
  const [qty, setQty] = useState("1");
  const [fromLoc, setFromLoc] = useState("STORAGE");

  const canPick = useMemo(() => Boolean(ref.trim() && sku.trim() && Number(qty || 0) > 0), [ref, sku, qty]);

  async function createPick() {
    try {
      await createPickTask({ reference: ref, sku: sku, qty: Number(qty || 1), fromLoc, assignedTo: (user as any)?.email ?? null });
      toast({ title: t("Pick task created", "Pick task ဖန်တီးပြီး"), description: `${ref} • ${sku} x${qty}` });
    } catch {
      enqueueWhAction({ kind: "PICK", payload: { ref, sku, qty: Number(qty || 1), fromLoc, at: new Date().toISOString() } });
      toast({ title: t("Queued offline", "Offline queue ထဲထည့်ပြီး"), description: `PICK ${ref}`, variant: "destructive" as any });
    }
  }

  async function pack() {
    if (!ref.trim()) return;
    try {
      const task = await createTask({ type: "PACK", status: "PENDING", reference: ref, sku: null, qty: null, from_location: "PACKING", to_location: "DISPATCH", assigned_to_email: (user as any)?.email ?? null, note: null, meta: { flow: "PACK" } });
      await setTaskStatus(task.id, "COMPLETED");
      toast({ title: t("Packed", "Pack ပြီး"), description: ref });
    } catch {
      enqueueWhAction({ kind: "PACK", payload: { ref, at: new Date().toISOString() } });
      toast({ title: t("Queued offline", "Offline queue ထဲထည့်ပြီး"), description: `PACK ${ref}`, variant: "destructive" as any });
    }
  }

  async function dispatch() {
    if (!ref.trim()) return;
    try {
      const task = await createTask({ type: "DISPATCH", status: "PENDING", reference: ref, sku: null, qty: null, from_location: "DISPATCH", to_location: "OUT", assigned_to_email: (user as any)?.email ?? null, note: null, meta: { flow: "DISPATCH" } });
      await setTaskStatus(task.id, "COMPLETED");
      toast({ title: t("Dispatched", "Dispatch ပြီး"), description: ref });
    } catch {
      enqueueWhAction({ kind: "DISPATCH", payload: { ref, at: new Date().toISOString() } });
      toast({ title: t("Queued offline", "Offline queue ထဲထည့်ပြီး"), description: `DISPATCH ${ref}`, variant: "destructive" as any });
    }
  }

  return (
    <WarehouseShell title={t("Outbound Ops", "Outbound Ops")}>
      <div className="space-y-4">
        <Card className="bg-white/5 border-white/10"><CardContent className="p-4 space-y-1">
          <div className="text-sm font-black tracking-widest uppercase">{t("Pick / Pack / Dispatch", "Pick / Pack / Dispatch")}</div>
          <div className="text-xs text-white/60">{t("Scan reference → pick items → pack → dispatch.", "Reference စကန် → pick → pack → dispatch")}</div>
        </CardContent></Card>

        <Card className="bg-[#05080F] border-white/10"><CardContent className="p-4 space-y-3">
          <WarehouseScanInput label={t("Scan Order/AWB Reference", "Order/AWB Reference စကန်")} onValue={(v) => setRef(norm(v))} normalize={norm} />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <Input className="bg-black/30 border-white/10" placeholder="SKU" value={sku} onChange={(e) => setSku(e.target.value)} />
            <Input className="bg-black/30 border-white/10" placeholder="QTY" value={qty} onChange={(e) => setQty(e.target.value)} />
            <Input className="bg-black/30 border-white/10" placeholder={t("From Location", "From Location")} value={fromLoc} onChange={(e) => setFromLoc(e.target.value)} />
            <div className="text-xs text-white/50 flex items-center">{ref ? `REF: ${ref}` : ""}</div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button className="bg-emerald-600 hover:bg-emerald-500" disabled={!canPick} onClick={() => void createPick()}>
              {t("Create Pick Task", "Pick Task ဖန်တီး")}
            </Button>
            <Button className="bg-sky-600 hover:bg-sky-500" disabled={!ref.trim()} onClick={() => void pack()}>
              {t("Pack (Complete)", "Pack (ပြီးဆုံး)")}
            </Button>
            <Button className="bg-amber-600 hover:bg-amber-500" disabled={!ref.trim()} onClick={() => void dispatch()}>
              {t("Dispatch (Complete)", "Dispatch (ပြီးဆုံး)")}
            </Button>
          </div>
        </CardContent></Card>
      </div>
    </WarehouseShell>
  );
}

import React, { useEffect, useMemo, useState } from "react";
import WarehouseShell from "@/components/layout/WarehouseShell";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { adjustInventory, listInventory, type WhInventoryRow } from "@/services/warehousePlatform";
import { Save, RefreshCw } from "lucide-react";

export default function ControllerInventory() {
  const { lang } = useLanguage();
  const t = (en: string, mm: string) => (lang === "en" ? en : mm);

  const [rows, setRows] = useState<WhInventoryRow[]>([]);
  const [q, setQ] = useState("");

  const [draft, setDraft] = useState({ sku: "", location: "", qty: "", reason: "ADJUSTMENT" });

  async function refresh() {
    setRows(await listInventory());
  }

  useEffect(() => { void refresh(); }, []);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return rows;
    return rows.filter((r) => `${r.sku} ${r.location_code}`.toLowerCase().includes(qq));
  }, [rows, q]);

  async function saveAdjust() {
    if (!draft.sku.trim() || !draft.location.trim()) return;
    await adjustInventory({ sku: draft.sku, location_code: draft.location, qty: Number(draft.qty || 0), reason: draft.reason || "ADJUSTMENT" });
    setDraft({ sku: "", location: "", qty: "", reason: "ADJUSTMENT" });
    await refresh();
  }

  return (
    <WarehouseShell title={t("Inventory", "Inventory")}>
      <div className="space-y-4">
        <Card className="bg-white/5 border-white/10"><CardContent className="p-4 flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="text-sm font-black tracking-widest uppercase">{t("Inventory Control", "Inventory Control")}</div>
            <div className="text-xs text-white/60">{t("View and adjust inventory records.", "Stock ကို ကြည့်ပြီး ပြင်ဆင်နိုင်ပါသည်။")}</div>
          </div>
          <Button variant="outline" className="border-white/10" onClick={() => void refresh()}>
            <RefreshCw className="h-4 w-4 mr-2" /> {t("Refresh", "ပြန်တင်")}
          </Button>
        </CardContent></Card>

        <Card className="bg-[#05080F] border-white/10"><CardContent className="p-4 space-y-3">
          <div className="text-xs font-mono text-white/60 tracking-widest uppercase">{t("Adjust Stock", "Stock ပြင်ရန်")}</div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <Input className="bg-black/30 border-white/10" placeholder="SKU" value={draft.sku} onChange={(e) => setDraft((p) => ({ ...p, sku: e.target.value }))} />
            <Input className="bg-black/30 border-white/10" placeholder={t("Location", "Location")} value={draft.location} onChange={(e) => setDraft((p) => ({ ...p, location: e.target.value }))} />
            <Input className="bg-black/30 border-white/10" placeholder="QTY" value={draft.qty} onChange={(e) => setDraft((p) => ({ ...p, qty: e.target.value }))} />
            <Input className="bg-black/30 border-white/10" placeholder={t("Reason", "အကြောင်းရင်း")} value={draft.reason} onChange={(e) => setDraft((p) => ({ ...p, reason: e.target.value }))} />
          </div>
          <Button className="bg-emerald-600 hover:bg-emerald-500" onClick={() => void saveAdjust()}>
            <Save className="h-4 w-4 mr-2" /> {t("Save", "သိမ်း")}
          </Button>
        </CardContent></Card>

        <Input className="bg-[#05080F] border-white/10" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("Search inventory…", "Stock ရှာရန်…")} />

        <Card className="bg-[#05080F] border-white/10"><CardContent className="p-0">
          <div className="overflow-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-white/70">
                <tr>
                  <th className="p-3 text-xs font-mono tracking-widest uppercase">SKU</th>
                  <th className="p-3 text-xs font-mono tracking-widest uppercase">{t("LOCATION", "LOCATION")}</th>
                  <th className="p-3 text-xs font-mono tracking-widest uppercase">QTY</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filtered.map((r, i) => (
                  <tr key={`${r.sku}_${r.location_code}_${i}`} className="hover:bg-white/5">
                    <td className="p-3 font-semibold text-white">{r.sku}</td>
                    <td className="p-3 text-white/70">{r.location_code}</td>
                    <td className="p-3 text-white/70">{r.qty}</td>
                  </tr>
                ))}
                {filtered.length === 0 ? <tr><td colSpan={3} className="p-6 text-white/60">{t("No inventory rows.", "Stock row မရှိပါ။")}</td></tr> : null}
              </tbody>
            </table>
          </div>
        </CardContent></Card>
      </div>
    </WarehouseShell>
  );
}

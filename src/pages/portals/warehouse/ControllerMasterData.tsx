import React, { useEffect, useMemo, useState } from "react";
import WarehouseShell from "@/components/layout/WarehouseShell";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, Save } from "lucide-react";
import { listLocations, listSkus, upsertLocation, upsertSku, type WhLocation, type WhSku } from "@/services/warehousePlatform";

type Mode = "SKUS" | "LOCATIONS";

export default function ControllerMasterData() {
  const { lang } = useLanguage();
  const t = (en: string, mm: string) => (lang === "en" ? en : mm);

  const [mode, setMode] = useState<Mode>("SKUS");
  const [loading, setLoading] = useState(true);

  const [skus, setSkus] = useState<WhSku[]>([]);
  const [locs, setLocs] = useState<WhLocation[]>([]);

  const [q, setQ] = useState("");

  const [skuDraft, setSkuDraft] = useState({ sku: "", name: "", barcode: "", uom: "" });
  const [locDraft, setLocDraft] = useState({ code: "", name: "", zone: "", type: "STORAGE", capacity: "" });

  async function refresh() {
    setLoading(true);
    try {
      const [s, l] = await Promise.all([listSkus(), listLocations()]);
      setSkus(s);
      setLocs(l);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void refresh(); }, []);

  const filteredSkus = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return skus;
    return skus.filter((x) => `${x.sku} ${x.name ?? ""} ${x.barcode ?? ""}`.toLowerCase().includes(qq));
  }, [skus, q]);

  const filteredLocs = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return locs;
    return locs.filter((x) => `${x.code} ${x.name ?? ""} ${x.zone ?? ""} ${x.type ?? ""}`.toLowerCase().includes(qq));
  }, [locs, q]);

  async function saveSku() {
    if (!skuDraft.sku.trim()) return;
    await upsertSku({ sku: skuDraft.sku, name: skuDraft.name || null, barcode: skuDraft.barcode || null, uom: skuDraft.uom || null });
    setSkuDraft({ sku: "", name: "", barcode: "", uom: "" });
    await refresh();
  }

  async function saveLoc() {
    if (!locDraft.code.trim()) return;
    await upsertLocation({
      code: locDraft.code,
      name: locDraft.name || null,
      zone: locDraft.zone || null,
      type: locDraft.type || null,
      capacity: locDraft.capacity ? Number(locDraft.capacity) : null,
    });
    setLocDraft({ code: "", name: "", zone: "", type: "STORAGE", capacity: "" });
    await refresh();
  }

  return (
    <WarehouseShell title={t("Master Data", "Master Data")}>
      <div className="space-y-4">
        <Card className="bg-white/5 border-white/10"><CardContent className="p-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Select value={mode} onValueChange={(v) => setMode(v as Mode)}>
              <SelectTrigger className="bg-[#05080F] border-white/10 w-[220px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="SKUS">{t("SKUs", "SKUs")}</SelectItem>
                <SelectItem value="LOCATIONS">{t("Locations", "Locations")}</SelectItem>
              </SelectContent>
            </Select>
            <Input className="bg-[#05080F] border-white/10" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("Search…", "ရှာရန်…")} />
          </div>

          <Button variant="outline" className="border-white/10" onClick={() => void refresh()} disabled={loading}>
            <RefreshCw className="h-4 w-4 mr-2" /> {t("Refresh", "ပြန်တင်")}
          </Button>
        </CardContent></Card>

        {mode === "SKUS" ? (
          <Card className="bg-[#05080F] border-white/10"><CardContent className="p-4 space-y-3">
            <div className="text-xs font-mono text-white/60 tracking-widest uppercase">{t("Create/Update SKU", "SKU ဖန်တီး/ပြင်")}</div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <Input className="bg-black/30 border-white/10" placeholder="SKU" value={skuDraft.sku} onChange={(e) => setSkuDraft((p) => ({ ...p, sku: e.target.value }))} />
              <Input className="bg-black/30 border-white/10" placeholder={t("Name", "အမည်")} value={skuDraft.name} onChange={(e) => setSkuDraft((p) => ({ ...p, name: e.target.value }))} />
              <Input className="bg-black/30 border-white/10" placeholder={t("Barcode", "Barcode")} value={skuDraft.barcode} onChange={(e) => setSkuDraft((p) => ({ ...p, barcode: e.target.value }))} />
              <Input className="bg-black/30 border-white/10" placeholder="UOM" value={skuDraft.uom} onChange={(e) => setSkuDraft((p) => ({ ...p, uom: e.target.value }))} />
            </div>
            <Button className="bg-emerald-600 hover:bg-emerald-500" onClick={() => void saveSku()}>
              <Save className="h-4 w-4 mr-2" /> {t("Save SKU", "SKU သိမ်း")}
            </Button>

            <div className="overflow-auto rounded-2xl border border-white/10">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 text-white/70">
                  <tr>
                    <th className="p-3 text-xs font-mono tracking-widest uppercase">SKU</th>
                    <th className="p-3 text-xs font-mono tracking-widest uppercase">{t("NAME", "အမည်")}</th>
                    <th className="p-3 text-xs font-mono tracking-widest uppercase">BARCODE</th>
                    <th className="p-3 text-xs font-mono tracking-widest uppercase">UOM</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filteredSkus.map((x) => (
                    <tr key={x.id} className="hover:bg-white/5">
                      <td className="p-3 font-semibold text-white">{x.sku}</td>
                      <td className="p-3 text-white/70">{x.name ?? "—"}</td>
                      <td className="p-3 text-white/70">{x.barcode ?? "—"}</td>
                      <td className="p-3 text-white/70">{x.uom ?? "—"}</td>
                    </tr>
                  ))}
                  {!loading && filteredSkus.length === 0 ? <tr><td colSpan={4} className="p-6 text-white/60">{t("No SKUs.", "SKU မရှိပါ။")}</td></tr> : null}
                </tbody>
              </table>
            </div>
          </CardContent></Card>
        ) : (
          <Card className="bg-[#05080F] border-white/10"><CardContent className="p-4 space-y-3">
            <div className="text-xs font-mono text-white/60 tracking-widest uppercase">{t("Create/Update Location", "Location ဖန်တီး/ပြင်")}</div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
              <Input className="bg-black/30 border-white/10" placeholder={t("Code", "ကုဒ်")} value={locDraft.code} onChange={(e) => setLocDraft((p) => ({ ...p, code: e.target.value }))} />
              <Input className="bg-black/30 border-white/10" placeholder={t("Name", "အမည်")} value={locDraft.name} onChange={(e) => setLocDraft((p) => ({ ...p, name: e.target.value }))} />
              <Input className="bg-black/30 border-white/10" placeholder={t("Zone", "ဇုန်")} value={locDraft.zone} onChange={(e) => setLocDraft((p) => ({ ...p, zone: e.target.value }))} />
              <Input className="bg-black/30 border-white/10" placeholder={t("Type", "အမျိုးအစား")} value={locDraft.type} onChange={(e) => setLocDraft((p) => ({ ...p, type: e.target.value }))} />
              <Input className="bg-black/30 border-white/10" placeholder={t("Capacity", "စွမ်းရည်")} value={locDraft.capacity} onChange={(e) => setLocDraft((p) => ({ ...p, capacity: e.target.value }))} />
            </div>
            <Button className="bg-emerald-600 hover:bg-emerald-500" onClick={() => void saveLoc()}>
              <Save className="h-4 w-4 mr-2" /> {t("Save Location", "Location သိမ်း")}
            </Button>

            <div className="overflow-auto rounded-2xl border border-white/10">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 text-white/70">
                  <tr>
                    <th className="p-3 text-xs font-mono tracking-widest uppercase">{t("CODE", "ကုဒ်")}</th>
                    <th className="p-3 text-xs font-mono tracking-widest uppercase">{t("NAME", "အမည်")}</th>
                    <th className="p-3 text-xs font-mono tracking-widest uppercase">{t("ZONE", "ဇုန်")}</th>
                    <th className="p-3 text-xs font-mono tracking-widest uppercase">{t("TYPE", "အမျိုးအစား")}</th>
                    <th className="p-3 text-xs font-mono tracking-widest uppercase">{t("CAP", "စွမ်းရည်")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filteredLocs.map((x) => (
                    <tr key={x.id} className="hover:bg-white/5">
                      <td className="p-3 font-semibold text-white">{x.code}</td>
                      <td className="p-3 text-white/70">{x.name ?? "—"}</td>
                      <td className="p-3 text-white/70">{x.zone ?? "—"}</td>
                      <td className="p-3 text-white/70">{x.type ?? "—"}</td>
                      <td className="p-3 text-white/70">{x.capacity ?? "—"}</td>
                    </tr>
                  ))}
                  {!loading && filteredLocs.length === 0 ? <tr><td colSpan={5} className="p-6 text-white/60">{t("No locations.", "Location မရှိပါ။")}</td></tr> : null}
                </tbody>
              </table>
            </div>
          </CardContent></Card>
        )}
      </div>
    </WarehouseShell>
  );
}

import React, { useMemo, useState } from "react";
import WarehouseShell from "@/components/layout/WarehouseShell";
import { useLanguage } from "@/contexts/LanguageContext";
import { QrCode, ScanLine, CheckCircle2, Loader2, RefreshCw } from "lucide-react";
import { adjustInventory } from "@/services/warehousePlatform";
import { enqueueWhAction } from "@/lib/warehouseOfflineQueue";

function norm(s: string) { return s.trim().toUpperCase(); }

export default function StaffCycleCount() {
  const { lang } = useLanguage();
  const t = (en: string, my: string) => (lang === "en" ? en : my);

  const [location, setLocation] = useState("");
  const [sku, setSku] = useState("");
  const [counted, setCounted] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(() => Boolean(location.trim() && sku.trim() && counted), [location, sku, counted]);

  async function submit() {
    setLoading(true);
    try {
      await adjustInventory({ sku, location_code: location, qty: Number(counted || 0), reason: "CYCLE_COUNT" });
      alert(t(`Inventory updated: ${sku} @ ${location} = ${counted}`, `စာရင်းပြင်ဆင်ပြီးပါပြီ: ${sku} @ ${location} = ${counted}`));
    } catch {
      enqueueWhAction({ kind: "CYCLE_COUNT", payload: { sku, location, counted: Number(counted || 0), at: new Date().toISOString() } });
      alert(t(`Saved to offline queue: ${sku} @ ${location}`, `အော့ဖ်လိုင်းသို့ သိမ်းဆည်းပြီးပါပြီ: ${sku} @ ${location}`));
    } finally {
      setLoading(false);
      setSku(""); 
      setCounted("");
    }
  }

  return (
    <WarehouseShell title={t("Cycle Count", "ပစ္စည်းစစ်ဆေးခြင်း")}>
      <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        <div className="bg-gradient-to-br from-indigo-900/40 to-[#0A0F1C] border border-indigo-500/30 rounded-[2rem] p-6 shadow-2xl flex items-center gap-4">
          <div className="p-4 bg-indigo-500/20 rounded-full"><ScanLine className="h-8 w-8 text-indigo-400" /></div>
          <div>
            <h2 className="text-xl font-black tracking-widest uppercase text-white">{t("Inventory Audit", "ကုန်ပစ္စည်းစာရင်း စစ်ဆေးခြင်း")}</h2>
            <p className="text-xs text-indigo-200/70 mt-1">{t("Scan the bin and SKU to quickly update stock levels.", "စင်နှင့် SKU ကို စကင်ဖတ်၍ ပစ္စည်းအရေအတွက်ကို ပြင်ဆင်ပါ။")}</p>
          </div>
        </div>

        <div className="bg-[#0E1525] border border-white/5 rounded-[2rem] p-6 space-y-6 shadow-xl">
          
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t("Target Bin / Location", "စစ်ဆေးမည့် နေရာ")}</label>
            <div className="relative">
              <input 
                value={location} onChange={(e) => setLocation(norm(e.target.value))}
                className="w-full bg-[#0A0F1C] border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-xl font-mono text-white focus:border-indigo-500 outline-none transition-all placeholder:text-gray-700 uppercase shadow-inner" 
                placeholder="SCAN BIN-00"
              />
              <QrCode className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-indigo-500/50" />
            </div>
          </div>

          <div className="space-y-2 border-t border-white/5 pt-4">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t("Target SKU", "ပစ္စည်းကုဒ်")}</label>
            <div className="relative">
              <input 
                value={sku} onChange={(e) => setSku(norm(e.target.value))}
                className="w-full bg-[#0A0F1C] border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-xl font-mono text-white focus:border-indigo-500 outline-none transition-all placeholder:text-gray-700 uppercase shadow-inner" 
                placeholder="SCAN SKU-00"
              />
              <QrCode className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-indigo-500/50" />
            </div>
          </div>

          <div className="space-y-2 border-t border-white/5 pt-4">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t("Actual Counted QTY", "လက်ရှိရေတွက်ရရှိသော အရေအတွက်")}</label>
            <input 
              type="number" min="0" 
              value={counted} onChange={(e) => setCounted(e.target.value)} 
              className="w-full bg-indigo-950/20 border border-indigo-900/50 rounded-2xl px-4 py-5 text-3xl font-black font-mono text-indigo-100 focus:border-indigo-500 outline-none shadow-inner text-center" 
              placeholder="0" 
            />
          </div>
          
          <button disabled={!canSubmit || loading} onClick={submit} className="w-full h-16 mt-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm uppercase tracking-widest rounded-2xl disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(79,70,229,0.3)]">
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><CheckCircle2 className="h-5 w-5" /> {t("Submit Count", "အရေအတွက် အတည်ပြုမည်")}</>}
          </button>

        </div>
      </div>
    </WarehouseShell>
  );
}

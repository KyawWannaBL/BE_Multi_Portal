import React, { useEffect, useMemo, useState } from "react";
import WarehouseShell from "@/components/layout/WarehouseShell";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowDown, ArrowUp, Plus, RefreshCw, Save, Trash2, Edit3, X } from "lucide-react";
import { deletePutawayRule, listPutawayRules, savePutawayRuleOrder, upsertPutawayRule, type PutawayRule } from "@/services/warehousePlatform";

type Draft = { id?: string; priority: string; active: boolean; sku_prefix: string; sku_regex: string; zone: string; location_type: string; note: string; };
const mkDraft = (r?: PutawayRule): Draft => ({ id: r?.id, priority: String(r?.priority ?? 10), active: r?.active ?? true, sku_prefix: r?.sku_prefix ?? "", sku_regex: r?.sku_regex ?? "", zone: r?.zone ?? "", location_type: r?.location_type ?? "", note: r?.note ?? "" });

export default function ControllerPutawayRules() {
  const { lang } = useLanguage();
  const t = (en: string, my: string) => (lang === "en" ? en : my);

  const [loading, setLoading] = useState(true);
  const [rules, setRules] = useState<PutawayRule[]>([]);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(mkDraft());

  async function refresh() {
    setLoading(true);
    try { setRules(await listPutawayRules()); } finally { setLoading(false); }
  }
  useEffect(() => { void refresh(); }, []);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return rules;
    return rules.filter((r) => `${r.priority} ${r.sku_prefix ?? ""} ${r.zone ?? ""}`.toLowerCase().includes(qq));
  }, [rules, q]);

  function move(idx: number, dir: -1 | 1) {
    setRules((cur) => {
      const next = [...cur];
      const j = idx + dir;
      if (j < 0 || j >= next.length) return cur;
      [next[idx], next[j]] = [next[j], next[idx]];
      return next;
    });
  }

  async function saveOrder() {
    await savePutawayRuleOrder(rules);
    alert(t("Saved order", "အစီအစဉ်ကို သိမ်းဆည်းပြီးပါပြီ"));
    await refresh();
  }

  async function saveOne() {
    if (!draft.sku_prefix && !draft.sku_regex) return alert(t("Need SKU prefix or regex", "SKU Prefix သို့မဟုတ် Regex လိုအပ်ပါသည်"));
    if (!draft.zone) return alert(t("Need a zone", "Zone သတ်မှတ်ပေးပါ"));
    
    await upsertPutawayRule({
      id: draft.id ?? crypto.randomUUID(),
      priority: Number(draft.priority || 10),
      active: draft.active,
      sku_prefix: draft.sku_prefix.trim() || null,
      sku_regex: draft.sku_regex.trim() || null,
      zone: draft.zone.trim() || null,
      location_type: draft.location_type.trim() || null,
      note: draft.note.trim() || null,
    });
    setOpen(false); setDraft(mkDraft()); await refresh();
  }

  async function remove(id: string) { await deletePutawayRule(id); await refresh(); }
  async function toggle(id: string) {
    const r = rules.find((x) => x.id === id);
    if (r) { await upsertPutawayRule({ ...r, active: !r.active }); await refresh(); }
  }

  return (
    <WarehouseShell title={t("Putaway Rules", "နေရာချထားမှု စည်းမျဉ်းများ")}>
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
        
        {/* Header Actions */}
        <div className="bg-[#0E1525] border border-white/5 rounded-[2rem] p-6 flex items-center justify-between shadow-xl flex-wrap gap-4">
          <div>
            <h2 className="text-lg font-black tracking-widest uppercase text-white">{t("Automated Bin Sorting", "အလိုအလျောက်နေရာချထားမှုစနစ်")}</h2>
            <p className="text-xs text-gray-500 mt-1">{t("First rule matched dictates the target bin.", "ပထမဆုံးကိုက်ညီသော စည်းမျဉ်းကို အသုံးပြုပါမည်။")}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={refresh} disabled={loading} className="px-4 py-2 bg-[#0A0F1C] border border-white/5 hover:border-blue-500 text-gray-400 hover:text-blue-500 rounded-xl transition-all flex items-center gap-2 text-xs font-bold uppercase"><RefreshCw className="h-4 w-4" /></button>
            <button onClick={saveOrder} disabled={loading || !rules.length} className="px-4 py-2 bg-blue-600/20 border border-blue-500/50 text-blue-400 hover:bg-blue-600 hover:text-white rounded-xl transition-all flex items-center gap-2 text-xs font-bold uppercase"><Save className="h-4 w-4" /> {t("Save Order", "အစီအစဉ်သိမ်းမည်")}</button>
            <button onClick={() => { setDraft(mkDraft()); setOpen(true); }} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-all flex items-center gap-2 text-xs font-bold uppercase"><Plus className="h-4 w-4" /> {t("New Rule", "စည်းမျဉ်းအသစ်")}</button>
          </div>
        </div>

        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("SEARCH RULES...", "ရှာဖွေရန်...")} className="w-full bg-[#0E1525] border border-white/5 rounded-xl px-6 py-4 text-sm text-white focus:border-blue-500 outline-none transition-colors font-mono uppercase" />

        {/* Table */}
        <div className="bg-[#0E1525] border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#0A0F1C]/50 border-b border-white/5">
                <tr>
                  <th className="p-4 text-[10px] font-black tracking-widest text-gray-500 uppercase">PRIORITY</th>
                  <th className="p-4 text-[10px] font-black tracking-widest text-gray-500 uppercase">STATUS</th>
                  <th className="p-4 text-[10px] font-black tracking-widest text-gray-500 uppercase">PREFIX/REGEX</th>
                  <th className="p-4 text-[10px] font-black tracking-widest text-gray-500 uppercase">TARGET ZONE</th>
                  <th className="p-4 text-[10px] font-black tracking-widest text-gray-500 uppercase text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((r, idx) => (
                  <tr key={r.id} className="hover:bg-[#131C31] transition-colors">
                    <td className="p-4 font-mono text-white font-bold">{r.priority}</td>
                    <td className="p-4">
                      <button onClick={() => toggle(r.id)} className={`px-3 py-1 rounded-lg text-[10px] font-black tracking-widest border ${r.active ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-gray-800 border-gray-600 text-gray-400'}`}>
                        {r.active ? 'ACTIVE' : 'OFF'}
                      </button>
                    </td>
                    <td className="p-4 text-xs font-mono text-blue-300 bg-blue-900/10 rounded px-2 w-fit inline-block mt-2">
                      {r.sku_prefix || r.sku_regex || "—"}
                    </td>
                    <td className="p-4"><span className="px-2 py-1 bg-[#0A0F1C] border border-white/10 rounded text-[10px] font-mono text-gray-300">{r.zone ?? "—"}</span></td>
                    <td className="p-4 flex justify-end gap-2">
                      <button onClick={() => move(idx, -1)} className="p-2 bg-[#0A0F1C] border border-white/5 hover:text-white text-gray-400 rounded-lg"><ArrowUp className="h-4 w-4" /></button>
                      <button onClick={() => move(idx, 1)} className="p-2 bg-[#0A0F1C] border border-white/5 hover:text-white text-gray-400 rounded-lg"><ArrowDown className="h-4 w-4" /></button>
                      <button onClick={() => { setDraft(mkDraft(r)); setOpen(true); }} className="p-2 bg-blue-500/10 border border-blue-500/30 hover:bg-blue-500 hover:text-white text-blue-400 rounded-lg"><Edit3 className="h-4 w-4" /></button>
                      <button onClick={() => remove(r.id)} className="p-2 bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500 hover:text-white text-rose-400 rounded-lg"><Trash2 className="h-4 w-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Overlay */}
        {open && (
          <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#0E1525] border border-white/10 rounded-[2rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#0A0F1C]">
                <h3 className="font-black tracking-widest uppercase text-white">{draft.id ? t("Edit Rule", "စည်းမျဉ်းပြင်ရန်") : t("New Rule", "စည်းမျဉ်းအသစ်")}</h3>
                <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-white"><X className="h-5 w-5" /></button>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Priority</label><input value={draft.priority} onChange={e => setDraft({...draft, priority: e.target.value})} className="w-full bg-[#0A0F1C] border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 outline-none font-mono" placeholder="10" /></div>
                <div className="space-y-2"><label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Target Zone</label><input value={draft.zone} onChange={e => setDraft({...draft, zone: e.target.value})} className="w-full bg-[#0A0F1C] border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 outline-none uppercase" placeholder="FREEZER" /></div>
                <div className="space-y-2"><label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">SKU Prefix Match</label><input value={draft.sku_prefix} onChange={e => setDraft({...draft, sku_prefix: e.target.value})} className="w-full bg-[#0A0F1C] border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 outline-none uppercase" placeholder="FRZ-" /></div>
                <div className="space-y-2"><label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Note</label><input value={draft.note} onChange={e => setDraft({...draft, note: e.target.value})} className="w-full bg-[#0A0F1C] border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 outline-none" placeholder="Keep chilled..." /></div>
              </div>
              <div className="p-6 border-t border-white/5 bg-[#0A0F1C] flex justify-end gap-3">
                <button onClick={() => setOpen(false)} className="px-6 py-3 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors">{t("Cancel", "ပယ်ဖျက်")}</button>
                <button onClick={saveOne} className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-[0.2em] rounded-xl transition-all">{t("Save Rule", "သိမ်းမည်")}</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </WarehouseShell>
  );
}

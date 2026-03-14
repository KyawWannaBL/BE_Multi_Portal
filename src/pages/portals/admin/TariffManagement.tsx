import React, { useState, useMemo } from 'react';
import { AdminShell } from '@/components/layout/AdminShell';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Calculator, Map, Scale, Plus, 
  Globe, Trash2, ArrowRightLeft, Search, ShieldAlert
} from 'lucide-react';

// 🇲🇲 Full Country Data Structure
const MYANMAR_REGIONS = [
  "Ayeyarwady", "Bago", "Chin", "Kachin", "Kayah", "Kayin", 
  "Magway", "Mandalay", "Mon", "Naypyitaw", "Rakhine", 
  "Sagaing", "Shan (East)", "Shan (North)", "Shan (South)", "Tanintharyi", "Yangon"
];

interface TariffRule {
  id: string;
  fromRegion: string;
  toRegion: string;
  baseRate: number; 
  extraRate: number;
}

export default function TariffManagement() {
  const { lang } = useLanguage();
  const { user, legacyUser } = useAuth() as any;
  const t = (en: string, my: string) => (lang === "en" ? en : my);

  // 🛡️ SECURITY GATE: Only allow Super Admin
  const rawRole = legacyUser?.role || user?.role || user?.user_metadata?.role || user?.app_role || "GUEST";
  const role = String(rawRole).toUpperCase();
  const isSuperAdmin = ["SUPER_ADMIN", "SYS", "APP_OWNER"].includes(role);

  const [tariffs, setTariffs] = useState<TariffRule[]>([
    { id: '1', fromRegion: 'Yangon', toRegion: 'Mandalay', baseRate: 3500, extraRate: 600 },
    { id: '2', fromRegion: 'Yangon', toRegion: 'Shan (South)', baseRate: 5500, extraRate: 800 },
    { id: '3', fromRegion: 'Mandalay', toRegion: 'Kachin', baseRate: 6000, extraRate: 1000 },
  ]);

  const [calc, setCalc] = useState({ from: 'Yangon', to: 'Mandalay', weight: 1 });
  const [searchTerm, setSearchTerm] = useState("");

  const priceResult = useMemo(() => {
    const rule = tariffs.find(r => r.fromRegion === calc.from && r.toRegion === calc.to);
    if (!rule) return null;
    const base = rule.baseRate;
    const extraWeight = Math.max(0, calc.weight - 5);
    const total = base + (extraWeight * rule.extraRate);
    return { base, extraCharges: extraWeight * rule.extraRate, total, extraWeight };
  }, [calc, tariffs]);

  const filteredTariffs = tariffs.filter(tf => 
    tf.fromRegion.toLowerCase().includes(searchTerm.toLowerCase()) || 
    tf.toRegion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 🚫 Access Denied View
  if (!isSuperAdmin) {
    return (
      <AdminShell title="Access Denied">
        <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
          <ShieldAlert className="h-16 w-16 text-rose-500 animate-pulse" />
          <h2 className="text-2xl font-black text-white uppercase tracking-widest">{t("Restricted Access", "ခွင့်ပြုချက်မရှိပါ")}</h2>
          <p className="text-gray-500 max-w-sm">{t("This screen is reserved for Super Admin accounts only. Please contact the system administrator.", "ဤကဏ္ဍသည် Super Admin များအတွက်သာဖြစ်သည်။ စနစ်စီမံခန့်ခွဲသူအား ဆက်သွယ်ပါ။")}</p>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title={t("National Tariff System", "နိုင်ငံအဆင့် ပို့ဆောင်ခသတ်မှတ်ချက်")}>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Top Metric: Coverage */}
        <div className="bg-gradient-to-r from-amber-900/20 to-[#0A0F1C] border border-amber-500/30 rounded-[2rem] p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-amber-500/20 rounded-2xl border border-amber-500/30">
              <Globe className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-tighter">{t("Coverage: 15 States & Regions", "ပြည်နယ်နှင့် တိုင်း ၁၅ ခုလုံး အကျုံးဝင်သည်")}</h2>
              <p className="text-[10px] text-amber-500 font-bold uppercase tracking-widest">{t("National Logistics Grid Active (RESTRICTED)", "စနစ် စီမံခန့်ခွဲသူ ကဏ္ဍ")}</p>
            </div>
          </div>
          <div className="hidden md:block text-right">
            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Active Routes</p>
            <p className="text-2xl font-black text-white font-mono">{tariffs.length}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* LEFT: Regional Price Calculator */}
          <div className="xl:col-span-5 space-y-6">
            <div className="bg-[#0E1525] border border-white/5 rounded-[2rem] p-8 shadow-2xl">
              <h3 className="text-xs font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                <Calculator className="h-4 w-4 text-blue-500" /> {t("National Rate Check", "ဈေးနှုန်းတွက်ချက်ရန်")}
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Pick-up Region</label>
                  <select value={calc.from} onChange={(e) => setCalc({...calc, from: e.target.value})} className="w-full bg-[#05080F] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 outline-none">
                    {MYANMAR_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Delivery Region</label>
                  <select value={calc.to} onChange={(e) => setCalc({...calc, to: e.target.value})} className="w-full bg-[#05080F] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 outline-none">
                    {MYANMAR_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="space-y-2 pt-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2"><Scale className="h-3 w-3"/> Weight (kg)</label>
                  <input type="number" value={calc.weight} onChange={(e) => setCalc({...calc, weight: Number(e.target.value)})} className="w-full bg-[#05080F] border border-white/10 rounded-xl px-4 py-4 text-2xl font-black text-white font-mono outline-none focus:border-blue-500" />
                </div>
                {priceResult ? (
                  <div className="mt-6 p-6 bg-blue-500/5 border border-blue-500/20 rounded-2xl animate-in zoom-in-95">
                    <div className="flex justify-between text-[10px] font-bold uppercase text-gray-500 mb-2"><span>Base Rate</span><span>{priceResult.base.toLocaleString()} Ks</span></div>
                    {priceResult.extraWeight > 0 && <div className="flex justify-between text-[10px] font-bold uppercase text-rose-500 mb-4"><span>Extra Charge ({priceResult.extraWeight}kg)</span><span>+{priceResult.extraCharges.toLocaleString()} Ks</span></div>}
                    <div className="border-t border-white/5 pt-4 flex justify-between items-center"><span className="text-sm font-black text-white uppercase tracking-widest">Total</span><span className="text-3xl font-black text-blue-400 font-mono">{priceResult.total.toLocaleString()} Ks</span></div>
                  </div>
                ) : (
                  <div className="mt-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-center text-[10px] font-black uppercase text-rose-500">Route Not Defined.</div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: Master Matrix */}
          <div className="xl:col-span-7 flex flex-col h-full">
            <div className="bg-[#0E1525] border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl flex flex-col h-full">
              <div className="p-6 border-b border-white/5 bg-[#0A0F1C]/50 flex flex-col md:flex-row justify-between gap-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2"><Map className="h-4 w-4 text-blue-500" /> Regional Price Matrix</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-500" />
                  <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-[#05080F] border border-white/10 rounded-lg pl-9 pr-4 py-1.5 text-[10px] text-white outline-none focus:border-blue-500 w-full" placeholder="Search routes..." />
                </div>
              </div>
              <div className="flex-1 overflow-auto custom-scrollbar">
                <table className="w-full text-left">
                  <thead className="bg-[#0A0F1C] text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 border-b border-white/5">
                    <tr><th className="p-4">From</th><th className="p-4">To</th><th className="p-4">Base (5kg)</th><th className="p-4">Extra (kg)</th><th className="p-4 text-right">Edit</th></tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs">
                    {filteredTariffs.map(tf => (
                      <tr key={tf.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-4 font-bold text-gray-300">{tf.fromRegion}</td>
                        <td className="p-4 font-bold text-gray-300">{tf.toRegion}</td>
                        <td className="p-4 font-mono font-bold text-white">{tf.baseRate.toLocaleString()}</td>
                        <td className="p-4 font-mono text-blue-400">{tf.extraRate.toLocaleString()}</td>
                        <td className="p-4 text-right"><button className="p-2 text-gray-600 hover:text-rose-500 transition-colors"><Trash2 className="h-4 w-4" /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

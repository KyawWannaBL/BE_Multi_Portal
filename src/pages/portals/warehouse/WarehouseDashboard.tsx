import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/contexts/LanguageContext';
import toast from 'react-hot-toast';
import { 
  Warehouse, LogOut, ChevronLeft, ChevronRight, Globe, User, Search, 
  Package, Truck, ArrowDownToLine, ArrowUpFromLine, CheckCircle2, ShieldAlert,
  Boxes, BarChart, ExternalLink, Loader2
} from 'lucide-react';

const TopBar = () => {
  const navigate = useNavigate();
  const langCtx = useLanguage?.() ?? {};
  const currentLang = langCtx.lang || 'en';
  const t = (en: string, my: string) => currentLang === 'en' ? en : my;

  return (
    <div className="h-16 border-b border-white/5 bg-[#0B101B]/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-50">
      <div className="flex items-center gap-2">
        <button onClick={() => navigate(-1)} className="p-2 text-gray-400 hover:text-white bg-white/5 rounded-lg transition-all"><ChevronLeft size={18}/></button>
        <button onClick={() => navigate(1)} className="p-2 text-gray-400 hover:text-white bg-white/5 rounded-lg transition-all"><ChevronRight size={18}/></button>
        <div className="ml-4 relative hidden lg:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
          <input type="text" placeholder={t("Scan Waybill for Intake...", "အော်ဒါဘားကုဒ် ဖတ်ရန်...")} className="bg-black/50 border border-white/10 rounded-lg pl-9 pr-4 py-1.5 text-xs text-white focus:border-orange-500 outline-none w-64" />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button onClick={() => langCtx.setLanguage && langCtx.setLanguage(currentLang === 'en' ? 'my' : 'en')} className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase hover:text-white px-3 py-1.5 rounded-lg bg-white/5 transition-all">
          <Globe size={14} /> {currentLang === 'en' ? 'MY' : 'EN'}
        </button>
        <div className="h-8 border-l border-white/10 mx-2"></div>
        <div className="flex items-center gap-3 p-1.5 rounded-xl transition-all cursor-pointer hover:bg-white/5">
          <div className="text-right hidden md:block">
            <div className="text-xs font-bold text-white uppercase tracking-tighter">{t("Warehouse Controller", "ဂိုဒေါင် ထိန်းချုပ်သူ")}</div>
            <div className="text-[9px] text-orange-400 font-mono">WH-YGN-01</div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center border border-white/10">
            <Warehouse size={18} className="text-white" />
          </div>
        </div>
      </div>
    </div>
  );
};

const WarehouseOverview = ({ t }: { t: Function }) => {
  const [shipments, setShipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWarehouseData = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('shipments').select('*').limit(20);
      if (!error && data) setShipments(data);
      setLoading(false);
    };
    fetchWarehouseData();
  }, []);

  return (
    <div className="p-6 md:p-8 animate-in fade-in duration-500">
      <div className="mb-8">
        <h2 className="text-2xl font-black uppercase tracking-widest text-white mb-1">{t("Inventory & Routing Hub", "ကုန်လှောင်ရုံ နှင့် လမ်းကြောင်းထိန်းချုပ်ရေး")}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#0A0E17] border border-white/5 rounded-2xl p-6 relative overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 mb-4"><ArrowDownToLine size={20}/></div>
          <div className="text-3xl font-black text-white">124</div>
          <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-2">{t("Pending Inbound", "လက်ခံရန်ကျန်ရှိသော ကုန်များ")}</div>
        </div>
        <div className="bg-[#0A0E17] border border-white/5 rounded-2xl p-6 relative overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-4"><Boxes size={20}/></div>
          <div className="text-3xl font-black text-white">8,432</div>
          <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-2">{t("Stored Inventory", "ဂိုဒေါင်တွင်း ကုန်ပစ္စည်းများ")}</div>
        </div>
        <div className="bg-[#0A0E17] border border-white/5 rounded-2xl p-6 relative overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-4"><ArrowUpFromLine size={20}/></div>
          <div className="text-3xl font-black text-white">450</div>
          <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-2">{t("Ready for Dispatch", "ပို့ဆောင်ရန် အသင့်ဖြစ်သော")}</div>
        </div>
      </div>

      <div className="bg-[#0A0E17] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-5 border-b border-white/5 bg-black/20 flex justify-between">
          <h3 className="text-xs font-black uppercase tracking-widest text-white">{t("Recent Hub Scans", "လတ်တလော စကင်ဖတ်ထားမှုများ")}</h3>
        </div>
        <table className="w-full text-left text-xs">
          <thead className="bg-black/40 text-gray-500 uppercase tracking-widest font-bold text-[9px]">
            <tr>
              <th className="p-5">{t("Tracking ID", "ခြေရာခံနံပါတ်")}</th>
              <th className="p-5">{t("Customer", "ဝယ်ယူသူ")}</th>
              <th className="p-5">{t("Status", "အခြေအနေ")}</th>
              <th className="p-5 text-right">{t("Action", "လုပ်ဆောင်ချက်")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-gray-300">
            {loading ? <tr><td colSpan={4} className="p-8 text-center"><Loader2 className="animate-spin text-orange-500 mx-auto"/></td></tr> : 
              shipments.slice(0, 5).map((s, i) => (
              <tr key={i} className="hover:bg-white/5 transition-colors">
                <td className="p-5 font-mono font-bold text-white">{s.tracking_number || `BE-980${i}`}</td>
                <td className="p-5">{s.customer_name || 'Unknown'}</td>
                <td className="p-5"><span className="px-2 py-1 rounded text-[9px] font-bold bg-orange-500/10 text-orange-400">ARRIVED_HUB</span></td>
                <td className="p-5 text-right"><button className="bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase">{t("Process", "လုပ်ဆောင်မည်")}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default function WarehouseDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const langCtx = useLanguage?.() ?? {};
  const t = (en: string, my: string) => (langCtx.lang || 'en') === 'en' ? en : my;

  const navItems = [
    { name: t("Controller Dashboard", "ထိန်းချုပ်ရေး မျက်နှာပြင်"), path: "/portal/warehouse", icon: <BarChart size={18} /> },
    { name: t("Inbound (Receiving)", "ကုန်ပစ္စည်း လက်ခံခြင်း"), path: "/portal/warehouse/inbound", icon: <ArrowDownToLine size={18} /> },
    { name: t("Outbound (Dispatch)", "ကုန်ပစ္စည်း ထုတ်ပေးခြင်း"), path: "/portal/warehouse/outbound", icon: <ArrowUpFromLine size={18} /> },
    { name: t("Inventory Matrix", "ကုန်ပစ္စည်း စာရင်း"), path: "/portal/warehouse/inventory", icon: <Boxes size={18} /> },
  ];

  return (
    <div className="flex h-screen bg-[#05080F] overflow-hidden font-sans text-slate-200">
      <div className="w-72 bg-[#0A0E17] border-r border-white/5 flex flex-col justify-between flex-shrink-0 z-50">
        <div className="overflow-y-auto">
          <div className="p-8 flex items-center gap-4 border-b border-white/5">
            <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.4)]">
              <Warehouse size={20} className="text-white"/>
            </div>
            <span className="font-black text-white tracking-[0.2em] uppercase text-sm leading-tight">Warehouse<br/><span className="text-orange-400 text-[10px]">Operations</span></span>
          </div>
          <nav className="px-6 py-8 space-y-2">
            <div className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] mb-4 ml-2">{t("Warehouse Modules", "ဂိုဒေါင် မော်ဂျူးများ")}</div>
            {navItems.map((item) => {
              const isActive = item.path === '/portal/warehouse' ? location.pathname === item.path : location.pathname.startsWith(item.path);
              return (
                <Link key={item.path} to={item.path} className={`flex items-center gap-4 px-4 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${isActive ? "bg-orange-600/10 text-orange-500 border border-orange-500/20 shadow-[0_0_20px_rgba(249,115,22,0.1)]" : "text-gray-500 hover:bg-white/5 hover:text-white"}`}>
                  {item.icon} {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="p-6">
          <button onClick={() => { supabase.auth.signOut(); navigate('/login'); }} className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-rose-500 bg-rose-500/5 border border-rose-500/10 hover:bg-rose-500/20 transition-all">
            <ShieldAlert size={14} /> {t("End Shift", "လုပ်ငန်းသိမ်းမည်")}
          </button>
        </div>
      </div>
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <TopBar />
        <div className="flex-1 overflow-y-auto bg-gradient-to-tr from-black via-[#0B101B] to-[#05080F] custom-scrollbar">
          <Routes>
            <Route path="/" element={<WarehouseOverview t={t} />} />
            <Route path="inbound" element={<div className="p-8 text-white"><h2 className="text-2xl font-black uppercase tracking-widest">Inbound Scan Engine</h2></div>} />
            <Route path="outbound" element={<div className="p-8 text-white"><h2 className="text-2xl font-black uppercase tracking-widest">Outbound Dispatch Matrix</h2></div>} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/contexts/LanguageContext';
import toast from 'react-hot-toast';
import { 
  Eye, Users, AlertTriangle, LogOut, ChevronLeft, ChevronRight, 
  Globe, Search, User, Truck, Package, MapPin, ExternalLink, 
  ShieldAlert, Route as RouteIcon, BatteryMedium, Clock
} from 'lucide-react';

// ==========================================
// 1. TOP NAVIGATION BAR
// ==========================================
const TopBar = () => {
  const navigate = useNavigate();
  const langCtx = useLanguage?.() ?? {};
  const currentLang = langCtx.lang || 'en';
  const t = (en: string, my: string) => currentLang === 'en' ? en : my;

  const handleToggleLanguage = () => {
    if (typeof langCtx.toggleLang === 'function') langCtx.toggleLang();
    else if (typeof langCtx.setLanguage === 'function') langCtx.setLanguage(currentLang === 'en' ? 'my' : 'en');
  };

  return (
    <div className="h-16 border-b border-white/5 bg-[#0B101B]/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-50">
      <div className="flex items-center gap-2">
        <button onClick={() => navigate(-1)} className="p-2 text-gray-400 hover:text-white bg-white/5 rounded-lg transition-all"><ChevronLeft size={18}/></button>
        <button onClick={() => navigate(1)} className="p-2 text-gray-400 hover:text-white bg-white/5 rounded-lg transition-all"><ChevronRight size={18}/></button>
        <div className="ml-4 relative hidden lg:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
          <input type="text" placeholder={t("Search Waybill or Rider...", "အော်ဒါ သို့မဟုတ် ပို့ဆောင်သူ ရှာရန်...")} className="bg-black/50 border border-white/10 rounded-lg pl-9 pr-4 py-1.5 text-xs text-white focus:border-indigo-500 outline-none w-64 transition-colors" />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button onClick={handleToggleLanguage} className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase hover:text-white px-3 py-1.5 rounded-lg bg-white/5 transition-all">
          <Globe size={14} /> {currentLang === 'en' ? 'MY' : 'EN'}
        </button>
        <div className="h-8 border-l border-white/10 mx-2"></div>
        <div className="flex items-center gap-3 p-1.5 rounded-xl transition-all hover:bg-white/5 cursor-pointer">
          <div className="text-right hidden md:block">
            <div className="text-xs font-bold text-white uppercase tracking-tighter">{t("Hub Supervisor", "စင်တာ ကြီးကြပ်ရေးမှူး")}</div>
            <div className="text-[9px] text-indigo-400 font-mono">OPS-YGN-01</div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center border border-white/10">
            <User size={18} className="text-white" />
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 2. SUB-MODULES
// ==========================================
const HubOverview = ({ t }: { t: Function }) => (
  <div className="p-6 md:p-8 animate-in fade-in duration-500">
    <div className="mb-8">
      <h2 className="text-2xl font-black uppercase tracking-widest text-white mb-1">{t("Hub Operations", "စင်တာ လုပ်ငန်းစဉ်များ")}</h2>
      <p className="text-indigo-400 text-[10px] tracking-[0.2em] uppercase flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span> {t("Yangon Central Hub // Live", "ရန်ကုန် ဗဟိုစင်တာ // တိုက်ရိုက်")}
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-[#0A0E17] border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
        <Truck className="absolute -right-4 -top-4 opacity-5 scale-150 text-indigo-500 group-hover:opacity-10 transition-opacity"/>
        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-4"><Truck size={20}/></div>
        <div className="text-3xl font-black text-white">24</div>
        <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-2">{t("Active Fleet", "အလုပ်လုပ်နေသော ယာဉ်များ")}</div>
      </div>
      <div className="bg-[#0A0E17] border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
        <Package className="absolute -right-4 -top-4 opacity-5 scale-150 text-blue-500 group-hover:opacity-10 transition-opacity"/>
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-4"><Package size={20}/></div>
        <div className="text-3xl font-black text-white">842</div>
        <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-2">{t("Pending Dispatch", "ပို့ဆောင်ရန် ကျန်ရှိသည်များ")}</div>
      </div>
      <div className="bg-[#0A0E17] border border-amber-500/20 rounded-2xl p-6 relative overflow-hidden shadow-[0_0_15px_rgba(245,158,11,0.05)] group">
        <AlertTriangle className="absolute -right-4 -top-4 opacity-5 scale-150 text-amber-500 group-hover:opacity-10 transition-opacity"/>
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 mb-4"><AlertTriangle size={20}/></div>
        <div className="text-3xl font-black text-amber-500">3</div>
        <div className="text-[10px] text-amber-600 font-bold uppercase tracking-widest mt-2">{t("Delivery Exceptions", "ပို့ဆောင်မှု အခက်အခဲများ")}</div>
      </div>
    </div>

    <div className="bg-[#0A0E17] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
      <div className="p-5 border-b border-white/5 flex justify-between items-center bg-black/20">
        <h3 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2">
          <Users size={14} className="text-indigo-400"/> {t("Live Rider Status", "ပို့ဆောင်သူများ၏ လက်ရှိအခြေအနေ")}
        </h3>
      </div>
      <table className="w-full text-left text-xs">
        <thead className="bg-black/40 text-gray-500 uppercase tracking-widest font-bold text-[9px]">
          <tr>
            <th className="p-5">{t("Rider", "ပို့ဆောင်သူ")}</th>
            <th className="p-5">{t("Zone", "နယ်မြေ")}</th>
            <th className="p-5">{t("Load (Delivered/Total)", "ပို့ဆောင်ပြီး / စုစုပေါင်း")}</th>
            <th className="p-5 text-right">{t("Status", "အခြေအနေ")}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5 text-gray-300">
          {[
            { name: "Ko Aung Myat", id: "RDR-001", zone: "North Dagon", load: "14/20", status: "On Route", sColor: "text-blue-400 bg-blue-500/10" },
            { name: "U Kyaw Win", id: "RDR-002", zone: "Insein", load: "8/15", status: "Delayed", sColor: "text-amber-400 bg-amber-500/10" },
            { name: "Ma Thida", id: "RDR-005", zone: "Hlaing", load: "22/22", status: "Returning", sColor: "text-emerald-400 bg-emerald-500/10" },
          ].map((r, i) => (
            <tr key={i} className="hover:bg-white/5 transition-colors">
              <td className="p-5">
                <div className="font-bold text-white">{r.name}</div>
                <div className="text-[9px] text-gray-500 font-mono mt-1">{r.id}</div>
              </td>
              <td className="p-5 font-bold">{r.zone}</td>
              <td className="p-5 font-bold text-indigo-400">{r.load}</td>
              <td className="p-5 text-right">
                <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border border-white/5 ${r.sColor}`}>
                  {r.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const RiderFleet = ({ t }: { t: Function }) => (
  <div className="p-6 md:p-8 animate-in fade-in duration-500">
    <div className="mb-8">
      <h2 className="text-2xl font-black uppercase tracking-widest text-white">{t("Rider Fleet Management", "ပို့ဆောင်သူ ယာဉ်တန်း စီမံခန့်ခွဲမှု")}</h2>
      <p className="text-gray-400 text-xs mt-1">{t("Monitor device battery, last ping, and active assignments.", "ဘက်ထရီ၊ နောက်ဆုံးတည်နေရာနှင့် တာဝန်ချထားမှုများကို စောင့်ကြည့်ပါ။")}</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[
        { id: "RDR-001", name: "Ko Aung Myat", bat: "85%", ping: "2 mins ago", zone: "North Dagon" },
        { id: "RDR-002", name: "U Kyaw Win", bat: "22%", ping: "15 mins ago", zone: "Insein", lowBat: true },
        { id: "RDR-005", name: "Ma Thida", bat: "91%", ping: "1 min ago", zone: "Hlaing" }
      ].map((rider, i) => (
        <div key={i} className="bg-[#0A0E17] border border-white/5 rounded-2xl p-6">
          <div className="flex justify-between items-start mb-4 border-b border-white/5 pb-4">
             <div>
               <h4 className="text-white font-bold">{rider.name}</h4>
               <p className="text-[10px] text-gray-500 font-mono mt-1">{rider.id}</p>
             </div>
             <div className={`flex items-center gap-1 text-[10px] font-bold ${rider.lowBat ? 'text-rose-500' : 'text-emerald-500'}`}>
                <BatteryMedium size={14} /> {rider.bat}
             </div>
          </div>
          <div className="space-y-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">
            <div className="flex items-center gap-2"><MapPin size={14}/> {t("Zone", "နယ်မြေ")}: <span className="text-white">{rider.zone}</span></div>
            <div className="flex items-center gap-2"><Clock size={14}/> {t("Last Ping", "နောက်ဆုံးအဆက်အသွယ်")}: <span className="text-white">{rider.ping}</span></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const Exceptions = ({ t }: { t: Function }) => (
  <div className="p-6 md:p-8 animate-in fade-in duration-500">
    <div className="mb-8">
      <h2 className="text-2xl font-black uppercase tracking-widest text-white">{t("Delivery Exceptions", "ပို့ဆောင်မှု အခက်အခဲများ")}</h2>
      <p className="text-gray-400 text-xs mt-1">{t("Packages that require immediate supervisor resolution.", "အမြန်ဖြေရှင်းရန် လိုအပ်သော ပစ္စည်းများ")}</p>
    </div>
    <div className="bg-[#0A0E17] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
      <table className="w-full text-left text-xs">
        <thead className="bg-black/40 text-gray-500 uppercase tracking-widest font-bold text-[9px]">
          <tr>
            <th className="p-5">{t("Tracking", "ခြေရာခံနံပါတ်")}</th>
            <th className="p-5">{t("Issue Type", "အခက်အခဲ အမျိုးအစား")}</th>
            <th className="p-5">{t("Rider", "ပို့ဆောင်သူ")}</th>
            <th className="p-5 text-right">{t("Resolution", "ဖြေရှင်းရန်")}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5 text-gray-300">
          {[
            { trk: "TRK-99012", type: "Customer Unavailable", rider: "RDR-002" },
            { trk: "TRK-99155", type: "Refused by Customer", rider: "RDR-014" },
          ].map((ex, i) => (
            <tr key={i} className="hover:bg-white/5 transition-colors">
              <td className="p-5 font-mono font-bold">{ex.trk}</td>
              <td className="p-5 text-amber-500 font-bold">{ex.type}</td>
              <td className="p-5 text-gray-400">{ex.rider}</td>
              <td className="p-5 text-right">
                <button className="bg-white/5 hover:bg-white/10 text-white px-3 py-1.5 rounded text-[10px] font-bold uppercase transition-all border border-white/10">
                  {t("Action", "လုပ်ဆောင်မည်")}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// ==========================================
// 3. MASTER LAYOUT COMPONENT
// ==========================================
export default function SupervisorDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const langCtx = useLanguage?.() ?? {};
  const currentLang = langCtx.lang || 'en';
  const t = (en: string, my: string) => currentLang === 'en' ? en : my;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const navItems = [
    { name: t("Hub Overview", "စင်တာ ခြုံငုံသုံးသပ်ချက်"), path: "/portal/supervisor", icon: <Eye size={18} /> },
    { name: t("Rider Fleet", "ပို့ဆောင်သူ ယာဉ်တန်း"), path: "/portal/supervisor/fleet", icon: <Users size={18} /> },
    { name: t("Exceptions", "ပို့ဆောင်မှု အခက်အခဲများ"), path: "/portal/supervisor/exceptions", icon: <AlertTriangle size={18} /> },
    { name: t("Routing Setup", "လမ်းကြောင်း သတ်မှတ်ခြင်း"), path: "/portal/supervisor/routing", icon: <RouteIcon size={18} /> },
  ];

  const portalJumps = [
    { n: t("Command Center", "ထိန်းချုပ်ရေးစင်တာ"), p: "/portal/admin" },
    { n: t("Finance Dept", "ငွေကြေးဌာန"), p: "/portal/finance" },
    { n: t("Data Entry", "ဒေတာဖြည့်သွင်းခြင်း"), p: "/portal/data-entry" },
  ];

  return (
    <div className="flex h-screen bg-[#05080F] overflow-hidden font-sans text-slate-200">
      
      {/* 🧭 Sidebar */}
      <div className="w-72 bg-[#0A0E17] border-r border-white/5 flex flex-col justify-between flex-shrink-0 z-50">
        <div className="overflow-y-auto custom-scrollbar">
          <div className="p-8 flex items-center gap-4 border-b border-white/5">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-[0_0_15px_rgba(79,70,229,0.4)]">
              <Eye size={20} className="text-white"/>
            </div>
            <span className="font-black text-white tracking-[0.2em] uppercase text-sm leading-tight">Hub<br/><span className="text-indigo-400 text-[10px]">Operations</span></span>
          </div>
          
          <nav className="px-6 py-8 space-y-2">
            <div className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] mb-4 ml-2">{t("Hub Modules", "စင်တာ မော်ဂျူးများ")}</div>
            {navItems.map((item) => {
              const isActive = item.path === '/portal/supervisor' ? location.pathname === item.path : location.pathname.startsWith(item.path);
              return (
                <Link key={item.path} to={item.path} 
                  className={`flex items-center gap-4 px-4 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                    isActive ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-[0_0_20px_rgba(79,70,229,0.1)]" : "text-gray-500 hover:bg-white/5 hover:text-white"
                  }`}>
                  {item.icon} {item.name}
                </Link>
              );
            })}

            <div className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] mt-12 mb-4 ml-2">{t("Portal Jump", "ပေါ်တယ်သို့ သွားရန်")}</div>
            {portalJumps.map((j) => (
              <Link key={j.p} to={j.p} className="flex items-center justify-between px-4 py-2 text-[10px] font-bold text-gray-500 hover:text-white transition-all uppercase tracking-widest group">
                {j.n} <ExternalLink size={12} className="opacity-0 group-hover:opacity-100" />
              </Link>
            ))}
          </nav>
        </div>

        <div className="p-6">
          <button onClick={handleLogout} className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-rose-500 bg-rose-500/5 border border-rose-500/10 hover:bg-rose-500/20 transition-all">
            <ShieldAlert size={14} /> {t("End Shift", "လုပ်ငန်းသိမ်းမည်")}
          </button>
        </div>
      </div>

      {/* 🖥️ Main Routing Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <TopBar />
        <div className="flex-1 overflow-y-auto bg-gradient-to-tr from-black via-[#0B101B] to-[#05080F] custom-scrollbar">
          <Routes>
            <Route path="/" element={<HubOverview t={t} />} />
            <Route path="fleet" element={<RiderFleet t={t} />} />
            <Route path="exceptions" element={<Exceptions t={t} />} />
            <Route path="routing" element={<div className="p-8 text-white"><h2 className="text-2xl font-black uppercase">{t("Routing Setup", "လမ်းကြောင်း သတ်မှတ်ခြင်း")}</h2></div>} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

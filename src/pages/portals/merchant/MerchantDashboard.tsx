import React, { useState } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/contexts/LanguageContext';
import toast from 'react-hot-toast';
import { 
  Store, LogOut, ChevronLeft, ChevronRight, Globe, User, Search, 
  UploadCloud, Banknote, Code, Package, TrendingUp, CheckCircle2, 
  AlertCircle, FileSpreadsheet, Download
} from 'lucide-react';

// ==========================================
// 1. TOP NAVIGATION BAR
// ==========================================
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
          <input type="text" placeholder={t("Track Order ID...", "ပစ္စည်းအမှတ်စဉ် ရှာရန်...")} className="bg-black/50 border border-white/10 rounded-lg pl-9 pr-4 py-1.5 text-xs text-white focus:border-teal-500 outline-none w-64" />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button onClick={() => langCtx.setLanguage && langCtx.setLanguage(currentLang === 'en' ? 'my' : 'en')} className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase hover:text-white px-3 py-1.5 rounded-lg bg-white/5 transition-all">
          <Globe size={14} /> {currentLang === 'en' ? 'MY' : 'EN'}
        </button>
        <div className="h-8 border-l border-white/10 mx-2"></div>
        <div className="flex items-center gap-3 p-1.5 rounded-xl transition-all cursor-pointer hover:bg-white/5">
          <div className="text-right hidden md:block">
            <div className="text-xs font-bold text-white uppercase tracking-tighter">Fashion Hub MM</div>
            <div className="text-[9px] text-teal-400 font-mono">MER-001</div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center border border-white/10">
            <Store size={18} className="text-white" />
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 2. SUB-MODULES
// ==========================================
const StoreOverview = ({ t }: { t: Function }) => (
  <div className="p-6 md:p-8 animate-in fade-in duration-500">
    <div className="mb-8">
      <h2 className="text-2xl font-black uppercase tracking-widest text-white mb-1">{t("Store Overview", "စတိုးဆိုင် ခြုံငုံသုံးသပ်ချက်")}</h2>
      <p className="text-teal-400 text-[10px] tracking-[0.2em] uppercase flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span> {t("API Connected & Live", "API ချိတ်ဆက်ထားသည်")}
      </p>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {[
        { title: t("Active Deliveries", "ပို့ဆောင်နေဆဲ"), val: "142", icon: <Package className="text-blue-500"/> },
        { title: t("Delivered Today", "ယနေ့ ပို့ဆောင်ပြီး"), val: "38", icon: <CheckCircle2 className="text-emerald-500"/> },
        { title: t("Pending COD Payout", "ရရန်ရှိသော ငွေ"), val: "845,000 Ks", icon: <Banknote className="text-teal-500"/> }
      ].map((stat, i) => (
        <div key={i} className="bg-[#0A0E17] border border-white/5 rounded-2xl p-6 relative overflow-hidden hover:border-white/10 transition-all">
          <div className="absolute -right-4 -top-4 opacity-5 scale-150">{stat.icon}</div>
          <div className="mb-4">{stat.icon}</div>
          <div className="text-3xl font-black text-white">{stat.val}</div>
          <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-2">{stat.title}</div>
        </div>
      ))}
    </div>

    <div className="bg-[#0A0E17] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
      <div className="p-5 border-b border-white/5 bg-black/20">
        <h3 className="text-xs font-black uppercase tracking-widest text-white">{t("Recent Orders", "လတ်တလော အော်ဒါများ")}</h3>
      </div>
      <table className="w-full text-left text-xs">
        <thead className="bg-black/40 text-gray-500 uppercase tracking-widest font-bold text-[9px]">
          <tr>
            <th className="p-5">{t("Tracking ID", "ခြေရာခံနံပါတ်")}</th>
            <th className="p-5">{t("Customer", "ဝယ်ယူသူ")}</th>
            <th className="p-5">{t("COD Amount", "ကောက်ခံရမည့်ငွေ")}</th>
            <th className="p-5 text-right">{t("Status", "အခြေအနေ")}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5 text-gray-300">
          {[
            { id: "TRK-99281", name: "Daw Su Su", cod: "45,000 Ks", status: "In Transit", color: "text-blue-400 bg-blue-500/10" },
            { id: "TRK-99282", name: "Ko Kyaw", cod: "Prepaid", status: "Delivered", color: "text-emerald-400 bg-emerald-500/10" },
            { id: "TRK-99283", name: "Ma Thida", cod: "15,000 Ks", status: "Failed Attempt", color: "text-rose-400 bg-rose-500/10" },
          ].map((r, i) => (
            <tr key={i} className="hover:bg-white/5 transition-colors">
              <td className="p-5 font-mono font-bold">{r.id}</td>
              <td className="p-5 font-bold text-white">{r.name}</td>
              <td className="p-5 font-mono">{r.cod}</td>
              <td className="p-5 text-right">
                <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border border-white/5 ${r.color}`}>
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

const BulkUpload = ({ t }: { t: Function }) => (
  <div className="p-6 md:p-8 animate-in fade-in duration-500">
    <div className="flex justify-between items-center mb-8">
      <div>
        <h2 className="text-2xl font-black uppercase tracking-widest text-white">{t("Bulk Waybill Upload", "အော်ဒါများ အစုလိုက်တင်ရန်")}</h2>
        <p className="text-gray-400 text-xs mt-1">{t("Upload Excel or CSV files to generate multiple waybills instantly.", "Excel သို့မဟုတ် CSV ဖိုင်တင်၍ အော်ဒါများ ဖန်တီးပါ။")}</p>
      </div>
      <button className="bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 border border-white/10 transition-all">
        <Download size={14} /> {t("Download Template", "နမူနာဖိုင် ဒေါင်းလုဒ်လုပ်ရန်")}
      </button>
    </div>
    
    {/* Drag & Drop Zone */}
    <div className="bg-[#0A0E17] border-2 border-dashed border-white/10 rounded-[2rem] p-12 flex flex-col items-center justify-center text-center hover:border-teal-500/50 hover:bg-teal-500/5 transition-all cursor-pointer group">
      <div className="w-16 h-16 rounded-full bg-teal-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        <FileSpreadsheet size={32} className="text-teal-400" />
      </div>
      <h3 className="text-lg font-black text-white uppercase tracking-widest mb-2">{t("Drag & Drop File Here", "ဖိုင်ကို ဤနေရာသို့ ဆွဲထည့်ပါ")}</h3>
      <p className="text-xs text-gray-500 mb-6">{t("Supported formats: .csv, .xlsx (Max 500 rows)", "ထောက်ပံ့ပေးသော ဖိုင်များ: .csv, .xlsx (အများဆုံး ၅၀၀)")}</p>
      <button onClick={(e) => { e.stopPropagation(); toast.success("File upload simulator"); }} className="bg-teal-600 hover:bg-teal-500 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-teal-500/20">
        {t("Browse Files", "ဖိုင်ရွေးရန်")}
      </button>
    </div>
  </div>
);

// ==========================================
// 3. MASTER LAYOUT COMPONENT
// ==========================================
export default function MerchantDashboard() {
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
    { name: t("Store Overview", "ဆိုင် ခြုံငုံသုံးသပ်ချက်"), path: "/portal/merchant", icon: <Store size={18} /> },
    { name: t("Bulk Upload", "အစုလိုက်တင်ရန်"), path: "/portal/merchant/upload", icon: <UploadCloud size={18} /> },
    { name: t("COD Settlements", "ငွေစာရင်းရှင်းတမ်း"), path: "/portal/merchant/settlements", icon: <Banknote size={18} /> },
    { name: t("API & Webhooks", "API ချိတ်ဆက်မှု"), path: "/portal/merchant/api", icon: <Code size={18} /> },
  ];

  return (
    <div className="flex h-screen bg-[#05080F] overflow-hidden font-sans text-slate-200">
      
      {/* 🧭 Sidebar */}
      <div className="w-72 bg-[#0A0E17] border-r border-white/5 flex flex-col justify-between flex-shrink-0 z-50">
        <div className="overflow-y-auto">
          <div className="p-8 flex items-center gap-4 border-b border-white/5">
            <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center shadow-[0_0_15px_rgba(20,184,166,0.4)]">
              <Store size={20} className="text-white"/>
            </div>
            <span className="font-black text-white tracking-[0.2em] uppercase text-sm leading-tight">Britium<br/><span className="text-teal-400 text-[10px]">Merchant</span></span>
          </div>
          
          <nav className="px-6 py-8 space-y-2">
            <div className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] mb-4 ml-2">{t("Store Modules", "စတိုးဆိုင် မော်ဂျူးများ")}</div>
            {navItems.map((item) => {
              const isActive = item.path === '/portal/merchant' ? location.pathname === item.path : location.pathname.startsWith(item.path);
              return (
                <Link key={item.path} to={item.path} 
                  className={`flex items-center gap-4 px-4 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                    isActive ? "bg-teal-600/10 text-teal-400 border border-teal-500/20 shadow-[0_0_20px_rgba(20,184,166,0.1)]" : "text-gray-500 hover:bg-white/5 hover:text-white"
                  }`}>
                  {item.icon} {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          <button onClick={handleLogout} className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-rose-500 bg-rose-500/5 border border-rose-500/10 hover:bg-rose-500/20 transition-all">
            <LogOut size={14} /> {t("Sign Out", "အကောင့်ထွက်မည်")}
          </button>
        </div>
      </div>

      {/* 🖥️ Main Routing Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <TopBar />
        <div className="flex-1 overflow-y-auto bg-gradient-to-tr from-black via-[#0B101B] to-[#05080F] custom-scrollbar">
          {/* Note: Relative Paths! */}
          <Routes>
            <Route path="/" element={<StoreOverview t={t} />} />
            <Route path="upload" element={<BulkUpload t={t} />} />
            <Route path="settlements" element={<div className="p-8 text-white"><h2 className="text-2xl font-black uppercase">COD Settlements</h2></div>} />
            <Route path="api" element={<div className="p-8 text-white"><h2 className="text-2xl font-black uppercase">API Config</h2></div>} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

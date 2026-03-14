import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/contexts/LanguageContext';
import toast from 'react-hot-toast';
import { 
  Users, LogOut, ChevronLeft, ChevronRight, Globe, User, Search, 
  Briefcase, CheckCircle2, ShieldAlert, Plus, BadgeDollarSign, Loader2, Contact
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
      </div>
      <div className="flex items-center gap-4">
        <button onClick={() => langCtx.setLanguage && langCtx.setLanguage(currentLang === 'en' ? 'my' : 'en')} className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase hover:text-white px-3 py-1.5 rounded-lg bg-white/5 transition-all">
          <Globe size={14} /> {currentLang === 'en' ? 'MY' : 'EN'}
        </button>
        <div className="h-8 border-l border-white/10 mx-2"></div>
        <div className="flex items-center gap-3 p-1.5 rounded-xl transition-all cursor-pointer hover:bg-white/5">
          <div className="text-right hidden md:block">
            <div className="text-xs font-bold text-white uppercase tracking-tighter">{t("HR Director", "လူ့စွမ်းအားအရင်းအမြစ် ညွှန်ကြားရေးမှူး")}</div>
            <div className="text-[9px] text-pink-400 font-mono">HR-ADM-01</div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center border border-white/10">
            <Contact size={18} className="text-white" />
          </div>
        </div>
      </div>
    </div>
  );
};

const EmployeeDirectory = ({ t }: { t: Function }) => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (!error && data) setEmployees(data);
      setLoading(false);
    };
    fetchEmployees();
  }, []);

  return (
    <div className="p-6 md:p-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-widest text-white mb-1">{t("Corporate Directory", "ဝန်ထမ်း စာရင်း")}</h2>
          <p className="text-gray-400 text-xs mt-1">{t("Manage employee contracts, statuses, and profiles.", "ဝန်ထမ်းစာချုပ်များနှင့် အချက်အလက်များကို စီမံပါ။")}</p>
        </div>
        <button className="bg-pink-600 hover:bg-pink-500 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-pink-500/20 transition-all">
          <Plus size={16} /> {t("Onboard Employee", "ဝန်ထမ်းသစ် ထည့်သွင်းမည်")}
        </button>
      </div>

      <div className="bg-[#0A0E17] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-5 border-b border-white/5 bg-black/20 flex justify-between">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
            <input type="text" placeholder={t("Search by Name or Code...", "အမည် (သို့) ကုဒ်ဖြင့် ရှာရန်...")} className="bg-black/50 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-xs text-white focus:border-pink-500 outline-none w-64" />
          </div>
        </div>
        <table className="w-full text-left text-xs">
          <thead className="bg-black/40 text-gray-500 uppercase tracking-widest font-bold text-[9px]">
            <tr>
              <th className="p-5">{t("Employee Code", "ဝန်ထမ်း ကုဒ်")}</th>
              <th className="p-5">{t("Name & Contact", "အမည် နှင့် ဆက်သွယ်ရန်")}</th>
              <th className="p-5">{t("Job Title", "ရာထူး")}</th>
              <th className="p-5 text-right">{t("Status", "အခြေအနေ")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-gray-300">
            {loading ? <tr><td colSpan={4} className="p-8 text-center"><Loader2 className="animate-spin text-pink-500 mx-auto"/></td></tr> : 
              employees.map((e, i) => (
              <tr key={i} className="hover:bg-white/5 transition-colors">
                <td className="p-5 font-mono font-bold text-pink-400">{e.id?.substring(0,8).toUpperCase()}</td>
                <td className="p-5">
                  <div className="font-bold text-white">{e.full_name || 'Unknown'}</div>
                  <div className="text-[9px] text-gray-500 mt-1">{e.id}</div>
                </td>
                <td className="p-5"><span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[9px] font-bold uppercase">{e.role || 'STAFF'}</span></td>
                <td className="p-5 text-right"><span className="text-[10px] font-bold text-emerald-400 flex items-center justify-end gap-1"><CheckCircle2 size={12}/> {e.status || 'Active'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default function HrDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const langCtx = useLanguage?.() ?? {};
  const t = (en: string, my: string) => (langCtx.lang || 'en') === 'en' ? en : my;

  const navItems = [
    { name: t("Employee Directory", "ဝန်ထမ်း စာရင်း"), path: "/portal/hr", icon: <Users size={18} /> },
    { name: t("Recruitment Ops", "ဝန်ထမ်း ခေါ်ယူရေး"), path: "/portal/hr/recruitment", icon: <Briefcase size={18} /> },
    { name: t("Payroll Integration", "လစာ နှင့် ခံစားခွင့်များ"), path: "/portal/hr/payroll", icon: <BadgeDollarSign size={18} /> },
  ];

  return (
    <div className="flex h-screen bg-[#05080F] overflow-hidden font-sans text-slate-200">
      <div className="w-72 bg-[#0A0E17] border-r border-white/5 flex flex-col justify-between flex-shrink-0 z-50">
        <div className="overflow-y-auto">
          <div className="p-8 flex items-center gap-4 border-b border-white/5">
            <div className="w-10 h-10 rounded-xl bg-pink-600 flex items-center justify-center shadow-[0_0_15px_rgba(219,39,119,0.4)]">
              <Users size={20} className="text-white"/>
            </div>
            <span className="font-black text-white tracking-[0.2em] uppercase text-sm leading-tight">Human<br/><span className="text-pink-400 text-[10px]">Resources</span></span>
          </div>
          <nav className="px-6 py-8 space-y-2">
            <div className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] mb-4 ml-2">{t("HR Modules", "HR မော်ဂျူးများ")}</div>
            {navItems.map((item) => {
              const isActive = item.path === '/portal/hr' ? location.pathname === item.path : location.pathname.startsWith(item.path);
              return (
                <Link key={item.path} to={item.path} className={`flex items-center gap-4 px-4 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${isActive ? "bg-pink-600/10 text-pink-500 border border-pink-500/20 shadow-[0_0_20px_rgba(219,39,119,0.1)]" : "text-gray-500 hover:bg-white/5 hover:text-white"}`}>
                  {item.icon} {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="p-6">
          <button onClick={() => { supabase.auth.signOut(); navigate('/login'); }} className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-rose-500 bg-rose-500/5 border border-rose-500/10 hover:bg-rose-500/20 transition-all">
            <ShieldAlert size={14} /> {t("Sign Out", "အကောင့်ထွက်မည်")}
          </button>
        </div>
      </div>
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <TopBar />
        <div className="flex-1 overflow-y-auto bg-gradient-to-tr from-black via-[#0B101B] to-[#05080F] custom-scrollbar">
          <Routes>
            <Route path="/" element={<EmployeeDirectory t={t} />} />
            <Route path="recruitment" element={<div className="p-8 text-white"><h2 className="text-2xl font-black uppercase tracking-widest">Recruitment & Ops</h2></div>} />
            <Route path="payroll" element={<div className="p-8 text-white"><h2 className="text-2xl font-black uppercase tracking-widest">Payroll System</h2></div>} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

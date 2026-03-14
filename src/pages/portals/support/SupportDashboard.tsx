import React, { useState } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Headphones, LogOut, ChevronLeft, ChevronRight, Globe, User, Search, 
  MessageSquare, ShieldAlert, Plus, CheckCircle2, Ticket, AlertTriangle, 
  Clock, ExternalLink, Mail, Edit3
} from 'lucide-react';
import toast from 'react-hot-toast';

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
          <input type="text" placeholder={t("Search Ticket or Customer...", "လက်မှတ် သို့မဟုတ် ဖောက်သည် ရှာရန်...")} className="bg-black/50 border border-white/10 rounded-lg pl-9 pr-4 py-1.5 text-xs text-white focus:border-fuchsia-500 outline-none w-64" />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button onClick={() => langCtx.setLanguage && langCtx.setLanguage(currentLang === 'en' ? 'my' : 'en')} className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase hover:text-white px-3 py-1.5 rounded-lg bg-white/5 transition-all">
          <Globe size={14} /> {currentLang === 'en' ? 'MY' : 'EN'}
        </button>
        <div className="h-8 border-l border-white/10 mx-2"></div>
        <div className="flex items-center gap-3 p-1.5 rounded-xl transition-all cursor-pointer hover:bg-white/5">
          <div className="text-right hidden md:block">
            <div className="text-xs font-bold text-white uppercase tracking-tighter">{t("Support Agent", "ဝန်ဆောင်မှု ကိုယ်စားလှယ်")}</div>
            <div className="text-[9px] text-fuchsia-400 font-mono">CS-042</div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center border border-white/10">
            <Headphones size={18} className="text-white" />
          </div>
        </div>
      </div>
    </div>
  );
};

const TicketManager = ({ t }: { t: Function }) => {
  const [activeNote, setActiveNote] = useState('');

  const tickets = [
    { id: "TKT-1092", user: "Daw Su Su", subject: "Delay in Kamayut", status: "OPEN", priority: "HIGH" },
    { id: "TKT-1090", user: "Tech Store", subject: "Bulk upload error", status: "IN_PROGRESS", priority: "MEDIUM" },
    { id: "TKT-1085", user: "Ko Aung", subject: "Address change request", status: "CLOSED", priority: "LOW" },
  ];

  return (
    <div className="p-6 md:p-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-widest text-white mb-1">{t("Support Desk", "အကူအညီပေးရေး စင်တာ")}</h2>
          <p className="text-gray-400 text-xs mt-1">{t("Manage tickets, live chats, and shipment notes.", "လက်မှတ်များ၊ တိုက်ရိုက်စကားပြောဆိုမှုများကို စီမံပါ။")}</p>
        </div>
        <button className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-fuchsia-500/20 transition-all">
          <Plus size={16} /> {t("New Ticket", "လက်မှတ်သစ် ဖန်တီးမည်")}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Ticket List */}
        <div className="lg:col-span-7 bg-[#0A0E17] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-5 border-b border-white/5 bg-black/20 flex justify-between items-center">
            <h3 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2"><Ticket size={14} className="text-fuchsia-500"/> {t("Active Tickets", "လက်ရှိ လက်မှတ်များ")}</h3>
          </div>
          <div className="divide-y divide-white/5">
            {tickets.map((tk, i) => (
              <div key={i} className="p-5 hover:bg-white/5 transition-colors cursor-pointer group">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full ${tk.status === 'OPEN' ? 'bg-rose-500' : tk.status === 'IN_PROGRESS' ? 'bg-amber-500' : 'bg-gray-500'}`}></span>
                    <span className="font-mono text-xs font-bold text-fuchsia-400">{tk.id}</span>
                    <span className="text-sm font-bold text-white">{tk.subject}</span>
                  </div>
                  <span className={`px-2 py-1 rounded text-[9px] font-bold uppercase tracking-widest ${tk.priority === 'HIGH' ? 'bg-rose-500/10 text-rose-400' : 'bg-white/5 text-gray-400'}`}>{tk.priority}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500 pl-5">
                  <span className="flex items-center gap-1"><User size={12}/> {tk.user}</span>
                  <span className="flex items-center gap-1"><Clock size={12}/> 2 hrs ago</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Panel (From PDF instructions) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#0A0E17] border border-white/5 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2 mb-4">
              <Edit3 size={14} className="text-blue-500"/> {t("Add Tracking Note", "မှတ်ချက် ထည့်သွင်းရန်")}
            </h3>
            <div className="space-y-4">
              <input type="text" placeholder={t("Waybill ID (e.g. BR-123)", "အော်ဒါနံပါတ်")} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm text-white font-mono outline-none focus:border-fuchsia-500" />
              <textarea 
                rows={3} 
                value={activeNote}
                onChange={e => setActiveNote(e.target.value)}
                placeholder={t("Enter internal support note...", "အတွင်းပိုင်း မှတ်ချက် ရိုက်ထည့်ပါ...")} 
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-fuchsia-500 resize-none" 
              />
              <button onClick={() => {toast.success("Note appended to tracking timeline"); setActiveNote('');}} disabled={!activeNote.trim()} className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all">
                {t("Append Note", "မှတ်ချက် သိမ်းဆည်းမည်")}
              </button>
              <p className="text-[9px] text-gray-500 mt-2 italic">* Requires RLS: INSERT shipment_tracking for support role.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function SupportDashboard() {
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
    { name: t("Ticket Board", "လက်မှတ် စာရင်း"), path: "/portal/support", icon: <Ticket size={18} /> },
    { name: t("Live Chat Ops", "တိုက်ရိုက် စကားပြောခြင်း"), path: "/portal/support/chat", icon: <MessageSquare size={18} /> },
    { name: t("Email Gateway", "အီးမေးလ် စနစ်"), path: "/portal/support/email", icon: <Mail size={18} /> },
  ];

  return (
    <div className="flex h-screen bg-[#05080F] overflow-hidden font-sans text-slate-200">
      
      {/* 🧭 Sidebar */}
      <div className="w-72 bg-[#0A0E17] border-r border-white/5 flex flex-col justify-between flex-shrink-0 z-50">
        <div className="overflow-y-auto">
          <div className="p-8 flex items-center gap-4 border-b border-white/5">
            <div className="w-10 h-10 rounded-xl bg-fuchsia-600 flex items-center justify-center shadow-[0_0_15px_rgba(192,38,211,0.4)]">
              <Headphones size={20} className="text-white"/>
            </div>
            <span className="font-black text-white tracking-[0.2em] uppercase text-sm leading-tight">Support<br/><span className="text-fuchsia-400 text-[10px]">Operations</span></span>
          </div>
          
          <nav className="px-6 py-8 space-y-2">
            <div className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] mb-4 ml-2">{t("CS Modules", "CS မော်ဂျူးများ")}</div>
            {navItems.map((item) => {
              const isActive = item.path === '/portal/support' ? location.pathname === item.path : location.pathname.startsWith(item.path);
              return (
                <Link key={item.path} to={item.path} 
                  className={`flex items-center gap-4 px-4 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                    isActive ? "bg-fuchsia-600/10 text-fuchsia-400 border border-fuchsia-500/20 shadow-[0_0_20px_rgba(192,38,211,0.1)]" : "text-gray-500 hover:bg-white/5 hover:text-white"
                  }`}>
                  {item.icon} {item.name}
                </Link>
              );
            })}

            <div className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] mt-12 mb-4 ml-2">{t("Portal Jump", "ပေါ်တယ်သို့ သွားရန်")}</div>
            <Link to="/portal/admin" className="flex items-center justify-between px-4 py-2 text-[10px] font-bold text-gray-500 hover:text-white transition-all uppercase tracking-widest group">
              {t("Command Center", "ထိန်းချုပ်ရေးစင်တာ")} <ExternalLink size={12} className="opacity-0 group-hover:opacity-100" />
            </Link>
          </nav>
        </div>

        <div className="p-6">
          <button onClick={handleLogout} className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-rose-500 bg-rose-500/5 border border-rose-500/10 hover:bg-rose-500/20 transition-all">
            <ShieldAlert size={14} /> {t("Go Offline", "အကောင့်ထွက်မည်")}
          </button>
        </div>
      </div>

      {/* 🖥️ Main Routing Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <TopBar />
        <div className="flex-1 overflow-y-auto bg-gradient-to-tr from-black via-[#0B101B] to-[#05080F] custom-scrollbar">
          <Routes>
            <Route path="/" element={<TicketManager t={t} />} />
            <Route path="chat" element={<div className="p-8"><h2 className="text-2xl font-black text-white uppercase">{t("Live Chat Operations", "တိုက်ရိုက် စကားပြောခြင်း")}</h2></div>} />
            <Route path="email" element={<div className="p-8"><h2 className="text-2xl font-black text-white uppercase">{t("Email Gateway", "အီးမေးလ် စနစ်")}</h2></div>} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  ShieldCheck, Users, Activity, HardDrive, 
  ArrowRight, Clock, UserCheck, ShieldAlert 
} from 'lucide-react';

export default function SuperAdminDashboard() {
  const { user } = useAuth();
  const { lang } = useLanguage();
  const navigate = useNavigate();

  // Mock data for the dashboard metrics
  const stats = [
    { 
      title: lang === 'en' ? 'TOTAL PERSONNEL' : 'ဝန်ထမ်းစုစုပေါင်း', 
      value: '135', 
      icon: Users, 
      color: 'text-blue-500', 
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20'
    },
    { 
      title: lang === 'en' ? 'ACTIVE RIDERS' : 'တာဝန်ထမ်းဆောင်နေသော Rider များ', 
      value: '42', 
      icon: Activity, 
      color: 'text-emerald-500', 
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20'
    },
    { 
      title: lang === 'en' ? 'SECURITY LOGS' : 'လုံခြုံရေးမှတ်တမ်းများ', 
      value: '1,024', 
      icon: ShieldCheck, 
      color: 'text-amber-500', 
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20'
    },
    { 
      title: lang === 'en' ? 'SYSTEM HEALTH' : 'စနစ်ကျန်းမာရေး', 
      value: '100%', 
      icon: HardDrive, 
      color: 'text-purple-500', 
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20'
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded text-[10px] font-mono text-emerald-400 tracking-widest uppercase">
              {user?.role?.replace('_', ' ') || 'AUTHORIZED USER'}
            </div>
            <span className="text-xs font-mono text-slate-500 tracking-wider">
              {lang === 'en' ? 'SESSION ACTIVE' : 'စနစ်ဝင်ရောက်ထားပါသည်'}
            </span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-widest uppercase">
            {lang === 'en' ? 'Command Center' : 'စီမံခန့်ခွဲမှုစင်တာ'}
          </h1>
          <p className="text-sm text-slate-400 mt-1 font-mono">
            {user?.email}
          </p>
        </div>
        
        <div className="text-right">
          <p className="text-[10px] font-mono text-slate-500 tracking-widest uppercase">
            {lang === 'en' ? 'SYSTEM STATUS' : 'စနစ်အခြေအနေ'}
          </p>
          <div className="flex items-center gap-2 mt-1 justify-end">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono text-emerald-500 tracking-widest uppercase">ALL SYSTEMS NOMINAL</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className={`p-6 rounded-2xl bg-[#0B101B] border ${stat.border} flex flex-col justify-between relative overflow-hidden group`}>
              <div className="absolute -right-6 -top-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <Icon size={100} />
              </div>
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                  <Icon size={20} />
                </div>
              </div>
              <div>
                <h3 className="text-3xl font-black text-white mb-1">{stat.value}</h3>
                <p className="text-[10px] font-mono text-slate-400 tracking-widest uppercase">{stat.title}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions & Audit Logs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Quick Actions */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-black text-white tracking-widest uppercase flex items-center gap-2">
            <Activity size={16} className="text-emerald-500" />
            {lang === 'en' ? 'Quick Actions' : 'အမြန်လုပ်ဆောင်ရန်များ'}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button 
              onClick={() => navigate('/admin/accounts')}
              className="p-6 rounded-2xl bg-[#111622] border border-white/5 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all group text-left flex flex-col"
            >
              <UserCheck className="text-blue-500 mb-4" size={24} />
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                {lang === 'en' ? 'Account Control' : 'အကောင့်စီမံခန့်ခွဲမှု'}
              </h3>
              <p className="text-xs text-slate-500 mb-4 font-mono leading-relaxed">
                {lang === 'en' ? 'Manage personnel clearances, roles, and system access levels.' : 'ဝန်ထမ်းများ၏ ရာထူးနှင့် လုပ်ပိုင်ခွင့်များကို စီမံပါ။'}
              </p>
              <div className="mt-auto flex items-center gap-2 text-[10px] font-mono tracking-widest text-blue-500 uppercase">
                {lang === 'en' ? 'Launch Module' : 'ဝင်ရောက်မည်'} <ArrowRight size={12} />
              </div>
            </button>

            <button 
              onClick={() => navigate('/admin/hr')}
              className="p-6 rounded-2xl bg-[#111622] border border-white/5 hover:border-purple-500/30 hover:bg-purple-500/5 transition-all group text-left flex flex-col"
            >
              <Users className="text-purple-500 mb-4" size={24} />
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
                {lang === 'en' ? 'HR Portal' : 'လူ့စွမ်းအားအရင်းအမြစ်'}
              </h3>
              <p className="text-xs text-slate-500 mb-4 font-mono leading-relaxed">
                {lang === 'en' ? 'Review employee records, shifts, and departmental assignments.' : 'ဝန်ထမ်းမှတ်တမ်းများနှင့် အလုပ်ချိန်များကို စစ်ဆေးပါ။'}
              </p>
              <div className="mt-auto flex items-center gap-2 text-[10px] font-mono tracking-widest text-purple-500 uppercase">
                {lang === 'en' ? 'Launch Module' : 'ဝင်ရောက်မည်'} <ArrowRight size={12} />
              </div>
            </button>
          </div>
        </div>

        {/* Security Audit Feed Preview */}
        <div className="space-y-4">
          <h2 className="text-sm font-black text-white tracking-widest uppercase flex items-center gap-2">
            <ShieldAlert size={16} className="text-amber-500" />
            {lang === 'en' ? 'Live Audit Feed' : 'လုံခြုံရေးမှတ်တမ်းများ'}
          </h2>
          
          <div className="bg-[#0B101B] border border-white/5 rounded-2xl p-4 space-y-4 h-[280px] overflow-y-auto custom-scrollbar">
            
            <div className="flex gap-3 items-start border-b border-white/5 pb-3">
              <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-500 mt-0.5">
                <Clock size={12} />
              </div>
              <div>
                <p className="text-xs text-slate-300 font-mono">SYSTEM_LOGIN_SUCCESS</p>
                <p className="text-[10px] text-slate-500 font-mono mt-1">{user?.email}</p>
                <p className="text-[9px] text-emerald-500/70 font-mono mt-1 uppercase tracking-wider">Just now</p>
              </div>
            </div>

            <div className="flex gap-3 items-start border-b border-white/5 pb-3">
              <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-500 mt-0.5">
                <KeyRound size={12} />
              </div>
              <div>
                <p className="text-xs text-slate-300 font-mono">PASSWORD_ROTATION</p>
                <p className="text-[10px] text-slate-500 font-mono mt-1">user_id: {user?.id?.substring(0, 8)}...</p>
                <p className="text-[9px] text-amber-500/70 font-mono mt-1 uppercase tracking-wider">2 mins ago</p>
              </div>
            </div>

            <div className="flex gap-3 items-start border-b border-white/5 pb-3 opacity-50">
              <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-500 mt-0.5">
                <ShieldCheck size={12} />
              </div>
              <div>
                <p className="text-xs text-slate-300 font-mono">SECURE_SESSION_INIT</p>
                <p className="text-[10px] text-slate-500 font-mono mt-1">Gateway: Vercel Edge</p>
                <p className="text-[9px] text-blue-500/70 font-mono mt-1 uppercase tracking-wider">5 mins ago</p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

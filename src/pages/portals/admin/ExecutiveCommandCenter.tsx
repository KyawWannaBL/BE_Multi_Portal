import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import { 
  Globe, ShieldCheck, Activity, Users, 
  Database, ShieldAlert, Key, Terminal, 
  ArrowRight, DollarSign, LineChart
} from 'lucide-react';

export default function ExecutiveCommandCenter() {
  const navigate = useNavigate();
  const { lang, toggleLang } = useLanguage();
  const t = (en: string, my: string) => (lang === 'en' ? en : my);

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#05080F] text-slate-200 font-sans selection:bg-[#D4AF37]/30 pb-10">
      
      {/* 👑 Executive App Bar */}
      <header className="sticky top-0 z-50 bg-[#05080F]/90 backdrop-blur-xl border-b border-[#D4AF37]/20 px-8 py-5 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#1A1500] border border-[#D4AF37]/30 shadow-[0_0_15px_rgba(212,175,55,0.2)] flex items-center justify-center">
            <ShieldCheck className="h-6 w-6 text-[#D4AF37]" />
          </div>
          <div>
            <h1 className="text-sm font-black text-white tracking-widest uppercase drop-shadow-md">
              {t('Executive Command', 'အထွေထွေအုပ်ချုပ်မှုဗဟို')}
            </h1>
            <p className="text-[10px] text-[#D4AF37] tracking-[0.2em] uppercase font-bold">
              {t('God Mode Active', 'အမြင့်ဆုံးလုပ်ပိုင်ခွင့်စနစ်')} • {currentTime.toLocaleTimeString()}
            </p>
          </div>
        </div>
        
        <button 
          onClick={toggleLang} 
          className="flex items-center gap-2 px-4 py-2 bg-[#0E1525] border border-white/5 text-gray-400 hover:text-white rounded-full transition-colors"
        >
          <Globe className="h-4 w-4" />
          <span className="text-[10px] font-black tracking-widest uppercase">{lang === 'en' ? 'MY' : 'EN'}</span>
        </button>
      </header>

      <main className="p-8 max-w-7xl mx-auto space-y-8 mt-4">
        
        {/* 📊 High-Level Executive KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="bg-gradient-to-br from-[#1A1500] to-[#0A0F1C] border border-[#D4AF37]/30 rounded-[2rem] p-6 flex items-center gap-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10"><DollarSign className="h-24 w-24 text-[#D4AF37]" /></div>
            <div className="p-4 bg-[#D4AF37]/10 rounded-2xl relative z-10"><DollarSign className="h-8 w-8 text-[#D4AF37]" /></div>
            <div className="relative z-10">
              <p className="text-[10px] font-bold tracking-widest text-[#D4AF37]/70 uppercase">{t('Today Revenue', 'ယနေ့ဝင်ငွေ')}</p>
              <h3 className="text-2xl font-black text-white mt-1">4.2M MMK</h3>
            </div>
          </Card>

          <Card className="bg-[#0E1525] border border-white/5 rounded-[2rem] p-6 flex items-center gap-5 hover:border-emerald-500/30 transition-colors">
            <div className="p-4 bg-emerald-500/10 rounded-2xl"><Activity className="h-8 w-8 text-emerald-500" /></div>
            <div>
              <p className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">{t('System Health', 'စနစ်ကျန်းမာရေး')}</p>
              <h3 className="text-2xl font-black text-emerald-400 mt-1">99.98%</h3>
            </div>
          </Card>

          <Card className="bg-[#0E1525] border border-white/5 rounded-[2rem] p-6 flex items-center gap-5 hover:border-blue-500/30 transition-colors">
            <div className="p-4 bg-blue-500/10 rounded-2xl"><Users className="h-8 w-8 text-blue-500" /></div>
            <div>
              <p className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">{t('Active Users', 'အသုံးပြုသူများ')}</p>
              <h3 className="text-2xl font-black text-white mt-1">1,204</h3>
            </div>
          </Card>

          <Card className="bg-[#0E1525] border border-white/5 rounded-[2rem] p-6 flex items-center gap-5 hover:border-rose-500/30 transition-colors">
            <div className="p-4 bg-rose-500/10 rounded-2xl"><ShieldAlert className="h-8 w-8 text-rose-500" /></div>
            <div>
              <p className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">{t('Security Alerts', 'လုံခြုံရေးသတိပေးချက်')}</p>
              <h3 className="text-2xl font-black text-rose-400 mt-1">0</h3>
            </div>
          </Card>
        </div>

        {/* 🎛️ Administration Modules Grid */}
        <div>
          <h2 className="text-xs font-black tracking-widest text-[#D4AF37] uppercase mb-4 px-2 flex items-center gap-2">
            <Key className="h-4 w-4" /> {t('Access & Control Modules', 'စီမံခန့်ခွဲမှုစနစ်များ')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-5 duration-500 delay-100">
            
            {/* Account Control */}
            <Card onClick={() => navigate('/portal/admin/accounts')} className="bg-[#0A0F1C] border border-white/5 hover:border-[#D4AF37]/50 p-8 rounded-[2rem] cursor-pointer group transition-all">
              <div className="flex justify-between items-start mb-6">
                <div className="p-4 bg-[#D4AF37]/10 rounded-2xl group-hover:scale-110 transition-transform"><Users className="h-8 w-8 text-[#D4AF37]" /></div>
                <ArrowRight className="h-6 w-6 text-gray-600 group-hover:text-[#D4AF37] transition-colors" />
              </div>
              <h3 className="text-lg font-black text-white uppercase tracking-wider mb-2">{t('Account Control', 'အကောင့်များစီမံရန်')}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{t('Manage user profiles, reset passwords, and lock compromised accounts.', 'အသုံးပြုသူများကိုစီမံခြင်း၊ စကားဝှက်ပြောင်းခြင်းနှင့် အကောင့်ပိတ်ခြင်း။')}</p>
            </Card>

            {/* Permission Assignment */}
            <Card onClick={() => navigate('/portal/admin/permission-assignment')} className="bg-[#0A0F1C] border border-white/5 hover:border-indigo-500/50 p-8 rounded-[2rem] cursor-pointer group transition-all">
              <div className="flex justify-between items-start mb-6">
                <div className="p-4 bg-indigo-500/10 rounded-2xl group-hover:scale-110 transition-transform"><Key className="h-8 w-8 text-indigo-400" /></div>
                <ArrowRight className="h-6 w-6 text-gray-600 group-hover:text-indigo-400 transition-colors" />
              </div>
              <h3 className="text-lg font-black text-white uppercase tracking-wider mb-2">{t('Permissions & RBAC', 'လုပ်ပိုင်ခွင့်များသတ်မှတ်ရန်')}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{t('Configure roles, access levels, and gateway routing rules.', 'ရာထူးအဆင့်များနှင့် ဝင်ရောက်ခွင့်များကို သတ်မှတ်ပါ။')}</p>
            </Card>

            {/* Audit Logs */}
            <Card onClick={() => navigate('/portal/admin/audit')} className="bg-[#0A0F1C] border border-white/5 hover:border-blue-500/50 p-8 rounded-[2rem] cursor-pointer group transition-all">
              <div className="flex justify-between items-start mb-6">
                <div className="p-4 bg-blue-500/10 rounded-2xl group-hover:scale-110 transition-transform"><Database className="h-8 w-8 text-blue-500" /></div>
                <ArrowRight className="h-6 w-6 text-gray-600 group-hover:text-blue-500 transition-colors" />
              </div>
              <h3 className="text-lg font-black text-white uppercase tracking-wider mb-2">{t('System Audit Logs', 'လုပ်ဆောင်ချက်မှတ်တမ်းများ')}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{t('View immutable logs of all system activities, logins, and data mutations.', 'စနစ်အတွင်း လုပ်ဆောင်ချက်အားလုံးကို စစ်ဆေးပါ။')}</p>
            </Card>

            {/* Diagnostics (Legacy Sys) */}
            <Card onClick={() => navigate('/diag')} className="bg-[#0A0F1C] border border-white/5 hover:border-emerald-500/50 p-8 rounded-[2rem] cursor-pointer group transition-all">
              <div className="flex justify-between items-start mb-6">
                <div className="p-4 bg-emerald-500/10 rounded-2xl group-hover:scale-110 transition-transform"><Terminal className="h-8 w-8 text-emerald-500" /></div>
                <ArrowRight className="h-6 w-6 text-gray-600 group-hover:text-emerald-500 transition-colors" />
              </div>
              <h3 className="text-lg font-black text-white uppercase tracking-wider mb-2">{t('System Diagnostics', 'စနစ်စစ်ဆေးမှု')}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{t('Run database checks, view connection latency, and verify Supabase config.', 'ဒေတာဘေ့စ်နှင့် စနစ်ချိတ်ဆက်မှုများကို စစ်ဆေးပါ။')}</p>
            </Card>

            {/* Global Analytics */}
            <Card onClick={() => navigate('/portal/admin/dashboard')} className="bg-[#0A0F1C] border border-white/5 hover:border-amber-500/50 p-8 rounded-[2rem] cursor-pointer group transition-all">
              <div className="flex justify-between items-start mb-6">
                <div className="p-4 bg-amber-500/10 rounded-2xl group-hover:scale-110 transition-transform"><LineChart className="h-8 w-8 text-amber-500" /></div>
                <ArrowRight className="h-6 w-6 text-gray-600 group-hover:text-amber-500 transition-colors" />
              </div>
              <h3 className="text-lg font-black text-white uppercase tracking-wider mb-2">{t('Global Analytics', 'အထွေထွေစာရင်းများ')}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{t('Master dashboard for high-level business intelligence and reporting.', 'စီးပွားရေးဆိုင်ရာ အစီရင်ခံစာများနှင့် စာရင်းများ။')}</p>
            </Card>

          </div>
        </div>
      </main>
    </div>
  );
}

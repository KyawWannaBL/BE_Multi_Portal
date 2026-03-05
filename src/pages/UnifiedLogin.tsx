import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, User, Globe, ShieldCheck, ChevronRight } from 'lucide-react';

export default function UnifiedLogin() {
  const { lang, toggleLang } = useLanguage();
  const navigate = useNavigate();
  const [role, setRole] = useState('L5_OWNER');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const routes: Record<string, string> = {
      'L5_OWNER': '/admin/dashboard',
      'L4_MARKETING': '/marketing/portal',
      'L3_FINANCE': '/finance/core',
      'L3_BRANCH': '/branch/portal',
      'L2_WAREHOUSE': '/warehouse/dashboard',
      'L1_SUPPORT': '/support/hub'
    };
    navigate(routes[role] || '/admin/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#0B101B] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <Card className="w-full max-w-lg bg-[#05080F] border-none ring-1 ring-white/5 rounded-[4rem] p-16 space-y-10 shadow-2xl relative z-10">
        <div className="text-center space-y-4">
           <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
              <ShieldCheck className="h-10 w-10 text-emerald-500" />
           </div>
           <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">Britium <span className="text-emerald-500">Sovereign</span></h1>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
           <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Portal Authority</label>
              <select 
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full h-16 bg-[#0B101B] border border-white/10 rounded-3xl px-8 text-white font-black uppercase tracking-widest outline-none focus:border-emerald-500"
              >
                 <option value="L5_OWNER">L5 System Owner</option>
                 <option value="L4_MARKETING">L4 Marketing Dept</option>
                 <option value="L3_FINANCE">L3 Finance Dept</option>
                 <option value="L3_BRANCH">L3 ရုံးခွဲ စီမံခန့်ခွဲသူ</option>
                 <option value="L2_WAREHOUSE">L2 Warehouse Hub</option>
                 <option value="L1_SUPPORT">L1 Support Agent</option>
              </select>
           </div>
           <Button type="submit" className="w-full h-20 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-[2.5rem] text-xl uppercase tracking-widest">
              {lang === 'en' ? 'Authorize' : 'ဝင်ရောက်မည်'} <ChevronRight className="ml-2" />
           </Button>
        </form>
      </Card>
    </div>
  );
}

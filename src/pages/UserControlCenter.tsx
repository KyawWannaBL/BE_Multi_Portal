import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, ShieldCheck, Search, Headset, Calculator, Warehouse, 
  MapPin, Globe, ShieldAlert, Key, Lock, Truck, UserCheck, 
  Database, Zap, Briefcase, Store 
} from 'lucide-react';

export default function UserControlCenter() {
  const navigate = useNavigate();
  const { toggleLang, lang } = useLanguage();
  const [activeTab, setActiveTab] = useState('active');

  // L5 Departmental Surveillance Mapping for ALL roles
  const departments = [
    { titleEn: "Executive", titleMy: "အမှုဆောင်အရာရှိချုပ်", roles: ["APP_OWNER", "SUPER_ADMIN"], icon: ShieldCheck, color: "text-emerald-500", bg: "bg-emerald-500/10", path: "/admin/matrix" },
    { titleEn: "Operations", titleMy: "လုပ်ငန်းလည်ပတ်မှု", roles: ["OPERATIONS_ADMIN", "SUPERVISOR"], icon: UserCheck, color: "text-indigo-400", bg: "bg-indigo-500/10", path: "/admin/fleet" },
    { titleEn: "Branch Mgmt", titleMy: "ရုံးခွဲစီမံခန့်ခွဲမှု", roles: ["BRANCH_MANAGER", "SUBSTATION_MANAGER"], icon: MapPin, color: "text-cyan-400", bg: "bg-cyan-500/10", path: "/admin/branch" },
    { titleEn: "Finance Hub", titleMy: "ဘဏ္ဍာရေးဗဟိုဌာန", roles: ["FINANCE_USER", "FINANCE_STAFF"], icon: Calculator, color: "text-emerald-400", bg: "bg-emerald-500/10", path: "/admin/finance" },
    { titleEn: "Logistics Ops", titleMy: "ပို့ဆောင်ရေးနှင့်ဂိုဒေါင်", roles: ["WH_MANAGER", "DATA_ENTRY", "STAFF"], icon: Warehouse, color: "text-amber-400", bg: "bg-amber-500/10", path: "/admin/shipments" },
    { titleEn: "Field Force", titleMy: "နယ်ပယ်ဝန်ထမ်းများ", roles: ["RIDER", "DRIVER", "HELPER"], icon: Truck, color: "text-sky-400", bg: "bg-sky-500/10", path: "/admin/fleet" },
    { titleEn: "Support", titleMy: "ဖောက်သည်ဝန်ဆောင်မှု", roles: ["CUSTOMER_SERVICE"], icon: Headset, color: "text-rose-400", bg: "bg-rose-500/10", path: "/admin/cs" },
    { titleEn: "Administration", titleMy: "အထွေထွေစီမံခန့်ခွဲမှု", roles: ["HR_ADMIN", "MARKETING_ADMIN"], icon: Briefcase, color: "text-purple-400", bg: "bg-purple-500/10", path: "/admin/settings" }
  ];

  return (
    <div className="p-10 space-y-10 bg-[#0B101B] min-h-screen text-slate-300">
      {/* Header Section (ခေါင်းစဉ်အပိုင်း) */}
      <div className="flex justify-between items-center bg-[#05080F] p-10 rounded-[3rem] border border-white/5 shadow-2xl">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20"><Users className="h-8 w-8 text-emerald-500" /></div>
          <div>
            <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">
              {lang === 'en' ? 'Sovereign Control' : 'အုပ်ချုပ်မှုဗဟိုဌာန'}
            </h1>
            <p className="text-emerald-500 font-mono text-xs mt-1 uppercase tracking-widest">
              L5_DEPARTMENTAL_SURVEILLANCE • {lang === 'en' ? 'ALL_BRANCHES_ACTIVE' : 'ရုံးခွဲအားလုံး_စောင့်ကြည့်မှု'}
            </p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="relative w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input className="w-full bg-[#0B101B] border border-white/10 rounded-full h-12 pl-12 pr-6 text-sm" placeholder="Search ID, Role or Branch..." />
          </div>
          <Button onClick={toggleLang} className="bg-white/5 border border-white/10 text-white h-12 px-6 rounded-xl">
            <Globe className="mr-2 h-4 w-4" /> {lang === 'en' ? "MY" : "EN"}
          </Button>
        </div>
      </div>

      {/* Surveillance Grid (ဌာနအလိုက် စောင့်ကြည့်မှုများ) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {departments.map((dept, i) => (
          <Card key={i} className="bg-[#05080F] border-none ring-1 ring-white/5 rounded-[2.5rem] overflow-hidden group hover:ring-emerald-500/50 transition-all">
            <CardContent className="p-8 space-y-4">
              <div className={`p-4 rounded-2xl w-fit ${dept.bg}`}><dept.icon className={`h-6 w-6 ${dept.color}`} /></div>
              <h3 className="text-white font-black text-lg uppercase italic">{lang === 'en' ? dept.titleEn : dept.titleMy}</h3>
              <p className="text-[9px] text-slate-500 font-mono leading-tight">{dept.roles.join(' • ')}</p>
              <div className="flex gap-2 pt-4 border-t border-white/5">
                <button onClick={() => navigate(dept.path)} className={`ml-auto text-[10px] font-black ${dept.color} uppercase tracking-widest flex items-center gap-1`}>
                  {lang === 'en' ? 'LAUNCH PORTAL' : 'ပေါ်တယ်ဖွင့်ရန်'} <Zap size={10} />
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Account Authority Registry (အကောင့်များနှင့် လုပ်ပိုင်ခွင့်များ စီမံခန့်ခွဲမှု) */}
      <div className="space-y-6">
        <div className="flex gap-4">
          <Button onClick={() => setActiveTab('active')} className={`h-14 px-10 rounded-2xl font-black ${activeTab === 'active' ? 'bg-emerald-600 text-white' : 'bg-white/5 text-slate-500'}`}>
            {lang === 'en' ? 'Active Personnel' : 'လက်ရှိဝန်ထမ်းများ'}
          </Button>
          <Button onClick={() => setActiveTab('pending')} className={`h-14 px-10 rounded-2xl font-black ${activeTab === 'pending' ? 'bg-emerald-600 text-white' : 'bg-white/5 text-slate-500'}`}>
            {lang === 'en' ? 'Pending Approvals' : 'စောင့်ဆိုင်းဆဲအကောင့်များ'}
          </Button>
        </div>

        <Card className="bg-[#05080F] border-none ring-1 ring-white/5 rounded-[3rem] overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 font-mono text-slate-500 uppercase text-[10px] tracking-widest">
              <tr>
                <th className="p-8">{lang === 'en' ? 'Identity / Branch' : 'အချက်အလက် / ရုံးခွဲ'}</th>
                <th className="p-8">{lang === 'en' ? 'Authority Role' : 'လုပ်ပိုင်ခွင့်အဆင့်'}</th>
                <th className="p-8">{lang === 'en' ? 'Security status' : 'လုံခြုံရေးအခြေအနေ'}</th>
                <th className="p-8 text-right">{lang === 'en' ? 'L5 Overrides' : 'စီမံခန့်ခွဲမှု'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white/80">
              <tr className="hover:bg-white/5 transition-all">
                <td className="p-8">
                  <p className="font-bold text-white">Kyaw Kyaw (Mandalay Hub)</p>
                  <p className="text-[10px] text-slate-500 font-mono">BRANCH_MANAGER • MDY-001</p>
                </td>
                <td className="p-8"><span className="bg-cyan-500/10 text-cyan-400 px-3 py-1 rounded-full text-[10px] font-black uppercase">L3_MANAGER</span></td>
                <td className="p-8 text-emerald-500 font-black text-[10px] tracking-widest uppercase">Verified</td>
                <td className="p-8 text-right flex gap-2 justify-end">
                   <Button variant="outline" className="h-10 border-white/10 text-slate-400 hover:text-white rounded-xl"><Key size={14} className="mr-2"/> PW</Button>
                   <Button variant="outline" className="h-10 border-rose-500/20 text-rose-500 hover:bg-rose-500/10 rounded-xl"><Lock size={14} className="mr-2"/> BLOCK</Button>
                </td>
              </tr>
            </tbody>
          </table>
          <div className="p-20 text-center opacity-10 border-t border-white/5">
              <Database size={48} className="mx-auto mb-4 text-emerald-500" />
              <p className="font-black uppercase tracking-[0.4em]">Identity Ledger Secured</p>
          </div>
        </Card>
      </div>
    </div>
  );
}

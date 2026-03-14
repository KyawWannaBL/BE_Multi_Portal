import React, { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, Landmark, Map, Settings, ShieldCheck, LogOut, ChevronRight, Globe, ChevronLeft, PackageSearch, Truck } from 'lucide-react';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [lang, setLang] = useState('EN');

  const menuItems = [
    { id: 'dash', path: '/admin/dashboard', icon: <LayoutDashboard />, label: lang === 'EN' ? 'Executive Overview' : 'အမှုဆောင် ခြုံငုံသုံးသပ်ချက်' },
    { id: 'user', path: '/admin/approvals', icon: <ShieldCheck />, label: lang === 'EN' ? 'Account Approvals' : 'အကောင့်အတည်ပြုချက်များ' },
    { id: 'ship', path: '/admin/shipments', icon: <PackageSearch />, label: lang === 'EN' ? 'Shipment Control' : 'ပို့ဆောင်မှု ထိန်းချုပ်ရေး' },
    { id: 'fleet', path: '/admin/fleet', icon: <Truck />, label: lang === 'EN' ? 'Fleet Command' : 'ယာဉ်တန်း ကွပ်ကဲမှု' },
    { id: 'fin', path: '/admin/omni-finance', icon: <Landmark />, label: lang === 'EN' ? 'Global Finance' : 'ကမ္ဘာလုံးဆိုင်ရာ ဘဏ္ဍာရေး' },
    { id: 'map', path: '/admin/live-map', icon: <Map />, label: lang === 'EN' ? 'Live Telemetry' : 'တိုက်ရိုက်မြေပုံ' },
    { id: 'sets', path: '/admin/settings', icon: <Settings />, label: lang === 'EN' ? 'System Tariffs' : 'စနစ် သတ်မှတ်ချက်များ' },
  ];

  return (
    <div className="flex h-screen bg-[#0B101B] overflow-hidden font-sans text-slate-300">
      <aside className="w-80 bg-[#05080F]/80 backdrop-blur-xl border-r border-white/5 flex flex-col p-8 z-20">
        <div className="mb-12 flex items-center gap-3">
          <div className="h-10 w-10 bg-emerald-500 rounded-xl flex items-center justify-center"><ShieldCheck className="text-white" /></div>
          <span className="text-xl font-black text-white uppercase">Britium <span className="text-emerald-500">L5</span></span>
        </div>
        <nav className="flex-1 space-y-2 overflow-y-auto pr-2">
          {menuItems.map((item) => (
            <button key={item.id} onClick={() => navigate(item.path)} className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all group ${location.pathname === item.path ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-500 hover:bg-white/5 hover:text-white'}`}>
              <div className="flex items-center gap-4 text-sm font-bold"><span className={location.pathname === item.path ? 'text-emerald-400' : 'group-hover:text-emerald-500'}>{item.icon}</span>{item.label}</div>
            </button>
          ))}
        </nav>
      </aside>
      <main className="flex-1 flex flex-col relative overflow-hidden">
        <header className="h-20 bg-[#05080F]/50 backdrop-blur-md border-b border-white/5 flex items-center justify-end px-10 z-10">
          <button onClick={() => setLang(lang === 'EN' ? 'MY' : 'EN')} className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-bold text-white transition-all"><Globe className="h-4 w-4 text-emerald-500" /> {lang === 'EN' ? 'EN / MY' : 'မြန်မာ / EN'}</button>
        </header>
        <div className="flex-1 overflow-y-auto p-10"><Outlet context={{ lang }} /></div>
      </main>
    </div>
  );
}

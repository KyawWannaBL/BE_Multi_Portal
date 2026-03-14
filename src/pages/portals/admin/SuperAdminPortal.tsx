import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import UserProfileWidget from '@/components/ui/UserProfileWidget';
import { 
  ShieldAlert, Activity, Truck, Building2, 
  Wallet, Store, Users, ArrowRight 
} from 'lucide-react';

export default function SuperAdminPortal() {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const t = (en: string, my: string) => (lang === 'en' ? en : my);

  const portals = [
    { name: "Operations", path: "/portal/operations", color: "bg-blue-600", icon: <Activity /> },
    { name: "Execution", path: "/portal/execution", color: "bg-emerald-600", icon: <Truck /> },
    { name: "Warehouse", path: "/portal/warehouse", color: "bg-orange-600", icon: <Building2 /> },
    { name: "Finance", path: "/portal/finance", color: "bg-teal-600", icon: <Wallet /> },
    { name: "Merchant", path: "/portal/merchant", color: "bg-indigo-600", icon: <Store /> },
    { name: "HR & Admin", path: "/portal/hr", color: "bg-violet-600", icon: <Users /> },
  ];

  return (
    <div className="min-h-screen bg-[#05080F] p-6">
      <header className="flex items-center gap-3 mb-8">
        <ShieldAlert className="h-8 w-8 text-amber-500" />
        <h1 className="text-2xl font-black text-white uppercase tracking-widest">Master Command Center</h1>
      </header>

      <UserProfileWidget />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {portals.map((p) => (
          <button 
            key={p.path}
            onClick={() => navigate(p.path)}
            className="group relative overflow-hidden bg-[#0E1525] border border-white/5 p-8 rounded-[2rem] text-left transition-all hover:border-amber-500/50 hover:scale-[1.02]"
          >
            <div className={`w-12 h-12 ${p.color} rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
              {React.cloneElement(p.icon as React.ReactElement, { className: "h-6 w-6 text-white" })}
            </div>
            <h3 className="text-xl font-black text-white uppercase">{p.name}</h3>
            <p className="text-xs text-gray-500 mt-2 flex items-center gap-2">
              Enter Portal <ArrowRight className="h-3 w-3" />
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

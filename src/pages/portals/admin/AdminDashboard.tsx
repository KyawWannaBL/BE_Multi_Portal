import React from 'react';
import { AdminShell } from '@/components/layout/AdminShell';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, ShieldCheck, Map, 
  Truck, Users, DollarSign 
} from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();

  const portals = [
    { name: 'Financials & KPIs', path: '/portal/admin/analytics', icon: <BarChart3 />, color: 'bg-emerald-500' },
    { name: 'National Tariffs', path: '/portal/admin/tariffs', icon: <DollarSign />, color: 'bg-blue-500' },
    { name: 'Route Optimizer', path: '/portal/admin/route-optimizer', icon: <Map />, color: 'bg-amber-500' },
    { name: 'Support Tickets', path: '/portal/admin/support', icon: <ShieldCheck />, color: 'bg-rose-500' },
    { name: 'Partner Wallets', path: '/portal/admin/partners', icon: <Users />, color: 'bg-indigo-500' },
    { name: 'Fleet Monitoring', path: '/portal/operations/logistics-monitoring', icon: <Truck />, color: 'bg-teal-500' },
  ];

  return (
    <AdminShell title="Super-Admin Gateway">
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="bg-gradient-to-r from-blue-600/20 to-transparent border border-blue-500/20 p-10 rounded-[3rem] shadow-2xl">
           <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Welcome back, Super-Admin</h2>
           <p className="text-xs text-blue-400 font-bold uppercase tracking-[0.3em] mt-2">Operational Integrity: 100% SECURE</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portals.map((p, idx) => (
            <div 
              key={idx}
              onClick={() => navigate(p.path)}
              className="bg-[#0E1525] border border-white/5 p-8 rounded-[2.5rem] hover:border-white/20 transition-all cursor-pointer group relative overflow-hidden"
            >
              <div className={`w-12 h-12 ${p.color} text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                {React.cloneElement(p.icon as React.ReactElement, { size: 24 })}
              </div>
              <h3 className="text-lg font-black text-white uppercase tracking-wider">{p.name}</h3>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Access System Control</p>
              <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                {React.cloneElement(p.icon as React.ReactElement, { size: 100 })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}

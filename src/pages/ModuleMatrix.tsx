import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { 
  ShieldCheck, Map, Users, Warehouse, MapPin, 
  Headset, Calculator, TrendingUp, Keyboard, Eye,
  LayoutDashboard, Truck, Settings, DollarSign
} from 'lucide-react';

export default function ModuleMatrix() {
  const navigate = useNavigate();

  const moduleGroups = [
    {
      title: "L5 Executive Command",
      color: "text-rose-500",
      bg: "bg-rose-500/10",
      modules: [
        { name: "Live Surveillance", path: "/admin/surveillance", icon: Map },
        { name: "Executive Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
        { name: "Identity Control (RBAC)", path: "/admin/identity", icon: ShieldCheck },
        { name: "User Directory", path: "/admin/directory", icon: Users },
        { name: "Merchant Provisioning", path: "/admin/provisioning", icon: DollarSign },
        { name: "System Settings", path: "/admin/settings", icon: Settings },
      ]
    },
    {
      title: "L4 Hub & Regional Management",
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      modules: [
        { name: "HQ Warehouse (Shipments)", path: "/admin/shipments", icon: Warehouse },
        { name: "Office Branch Operations", path: "/admin/branch", icon: MapPin },
        { name: "Fleet Command", path: "/admin/fleet", icon: Truck },
        { name: "Supervisor Desk", path: "/admin/supervisor", icon: Eye },
      ]
    },
    {
      title: "L1/L2 Departmental Portals",
      color: "text-sky-400",
      bg: "bg-sky-400/10",
      modules: [
        { name: "Customer Service (CS)", path: "/admin/cs", icon: Headset },
        { name: "Customer Directory", path: "/admin/customers", icon: Users },
        { name: "Accountant Hub", path: "/admin/finance-ops", icon: Calculator },
        { name: "Marketing Analytics", path: "/admin/marketing", icon: TrendingUp },
        { name: "Data Entry Hub", path: "/admin/data-entry", icon: Keyboard },
      ]
    }
  ];

  return (
    <div className="p-10 space-y-12 bg-[#0B101B] min-h-screen text-slate-300">
      <div className="bg-[#05080F] p-10 rounded-[3rem] border border-white/5 shadow-2xl">
        <h1 className="text-4xl font-black uppercase text-white">System Matrix</h1>
        <p className="text-emerald-500 font-mono text-xs mt-2 tracking-widest uppercase">
          L5_SYS_ADMIN • GLOBAL NAVIGATION ACTIVE
        </p>
      </div>

      <div className="space-y-10">
        {moduleGroups.map((group, index) => (
          <div key={index} className="space-y-6">
            <h2 className={`text-xl font-black uppercase tracking-widest ${group.color} border-b border-white/5 pb-4`}>
              {group.title}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {group.modules.map((mod, i) => {
                const Icon = mod.icon;
                return (
                  <Card 
                    key={i} 
                    onClick={() => navigate(mod.path)}
                    className="bg-[#05080F] border-none ring-1 ring-white/5 hover:ring-white/20 transition-all cursor-pointer group rounded-[1.5rem]"
                  >
                    <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                      <div className={`p-4 rounded-2xl ${group.bg} group-hover:scale-110 transition-transform`}>
                        <Icon className={`h-8 w-8 ${group.color}`} />
                      </div>
                      <span className="font-bold text-white text-sm">{mod.name}</span>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import React from 'react';
import { FleetShell } from '@/components/layout/FleetShell';
import { Truck, Fuel, Wrench, Activity, AlertTriangle } from 'lucide-react';

export default function FleetDashboard() {
  const vehicles = [
    { plate: 'YGN/1234', type: '12-Wheeler', health: 92, status: 'ACTIVE', fuel: '7.2 km/L' },
    { plate: 'MDY/5678', type: '6-Wheeler', health: 45, status: 'MAINTENANCE_REQ', fuel: '9.1 km/L' },
    { plate: 'NPW/9012', type: 'Van', health: 88, status: 'ACTIVE', fuel: '12.5 km/L' },
  ];

  return (
    <FleetShell title="Fleet Control Center">
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#0E1525] border border-white/5 p-6 rounded-[2rem]">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Total Fleet</p>
            <h2 className="text-3xl font-black text-white mt-2">24 Units</h2>
          </div>
          <div className="bg-[#0E1525] border border-rose-500/20 p-6 rounded-[2rem]">
            <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Urgent Repairs</p>
            <h2 className="text-3xl font-black text-white mt-2">3 Units</h2>
          </div>
          <div className="bg-[#0E1525] border border-white/5 p-6 rounded-[2rem]">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Fuel Consumption</p>
            <h2 className="text-3xl font-black text-emerald-400 mt-2">8.4 km/L <span className="text-xs">Avg</span></h2>
          </div>
        </div>

        <div className="bg-[#0E1525] border border-white/5 rounded-[2.5rem] overflow-hidden">
          <div className="p-6 border-b border-white/5 bg-[#0A0F1C]/50 flex justify-between items-center">
             <h3 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2">
               <Activity className="h-4 w-4 text-slate-400" /> Vehicle Health Grid
             </h3>
          </div>
          <div className="divide-y divide-white/5">
            {vehicles.map((v) => (
              <div key={v.plate} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl bg-white/5 ${v.health < 50 ? 'text-rose-500' : 'text-slate-400'}`}>
                    <Truck size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white uppercase">{v.plate}</h4>
                    <p className="text-[10px] text-gray-500 font-bold uppercase">{v.type}</p>
                  </div>
                </div>
                
                <div className="flex-1 max-w-xs space-y-1">
                  <div className="flex justify-between text-[8px] font-black uppercase">
                    <span className="text-gray-500">Engine Health</span>
                    <span className={v.health < 50 ? 'text-rose-500' : 'text-emerald-500'}>{v.health}%</span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full ${v.health < 50 ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${v.health}%` }} />
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <p className="text-[8px] text-gray-500 uppercase font-black">Efficiency</p>
                    <p className="text-xs font-bold text-white font-mono">{v.fuel}</p>
                  </div>
                  {v.status === 'MAINTENANCE_REQ' ? (
                    <button className="px-4 py-2 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[9px] font-black uppercase rounded-lg animate-pulse">
                       Schedule Repair
                    </button>
                  ) : (
                    <span className="px-4 py-2 bg-emerald-500/10 text-emerald-500 text-[9px] font-black uppercase rounded-lg">
                       Ready
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </FleetShell>
  );
}

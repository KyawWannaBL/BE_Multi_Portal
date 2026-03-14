import React from 'react';
import { AdminShell } from '@/components/layout/AdminShell';
import { Shield, Key, Users, Database, AlertTriangle, Power } from 'lucide-react';

export default function SystemSettings() {
  return (
    <AdminShell title="System Security & Access Control">
      <div className="space-y-8 animate-in fade-in duration-500">
        
        {/* Global Controls */}
        <div className="bg-gradient-to-r from-rose-900/20 to-[#0E1525] border border-rose-500/20 p-8 rounded-[2.5rem] flex items-center justify-between shadow-2xl">
           <div>
              <h2 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-3">
                 <AlertTriangle className="text-rose-500" /> Maintenance Mode
              </h2>
              <p className="text-xs text-rose-400 font-bold mt-2 uppercase tracking-widest">Suspends all Merchant API & Rider App access</p>
           </div>
           <button className="h-14 px-8 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl flex items-center gap-3 shadow-xl shadow-rose-600/20">
              <Power size={18} /> Enable Maintenance
           </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           {/* API Keys */}
           <div className="bg-[#0E1525] border border-white/5 p-8 rounded-[2.5rem]">
              <h3 className="text-xs font-black uppercase tracking-widest text-white mb-6 flex items-center gap-2">
                 <Key className="h-4 w-4 text-amber-500" /> Platform API Keys
              </h3>
              <div className="space-y-4">
                 <div>
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Mapbox Public Token</label>
                    <input type="text" readOnly value="pk.eyJ1Ijoic2Fpbn..." className="w-full mt-2 bg-[#05080F] border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-500 font-mono outline-none" />
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">SMS Gateway API (Ooredoo/Telenor)</label>
                    <input type="password" value="****************" readOnly className="w-full mt-2 bg-[#05080F] border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-500 font-mono outline-none" />
                 </div>
              </div>
           </div>

           {/* Role Access */}
           <div className="bg-[#0E1525] border border-white/5 p-8 rounded-[2.5rem]">
              <h3 className="text-xs font-black uppercase tracking-widest text-white mb-6 flex items-center gap-2">
                 <Shield className="h-4 w-4 text-blue-500" /> Department Access Control
              </h3>
              <div className="space-y-3">
                 {['Finance Dept', 'Warehouse Hubs', 'Customer Service', 'Operations Monitoring'].map((dept) => (
                    <div key={dept} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                       <span className="text-xs font-bold text-white uppercase">{dept}</span>
                       <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[9px] font-black uppercase rounded-lg">Active</span>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </AdminShell>
  );
}

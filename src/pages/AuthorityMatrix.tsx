import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Database, ShieldCheck, Check, X, UserCog } from 'lucide-react';

export default function AuthorityMatrix() {
  const [activeRole, setActiveRole] = useState('Administrator');

  return (
    <div className="p-10 space-y-10 bg-[#0B101B] min-h-screen text-slate-300">
      <div className="flex justify-between items-start bg-[#05080F] p-10 rounded-[3rem] border border-white/5 shadow-2xl">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-white italic">Authority Matrix</h1>
          <p className="text-emerald-500 font-mono text-xs mt-2 tracking-widest uppercase">L5_Global_Permissions_Matrix</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl h-14 px-10">SAVE PERMISSIONS</Button>
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-4 space-y-3">
          {['Super Admin', 'Administrator', 'Finance Manager', 'Branch Manager', 'Supervisor'].map(role => (
            <button key={role} onClick={() => setActiveRole(role)} className={`w-full p-6 rounded-[2rem] text-left transition-all border-2 flex items-center justify-between ${activeRole === role ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-lg' : 'bg-white/5 border-transparent text-slate-400 hover:bg-white/10'}`}>
              <span className="font-black text-lg uppercase italic">{role}</span>
              <UserCog className={activeRole === role ? 'text-emerald-500' : 'text-slate-600'} />
            </button>
          ))}
        </div>

        <Card className="col-span-8 rounded-[3rem] border-none shadow-2xl bg-[#05080F] ring-1 ring-white/5">
          <CardHeader className="p-8 border-b border-white/5">
            <CardTitle className="text-2xl font-black text-white flex items-center gap-4 uppercase italic">
              <Database className="text-emerald-500 h-8 w-8" /> {activeRole} Modules
            </CardTitle>
          </CardHeader>
          <CardContent className="p-10 space-y-6">
             {[
               { label: 'Financial Disbursal Approval', code: 'FIN-01' },
               { label: 'Manage Users & Merchants', code: 'ADM-02' },
               { label: 'Logistics & Waybill Overrides', code: 'OPS-04' },
               { label: 'Deep Encryption Access', code: 'SEC-01' }
             ].map((mod, i) => (
                <div key={i} className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/5">
                   <div>
                     <p className="font-black text-white text-lg uppercase">{mod.label}</p>
                     <p className="text-[10px] font-mono text-slate-500 mt-1 uppercase tracking-widest">Code: {mod.code}</p>
                   </div>
                   <div className="flex bg-[#0B101B] rounded-xl p-1 border border-white/10">
                      <Button className="h-10 px-6 rounded-lg font-black text-xs bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]">ALLOW</Button>
                      <Button className="h-10 px-6 rounded-lg font-black text-xs text-slate-500 bg-transparent">DENY</Button>
                   </div>
                </div>
             ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

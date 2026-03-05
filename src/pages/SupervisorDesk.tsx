import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, Users, AlertTriangle } from 'lucide-react';

export default function SupervisorDesk() {
  return (
    <div className="p-10 space-y-8 bg-[#0B101B] min-h-screen text-slate-300">
      <div className="flex justify-between items-center bg-[#05080F] p-10 rounded-[3rem] border border-white/5 shadow-2xl">
        <div>
          <h1 className="text-4xl font-black uppercase text-white flex items-center gap-4"><Eye className="h-10 w-10 text-amber-500" /> Supervisor Desk</h1>
          <p className="text-amber-500 font-mono text-xs mt-2 tracking-widest uppercase">L4_SUPERVISOR • SHIFT OVERRIDE COMMAND</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="rounded-[2.5rem] bg-[#05080F] border border-amber-500/20 p-6"><AlertTriangle className="text-amber-500 mb-4 h-8 w-8"/><h3 className="text-white font-black text-xl mb-2">Exception Handling</h3><p className="text-slate-500 text-sm">Review stalled routes, rider breakdowns, and manual override requests.</p></Card>
        <Card className="rounded-[2.5rem] bg-[#05080F] border border-sky-500/20 p-6"><Users className="text-sky-400 mb-4 h-8 w-8"/><h3 className="text-white font-black text-xl mb-2">Shift Roster</h3><p className="text-slate-500 text-sm">Monitor active warehouse and field staff check-ins.</p></Card>
      </div>
    </div>
  );
}

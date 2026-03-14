import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldCheck, UserPlus, UserCheck, XCircle, CheckCircle2 } from 'lucide-react';

export default function IdentityControl() {
  return (
    <div className="p-10 space-y-8 bg-[#0B101B] min-h-screen text-slate-300">
      <div className="flex justify-between items-center bg-[#05080F] p-10 rounded-[3rem] border border-white/5 shadow-2xl">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-white flex items-center gap-4">
            <ShieldCheck className="h-10 w-10 text-emerald-500" /> Identity & Access Control
          </h1>
          <p className="text-emerald-500 font-mono text-xs mt-2 tracking-widest uppercase">
            L5_SYS_ADMIN • RBAC ENFORCEMENT ACTIVE
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="rounded-[2.5rem] border-none bg-[#05080F] ring-1 ring-white/5">
          <CardHeader><CardTitle className="text-white flex items-center gap-2"><UserPlus className="text-sky-400" /> Approval Queue</CardTitle></CardHeader>
          <CardContent><div className="text-slate-500 font-mono text-sm italic">Monitoring for pending L2/L3 registrations...</div></CardContent>
        </Card>
        <Card className="rounded-[2.5rem] border-none bg-[#05080F] ring-1 ring-white/5">
          <CardHeader><CardTitle className="text-white flex items-center gap-2"><UserCheck className="text-emerald-400" /> Active 22 Core Accounts</CardTitle></CardHeader>
          <CardContent><Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white">Export Security Audit Log</Button></CardContent>
        </Card>
      </div>
    </div>
  );
}

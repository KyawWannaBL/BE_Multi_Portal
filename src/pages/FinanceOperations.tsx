import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calculator, DollarSign, ArrowRightLeft } from 'lucide-react';

export default function FinanceOperations() {
  return (
    <div className="p-10 space-y-8 bg-[#0B101B] min-h-screen text-slate-300">
      <div className="flex justify-between items-center bg-[#05080F] p-10 rounded-[3rem] border border-white/5 shadow-2xl">
        <div>
          <h1 className="text-4xl font-black uppercase text-white flex items-center gap-4"><Calculator className="h-10 w-10 text-emerald-500" /> Accountant Portal</h1>
          <p className="text-emerald-500 font-mono text-xs mt-2 tracking-widest uppercase">L1_FINANCE • COD RECONCILIATION</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="rounded-[2.5rem] border-none bg-[#05080F] ring-1 ring-white/5">
          <CardHeader><CardTitle className="text-white flex items-center gap-2"><DollarSign className="text-emerald-400" /> End-of-Shift Rider Remittance</CardTitle></CardHeader>
          <CardContent><Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white">Audit Cash Handover</Button></CardContent>
        </Card>
        <Card className="rounded-[2.5rem] border-none bg-[#05080F] ring-1 ring-white/5">
          <CardHeader><CardTitle className="text-white flex items-center gap-2"><ArrowRightLeft className="text-sky-400" /> Merchant Payout Queue</CardTitle></CardHeader>
          <CardContent><Button className="w-full bg-sky-600 hover:bg-sky-500 text-white">Process Bank Transfers</Button></CardContent>
        </Card>
      </div>
    </div>
  );
}

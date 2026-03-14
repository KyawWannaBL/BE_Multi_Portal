import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet, ArrowUpRight, History, Landmark, ShieldCheck } from 'lucide-react';

export default function FinanceDashboard() {
  const isReadOnly = new URLSearchParams(window.location.search).get("mode") === "readonly";

  return (
    <div className="p-10 space-y-8 bg-[#0B101B] min-h-screen text-slate-300">
      <div className="flex justify-between items-end bg-[#05080F] p-10 rounded-[3rem] border border-white/5 shadow-2xl border-b-amber-500/20">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-white flex items-center gap-4">
            <Landmark className="h-10 w-10 text-amber-500" />
            Finance & Remittance Hub
          </h1>
          <p className="text-amber-500 font-mono text-xs mt-2 tracking-widest uppercase">L3_FINANCE_AUTHORITY</p>
        </div>
        {!isReadOnly && (
          <Button className="bg-amber-600 hover:bg-amber-500 text-white font-black rounded-xl h-12 px-8">
            <ArrowUpRight className="mr-2 h-5 w-5" /> Execute Bank Remittance
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <FinanceStat title="Total Cash on Hand" value="18.4M" color="text-amber-500" />
        <FinanceStat title="Pending Transfers" value="4.2M" color="text-rose-500" />
        <FinanceStat title="Verified Income" value="156M" color="text-emerald-500" />
        <FinanceStat title="Unreconciled" value="2.1M" color="text-slate-500" />
      </div>

      <Card className="rounded-[3rem] border-none bg-[#05080F] ring-1 ring-white/5 overflow-hidden">
        <CardHeader className="bg-white/5 p-8 flex flex-row items-center gap-3">
          <History className="text-amber-500" />
          <CardTitle className="text-white font-black uppercase">Remittance History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
           <table className="w-full text-left">
              <thead className="bg-white/5 text-[10px] font-black uppercase text-slate-500 tracking-widest"><tr className="p-4"><th>ID</th><th>Merchant</th><th>Amount</th><th>Status</th></tr></thead>
              <tbody className="text-sm">
                <tr className="border-b border-white/5 p-4 opacity-50"><td className="p-4">#TX-9901</td><td className="p-4">Yangon Fashion</td><td className="p-4">45,000 K</td><td className="p-4 text-emerald-500">PAID</td></tr>
              </tbody>
           </table>
        </CardContent>
      </Card>
    </div>
  );
}

function FinanceStat({ title, value, color }: any) {
  return (
    <Card className="bg-[#05080F] border-white/5 rounded-[2rem] p-6 ring-1 ring-white/5">
      <p className="text-[10px] font-black uppercase text-slate-500 mb-1">{title}</p>
      <p className={`text-2xl font-black ${color}`}>{value} <span className="text-xs">MMK</span></p>
    </Card>
  );
}

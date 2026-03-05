import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DollarSign, UserPlus } from 'lucide-react';

export default function MerchantProvisioning() {
  return (
    <div className="p-10 space-y-8 bg-[#0B101B] min-h-screen text-slate-300">
      <div className="flex items-center gap-4">
        <div className="bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20"><UserPlus className="h-8 w-8 text-emerald-500" /></div>
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-white">Merchant Provisioning</h1>
          <p className="text-slate-500 font-mono text-xs mt-2 uppercase tracking-widest">L5_SYS_ADMIN • CUSTOM TARIFF ENGINE</p>
        </div>
      </div>
      <Card className="rounded-[3rem] border-none bg-[#05080F] ring-1 ring-white/5">
        <CardContent className="p-10 space-y-8">
          <div className="p-8 rounded-[2rem] bg-white/5 border border-white/5">
            <h3 className="flex items-center gap-2 font-black text-emerald-400 mb-6 uppercase text-sm tracking-widest">
              <DollarSign className="h-5 w-5" /> Custom Tariff Rate Configuration
            </h3>
            <div className="grid grid-cols-3 gap-6">
              <div className="space-y-2"><label className="text-[10px] font-mono text-slate-500 uppercase">Base Rate (K)</label><Input className="bg-[#0B101B] border-white/10 text-white" placeholder="2000" /></div>
              <div className="space-y-2"><label className="text-[10px] font-mono text-slate-500 uppercase">Per KG (K)</label><Input className="bg-[#0B101B] border-white/10 text-white" placeholder="500" /></div>
              <div className="space-y-2"><label className="text-[10px] font-mono text-slate-500 uppercase">COD %</label><Input className="bg-[#0B101B] border-white/10 text-white" placeholder="3%" /></div>
            </div>
          </div>
          <Button className="w-full h-16 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl text-lg uppercase">Authorize Account</Button>
        </CardContent>
      </Card>
    </div>
  );
}

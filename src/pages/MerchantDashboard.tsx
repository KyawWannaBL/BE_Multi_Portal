import React from 'react';
import { Card } from '@/components/ui/card';
import { PackagePlus, LayoutDashboard, Truck, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MerchantDashboard() {
  return (
    <div className="p-10 space-y-8 bg-[#0B101B] min-h-screen text-slate-300">
      <div className="flex justify-between items-end bg-[#05080F] p-10 rounded-[3rem] border border-white/5 shadow-2xl">
        <div>
          <h1 className="text-4xl font-black uppercase text-white flex items-center gap-4"><LayoutDashboard className="h-10 w-10 text-sky-400" /> Merchant Sales Portal</h1>
          <p className="text-sky-400 font-mono text-xs mt-2 tracking-widest uppercase">STORE_OVERSIGHT_V3</p>
        </div>
        <Button className="bg-sky-600 hover:bg-sky-500 text-white font-black rounded-xl h-12 px-8"><PackagePlus className="mr-2 h-5 w-5" /> Create Order</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-[#05080F] p-6 ring-1 ring-white/5 rounded-[2rem]"><p className="text-slate-500">Pending Pickup</p><p className="text-3xl text-white font-black">12</p></Card>
        <Card className="bg-[#05080F] p-6 ring-1 ring-white/5 rounded-[2rem]"><p className="text-slate-500">In Transit</p><p className="text-3xl text-white font-black">48</p></Card>
        <Card className="bg-[#05080F] p-6 ring-1 ring-white/5 rounded-[2rem]"><p className="text-slate-500">Total COD Due</p><p className="text-3xl text-emerald-400 font-black">1.2M K</p></Card>
      </div>
    </div>
  );
}

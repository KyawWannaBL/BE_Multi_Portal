import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Truck, Users, Wallet, PackageCheck } from 'lucide-react';

export default function BranchOfficePortal() {
  return (
    <div className="p-10 space-y-8 bg-[#0B101B] min-h-screen text-slate-300">
      <div className="flex justify-between items-center bg-[#05080F] p-10 rounded-[3rem] border border-white/5 shadow-2xl">
        <div>
          <h1 className="text-4xl font-black uppercase text-white flex items-center gap-4">
            <MapPin className="h-10 w-10 text-cyan-400" /> Branch Operations Hub
          </h1>
          <p className="text-cyan-400 font-mono text-xs mt-2 tracking-widest uppercase">
            L4_REGIONAL • LOCAL HUB COMMAND & DISPATCH
          </p>
        </div>
        <Button className="bg-cyan-600 hover:bg-cyan-500 text-white font-black h-12 px-6 rounded-xl">
          <PackageCheck className="mr-2 h-5 w-5" /> Scan Arriving Linehaul
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-[#05080F] p-8 ring-1 ring-white/5 rounded-[2.5rem]">
          <Truck className="text-amber-400 mb-4 h-8 w-8"/>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Local Fleet Active</p>
          <p className="text-4xl text-white font-black mt-2">14</p>
        </Card>
        <Card className="bg-[#05080F] p-8 ring-1 ring-white/5 rounded-[2.5rem]">
          <Users className="text-emerald-400 mb-4 h-8 w-8"/>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Pending Deliveries</p>
          <p className="text-4xl text-white font-black mt-2">342</p>
        </Card>
        <Card className="bg-[#05080F] p-8 ring-1 ring-white/5 rounded-[2.5rem]">
          <Wallet className="text-cyan-400 mb-4 h-8 w-8"/>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Local COD Collected</p>
          <p className="text-4xl text-emerald-400 font-black mt-2">1.8M K</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="rounded-[2.5rem] border-none bg-[#05080F] ring-1 ring-white/5 p-10">
          <h3 className="text-2xl font-black text-white mb-4">Last-Mile Routing</h3>
          <p className="text-slate-500 text-sm mb-8">
            Assign scanned inventory to local riders based on neighborhood zones.
          </p>
          <Button className="w-full bg-white/5 hover:bg-white/10 text-white h-14 rounded-xl font-bold">
            Open Dispatch Matrix
          </Button>
        </Card>
        <Card className="rounded-[2.5rem] border-none bg-[#05080F] ring-1 ring-white/5 p-10">
          <h3 className="text-2xl font-black text-white mb-4">HQ Cash Remittance</h3>
          <p className="text-slate-500 text-sm mb-8">
            Reconcile COD collected by local riders and request ledger transfer to Main HQ.
          </p>
          <Button className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-black h-14 rounded-xl shadow-lg">
            Initiate HQ Transfer
          </Button>
        </Card>
      </div>
    </div>
  );
}

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Package, CheckCircle, Navigation, AlertCircle } from 'lucide-react';

export default function CourierDashboard() {
  const isReadOnly = new URLSearchParams(window.location.search).get("mode") === "readonly";

  return (
    <div className="p-4 space-y-6 bg-[#0B101B] min-h-screen text-slate-300 pb-24">
      {/* MOBILE HEADER */}
      <div className="bg-[#05080F] p-6 rounded-[2rem] border border-white/5 shadow-xl">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
              <div className="h-2 w-2 bg-rose-500 rounded-full animate-ping" />
              Field Operations
            </h1>
            <p className="text-rose-500 font-mono text-[10px] uppercase tracking-widest">Courier_Active_L1</p>
          </div>
          <div className="bg-rose-500/10 p-3 rounded-full border border-rose-500/20">
            <Package className="text-rose-500 h-5 w-5" />
          </div>
        </div>
      </div>

      {/* ACTIVE TASK CARD */}
      <Card className="rounded-[2rem] border-none bg-[#05080F] ring-1 ring-white/5 overflow-hidden">
        <div className="bg-rose-500/10 p-4 border-b border-rose-500/10 flex justify-between items-center">
          <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Next Delivery</span>
          <span className="text-[10px] font-mono text-slate-500">#BX-9982</span>
        </div>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-1">
            <h2 className="text-lg font-black text-white">U Kyaw Min</h2>
            <p className="text-sm text-slate-400 flex items-center gap-2">
              <MapPin className="h-3 w-3 text-rose-500" /> Sanchaung, Yangon
            </p>
          </div>

          <div className="flex gap-2">
             <Button variant="outline" className="flex-1 border-white/10 text-white h-12 rounded-xl">
               <Phone className="h-4 w-4 mr-2" /> Call
             </Button>
             <Button className="flex-1 bg-blue-600 hover:bg-blue-500 text-white h-12 rounded-xl">
               <Navigation className="h-4 w-4 mr-2" /> Map
             </Button>
          </div>

          {!isReadOnly && (
            <Button className="w-full bg-rose-600 hover:bg-rose-500 text-white font-black h-16 rounded-2xl shadow-lg shadow-rose-900/20">
              <CheckCircle className="mr-2 h-6 w-6" /> Confirm Delivery
            </Button>
          )}
        </CardContent>
      </Card>

      {/* SHIFT STATS */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
          <p className="text-[10px] font-black text-slate-500 uppercase">Completed</p>
          <p className="text-xl font-black text-white">08/12</p>
        </div>
        <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
          <p className="text-[10px] font-black text-slate-500 uppercase">COD Balance</p>
          <p className="text-xl font-black text-emerald-500">45k <span className="text-[10px]">K</span></p>
        </div>
      </div>

      {/* INCIDENT REPORTING */}
      {!isReadOnly && (
        <button className="w-full py-4 border border-dashed border-rose-500/30 rounded-2xl text-rose-500 font-bold text-xs flex items-center justify-center gap-2">
          <AlertCircle className="h-4 w-4" /> Report Issue to Dispatch
        </button>
      )}
    </div>
  );
}

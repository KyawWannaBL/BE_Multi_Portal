import React from 'react';
import { PackageSearch, ArrowDownToLine, MoveRight, MapPin } from 'lucide-react';

export default function Substation() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
            Substation Operations
          </h1>
          <p className="text-slate-400 mt-1">Localized parcel receiving and dispatch control.</p>
        </div>
        <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
          <p className="text-[10px] text-emerald-500 font-bold uppercase">Current Station</p>
          <p className="text-sm text-white font-semibold">Yangon - North Dagon</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Incoming Scan */}
        <div className="luxury-glass p-8 rounded-2xl border border-slate-700/50 flex flex-col items-center justify-center text-center space-y-4">
          <div className="h-16 w-16 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-400">
            <ArrowDownToLine size={32} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Receive from Hub</h3>
            <p className="text-sm text-slate-400 mt-1">Scan Waybills arriving from the primary distribution center.</p>
          </div>
          <button className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all">
            Open Scanner
          </button>
        </div>

        {/* Local Dispatch */}
        <div className="luxury-glass p-8 rounded-2xl border border-slate-700/50 flex flex-col items-center justify-center text-center space-y-4">
          <div className="h-16 w-16 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400">
            <MoveRight size={32} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Assign Local Riders</h3>
            <p className="text-sm text-slate-400 mt-1">Prepare parcels for last-mile delivery in your assigned townships.</p>
          </div>
          <button className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all">
            Dispatch Queue (14)
          </button>
        </div>
      </div>
    </div>
  );
}
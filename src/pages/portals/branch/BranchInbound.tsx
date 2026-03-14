import React, { useState } from 'react';
import { BranchShell } from '@/components/layout/BranchShell';
import { QrCode, PackageCheck, List, Truck } from 'lucide-react';

export default function BranchInbound() {
  return (
    <BranchShell title="Inbound Management">
      <div className="space-y-6">
        <div className="bg-[#0E1525] border border-orange-500/20 p-8 rounded-[2rem] text-center">
          <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-orange-500/30">
            <QrCode className="h-8 w-8 text-orange-400" />
          </div>
          <h2 className="text-xl font-black text-white uppercase tracking-widest">Inbound Scan Station</h2>
          <p className="text-xs text-gray-500 mt-2 max-w-sm mx-auto">Scan incoming line-haul containers or manifests to acknowledge hub arrival.</p>
          <button className="mt-8 px-8 py-3 bg-orange-600 hover:bg-orange-500 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-orange-500/20">
            Start Scanning
          </button>
        </div>

        <div className="bg-[#0E1525] border border-white/5 rounded-[2rem] overflow-hidden">
          <div className="p-6 border-b border-white/5 bg-[#0A0F1C]/50 flex justify-between items-center">
            <h3 className="text-xs font-black uppercase tracking-widest text-white">Expected Arrivals Today</h3>
            <span className="px-3 py-1 bg-orange-500 text-black text-[10px] font-black rounded-full uppercase">12 Manifests</span>
          </div>
          <div className="p-20 text-center text-gray-600 italic text-sm">Waiting for incoming line-haul data...</div>
        </div>
      </div>
    </BranchShell>
  );
}

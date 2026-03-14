import React from 'react';
import { BranchShell } from '@/components/layout/BranchShell';
import { Users, Truck, ArrowUpRight } from 'lucide-react';

export default function BranchOutbound() {
  return (
    <BranchShell title="Local Fleet Dispatch">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#0E1525] border border-white/5 p-8 rounded-[2rem] hover:border-orange-500/30 transition-all cursor-pointer group">
           <div className="flex justify-between items-start mb-6">
             <div className="p-3 bg-orange-500/10 rounded-xl"><Users className="h-6 w-6 text-orange-400" /></div>
             <ArrowUpRight className="h-4 w-4 text-gray-600 group-hover:text-white" />
           </div>
           <h3 className="text-lg font-black text-white uppercase tracking-wider">Assign to Riders</h3>
           <p className="text-xs text-gray-500 mt-1">Assign 452 pending parcels to local delivery riders.</p>
        </div>
        <div className="bg-[#0E1525] border border-white/5 p-8 rounded-[2rem] hover:border-orange-500/30 transition-all cursor-pointer group">
           <div className="flex justify-between items-start mb-6">
             <div className="p-3 bg-orange-500/10 rounded-xl"><Truck className="h-6 w-6 text-orange-400" /></div>
             <ArrowUpRight className="h-4 w-4 text-gray-600 group-hover:text-white" />
           </div>
           <h3 className="text-lg font-black text-white uppercase tracking-wider">Manifest Creation</h3>
           <p className="text-xs text-gray-500 mt-1">Generate dispatch manifests for local neighborhood routes.</p>
        </div>
      </div>
    </BranchShell>
  );
}

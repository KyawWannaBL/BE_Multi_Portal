import React from 'react';
import { AdminShell } from '@/components/layout/AdminShell';
import PartnerWalletCard from '@/components/finance/PartnerWalletCard';
import { Users, TrendingDown, ShieldCheck } from 'lucide-react';

export default function PartnerLedger() {
  const partners = [
    { name: "Royal Fashion Store", type: "MERCHANT" as const, balance: 850000, pendingRefunds: 0 },
    { name: "Mandalay North Sub-Station", type: "SUB_STATION" as const, balance: -12500, pendingRefunds: 5000 },
    { name: "Hlaing Hub Agent", type: "SUB_STATION" as const, balance: 45000, pendingRefunds: 0 },
  ];

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-widest">Partner Financials</h2>
          <p className="text-xs text-gray-500 font-bold uppercase mt-1">Merchant & Sub-Station Settlement Grid</p>
        </div>
        <div className="flex gap-4">
          <div className="px-6 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center">
            <p className="text-[8px] font-black text-emerald-500 uppercase">Total Network Credit</p>
            <p className="text-xl font-black text-white">1.2M <span className="text-xs">Ks</span></p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {partners.map((p, idx) => (
          <PartnerWalletCard key={idx} data={p} />
        ))}
      </div>
    </div>
  );
}

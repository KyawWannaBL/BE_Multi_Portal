import React from 'react';
import { FinanceShell } from '@/components/layout/FinanceShell';
import { DollarSign, ArrowUpRight, ArrowDownRight, Wallet, CheckCircle2 } from 'lucide-react';

export default function FinanceDashboard() {
  const pendingPayouts = [
    { id: 'TXN-001', entity: 'Royal Fashion', type: 'MERCHANT_WITHDRAWAL', amount: 450000, status: 'PENDING' },
    { id: 'TXN-002', entity: 'U Kyaw (Rider)', type: 'COMMISSION_PAYOUT', amount: 85000, status: 'PENDING' },
  ];

  return (
    <FinanceShell title="Corporate Finance & Treasury">
      <div className="space-y-6 animate-in fade-in duration-500">
        
        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#0E1525] border border-white/5 p-6 rounded-[2rem] shadow-xl">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Total COD Collected (Today)</p>
            <h2 className="text-3xl font-black text-white mt-2 font-mono">1,245,000 <span className="text-sm">Ks</span></h2>
          </div>
          <div className="bg-[#0E1525] border border-white/5 p-6 rounded-[2rem] shadow-xl">
            <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Pending Payouts</p>
            <h2 className="text-3xl font-black text-white mt-2 font-mono">535,000 <span className="text-sm">Ks</span></h2>
          </div>
          <div className="bg-[#0E1525] border border-white/5 p-6 rounded-[2rem] shadow-xl">
            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Company Revenue (Fees)</p>
            <h2 className="text-3xl font-black text-white mt-2 font-mono">142,500 <span className="text-sm">Ks</span></h2>
          </div>
        </div>

        {/* Action Required: Payouts */}
        <div className="bg-[#0E1525] border border-white/5 rounded-[2.5rem] overflow-hidden">
          <div className="p-6 border-b border-white/5 bg-[#0A0F1C]/50 flex justify-between items-center">
             <h3 className="text-xs font-black uppercase tracking-widest text-white">Pending Withdrawal Requests</h3>
          </div>
          <table className="w-full text-left">
            <thead className="bg-[#0A0F1C] text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 border-b border-white/5">
              <tr>
                <th className="p-4">Transaction ID</th>
                <th className="p-4">Entity</th>
                <th className="p-4">Type</th>
                <th className="p-4 font-mono">Amount</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
              {pendingPayouts.map((tx) => (
                <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 font-mono font-bold text-gray-400">{tx.id}</td>
                  <td className="p-4 font-bold text-white uppercase">{tx.entity}</td>
                  <td className="p-4 text-gray-500">{tx.type}</td>
                  <td className="p-4 font-black text-emerald-400 font-mono">{tx.amount.toLocaleString()} Ks</td>
                  <td className="p-4 text-right">
                    <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase rounded-lg transition-all shadow-lg shadow-emerald-500/20">
                      Approve & Transfer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </FinanceShell>
  );
}

import React, { useState } from 'react';
import { WarehouseShell } from '@/components/layout/WarehouseShell';
import { Search, Filter, Box, MapPin, Tag } from 'lucide-react';

export default function InventoryList() {
  const [items] = useState([
    { id: 'BTM-77218', merchant: 'Royal Fashion', location: 'Rack A-12', status: 'IN_STOCK', date: '2024-03-08' },
    { id: 'BTM-88291', merchant: 'Tech World', location: 'Rack B-04', status: 'PENDING_DISPATCH', date: '2024-03-09' },
    { id: 'BTM-99102', merchant: 'Beauty Co', location: 'Sorting Zone', status: 'IN_STOCK', date: '2024-03-09' },
  ]);

  return (
    <WarehouseShell title="Live Hub Inventory">
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input className="w-full bg-[#0E1525] border border-white/5 rounded-2xl pl-12 pr-4 py-3 text-sm text-white outline-none focus:border-indigo-500" placeholder="Search by SKU or Merchant..." />
          </div>
          <button className="px-6 py-3 bg-[#0E1525] border border-white/5 rounded-2xl text-[10px] font-black uppercase text-gray-400 flex items-center gap-2 hover:text-white">
            <Filter size={14} /> Filter by Zone
          </button>
        </div>

        <div className="bg-[#0E1525] border border-white/5 rounded-[2.5rem] overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-[#0A0F1C] text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 border-b border-white/5">
              <tr>
                <th className="p-6">Package ID</th>
                <th className="p-6">Merchant</th>
                <th className="p-6">Storage Location</th>
                <th className="p-6">Status</th>
                <th className="p-6 text-right">Added Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-6 font-mono font-bold text-indigo-400">{item.id}</td>
                  <td className="p-6 font-bold text-white uppercase">{item.merchant}</td>
                  <td className="p-6">
                    <span className="flex items-center gap-2 text-gray-300">
                      <MapPin size={12} className="text-indigo-500" /> {item.location}
                    </span>
                  </td>
                  <td className="p-6">
                    <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase ${item.status === 'IN_STOCK' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                      {item.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-6 text-right text-gray-500 font-mono">{item.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </WarehouseShell>
  );
}

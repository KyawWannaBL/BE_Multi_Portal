import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Users, Target } from 'lucide-react';

export default function MarketingDashboard() {
  return (
    <div className="p-10 space-y-8 bg-[#0B101B] min-h-screen text-slate-300">
      <div className="flex justify-between items-center bg-[#05080F] p-10 rounded-[3rem] border border-white/5 shadow-2xl">
        <div>
          <h1 className="text-4xl font-black uppercase text-white flex items-center gap-4"><TrendingUp className="h-10 w-10 text-purple-400" /> Marketing & Growth</h1>
          <p className="text-purple-400 font-mono text-xs mt-2 tracking-widest uppercase">L1_MARKETER • VOLUME ANALYTICS</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-[#05080F] p-6 ring-1 ring-white/5 rounded-[2rem]"><Users className="text-purple-400 mb-2"/><p className="text-slate-500">New Merchant Signups</p><p className="text-3xl text-white font-black">24 This Week</p></Card>
        <Card className="bg-[#05080F] p-6 ring-1 ring-white/5 rounded-[2rem]"><TrendingUp className="text-emerald-400 mb-2"/><p className="text-slate-500">Active Campaign Conversions</p><p className="text-3xl text-white font-black">8.4%</p></Card>
        <Card className="bg-[#05080F] p-6 ring-1 ring-white/5 rounded-[2rem]"><Target className="text-sky-400 mb-2"/><p className="text-slate-500">B2B Lead Target</p><p className="text-3xl text-white font-black">142 / 500</p></Card>
      </div>
    </div>
  );
}

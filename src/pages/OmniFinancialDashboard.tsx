import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Landmark, TrendingUp, AlertCircle } from 'lucide-react';

export default function OmniFinancialDashboard() {
  const { lang } = useOutletContext<{ lang: string }>();
  const [data, setData] = useState({ revenue: 0, pending: 0, totalOrders: 0 });

  useEffect(() => {
    async function syncFinance() {
      const { data: orders } = await supabase.from('orders').select('total_amount, status');
      if (orders) {
        const revenue = orders.filter(o => o.status === 'delivered').reduce((a, b) => a + (Number(b.total_amount) || 0), 0);
        const pending = orders.filter(o => o.status !== 'delivered').reduce((a, b) => a + (Number(b.total_amount) || 0), 0);
        setData({ revenue, pending, totalOrders: orders.length });
      }
    }
    syncFinance();
  }, []);

  return (
    <div className="space-y-8 p-6">
      <div className="bg-[#05080F]/80 p-10 rounded-[3rem] border border-white/5 flex justify-between items-center shadow-2xl">
        <h1 className="text-4xl font-black text-white uppercase tracking-tighter">
          {lang === 'EN' ? 'Financial Sector' : 'ဘဏ္ဍာရေးကဏ္ဍ'}
        </h1>
        <Landmark className="text-emerald-500 h-12 w-12" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <FinCard title={lang === 'EN' ? 'Net Revenue' : 'အသားတင်ဝင်ငွေ'} value={`${data.revenue.toLocaleString()} MMK`} icon={<TrendingUp />} color="text-emerald-500" />
        <FinCard title={lang === 'EN' ? 'Pending COD' : 'COD လက်ကျန်'} value={`${data.pending.toLocaleString()} MMK`} icon={<AlertCircle />} color="text-amber-500" />
        <FinCard title={lang === 'EN' ? 'Total Volume' : 'စုစုပေါင်းအရေအတွက်'} value={data.totalOrders.toString()} icon={<Landmark />} color="text-sky-500" />
      </div>
    </div>
  );
}

function FinCard({ title, value, icon, color }: any) {
  return (
    <div className="bg-[#05080F]/80 p-8 rounded-[2rem] border border-white/5 flex flex-col items-center text-center">
      <div className={`${color} mb-4`}>{icon}</div>
      <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">{title}</p>
      <p className="text-3xl font-black text-white mt-2">{value}</p>
    </div>
  );
}

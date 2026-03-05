import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useLanguageContext } from '@/lib/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Truck, Users, DollarSign, Activity } from 'lucide-react';

export default function Dashboard() {
  const { t } = useLanguageContext();
  const [stats, setStats] = useState({
    totalShipments: 0,
    pending: 0,
    delivered: 0,
    activeRiders: 0
  });

  useEffect(() => {
    const fetchDashboardStats = async () => {
      const { data: shipments } = await supabase.from('shipments').select('status');
      const { count: riders } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'rider').eq('is_active', true);
      
      if (shipments) {
        setStats({
          totalShipments: shipments.length,
          pending: shipments.filter(s => s.status === 'pending').length,
          delivered: shipments.filter(s => s.status === 'delivered').length,
          activeRiders: riders || 0
        });
      }
    };
    fetchDashboardStats();
  }, []);

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
      <h1 className="text-4xl font-black text-navy-900">{t('Enterprise Overview', 'လုပ်ငန်းခွင် အကျဉ်းချုပ်')}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="luxury-card border-none shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-500">{t('Total Volume', 'စုစုပေါင်း ပမာဏ')}</CardTitle>
            <Package className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-navy-900">{stats.totalShipments}</div>
          </CardContent>
        </Card>

        <Card className="luxury-card border-none shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-500">{t('Active Riders', 'လက်ရှိ ပို့ဆောင်သူများ')}</CardTitle>
            <Users className="h-5 w-5 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-navy-900">{stats.activeRiders}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

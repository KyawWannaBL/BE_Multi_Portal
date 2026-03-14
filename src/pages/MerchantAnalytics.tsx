import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useLanguageContext } from '@/lib/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, DollarSign, ArrowUpRight } from 'lucide-react';

export default function MerchantAnalytics() {
  const { user } = useAuth();
  const { t } = useLanguageContext();
  const [stats, setStats] = useState({ revenue: 0, volume: 0 });

  useEffect(() => {
    const fetchMerchantStats = async () => {
      const { data } = await supabase
        .from('shipments')
        .select('cod_amount')
        .eq('merchant_id', user?.id);
      
      if (data) {
        setStats({
          volume: data.length,
          revenue: data.reduce((sum, s) => sum + (Number(s.cod_amount) || 0), 0)
        });
      }
    };
    if (user) fetchMerchantStats();
  }, [user]);

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
      <h1 className="text-4xl font-bold text-navy-900 tracking-tight">
        {t('Merchant Intelligence', 'ကုန်သည်ဆိုင်ရာ အချက်အလက်များ')}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="luxury-card border-none shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase text-slate-500">{t('Total Revenue', 'စုစုပေါင်း ဝင်ငွေ')}</CardTitle>
            <DollarSign className="h-5 w-5 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{stats.revenue.toLocaleString()} MMK</div>
            <p className="text-xs text-emerald-600 flex items-center gap-1 mt-2">
              <ArrowUpRight className="h-3 w-3" /> {t('Live Sync', 'တိုက်ရိုက်ချိတ်ဆက်မှု')}
            </p>
          </CardContent>
        </Card>

        <Card className="luxury-card border-none shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase text-slate-500">{t('Shipment Volume', 'ပို့ဆောင်မှု ပမာဏ')}</CardTitle>
            <Package className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{stats.volume}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

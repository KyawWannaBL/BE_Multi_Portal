import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useLanguageContext } from '@/lib/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Wallet, CreditCard, TrendingUp } from 'lucide-react';

export default function Finance() {
  const { t } = useLanguageContext();
  const [finData, setFinData] = useState<any>(null);

  useEffect(() => {
    const fetchFinancials = async () => {
      const { data } = await supabase.rpc('get_financial_summary');
      if (data) setFinData(data);
    };
    fetchFinancials();
  }, []);

  const stats = [
    { label: t('Total Revenue', 'စုစုပေါင်း ဝင်ငွေ'), value: finData?.revenue || 0, icon: DollarSign, color: 'text-emerald-500' },
    { label: t('COD Collected', 'COD ကောက်ခံရရှိမှု'), value: finData?.cod_total || 0, icon: Wallet, color: 'text-amber-500' },
    { label: t('Total Expenses', 'စုစုပေါင်း အသုံးစရိတ်'), value: finData?.expenses || 0, icon: CreditCard, color: 'text-rose-500' }
  ];

  return (
    <div className="p-8 space-y-8 bg-white min-h-screen">
      <div>
        <h1 className="text-4xl font-black text-navy-900 tracking-tight">{t('Finance Control', 'ဘဏ္ဍာရေး ထိန်းချုပ်မှု')}</h1>
        <p className="text-muted-foreground">{t('Consolidated financial intelligence', 'စုပေါင်းဘဏ္ဍာရေး အချက်အလက်များ')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((s, i) => (
          <Card key={i} className="border-none shadow-xl bg-slate-50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-500">{s.label}</CardTitle>
              <s.icon className={`h-5 w-5 ${s.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-navy-900">{s.value.toLocaleString()} <span className="text-sm font-normal">MMK</span></div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

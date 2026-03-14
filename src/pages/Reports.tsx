import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useLanguageContext } from '@/lib/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Download, TrendingUp, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Reports() {
  const { t } = useLanguageContext();
  const [reportData, setReportData] = useState<any>(null);

  useEffect(() => {
    const loadReportData = async () => {
      const { data } = await supabase.rpc('get_financial_summary');
      if (data) setReportData(data);
    };
    loadReportData();
  }, []);

  return (
    <div className="p-8 space-y-8 bg-background min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-black text-navy-900">{t('Intelligence Reports', 'အစီရင်ခံစာများ')}</h1>
        <Button className="bg-primary text-primary-foreground font-bold rounded-xl h-12 px-6">
          <Download className="mr-2 h-4 w-4" /> {t('Export All', 'အားလုံးဒေါင်းလုဒ်လုပ်ရန်')}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="luxury-card border-l-4 border-emerald-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              {t('Revenue Performance', 'ဝင်ငွေဆိုင်ရာ လုပ်ဆောင်ချက်')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-navy-900">
              {reportData?.revenue?.toLocaleString() || 0} <span className="text-sm font-normal text-slate-400">MMK</span>
            </div>
            <p className="text-xs text-slate-400 mt-2 italic">{t('Based on current month data', 'ယခုလ ဒေတာပေါ်မူတည်၍')}</p>
          </CardContent>
        </Card>

        <Card className="luxury-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              {t('Standard Reports', 'ပုံမှန် အစီရင်ခံစာများ')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {['Daily Operations', 'Fleet Efficiency', 'Merchant Payouts'].map((name) => (
              <div key={name} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors">
                <span className="font-medium text-navy-900">{name}</span>
                <Calendar className="h-4 w-4 text-slate-400" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

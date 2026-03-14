import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useLanguageContext } from '@/lib/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Map, DollarSign, Plus, Save } from 'lucide-react';

export default function TariffManager() {
  const { t } = useLanguageContext();
  const [tariffs, setTariffs] = useState<any[]>([]);

  useEffect(() => {
    const fetchTariffs = async () => {
      const { data } = await supabase.from('tariffs').select('*').order('township_name');
      setTariffs(data || []);
    };
    fetchTariffs();
  }, []);

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-black text-navy-900 uppercase tracking-tighter">
          {t('Tariff & Zone Master', 'ဈေးနှုန်းနှင့် နယ်မြေ သတ်မှတ်ချက်')}
        </h1>
        <Button className="bg-navy-900 rounded-xl gap-2 h-12">
          <Plus className="h-5 w-5" /> {t('Add New Zone', 'နယ်မြေသစ် ထည့်မည်')}
        </Button>
      </div>

      <div className="grid gap-6">
        {tariffs.map((item) => (
          <Card key={item.id} className="rounded-3xl border-none shadow-sm hover:shadow-md transition-all bg-white">
            <CardContent className="p-6 flex flex-wrap md:flex-nowrap items-center gap-8">
              <div className="flex items-center gap-4 w-full md:w-1/3">
                <div className="bg-gold-500/10 p-3 rounded-2xl">
                  <Map className="text-gold-600 h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-400 uppercase">{t('Township', 'မြို့နယ်')}</p>
                  <p className="font-bold text-navy-900">{item.township_name}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 w-full md:w-1/2">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase">{t('Base Rate (K)', 'အခြေခံနှုန်း')}</p>
                  <Input defaultValue={item.base_price} className="h-10 rounded-xl border-slate-100 bg-slate-50 font-mono" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase">{t('Weight Surcharge (K)', 'အလေးချိန်အပိုကြေး')}</p>
                  <Input defaultValue={item.weight_surcharge_per_kg} className="h-10 rounded-xl border-slate-100 bg-slate-50 font-mono" />
                </div>
              </div>

              <Button className="bg-emerald-600 rounded-xl px-8 h-12 ml-auto">
                <Save className="h-4 w-4 mr-2" /> {t('Update', 'ပြင်ဆင်မည်')}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

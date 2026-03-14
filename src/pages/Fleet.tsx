import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useLanguageContext } from '@/lib/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck, MapPin, Wrench, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function Fleet() {
  const { t } = useLanguageContext();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFleet = async () => {
      const { data } = await supabase
        .from('fleet_telemetry')
        .select('*')
        .order('unit_name', { ascending: true });
      if (data) setVehicles(data);
      setLoading(false);
    };
    fetchFleet();
  }, []);

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-navy-900">{t('Fleet Management', 'ယာဉ်အုပ်စု စီမံခန့်ခွဲမှု')}</h1>
        <Badge variant="outline" className="border-primary text-primary font-mono uppercase">
          {t('Network Secure', 'ကွန်ရက် လုံခြုံသည်')}
        </Badge>
      </div>

      <div className="grid gap-4">
        {loading ? <p className="text-center py-10">Loading...</p> : 
         vehicles.map((v) => (
          <Card key={v.id} className="luxury-card hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-navy-900/5 rounded-xl flex items-center justify-center">
                  <Truck className="h-6 w-6 text-navy-900" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{v.unit_name}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {v.last_location_name || t('Tracking Active', 'ခြေရာခံနေသည်')}
                  </p>
                </div>
              </div>
              <div className="text-right space-y-2">
                <Badge className={v.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'}>
                  {v.status === 'active' ? t('En Route', 'လမ်းခရီးတွင်') : t('Maintenance', 'ပြင်ဆင်နေဆဲ')}
                </Badge>
                <p className="text-[10px] font-mono text-muted-foreground uppercase">{t('Last Sync', 'နောက်ဆုံးချိတ်ဆက်မှု')}: {new Date(v.updated_at).toLocaleTimeString()}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

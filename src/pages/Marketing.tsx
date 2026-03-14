import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useLanguageContext } from '@/lib/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Megaphone, Users, BadgeCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function Marketing() {
  const { t } = useLanguageContext();
  const [campaigns, setCampaigns] = useState<any[]>([]);

  useEffect(() => {
    const fetchCampaigns = async () => {
      const { data } = await supabase.from('marketing_campaigns').select('*');
      if (data) setCampaigns(data);
    };
    fetchCampaigns();
  }, []);

  return (
    <div className="p-8 space-y-8 bg-white min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold text-navy-900">{t('Marketing Hub', 'စျေးကွက်မြှင့်တင်ရေး ဗဟို')}</h1>
        <Badge variant="outline" className="text-primary border-primary">
          <BadgeCheck className="w-4 h-4 mr-1" /> {t('Active Campaigns', 'လက်ရှိကမ်ပိန်းများ')}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.map((c) => (
          <Card key={c.id} className="luxury-card border-t-4 border-pink-500">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span className="text-lg font-bold">{c.name}</span>
                <Megaphone className="h-5 w-5 text-pink-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between text-sm mb-4">
                <span className="text-muted-foreground">{t('Reach', 'ရောက်ရှိမှု')}</span>
                <span className="font-black text-navy-900">{c.reach_count?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm mb-4">
                <span className="text-muted-foreground">{t('Status', 'အခြေအနေ')}</span>
                <Badge className="bg-pink-50 text-pink-700 border-none">{c.status}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

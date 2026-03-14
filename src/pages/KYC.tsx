import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useLanguageContext } from '@/lib/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShieldCheck, Upload } from 'lucide-react';

export default function KYC() {
  const { user } = useAuth();
  const { t } = useLanguageContext();
  const [nrc, setNrc] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    const { error } = await supabase
      .from('profiles')
      .update({ nrc_number: nrc, kyc_status: 'pending' })
      .eq('id', user?.id);
    
    if (!error) alert(t('KYC Submitted Successfully', 'KYC တင်ပြမှု အောင်မြင်သည်'));
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-emerald-500">
        <CardHeader className="text-center">
          <ShieldCheck className="h-12 w-12 text-emerald-500 mx-auto mb-2" />
          <CardTitle className="text-2xl font-bold">{t('Identity Verification', 'မည်သူမည်ဝါဖြစ်ကြောင်း အတည်ပြုခြင်း')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-navy-900">{t('NRC Number', 'မှတ်ပုံတင်အမှတ်')}</label>
            <Input 
              value={nrc} 
              onChange={(e) => setNrc(e.target.value)} 
              placeholder="12/YAKANA(N)000000"
              className="border-navy-200"
            />
          </div>
          <Button onClick={handleSubmit} disabled={loading || !nrc} className="w-full bg-emerald-600 hover:bg-emerald-700">
            {loading ? 'Processing...' : t('Submit for Review', 'စစ်ဆေးရန် တင်ပြမည်')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

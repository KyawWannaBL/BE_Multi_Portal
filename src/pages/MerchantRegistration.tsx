import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2 } from 'lucide-react';

export default function MerchantRegistration() {
  return (
    <div className="p-10 space-y-8 bg-[#0B101B] min-h-screen text-slate-300">
      <Card className="rounded-[3rem] border-none bg-[#05080F] ring-1 ring-white/5 p-10">
        <CardHeader>
          <CardTitle className="text-3xl text-white flex items-center gap-3">
            <Building2 className="text-sky-400" /> Merchant Registration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-500 mb-6">Complete the L3 Partner onboarding process below.</p>
          <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-black h-12 px-8 rounded-xl">
            Submit Business Profile
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

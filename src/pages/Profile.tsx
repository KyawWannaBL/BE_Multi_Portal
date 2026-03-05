import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Key, Shield } from 'lucide-react';

export default function Profile() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between"><h1 className="text-3xl font-bold tracking-tight">Account Security</h1></div>
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2"><label className="text-sm font-medium">Assigned Hub ID</label><Input defaultValue="Global / Not Assigned" disabled /></div>
          <div className="pt-4 flex gap-3"><Button variant="outline"><Key className="mr-2 h-4 w-4" /> Change Password (britium2026)</Button></div>
        </CardContent>
      </Card>
      <Card className="border-rose-100 bg-rose-50/30">
        <CardContent className="pt-6"><p className="text-sm text-rose-700 flex items-center gap-2"><Shield className="h-5 w-5"/> Session managed by L5 Identity Control</p></CardContent>
      </Card>
    </div>
  );
}

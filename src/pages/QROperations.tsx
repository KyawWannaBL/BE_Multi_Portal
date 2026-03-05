import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QrCode, Copy, ShieldCheck } from 'lucide-react';

export default function QROperations() {
  const [groupShipmentId, setGroupShipmentId] = useState('');
  const [dateISO, setDateISO] = useState(() => new Date().toISOString().slice(0, 10));

  const payload = useMemo(() => {
    return JSON.stringify({
      groupShipmentId: groupShipmentId.trim(),
      date: dateISO,
      nonce: Math.random().toString(36).slice(2, 10),
    });
  }, [groupShipmentId, dateISO]);

  const encoded = useMemo(() => {
    try {
      return btoa(unescape(encodeURIComponent(payload)));
    } catch {
      return payload;
    }
  }, [payload]);

  const copy = async () => {
    await navigator.clipboard.writeText(encoded);
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
        <QrCode className="h-7 w-7" /> QR Operations
      </h1>

      <Card className="card-modern">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" /> Generate QR Payload
          </CardTitle>
          <CardDescription>Encoded token for printing + anti-fraud scanning.</CardDescription>
        </CardHeader>

        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>GroupShipmentId</Label>
            <Input value={groupShipmentId} onChange={(e) => setGroupShipmentId(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Date</Label>
            <Input type="date" value={dateISO} onChange={(e) => setDateISO(e.target.value)} />
          </div>

          <div className="md:col-span-2 space-y-2">
            <div className="flex items-center justify-between">
              <Label>Encoded Token</Label>
              <Badge variant="secondary">Base64</Badge>
            </div>

            <div className="rounded-xl border bg-slate-50 p-3 font-mono text-xs break-all">
              {groupShipmentId ? encoded : 'Enter GroupShipmentId to generate token…'}
            </div>

            <Button className="h-12" onClick={copy} disabled={!groupShipmentId}>
              <Copy className="h-4 w-4 mr-2" /> Copy Token
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

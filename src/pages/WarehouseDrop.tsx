import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { QrCode, CheckCircle2, AlertTriangle, ShieldCheck, Warehouse } from 'lucide-react';

export default function WarehouseDrop() {
  const [awb, setAwb] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleScan = () => {
    if (awb.length < 5) {
      setStatus('error');
      return;
    }
    setStatus('success');
    setAwb('');
  };

  return (
    <div className="p-10 space-y-8 bg-[#0B101B] min-h-screen text-slate-300">
      <div className="flex justify-between items-center bg-[#05080F] p-10 rounded-[3rem] border border-white/5 shadow-2xl">
        <div>
          <h1 className="text-4xl font-black uppercase text-white flex items-center gap-4">
            <Warehouse className="h-10 w-10 text-amber-500" /> Inbound Handover
          </h1>
          <p className="text-amber-500 font-mono text-xs mt-2 tracking-widest uppercase flex items-center gap-2">
            <ShieldCheck className="h-3 w-3" /> WH_GATE_SOUTH • MANDATORY QR VERIFICATION
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="rounded-[2.5rem] border-none bg-[#05080F] ring-1 ring-white/5">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <QrCode className="text-sky-400" /> AWB Scanner
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-slate-500 text-sm">Scan the Rider's cargo label to transfer custody to the Sorting Hub.</p>
            <div className="flex gap-4">
              <Input 
                value={awb}
                onChange={(e) => setAwb(e.target.value)}
                placeholder="Scan or Enter AWB..." 
                className="bg-white/5 border-white/10 text-white h-14 text-lg"
              />
              <Button onClick={handleScan} className="h-14 px-8 bg-sky-600 hover:bg-sky-500 text-white font-black">
                VERIFY
              </Button>
            </div>

            {status === 'success' && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3 text-emerald-400">
                <CheckCircle2 className="h-5 w-5" /> Custody Transferred. Package logged as "At Hub".
              </div>
            )}
            {status === 'error' && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 text-rose-400">
                <AlertTriangle className="h-5 w-5" /> Invalid AWB or Geofence Mismatch. Handover blocked.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

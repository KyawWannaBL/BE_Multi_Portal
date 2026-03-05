import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Keyboard, QrCode } from 'lucide-react';

export default function DataEntryHub() {
  return (
    <div className="p-10 space-y-8 bg-[#0B101B] min-h-screen text-slate-300">
      <div className="flex justify-between items-center bg-[#05080F] p-10 rounded-[3rem] border border-white/5 shadow-2xl">
        <div>
          <h1 className="text-4xl font-black uppercase text-white flex items-center gap-4"><Keyboard className="h-10 w-10 text-indigo-400" /> Data Entry Hub</h1>
          <p className="text-indigo-400 font-mono text-xs mt-2 tracking-widest uppercase">L2_STAFF • RAPID WAYBILL GENERATION</p>
        </div>
      </div>
      <Card className="rounded-[2.5rem] border-none bg-[#05080F] ring-1 ring-white/5 p-10">
         <CardHeader><CardTitle className="text-white flex items-center gap-2"><QrCode className="text-indigo-400" /> Manual Order Registration</CardTitle></CardHeader>
         <CardContent className="space-y-4">
           <Input placeholder="Recipient Name" className="bg-white/5 border-white/10 text-white" />
           <Input placeholder="Recipient Phone" className="bg-white/5 border-white/10 text-white" />
           <Input placeholder="Full Address" className="bg-white/5 border-white/10 text-white" />
           <Button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black">Generate QR & Print Label</Button>
         </CardContent>
      </Card>
    </div>
  );
}

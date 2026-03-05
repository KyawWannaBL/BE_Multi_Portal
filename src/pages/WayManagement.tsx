import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Package, Map, Zap, CheckCircle, Download, Search } from 'lucide-react';

export default function WayManagement() {
  const { lang } = useLanguage();
  const [activeTab, setActiveTab] = useState('active');

  return (
    <div className="p-10 space-y-10 bg-[#0B101B] min-h-screen text-slate-300">
      <div className="flex justify-between items-center bg-[#05080F] p-10 rounded-[3rem] border border-white/5">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-sky-500/10 rounded-2xl border border-sky-500/20"><Package className="h-8 w-8 text-sky-500" /></div>
          <div>
            <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">
              {lang === 'en' ? 'Way Matrix' : 'ပို့ဆောင်မှု မေထရစ်'}
            </h1>
            <p className="text-sky-500 font-mono text-[10px] mt-1 uppercase tracking-widest italic">Mapbox_Optimized_Routing_Enabled</p>
          </div>
        </div>
        <div className="flex gap-4">
          <Button className="bg-emerald-600 text-white font-black h-14 px-10 rounded-2xl shadow-xl shadow-emerald-900/20 uppercase tracking-widest">
            <Map className="mr-2 h-5 w-5" /> {lang === 'en' ? 'Generate Way Plan' : 'လမ်းကြောင်းစာရင်း ထုတ်မည်'}
          </Button>
        </div>
      </div>

      <Card className="bg-[#05080F] border-none ring-1 ring-white/5 rounded-[3rem] overflow-hidden">
        <Table>
          <TableHeader className="bg-white/5 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
            <TableRow className="border-white/5">
              <th className="p-8">Waybill ID</th>
              <th className="p-8">Destination / Hub</th>
              <th className="p-8">Rider / Driver</th>
              <th className="p-8">Status</th>
              <th className="p-8 text-right">Audit</th>
            </TableRow>
          </TableHeader>
          <TableBody className="text-white/80">
            <TableRow className="hover:bg-white/5 border-white/5 transition-all">
              <td className="p-8 font-mono text-sky-400 font-black">BE-2026-9901</td>
              <td className="p-8">
                <p className="font-bold text-white">North Okkalapa</p>
                <p className="text-[10px] text-slate-500 italic">Yangon Central Hub</p>
              </td>
              <td className="p-8">Zayar Min (RDR-001)</td>
              <td className="p-8"><span className="bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full text-[10px] font-black uppercase">IN_TRANSIT</span></td>
              <td className="p-8 text-right"><Button variant="ghost" className="text-sky-500"><CheckCircle size={18}/></Button></td>
            </TableRow>
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

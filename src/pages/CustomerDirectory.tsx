import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Users, Search, MapPin, Phone } from 'lucide-react';

export default function CustomerDirectory() {
  return (
    <div className="p-10 space-y-8 bg-[#0B101B] min-h-screen text-slate-300">
      <div className="flex justify-between items-center bg-[#05080F] p-10 rounded-[3rem] border border-white/5 shadow-2xl">
        <div>
          <h1 className="text-4xl font-black uppercase text-white flex items-center gap-4">
            <Users className="h-10 w-10 text-sky-400" /> Customer Directory
          </h1>
          <p className="text-sky-400 font-mono text-xs mt-2 tracking-widest uppercase">
            L1_SUPPORT / L4_REGIONAL • USER SEGREGATION ACTIVE
          </p>
        </div>
        <div className="flex gap-4">
           <Input placeholder="Search by Phone or Name..." className="bg-white/5 border-white/10 text-white h-12 w-64 rounded-xl" />
           <Button className="bg-sky-600 hover:bg-sky-500 text-white font-black h-12 px-6 rounded-xl"><Search className="h-4 w-4 mr-2" /> Find</Button>
        </div>
      </div>

      <Card className="rounded-[2.5rem] border-none bg-[#05080F] ring-1 ring-white/5 overflow-hidden">
        <div className="p-8 border-b border-white/5 flex justify-between items-center">
           <h3 className="text-xl font-bold text-white">Registered Consignees</h3>
        </div>
        <CardContent className="p-0">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-slate-400 text-xs uppercase font-mono tracking-widest">
              <tr>
                <th className="p-6">Customer Name</th>
                <th className="p-6">Contact</th>
                <th className="p-6">Assigned Branch (Zone)</th>
                <th className="p-6">Active Orders</th>
                <th className="p-6">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <tr className="hover:bg-white/5 transition-colors">
                <td className="p-6 font-bold text-white">Kyaw Zin Thant</td>
                <td className="p-6 text-slate-400"><Phone className="inline h-4 w-4 mr-2"/> 09-12345678</td>
                <td className="p-6"><span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-xs font-bold"><MapPin className="inline h-3 w-3 mr-1"/> MDY-HUB-01</span></td>
                <td className="p-6 text-emerald-400 font-bold">2 In Transit</td>
                <td className="p-6"><Button variant="outline" className="h-8 border-white/10 hover:bg-white/10">Manage</Button></td>
              </tr>
              <tr className="hover:bg-white/5 transition-colors">
                <td className="p-6 font-bold text-white">Su Myat Noe</td>
                <td className="p-6 text-slate-400"><Phone className="inline h-4 w-4 mr-2"/> 09-87654321</td>
                <td className="p-6"><span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold"><MapPin className="inline h-3 w-3 mr-1"/> NPT-HUB-02</span></td>
                <td className="p-6 text-slate-500 font-bold">0 Active</td>
                <td className="p-6"><Button variant="outline" className="h-8 border-white/10 hover:bg-white/10">Manage</Button></td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

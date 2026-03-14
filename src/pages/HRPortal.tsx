import React from 'react';
import { Card } from '@/components/ui/card';
import { FolderLock, Users, FileText, Download, ShieldCheck } from 'lucide-react';

export default function HRPortal() {
  const folders = [
    { title: 'Employment Contracts', count: 135, color: 'text-rose-500' },
    { title: 'KYC & ID Cards', count: 135, color: 'text-sky-500' },
    { title: 'Payroll Archives', count: 12, color: 'text-emerald-500' }
  ];

  return (
    <div className="p-10 space-y-10 bg-[#0B101B] min-h-screen text-slate-300">
      <div className="flex items-center gap-6 bg-[#05080F] p-8 rounded-[2.5rem] border border-white/5">
        <div className="p-4 bg-rose-500/10 rounded-2xl"><FolderLock className="text-rose-500 h-8 w-8" /></div>
        <div>
          <h1 className="text-3xl font-black text-white uppercase italic">HR & Staff Vault</h1>
          <p className="text-rose-500 font-mono text-[10px] uppercase tracking-widest italic">Confidential_Personnel_Archives</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {folders.map((f) => (
          <Card key={f.title} className="bg-[#05080F] border-none ring-1 ring-white/5 rounded-[3rem] p-10 group hover:ring-rose-500/30 transition-all cursor-pointer">
             <div className="flex justify-between items-start mb-6">
                <FileText className={`${f.color} group-hover:scale-110 transition-transform`} size={40} />
                <Download className="text-slate-700 group-hover:text-white transition-colors" size={20} />
             </div>
             <h3 className="text-xl font-bold text-white mb-2 uppercase italic">{f.title}</h3>
             <p className="text-slate-500 text-xs font-mono uppercase tracking-widest">{f.count} FILES SYNCED</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

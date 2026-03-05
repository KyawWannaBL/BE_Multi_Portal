import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus, ShieldCheck, Key, Lock, Search, FileText } from 'lucide-react';
import { USER_ROLES } from '@/lib/constants';

export default function AccountControl() {
  const { lang } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');

  // 135-Account Registry Simulation
  const accounts = [
    { name: 'MD VENTURES', email: 'md@britiumventures.com', role: USER_ROLES.APP_OWNER, status: 'ACTIVE' },
    { name: 'SUPER ADMIN', email: 'md@britiumexpress.com', role: USER_ROLES.SUPER_ADMIN, status: 'ACTIVE' },
    { name: 'STAFF ADMIN', email: 'staff_1@britiumexpress.com', role: USER_ROLES.STAFF, status: 'PENDING' }
  ];

  return (
    <div className="p-10 space-y-10 bg-[#0B101B] min-h-screen text-slate-300">
      {/* 🛠️ Header Control */}
      <div className="flex justify-between items-center bg-[#05080F] p-8 rounded-[2.5rem] border border-white/5">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-sky-500/10 rounded-2xl"><UserPlus className="text-sky-500 h-8 w-8" /></div>
          <div>
            <h1 className="text-3xl font-black text-white uppercase italic">Account Control</h1>
            <p className="text-sky-500 font-mono text-[10px] uppercase tracking-widest italic">Identity_Governance_L1-L5</p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input 
              className="bg-[#0B101B] border border-white/10 rounded-full h-12 pl-12 pr-6 text-sm w-64" 
              placeholder="Search 135 Accounts..." 
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button className="bg-sky-600 hover:bg-sky-500 text-white font-black h-12 px-8 rounded-xl uppercase">
            {lang === 'en' ? 'Create Account' : 'အကောင့်အသစ်ဖွင့်မည်'}
          </Button>
        </div>
      </div>

      {/* 📋 Staff Registry Table */}
      <Card className="bg-[#05080F] border-none ring-1 ring-white/5 rounded-[3rem] overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/5 font-mono text-slate-500 uppercase text-[10px] tracking-[0.2em]">
            <tr>
              <th className="p-6">Personnel Info</th>
              <th className="p-6">Hierarchy / Authority</th>
              <th className="p-6">Status</th>
              <th className="p-6 text-right">Administrative Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {accounts.map((user) => (
              <tr key={user.email} className="hover:bg-white/5 transition-all">
                <td className="p-6">
                  <p className="font-bold text-white uppercase italic">{user.name}</p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </td>
                <td className="p-6">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-tighter ${
                    user.role === 'APP_OWNER' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-sky-500/10 text-sky-500'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="p-6">
                  <span className={`text-[10px] font-bold italic ${user.status === 'ACTIVE' ? 'text-emerald-400' : 'text-amber-500'}`}>
                    {user.status}
                  </span>
                </td>
                <td className="p-6 text-right space-x-2">
                  <Button variant="ghost" className="h-10 text-slate-500 hover:text-white" title="View HR Docs"><FileText size={16}/></Button>
                  <Button variant="ghost" className="h-10 text-slate-500 hover:text-white" title="Reset Pass"><Key size={16}/></Button>
                  <Button variant="ghost" className="h-10 text-rose-500 hover:bg-rose-500/10" title="Block Account"><Lock size={16}/></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

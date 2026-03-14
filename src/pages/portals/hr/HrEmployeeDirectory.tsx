import React, { useState } from 'react';
import { HrShell } from '@/components/layout/HrShell';
import { useLanguage } from '@/contexts/LanguageContext';
import { Search, UserPlus, MapPin, Shield, CheckCircle2 } from 'lucide-react';

interface Employee {
  id: string;
  name: string;
  role: string;
  branch: string;
  phone: string;
  status: 'ACTIVE' | 'ON_LEAVE' | 'SUSPENDED';
}

export default function HrEmployeeDirectory() {
  const { lang } = useLanguage();
  const t = (en: string, my: string) => (lang === 'en' ? en : my);

  const [search, setSearch] = useState('');
  
  const employees: Employee[] = [
    { id: 'EMP-001', name: 'U Aung Tun', role: 'Line-Haul Driver', branch: 'Yangon HQ', phone: '09-11111111', status: 'ACTIVE' },
    { id: 'EMP-002', name: 'Daw Mya', role: 'Data Entry Clerk', branch: 'Mandalay Hub', phone: '09-22222222', status: 'ACTIVE' },
    { id: 'EMP-003', name: 'Kyaw Zin', role: 'Field Rider', branch: 'Yangon HQ', phone: '09-33333333', status: 'ON_LEAVE' },
    { id: 'EMP-004', name: 'Ko Zaw', role: 'Warehouse Staff', branch: 'Naypyitaw Hub', phone: '09-44444444', status: 'ACTIVE' },
  ];

  const filtered = employees.filter(e => 
    e.name.toLowerCase().includes(search.toLowerCase()) || 
    e.role.toLowerCase().includes(search.toLowerCase()) ||
    e.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <HrShell title={t("Employee Directory", "ဝန်ထမ်းစာရင်း")}>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#0E1525] p-6 rounded-[2rem] border border-white/5 shadow-xl">
          <div className="flex-1 w-full max-w-md bg-[#0A0F1C] border border-white/5 p-2 rounded-xl flex items-center gap-3 focus-within:border-violet-500/50 transition-colors">
            <Search className="h-5 w-5 text-gray-500 ml-2" />
            <input 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              className="bg-transparent text-sm text-white outline-none w-full" 
              placeholder={t("Search by Name, Role, or ID...", "အမည်၊ ရာထူး သို့မဟုတ် ID ဖြင့်ရှာပါ...")} 
            />
          </div>
          <button className="px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-[0_0_15px_rgba(139,92,246,0.3)] transition-all w-full md:w-auto justify-center">
            <UserPlus className="h-4 w-4" /> {t("Add Employee", "ဝန်ထမ်းအသစ်ထည့်ရန်")}
          </button>
        </div>

        {/* Directory List */}
        <div className="bg-[#0E1525] border border-white/5 rounded-[2rem] overflow-hidden shadow-xl">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#0A0F1C]/50 border-b border-white/5 text-[10px] font-black uppercase tracking-widest text-gray-500">
                <tr>
                  <th className="p-6">Employee</th>
                  <th className="p-6">Role & Clearance</th>
                  <th className="p-6">Branch / Hub</th>
                  <th className="p-6">Status</th>
                  <th className="p-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map(emp => (
                  <tr key={emp.id} className="hover:bg-[#131C31] transition-colors">
                    <td className="p-6">
                      <p className="font-bold text-white text-base">{emp.name}</p>
                      <p className="text-[10px] text-gray-500 font-mono mt-1">{emp.id} • {emp.phone}</p>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-violet-500" />
                        <span className="text-gray-300 font-medium">{emp.role}</span>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-300">{emp.branch}</span>
                      </div>
                    </td>
                    <td className="p-6">
                      <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase border ${
                        emp.status === 'ACTIVE' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                        emp.status === 'ON_LEAVE' ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' :
                        'bg-rose-500/10 border-rose-500/30 text-rose-400'
                      }`}>
                        {emp.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-6 text-right">
                      <button className="px-4 py-2 bg-[#0A0F1C] border border-white/5 hover:border-violet-500 text-violet-400 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all">
                        {t("Manage", "စီမံရန်")}
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={5} className="p-8 text-center text-gray-500 text-xs font-bold tracking-widest uppercase">{t("No employees found", "ရှာမတွေ့ပါ")}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </HrShell>
  );
}

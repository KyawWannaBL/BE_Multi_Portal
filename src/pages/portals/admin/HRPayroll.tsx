import React, { useState } from 'react';
import { AdminShell } from '@/components/layout/AdminShell';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Users, Banknote, FileText, UserCheck, 
  Search, Filter, CheckCircle2, AlertCircle 
} from 'lucide-react';

export default function HRPayroll() {
  const { lang } = useLanguage();
  const t = (en: string, my: string) => (lang === 'en' ? en : my);

  const employees = [
    { name: 'Sai Admin', role: 'SUPER_ADMIN', salary: 1500000, status: 'PAID', kyc: 'VERIFIED' },
    { name: 'Aung Kyaw', role: 'RIDER', salary: 450000, status: 'PENDING', kyc: 'PENDING' },
    { name: 'Daw Hla', role: 'FINANCE', salary: 800000, status: 'PAID', kyc: 'VERIFIED' },
  ];

  return (
    <AdminShell title={t("HR & Payroll", "ဝန်ထမ်းနှင့် လစာစီမံခန့်ခွဲမှု")}>
      <div className="space-y-6 animate-in fade-in duration-500">
        
        {/* Payroll Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#0E1525] border border-white/5 p-6 rounded-[2rem] shadow-xl">
             <div className="flex items-center gap-3 mb-4">
                <Banknote className="text-emerald-500" />
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Monthly Payroll</p>
             </div>
             <p className="text-3xl font-black text-white font-mono">2,750,000 <span className="text-xs">Ks</span></p>
          </div>
          <div className="bg-[#0E1525] border border-white/5 p-6 rounded-[2rem] shadow-xl">
             <div className="flex items-center gap-3 mb-4">
                <Users className="text-blue-500" />
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Total Staff</p>
             </div>
             <p className="text-3xl font-black text-white font-mono">42</p>
          </div>
          <div className="bg-[#0E1525] border border-white/5 p-6 rounded-[2rem] shadow-xl">
             <div className="flex items-center gap-3 mb-4">
                <UserCheck className="text-amber-500" />
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">KYC Verified</p>
             </div>
             <p className="text-3xl font-black text-white font-mono">85%</p>
          </div>
        </div>

        {/* Employee Table */}
        <div className="bg-[#0E1525] border border-white/5 rounded-[2.5rem] overflow-hidden">
          <div className="p-6 border-b border-white/5 bg-[#0A0F1C]/50 flex justify-between items-center">
            <h3 className="text-xs font-black uppercase tracking-widest text-white">{t("Employee Records", "ဝန်ထမ်းမှတ်တမ်းများ")}</h3>
            <button className="px-4 py-2 bg-blue-600 text-white text-[10px] font-black uppercase rounded-lg">Add Staff</button>
          </div>
          <table className="w-full text-left">
            <thead className="bg-[#0A0F1C] text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 border-b border-white/5">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Role</th>
                <th className="p-4">KYC</th>
                <th className="p-4">Salary</th>
                <th className="p-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
              {employees.map((emp, i) => (
                <tr key={i} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 font-bold text-white uppercase">{emp.name}</td>
                  <td className="p-4 text-gray-400 font-bold">{emp.role}</td>
                  <td className="p-4">
                    <span className={`flex items-center gap-1.5 ${emp.kyc === 'VERIFIED' ? 'text-emerald-500' : 'text-amber-500'}`}>
                      {emp.kyc === 'VERIFIED' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                      {emp.kyc}
                    </span>
                  </td>
                  <td className="p-4 font-mono font-bold">{emp.salary.toLocaleString()} Ks</td>
                  <td className="p-4 text-right">
                    <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase ${emp.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                      {emp.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}

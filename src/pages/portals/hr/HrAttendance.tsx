import React, { useState } from 'react';
import { HrShell } from '@/components/layout/HrShell';
import { useLanguage } from '@/contexts/LanguageContext';
import { MapPin, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function HrAttendance() {
  const { lang } = useLanguage();
  const t = (en: string, my: string) => (lang === 'en' ? en : my);

  const logs = [
    { id: 'EMP-003', name: 'Kyaw Zin', role: 'Field Rider', timeIn: '08:00 AM', location: 'Yangon HQ (GPS Verified)', status: 'ON_TIME' },
    { id: 'EMP-001', name: 'U Aung Tun', role: 'Line-Haul Driver', timeIn: '08:15 AM', location: 'Yangon Hub 2', status: 'ON_TIME' },
    { id: 'EMP-002', name: 'Daw Mya', role: 'Data Entry', timeIn: '09:30 AM', location: 'Mandalay Hub', status: 'LATE' },
  ];

  return (
    <HrShell title={t("Time & Attendance", "အချိန်စာရင်းနှင့် တက်ရောက်မှု")}>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        <div className="bg-gradient-to-br from-violet-900/40 to-[#0E1525] border border-violet-500/30 rounded-[2rem] p-8 shadow-2xl flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-widest">{t("Today's Attendance", "ယနေ့ တက်ရောက်မှု")}</h2>
            <p className="text-sm text-violet-200/70 mt-2">{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <div className="text-right hidden md:block">
            <p className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">Total Clocked In</p>
            <p className="text-4xl font-black text-white font-mono mt-1">268 <span className="text-sm text-gray-400">/ 284</span></p>
          </div>
        </div>

        <div className="bg-[#0E1525] border border-white/5 rounded-[2rem] overflow-hidden shadow-xl">
          <div className="p-6 border-b border-white/5 bg-[#0A0F1C]/50 flex justify-between items-center">
             <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">{t("Live Clock-in Stream", "တိုက်ရိုက် တက်ရောက်မှုမှတ်တမ်း")}</h3>
          </div>
          <div className="divide-y divide-white/5">
            {logs.map((log, idx) => (
              <div key={idx} className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-[#131C31] transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full border ${log.status === 'ON_TIME' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-amber-500/10 border-amber-500/30 text-amber-500'}`}>
                    {log.status === 'ON_TIME' ? <CheckCircle2 className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
                  </div>
                  <div>
                    <p className="font-bold text-white text-base">{log.name}</p>
                    <p className="text-[10px] text-gray-500 font-mono mt-1">{log.id} • {log.role}</p>
                  </div>
                </div>

                <div className="flex items-center gap-8 bg-[#0A0F1C] px-6 py-3 rounded-xl border border-white/5 w-full md:w-auto">
                  <div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1"><Clock className="h-3 w-3" /> Time In</p>
                    <p className="font-mono font-bold text-white mt-1">{log.timeIn}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1"><MapPin className="h-3 w-3" /> Location</p>
                    <p className="text-sm font-medium text-gray-300 mt-1">{log.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </HrShell>
  );
}

import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Smartphone, Battery, Wifi, Activity, 
  RefreshCcw, Globe, ArrowLeft, ShieldCheck, 
  AlertOctagon, Zap, Bluetooth, Search
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DeviceManagement() {
  const { lang, toggleLang } = useLanguage();
  const navigate = useNavigate();

  // Real-time Device Telemetry Data
  const devices = [
    { id: 'SCN-YGN-01', type: 'Handheld Scanner', battery: 88, signal: 'Strong', status: 'ONLINE', user: 'WH_ADMIN_01' },
    { id: 'SCN-YGN-04', type: 'Handheld Scanner', battery: 12, signal: 'Weak', status: 'LOW_BATTERY', user: 'SORT_LEAD_02' },
    { id: 'MOB-MDY-09', type: 'Rider Mobile', battery: 65, signal: 'Offline', status: 'DISCONNECTED', user: 'RDR-205' }
  ];

  return (
    <div className="p-10 space-y-10 bg-[#0B101B] min-h-screen text-slate-300">
      {/* Header (ကိရိယာများ စောင့်ကြည့်မှု ခေါင်းစဉ်) */}
      <div className="flex justify-between items-center bg-[#05080F] p-10 rounded-[3rem] border border-white/5 shadow-2xl">
        <div className="flex items-center gap-6">
          <Button onClick={() => navigate(-1)} variant="ghost" className="p-0 hover:bg-transparent text-slate-500">
            <ArrowLeft size={32}/>
          </Button>
          <div>
            <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">
              {lang === 'en' ? 'Hardware Surveillance' : 'ကိရိယာများ စောင့်ကြည့်စစ်ဆေးမှု'}
            </h1>
            <p className="text-sky-500 font-mono text-[10px] mt-1 uppercase tracking-widest italic">
              L5_DEVICE_TELEMETRY • {lang === 'en' ? 'LIVE_CONNECTIVITY' : 'တိုက်ရိုက်_ချိတ်ဆက်မှုအခြေအနေ'}
            </p>
          </div>
        </div>
        <Button onClick={toggleLang} className="bg-white/5 border border-white/10 text-white h-12 px-8 rounded-xl shadow-lg">
           <Globe className="mr-2 h-4 w-4" /> {lang === 'en' ? "မြန်မာစာ" : "English"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Global Device Health KPIs */}
        {[
          { label: 'Active Devices', val: '142', icon: Smartphone, color: 'text-sky-500' },
          { label: 'Low Battery Alerts', val: '03', icon: Battery, color: 'text-rose-500' },
          { label: 'Network Uptime', val: '99.8%', icon: Wifi, color: 'text-emerald-500' },
          { label: 'Pending Syncs', val: '12', icon: RefreshCcw, color: 'text-amber-500' }
        ].map((kpi, i) => (
          <Card key={i} className="bg-[#05080F] border-none ring-1 ring-white/5 rounded-[2.5rem] p-8">
            <kpi.icon className={`h-6 w-6 mb-4 ${kpi.color}`} />
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{kpi.label}</p>
            <p className="text-3xl text-white font-black mt-2 italic tracking-tighter">{kpi.val}</p>
          </Card>
        ))}
      </div>

      {/* Device Registry Table (ကိရိယာများစာရင်း ဇယား) */}
      <Card className="bg-[#05080F] border-none ring-1 ring-white/5 rounded-[3rem] overflow-hidden">
        <div className="p-8 border-b border-white/5 flex justify-between items-center">
           <h2 className="text-xl font-black text-white uppercase italic flex items-center gap-3">
              <Activity className="text-emerald-500" /> {lang === 'en' ? 'Live Telemetry Grid' : 'တိုက်ရိုက် စစ်ဆေးမှုစနစ်'}
           </h2>
           <div className="relative w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input className="w-full bg-[#0B101B] border border-white/10 rounded-full h-12 pl-12 text-sm" placeholder="Search Device ID..." />
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
              <tr>
                <th className="p-8">Device Identity</th>
                <th className="p-8">Battery Status</th>
                <th className="p-8">Connectivity</th>
                <th className="p-8">Assigned User</th>
                <th className="p-8 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {devices.map((device) => (
                <tr key={device.id} className="group hover:bg-white/5 transition-all">
                  <td className="p-8">
                    <p className="text-white font-bold">{device.id}</p>
                    <p className="text-[10px] text-slate-500 font-mono uppercase">{device.type}</p>
                  </td>
                  <td className="p-8">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-white/5 rounded-full w-24 overflow-hidden">
                        <div className={`h-full ${device.battery < 20 ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${device.battery}%` }}></div>
                      </div>
                      <span className={`font-black text-xs ${device.battery < 20 ? 'text-rose-500 animate-pulse' : 'text-emerald-500'}`}>{device.battery}%</span>
                    </div>
                  </td>
                  <td className="p-8">
                    <div className="flex items-center gap-2">
                       <Wifi size={14} className={device.status === 'ONLINE' ? 'text-emerald-500' : 'text-slate-600'} />
                       <span className={`text-[10px] font-black uppercase ${device.status === 'ONLINE' ? 'text-emerald-500' : 'text-rose-500'}`}>{device.status}</span>
                    </div>
                  </td>
                  <td className="p-8 text-slate-400 font-mono text-xs italic">{device.user}</td>
                  <td className="p-8 text-right">
                    <Button variant="ghost" className="h-10 px-4 text-sky-400 hover:bg-sky-500/10 font-black text-[10px] uppercase">
                       Ping Device
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

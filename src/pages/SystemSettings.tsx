import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ShieldCheck, Key, Terminal, Eye, 
  Settings, Globe, Database, RefreshCw, 
  AlertTriangle, History 
} from 'lucide-react';

export default function SystemSettings() {
  const { toggleLang, lang } = useLanguage();
  
  // Enterprise Audit Log Mock Data (Bilingual)
  const auditLogs = [
    { id: 'LOG-882', actor: 'Super Admin', action: 'BLOCK_USER', target: 'RDR-205', time: '14:22:05', status: 'SUCCESS' },
    { id: 'LOG-881', actor: 'App Owner', action: 'UPDATE_TARIFF', target: 'YGN_ZONE_1', time: '13:15:20', status: 'SUCCESS' },
    { id: 'LOG-880', actor: 'Finance Admin', action: 'AUTHORIZE_PAYOUT', target: 'MERC-1024', time: '11:45:02', status: 'SUCCESS' }
  ];

  return (
    <div className="p-10 space-y-10 bg-[#0B101B] min-h-screen text-slate-300">
      {/* Executive Security Header (လုံခြုံရေးနှင့် စနစ်စီမံခန့်ခွဲမှု ခေါင်းစဉ်) */}
      <div className="flex justify-between items-center bg-[#05080F] p-10 rounded-[3rem] border border-white/5 shadow-2xl">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
            <Settings className="h-8 w-8 text-emerald-500" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">
              {lang === 'en' ? 'System Configuration' : 'စနစ်သတ်မှတ်ချက်များ'}
            </h1>
            <p className="text-emerald-500 font-mono text-[10px] mt-1 uppercase tracking-widest">
              {lang === 'en' ? 'L5_CORE_SURVEILLANCE' : 'အဆင့်_၅_အဓိကစောင့်ကြည့်စနစ်'}
            </p>
          </div>
        </div>
        <Button onClick={toggleLang} className="bg-white/5 border border-white/10 text-white h-12 px-8 rounded-xl shadow-lg">
           <Globe className="mr-2 h-4 w-4" /> {lang === 'en' ? "မြန်မာစာ" : "English"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* API & Key Management (API နှင့် လျှို့ဝှက်ကုဒ် စီမံခန့်ခွဲမှု) */}
        <Card className="lg:col-span-2 bg-[#05080F] border-none ring-1 ring-white/5 rounded-[3rem] p-10 space-y-8">
          <h2 className="text-2xl font-black text-white flex items-center gap-3">
            <Key className="text-sky-500" /> {lang === 'en' ? 'API Infrastructure' : 'API အခြေခံစနစ်'}
          </h2>
          <div className="space-y-6">
            {[
              { label: 'Mapbox Navigation Token', key: 'pk.eyJ1IjoibGl2ZS1tYXBib3gifQ...', status: 'ACTIVE' },
              { label: 'Supabase Database Key', key: 'eyJhbGciOiJIUzI1NiIsInR5cCI...', status: 'ACTIVE' },
              { label: 'SMS Gateway Provider', key: 'BTX_SECRET_9921_X...', status: 'MAINTENANCE' }
            ].map((api, i) => (
              <div key={i} className="bg-[#0B101B] p-6 rounded-2xl border border-white/5 flex justify-between items-center group">
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{api.label}</p>
                  <p className="font-mono text-xs text-white mt-2 opacity-40 group-hover:opacity-100 transition-opacity">{api.key}</p>
                </div>
                <div className="flex gap-2">
                   <Button variant="ghost" className="h-10 w-10 p-0 text-slate-500 hover:text-white"><Eye size={16}/></Button>
                   <Button variant="ghost" className="h-10 w-10 p-0 text-slate-500 hover:text-emerald-500"><RefreshCw size={16}/></Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Global System Toggles (စနစ်တစ်ခုလုံး ဆိုင်ရာ ခလုတ်များ) */}
        <Card className="bg-[#05080F] border-none ring-1 ring-white/5 rounded-[3rem] p-10 space-y-8">
          <h2 className="text-xl font-black text-white flex items-center gap-3">
            <Database className="text-emerald-500" /> {lang === 'en' ? 'Global Toggles' : 'စနစ်ထိန်းချုပ်မှုများ'}
          </h2>
          <div className="space-y-4">
            {[
              { label: 'New Registrations', desc: 'Allow new driver signups', active: true },
              { label: 'Merchant Payouts', desc: 'Enable automatic remittance', active: true },
              { label: 'Maintenance Mode', desc: 'Block all non-L5 access', active: false }
            ].map((tog, i) => (
              <div key={i} className="flex justify-between items-center p-4 bg-[#0B101B] rounded-2xl border border-white/5">
                <div>
                  <p className="text-sm font-bold text-white">{tog.label}</p>
                  <p className="text-[10px] text-slate-500">{tog.desc}</p>
                </div>
                <div className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${tog.active ? 'bg-emerald-600' : 'bg-slate-800'}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${tog.active ? 'right-1' : 'left-1'}`}></div>
                </div>
              </div>
            ))}
          </div>
          <Button className="w-full h-14 bg-rose-600/10 text-rose-500 hover:bg-rose-600 hover:text-white border border-rose-500/20 font-black rounded-xl transition-all">
            <AlertTriangle className="mr-2 h-5 w-5" /> {lang === 'en' ? 'Factory Reset Database' : 'စနစ်အားလုံးကို ဖျက်ပစ်မည်'}
          </Button>
        </Card>
      </div>

      {/* Immutable Audit Log (ပြောင်းလဲ၍မရသော လုံခြုံရေးမှတ်တမ်း) */}
      <Card className="bg-[#05080F] border-none ring-1 ring-white/5 rounded-[3rem] overflow-hidden">
        <div className="p-8 border-b border-white/5 flex justify-between items-center">
          <h2 className="text-xl font-black text-white uppercase italic flex items-center gap-3">
            <History className="text-sky-500" /> {lang === 'en' ? 'Sovereign Audit Trail' : 'အုပ်ချုပ်မှုဆိုင်ရာ စစ်ဆေးရေးမှတ်တမ်း'}
          </h2>
          <Button variant="ghost" className="text-[10px] font-black text-sky-500 uppercase tracking-widest hover:bg-sky-500/10">
            Export JSON Log
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-[10px] text-slate-500 font-mono uppercase tracking-widest">
              <tr>
                <th className="p-8">Event ID</th>
                <th className="p-8">Administrator</th>
                <th className="p-8">Action Taken</th>
                <th className="p-8">Target Entity</th>
                <th className="p-8">Timestamp</th>
                <th className="p-8 text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-white/5 transition-all group">
                  <td className="p-8 font-mono text-xs text-slate-500">{log.id}</td>
                  <td className="p-8 font-bold text-white">{log.actor}</td>
                  <td className="p-8">
                    <span className="bg-sky-500/10 text-sky-500 px-3 py-1 rounded-full text-[10px] font-black uppercase border border-sky-500/20">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-8 text-slate-400 font-mono text-xs">{log.target}</td>
                  <td className="p-8 text-slate-500 text-xs">{log.time}</td>
                  <td className="p-8 text-right">
                    <ShieldCheck className="inline-block text-emerald-500 h-5 w-5 opacity-40 group-hover:opacity-100 transition-opacity" />
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

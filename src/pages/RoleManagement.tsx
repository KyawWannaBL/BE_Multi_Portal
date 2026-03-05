import React, { useState, useEffect } from 'react';
import { useLanguageContext } from '@/lib/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Database, Save, UserCog, Check, X } from 'lucide-react';

// Added Official 'Administrator' Role below Super Admin
const ENTERPRISE_ROLES = [
  { code: 'SYS', name: 'Super Admin (App Owner)', level: 'L5' },
  { code: 'ADM', name: 'Administrator', level: 'L4' },
  { code: 'AUD', name: 'Chief Auditor', level: 'L4' },
  { code: 'FINM', name: 'Finance Manager', level: 'L3' },
  { code: 'BMG', name: 'Branch Manager', level: 'L3' },
  { code: 'HSC', name: 'Hub Sortation Coordinator', level: 'L2' },
  { code: 'CUR', name: 'Fleet Courier / Rider', level: 'L1' },
  { code: 'MER', name: 'Registered Merchant', level: 'L0' },
  { code: 'CUS', name: 'Retail Customer', level: 'L0' },
];

export default function RoleManagement() {
  const { t } = useLanguageContext();
  const [activeRole, setActiveRole] = useState(ENTERPRISE_ROLES[0]);
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Super Admin gets everything by default. Others depend on their tier.
    setPermissions({
      'FIN-01': activeRole.level === 'L5' || activeRole.level === 'L4' || activeRole.level === 'L3',
      'ADM-02': activeRole.level === 'L5' || activeRole.level === 'L4',
      'OPS-04': activeRole.level === 'L5' || activeRole.level === 'L4' || activeRole.level === 'L3',
      'SEC-01': activeRole.level === 'L5', // Only Super Admin can decrypt PII
    });
  }, [activeRole]);

  const handleToggle = (code: string, isAllowed: boolean) => {
    setPermissions(prev => ({ ...prev, [code]: isAllowed }));
  };

  return (
    <div className="p-10 space-y-10 bg-[#0B101B] min-h-screen text-slate-300">
      <div className="flex justify-between items-start bg-[#05080F] p-10 rounded-[3rem] shadow-2xl border border-white/5">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-white">Authority Matrix</h1>
          <p className="text-emerald-500 font-mono text-sm mt-2 tracking-widest uppercase">Global Role Configuration</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl h-14 px-10">
          <Save className="mr-2 h-6 w-6" /> Save Matrix
        </Button>
      </div>

      <div className="grid grid-cols-12 gap-10">
        <div className="col-span-4 space-y-3 h-[600px] overflow-y-auto pr-2">
          {ENTERPRISE_ROLES.map(role => {
            const isActive = activeRole.code === role.code;
            return (
              <button key={role.code} onClick={() => setActiveRole(role)}
                className={`w-full p-6 rounded-[2rem] text-left transition-all border-2 flex items-center justify-between ${
                  isActive ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-lg' : 'bg-white/5 border-transparent text-slate-400 hover:bg-white/10'
                }`}
              >
                <div>
                  <p className="font-black text-lg">{role.name}</p>
                  <p className={`text-xs font-mono mt-1 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`}>{role.code} • {role.level}</p>
                </div>
                <UserCog className={`h-6 w-6 ${isActive ? 'text-emerald-500' : 'text-slate-600'}`} />
              </button>
            );
          })}
        </div>

        <Card className="col-span-8 rounded-[3rem] border-none shadow-2xl bg-[#05080F] ring-1 ring-white/5">
          <CardHeader className="bg-white/5 p-8 border-b border-white/5">
            <CardTitle className="text-2xl font-black text-white flex items-center gap-4">
              <Database className="text-emerald-500 h-8 w-8" /> {activeRole.name} Authority Level
            </CardTitle>
          </CardHeader>
          <CardContent className="p-10 grid grid-cols-1 gap-6">
            <RedGreenToggle label="Financial Disbursal Approval" code="FIN-01" allowed={!!permissions['FIN-01']} onChange={handleToggle} disabled={activeRole.code === 'SYS'} />
            <RedGreenToggle label="Manage Users & Merchants" code="ADM-02" allowed={!!permissions['ADM-02']} onChange={handleToggle} disabled={activeRole.code === 'SYS'} />
            <RedGreenToggle label="Logistics & Waybill Overrides" code="OPS-04" allowed={!!permissions['OPS-04']} onChange={handleToggle} disabled={activeRole.code === 'SYS'} />
            <RedGreenToggle label="Super Admin Deep Encryption Access" code="SEC-01" allowed={!!permissions['SEC-01']} onChange={handleToggle} disabled={activeRole.code === 'SYS'} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function RedGreenToggle({ label, code, allowed, onChange, disabled }: any) {
  return (
    <div className={`flex items-center justify-between p-6 bg-white/5 rounded-[2rem] border border-white/5 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <div>
        <p className="font-black text-white text-lg">{label}</p>
        <p className="text-[10px] font-mono text-slate-500 mt-1 uppercase">MODULE: {code}</p>
      </div>
      <div className="flex bg-[#0B101B] rounded-xl p-1 border border-white/10">
        <button onClick={() => onChange(code, true)} className={`flex items-center gap-2 px-6 py-3 rounded-lg font-black text-sm transition-all ${allowed ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'text-slate-500'}`}>
          <Check className="h-4 w-4" /> ALLOW
        </button>
        <button onClick={() => onChange(code, false)} className={`flex items-center gap-2 px-6 py-3 rounded-lg font-black text-sm transition-all ${!allowed ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.2)]' : 'text-slate-500'}`}>
          <X className="h-4 w-4" /> DENY
        </button>
      </div>
    </div>
  );
}

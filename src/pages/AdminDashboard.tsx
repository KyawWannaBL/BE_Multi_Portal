import React from 'react';
import { ShieldAlert, Users, Settings, Database, Activity, Terminal, Lock } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { useAuth } from '../hooks/useAuth';
import AuditFeed from '@/components/AuditFeed';
import FleetStatus from '@/components/FleetStatus';

export default function AdminDashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-10 pb-20 max-w-[1650px] mx-auto animate-in fade-in duration-1000">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Lock className="h-4 w-4 text-emerald-500" />
            <span className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-bold">Root Authority Control</span>
          </div>
          <h1 className="text-4xl font-bold text-luxury-cream tracking-tight">System <span className="text-luxury-gold uppercase">Administration</span></h1>
          <p className="text-white/40 text-sm mt-2">Identity Verified: <span className="text-white font-medium">{user?.full_name}</span></p>
        </div>
        <div className="luxury-glass px-6 py-3 rounded-2xl border border-emerald-500/20 flex items-center gap-3">
           <Activity className="h-4 w-4 text-emerald-500" /><span className="text-[11px] font-mono text-emerald-500 uppercase tracking-widest">Global Health: 99.9%</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Metrics... Users, Database, Security, Latency */}
        <Card className="luxury-card border-none group"><CardContent className="p-8 flex gap-6 items-center"><Users className="text-luxury-gold" /><div><p className="text-[10px] text-white/30 uppercase">Personnel</p><span className="text-2xl font-bold text-luxury-cream font-mono">1,248</span></div></CardContent></Card>
        <Card className="luxury-card border-none group"><CardContent className="p-8 flex gap-6 items-center"><Database className="text-blue-400" /><div><p className="text-[10px] text-white/30 uppercase">DB Sync</p><span className="text-2xl font-bold text-luxury-cream font-mono">Healthy</span></div></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <div className="luxury-glass rounded-[2.5rem] p-10 border border-white/5 h-[600px] flex flex-col items-center justify-center text-center space-y-6">
             <Settings className="h-12 w-12 text-luxury-gold animate-spin-slow" />
             <h3 className="text-2xl font-bold text-luxury-cream">System Configuration Engine</h3>
             <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-2xl mt-8">
                {['User Roles', 'Branch Setup', 'API Keys', 'Gateways', 'Audit Logs', 'Backups'].map((tool) => (
                  <button key={tool} className="p-4 rounded-2xl border border-white/5 hover:border-luxury-gold/40 hover:bg-white/5 transition-all text-[11px] uppercase tracking-widest font-bold">{tool}</button>
                ))}
             </div>
          </div>
        </div>
        <div className="lg:col-span-4 space-y-8"><AuditFeed /><FleetStatus /></div>
      </div>
    </div>
  );
}
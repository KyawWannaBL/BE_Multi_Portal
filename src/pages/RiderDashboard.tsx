import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Package, Map, Wallet, ShieldCheck, 
  Navigation, Globe, Power, Zap, Clock 
} from 'lucide-react';
import { LuxuryKpiStrip } from '@/components/RiderDashboardSidecar';

export default function RiderDashboard() {
  const [isActivated, setIsActivated] = React.useState(false);
  const [isActivated, setIsActivated] = React.useState(false);
  const { lang, toggleLang } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0B101B] text-slate-300 p-4 space-y-4">
      {/* Header with Shift Status */}
      <div className="flex justify-between items-center bg-[#05080F] p-6 rounded-3xl border border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
            <ShieldCheck className="text-emerald-500 h-5 w-5" />
          </div>
          <div>
            <h1 className="font-black text-white text-sm uppercase tracking-widest">
              {lang === 'en' ? 'Shift Active' : 'တာဝန်စတင်နေသည်'}
            </h1>
            <p className="text-[8px] text-emerald-500 font-mono">ID: RDR-2026-09</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={toggleLang} variant="ghost" className="h-10 w-10 p-0 border border-white/5 rounded-full">
            <Globe className="h-4 w-4" />
          </Button>
          <Button variant="ghost" className="h-10 w-10 p-0 border border-rose-500/20 text-rose-500 rounded-full">
            <Power className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Luxury KPI Strip (From Sidecar) */}
      <LuxuryKpiStrip remainingParcels={ygnSequence.length} etdToNextStopText="15m" shiftSuccessRatePct={98.4} />

      {/* Main Action Grid */}
      <div className="grid grid-cols-2 gap-4">
        <Card onClick={() => navigate('/rider/delivery')} className="bg-[#05080F] border-none ring-1 ring-white/5 p-6 rounded-3xl space-y-3 cursor-pointer hover:ring-sky-500/50 transition-all">
          <div className="p-3 bg-sky-500/10 rounded-2xl w-fit"><Package className="text-sky-500 h-6 w-6" /></div>
          <p className="text-white font-black text-xs uppercase tracking-widest">{lang === 'en' ? 'Deliveries' : 'ပို့ဆောင်ရန်'}</p>
        </Card>
        <Card onClick={() => navigate('/rider/tags')} className="bg-[#05080F] border-none ring-1 ring-white/5 p-6 rounded-3xl space-y-3 cursor-pointer hover:ring-emerald-500/50 transition-all">
          <div className="p-3 bg-emerald-500/10 rounded-2xl w-fit"><Zap className="text-emerald-500 h-6 w-6" /></div>
          <p className="text-white font-black text-xs uppercase tracking-widest">{lang === 'en' ? 'Tag Management' : 'တက်ဂ်စီမံမှု'}</p>
        </Card>
        <Card onClick={() => navigate('/rider/wallet')} className="bg-[#05080F] border-none ring-1 ring-white/5 p-6 rounded-3xl space-y-3 cursor-pointer hover:ring-amber-500/50 transition-all">
          <div className="p-3 bg-amber-500/10 rounded-2xl w-fit"><Wallet className="text-amber-500 h-6 w-6" /></div>
          <p className="text-white font-black text-xs uppercase tracking-widest">{lang === 'en' ? 'Wallet' : 'ပိုက်ဆံအိတ်'}</p>
        </Card>
        <Card onClick={() => navigate('/rider/map')} className="bg-[#05080F] border-none ring-1 ring-white/5 p-6 rounded-3xl space-y-3 cursor-pointer hover:ring-rose-500/50 transition-all">
          <div className="p-3 bg-rose-500/10 rounded-2xl w-fit"><Navigation className="text-rose-500 h-6 w-6" /></div>
          <p className="text-white font-black text-xs uppercase tracking-widest">{lang === 'en' ? 'Way Plan' : 'လမ်းကြောင်း'}</p>
        </Card>
      </div>

      {/* Live Map Preview Area */}
      <div className="h-64 rounded-3xl bg-[#05080F] border border-white/5 overflow-hidden relative flex items-center justify-center">
         <div className="absolute inset-0 bg-sky-500/5 animate-pulse" />
         <Map className="text-sky-500/20 h-12 w-12" />
         <span className="absolute bottom-4 text-[10px] font-mono text-slate-500">Mapbox_Live_Active</span>
      </div>
    </div>
  );
}

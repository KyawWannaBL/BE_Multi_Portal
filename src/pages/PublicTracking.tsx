import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Search, Package, Truck, CheckCircle2, 
  Map as MapIcon, Globe, Navigation, 
  Clock, ShieldCheck, Headphones, ArrowRight 
} from 'lucide-react';

export default function PublicTracking() {
  const { lang, toggleLang } = useLanguage();
  const [trackingId, setTrackingId] = useState('');
  const [isFound, setIsFound] = useState(false);

  // High-Fidelity Milestone Logic (Bilingual)
  const milestones = [
    { statusEn: 'DELIVERED', statusMy: 'ပို့ဆောင်ပြီး', loc: 'Recipient Home', time: 'Today 14:30', done: true },
    { statusEn: 'OUT_FOR_DELIVERY', statusMy: 'ပို့ဆောင်ရန်ထွက်ခွာပြီ', loc: 'Yangon Hub', time: 'Today 09:00', done: true },
    { statusEn: 'IN_TRANSIT', statusMy: 'လမ်းခရီးတွင်', loc: 'Expressway', time: 'Yesterday 18:00', done: true },
    { statusEn: 'ORDER_PLACED', statusMy: 'အမှာစာလက်ခံရရှိသည်', loc: 'Merchant Warehouse', time: 'Yesterday 10:00', done: true }
  ];

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if(trackingId.length > 5) setIsFound(true);
  };

  return (
    <div className="min-h-screen bg-[#0B101B] text-slate-300 font-sans">
      {/* Dynamic Navbar */}
      <nav className="p-6 flex justify-between items-center bg-[#05080F]/50 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center">
            <Package className="text-white h-5 w-5" />
          </div>
          <span className="font-black text-white uppercase italic tracking-tighter">Britium <span className="text-sky-500 text-xs">Express</span></span>
        </div>
        <Button onClick={toggleLang} variant="outline" className="border-white/10 text-xs rounded-full h-10 px-6">
           <Globe className="mr-2 h-4 w-4" /> {lang === 'en' ? "မြန်မာစာ" : "English"}
        </Button>
      </nav>

      <div className="max-w-6xl mx-auto p-10 space-y-12">
        {/* Hero Search Section */}
        <section className="text-center space-y-8">
           <h1 className="text-5xl font-black text-white uppercase italic tracking-tighter">
              {lang === 'en' ? 'Track Your Cargo' : 'ကုန်စည် ခြေရာခံခြင်း'}
           </h1>
           <form onSubmit={handleTrack} className="max-w-2xl mx-auto relative group">
              <div className="absolute inset-0 bg-sky-500/20 blur-2xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity" />
              <input 
                className="w-full h-20 bg-[#05080F] border border-white/10 rounded-full px-10 text-xl text-white outline-none focus:border-sky-500 transition-all relative"
                placeholder={lang === 'en' ? "Enter AWB / Tracking ID..." : "ခြေရာခံနံပါတ် ရိုက်ထည့်ပါ..."}
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
              />
              <Button type="submit" className="absolute right-3 top-3 h-14 px-10 bg-sky-600 hover:bg-sky-500 text-white font-black rounded-full uppercase tracking-widest">
                {lang === 'en' ? 'Track' : 'ရှာမည်'}
              </Button>
           </form>
        </section>

        {isFound && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 animate-in fade-in slide-in-from-bottom-10 duration-700">
            {/* Milestone Timeline (ခြေရာခံမှု အဆင့်ဆင့်) */}
            <Card className="lg:col-span-1 bg-[#05080F] border-none ring-1 ring-white/5 rounded-[3rem] p-10 space-y-8 h-fit">
               <div className="flex justify-between items-center border-b border-white/5 pb-6">
                  <div>
                    <p className="text-[10px] font-black text-sky-500 uppercase font-mono">{trackingId}</p>
                    <h2 className="text-xl font-bold text-white uppercase italic">{lang === 'en' ? 'Status: Delivered' : 'အခြေအနေ: ပို့ဆောင်ပြီး'}</h2>
                  </div>
                  <CheckCircle2 className="text-emerald-500 h-8 w-8" />
               </div>
               
               <div className="space-y-8 relative">
                  <div className="absolute left-[11px] top-2 bottom-10 w-0.5 bg-white/5" />
                  {milestones.map((m, i) => (
                    <div key={i} className="flex gap-6 relative">
                       <div className={`w-6 h-6 rounded-full border-4 border-[#05080F] z-10 ${m.done ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-slate-800'}`} />
                       <div className="flex-1">
                          <p className={`font-black text-sm ${m.done ? 'text-white' : 'text-slate-600'}`}>{lang === 'en' ? m.statusEn : m.statusMy}</p>
                          <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase">{m.loc} • {m.time}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </Card>

            {/* Map & Security Information (မြေပုံနှင့် လုံခြုံရေး) */}
            <div className="lg:col-span-2 space-y-8">
               <Card className="bg-[#05080F] border-none ring-1 ring-white/5 rounded-[3rem] overflow-hidden min-h-[400px] relative">
                  <div className="absolute inset-0 bg-[#0B101B] flex items-center justify-center opacity-40">
                     <Navigation size={60} className="text-sky-500 animate-pulse rotate-45" />
                  </div>
                  <div className="absolute top-6 left-6 bg-[#05080F]/90 backdrop-blur-xl p-4 rounded-2xl border border-white/5">
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Live Delivery Hub</p>
                     <p className="text-white font-bold text-sm">North Okkalapa Sector</p>
                  </div>
               </Card>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-white/5 border-none p-8 rounded-[2.5rem] flex items-center gap-6">
                     <ShieldCheck className="text-emerald-500 h-10 w-10 shrink-0" />
                     <div>
                        <p className="text-white font-black text-sm uppercase italic">Verified Protection</p>
                        <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mt-1">SEC-01 Tamper Tag Active</p>
                     </div>
                  </Card>
                  <Card onClick={() => navigate('/support')} className="bg-sky-500/5 border-none p-8 rounded-[2.5rem] flex items-center gap-6 cursor-pointer hover:bg-sky-500/10 transition-all">
                     <Headphones className="text-sky-500 h-10 w-10 shrink-0" />
                     <div>
                        <p className="text-white font-black text-sm uppercase italic">Need Assistance?</p>
                        <p className="text-[10px] text-sky-500 font-mono uppercase tracking-widest mt-1">Direct Help Line</p>
                     </div>
                  </Card>
               </div>
            </div>
          </div>
        )}
      </div>

      {/* Public Footer */}
      <footer className="p-10 border-t border-white/5 text-center">
         <p className="text-[10px] font-mono text-slate-600 uppercase tracking-[0.4em]">© 2026 Britium Express • Yangon_Mandalay_Naypyitaw</p>
      </footer>
    </div>
  );
}

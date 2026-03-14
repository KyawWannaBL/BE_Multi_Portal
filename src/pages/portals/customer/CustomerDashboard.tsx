import React, { useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Package, Search, MessageSquare, CheckCircle2, Clock, Globe, 
  MapPin, Truck, Box, ArrowRight, ShieldCheck, User
} from 'lucide-react';
import toast from 'react-hot-toast';

const CustomerTracking = ({ t }: { t: Function }) => {
  const [trackingId, setTrackingId] = useState('');
  const [trackingData, setTrackingData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingId) return;
    setIsLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      setTrackingData({
        id: trackingId.toUpperCase(),
        status: 'IN_TRANSIT',
        sender: 'Fashion Hub MM',
        receiver: 'Daw Su Su',
        destination: 'Yangon, Kamayut',
        timeline: [
          { time: '10:30 AM, Today', event: t('Out for delivery', 'ပို့ဆောင်ရန် ထွက်ခွာသွားပါပြီ'), location: 'Yangon Hub', done: false, current: true },
          { time: '08:15 AM, Today', event: t('Arrived at local facility', 'ဒေသတွင်းစင်တာသို့ ရောက်ရှိပါပြီ'), location: 'Yangon Hub', done: true, current: false },
          { time: '09:00 PM, Yesterday', event: t('Picked up from Merchant', 'ရောင်းချသူထံမှ လက်ခံရရှိပါပြီ'), location: 'Merchant Store', done: true, current: false },
        ]
      });
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#05080F] text-slate-200 font-sans relative pb-24">
      {/* Customer Top Bar */}
      <div className="h-16 border-b border-white/5 bg-[#0B101B]/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
          <span className="font-black text-white tracking-[0.2em] uppercase text-sm">Britium<span className="text-amber-500">Express</span></span>
        </div>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase hover:text-white transition-all">
            <Globe size={14} /> {t('Language', 'ဘာသာစကား')}
          </button>
          <div className="h-8 border-l border-white/10 mx-2"></div>
          <button className="text-xs font-bold text-amber-500 uppercase tracking-widest hover:text-amber-400">
            {t('Login', 'အကောင့်ဝင်မည်')}
          </button>
        </div>
      </div>

      {/* Main Tracking Hero */}
      <div className="max-w-3xl mx-auto px-6 pt-16 pb-8">
        <div className="text-center mb-12 animate-in slide-in-from-bottom-4 duration-500">
          <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter mb-4">
            {t("Track Your Package", "သင့်ပစ္စည်းကို ခြေရာခံပါ")}
          </h1>
          <p className="text-gray-400 text-sm">
            {t("Enter your Waybill or Tracking Number below for live updates.", "သင့် အော်ဒါနံပါတ် သို့မဟုတ် ခြေရာခံနံပါတ်ကို ရိုက်ထည့်ပါ။")}
          </p>
        </div>

        <form onSubmit={handleTrack} className="relative max-w-2xl mx-auto animate-in slide-in-from-bottom-6 duration-700">
          <div className="absolute inset-0 bg-amber-500/20 blur-2xl rounded-full"></div>
          <div className="relative flex items-center bg-[#0A0E17] border border-amber-500/30 rounded-2xl p-2 shadow-2xl">
            <Search className="w-6 h-6 text-amber-500 ml-4" />
            <input 
              type="text" 
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              placeholder="e.g. BR-982144X" 
              className="flex-1 bg-transparent border-none text-white px-4 py-4 outline-none font-mono text-lg placeholder:text-gray-600 uppercase"
            />
            <button type="submit" disabled={isLoading} className="bg-amber-600 hover:bg-amber-500 text-black px-8 py-4 rounded-xl font-black uppercase tracking-widest transition-all">
              {isLoading ? <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div> : t('Track', 'ရှာမည်')}
            </button>
          </div>
        </form>

        {/* Tracking Results */}
        {trackingData && (
          <div className="mt-12 bg-[#0A0E17] border border-white/5 rounded-[2rem] p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-white/5 pb-8 gap-4">
              <div>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{t("Tracking ID", "ခြေရာခံနံပါတ်")}</p>
                <h2 className="text-3xl font-black text-white font-mono mt-1">{trackingData.id}</h2>
              </div>
              <div className="px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 font-black uppercase tracking-widest text-xs flex items-center gap-2">
                <Truck size={16} /> {t("In Transit", "ပို့ဆောင်နေဆဲ")}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white/5 rounded-xl text-gray-400"><Box size={20} /></div>
                <div><p className="text-[10px] text-gray-500 uppercase tracking-widest">{t("From", "ပေးပို့သူ")}</p><p className="font-bold text-white mt-1">{trackingData.sender}</p></div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white/5 rounded-xl text-amber-500"><MapPin size={20} /></div>
                <div><p className="text-[10px] text-gray-500 uppercase tracking-widest">{t("Destination", "ခရီးဆုံး")}</p><p className="font-bold text-white mt-1">{trackingData.destination}</p></div>
              </div>
            </div>

            {/* Timeline */}
            <div className="relative pl-6 space-y-8 before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
              {trackingData.timeline.map((event: any, idx: number) => (
                <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className={`flex items-center justify-center w-6 h-6 rounded-full border-4 border-[#0A0E17] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow absolute left-0 md:left-1/2 -translate-x-1/2 ${event.current ? 'bg-amber-500 animate-pulse' : event.done ? 'bg-emerald-500' : 'bg-gray-700'}`}></div>
                  <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] bg-white/5 p-4 rounded-xl border border-white/5 shadow">
                    <div className="flex items-center justify-between mb-1">
                      <div className={`font-bold ${event.current ? 'text-amber-400' : 'text-white'}`}>{event.event}</div>
                    </div>
                    <div className="text-[10px] font-mono text-gray-500">{event.time} • {event.location}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Floating Chat Widget */}
      <button onClick={() => toast.success(t("Connecting to Live Agent...", "ကိုယ်စားလှယ်နှင့် ချိတ်ဆက်နေပါသည်..."))} className="fixed bottom-8 right-8 w-16 h-16 bg-amber-600 hover:bg-amber-500 text-black rounded-full shadow-[0_0_30px_rgba(217,119,6,0.3)] flex items-center justify-center z-50 transition-all hover:scale-110 active:scale-95">
        <MessageSquare className="w-8 h-8" />
        <span className="absolute top-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-[#05080F] rounded-full animate-pulse" />
      </button>

      {/* Status Ticker */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-white/5 bg-[#0B101B]/90 backdrop-blur flex justify-center gap-8 py-3 text-[10px] uppercase tracking-widest font-bold text-gray-500">
        <div className="flex items-center gap-2"><CheckCircle2 size={12} className="text-emerald-500" /> {t("Systems Operational", "စနစ် ပုံမှန်အလုပ်လုပ်နေသည်")}</div>
        <div className="flex items-center gap-2"><Clock size={12} className="text-amber-500" /> {t("Avg. Support Response: 3m", "ပျမ်းမျှ တုံ့ပြန်ချိန်: ၃ မိနစ်")}</div>
      </div>
    </div>
  );
};

export default function CustomerDashboard() {
  const langCtx = useLanguage?.() ?? {};
  const currentLang = langCtx.lang || 'en';
  const t = (en: string, my: string) => currentLang === 'en' ? en : my;
  return <CustomerTracking t={t} />;
}

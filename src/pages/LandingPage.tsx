import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Globe, ArrowRight, MapPin, Zap } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const [lang, setLang] = useState('EN');
  const [tracking, setTracking] = useState('');

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (tracking) {
      alert(lang === 'EN' ? `Searching for: ${tracking}` : `ရှာဖွေနေပါသည်: ${tracking}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B101B] flex flex-col font-sans text-slate-300 selection:bg-emerald-500/30">
      <header className="h-24 px-6 md:px-10 flex items-center justify-between border-b border-white/5 bg-[#05080F]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 md:h-12 md:w-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Package className="text-white h-6 w-6" />
          </div>
          <span className="text-xl md:text-2xl font-black text-white tracking-tighter uppercase">
            Britium <span className="text-emerald-500">Express</span>
          </span>
        </div>
        
        <div className="flex items-center gap-4 md:gap-6">
          <button 
            onClick={() => setLang(lang === 'EN' ? 'MY' : 'EN')}
            className="flex items-center gap-2 px-3 md:px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs md:text-sm font-bold transition-all text-white"
          >
            <Globe className="h-4 w-4 text-emerald-500" /> 
            <span className="hidden md:inline">{lang === 'EN' ? 'EN / MY' : 'မြန်မာ / EN'}</span>
            <span className="md:hidden">{lang}</span>
          </button>
          <button 
            onClick={() => navigate('/login')}
            className="px-4 md:px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl transition-all shadow-lg shadow-emerald-900/20 flex items-center gap-2 text-xs md:text-sm"
          >
            {lang === 'EN' ? 'Portal Login' : 'စနစ်ဝင်ရန်'} <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-10 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] md:w-[800px] md:h-[800px] bg-emerald-500/10 rounded-full blur-[100px] md:blur-[120px] pointer-events-none"></div>

        <div className="max-w-4xl w-full text-center space-y-8 relative z-10 mt-10 md:mt-0">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-[10px] md:text-sm tracking-widest uppercase">
            <Zap className="h-4 w-4" /> 
            {lang === 'EN' ? 'Nationwide Logistics Network' : 'နိုင်ငံတစ်ဝှမ်း ထောက်ပံ့ပို့ဆောင်ရေး ကွန်ရက်'}
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tighter uppercase leading-[1.1]">
            {lang === 'EN' ? 'Deliver with' : 'ယုံကြည်စိတ်ချစွာ'} <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600">
              {lang === 'EN' ? 'Precision' : 'ပို့ဆောင်ပါ'}
            </span>
          </h1>
          
          <p className="text-base md:text-xl text-slate-400 max-w-2xl mx-auto font-medium">
            {lang === 'EN' 
              ? 'Enterprise-grade courier services powering businesses across Myanmar. Track your shipments in real-time.' 
              : 'မြန်မာတစ်နိုင်ငံလုံးရှိ စီးပွားရေးလုပ်ငန်းများကို ပံ့ပိုးပေးနေသော ထိပ်တန်း ပို့ဆောင်ရေးဝန်ဆောင်မှု။'}
          </p>

          <form onSubmit={handleTrack} className="max-w-2xl mx-auto mt-12 bg-[#05080F]/80 backdrop-blur-xl p-3 md:p-4 rounded-[2rem] border border-white/10 flex flex-col sm:flex-row gap-4 shadow-2xl focus-within:border-emerald-500/50 transition-colors">
            <div className="flex-1 flex items-center px-4 py-2 md:py-0">
              <MapPin className="h-6 w-6 text-emerald-500 mr-4 shrink-0" />
              <input 
                type="text" 
                placeholder={lang === 'EN' ? 'Enter Waybill (e.g., BRT-10001)' : 'ပို့ဆောင်မှု အမှတ်စဉ် ထည့်ပါ'}
                value={tracking}
                onChange={(e) => setTracking(e.target.value.toUpperCase())}
                className="w-full bg-transparent border-none text-white text-lg font-black outline-none placeholder:text-slate-600 placeholder:font-bold"
              />
            </div>
            <button 
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-2xl font-black transition-all flex items-center justify-center uppercase tracking-widest text-sm"
            >
              {lang === 'EN' ? 'Track Package' : 'ရှာဖွေမည်'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

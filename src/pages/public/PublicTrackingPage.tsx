import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Search, Package, Truck, MapPin, CheckCircle2, 
  Clock, Navigation, ShieldCheck, Box 
} from 'lucide-react';

interface TrackingEvent {
  time: string;
  location: string;
  status: string;
  description: string;
  completed: boolean;
  current: boolean;
}

interface TrackingResult {
  awb: string;
  merchant: string;
  recipient: string;
  destination: string;
  weight: string;
  cod: number;
  events: TrackingEvent[];
}

export default function PublicTrackingPage() {
  const { lang, toggleLang } = useLanguage();
  const t = (en: string, my: string) => (lang === 'en' ? en : my);

  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TrackingResult | null>(null);
  const [searched, setSearched] = useState(false);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setSearched(true);
    
    // Mock API Call
    setTimeout(() => {
      setLoading(false);
      
      // Simulate finding a package
      if (searchQuery.toUpperCase().includes('BE')) {
        setResult({
          awb: searchQuery.toUpperCase(),
          merchant: 'Tech Store MM',
          recipient: 'U Aung ***',
          destination: 'Mandalay, Chan Aye Tharzan',
          weight: '2.5 kg',
          cod: 145000,
          events: [
            { time: 'Today, 10:45 AM', location: 'Mandalay Hub', status: 'Out for Delivery', description: 'Package is with the rider and will be delivered today.', completed: false, current: true },
            { time: 'Today, 06:15 AM', location: 'Mandalay Hub', status: 'Arrived at Destination Hub', description: 'Package has been received at the final delivery hub.', completed: true, current: false },
            { time: 'Yesterday, 08:30 PM', location: 'Yangon Transit Center', status: 'In Transit', description: 'Package has departed the origin facility.', completed: true, current: false },
            { time: 'Yesterday, 02:10 PM', location: 'Yangon (Merchant)', status: 'Picked Up', description: 'Package secured and picked up by Britium Express.', completed: true, current: false },
          ]
        });
      } else {
        setResult(null); // Not found
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#05080F] text-slate-200 font-sans selection:bg-blue-500/30 flex flex-col">
      
      {/* 🌐 Public Nav */}
      <header className="px-6 py-4 flex justify-between items-center border-b border-white/5 bg-[#0A0F1C]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.4)]">
            <Navigation className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-black text-white tracking-widest uppercase leading-tight">Britium Express</h1>
            <p className="text-[10px] text-blue-400 font-bold tracking-[0.2em] uppercase">Logistics Tracking</p>
          </div>
        </div>
        <button onClick={toggleLang} className="px-4 py-2 bg-[#0E1525] border border-white/5 text-gray-400 hover:text-white rounded-full text-[10px] font-black transition-colors">
          {lang === 'en' ? 'MY' : 'EN'}
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center p-6 mt-8 max-w-3xl mx-auto w-full">
        
        {/* Search Area */}
        <div className="w-full text-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
            {t('Track your', 'သင်၏ကုန်ပစ္စည်းကို')} <span className="text-blue-500">{t('Package.', 'ခြေရာခံပါ။')}</span>
          </h2>
          <p className="text-sm text-gray-500 mb-8 max-w-md mx-auto">
            {t('Enter your AWB or tracking number below to see real-time updates on your delivery.', 'သင်၏ ဘေလ်နံပါတ်ကို ရိုက်ထည့်၍ ကုန်ပစ္စည်းရောက်ရှိမည့် အခြေအနေကို စစ်ဆေးပါ။')}
          </p>

          <form onSubmit={handleTrack} className="relative max-w-xl mx-auto group">
            <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
            <div className="relative flex items-center bg-[#0E1525] border border-white/10 rounded-2xl p-2 focus-within:border-blue-500 transition-colors shadow-2xl">
              <Search className="h-6 w-6 text-gray-500 ml-4" />
              <input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent px-4 py-4 text-lg font-mono text-white placeholder:text-gray-600 outline-none uppercase"
                placeholder="e.g. BE82719283MM"
              />
              <button 
                type="submit"
                disabled={loading || !searchQuery}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg"
              >
                {loading ? <Clock className="h-4 w-4 animate-spin mx-auto" /> : t('TRACK', 'ရှာမည်')}
              </button>
            </div>
          </form>
        </div>

        {/* Results Area */}
        {searched && !loading && (
          <div className="w-full animate-in fade-in slide-in-from-bottom-8 duration-500">
            {result ? (
              <div className="space-y-6">
                
                {/* Package Summary Card */}
                <div className="bg-gradient-to-br from-[#0E1525] to-[#0A0F1C] border border-blue-500/30 rounded-[2rem] p-6 md:p-8 shadow-2xl">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-6 mb-6">
                    <div>
                      <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest flex items-center gap-2 mb-1">
                        <ShieldCheck className="h-3 w-3" /> {t('Verified Consignment', 'အတည်ပြုပြီးသော ကုန်ပစ္စည်း')}
                      </p>
                      <h3 className="text-2xl font-black font-mono text-white uppercase">{result.awb}</h3>
                    </div>
                    <div className="text-left md:text-right bg-[#0A0F1C] px-4 py-2 rounded-xl border border-white/5">
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t('Cash to Collect', 'ပေးချေရမည့်ငွေ')}</p>
                      <p className="text-lg font-black text-emerald-400 font-mono mt-0.5">{result.cod.toLocaleString()} MMK</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{t('From', 'ပေးပို့သူ')}</p>
                      <p className="text-sm font-bold text-white mt-1">{result.merchant}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{t('To', 'လက်ခံသူ')}</p>
                      <p className="text-sm font-bold text-white mt-1">{result.recipient}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{t('Destination', 'ပို့ဆောင်မည့်နေရာ')}</p>
                      <p className="text-sm font-bold text-white mt-1 line-clamp-1">{result.destination}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{t('Weight', 'အလေးချိန်')}</p>
                      <p className="text-sm font-bold text-white mt-1">{result.weight}</p>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="bg-[#0E1525] border border-white/5 rounded-[2rem] p-6 md:p-8 shadow-xl">
                  <h3 className="text-sm font-black text-white uppercase tracking-widest mb-8">{t('Delivery History', 'ပို့ဆောင်မှု မှတ်တမ်း')}</h3>
                  
                  <div className="space-y-8 relative before:absolute before:inset-0 before:ml-[1.125rem] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-blue-500 before:via-blue-500/20 before:to-transparent">
                    {result.events.map((event, idx) => (
                      <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        {/* Icon Marker */}
                        <div className={`flex items-center justify-center w-9 h-9 rounded-full border-4 border-[#0E1525] shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 ${
                          event.current ? 'bg-blue-500 text-white animate-pulse' : 
                          event.completed ? 'bg-[#0A0F1C] text-blue-500' : 'bg-[#0A0F1C] text-gray-600'
                        }`}>
                          {event.current ? <Truck className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                        </div>
                        
                        {/* Content Card */}
                        <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border border-white/5 bg-[#0A0F1C] shadow">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1 gap-2">
                            <span className={`font-black uppercase tracking-wider text-sm ${event.current ? 'text-blue-400' : event.completed ? 'text-white' : 'text-gray-500'}`}>
                              {event.status}
                            </span>
                            <span className="text-[10px] font-mono text-gray-500">{event.time}</span>
                          </div>
                          <p className="text-xs text-gray-400 mt-2">{event.description}</p>
                          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1 mt-3">
                            <MapPin className="h-3 w-3" /> {event.location}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ) : (
              <div className="bg-[#0E1525] border border-white/5 rounded-[2rem] p-12 flex flex-col items-center justify-center text-center">
                <Box className="h-16 w-16 text-rose-500/50 mb-4" />
                <h3 className="text-xl font-black text-white uppercase tracking-widest">{t('Not Found', 'ရှာမတွေ့ပါ')}</h3>
                <p className="text-sm text-gray-500 mt-2 max-w-sm">
                  {t('We could not find a package with that AWB. Please check the number and try again.', 'ထိုဘေလ်နံပါတ်ဖြင့် ကုန်ပစ္စည်းကို ရှာမတွေ့ပါ။ နံပါတ်မှန်ကန်မှုရှိမရှိ စစ်ဆေးပြီး ပြန်လည်ကြိုးစားကြည့်ပါ။')}
                </p>
              </div>
            )}
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="text-center py-6 border-t border-white/5 text-[10px] font-bold text-gray-600 uppercase tracking-widest">
        © 2026 Britium Express Logistics. All rights reserved.
      </footer>
    </div>
  );
}

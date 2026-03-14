import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  ArrowLeft, Map, Navigation, Search, 
  User, Clock, Package, ShieldCheck, 
  AlertTriangle, Phone, Crosshair
} from 'lucide-react';

interface ActiveRider {
  id: string;
  name: string;
  phone: string;
  status: 'ON_TRACK' | 'DELAYED' | 'IDLE';
  zone: string;
  completed: number;
  remaining: number;
  lastPing: string;
}

export default function OperationsTrackingPage() {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const t = (en: string, my: string) => (lang === 'en' ? en : my);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRider, setSelectedRider] = useState<string | null>('R-001');

  // Mock Fleet Data
  const fleet: ActiveRider[] = [
    { id: 'R-001', name: 'Kyaw Zin', phone: '09-12345678', status: 'ON_TRACK', zone: 'Downtown', completed: 42, remaining: 15, lastPing: '2 mins ago' },
    { id: 'R-002', name: 'Aung Htet', phone: '09-87654321', status: 'DELAYED', zone: 'North Dagon', completed: 18, remaining: 30, lastPing: '15 mins ago' },
    { id: 'R-003', name: 'Zaw Min', phone: '09-55555555', status: 'IDLE', zone: 'Bahan', completed: 55, remaining: 0, lastPing: '1 hour ago' },
  ];

  const filteredFleet = fleet.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeRiderData = fleet.find(r => r.id === selectedRider);

  return (
    <div className="min-h-screen bg-[#0A0F1C] text-slate-200 font-sans selection:bg-indigo-500/30">
      
      {/* 🌐 App Bar */}
      <header className="px-8 py-5 flex items-center gap-4 border-b border-white/5 bg-[#0A0F1C]/90 backdrop-blur-md sticky top-0 z-50">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 bg-[#0E1525] rounded-full border border-white/5 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-sm font-black uppercase tracking-widest text-white">
            {t('Fleet Tracking', 'ယာဉ်များခြေရာခံခြင်း')}
          </h1>
          <p className="text-[10px] text-indigo-400 font-bold tracking-[0.2em] uppercase">
            {t('Live Operations', 'လက်ရှိလုပ်ငန်းစဉ်များ')}
          </p>
        </div>
      </header>

      <main className="p-8 max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 mt-4 h-[calc(100vh-120px)]">
        
        {/* LEFT PANE: Rider Roster */}
        <div className="lg:col-span-4 flex flex-col bg-[#0E1525] border border-white/5 rounded-[2rem] overflow-hidden animate-in fade-in slide-in-from-left-8 duration-500">
          
          <div className="p-6 border-b border-white/5 bg-[#0A0F1C]/50 space-y-4">
            <h2 className="text-xs font-black uppercase tracking-widest text-gray-400">
              {t('Active Roster', 'လက်ရှိနယ်ဆင်းဝန်ထမ်းများ')}
            </h2>
            <div className="bg-[#0A0F1C] p-3 rounded-xl border border-white/5 flex items-center gap-3 focus-within:border-indigo-500/50 transition-colors">
              <Search className="h-4 w-4 text-gray-500" />
              <input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-sm text-white placeholder:text-gray-600 outline-none"
                placeholder={t('Search riders...', 'ရှာဖွေရန်...')}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {filteredFleet.map(rider => (
              <button
                key={rider.id}
                onClick={() => setSelectedRider(rider.id)}
                className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between ${
                  selectedRider === rider.id 
                    ? 'bg-indigo-500/10 border-indigo-500/50 shadow-[0_0_15px_rgba(79,70,229,0.15)]' 
                    : 'bg-[#0A0F1C] border-white/5 hover:border-gray-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    rider.status === 'ON_TRACK' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 
                    rider.status === 'DELAYED' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]' : 'bg-gray-500'
                  }`} />
                  <div>
                    <p className={`text-sm font-bold ${selectedRider === rider.id ? 'text-white' : 'text-gray-300'}`}>{rider.name}</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">{rider.id} • {rider.zone}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT PANE: Map & Telemetry Details */}
        <div className="lg:col-span-8 flex flex-col gap-6 animate-in fade-in slide-in-from-right-8 duration-500">
          
          {/* Top Telemetry Cards */}
          {activeRiderData ? (
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-[#0E1525] p-5 rounded-2xl border border-white/5 flex items-center gap-4">
                <div className="p-3 bg-emerald-500/10 rounded-xl"><Package className="h-6 w-6 text-emerald-500" /></div>
                <div>
                  <p className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">{t('Success Rate', 'အောင်မြင်မှုနှုန်း')}</p>
                  <p className="text-xl font-black text-white mt-0.5">
                    {Math.round((activeRiderData.completed / (activeRiderData.completed + activeRiderData.remaining)) * 100) || 0}%
                  </p>
                </div>
              </div>
              <div className="bg-[#0E1525] p-5 rounded-2xl border border-white/5 flex items-center gap-4">
                <div className="p-3 bg-amber-500/10 rounded-xl"><Clock className="h-6 w-6 text-amber-500" /></div>
                <div>
                  <p className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">{t('Parcels Left', 'ကျန်ရှိသောပါဆယ်')}</p>
                  <p className="text-xl font-black text-white mt-0.5">{activeRiderData.remaining}</p>
                </div>
              </div>
              <div className="bg-[#0E1525] p-5 rounded-2xl border border-white/5 flex items-center gap-4">
                <div className="p-3 bg-indigo-500/10 rounded-xl"><Navigation className="h-6 w-6 text-indigo-400" /></div>
                <div>
                  <p className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">{t('Last Ping', 'နောက်ဆုံးဆက်သွယ်မှု')}</p>
                  <p className="text-sm font-bold text-white mt-1">{activeRiderData.lastPing}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-[92px] bg-[#0E1525] rounded-2xl border border-white/5 flex items-center justify-center">
              <p className="text-xs font-bold tracking-widest text-gray-500 uppercase">{t('Select a rider to view telemetry', 'ဝန်ထမ်းကိုရွေးချယ်ပါ')}</p>
            </div>
          )}

          {/* Interactive Map Area (Mock representation) */}
          <div className="flex-1 bg-[#0E1525] border border-white/5 rounded-[2rem] relative overflow-hidden flex flex-col">
            {/* Map Overlay Header */}
            <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-start pointer-events-none">
              {activeRiderData && (
                <div className="bg-[#0A0F1C]/90 backdrop-blur-md border border-white/10 p-4 rounded-2xl pointer-events-auto flex items-center gap-4 shadow-2xl">
                  <div className="w-10 h-10 bg-indigo-500/20 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-indigo-400" />
                  </div>
                  <div>
                    <p className="font-bold text-white">{activeRiderData.name}</p>
                    <p className="text-[10px] text-indigo-400 font-bold tracking-widest uppercase flex items-center gap-1 mt-1">
                      <Phone className="h-3 w-3" /> {activeRiderData.phone}
                    </p>
                  </div>
                  {activeRiderData.status === 'DELAYED' && (
                    <div className="ml-4 px-3 py-1 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-full text-[10px] font-black tracking-widest flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" /> {t('ATTENTION', 'သတိပြုရန်')}
                    </div>
                  )}
                </div>
              )}
              
              <button className="bg-[#0A0F1C]/90 backdrop-blur-md border border-white/10 p-3 rounded-xl pointer-events-auto hover:bg-indigo-500/20 hover:text-indigo-400 transition-colors">
                <Crosshair className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            {/* Tactical Map Grid Background */}
            <div className="flex-1 relative bg-[#05080F] flex items-center justify-center">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
              
              {/* Radar Ping Animation for selected rider */}
              {activeRiderData && (
                <div className="relative z-10 flex items-center justify-center">
                  <div className={`absolute w-32 h-32 rounded-full animate-ping opacity-20 ${
                    activeRiderData.status === 'ON_TRACK' ? 'bg-emerald-500' : 
                    activeRiderData.status === 'DELAYED' ? 'bg-rose-500' : 'bg-gray-500'
                  }`} />
                  <div className="w-12 h-12 bg-[#0A0F1C] border-2 border-indigo-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(79,70,229,0.5)] z-10 relative">
                    <Navigation className="h-5 w-5 text-indigo-400 transform rotate-45" />
                  </div>
                </div>
              )}

              {!activeRiderData && (
                <div className="flex flex-col items-center opacity-30">
                  <Map className="h-16 w-16 text-gray-500 mb-4" />
                  <p className="text-sm font-bold tracking-widest uppercase text-gray-500">{t('Map Offline', 'မြေပုံပိတ်ထားသည်')}</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

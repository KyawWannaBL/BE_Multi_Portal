import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Store, UserPlus, Search, Globe, MapPin, 
  ShieldCheck, Package, ExternalLink, Filter 
} from 'lucide-react';

export default function Merchants() {
  const { t, toggleLang, lang } = useLanguage();
  const [view, setView] = useState<'list' | 'provision'>('list');

  // Enterprise Mock Data
  const merchantRegistry = [
    { id: 'M-1024', name: 'Yangon Tech Spares', city: 'Yangon', type: 'Electronics', status: 'ACTIVE' },
    { id: 'M-2055', name: 'Mandalay Fashion House', city: 'Mandalay', type: 'Apparel', status: 'PENDING' },
    { id: 'M-3088', name: 'NPT Office Supplies', city: 'Nay Pyi Taw', type: 'Stationery', status: 'ACTIVE' }
  ];

  return (
    <div className="p-10 space-y-8 bg-[#0B101B] min-h-screen text-slate-300">
      {/* Dynamic Bilingual Header */}
      <div className="flex justify-between items-center bg-[#05080F] p-10 rounded-[3rem] border border-white/5 shadow-2xl">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-sky-500/10 rounded-2xl border border-sky-500/20">
            <Store className="h-8 w-8 text-sky-500" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic">
              {lang === 'en' ? 'Merchant Management' : 'ကုန်သည် စီမံခန့်ခွဲမှု'}
            </h1>
            <p className="text-sky-500 font-mono text-xs mt-1 uppercase tracking-widest">
              {lang === 'en' ? 'L5_PARTNER_PROVISIONING' : 'အဆင့်_၅_ကုန်သည်_မှတ်ပုံတင်ခြင်း'}
            </p>
          </div>
        </div>
        <div className="flex gap-4">
          <Button onClick={() => setView(view === 'list' ? 'provision' : 'list')} className="bg-sky-600 hover:bg-sky-500 text-white font-black h-12 px-6 rounded-xl">
             <UserPlus className="mr-2 h-5 w-5" /> {lang === 'en' ? 'Provision Merchant' : 'ကုန်သည်အသစ်ဖွင့်ရန်'}
          </Button>
          <Button onClick={toggleLang} className="bg-white/5 border border-white/10 text-white h-12 px-6 rounded-xl">
            <Globe className="mr-2 h-4 w-4" /> {lang === 'en' ? "မြန်မာစာ" : "English"}
          </Button>
        </div>
      </div>

      {view === 'list' ? (
        <div className="space-y-6">
          {/* Search & Filters */}
          <div className="flex gap-4 items-center bg-[#05080F] p-6 rounded-2xl border border-white/5">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input className="w-full bg-[#0B101B] border border-white/10 rounded-xl h-12 pl-12 pr-6 text-sm" placeholder={lang === 'en' ? "Search Merchant ID or Business Name..." : "ကုန်သည် အိုင်ဒီ (သို့) အမည်ဖြင့် ရှာဖွေရန်..."} />
            </div>
            <Button variant="outline" className="h-12 border-white/10 text-slate-400"><Filter className="mr-2 h-4 w-4"/> {lang === 'en' ? 'Filters' : 'စစ်ထုတ်ရန်'}</Button>
          </div>

          {/* Merchant Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {merchantRegistry.map((m) => (
              <Card key={m.id} className="bg-[#05080F] border-none ring-1 ring-white/5 rounded-[2.5rem] overflow-hidden group hover:ring-sky-500/50 transition-all duration-300">
                <CardContent className="p-8 space-y-6">
                  <div className="flex justify-between items-start">
                    <div className="p-3 bg-white/5 rounded-xl"><Package className="h-6 w-6 text-sky-400" /></div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${m.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                      {m.status}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-sky-400 transition-colors">{m.name}</h3>
                    <p className="text-slate-500 font-mono text-xs mt-1 uppercase tracking-widest">{m.id} • {m.type}</p>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <MapPin className="h-4 w-4" /> {m.city}
                  </div>
                  <div className="pt-6 border-t border-white/5 flex gap-2">
                    <Button variant="ghost" className="flex-1 text-xs font-bold text-slate-500 hover:text-white uppercase tracking-widest">
                       {lang === 'en' ? 'Edit Profile' : 'ပြင်ဆင်ရန်'}
                    </Button>
                    <Button className="flex-1 bg-white/5 hover:bg-sky-600 text-sky-400 hover:text-white font-black text-xs h-10 rounded-xl transition-all">
                       {lang === 'en' ? 'Launch Portal' : 'ပေါ်တယ်ဖွင့်ရန်'} <ExternalLink className="ml-2 h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        /* Merchant Onboarding Form (Provisioning) */
        <Card className="bg-[#05080F] border-none ring-1 ring-white/5 rounded-[3rem] p-12 max-w-4xl mx-auto">
          <h2 className="text-2xl font-black text-white mb-8 flex items-center gap-4">
            <ShieldCheck className="text-emerald-500 h-8 w-8"/> {lang === 'en' ? 'New Merchant Provisioning' : 'ကုန်သည်အသစ် မှတ်ပုံတင်ခြင်း'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{lang === 'en' ? 'Business Legal Name' : 'လုပ်ငန်းအမည်'}</label>
              <input className="w-full bg-[#0B101B] border border-white/10 rounded-2xl h-14 px-6 text-white focus:border-sky-500 outline-none" placeholder="e.g. Britium Wholesale" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{lang === 'en' ? 'Region / Hub' : 'ဒေသ / ဗဟို'}</label>
              <select className="w-full bg-[#0B101B] border border-white/10 rounded-2xl h-14 px-6 text-white outline-none">
                <option>Yangon Hub</option>
                <option>Mandalay Hub</option>
                <option>Nay Pyi Taw Hub</option>
              </select>
            </div>
            <div className="md:col-span-2 pt-8">
              <Button onClick={() => setView('list')} className="w-full bg-sky-600 hover:bg-sky-500 text-white font-black h-16 rounded-2xl text-lg shadow-xl shadow-sky-900/20 uppercase tracking-widest">
                {lang === 'en' ? 'Verify & Create Merchant Account' : 'စစ်ဆေးပြီး အကောင့်ဖွင့်မည်'}
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

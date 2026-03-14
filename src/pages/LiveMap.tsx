import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Map } from 'lucide-react';
export default function LiveMap() {
  const { lang } = useLanguage();
  return (
    <div className="h-full flex flex-col items-center justify-center text-slate-500 font-mono animate-in fade-in duration-500">
      <Map size={64} className="mb-6 opacity-20 text-emerald-500" />
      <h1 className="text-3xl font-black text-white tracking-widest uppercase mb-2">Live Telemetry</h1>
      <p className="text-xs uppercase tracking-widest">{lang === 'en' ? 'Module Initialization Pending...' : 'စနစ်ပြင်ဆင်နေပါသည်...'}</p>
    </div>
  );
}

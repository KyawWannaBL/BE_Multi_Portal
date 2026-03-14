import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Globe, MapPin, Package, QrCode, Route, Warehouse } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function RiderDashboard() {
  const navigate = useNavigate();
  const ctx: any = useLanguage?.() ?? {};
  const lang = ctx.lang || ctx.language || 'en';
  const toggleLang = ctx.toggleLang || ctx.toggleLanguage || (() => {});
  const t = (en: string, my: string) => (lang === 'en' ? en : my);

  const cards = [
    { icon: Package, label: t('Create delivery', 'Delivery ဖန်တီး'), path: '/create-delivery' },
    { icon: QrCode, label: t('Pickup execution', 'Pickup ဆောင်ရွက်မှု'), path: '/portal/execution/pickup' },
    { icon: Warehouse, label: t('Warehouse inbound', 'Warehouse inbound'), path: '/portal/execution/drop' },
    { icon: MapPin, label: t('Delivery proof', 'Delivery proof'), path: '/portal/execution/delivery' },
    { icon: Box, label: t('Parcel intake OCR', 'Parcel intake OCR'), path: '/portal/execution/parcel-intake' },
    { icon: Route, label: t('Live navigation', 'Live navigation'), path: '/portal/execution/navigation' },
  ];

  return (
    <div className="min-h-screen bg-[#08101B] p-6 text-slate-200 selection:bg-emerald-500/30">
      <header className="mb-8 flex items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-300">Enterprise field operations</div>
          <h1 className="mt-2 text-xl font-black uppercase tracking-widest text-white">{t('Execution hub', 'လုပ်ငန်းဆောင်ရွက်မှုဗဟို')}</h1>
          <p className="mt-2 text-sm text-white/60">{t('Backend-connected, bilingual, and production-ready workflow entry points.', 'Backend-connected, bilingual, production-ready workflow entry points ဖြစ်ပါသည်။')}</p>
        </div>
        <button onClick={toggleLang} className="rounded-full border border-white/10 bg-white/5 p-3 text-white"><Globe className="h-5 w-5" /></button>
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <button key={card.path} onClick={() => navigate(card.path)} className="rounded-3xl border border-white/10 bg-[#0D1626] p-6 text-left transition hover:border-emerald-500/40 hover:bg-[#101b2f]">
              <Icon className="h-8 w-8 text-emerald-400" />
              <div className="mt-5 text-sm font-black uppercase tracking-[0.16em] text-white">{card.label}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

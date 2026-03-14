import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowLeft } from 'lucide-react';

export default function TagBatchManagement() {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const t = (en: string, my: string) => (lang === 'en' ? en : my);

  return (
    <div className="min-h-screen bg-[#0A0F1C] text-slate-200 p-6">
      <header className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 bg-[#0E1525] rounded-full text-gray-400">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="text-xs font-black uppercase tracking-widest text-white">{t('Tag Management', 'တက်ဂ်စီမံမှု')}</h1>
      </header>
      <div className="text-center text-gray-500 py-10">Module Ready</div>
    </div>
  );
}

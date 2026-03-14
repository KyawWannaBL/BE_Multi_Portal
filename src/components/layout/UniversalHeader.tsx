import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Globe, ShieldCheck, User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function UniversalHeader({ title }: { title: string }) {
  const { lang, toggleLang } = useLanguage();
  const { user, legacyUser, logout } = useAuth() as any;
  const navigate = useNavigate();

  const activeEmail = user?.email || legacyUser?.email || "User";
  const role = (legacyUser?.role || user?.user_metadata?.role || "GUEST").toUpperCase();

  return (
    <header className="sticky top-0 z-50 bg-[#0A0F1C]/90 backdrop-blur-md border-b border-white/5 px-6 py-4 flex justify-between items-center shadow-2xl">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
          <ShieldCheck className="h-5 w-5 text-blue-400" />
        </div>
        <div>
          <h1 className="text-sm font-black text-white uppercase tracking-widest">{title}</h1>
          <p className="text-[10px] text-gray-500 font-bold uppercase">{role} SESSION</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* 🇲🇲 Language Toggle */}
        <button 
          onClick={toggleLang} 
          className="flex items-center gap-2 px-4 py-2 bg-[#0E1525] border border-white/10 hover:border-blue-500 rounded-full transition-all group"
        >
          <Globe className="h-4 w-4 text-gray-400 group-hover:text-blue-400" />
          <span className="text-[10px] font-black text-white">
            {lang === 'en' ? 'MYANMAR (🇲🇲)' : 'ENGLISH (🇺🇸)'}
          </span>
        </button>

        <div className="h-8 w-px bg-white/5 mx-2" />

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-white">{activeEmail}</p>
            <p className="text-[10px] text-blue-500 font-mono">ID: {user?.id?.slice(0,8)}</p>
          </div>
          <button onClick={() => logout()} className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-full transition-colors">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

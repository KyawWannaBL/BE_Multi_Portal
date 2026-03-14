import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { UserCircle, Shield } from 'lucide-react';

export default function UserProfileWidget() {
  const { user, legacyUser } = useAuth() as any;
  const { lang } = useLanguage();
  const t = (en: string, my: string) => (lang === 'en' ? en : my);

  const activeEmail = user?.email || legacyUser?.email || "user@britium.com";
  const rawRole = legacyUser?.role || user?.role || user?.user_metadata?.role || user?.app_role || "GUEST";
  const role = String(rawRole).toUpperCase();

  return (
    <div className="bg-[#0E1525] border border-white/10 rounded-[2rem] p-6 flex items-center gap-6 shadow-xl mb-6">
      <div className="p-4 bg-white/5 rounded-full border border-white/10 shrink-0">
        <UserCircle className="h-12 w-12 text-gray-400" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 text-blue-500 mb-1">
          <Shield className="h-3 w-3"/> 
          <p className="text-[10px] font-black tracking-widest uppercase">{role}</p>
        </div>
        <p className="text-xl font-black text-white truncate">{activeEmail}</p>
        <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-bold">Britium Authorized Session</p>
      </div>
    </div>
  );
}

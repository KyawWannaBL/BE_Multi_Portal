import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { useLanguageContext } from '@/lib/LanguageContext';

export default function ProtectedRoute() {
  const { t } = useLanguageContext();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // 1. Check current session on mount
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };
    
    checkSession();

    // 2. Listen for auth changes (e.g., if user logs out from another tab)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // SHOW ENTERPRISE LOADING STATE WHILE VERIFYING
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#05080F] flex flex-col items-center justify-center font-sans space-y-6">
        <div className="relative">
          <div className="h-20 w-20 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
            <ShieldCheck className="h-10 w-10 text-emerald-500" />
          </div>
          <Loader2 className="absolute -inset-2 h-24 w-24 text-emerald-500/50 animate-spin" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-white font-black tracking-widest uppercase text-sm">
            {t('Verifying Security Clearance', 'လုံခြုံရေး အဆင့်အတန်း စစ်ဆေးနေသည်')}
          </h2>
          <p className="text-[10px] font-mono text-emerald-500 uppercase">L5_SYS_ENCRYPTED_HANDSHAKE</p>
        </div>
      </div>
    );
  }

  // REDIRECT IF NOT LOGGED IN, OTHERWISE RENDER SECURE PAGES
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

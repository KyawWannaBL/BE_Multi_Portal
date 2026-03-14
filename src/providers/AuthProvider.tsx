import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

type AppUser = {
  id: string;
  email: string;
  role: string;
  must_change_password: boolean;
};

type AuthContextType = {
  session: Session | null;
  user: AppUser | null;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType>({ session: null, user: null, isLoading: true });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchUserProfile = async (currentSession: Session | null) => {
      if (!currentSession) {
        if (mounted) {
          setSession(null);
          setUser(null);
          setIsLoading(false);
        }
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('id, email, role, must_change_password')
          .eq('id', currentSession.user.id)
          .single();

        if (error) throw error;

        if (mounted) {
          setSession(currentSession);
          setUser(profile as AppUser);
        }
      } catch (error) {
        console.error('[AUTH FAULT] Failed to fetch identity profile:', error);
        if (mounted) {
          setSession(null);
          setUser(null);
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    // 1. Get initial session on boot
    supabase.auth.getSession().then(({ data: { session } }) => {
      fetchUserProfile(session);
    });

    // 2. Listen for SSO callbacks, logins, and logouts
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      fetchUserProfile(session);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ session, user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

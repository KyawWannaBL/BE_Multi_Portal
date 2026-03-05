import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useEnhancedAuth() {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role_code')
          .eq('id', session.user.id)
          .single();
        setUser(session.user);
        setRole(profile?.role_code || 'CUS');
      }
      setLoading(false);
    };
    getSession();
  }, []);

  return { user, role, loading };
}

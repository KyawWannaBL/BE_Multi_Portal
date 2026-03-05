import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

export default function useSessionHeartbeat() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const interval = setInterval(async () => {
      await supabase
        .from('active_sessions')
        .update({ last_seen: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('is_active', true);
    }, 15000); // 15 sec heartbeat

    return () => clearInterval(interval);
  }, [user]);
}

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function useRealtimeMetrics() {
  const [metrics, setMetrics] = useState({ pending: 0, transitTime: '1.4 Days' });

  useEffect(() => {
    const fetchStats = async () => {
      // Calls a Postgres function to get aggregated counts
      const { data } = await supabase.rpc('get_dashboard_stats');
      if (data) setMetrics(data);
    };

    fetchStats();

    // Subscribe to any change in the orders table
    const channel = supabase
      .channel('db-metrics')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchStats)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return metrics;
}
import { supabase } from '@/lib/supabase';

export const logisticsAPI = {
  // Deep connect with backend for real-time shipment tracking
  getShipments: async () => {
    const { data, error } = await supabase
      .from('shipments')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  // Enterprise-level status management
  updateWayStatus: async (wayId: string, status: string) => {
    const { data, error } = await supabase
      .from('ways')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', wayId);
    if (error) throw error;
    return data;
  }
};

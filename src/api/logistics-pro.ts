import { supabase } from '@/lib/supabase';
import { SHIPMENT_STATUS } from '@/lib/index';

export const logisticsProAPI = {
  // Production fetch for all Way types (Pickup, Deliver, Failed, Returned, Transit)
  getWayManagementData: async (type: string) => {
    const { data, error } = await supabase
      .from('way_items')
      .select('*')
      .eq('way_type', type)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  // Deep update for Way statuses with audit logging
  updateWayStatus: async (wayId: string, status: string, notes?: string) => {
    const { data, error } = await supabase.rpc('update_way_status_with_audit', {
      p_way_id: wayId,
      p_status: status,
      p_notes: notes,
      p_updated_by: (await supabase.auth.getUser()).data.user?.id
    });
    if (error) throw error;
    return data;
  }
};

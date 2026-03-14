import { supabase } from './supabase';

export type AuditAction = 'ROUTE_OPTIMIZE' | 'PRICE_UPDATE' | 'STATUS_CHANGE' | 'LOGIN_FAILURE';

export const createAuditLog = async (
  action: AuditAction, 
  details: string, 
  metadata: any = {}
) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  const { error } = await supabase.from('audit_logs').insert({
    user_id: user?.id,
    action,
    details,
    metadata: {
      ...metadata,
      browser: navigator.userAgent,
      timestamp: new Date().toISOString()
    }
  });

  if (error) console.error("Audit Logging Failed:", error);
};
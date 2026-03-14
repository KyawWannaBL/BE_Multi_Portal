import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export const SecurityGatekeeper: React.FC<Props> = ({ children, allowedRoles }) => {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [needsPasswordReset, setNeedsPasswordReset] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkSecurity = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setAuthorized(false);
        setLoading(false);
        return;
      }

      // 🔍 Check Profile for Role and Password Change Flag
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, requires_password_change')
        .eq('id', user.id)
        .single();

      if (profile) {
        setNeedsPasswordReset(profile.requires_password_change);
        
        // If they need a reset but aren't on the reset page, they aren't "authorized" for the dashboard
        if (profile.requires_password_change) {
          setAuthorized(false);
        } else if (!allowedRoles || allowedRoles.includes(profile.role) || profile.role === 'SUPER_ADMIN') {
          setAuthorized(true);
        } else {
          setAuthorized(false);
        }
      }
      setLoading(false);
    };

    checkSecurity();
  }, [allowedRoles]);

  if (loading) {
    return (
      <div className="h-screen w-full bg-[#05080F] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  // 1. If not logged in -> Login
  if (!authorized && !needsPasswordReset) return <Navigate to="/login" replace />;

  // 2. 🔥 THE TRAP: If logged in but reset required -> Reset Page
  if (needsPasswordReset && location.pathname !== '/auth/reset-password') {
    return <Navigate to="/auth/reset-password" replace />;
  }

  return <>{children}</>;
};

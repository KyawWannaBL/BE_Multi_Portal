import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { defaultPortalForRole } from '@/lib/portalRegistry';
export default function DashboardRedirect() {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (loading) return;
    if (!user) { navigate('/login', { replace: true }); return; }
    navigate(defaultPortalForRole(role), { replace: true });
  }, [user, role, loading, navigate]);
  return <div className="min-h-screen bg-[#05080F] flex items-center justify-center"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent animate-spin rounded-full" /></div>;
}

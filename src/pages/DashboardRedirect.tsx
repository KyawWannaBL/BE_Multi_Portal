import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardRedirect() {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }
    
    const r = (role || 'GUEST').toUpperCase();
    if (["SUPER_ADMIN", "APP_OWNER", "SYS", "SUPER_A"].includes(r)) {
        navigate("/portal/admin/executive", { replace: true });
    } else if (r.includes("FINANCE")) {
        navigate("/portal/finance", { replace: true });
    } else if (["RIDER", "DRIVER", "HELPER"].includes(r)) {
        navigate("/portal/execution", { replace: true });
    } else {
        navigate("/portal/operations", { replace: true });
    }
  }, [user, role, loading, navigate]);

  return (
    <div className="min-h-screen bg-[#05080F] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent animate-spin rounded-full" />
    </div>
  );
}

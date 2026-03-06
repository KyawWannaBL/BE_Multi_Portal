import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export function RequireRole({ allow, children }: { allow: string[]; children: React.ReactNode }) {
  const { role, loading } = useAuth();
  if (loading) return null;
  const userRole = (role || '').toUpperCase();
  if (!allow.includes(userRole)) {
     return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

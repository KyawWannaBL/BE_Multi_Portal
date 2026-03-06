import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export function RequireAuth() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-[#05080F] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent animate-spin rounded-full" />
      </div>
    );
  }
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

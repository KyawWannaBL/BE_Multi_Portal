import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CustomerShell } from '@/components/layout/CustomerShell';
import { UserCircle } from 'lucide-react';

const CustomerDashboard = React.lazy(() => import('./customer/CustomerDashboard'));

const CustomerLoader = () => (
  <div className="min-h-screen bg-[#05080F] flex flex-col items-center justify-center">
    <UserCircle className="h-10 w-10 text-cyan-500 animate-pulse mb-4" />
    <p className="text-[10px] font-bold tracking-[0.3em] text-cyan-500/70 uppercase">Loading Profile...</p>
  </div>
);

export default function CustomerPortal() {
  return (
    <Suspense fallback={<CustomerLoader />}>
      <Routes>
        <Route path="/" element={<CustomerDashboard />} />
        <Route path="*" element={<Navigate to="/portal/customer" replace />} />
      </Routes>
    </Suspense>
  );
}

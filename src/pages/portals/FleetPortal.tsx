import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Truck } from 'lucide-react';

const FleetDashboard = React.lazy(() => import('./fleet/FleetDashboard'));

const FleetLoader = () => (
  <div className="min-h-screen bg-[#05080F] flex flex-col items-center justify-center">
    <Truck className="h-10 w-10 text-slate-500 animate-bounce mb-4" />
    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Inspecting Fleet...</p>
  </div>
);

export default function FleetPortal() {
  return (
    <Suspense fallback={<FleetLoader />}>
      <Routes>
        <Route path="/" element={<FleetDashboard />} />
        <Route path="*" element={<Navigate to="/portal/fleet" replace />} />
      </Routes>
    </Suspense>
  );
}

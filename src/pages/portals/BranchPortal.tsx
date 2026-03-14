import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MapPin } from 'lucide-react';

const BranchDashboard = React.lazy(() => import('./branch/BranchDashboard'));
const BranchInbound = React.lazy(() => import('./branch/BranchInbound'));
const BranchOutbound = React.lazy(() => import('./branch/BranchOutbound'));

const BranchLoader = () => (
  <div className="min-h-screen bg-[#05080F] flex flex-col items-center justify-center">
    <MapPin className="h-10 w-10 text-orange-500 animate-pulse mb-4" />
    <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Hub Syncing...</p>
  </div>
);

export default function BranchPortal() {
  return (
    <Suspense fallback={<BranchLoader />}>
      <Routes>
        <Route path="/" element={<BranchDashboard />} />
        <Route path="/inbound" element={<BranchInbound />} />
        <Route path="/dispatch" element={<BranchOutbound />} />
        <Route path="*" element={<Navigate to="/portal/branch" replace />} />
      </Routes>
    </Suspense>
  );
}

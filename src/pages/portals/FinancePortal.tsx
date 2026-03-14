import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { FinanceShell } from '@/components/layout/FinanceShell';
import { Wallet, Loader2 } from 'lucide-react';

const RiderReconciliation = React.lazy(() => import('./finance/RiderReconciliation'));
const MerchantPayouts = React.lazy(() => import('./finance/MerchantPayouts'));

// Placeholder for Dashboard
const FinanceDashboard = () => (
  <FinanceShell title="Finance Dashboard">
    <div className="h-[60vh] flex flex-col items-center justify-center text-gray-600">
      <Wallet className="h-16 w-16 opacity-20 mb-4" />
      <p className="text-sm font-bold tracking-widest uppercase">Overview Metrics Pending</p>
    </div>
  </FinanceShell>
);

const FinanceLoader = () => (
  <div className="min-h-screen bg-[#0A0F1C] flex flex-col items-center justify-center">
    <Wallet className="h-10 w-10 text-teal-500 animate-pulse mb-4" />
    <p className="text-[10px] font-bold tracking-[0.3em] text-teal-500/70 uppercase">Loading Finance Module...</p>
  </div>
);

export default function FinancePortal() {
  return (
    <Suspense fallback={<FinanceLoader />}>
      <Routes>
        <Route path="/" element={<FinanceDashboard />} />
        <Route path="/rider-recon" element={<RiderReconciliation />} />
        <Route path="/merchant-payout" element={<MerchantPayouts />} />
        <Route path="*" element={<Navigate to="/portal/finance" replace />} />
      </Routes>
    </Suspense>
  );
}

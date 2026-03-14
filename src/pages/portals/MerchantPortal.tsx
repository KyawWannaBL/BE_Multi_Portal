import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MerchantShell } from '@/components/layout/MerchantShell';
import { Store } from 'lucide-react';

const MerchantDashboard = React.lazy(() => import('./merchant/MerchantDashboard'));

// Placeholders for expanded routes
const BulkUpload = () => <MerchantShell title="Bulk Upload"><div className="p-10 text-center text-gray-500">Upload Excel Templates Here</div></MerchantShell>;
const Payouts = () => <MerchantShell title="Payouts"><div className="p-10 text-center text-gray-500">COD Ledger View</div></MerchantShell>;

const MerchantLoader = () => (
  <div className="min-h-screen bg-[#05080F] flex flex-col items-center justify-center">
    <Store className="h-10 w-10 text-indigo-500 animate-pulse mb-4" />
  </div>
);

export default function MerchantPortal() {
  return (
    <Suspense fallback={<MerchantLoader />}>
      <Routes>
        <Route path="/" element={<MerchantDashboard />} />
        <Route path="/orders" element={<BulkUpload />} />
        <Route path="/payouts" element={<Payouts />} />
        <Route path="*" element={<Navigate to="/portal/merchant" replace />} />
      </Routes>
    </Suspense>
  );
}

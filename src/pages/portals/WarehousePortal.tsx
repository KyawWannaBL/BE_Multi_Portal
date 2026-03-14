import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from 'lucide-react';

const InventoryList = React.lazy(() => import('./warehouse/InventoryList'));

const WMSLoader = () => (
  <div className="min-h-screen bg-[#05080F] flex flex-col items-center justify-center">
    <Box className="h-10 w-10 text-indigo-500 animate-bounce mb-4" />
    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Organizing Hub...</p>
  </div>
);

export default function WarehousePortal() {
  return (
    <Suspense fallback={<WMSLoader />}>
      <Routes>
        <Route path="/" element={<InventoryList />} />
        <Route path="/inventory" element={<InventoryList />} />
        {/* Placeholder routes for future expansion */}
        <Route path="/racks" element={<InventoryList />} />
        <Route path="/scanning" element={<InventoryList />} />
        <Route path="*" element={<Navigate to="/portal/warehouse" replace />} />
      </Routes>
    </Suspense>
  );
}

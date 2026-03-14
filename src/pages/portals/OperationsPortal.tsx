import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { OperationsShell } from '@/components/layout/OperationsShell';
import { Activity } from 'lucide-react';

const LogisticsWayPlanning = React.lazy(() => import('./operations/LogisticsWayPlanning'));
const LogisticsMonitoringPage = React.lazy(() => import('./operations/LogisticsMonitoringPage'));

const OpsDashboard = () => (
  <OperationsShell title="Operations Dashboard">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-[#0E1525] border border-white/5 p-8 rounded-[2rem]">
        <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-2">Welcome to Ops</h2>
        <p className="text-sm text-gray-400">Use the sidebar to navigate to Way Planning or Live Monitoring.</p>
      </div>
    </div>
  </OperationsShell>
);

const OpsLoader = () => (
  <div className="min-h-screen bg-[#05080F] flex flex-col items-center justify-center">
    <Activity className="h-10 w-10 text-blue-500 animate-pulse mb-4" />
  </div>
);

export default function OperationsPortal() {
  return (
    <Suspense fallback={<OpsLoader />}>
      <Routes>
        <Route path="/" element={<OpsDashboard />} />
        <Route path="/logistics-planning" element={<LogisticsWayPlanning />} />
        <Route path="/logistics-monitoring" element={<LogisticsMonitoringPage />} />
        <Route path="*" element={<Navigate to="/portal/operations" replace />} />
      </Routes>
    </Suspense>
  );
}

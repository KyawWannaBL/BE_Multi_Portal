import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { HrShell } from '@/components/layout/HrShell';
import { Users } from 'lucide-react';

const HrDashboard = React.lazy(() => import('./hr/HrDashboard'));
const HrEmployeeDirectory = React.lazy(() => import('./hr/HrEmployeeDirectory'));
const HrAttendance = React.lazy(() => import('./hr/HrAttendance'));

// Placeholders for pending views
const HrLeaves = () => (
  <HrShell title="Leave Management">
    <div className="h-[60vh] flex flex-col items-center justify-center text-gray-600">
      <Users className="h-16 w-16 opacity-20 mb-4" />
      <p className="text-sm font-bold tracking-widest uppercase">Leave Management Module Pending</p>
    </div>
  </HrShell>
);

const HrPayroll = () => (
  <HrShell title="Payroll & Advances">
    <div className="h-[60vh] flex flex-col items-center justify-center text-gray-600">
      <Users className="h-16 w-16 opacity-20 mb-4" />
      <p className="text-sm font-bold tracking-widest uppercase">Payroll Module Pending</p>
    </div>
  </HrShell>
);

const HrLoader = () => (
  <div className="min-h-screen bg-[#0A0F1C] flex flex-col items-center justify-center">
    <Users className="h-10 w-10 text-violet-500 animate-pulse mb-4" />
    <p className="text-[10px] font-bold tracking-[0.3em] text-violet-500/70 uppercase">Loading HR Portal...</p>
  </div>
);

export default function HrPortal() {
  return (
    <Suspense fallback={<HrLoader />}>
      <Routes>
        <Route path="/" element={<HrDashboard />} />
        <Route path="/directory" element={<HrEmployeeDirectory />} />
        <Route path="/attendance" element={<HrAttendance />} />
        <Route path="/leaves" element={<HrLeaves />} />
        <Route path="/payroll" element={<HrPayroll />} />
        <Route path="*" element={<Navigate to="/portal/hr" replace />} />
      </Routes>
    </Suspense>
  );
}

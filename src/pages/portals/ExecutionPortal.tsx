import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const RiderDashboard = React.lazy(() => import('./execution/RiderDashboard'));
const PickupFlow = React.lazy(() => import('./execution/PickupFlow'));
const DeliveryFlow = React.lazy(() => import('./execution/DeliveryFlow'));
const WarehouseDrop = React.lazy(() => import('./execution/WarehouseDrop'));
const ParcelIntake = React.lazy(() => import('./ExecutionParcelIntakePage'));
const OcrWorkbench = React.lazy(() => import('./ExecutionOcrExportPage'));
const LiveMap = React.lazy(() => import('./ExecutionLiveMapPage'));
const Navigation = React.lazy(() => import('./ExecutionNavigationPage'));

function ExecutionLoader() {
  const ctx: any = useLanguage?.() ?? {};
  const lang = ctx.lang || ctx.language || 'en';
  const t = (en: string, my: string) => (lang === 'en' ? en : my);
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#08101B]">
      <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
      <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-500/70">{t('Syncing field data…', 'Field data များကို ချိတ်ဆက်နေသည်…')}</p>
    </div>
  );
}

export default function ExecutionPortal() {
  return (
    <Suspense fallback={<ExecutionLoader />}>
      <Routes>
        <Route path="/" element={<RiderDashboard />} />
        <Route path="/pickup" element={<PickupFlow />} />
        <Route path="/delivery" element={<DeliveryFlow />} />
        <Route path="/drop" element={<WarehouseDrop />} />
        <Route path="/parcel-intake" element={<ParcelIntake />} />
        <Route path="/ocr" element={<OcrWorkbench />} />
        <Route path="/live-map" element={<LiveMap />} />
        <Route path="/navigation" element={<Navigation />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

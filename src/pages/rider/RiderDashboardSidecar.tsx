import React from 'react';

const GOLD = 'text-[rgba(212,175,55,0.95)]';

export function LuxuryKpiStrip(props: {
  remainingParcels: number;
  etdToNextStopText: string;
  shiftSuccessRatePct: number; // 0-100
}) {
  return (
    <div className="w-full rounded-xl border bg-black/60 backdrop-blur px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm">
          <div className={`${GOLD} font-semibold`}>Remaining Parcels</div>
          <div className="text-lg font-bold">{props.remainingParcels}</div>
        </div>
        <div className="text-sm">
          <div className={`${GOLD} font-semibold`}>ETD to Next Stop</div>
          <div className="text-lg font-bold">{props.etdToNextStopText}</div>
        </div>
        <div className="text-sm text-right">
          <div className={`${GOLD} font-semibold`}>Shift Success Rate</div>
          <div className="text-lg font-bold">{Math.round(props.shiftSuccessRatePct)}%</div>
        </div>
      </div>
    </div>
  );
}

export function RiderDashboardSidecar(props: {
  taskActive: boolean;
  kpi: { remainingParcels: number; etdToNextStopText: string; shiftSuccessRatePct: number };
  map: React.ReactNode;
  nextTaskCard: React.ReactNode;
  managementView: React.ReactNode;
}) {
  return (
    <div className="h-[100dvh] w-full flex flex-col gap-3 p-3">
      <LuxuryKpiStrip {...props.kpi} />

      {props.taskActive ? (
        <div className="flex-1 min-h-0 flex flex-col gap-3">
          <div className="flex-[7] min-h-0 rounded-xl overflow-hidden border">{props.map}</div>
          <div className="flex-[3] min-h-0 rounded-xl overflow-hidden border">{props.nextTaskCard}</div>
        </div>
      ) : (
        <div className="flex-1 min-h-0">{props.managementView}</div>
      )}
    </div>
  );
}

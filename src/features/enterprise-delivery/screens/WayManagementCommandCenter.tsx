import React, { useMemo, useState } from "react";
import { RefreshCw, Route, Search, Warehouse } from "lucide-react";
import { searchWays } from "../api/deliveryApi";
import { DELIVERY_PERMISSIONS } from "../auth/permissions";
import PermissionGuard from "../auth/PermissionGuard";
import LiveRouteMapPanel from "../components/LiveRouteMapPanel";
import { Field, Panel, PrimaryButton, ScreenShell } from "./_shared";

const mockWays = [
  {
    id: "1",
    trackingNo: "MM-2026-104521",
    merchant: "Andaman Health Hub",
    receiver: "Daw Khin Mya",
    township: "Tamwe",
    rider: "U Thet Paing",
    currentStage: "PICKUP_SECURED",
    status: "Awaiting inbound scan",
    eta: "09:30",
    lat: 16.8129,
    lng: 96.1735,
    photoScore: 78,
  },
  {
    id: "2",
    trackingNo: "MM-2026-104522",
    merchant: "Shwe Fashion",
    receiver: "Ko Aung Min",
    township: "Hlaing",
    rider: "Ma Ei Sandar",
    currentStage: "WAREHOUSE_QC_HOLD",
    status: "Label glare - OCR low confidence",
    eta: "11:15",
    lat: 16.8759,
    lng: 96.1175,
    photoScore: 61,
  },
  {
    id: "3",
    trackingNo: "MM-2026-104523",
    merchant: "Ocean Fresh",
    receiver: "U Nyan Lin",
    township: "Bahan",
    rider: "Ko Soe Thura",
    currentStage: "OUT_FOR_DELIVERY",
    status: "Reached delivery cluster",
    eta: "15:05",
    lat: 16.8199,
    lng: 96.1446,
    photoScore: 89,
  },
];

export default function WayManagementCommandCenter({ auth }: { auth: any }) {
  const [search, setSearch] = useState("");
  const [ways, setWays] = useState(mockWays);
  const [busy, setBusy] = useState(false);

  const counts = useMemo(() => {
    return ways.reduce(
      (acc, item) => {
        acc.total += 1;
        acc[item.currentStage] = (acc[item.currentStage] || 0) + 1;
        return acc;
      },
      { total: 0 } as Record<string, number>
    );
  }, [ways]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return ways;
    return ways.filter((item) =>
      [item.trackingNo, item.merchant, item.receiver, item.township, item.status]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [ways, search]);

  const refresh = async () => {
    try {
      setBusy(true);
      const result = await searchWays({ search });
      setWays(result?.items?.length ? result.items : mockWays);
    } catch {
      setWays(mockWays);
    } finally {
      setBusy(false);
    }
  };

  const routeStops = filtered
    .filter((item) => typeof item.lat === "number" && typeof item.lng === "number")
    .map((item) => ({
      id: item.id,
      label: `${item.trackingNo} • ${item.receiver}`,
      lat: item.lat!,
      lng: item.lng!,
      status: item.status,
      eta: item.eta,
    }));

  return (
    <PermissionGuard
      auth={auth}
      require={DELIVERY_PERMISSIONS.WAY_MANAGEMENT_READ}
      fallback={<DeniedCard label="way management command center" />}
    >
      <ScreenShell
        title="Way management command center"
        subtitle="Unified visibility for pickup, warehouse, route, and proof states. This screen is meant for supervisors, dispatchers, customer service, and exception resolution teams."
        actions={
          <PrimaryButton onClick={() => void refresh()} disabled={busy}>
            <RefreshCw size={16} />
            {busy ? "Refreshing..." : "Refresh ways"}
          </PrimaryButton>
        }
      >
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <Panel title="Operational search" subtitle="Search by tracking number, merchant, receiver, township, or current exception note.">
              <Field label="Search ways" value={search} onChange={setSearch} />
            </Panel>

            <div className="grid gap-4 md:grid-cols-4">
              <Metric label="Total" value={counts.total || 0} />
              <Metric label="Pickup" value={counts.PICKUP_SECURED || 0} />
              <Metric label="Warehouse hold" value={counts.WAREHOUSE_QC_HOLD || 0} />
              <Metric label="Out for delivery" value={counts.OUT_FOR_DELIVERY || 0} />
            </div>

            <Panel title="Way list" subtitle="Supervisor control surface for the whole process chain.">
              <div className="overflow-hidden rounded-2xl border border-white/10">
                <table className="w-full text-left text-xs">
                  <thead className="bg-black/30 text-white/45">
                    <tr>
                      <th className="p-3">Tracking</th>
                      <th className="p-3">Merchant</th>
                      <th className="p-3">Receiver</th>
                      <th className="p-3">Stage</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filtered.map((item) => (
                      <tr key={item.id}>
                        <td className="p-3 font-semibold text-white">{item.trackingNo}</td>
                        <td className="p-3">{item.merchant}</td>
                        <td className="p-3">{item.receiver}</td>
                        <td className="p-3">{item.currentStage}</td>
                        <td className="p-3">{item.status}</td>
                        <td className="p-3">{item.photoScore ?? "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          </div>

          <div className="space-y-6">
            <Panel title="Live map" subtitle="Dispatch and support teams can visually inspect route context and clustered stops.">
              <LiveRouteMapPanel
                rider={{ label: "Live rider cluster", lat: 16.84, lng: 96.15 }}
                stops={routeStops}
              />
            </Panel>

            <Panel title="Suggested enterprise enhancements" subtitle="Recommended next implementation layer.">
              <ul className="space-y-2 text-sm text-white/70">
                <li>• websocket / SSE live updates for route points and workflow events</li>
                <li>• SLA breach engine with proactive escalation</li>
                <li>• photo and OCR exception queues by warehouse and rider</li>
                <li>• branch-scope filtering and permission-aware action buttons</li>
              </ul>
            </Panel>
          </div>
        </div>
      </ScreenShell>
    </PermissionGuard>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-[#0B1220] p-5 shadow-xl">
      <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/45">{label}</div>
      <div className="mt-2 text-3xl font-black text-white">{value}</div>
    </div>
  );
}

function DeniedCard({ label }: { label: string }) {
  return (
    <div className="min-h-screen bg-[#070c16] p-8 text-white">
      <div className="mx-auto max-w-xl rounded-3xl border border-rose-500/20 bg-rose-500/10 p-6">
        <div className="text-lg font-black">Permission required</div>
        <div className="mt-2 text-sm text-rose-200">
          You do not have access to {label}.
        </div>
      </div>
    </div>
  );
}

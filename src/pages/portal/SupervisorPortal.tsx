import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAuthIdentity, listPublicUsersByRole } from "@/services/identity";
import { assignShipment, listUnassignedShipments, type Shipment } from "@/services/shipments";

type Rider = { id: string; full_name: string; email: string; role: string };

export default function SupervisorPortal() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [riders, setRiders] = useState<Rider[]>([]);
  const [selectedRider, setSelectedRider] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    setError(null);
    const s = await listUnassignedShipments(50);
    if (s.error) setError(s.error);
    setShipments(s.data ?? []);

    const r = await listPublicUsersByRole(["rider", "driver", "helper"], 200);
    setRiders((r as any) ?? []);
  };

  useEffect(() => {
    void load();
  }, []);

  const onAssign = async (shipmentId: string) => {
    setError(null);
    if (!selectedRider) {
      setError("Select a rider/driver/helper first.");
      return;
    }
    setBusyId(shipmentId);
    const res = await assignShipment(shipmentId, selectedRider);
    setBusyId(null);
    if (res.error) setError(res.error);
    await load();
  };

  const riderLabel = useMemo(() => {
    const r = riders.find((x) => x.id === selectedRider);
    return r ? `${r.full_name} (${r.role})` : "";
  }, [riders, selectedRider]);

  return (
    <div className="space-y-6">
      <div>
        <div className="text-2xl font-bold">Supervisor Portal</div>
        <div className="text-sm text-white/60 mt-1">Assign shipments to execution staff</div>
      </div>

      {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</div>}

      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="font-semibold">Assignment</div>
          <div className="flex gap-3 items-center">
            <Select value={selectedRider} onValueChange={setSelectedRider}>
              <SelectTrigger className="w-72">
                <SelectValue placeholder="Select rider/driver/helper" />
              </SelectTrigger>
              <SelectContent>
                {riders.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.full_name} • {r.role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="secondary" onClick={load}>Refresh</Button>
          </div>
        </div>

        {selectedRider && <div className="text-xs text-white/60">Selected: {riderLabel}</div>}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="font-semibold">Unassigned Shipments</div>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-white/60">
              <tr>
                <th className="text-left py-2">Way ID</th>
                <th className="text-left py-2">Receiver</th>
                <th className="text-left py-2">Status</th>
                <th className="text-left py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {shipments.map((s) => (
                <tr key={s.id} className="border-t border-white/10">
                  <td className="py-2 font-mono">{s.way_id}</td>
                  <td className="py-2">{s.receiver_name} ({s.receiver_phone})</td>
                  <td className="py-2">{s.status}</td>
                  <td className="py-2">
                    <Button size="sm" disabled={busyId === s.id} onClick={() => onAssign(s.id)}>
                      Assign
                    </Button>
                  </td>
                </tr>
              ))}
              {shipments.length === 0 && (
                <tr>
                  <td className="py-4 text-white/50" colSpan={4}>
                    No unassigned shipments.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="text-xs text-white/50 mt-3">
          Requires RLS: SELECT shipments (unassigned) and UPDATE shipments.assigned_rider_id.
        </div>
      </div>
    </div>
  );
}

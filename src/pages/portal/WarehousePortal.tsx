import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { updateShipmentStatus, type Shipment } from "@/services/shipments";
import { getAuthIdentity, getPublicUserByEmail } from "@/services/identity";

const ACTIONS = [
  { label: "Received", status: "warehouse_received" },
  { label: "Dispatched", status: "warehouse_dispatched" },
];

export default function WarehousePortal() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [publicUserId, setPublicUserId] = useState<string | null>(null);

  const load = async () => {
    setError(null);
    try {
      const { data, error } = await supabase
        .from("shipments")
        .select("id, way_id, merchant_id, sender_name, sender_phone, receiver_name, receiver_phone, receiver_address, status, assigned_rider_id, pickup_branch_id, delivery_branch_id, delivery_fee, cod_amount, total_amount, created_at")
        .in("status", ["assigned", "picked_up", "in_transit", "warehouse_received", "warehouse_dispatched"])
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      setShipments((data as any) ?? []);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load");
    }
  };

  useEffect(() => {
    let cancelled = false;
    async function init() {
      const { email } = await getAuthIdentity();
      if (!email) return;
      const u = await getPublicUserByEmail(email);
      if (!cancelled) setPublicUserId(u?.id ?? null);
    }
    void init();
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const onUpdate = async (shipmentId: string, status: string) => {
    setBusyId(shipmentId);
    const res = await updateShipmentStatus(shipmentId, status, { handled_by: publicUserId ?? null });
    setBusyId(null);
    if (res.error) setError(res.error);
    await load();
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="text-2xl font-bold">Warehouse Portal</div>
        <div className="text-sm text-white/60 mt-1">Receiving & dispatch actions</div>
      </div>

      {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</div>}

      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="flex items-center justify-between">
          <div className="font-semibold">Worklist</div>
          <Button variant="secondary" onClick={load}>Refresh</Button>
        </div>

        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-white/60">
              <tr>
                <th className="text-left py-2">Way ID</th>
                <th className="text-left py-2">Status</th>
                <th className="text-left py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {shipments.map((s) => (
                <tr key={s.id} className="border-t border-white/10">
                  <td className="py-2 font-mono">{s.way_id}</td>
                  <td className="py-2">{s.status}</td>
                  <td className="py-2">
                    <div className="flex flex-wrap gap-2">
                      {ACTIONS.map((a) => (
                        <Button key={a.status} size="sm" disabled={busyId === s.id} onClick={() => onUpdate(s.id, a.status)}>
                          {a.label}
                        </Button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
              {shipments.length === 0 && (
                <tr>
                  <td className="py-4 text-white/50" colSpan={3}>
                    No shipments in warehouse states.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="text-xs text-white/50 mt-3">Requires RLS: SELECT shipments for warehouse scope; UPDATE shipments + INSERT shipment_tracking.</div>
      </div>
    </div>
  );
}

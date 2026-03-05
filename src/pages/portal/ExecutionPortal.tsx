import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useRbac } from "@/app/providers/RbacProvider";
import { getAuthIdentity, getPublicUserByEmail } from "@/services/identity";
import { listShipmentsByAssignee, updateShipmentStatus, type Shipment } from "@/services/shipments";

const STATUS_ACTIONS: { label: string; status: string }[] = [
  { label: "Picked Up", status: "picked_up" },
  { label: "In Transit", status: "in_transit" },
  { label: "Delivered", status: "delivered" },
  { label: "Failed", status: "failed" },
];

export default function ExecutionPortal() {
  const { profile } = useRbac();
  const [publicUserId, setPublicUserId] = useState<string | null>(null);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async (uid: string) => {
    const res = await listShipmentsByAssignee(uid);
    if (res.error) setError(res.error);
    setShipments(res.data ?? []);
  };

  useEffect(() => {
    let cancelled = false;
    async function init() {
      setError(null);
      const { email } = await getAuthIdentity();
      if (!email) return;
      const u = await getPublicUserByEmail(email);
      if (cancelled) return;

      setPublicUserId(u?.id ?? null);
      if (u?.id) await load(u.id);
    }
    void init();
    return () => {
      cancelled = true;
    };
  }, []);

  const onUpdate = async (shipmentId: string, status: string) => {
    if (!publicUserId) return;
    setBusyId(shipmentId);
    const res = await updateShipmentStatus(shipmentId, status, { handled_by: publicUserId });
    setBusyId(null);
    if (res.error) setError(res.error);
    await load(publicUserId);
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="text-2xl font-bold">Execution Portal</div>
        <div className="text-sm text-white/60 mt-1">{profile?.email ?? "—"}</div>
      </div>

      {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</div>}

      {!publicUserId && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/70">
          Could not resolve a staff record in <span className="font-mono">public.users</span> for this email.
          Ask Ops/HR to create it, or adjust the resolver in <span className="font-mono">services/identity.ts</span>.
        </div>
      )}

      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="font-semibold">Assigned Shipments</div>

        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-white/60">
              <tr>
                <th className="text-left py-2">Way ID</th>
                <th className="text-left py-2">Receiver</th>
                <th className="text-left py-2">Status</th>
                <th className="text-left py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {shipments.map((s) => (
                <tr key={s.id} className="border-t border-white/10">
                  <td className="py-2 font-mono">{s.way_id}</td>
                  <td className="py-2">{s.receiver_name} ({s.receiver_phone})</td>
                  <td className="py-2">{s.status}</td>
                  <td className="py-2">
                    <div className="flex flex-wrap gap-2">
                      {STATUS_ACTIONS.map((a) => (
                        <Button
                          key={a.status}
                          variant="secondary"
                          size="sm"
                          disabled={!publicUserId || busyId === s.id}
                          onClick={() => onUpdate(s.id, a.status)}
                        >
                          {a.label}
                        </Button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
              {shipments.length === 0 && (
                <tr>
                  <td className="py-4 text-white/50" colSpan={4}>
                    No assigned shipments.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="text-xs text-white/50 mt-3">
          Requires RLS: SELECT on shipments where assigned_rider_id = your staff record, and UPDATE on shipments + INSERT on shipment_tracking.
        </div>
      </div>
    </div>
  );
}

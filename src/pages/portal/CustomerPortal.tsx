import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRbac } from "@/app/providers/RbacProvider";
import { getAuthIdentity, getCustomerByEmail } from "@/services/identity";
import { getShipmentByWayId, getTrackingByShipmentId, listShipmentsByReceiverPhone, type Shipment, type ShipmentTracking } from "@/services/shipments";

export default function CustomerPortal() {
  const { profile } = useRbac();
  const [phone, setPhone] = useState<string | null>(null);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [query, setQuery] = useState("");
  const [found, setFound] = useState<Shipment | null>(null);
  const [tracking, setTracking] = useState<ShipmentTracking[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function init() {
      setError(null);
      const { email } = await getAuthIdentity();
      if (!email) return;

      const c = await getCustomerByEmail(email);
      if (cancelled) return;

      setPhone(c?.phone ?? null);
      if (c?.phone) {
        const res = await listShipmentsByReceiverPhone(c.phone);
        if (!cancelled) setShipments(res.data ?? []);
      }
    }
    void init();
    return () => {
      cancelled = true;
    };
  }, []);

  const onTrack = async () => {
    setError(null);
    setFound(null);
    setTracking([]);

    const wayId = query.trim();
    if (!wayId) return;

    const res = await getShipmentByWayId(wayId);
    if (res.error) {
      setError(res.error);
      return;
    }
    const s = (res.data ?? [])[0];
    if (!s) {
      setError("No shipment found for that Way ID.");
      return;
    }
    setFound(s);

    const tr = await getTrackingByShipmentId(s.id);
    if (tr.error) setError(tr.error);
    setTracking(tr.data ?? []);
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="text-2xl font-bold">Customer Portal</div>
        <div className="text-sm text-white/60 mt-1">{profile?.email ?? "—"} {phone ? `• ${phone}` : ""}</div>
      </div>

      {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</div>}

      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4">
        <div className="font-semibold">Track Shipment</div>
        <div className="flex gap-3 flex-col md:flex-row">
          <Input placeholder="Enter Way ID (e.g., WAY260304-XXXXXX)" value={query} onChange={(e) => setQuery(e.target.value)} />
          <Button onClick={onTrack}>Track</Button>
        </div>

        {found && (
          <div className="mt-4 grid gap-2 text-sm">
            <div><span className="text-white/60">Way ID:</span> <span className="font-mono">{found.way_id}</span></div>
            <div><span className="text-white/60">Status:</span> {found.status}</div>
            <div><span className="text-white/60">Receiver:</span> {found.receiver_name} ({found.receiver_phone})</div>
            <div className="text-white/60">Timeline</div>
            <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
              <div className="max-h-64 overflow-auto">
                {tracking.map((t) => (
                  <div key={t.id} className="px-4 py-3 border-b border-white/10">
                    <div className="text-sm font-semibold">{t.status}</div>
                    <div className="text-xs text-white/60">{new Date(t.timestamp).toLocaleString()}</div>
                    {(t.location || t.notes) && <div className="text-xs text-white/70 mt-1">{t.location ?? ""}{t.location && t.notes ? " • " : ""}{t.notes ?? ""}</div>}
                  </div>
                ))}
                {tracking.length === 0 && <div className="px-4 py-4 text-sm text-white/50">No tracking updates</div>}
              </div>
            </div>
          </div>
        )}

        <div className="text-xs text-white/50">
          Requires RLS: SELECT on shipments/tracking for customer scope. If you don't have a customers row, ask ops to create one.
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="font-semibold">My Shipments</div>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-white/60">
              <tr>
                <th className="text-left py-2">Way ID</th>
                <th className="text-left py-2">Sender</th>
                <th className="text-left py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {shipments.map((s) => (
                <tr key={s.id} className="border-t border-white/10">
                  <td className="py-2 font-mono">{s.way_id}</td>
                  <td className="py-2">{s.sender_name} ({s.sender_phone})</td>
                  <td className="py-2">{s.status}</td>
                </tr>
              ))}
              {shipments.length === 0 && (
                <tr>
                  <td className="py-4 text-white/50" colSpan={3}>
                    No shipments linked to your phone number yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

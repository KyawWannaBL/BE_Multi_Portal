import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getShipmentByWayId, getTrackingByShipmentId, updateShipmentStatus, type Shipment, type ShipmentTracking } from "@/services/shipments";
import { getAuthIdentity, getPublicUserByEmail } from "@/services/identity";

export default function SupportPortal() {
  const [query, setQuery] = useState("");
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [tracking, setTracking] = useState<ShipmentTracking[]>([]);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  const search = async () => {
    setError(null);
    setShipment(null);
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
      setError("No shipment found.");
      return;
    }
    setShipment(s);

    const tr = await getTrackingByShipmentId(s.id);
    if (tr.error) setError(tr.error);
    setTracking(tr.data ?? []);
  };

  const addNote = async () => {
    if (!shipment) return;
    setError(null);

    const { email } = await getAuthIdentity();
    const staff = email ? await getPublicUserByEmail(email) : null;

    const res = await updateShipmentStatus(shipment.id, shipment.status, { notes: note || "Support note", handled_by: staff?.id ?? null });
    if (res.error) setError(res.error);
    setNote("");
    await search();
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="text-2xl font-bold">Customer Service Portal</div>
        <div className="text-sm text-white/60 mt-1">Search by Way ID and add a tracking note</div>
      </div>

      {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</div>}

      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-3">
        <div className="flex gap-3 flex-col md:flex-row">
          <Input placeholder="Way ID" value={query} onChange={(e) => setQuery(e.target.value)} />
          <Button onClick={search}>Search</Button>
        </div>
      </div>

      {shipment && (
        <div className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-3">
            <div className="font-semibold">Shipment</div>
            <div className="text-sm"><span className="text-white/60">Way:</span> <span className="font-mono">{shipment.way_id}</span></div>
            <div className="text-sm"><span className="text-white/60">Status:</span> {shipment.status}</div>
            <div className="text-sm"><span className="text-white/60">Receiver:</span> {shipment.receiver_name} ({shipment.receiver_phone})</div>

            <Textarea placeholder="Add support note (creates tracking entry)" value={note} onChange={(e) => setNote(e.target.value)} />
            <Button onClick={addNote} disabled={!note.trim()}>Add Note</Button>

            <div className="text-xs text-white/50">Requires RLS: INSERT shipment_tracking for support role.</div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="font-semibold">Tracking</div>
            <div className="mt-3 max-h-80 overflow-auto rounded-xl border border-white/10">
              {tracking.map((t) => (
                <div key={t.id} className="px-4 py-3 border-b border-white/10">
                  <div className="text-sm font-semibold">{t.status}</div>
                  <div className="text-xs text-white/60">{new Date(t.timestamp).toLocaleString()}</div>
                  {(t.location || t.notes) && <div className="text-xs text-white/70 mt-1">{t.location ?? ""}{t.location && t.notes ? " • " : ""}{t.notes ?? ""}</div>}
                </div>
              ))}
              {tracking.length === 0 && <div className="px-4 py-4 text-sm text-white/50">No tracking entries.</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

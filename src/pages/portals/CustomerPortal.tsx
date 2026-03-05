import React, { useState } from "react";
import { PortalShell } from "@/components/layout/PortalShell";
import { findShipmentByWayId, listTracking } from "@/services/shipments";

export default function CustomerPortal() {
  const [wayId, setWayId] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);
  const [tracking, setTracking] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);

  const search = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    setResult(null);
    setTracking([]);
    try {
      const s = await findShipmentByWayId(wayId.trim());
      if (!s) {
        setErr("No shipment found for that Way ID.");
        return;
      }
      setResult(s);
      const t = await listTracking(s.id);
      setTracking(t);
    } catch (e: any) {
      setErr(e.message || String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <PortalShell title="Customer Portal" links={[{ to: "/portal/merchant", label: "Merchant" }]}>
      <div className="space-y-4">
        <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="text-sm font-bold tracking-wide">Track Shipment</div>
          <form onSubmit={search} className="mt-3 flex gap-2 flex-wrap">
            <input
              className="flex-1 min-w-[260px] rounded-2xl bg-black/20 border border-white/10 px-3 py-2 text-sm font-mono"
              placeholder="Enter Way ID (e.g. BTX-...)"
              value={wayId}
              onChange={(e) => setWayId(e.target.value)}
              required
            />
            <button
              disabled={busy}
              className="text-xs px-4 py-2 rounded-2xl border border-white/10 hover:border-white/20 hover:bg-white/5 disabled:opacity-50"
            >
              {busy ? "Searching…" : "Search"}
            </button>
          </form>
          {err ? <div className="mt-2 text-xs text-red-400">Error: {err}</div> : null}
        </section>

        {result ? (
          <section className="rounded-3xl border border-white/10 bg-white/5 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-mono text-xs">{result.way_id}</div>
              <div className="text-[10px] opacity-70">{new Date(result.created_at).toLocaleString()}</div>
            </div>
            <div className="text-sm">{result.receiver_name}</div>
            <div className="text-xs opacity-70">{result.receiver_phone} • {result.receiver_address}</div>
            <div className="text-xs opacity-70">
              Assigned: {result.assigned_rider_id ? "Yes" : "No"} • Delivered: {result.actual_delivery_time ? "Yes" : "No"}
            </div>

            <div className="pt-2">
              <div className="text-sm font-bold">Tracking</div>
              <div className="mt-2 grid gap-2">
                {tracking.map((t) => (
                  <div key={t.id} className="rounded-2xl border border-white/10 bg-black/20 p-3">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-mono">{t.status}</div>
                      <div className="text-[10px] opacity-70">{new Date(t.timestamp).toLocaleString()}</div>
                    </div>
                    <div className="text-xs opacity-80">{t.notes || "-"}</div>
                  </div>
                ))}
                {!tracking.length ? <div className="text-xs opacity-60">No tracking entries yet.</div> : null}
              </div>
            </div>
          </section>
        ) : null}
      </div>
    </PortalShell>
  );
}

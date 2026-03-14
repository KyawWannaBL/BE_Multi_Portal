import React, { useEffect, useMemo, useState } from "react";
import { PortalShell } from "@/components/layout/PortalShell";
import { listPendingApprovals, approveShipment, rejectShipment, type ShipmentApproval } from "@/services/approvals";
import { supabase } from "@/lib/supabase";
import { assignShipment, addTrackingNote } from "@/services/shipments";

type RiderRow = { id: string; full_name: string; email: string; role: string };

export default function SupervisorPortal() {
  const [approvals, setApprovals] = useState<ShipmentApproval[]>([]);
  const [riders, setRiders] = useState<RiderRow[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState<Record<string, string>>({});
  const [assignTo, setAssignTo] = useState<Record<string, string>>({});

  async function refresh() {
    setErr(null);
    const [aRes, rRes] = await Promise.all([
      listPendingApprovals().catch((e: any) => {
        setErr(e.message || String(e));
        return [];
      }),
      supabase
        .from("users")
        .select("id, full_name, email, role")
        .in("role", ["rider", "driver", "helper"])
        .limit(200),
    ]);

    setApprovals(aRes);
    if (rRes.error) {
      // often blocked by RLS, but supervisor can still approve without listing riders
      console.warn("[SupervisorPortal] riders query failed:", rRes.error.message);
    } else {
      setRiders((rRes.data as any) ?? []);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  const riderOptions = useMemo(
    () =>
      riders.map((r) => ({
        id: r.id,
        label: `${r.full_name || r.email} (${String(r.role || "").toUpperCase()})`,
      })),
    [riders]
  );

  const approve = async (a: ShipmentApproval) => {
    setBusy(a.id);
    try {
      await approveShipment(a.id, a.shipment_id);
      await refresh();
    } catch (e: any) {
      setErr(e.message || String(e));
    } finally {
      setBusy(null);
    }
  };

  const reject = async (a: ShipmentApproval) => {
    setBusy(a.id);
    try {
      await rejectShipment(a.id, a.shipment_id, rejectNote[a.id] || "Rejected");
      await refresh();
    } catch (e: any) {
      setErr(e.message || String(e));
    } finally {
      setBusy(null);
    }
  };

  const assign = async (a: ShipmentApproval) => {
    const assignee = assignTo[a.shipment_id];
    if (!assignee) return;

    setBusy(a.shipment_id);
    try {
      await assignShipment(a.shipment_id, assignee);
      await addTrackingNote(a.shipment_id, "Supervisor assigned shipment to delivery team");
      await refresh();
    } catch (e: any) {
      setErr(e.message || String(e));
    } finally {
      setBusy(null);
    }
  };

  return (
    <PortalShell title="Supervisor Portal" links={[{ to: "/portal/execution", label: "Execution" }]}>
      <div className="space-y-4">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="text-sm font-bold tracking-wide">Approval Queue</div>
          <div className="text-xs opacity-70">Approve shipments before assignment.</div>
          {err ? <div className="mt-2 text-xs text-red-400">Error: {err}</div> : null}

          <div className="mt-4 grid gap-3">
            {approvals.map((a) => (
              <div key={a.id} className="rounded-2xl border border-white/10 bg-black/20 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-mono text-xs">Approval: {a.id.slice(0, 8)}…</div>
                  <div className="text-[10px] opacity-70">{new Date(a.requested_at).toLocaleString()}</div>
                </div>

                <div className="text-xs opacity-80 font-mono">Shipment: {a.shipment_id}</div>

                <div className="flex gap-2 flex-wrap">
                  <button
                    disabled={busy === a.id}
                    onClick={() => void approve(a)}
                    className="text-xs px-3 py-2 rounded-xl border border-emerald-500/30 bg-emerald-500/15 hover:bg-emerald-500/20 disabled:opacity-50"
                  >
                    Approve
                  </button>
                  <input
                    className="flex-1 min-w-[220px] rounded-xl bg-black/20 border border-white/10 px-3 py-2 text-xs"
                    placeholder="Reject note"
                    value={rejectNote[a.id] || ""}
                    onChange={(e) => setRejectNote((s) => ({ ...s, [a.id]: e.target.value }))}
                  />
                  <button
                    disabled={busy === a.id}
                    onClick={() => void reject(a)}
                    className="text-xs px-3 py-2 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/15 disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>

                <div className="flex gap-2 items-center flex-wrap">
                  <select
                    className="rounded-xl bg-black/20 border border-white/10 px-3 py-2 text-xs"
                    value={assignTo[a.shipment_id] || ""}
                    onChange={(e) => setAssignTo((s) => ({ ...s, [a.shipment_id]: e.target.value }))}
                  >
                    <option value="">Assign to…</option>
                    {riderOptions.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                  <button
                    disabled={busy === a.shipment_id}
                    onClick={() => void assign(a)}
                    className="text-xs px-3 py-2 rounded-xl border border-white/10 hover:border-white/20 hover:bg-white/5 disabled:opacity-50"
                  >
                    Assign
                  </button>
                  {!riderOptions.length ? (
                    <div className="text-[10px] opacity-60">No rider list (likely RLS). You can still approve.</div>
                  ) : null}
                </div>
              </div>
            ))}
            {!approvals.length ? <div className="text-xs opacity-60">No pending approvals.</div> : null}
          </div>
        </div>
      </div>
    </PortalShell>
  );
}

import React, { useEffect, useState } from "react";
import { PortalShell } from "@/components/layout/PortalShell";
import { supabase } from "@/lib/supabase";
import { getCurrentIdentity } from "@/lib/appIdentity";

type Branch = { id: string; name: string; code: string; city: string; state: string };
type ShipmentRow = { id: string; way_id: string; receiver_name: string; created_at: string; pickup_branch_id: string | null; delivery_branch_id: string | null };

export default function BranchPortal() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [shipments, setShipments] = useState<ShipmentRow[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setErr(null);
      const identity = await getCurrentIdentity();
      if (!identity?.user_id) {
        setErr("No linked public.users.id for this account (required for branch manager mapping).");
        return;
      }

      const bRes = await supabase.from("branches").select("id, name, code, city, state").eq("manager_id", identity.user_id);
      if (bRes.error) {
        setErr(bRes.error.message);
        return;
      }
      const b = (bRes.data as any) ?? [];
      setBranches(b);

      const ids = b.map((x: any) => x.id);
      if (!ids.length) {
        setShipments([]);
        return;
      }

      const idsFilter = `(${ids.join(",")})`;

      const sRes = await supabase
        .from("shipments")
        .select("id, way_id, receiver_name, created_at, pickup_branch_id, delivery_branch_id")
        .or(`pickup_branch_id.in.${idsFilter},delivery_branch_id.in.${idsFilter}`)
        .order("created_at", { ascending: false })
        .limit(50);
      if (sRes.error) setErr(sRes.error.message);
      else setShipments((sRes.data as any) ?? []);
    }

    void load();
  }, []);

  return (
    <PortalShell title="Branch Manager Portal">
      <div className="space-y-4">
        {err ? <div className="text-xs text-red-400">Error: {err}</div> : null}

        <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="text-sm font-bold">My Branches</div>
          <div className="mt-2 grid gap-2">
            {branches.map((b) => (
              <div key={b.id} className="rounded-2xl border border-white/10 bg-black/20 p-3">
                <div className="text-sm">{b.name}</div>
                <div className="text-xs opacity-70 font-mono">{b.code} • {b.city}, {b.state}</div>
              </div>
            ))}
            {!branches.length ? <div className="text-xs opacity-60">No branches assigned.</div> : null}
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="text-sm font-bold">Branch Shipments</div>
          <div className="mt-2 grid gap-2">
            {shipments.map((s) => (
              <div key={s.id} className="rounded-2xl border border-white/10 bg-black/20 p-3">
                <div className="flex items-center justify-between">
                  <div className="font-mono text-xs">{s.way_id}</div>
                  <div className="text-[10px] opacity-70">{new Date(s.created_at).toLocaleString()}</div>
                </div>
                <div className="text-sm">{s.receiver_name}</div>
              </div>
            ))}
            {!shipments.length ? <div className="text-xs opacity-60">No shipments for assigned branches (or blocked by RLS).</div> : null}
          </div>
        </section>
      </div>
    </PortalShell>
  );
}

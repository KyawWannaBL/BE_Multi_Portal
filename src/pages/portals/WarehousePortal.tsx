import React, { useEffect, useState } from "react";
import { PortalShell } from "@/components/layout/PortalShell";
import { supabase } from "@/lib/supabase";

type Parcel = { id: string; parcel_number: string | null; status: string | null; created_at: string };

export default function WarehousePortal() {
  const [rows, setRows] = useState<Parcel[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setErr(null);
      const res = await supabase
        .from("warehouse_parcels_2026_02_04_15_54")
        .select("id, parcel_number, status, created_at")
        .order("created_at", { ascending: false })
        .limit(30);
      if (res.error) setErr(res.error.message);
      else setRows((res.data as any) ?? []);
    }
    void load();
  }, []);

  return (
    <PortalShell title="Warehouse Portal">
      <div className="space-y-3">
        <div className="text-sm opacity-80">Latest warehouse parcels (requires RLS allowance).</div>
        {err ? <div className="text-xs text-red-400">Error: {err}</div> : null}
        <div className="grid gap-2">
          {rows.map((p) => (
            <div key={p.id} className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <div className="font-mono text-xs">{p.parcel_number || p.id.slice(0, 8)}</div>
              <div className="text-xs opacity-70">{p.status || "UNKNOWN"} • {new Date(p.created_at).toLocaleString()}</div>
            </div>
          ))}
          {!rows.length && !err ? <div className="text-xs opacity-60">No rows (or blocked by RLS).</div> : null}
        </div>
      </div>
    </PortalShell>
  );
}

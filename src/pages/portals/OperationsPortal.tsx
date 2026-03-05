import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PortalShell } from "@/components/layout/PortalShell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

type ShipmentRow = {
  id: string;
  way_id: string;
  receiver_name: string;
  receiver_phone: string;
  created_at: string;
};

export default function OperationsPortal() {
  const [rows, setRows] = useState<ShipmentRow[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setErr(null);
      const res = await supabase
        .from("shipments")
        .select("id, way_id, receiver_name, receiver_phone, created_at")
        .order("created_at", { ascending: false })
        .limit(20);

      if (res.error) setErr(res.error.message);
      else setRows((res.data as any) ?? []);
    }

    void load();
  }, []);

  return (
    <PortalShell
      title="Operations Portal"
      links={[
        { to: "/portal/operations/manual", label: "QR Ops Manual" },
        { to: "/portal/supervisor", label: "Supervisor" },
        { to: "/portal/warehouse", label: "Warehouse" },
        { to: "/portal/branch", label: "Branch" },
      ]}
    >
      <div className="space-y-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold">Express Delivery QR Operations Manual</div>
            <div className="text-xs opacity-70">QR scanning • e-POD • exception handling</div>
          </div>
          <Link to="/portal/operations/manual">
            <Button size="sm" variant="outline">
              Open
            </Button>
          </Link>
        </div>

        <div className="text-sm opacity-80">Latest shipments (requires RLS allowance for operations roles).</div>

        {err ? <div className="text-xs text-red-400">Error: {err}</div> : null}

        <div className="grid gap-2">
          {rows.map((r) => (
            <div key={r.id} className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <div className="flex items-center justify-between">
                <div className="font-mono text-xs">{r.way_id}</div>
                <div className="text-[10px] opacity-70">{new Date(r.created_at).toLocaleString()}</div>
              </div>
              <div className="text-sm">{r.receiver_name}</div>
              <div className="text-xs opacity-70">{r.receiver_phone}</div>
            </div>
          ))}
          {!rows.length && !err ? <div className="text-xs opacity-60">No rows (or blocked by RLS).</div> : null}
        </div>
      </div>
    </PortalShell>
  );
}

import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import type { Shipment } from "@/services/shipments";

export default function BranchPortal() {
  const [branchId, setBranchId] = useState("");
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setError(null);
    if (!branchId.trim()) {
      setError("Enter a branch_id UUID to filter.");
      return;
    }
    try {
      const { data, error } = await supabase
        .from("shipments")
        .select("id, way_id, merchant_id, sender_name, sender_phone, receiver_name, receiver_phone, receiver_address, status, assigned_rider_id, pickup_branch_id, delivery_branch_id, delivery_fee, cod_amount, total_amount, created_at")
        .or(`pickup_branch_id.eq.${branchId},delivery_branch_id.eq.${branchId}`)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      setShipments((data as any) ?? []);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load shipments");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="text-2xl font-bold">Branch / Substation Portal</div>
        <div className="text-sm text-white/60 mt-1">Filter shipments by pickup/delivery branch</div>
      </div>

      {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</div>}

      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-3">
        <div className="font-semibold">Branch Filter</div>
        <div className="flex gap-3 flex-col md:flex-row">
          <Input placeholder="branch_id (uuid)" value={branchId} onChange={(e) => setBranchId(e.target.value)} />
          <Button onClick={load}>Load</Button>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="font-semibold">Shipments</div>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-white/60">
              <tr>
                <th className="text-left py-2">Way ID</th>
                <th className="text-left py-2">Status</th>
                <th className="text-left py-2">Pickup Branch</th>
                <th className="text-left py-2">Delivery Branch</th>
              </tr>
            </thead>
            <tbody>
              {shipments.map((s) => (
                <tr key={s.id} className="border-t border-white/10">
                  <td className="py-2 font-mono">{s.way_id}</td>
                  <td className="py-2">{s.status}</td>
                  <td className="py-2 font-mono text-xs">{s.pickup_branch_id ?? "—"}</td>
                  <td className="py-2 font-mono text-xs">{s.delivery_branch_id ?? "—"}</td>
                </tr>
              ))}
              {shipments.length === 0 && (
                <tr>
                  <td className="py-4 text-white/50" colSpan={4}>
                    No shipments.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="text-xs text-white/50 mt-3">Requires RLS: SELECT shipments for your branch scope.</div>
      </div>
    </div>
  );
}

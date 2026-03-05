import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Campaign = {
  id: string;
  name: string;
  campaign_type: string;
  campaign_status: string;
  budget: number | null;
  spent_amount: number | null;
  start_date: string | null;
  end_date: string | null;
};

export default function MarketingPortal() {
  const [items, setItems] = useState<Campaign[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setError(null);
      try {
        const { data, error } = await supabase
          .from("marketing_campaigns")
          .select("id, name, campaign_type, campaign_status, budget, spent_amount, start_date, end_date")
          .order("created_at", { ascending: false })
          .limit(50);
        if (error) throw error;
        if (!cancelled) setItems((data as any) ?? []);
      } catch (e: any) {
        setError(e?.message ?? "Failed to load campaigns");
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <div className="text-2xl font-bold">Marketing Portal</div>
        <div className="text-sm text-white/60 mt-1">Campaign overview</div>
      </div>

      {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</div>}

      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="font-semibold">Campaigns</div>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-white/60">
              <tr>
                <th className="text-left py-2">Name</th>
                <th className="text-left py-2">Type</th>
                <th className="text-left py-2">Status</th>
                <th className="text-right py-2">Budget</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id} className="border-t border-white/10">
                  <td className="py-2">{c.name}</td>
                  <td className="py-2">{c.campaign_type}</td>
                  <td className="py-2">{c.campaign_status}</td>
                  <td className="py-2 text-right">{c.budget ? Number(c.budget).toLocaleString() : "—"}</td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td className="py-4 text-white/50" colSpan={4}>
                    No campaigns.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="text-xs text-white/50 mt-3">Requires RLS: SELECT marketing_campaigns.</div>
      </div>
    </div>
  );
}

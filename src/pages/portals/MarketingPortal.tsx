import React, { useEffect, useState } from "react";
import { PortalShell } from "@/components/layout/PortalShell";
import { supabase } from "@/lib/supabase";

type Campaign = { id: string; name: string; campaign_type: string; campaign_status: string; budget: number | null; start_date: string | null; end_date: string | null };

export default function MarketingPortal() {
  const [rows, setRows] = useState<Campaign[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setErr(null);
      const res = await supabase
        .from("marketing_campaigns")
        .select("id, name, campaign_type, campaign_status, budget, start_date, end_date")
        .order("created_at", { ascending: false })
        .limit(30);
      if (res.error) setErr(res.error.message);
      else setRows((res.data as any) ?? []);
    }
    void load();
  }, []);

  return (
    <PortalShell title="Marketing Portal">
      <div className="space-y-3">
        {err ? <div className="text-xs text-red-400">Error: {err}</div> : null}
        <div className="grid gap-2">
          {rows.map((c) => (
            <div key={c.id} className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-bold">{c.name}</div>
                <div className="text-[10px] opacity-70">{c.campaign_status}</div>
              </div>
              <div className="text-xs opacity-70">{c.campaign_type} • Budget: {c.budget ?? "-"}</div>
              <div className="text-[10px] opacity-60">{c.start_date ?? "-"} → {c.end_date ?? "-"}</div>
            </div>
          ))}
          {!rows.length && !err ? <div className="text-xs opacity-60">No campaigns (or blocked by RLS).</div> : null}
        </div>
      </div>
    </PortalShell>
  );
}

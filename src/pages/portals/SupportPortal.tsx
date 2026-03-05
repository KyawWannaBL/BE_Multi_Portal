import React, { useEffect, useState } from "react";
import { PortalShell } from "@/components/layout/PortalShell";
import { supabase } from "@/lib/supabase";

type Ticket = { id: string; ticket_number: string | null; subject: string | null; status: string | null; priority: string | null; created_at: string };

export default function SupportPortal() {
  const [rows, setRows] = useState<Ticket[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setErr(null);
      const res = await supabase
        .from("support_tickets")
        .select("id, ticket_number, subject, status, priority, created_at")
        .order("created_at", { ascending: false })
        .limit(30);
      if (res.error) setErr(res.error.message);
      else setRows((res.data as any) ?? []);
    }
    void load();
  }, []);

  return (
    <PortalShell title="Customer Service Portal">
      <div className="space-y-3">
        {err ? <div className="text-xs text-red-400">Error: {err}</div> : null}
        <div className="grid gap-2">
          {rows.map((t) => (
            <div key={t.id} className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <div className="flex items-center justify-between">
                <div className="font-mono text-xs">{t.ticket_number || t.id.slice(0, 8)}</div>
                <div className="text-[10px] opacity-70">{t.status || "-"}</div>
              </div>
              <div className="text-sm">{t.subject || "No subject"}</div>
              <div className="text-xs opacity-70">Priority: {t.priority || "-"} • {new Date(t.created_at).toLocaleString()}</div>
            </div>
          ))}
          {!rows.length && !err ? <div className="text-xs opacity-60">No tickets (or blocked by RLS).</div> : null}
        </div>
      </div>
    </PortalShell>
  );
}

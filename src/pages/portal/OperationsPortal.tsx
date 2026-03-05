import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";

export default function OperationsPortal() {
  const [counts, setCounts] = useState<{ pending: number; assigned: number; delivered: number }>({ pending: 0, assigned: 0, delivered: 0 });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const { data } = await supabase.from("shipments").select("status");
        if (cancelled || !data) return;
        const c = { pending: 0, assigned: 0, delivered: 0 };
        for (const r of data as any[]) {
          const s = String(r.status ?? "").toLowerCase();
          if (s === "pending") c.pending++;
          else if (s === "assigned") c.assigned++;
          else if (s === "delivered") c.delivered++;
        }
        setCounts(c);
      } catch {
        // ignore
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const cards = useMemo(
    () => [
      { title: "Shipments", to: "/operations/shipments", desc: "Register and manage shipments" },
      { title: "Control Room", to: "/operations/control-room", desc: "Realtime monitoring" },
      { title: "Approval Queue", to: "/operations/approval-queue", desc: "Approvals and exceptions" },
      { title: "Marketing Dashboard", to: "/operations/marketing-dashboard", desc: "Campaign analytics" },
      { title: "Human Resources", to: "/operations/human-resources", desc: "Employees and departments" },
      { title: "Supervisor Dashboard", to: "/operations/supervisor-dashboard", desc: "Branch performance and assignments" },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <div>
        <div className="text-2xl font-bold">Operations Portal</div>
        <div className="text-sm text-white/60 mt-1">Enterprise operations overview</div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="text-sm text-white/60">Pending</div>
          <div className="text-2xl font-semibold mt-1">{counts.pending}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="text-sm text-white/60">Assigned</div>
          <div className="text-2xl font-semibold mt-1">{counts.assigned}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="text-sm text-white/60">Delivered</div>
          <div className="text-2xl font-semibold mt-1">{counts.delivered}</div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((c) => (
          <Link key={c.to} to={c.to} className="rounded-2xl border border-white/10 bg-white/5 p-5 hover:bg-white/10 transition">
            <div className="font-semibold">{c.title}</div>
            <div className="text-sm text-white/60 mt-1">{c.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}

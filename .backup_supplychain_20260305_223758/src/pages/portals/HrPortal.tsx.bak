import React, { useEffect, useState } from "react";
import { PortalShell } from "@/components/layout/PortalShell";
import { supabase } from "@/lib/supabase";

type Employee = { id: string; employee_code: string; first_name: string; last_name: string; job_title: string; hire_date: string; employee_status: string };

export default function HrPortal() {
  const [rows, setRows] = useState<Employee[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setErr(null);
      const res = await supabase
        .from("employees")
        .select("id, employee_code, first_name, last_name, job_title, hire_date, employee_status")
        .order("hire_date", { ascending: false })
        .limit(30);
      if (res.error) setErr(res.error.message);
      else setRows((res.data as any) ?? []);
    }
    void load();
  }, []);

  return (
    <PortalShell title="HR Portal">
      <div className="space-y-3">
        {err ? <div className="text-xs text-red-400">Error: {err}</div> : null}
        <div className="grid gap-2">
          {rows.map((e) => (
            <div key={e.id} className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <div className="flex items-center justify-between">
                <div className="font-mono text-xs">{e.employee_code}</div>
                <div className="text-[10px] opacity-70">{e.employee_status}</div>
              </div>
              <div className="text-sm">{e.first_name} {e.last_name}</div>
              <div className="text-xs opacity-70">{e.job_title} • Hired: {e.hire_date}</div>
            </div>
          ))}
          {!rows.length && !err ? <div className="text-xs opacity-60">No employees (or blocked by RLS).</div> : null}
        </div>
      </div>
    </PortalShell>
  );
}

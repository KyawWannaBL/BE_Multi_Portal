import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Employee = {
  id: string;
  employee_code: string;
  first_name: string;
  last_name: string;
  job_title: string;
  hire_date: string;
  employee_status: string;
};

export default function HrPortal() {
  const [items, setItems] = useState<Employee[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setError(null);
      try {
        const { data, error } = await supabase
          .from("employees")
          .select("id, employee_code, first_name, last_name, job_title, hire_date, employee_status")
          .order("created_at", { ascending: false })
          .limit(50);
        if (error) throw error;
        if (!cancelled) setItems((data as any) ?? []);
      } catch (e: any) {
        setError(e?.message ?? "Failed to load employees");
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
        <div className="text-2xl font-bold">HR Portal</div>
        <div className="text-sm text-white/60 mt-1">Employees overview</div>
      </div>

      {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</div>}

      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="font-semibold">Employees</div>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-white/60">
              <tr>
                <th className="text-left py-2">Code</th>
                <th className="text-left py-2">Name</th>
                <th className="text-left py-2">Job</th>
                <th className="text-left py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((e) => (
                <tr key={e.id} className="border-t border-white/10">
                  <td className="py-2 font-mono">{e.employee_code}</td>
                  <td className="py-2">{e.first_name} {e.last_name}</td>
                  <td className="py-2">{e.job_title}</td>
                  <td className="py-2">{e.employee_status}</td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td className="py-4 text-white/50" colSpan={4}>
                    No employees.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="text-xs text-white/50 mt-3">Requires RLS: SELECT employees.</div>
      </div>
    </div>
  );
}

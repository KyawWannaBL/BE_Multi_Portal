import React from "react";
import { Link } from "react-router-dom";
import { useRbac } from "@/app/providers/RbacProvider";

export default function AdminPortal() {
  const { role } = useRbac();

  return (
    <div className="space-y-5">
      <div>
        <div className="text-2xl font-bold">Admin Portal</div>
        <div className="text-sm text-white/60 mt-1">Role: {role ?? "—"}</div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Link className="rounded-2xl border border-white/10 bg-white/5 p-5 hover:bg-white/10" to="/admin/dashboard">
          <div className="font-semibold">Admin Dashboard</div>
          <div className="text-sm text-white/60 mt-1">System overview and controls</div>
        </Link>

        <Link className="rounded-2xl border border-white/10 bg-white/5 p-5 hover:bg-white/10" to="/admin/users">
          <div className="font-semibold">Users</div>
          <div className="text-sm text-white/60 mt-1">Admin user management</div>
        </Link>

        <Link className="rounded-2xl border border-white/10 bg-white/5 p-5 hover:bg-white/10" to="/admin/audit">
          <div className="font-semibold">Audit Logs</div>
          <div className="text-sm text-white/60 mt-1">Security and operational audit trail</div>
        </Link>

        <Link className="rounded-2xl border border-white/10 bg-white/5 p-5 hover:bg-white/10" to="/admin/permission-assignment">
          <div className="font-semibold">Permission Assignment</div>
          <div className="text-sm text-white/60 mt-1">Assign screens and scope permissions</div>
        </Link>
      </div>
    </div>
  );
}

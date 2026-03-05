import React from "react";
import { Link } from "react-router-dom";
import { useRbac } from "@/app/providers/RbacProvider";

function Card({ title, to, desc }: { title: string; to: string; desc: string }) {
  return (
    <Link
      to={to}
      className="block rounded-2xl border border-white/10 bg-white/5 p-5 hover:bg-white/10 transition"
    >
      <div className="text-lg font-semibold">{title}</div>
      <div className="mt-1 text-sm text-white/60">{desc}</div>
    </Link>
  );
}

export default function PortalHome() {
  const { profile, role } = useRbac();

  return (
    <div className="space-y-6">
      <div>
        <div className="text-2xl font-bold">Portal</div>
        <div className="text-sm text-white/60 mt-1">
          {profile?.full_name ?? profile?.email ?? "—"} • {role ?? "UNASSIGNED"}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card title="Admin" to="/portal/admin" desc="Users, permissions, audit logs" />
        <Card title="Operations" to="/portal/operations" desc="Shipments, control room, approvals" />
        <Card title="Supervisor" to="/portal/supervisor" desc="Assign riders, monitor delivery flow" />
        <Card title="Execution" to="/portal/execution" desc="Rider/Driver/Helper worklist" />
        <Card title="Warehouse" to="/portal/warehouse" desc="Receiving, dispatch, hub operations" />
        <Card title="Branch" to="/portal/branch" desc="Branch/substation management" />
        <Card title="Merchant" to="/portal/merchant" desc="Create shipments, track and invoices" />
        <Card title="Customer" to="/portal/customer" desc="Track shipments and delivery updates" />
        <Card title="Finance" to="/portal/finance" desc="Invoices, transactions, reports" />
        <Card title="Marketing" to="/portal/marketing" desc="Campaigns and performance" />
        <Card title="HR" to="/portal/hr" desc="Employees and departments" />
        <Card title="Support" to="/portal/support" desc="Customer service dashboard" />
      </div>

      <div className="text-xs text-white/40">
        Note: Access depends on your role + Supabase RLS policies.
      </div>
    </div>
  );
}

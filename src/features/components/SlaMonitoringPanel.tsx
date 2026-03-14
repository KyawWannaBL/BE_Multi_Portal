import type { SlaSummary } from "../types";

export function SlaMonitoringPanel({ summary }: { summary: SlaSummary }) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <div className="rounded-xl border p-4">
        <div className="text-sm text-muted-foreground">Total Orders</div>
        <div className="mt-2 text-3xl font-bold">{summary.total}</div>
      </div>

      <div className="rounded-xl border p-4">
        <div className="text-sm text-muted-foreground">Healthy</div>
        <div className="mt-2 text-3xl font-bold text-emerald-600">
          {summary.healthy}
        </div>
      </div>

      <div className="rounded-xl border p-4">
        <div className="text-sm text-muted-foreground">Warning</div>
        <div className="mt-2 text-3xl font-bold text-amber-600">
          {summary.warning}
        </div>
      </div>

      <div className="rounded-xl border p-4">
        <div className="text-sm text-muted-foreground">Breached</div>
        <div className="mt-2 text-3xl font-bold text-rose-600">
          {summary.breached}
        </div>
      </div>
    </div>
  );
}
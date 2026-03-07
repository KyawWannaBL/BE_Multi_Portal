import React from "react";
import { Badge } from "@/components/ui/badge";

export type WhStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "HOLD" | "CANCELLED";

export function WarehouseStatusBadge({ status }: { status: WhStatus | string }) {
  const s = String(status ?? "PENDING").toUpperCase();

  const cls =
    s === "COMPLETED"
      ? "border-emerald-500/30 text-emerald-300 bg-emerald-500/10"
      : s === "IN_PROGRESS"
      ? "border-amber-500/30 text-amber-300 bg-amber-500/10"
      : s === "HOLD"
      ? "border-rose-500/30 text-rose-300 bg-rose-500/10"
      : s === "CANCELLED"
      ? "border-slate-500/30 text-slate-300 bg-slate-500/10"
      : "border-white/10 text-white/70 bg-white/5";

  return (
    <Badge variant="outline" className={cls}>
      {s}
    </Badge>
  );
}

export default WarehouseStatusBadge;

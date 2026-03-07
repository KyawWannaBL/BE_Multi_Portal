import React from "react";
import { ROLE_MATRIX, normalizeRole } from "@/lib/rbac";

export default function TierBadge({ role }: { role: string | null | undefined }) {
  const r = normalizeRole(role);
  const info = r ? (ROLE_MATRIX as any)[r] : null;

  const level = info?.level ?? (r === "SYS" || r === "APP_OWNER" || r === "SUPER_ADMIN" ? "L5" : "L1");
  const scope = info?.scope ?? "S1";

  const color =
    level === "L5"
      ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/25"
      : level === "L4"
        ? "bg-sky-500/15 text-sky-300 border-sky-500/25"
        : level === "L3"
          ? "bg-amber-500/15 text-amber-300 border-amber-500/25"
          : "bg-white/5 text-slate-300 border-white/10";

  return (
    <span className={`inline-flex items-center h-7 px-3 rounded-full border text-[10px] font-black tracking-widest uppercase ${color}`} title={`${r ?? "NO_ROLE"}`}>
      {level} • {scope}
    </span>
  );
}

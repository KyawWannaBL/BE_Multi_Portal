import React from "react";

type Tier = "L1" | "L2" | "L3" | "L4" | "L5";

function normalizeRole(role?: string | null): string {
  const r = (role ?? "").trim().toUpperCase();
  if (!r) return "GUEST";
  if (r.startsWith("SUPER")) return "SUPER_ADMIN";
  if (r.startsWith("APP")) return "APP_OWNER";
  if (r.startsWith("SYS")) return "SYS";
  return r;
}

export function tierFromRole(role?: string | null): Tier {
  const r = normalizeRole(role);

  if (r === "SYS" || r === "APP_OWNER" || r === "SUPER_ADMIN") return "L5";
  if (r === "ADMIN" || r === "ADM" || r === "MGR" || r === "OPERATIONS_ADMIN") return "L4";
  if (
    r.includes("FINANCE") ||
    r.includes("HR") ||
    r.includes("MARKETING") ||
    r.includes("SUPPORT") ||
    r.includes("CUSTOMER_SERVICE")
  )
    return "L3";
  if (
    r === "SUPERVISOR" ||
    r === "WAREHOUSE_MANAGER" ||
    r === "SUBSTATION_MANAGER" ||
    r === "STAFF"
  )
    return "L2";

  return "L1";
}

export default function TierBadge(props: { role?: string | null; className?: string }) {
  const tier = tierFromRole(props.role);
  const color =
    tier === "L5"
      ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/25"
      : tier === "L4"
        ? "bg-sky-500/15 text-sky-300 border-sky-500/25"
        : tier === "L3"
          ? "bg-amber-500/15 text-amber-300 border-amber-500/25"
          : tier === "L2"
            ? "bg-white/10 text-slate-200 border-white/15"
            : "bg-white/5 text-slate-300 border-white/10";

  return (
    <span
      className={`inline-flex items-center h-8 px-3 rounded-full border text-[11px] font-black tracking-widest uppercase ${color} ${props.className ?? ""}`}
      title={`Tier ${tier}`}
    >
      {tier}
    </span>
  );
}

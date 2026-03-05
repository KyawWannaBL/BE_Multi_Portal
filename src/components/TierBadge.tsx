import React from "react";

export type Tier = "L1" | "L2" | "L3" | "L4" | "L5";

export function getTier(role?: string, tierLevel?: any): Tier {
  const rawTier = String(tierLevel || "").trim().toUpperCase();
  if (/^L[1-5]$/.test(rawTier)) return rawTier as Tier;
  if (/^[1-5]$/.test(rawTier)) return (`L${rawTier}` as Tier);

  const r = (role ?? "").toUpperCase();
  if (["SYS", "APP_OWNER"].includes(r)) return "L5";
  if (["SUPER_ADMIN", "ADMIN", "MGR", "OPERATIONS_ADMIN"].includes(r)) return "L4";
  if (r.includes("FINANCE") || r.includes("HR") || r.includes("MARKETING")) return "L3";
  if (r === "SUPERVISOR" || r === "STAFF" || r === "CUSTOMER_SERVICE" || r === "DATA_ENTRY") return "L2";
  
  return "L1";
}

export default function TierBadge(props: { role?: string | null; tierLevel?: unknown; className?: string }) {
  const tier = getTier(props.role || undefined, props.tierLevel);

  const colors: Record<Tier, string> = {
    L5: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
    L4: "bg-sky-500/15 text-sky-300 border-sky-500/25",
    L3: "bg-amber-500/15 text-amber-300 border-amber-500/25",
    L2: "bg-white/10 text-slate-200 border-white/15",
    L1: "bg-white/5 text-slate-300 border-white/10"
  };

  return (
    <span className={`inline-flex items-center h-8 px-3 rounded-full border text-[11px] font-black tracking-widest uppercase ${colors[tier]} ${props.className ?? ""}`} title={`Tier ${tier}`}>
      {tier}
    </span>
  );
}

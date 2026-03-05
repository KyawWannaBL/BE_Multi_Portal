import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/supabaseClient";
import {
  ShieldCheck,
  Users,
  Activity,
  HardDrive,
  ArrowRight,
  Clock,
  UserCheck,
  ShieldAlert,
  KeyRound,
} from "lucide-react";

type MetricState = {
  personnel: number | null;
  riders: number | null;
  securityEvents: number | null;
  rotationRequired: number | null;
  health: "NOMINAL" | "DEGRADED" | "UNKNOWN";
};

type AuditRow = {
  id: number | string;
  created_at: string;
  event_type: string;
  user_id?: string | null;
  metadata?: any;
};

function relativeTime(iso: string) {
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return iso;
  const diff = Date.now() - t;

  const s = Math.floor(diff / 1000);
  if (s < 10) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 48) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function fmt(n: number | null) {
  if (n === null) return "—";
  return new Intl.NumberFormat().format(n);
}

function eventIcon(eventType: string) {
  const t = (eventType || "").toUpperCase();
  if (t.includes("PASSWORD")) return KeyRound;
  if (t.includes("LOGIN")) return Clock;
  if (t.includes("SESSION")) return ShieldCheck;
  return ShieldAlert;
}

function eventBadge(eventType: string) {
  const t = (eventType || "").toUpperCase();
  if (t.includes("PASSWORD")) return { bg: "bg-amber-500/10", fg: "text-amber-500" };
  if (t.includes("LOGIN")) return { bg: "bg-emerald-500/10", fg: "text-emerald-500" };
  if (t.includes("SESSION")) return { bg: "bg-blue-500/10", fg: "text-blue-500" };
  return { bg: "bg-slate-500/10", fg: "text-slate-300" };
}

export default function SuperAdminDashboard() {
  const { user, role } = useAuth();
  const { lang } = useLanguage();
  const navigate = useNavigate();

  const t = (en: string, mm: string) => (lang === "en" ? en : mm);

  const [metrics, setMetrics] = useState<MetricState>({
    personnel: null,
    riders: null,
    securityEvents: null,
    rotationRequired: null,
    health: "UNKNOWN",
  });

  const [audit, setAudit] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);

  const roleLabel = useMemo(() => {
    const raw = role || "AUTHORIZED_USER";
    return String(raw).replaceAll("_", " ").toUpperCase();
  }, [role]);
useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);

      // Default: degraded unless we complete at least one successful call.
      let health: MetricState["health"] = "DEGRADED";

      // 1) TOTAL PERSONNEL (profiles count)
      const personnelRes = await supabase
        .from("profiles")
        .select("id", { count: "exact", head: true });

      // 2) ACTIVE RIDERS (best-effort: count profiles with rider-ish roles)
      // Adjust roles if your DB uses different codes.
      const riderRoles = ["RDR", "RIDER", "RIDER_USER", "DELIVERY_RIDER"];
      const ridersRes = await supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .in("role", riderRoles);

      // 3) SECURITY EVENTS (audit_logs count)
      const logsRes = await supabase
        .from("audit_logs")
        .select("id", { count: "exact", head: true });

      // 4) ROTATION REQUIRED (profiles.must_change_password = true)
      const rotationRes = await supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("must_change_password", true);

      // 5) Live audit feed (latest 15)
      const auditRes = await supabase
        .from("audit_logs")
        .select("id, created_at, event_type, user_id, metadata")
        .order("created_at", { ascending: false })
        .limit(15);

      // Determine health:
      const anyOk =
        !personnelRes.error || !ridersRes.error || !logsRes.error || !rotationRes.error || !auditRes.error;
      health = anyOk ? "NOMINAL" : "DEGRADED";

      if (cancelled) return;

      setMetrics({
        personnel: personnelRes.count ?? null,
        riders: ridersRes.count ?? null,
        securityEvents: logsRes.count ?? null,
        rotationRequired: rotationRes.count ?? null,
        health,
      });

      setAudit((auditRes.data as any) ?? []);
      setLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = useMemo(
    () => [
      {
        title: t("TOTAL PERSONNEL", "ဝန်ထမ်းစုစုပေါင်း"),
        value: fmt(metrics.personnel),
        icon: Users,
        color: "text-blue-500",
        bg: "bg-blue-500/10",
        border: "border-blue-500/20",
      },
      {
        title: t("ACTIVE RIDERS", "တာဝန်ထမ်းဆောင်နေသော Rider များ"),
        value: fmt(metrics.riders),
        icon: Activity,
        color: "text-emerald-500",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20",
      },
      {
        title: t("SECURITY EVENTS", "လုံခြုံရေးဖြစ်ရပ်များ"),
        value: fmt(metrics.securityEvents),
        icon: ShieldCheck,
        color: "text-amber-500",
        bg: "bg-amber-500/10",
        border: "border-amber-500/20",
      },
      {
        title: t("ROTATION REQUIRED", "စကားဝှက်ပြောင်းရန်လိုအပ်သူများ"),
        value: fmt(metrics.rotationRequired),
        icon: KeyRound,
        color: "text-purple-500",
        bg: "bg-purple-500/10",
        border: "border-purple-500/20",
      },
    ],
    [metrics, lang]
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded text-[10px] font-mono text-emerald-400 tracking-widest uppercase">
              {roleLabel}
            </div>
            <span className="text-xs font-mono text-slate-500 tracking-wider">
              {t("SESSION ACTIVE", "စနစ်ဝင်ရောက်ထားပါသည်")}
            </span>
          </div>

          <h1 className="text-3xl font-black text-white tracking-widest uppercase">
            {t("Command Center", "စီမံခန့်ခွဲမှုစင်တာ")}
          </h1>

          <p className="text-sm text-slate-400 mt-1 font-mono">{(user as any)?.email ?? "—"}</p>
        </div>

        <div className="text-right">
          <p className="text-[10px] font-mono text-slate-500 tracking-widest uppercase">
            {t("SYSTEM STATUS", "စနစ်အခြေအနေ")}
          </p>
          <div className="flex items-center gap-2 mt-1 justify-end">
            <div className={`w-2 h-2 rounded-full ${metrics.health === "NOMINAL" ? "bg-emerald-500" : "bg-amber-500"} animate-pulse`} />
            <span className={`text-xs font-mono tracking-widest uppercase ${metrics.health === "NOMINAL" ? "text-emerald-500" : "text-amber-500"}`}>
              {metrics.health === "NOMINAL" ? t("ALL SYSTEMS NOMINAL", "စနစ်အခြေအနေကောင်းမွန်") : t("SYSTEM DEGRADED", "စနစ်အချို့ချို့ယွင်း")}
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className={`p-6 rounded-2xl bg-[#0B101B] border ${stat.border} flex flex-col justify-between relative overflow-hidden group`}
            >
              <div className="absolute -right-6 -top-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <Icon size={100} />
              </div>

              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                  <Icon size={20} />
                </div>
              </div>

              <div>
                <h3 className="text-3xl font-black text-white mb-1">{stat.value}</h3>
                <p className="text-[10px] font-mono text-slate-400 tracking-widest uppercase">{stat.title}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions + Audit */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-black text-white tracking-widest uppercase flex items-center gap-2">
            <Activity size={16} className="text-emerald-500" />
            {t("Quick Actions", "အမြန်လုပ်ဆောင်ရန်များ")}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => navigate("/admin/accounts")}
              className="p-6 rounded-2xl bg-[#111622] border border-white/5 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all group text-left flex flex-col"
            >
              <UserCheck className="text-blue-500 mb-4" size={24} />
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                {t("Account Control", "အကောင့်စီမံခန့်ခွဲမှု")}
              </h3>
              <p className="text-xs text-slate-500 mb-4 font-mono leading-relaxed">
                {t(
                  "Manage personnel clearances, roles, and system access levels.",
                  "ဝန်ထမ်းများ၏ ရာထူးနှင့် လုပ်ပိုင်ခွင့်များကို စီမံပါ။"
                )}
              </p>
              <div className="mt-auto flex items-center gap-2 text-[10px] font-mono tracking-widest text-blue-500 uppercase">
                {t("Launch Module", "ဝင်ရောက်မည်")} <ArrowRight size={12} />
              </div>
            </button>

            <button
              onClick={() => navigate("/admin/hr")}
              className="p-6 rounded-2xl bg-[#111622] border border-white/5 hover:border-purple-500/30 hover:bg-purple-500/5 transition-all group text-left flex flex-col"
            >
              <Users className="text-purple-500 mb-4" size={24} />
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
                {t("HR Portal", "လူ့စွမ်းအားအရင်းအမြစ်")}
              </h3>
              <p className="text-xs text-slate-500 mb-4 font-mono leading-relaxed">
                {t(
                  "Review employee records, shifts, and departmental assignments.",
                  "ဝန်ထမ်းမှတ်တမ်းများနှင့် အလုပ်ချိန်များကို စစ်ဆေးပါ။"
                )}
              </p>
              <div className="mt-auto flex items-center gap-2 text-[10px] font-mono tracking-widest text-purple-500 uppercase">
                {t("Launch Module", "ဝင်ရောက်မည်")} <ArrowRight size={12} />
              </div>
            </button>
          </div>
        </div>

        {/* Live Audit Feed */}
        <div className="space-y-4">
          <h2 className="text-sm font-black text-white tracking-widest uppercase flex items-center gap-2">
            <ShieldAlert size={16} className="text-amber-500" />
            {t("Live Audit Feed", "လုံခြုံရေးမှတ်တမ်းများ")}
          </h2>

          <div className="bg-[#0B101B] border border-white/5 rounded-2xl p-4 space-y-4 h-[280px] overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="text-xs font-mono text-slate-500">{t("Loading audit feed…", "မှတ်တမ်းများ ရယူနေပါသည်…")}</div>
            ) : audit.length === 0 ? (
              <div className="text-xs font-mono text-slate-500">{t("No audit events found.", "လုံခြုံရေးမှတ်တမ်း မတွေ့ရှိပါ။")}</div>
            ) : (
              audit.map((row) => {
                const Icon = eventIcon(row.event_type);
                const badge = eventBadge(row.event_type);
                return (
                  <div key={String(row.id)} className="flex gap-3 items-start border-b border-white/5 pb-3">
                    <div className={`p-1.5 rounded-md ${badge.bg} ${badge.fg} mt-0.5`}>
                      <Icon size={12} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-slate-300 font-mono truncate">{row.event_type}</p>
                      <p className="text-[10px] text-slate-500 font-mono mt-1 truncate">
                        {row.user_id ? `user_id: ${String(row.user_id).slice(0, 8)}...` : "user_id: —"}
                      </p>
                      <p className={`text-[9px] font-mono mt-1 uppercase tracking-wider ${badge.fg}/70`}>
                        {relativeTime(row.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

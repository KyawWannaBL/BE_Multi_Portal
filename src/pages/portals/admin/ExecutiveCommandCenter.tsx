import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/supabaseClient";
import { getAvailablePortals, normalizeRole, PORTALS } from "@/lib/portalRegistry";
import TierBadge from "@/components/TierBadge";
import { Activity, ArrowRight, HardDrive, KeyRound, ShieldAlert, ShieldCheck, Users, UserCheck } from "lucide-react";

type Health = "NOMINAL" | "DEGRADED" | "UNKNOWN";

type MetricState = {
  personnel: number | null;
  riders: number | null;
  securityEvents: number | null;
  rotationRequired: number | null;
  portalsAvailable: number | null;
  health: Health;
};

type AuditRow = {
  id: number | string;
  created_at: string;
  event_type: string;
  user_id?: string | null;
  metadata?: any;
};

function relativeTime(iso: string, lang: string) {
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return iso;
  const diff = Date.now() - t;

  const s = Math.floor(diff / 1000);
  const tr = (en: string, mm: string) => (lang === "en" ? en : mm);

  if (s < 10) return tr("just now", "ယခုပဲ");
  if (s < 60) return tr(`${s}s ago`, `${s}s အရင်`);
  const m = Math.floor(s / 60);
  if (m < 60) return tr(`${m}m ago`, `${m}m အရင်`);
  const h = Math.floor(m / 60);
  if (h < 48) return tr(`${h}h ago`, `${h}h အရင်`);
  const d = Math.floor(h / 24);
  return tr(`${d}d ago`, `${d}ရက် အရင်`);
}

function fmt(n: number | null) {
  if (n === null) return "—";
  return new Intl.NumberFormat().format(n);
}

function eventIcon(eventType: string) {
  const t = (eventType || "").toUpperCase();
  if (t.includes("PASSWORD")) return KeyRound;
  if (t.includes("LOGIN")) return Activity;
  if (t.includes("SESSION")) return ShieldCheck;
  return ShieldAlert;
}

function eventBadge(eventType: string) {
  const t = (eventType || "").toUpperCase();
  if (t.includes("PASSWORD")) return { bg: "bg-amber-500/10", fg: "text-amber-400" };
  if (t.includes("LOGIN")) return { bg: "bg-emerald-500/10", fg: "text-emerald-400" };
  if (t.includes("SESSION")) return { bg: "bg-sky-500/10", fg: "text-sky-300" };
  return { bg: "bg-white/5", fg: "text-slate-300" };
}

async function countProfilesTotal(): Promise<number | null> {
  const res = await supabase.from("profiles").select("id", { count: "exact", head: true });
  if (res.error) return null;
  return res.count ?? null;
}

async function countProfilesByAnyRoleField(riderRoles: string[]): Promise<number | null> {
  const candidates = ["role", "role_code", "app_role", "user_role"];
  for (const field of candidates) {
    const res = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      // @ts-ignore
      .in(field, riderRoles);
    if (!res.error) return res.count ?? null;

    const msg = (res.error as any)?.message?.toLowerCase?.() ?? "";
    const code = (res.error as any)?.code ?? "";
    const looksLikeMissingColumn = msg.includes("column") && msg.includes(field) || msg.includes("does not exist") || code === "42703";
    if (!looksLikeMissingColumn) break;
  }
  return null;
}

async function countRotationRequired(): Promise<number | null> {
  const candidates = ["must_change_password", "requires_password_change", "requires_password_reset"];
  for (const field of candidates) {
    const res = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      // @ts-ignore
      .eq(field, true);
    if (!res.error) return res.count ?? null;

    const msg = (res.error as any)?.message?.toLowerCase?.() ?? "";
    const code = (res.error as any)?.code ?? "";
    const looksLikeMissingColumn = msg.includes("column") && msg.includes(field) || msg.includes("does not exist") || code === "42703";
    if (!looksLikeMissingColumn) break;
  }
  return null;
}

async function countAuditEvents(): Promise<number | null> {
  const res = await supabase.from("audit_logs").select("id", { count: "exact", head: true });
  if (res.error) return null;
  return res.count ?? null;
}

async function loadAuditFeed(limit = 15): Promise<AuditRow[]> {
  const res = await supabase
    .from("audit_logs")
    .select("id, created_at, event_type, user_id, metadata")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (res.error) return [];
  return (res.data as any) ?? [];
}

async function loadTierLevel(userId: string): Promise<unknown> {
  try {
    const res = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
    if (res.error || !res.data) return null;
    const d: any = res.data;
    return d.tier_level ?? d.tier ?? d.level ?? d.tierLevel ?? null;
  } catch {
    return null;
  }
}

export default function ExecutiveCommandCenter() {
  const { user, role } = useAuth();
  const { lang } = useLanguage();
  const navigate = useNavigate();

  const t = (en: string, mm: string) => (lang === "en" ? en : mm);

  const [metrics, setMetrics] = useState<MetricState>({
    personnel: null,
    riders: null,
    securityEvents: null,
    rotationRequired: null,
    portalsAvailable: null,
    health: "UNKNOWN",
  });

  const [tierLevel, setTierLevel] = useState<unknown>(null);
  const [audit, setAudit] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);

  const roleLabel = useMemo(() => {
    const raw = role || "AUTHORIZED_USER";
    return String(raw).replaceAll("_", " ").toUpperCase();
  }, [role]);

  const availablePortals = useMemo(() => getAvailablePortals(role), [role]);
  const allPortalsCount = PORTALS.length;

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);

      const userId = (user as any)?.id as string | undefined;
      if (userId) {
        const tl = await loadTierLevel(userId);
        if (!cancelled) setTierLevel(tl);
      }

      const riderRoles = ["RDR", "RIDER", "RIDER_USER", "DELIVERY_RIDER", "DRIVER", "HELPER"];

      const [personnel, riders, securityEvents, rotationRequired, feed] = await Promise.all([
        countProfilesTotal(),
        countProfilesByAnyRoleField(riderRoles),
        countAuditEvents(),
        countRotationRequired(),
        loadAuditFeed(15),
      ]);

      const anyOk = personnel !== null || riders !== null || securityEvents !== null || rotationRequired !== null || (feed?.length ?? 0) > 0;
      const health: Health = anyOk ? "NOMINAL" : "DEGRADED";

      if (cancelled) return;

      setMetrics({
        personnel,
        riders,
        securityEvents,
        rotationRequired,
        portalsAvailable: availablePortals.length,
        health,
      });

      setAudit(feed);
      setLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [user, availablePortals.length]);

  const stats = useMemo(
    () => [
      { title: t("TOTAL PERSONNEL", "ဝန်ထမ်းစုစုပေါင်း"), value: fmt(metrics.personnel), icon: Users, color: "text-sky-300", bg: "bg-sky-500/10", border: "border-sky-500/20" },
      { title: t("ACTIVE RIDERS", "တာဝန်ထမ်းဆောင်နေသော Rider များ"), value: fmt(metrics.riders), icon: Activity, color: "text-emerald-300", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
      { title: t("SECURITY EVENTS", "လုံခြုံရေးဖြစ်ရပ်များ"), value: fmt(metrics.securityEvents), icon: ShieldCheck, color: "text-amber-300", bg: "bg-amber-500/10", border: "border-amber-500/20" },
      { title: t("ROTATION REQUIRED", "စကားဝှက်ပြောင်းရန်လိုအပ်သူများ"), value: fmt(metrics.rotationRequired), icon: KeyRound, color: "text-purple-300", bg: "bg-purple-500/10", border: "border-purple-500/20" },
      { title: t("AVAILABLE PORTALS", "အသုံးပြုနိုင်သော Portal များ"), value: fmt(metrics.portalsAvailable), icon: HardDrive, color: "text-slate-200", bg: "bg-white/5", border: "border-white/10" },
    ],
    [metrics, lang]
  );

  const sysStatusLabel = metrics.health === "NOMINAL" ? t("ALL SYSTEMS NOMINAL", "စနစ်အခြေအနေကောင်းမွန်") : t("SYSTEM DEGRADED", "စနစ်အချို့ချို့ယွင်း");
  const normalizedRole = useMemo(() => normalizeRole(role), [role]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center flex-wrap gap-3 mb-2">
            <div className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded text-[10px] font-mono text-emerald-300 tracking-widest uppercase">
              {roleLabel}
            </div>
            <TierBadge role={normalizedRole} tierLevel={tierLevel} />
            <span className="text-xs font-mono text-slate-500 tracking-wider">{t("SESSION ACTIVE", "စနစ်ဝင်ရောက်ထားပါသည်")}</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-widest uppercase">{t("Command Center", "စီမံခန့်ခွဲမှုစင်တာ")}</h1>
          <p className="text-sm text-slate-400 mt-1 font-mono">{(user as any)?.email ?? "—"}</p>
          <p className="text-[10px] text-slate-600 mt-2 font-mono">{t("Portals", "Portal များ")}: {availablePortals.length}/{allPortalsCount}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-mono text-slate-500 tracking-widest uppercase">{t("SYSTEM STATUS", "စနစ်အခြေအနေ")}</p>
          <div className="flex items-center gap-2 mt-1 justify-end">
            <div className={`w-2 h-2 rounded-full ${metrics.health === "NOMINAL" ? "bg-emerald-500" : "bg-amber-500"} animate-pulse`} />
            <span className={`text-xs font-mono tracking-widest uppercase ${metrics.health === "NOMINAL" ? "text-emerald-400" : "text-amber-400"}`}>{sysStatusLabel}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className={`p-6 rounded-2xl bg-[#0B101B] border ${stat.border} flex flex-col justify-between relative overflow-hidden group`}>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-black text-white tracking-widest uppercase flex items-center gap-2">
            <Activity size={16} className="text-emerald-500" />
            {t("Available Portals", "အသုံးပြုနိုင်သော Portal များ")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availablePortals.map((p) => {
              const Icon = p.icon;
              return (
                <button key={p.id} onClick={() => navigate(p.path)} className="p-6 rounded-2xl bg-[#111622] border border-white/5 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all group text-left flex flex-col">
                  <Icon className="text-emerald-400 mb-4" size={24} />
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-emerald-300 transition-colors">{lang === "en" ? p.title_en : p.title_mm}</h3>
                  <p className="text-xs text-slate-500 mb-4 font-mono leading-relaxed">{lang === "en" ? p.desc_en : p.desc_mm}</p>
                  <div className="mt-auto flex items-center gap-2 text-[10px] font-mono tracking-widest text-emerald-400 uppercase">
                    {t("Launch Portal", "ဝင်ရောက်မည်")} <ArrowRight size={12} />
                  </div>
                </button>
              );
            })}
          </div>
          <div className="text-[10px] font-mono text-slate-600">{t("Your access is based on your role and delegated authorities.", "သင့် role နှင့် authority များအပေါ် မူတည်ပါသည်။")}</div>
        </div>

        <div className="space-y-4">
          <h2 className="text-sm font-black text-white tracking-widest uppercase flex items-center gap-2">
            <ShieldAlert size={16} className="text-amber-500" />
            {t("Live Audit Feed", "လုံခြုံရေးမှတ်တမ်းများ")}
          </h2>
          <div className="bg-[#0B101B] border border-white/5 rounded-2xl p-4 space-y-4 h-[320px] overflow-y-auto">
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
                      <p className="text-xs text-slate-200 font-mono truncate">{row.event_type}</p>
                      <p className="text-[10px] text-slate-500 font-mono mt-1 truncate">{row.user_id ? `user_id: ${String(row.user_id).slice(0, 8)}...` : "user_id: —"}</p>
                      <p className={`text-[9px] font-mono mt-1 uppercase tracking-wider ${badge.fg}/70`}>{relativeTime(row.created_at, lang)}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <div className="text-[10px] font-mono text-slate-600">{t("If audit_logs table is not configured, this list will be empty.", "audit_logs မရှိသေးပါက ဒီစာရင်းမှာ မပြပါ။")}</div>
        </div>
      </div>
    </div>
  );
}

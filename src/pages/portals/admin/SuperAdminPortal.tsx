import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PortalShell } from "@/components/layout/PortalShell";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/lib/supabase";
import { portalCountAll, portalCountForRole, portalsForRole } from "@/lib/portalRegistry";
import {
  Activity,
  ArrowRight,
  KeyRound,
  ShieldAlert,
  ShieldCheck,
  Users,
  UserCheck,
  ClipboardList,
} from "lucide-react";

type Health = "NOMINAL" | "DEGRADED" | "UNKNOWN";

type MetricState = {
  personnel: number | null;
  riders: number | null;
  securityEvents: number | null;
  rotationRequired: number | null;
  portalsAccessible: number | null;
  portalsTotal: number | null;
  health: Health;
};

type AuditRow = {
  id: number | string;
  created_at: string;
  event_type: string;
  user_id?: string | null;
  metadata?: any;
};

function fmt(n: number | null) {
  if (n === null) return "—";
  return new Intl.NumberFormat().format(n);
}

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

async function countProfilesTotal(): Promise<number | null> {
  const res = await supabase.from("profiles").select("id", { count: "exact", head: true });
  if (res.error) return null;
  return res.count ?? null;
}

async function countProfilesByRoleFields(roles: string[]): Promise<number | null> {
  const fields = ["role", "role_code", "app_role", "user_role"];
  for (const f of fields) {
    // @ts-ignore
    const res = await supabase.from("profiles").select("id", { count: "exact", head: true }).in(f, roles);
    if (!res.error) return res.count ?? null;

    const code = (res.error as any)?.code ?? "";
    const msg = ((res.error as any)?.message ?? "").toLowerCase();
    const missing = code === "42703" || msg.includes("does not exist") || (msg.includes("column") && msg.includes(f));
    if (!missing) break;
  }
  return null;
}

async function countRotationRequired(): Promise<number | null> {
  const fields = ["must_change_password", "requires_password_change", "requires_password_reset"];
  for (const f of fields) {
    // @ts-ignore
    const res = await supabase.from("profiles").select("id", { count: "exact", head: true }).eq(f, true);
    if (!res.error) return res.count ?? null;

    const code = (res.error as any)?.code ?? "";
    const msg = ((res.error as any)?.message ?? "").toLowerCase();
    const missing = code === "42703" || msg.includes("does not exist") || (msg.includes("column") && msg.includes(f));
    if (!missing) break;
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

function eventBadge(eventType: string) {
  const t = (eventType || "").toUpperCase();
  if (t.includes("PASSWORD")) return { bg: "bg-amber-500/10", fg: "text-amber-300", icon: KeyRound };
  if (t.includes("LOGIN")) return { bg: "bg-emerald-500/10", fg: "text-emerald-300", icon: Activity };
  if (t.includes("SESSION")) return { bg: "bg-sky-500/10", fg: "text-sky-300", icon: ShieldCheck };
  return { bg: "bg-white/5", fg: "text-slate-300", icon: ShieldAlert };
}

export default function SuperAdminPortal() {
  const { user, role } = useAuth();
  const { lang } = useLanguage();
  const navigate = useNavigate();

  const t = (en: string, mm: string) => (lang === "en" ? en : mm);

  const [metrics, setMetrics] = useState<MetricState>({
    personnel: null,
    riders: null,
    securityEvents: null,
    rotationRequired: null,
    portalsAccessible: null,
    portalsTotal: null,
    health: "UNKNOWN",
  });

  const [audit, setAudit] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);

  const portals = useMemo(() => portalsForRole(role), [role]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);

      const riderRoles = ["RDR", "RIDER", "RIDER_USER", "DELIVERY_RIDER", "DRIVER", "HELPER"];

      const [personnel, riders, securityEvents, rotationRequired, feed] = await Promise.all([
        countProfilesTotal(),
        countProfilesByRoleFields(riderRoles),
        countAuditEvents(),
        countRotationRequired(),
        loadAuditFeed(15),
      ]);

      const anyOk =
        personnel !== null ||
        riders !== null ||
        securityEvents !== null ||
        rotationRequired !== null ||
        (feed?.length ?? 0) > 0;

      if (cancelled) return;

      setMetrics({
        personnel,
        riders,
        securityEvents,
        rotationRequired,
        portalsAccessible: portalCountForRole(role),
        portalsTotal: portalCountAll(),
        health: anyOk ? "NOMINAL" : "DEGRADED",
      });

      setAudit(feed);
      setLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [role]);

  const stats = useMemo(
    () => [
      { title: t("TOTAL PERSONNEL", "ဝန်ထမ်းစုစုပေါင်း"), value: fmt(metrics.personnel), icon: Users, border: "border-sky-500/20" },
      { title: t("ACTIVE RIDERS", "တာဝန်ထမ်းဆောင်နေသော Rider များ"), value: fmt(metrics.riders), icon: Activity, border: "border-emerald-500/20" },
      { title: t("SECURITY EVENTS", "လုံခြုံရေးဖြစ်ရပ်များ"), value: fmt(metrics.securityEvents), icon: ShieldCheck, border: "border-amber-500/20" },
      { title: t("ROTATION REQUIRED", "စကားဝှက်ပြောင်းရန်လိုအပ်သူများ"), value: fmt(metrics.rotationRequired), icon: KeyRound, border: "border-purple-500/20" },
      { title: t("PORTALS ACCESS", "Portal ဝင်နိုင်မှု"), value: `${fmt(metrics.portalsAccessible)} / ${fmt(metrics.portalsTotal)}`, icon: ClipboardList, border: "border-white/10" },
    ],
    [metrics, lang]
  );

  return (
    <PortalShell title={t("Super Admin Portal", "Super Admin Portal")}>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/5 pb-6">
          <div>
            <div className="text-[10px] font-mono text-slate-500 tracking-[0.25em] uppercase">
              {t("SESSION ACTIVE", "စနစ်ဝင်ရောက်ထားပါသည်")}
            </div>
            <h1 className="text-3xl font-black text-white tracking-widest uppercase mt-2">
              {t("Command Center", "စီမံခန့်ခွဲမှုစင်တာ")}
            </h1>
            <p className="text-sm text-slate-400 mt-1 font-mono">{(user as any)?.email ?? "—"}</p>
          </div>

          <div className="text-right">
            <p className="text-[10px] font-mono text-slate-500 tracking-widest uppercase">
              {t("SYSTEM STATUS", "စနစ်အခြေအနေ")}
            </p>
            <div className="flex items-center gap-2 mt-2 justify-end">
              <div className={`w-2 h-2 rounded-full ${metrics.health === "NOMINAL" ? "bg-emerald-500" : "bg-amber-500"} animate-pulse`} />
              <span className={`text-xs font-mono tracking-widest uppercase ${metrics.health === "NOMINAL" ? "text-emerald-300" : "text-amber-300"}`}>
                {metrics.health === "NOMINAL" ? t("ALL SYSTEMS NOMINAL", "စနစ်အခြေအနေကောင်းမွန်") : t("SYSTEM DEGRADED", "စနစ်အချို့ချို့ယွင်း")}
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className={`p-6 rounded-2xl bg-[#0B101B] border ${s.border} relative overflow-hidden`}>
                <div className="absolute -right-6 -top-6 opacity-5">
                  <Icon size={96} />
                </div>
                <div className="p-3 rounded-xl bg-white/5 w-fit">
                  <Icon size={18} className="text-slate-200" />
                </div>
                <div className="mt-4">
                  <div className="text-3xl font-black text-white">{s.value}</div>
                  <div className="text-[10px] font-mono text-slate-400 tracking-widest uppercase mt-2">{s.title}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate("/portal/admin/accounts")}
            className="p-6 rounded-2xl bg-[#111622] border border-white/5 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all text-left"
          >
            <UserCheck className="text-emerald-300 mb-3" size={22} />
            <div className="text-lg font-black text-white uppercase tracking-widest">{t("Account Control", "အကောင့်စီမံခန့်ခွဲမှု")}</div>
            <div className="text-xs text-slate-500 font-mono mt-2">
              {t("Create/approve users + manage authorities.", "User ဖန်တီး/အတည်ပြု + authority စီမံရန်")}
            </div>
            <div className="mt-4 text-[10px] font-mono tracking-widest uppercase text-emerald-300 flex items-center gap-2">
              {t("Open", "ဝင်ရောက်မည်")} <ArrowRight size={12} />
            </div>
          </button>

          <button
            onClick={() => navigate("/portal/admin/executive")}
            className="p-6 rounded-2xl bg-[#111622] border border-white/5 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all text-left"
          >
            <ShieldAlert className="text-amber-300 mb-3" size={22} />
            <div className="text-lg font-black text-white uppercase tracking-widest">{t("Executive Command", "Executive Command")}</div>
            <div className="text-xs text-slate-500 font-mono mt-2">
              {t("High-privilege monitoring and controls.", "အမြင့်ဆုံးအာဏာ စောင့်ကြည့်/ထိန်းချုပ်မှု")}
            </div>
            <div className="mt-4 text-[10px] font-mono tracking-widest uppercase text-amber-300 flex items-center gap-2">
              {t("Open", "ဝင်ရောက်မည်")} <ArrowRight size={12} />
            </div>
          </button>

          <button
            onClick={() => navigate("/portal/admin/audit")}
            className="p-6 rounded-2xl bg-[#111622] border border-white/5 hover:border-sky-500/30 hover:bg-sky-500/5 transition-all text-left"
          >
            <ShieldCheck className="text-sky-300 mb-3" size={22} />
            <div className="text-lg font-black text-white uppercase tracking-widest">{t("Audit Logs", "Audit Logs")}</div>
            <div className="text-xs text-slate-500 font-mono mt-2">
              {t("Track system events and access activity.", "စနစ်ဖြစ်ရပ်များနှင့် ဝင်ရောက်မှု စစ်ဆေးရန်")}
            </div>
            <div className="mt-4 text-[10px] font-mono tracking-widest uppercase text-sky-300 flex items-center gap-2">
              {t("Open", "ဝင်ရောက်မည်")} <ArrowRight size={12} />
            </div>
          </button>
        </div>

        {/* Portals Directory */}
        <div className="space-y-3">
          <div className="text-sm font-black text-white tracking-widest uppercase">
            {t("Portals Directory", "Portal Directory")}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {portals.map((p) => {
              const Icon = p.icon;
              return (
                <button
                  key={p.id}
                  onClick={() => navigate(p.path)}
                  className="p-6 rounded-2xl bg-[#111622] border border-white/5 hover:border-white/20 hover:bg-white/5 transition-all text-left"
                >
                  <Icon className="text-slate-200 mb-3" size={22} />
                  <div className="text-lg font-black text-white uppercase tracking-widest">
                    {lang === "en" ? p.label_en : p.label_mm}
                  </div>
                  <div className="mt-4 text-[10px] font-mono tracking-widest uppercase text-slate-300 flex items-center gap-2">
                    {t("Open", "ဝင်ရောက်မည်")} <ArrowRight size={12} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Audit Feed */}
        <div className="space-y-3">
          <div className="text-sm font-black text-white tracking-widest uppercase flex items-center gap-2">
            <ShieldAlert size={16} className="text-amber-300" />
            {t("Live Audit Feed", "လုံခြုံရေးမှတ်တမ်းများ")}
          </div>

          <div className="bg-[#0B101B] border border-white/5 rounded-2xl p-4 space-y-4 h-[320px] overflow-y-auto">
            {loading ? (
              <div className="text-xs font-mono text-slate-500">{t("Loading audit feed…", "မှတ်တမ်းများ ရယူနေပါသည်…")}</div>
            ) : audit.length === 0 ? (
              <div className="text-xs font-mono text-slate-500">{t("No audit events found.", "လုံခြုံရေးမှတ်တမ်း မတွေ့ရှိပါ။")}</div>
            ) : (
              audit.map((row) => {
                const b = eventBadge(row.event_type);
                const Icon = b.icon;
                return (
                  <div key={String(row.id)} className="flex gap-3 items-start border-b border-white/5 pb-3">
                    <div className={`p-1.5 rounded-md ${b.bg} ${b.fg} mt-0.5`}>
                      <Icon size={12} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-slate-200 font-mono truncate">{row.event_type}</p>
                      <p className="text-[10px] text-slate-500 font-mono mt-1 truncate">
                        {row.user_id ? `user_id: ${String(row.user_id).slice(0, 8)}...` : "user_id: —"}
                      </p>
                      <p className={`text-[9px] font-mono mt-1 uppercase tracking-wider ${b.fg}/70`}>
                        {relativeTime(row.created_at, lang)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </PortalShell>
  );
}

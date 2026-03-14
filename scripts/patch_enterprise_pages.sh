#!/usr/bin/env bash
set -euo pipefail

echo "🚀 Patching enterprise pages + services (EN/MM)..."
echo "🚀 Enterprise စာမျက်နှာများ + services များကို patch လုပ်နေပါသည် (EN/MM)..."

mkdir -p src/lib src/services src/components/common src/pages/portals/{finance,hr,warehouse,branch,supervisor,operations,execution,admin}

# -----------------------------------------------------------------------------
# 0) Common utilities (EN/MM)
# -----------------------------------------------------------------------------

cat > src/lib/ui.ts <<'EOF'
// @ts-nocheck
/**
 * UI Helpers (EN/MM)
 * EN: cn() helper similar to shadcn.
 * MY: shadcn လို className တွေကို စုပေါင်းဖို့ cn() helper.
 */
export function cn(...args: any[]) {
  return args
    .flat()
    .filter(Boolean)
    .join(" ")
    .trim();
}
EOF

cat > src/components/common/LoadingScreen.tsx <<'EOF'
// @ts-nocheck
import React from "react";

export default function LoadingScreen({ label }: { label?: string }) {
  return (
    <div className="min-h-[40vh] bg-[#05080F] flex items-center justify-center text-slate-300">
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 border-2 border-emerald-500 border-t-transparent animate-spin rounded-full" />
        <div className="text-xs font-mono uppercase tracking-widest">{label ?? "Loading..."}</div>
      </div>
    </div>
  );
}
EOF

cat > src/components/common/EmptyState.tsx <<'EOF'
// @ts-nocheck
import React from "react";

export default function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="min-h-[30vh] flex flex-col items-center justify-center text-center p-8 border border-white/10 rounded-3xl bg-[#0B101B]">
      <div className="text-lg font-black tracking-widest uppercase text-white">{title}</div>
      {hint ? <div className="text-xs text-slate-400 font-mono mt-2 max-w-xl">{hint}</div> : null}
    </div>
  );
}
EOF

# -----------------------------------------------------------------------------
# 1) Fix RecentNav export mismatches (pushRecent alias etc.)
# -----------------------------------------------------------------------------
cat > src/lib/recentNav.ts <<'EOF'
// @ts-nocheck
/**
 * Recent Navigation (EN/MM)
 * EN: Stores recent navigation paths in localStorage.
 * MY: localStorage ထဲမှာ မကြာသေးမီက ဝင်သွားတဲ့ path တွေကို သိမ်းမယ်။
 */
export const RECENT_NAV_KEY = "be_recent_nav";

export type RecentNavItem = {
  path: string;
  label_en: string;
  label_mm: string;
  timestamp: number;
};

export function getRecentNav(): RecentNavItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENT_NAV_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addRecentNav(item: Omit<RecentNavItem, "timestamp">) {
  if (typeof window === "undefined") return;
  const current = getRecentNav();
  const filtered = current.filter((x) => x.path !== item.path);
  filtered.unshift({ ...item, timestamp: Date.now() });
  window.localStorage.setItem(RECENT_NAV_KEY, JSON.stringify(filtered.slice(0, 8)));
}

export function clearRecentNav() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(RECENT_NAV_KEY);
}

/**
 * EN: Back-compat alias used by older PortalSidebar.
 * MY: PortalSidebar အဟောင်းတွေက သုံးတဲ့ alias.
 */
export const pushRecent = addRecentNav;
EOF

# -----------------------------------------------------------------------------
# 2) Baseline helper files used by services (build-safe)
# -----------------------------------------------------------------------------
cat > src/services/supabaseHelpers.ts <<'EOF'
// @ts-nocheck
export function assertOk(res: any, msg?: string) {
  if (!res) return res;
  if (res.error) {
    throw new Error(msg || res.error.message || "Supabase error");
  }
  return res;
}

export async function safeSelect(promise: Promise<any>) {
  try {
    const res = await promise;
    if (res?.error) return { ok: false, error: res.error, data: [] as any[] };
    return { ok: true, data: res?.data ?? [], count: res?.count ?? null };
  } catch (e: any) {
    return { ok: false, error: e, data: [] as any[] };
  }
}
EOF

cat > src/lib/appIdentity.ts <<'EOF'
// @ts-nocheck
export function getCurrentIdentity() {
  return { user_id: null, email: null, role: "GUEST" };
}
EOF

# -----------------------------------------------------------------------------
# 3) Enterprise services (safe stubs + safe Supabase reads)
# -----------------------------------------------------------------------------

cat > src/services/admin.ts <<'EOF'
// @ts-nocheck
import { supabase } from "@/lib/supabase";
import { safeSelect } from "@/services/supabaseHelpers";

/**
 * Admin Service (EN/MM)
 * EN: Safe functions for Admin pages. Won't crash if tables missing.
 * MY: Admin စာမျက်နှာတွေမှာ သုံးဖို့ safe functions. table မရှိရင်လည်း မပျက်။
 */

export async function countProfiles() {
  const res = await safeSelect(supabase.from("profiles").select("id", { count: "exact", head: true }));
  return res.count ?? 0;
}

export async function listProfiles(limit = 50) {
  const res = await safeSelect(
    supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(limit)
  );
  return res.data ?? [];
}

export async function listAuditLogs(limit = 50) {
  const res = await safeSelect(
    supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(limit)
  );
  return res.data ?? [];
}
EOF

cat > src/services/approvals.ts <<'EOF'
// @ts-nocheck
import { supabase } from "@/lib/supabase";
import { safeSelect } from "@/services/supabaseHelpers";
import { addTrackingNote } from "@/services/shipments";
import { getCurrentIdentity } from "@/lib/appIdentity";

/**
 * Approvals Service (EN/MM)
 * EN: Supervisor approvals + tracking note integration.
 * MY: Supervisor အတည်ပြုချက်များ + tracking note ချိတ်ဆက်မှု။
 */

export async function listPendingApprovals(limit = 50) {
  // EN: Try common table/fields; if missing return []
  // MY: မတူညီတဲ့ schema ရှိနိုင်လို့ safe select
  const res = await safeSelect(
    supabase.from("shipments").select("*").eq("status", "PENDING").order("created_at", { ascending: false }).limit(limit)
  );
  return res.data ?? [];
}

export async function approveShipment(wayId: string, note?: string) {
  const id = getCurrentIdentity();
  try {
    await supabase.from("shipments").update({ status: "APPROVED" }).eq("way_id", wayId);
  } catch {}
  if (note) {
    await addTrackingNote(wayId, `APPROVED: ${note}`, { actor: id });
  } else {
    await addTrackingNote(wayId, "APPROVED", { actor: id });
  }
  return { success: true };
}

export async function rejectShipment(wayId: string, reason?: string) {
  const id = getCurrentIdentity();
  try {
    await supabase.from("shipments").update({ status: "REJECTED" }).eq("way_id", wayId);
  } catch {}
  await addTrackingNote(wayId, `REJECTED: ${reason ?? "N/A"}`, { actor: id });
  return { success: true };
}
EOF

cat > src/services/tracking.ts <<'EOF'
// @ts-nocheck
import { supabase } from "@/lib/supabase";
import { safeSelect } from "@/services/supabaseHelpers";

/**
 * Tracking Service (EN/MM)
 * EN: Live tracking reads (courier_locations).
 * MY: courier_locations မှ live tracking ဖတ်ရန်။
 */
export async function listCourierLocations(limit = 200) {
  const res = await safeSelect(
    supabase.from("courier_locations").select("*").order("updated_at", { ascending: false }).limit(limit)
  );
  return res.data ?? [];
}
EOF

cat > src/services/warehouse.ts <<'EOF'
// @ts-nocheck
import { recordSupplyEvent } from "@/services/supplyChain";

/**
 * Warehouse Service (EN/MM)
 * EN: Wraps supply chain recording.
 * MY: supply chain event များကို wrapper လုပ်ထားသည်။
 */
export async function receiveWayId(wayId: string) {
  return recordSupplyEvent("WH_RECEIVED", { way_id: wayId });
}

export async function dispatchWayId(wayId: string) {
  return recordSupplyEvent("WH_DISPATCHED", { way_id: wayId });
}
EOF

cat > src/services/branch.ts <<'EOF'
// @ts-nocheck
import { recordSupplyEvent } from "@/services/supplyChain";

export async function inboundWayId(wayId: string) {
  return recordSupplyEvent("BR_INBOUND", { way_id: wayId });
}

export async function outboundWayId(wayId: string) {
  return recordSupplyEvent("BR_OUTBOUND", { way_id: wayId });
}
EOF

cat > src/services/support.ts <<'EOF'
// @ts-nocheck
/**
 * Support Service (EN/MM)
 * EN: Local-only ticket store (build-safe). Replace with real DB later.
 * MY: Local-only ticket store. နောက်မှ DB ထည့်။
 */
const KEY = "be_support_tickets";

export type Ticket = {
  id: string;
  at: string;
  email?: string;
  subject: string;
  body: string;
  status: "OPEN" | "CLOSED";
};

function uid() {
  const c: any = globalThis.crypto;
  return c?.randomUUID ? c.randomUUID() : `t_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

export function listTickets(): Ticket[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function createTicket(email: string, subject: string, body: string): Ticket {
  const t: Ticket = { id: uid(), at: new Date().toISOString(), email, subject, body, status: "OPEN" };
  const all = [t, ...listTickets()].slice(0, 200);
  if (typeof window !== "undefined") window.localStorage.setItem(KEY, JSON.stringify(all));
  return t;
}

export function closeTicket(id: string) {
  const all = listTickets().map((x) => (x.id === id ? { ...x, status: "CLOSED" } : x));
  if (typeof window !== "undefined") window.localStorage.setItem(KEY, JSON.stringify(all));
}
EOF

# -----------------------------------------------------------------------------
# 4) Pages rewrites (functional integration, EN/MM)
# -----------------------------------------------------------------------------

# Helper snippet for LanguageContext compatibility
LANG_HELPER=$'const langCtx:any = useLanguage() as any;\n  const lang = langCtx?.lang ?? "en";\n  const t = langCtx?.t ?? ((en:string, mm:string)=> (lang==="my"||lang==="mm")?mm:en);'

# -------------------- AdminDashboard --------------------
cat > src/pages/AdminDashboard.tsx <<'EOF'
// @ts-nocheck
import React from "react";
import { PortalShell } from "@/components/layout/PortalShell";
import { useLanguage } from "@/contexts/LanguageContext";
import LoadingScreen from "@/components/common/LoadingScreen";
import EmptyState from "@/components/common/EmptyState";
import { countProfiles } from "@/services/admin";

export default function AdminDashboard() {
  const langCtx:any = useLanguage() as any;
  const lang = langCtx?.lang ?? "en";
  const t = langCtx?.t ?? ((en:string, mm:string)=> (lang==="my"||lang==="mm")?mm:en);

  const [loading, setLoading] = React.useState(true);
  const [profiles, setProfiles] = React.useState<number>(0);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const n = await countProfiles();
      if (alive) setProfiles(Number(n||0));
      if (alive) setLoading(false);
    })();
    return () => { alive = false; };
  }, []);

  return (
    <PortalShell title={t("Admin Dashboard","Admin Dashboard (စီမံခန့်ခွဲမှု)")}>
      {loading ? <LoadingScreen label={t("Loading KPIs...","KPI များရယူနေသည်...")} /> : (
        <div className="space-y-6">
          <div className="rounded-3xl bg-[#0B101B] border border-white/10 p-6">
            <div className="text-xs font-mono tracking-widest uppercase text-slate-500">{t("Enterprise KPIs","လုပ်ငန်း KPI များ")}</div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                <div className="text-[10px] font-mono text-slate-400 tracking-widest uppercase">{t("Total Personnel","ဝန်ထမ်းစုစုပေါင်း")}</div>
                <div className="text-3xl font-black text-white mt-2">{profiles}</div>
              </div>
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                <div className="text-[10px] font-mono text-slate-400 tracking-widest uppercase">{t("Security","လုံခြုံရေး")}</div>
                <div className="text-sm text-slate-300 mt-2">{t("Audit feed is available in Audit Logs.","Audit Logs မှာ စစ်ဆေးနိုင်သည်။")}</div>
              </div>
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                <div className="text-[10px] font-mono text-slate-400 tracking-widest uppercase">{t("Operations","Operations")}</div>
                <div className="text-sm text-slate-300 mt-2">{t("Use Operations portal to process shipments.","Operations portal မှ shipments ဆောင်ရွက်ပါ။")}</div>
              </div>
            </div>
          </div>

          <EmptyState
            title={t("Next: Connect real metrics","နောက်တစ်ဆင့်: KPI အစစ်ချိတ်ဆက်ရန်")}
            hint={t("This page is enterprise-safe and ready for real DB/RPC integration.","ဒီစာမျက်နှာက enterprise-ready ဖြစ်ပြီး DB/RPC ချိတ်ဆက်နိုင်ပါသည်။")}
          />
        </div>
      )}
    </PortalShell>
  );
}
EOF

# -------------------- AuditLogs --------------------
cat > src/pages/AuditLogs.tsx <<'EOF'
// @ts-nocheck
import React from "react";
import { PortalShell } from "@/components/layout/PortalShell";
import { useLanguage } from "@/contexts/LanguageContext";
import LoadingScreen from "@/components/common/LoadingScreen";
import EmptyState from "@/components/common/EmptyState";
import { listAuditLogs } from "@/services/admin";

export default function AuditLogs() {
  const langCtx:any = useLanguage() as any;
  const lang = langCtx?.lang ?? "en";
  const t = langCtx?.t ?? ((en:string, mm:string)=> (lang==="my"||lang==="mm")?mm:en);

  const [loading, setLoading] = React.useState(true);
  const [rows, setRows] = React.useState<any[]>([]);
  const [q, setQ] = React.useState("");

  async function refresh() {
    setLoading(true);
    const d = await listAuditLogs(80);
    setRows(Array.isArray(d) ? d : []);
    setLoading(false);
  }

  React.useEffect(() => { void refresh(); }, []);

  const filtered = React.useMemo(() => {
    if (!q) return rows;
    const s = q.toLowerCase();
    return rows.filter(r =>
      String(r.event_type||"").toLowerCase().includes(s) ||
      String(r.user_id||"").toLowerCase().includes(s)
    );
  }, [rows, q]);

  return (
    <PortalShell title={t("Audit Logs","Audit Logs (မှတ်တမ်း)")}>
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder={t("Search...","ရှာဖွေရန်...")}
            className="w-full md:w-72 bg-black/40 border border-white/10 rounded-xl h-10 px-3 text-xs text-slate-200"/>
          <button onClick={refresh} className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-widest">
            {t("Refresh","ပြန်ရယူ")}
          </button>
        </div>

        {loading ? <LoadingScreen label={t("Loading audit feed...","audit feed ရယူနေသည်...")} /> : (
          filtered.length === 0 ? (
            <EmptyState title={t("No audit events","Audit မတွေ့ပါ")} hint={t("If audit_logs table is not configured, this will be empty.","audit_logs table မရှိသေးပါက empty ဖြစ်နိုင်သည်။")} />
          ) : (
            <div className="rounded-3xl border border-white/10 bg-[#0B101B] overflow-hidden">
              <div className="p-4 text-[10px] font-mono text-slate-500 tracking-widest uppercase">
                {t("Latest events","နောက်ဆုံးဖြစ်ရပ်များ")} • {filtered.length}
              </div>
              <div className="divide-y divide-white/5">
                {filtered.map((r, idx) => (
                  <div key={idx} className="p-4 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-xs font-mono text-white truncate">{r.event_type ?? "EVENT"}</div>
                      <div className="text-[10px] font-mono text-slate-500 mt-1 truncate">
                        user_id: {r.user_id ? String(r.user_id) : "—"}
                      </div>
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 whitespace-nowrap">
                      {r.created_at ? String(r.created_at).replace("T"," ").slice(0,19) : "—"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        )}
      </div>
    </PortalShell>
  );
}
EOF

# -------------------- AdminUsers --------------------
cat > src/pages/AdminUsers.tsx <<'EOF'
// @ts-nocheck
import React from "react";
import { PortalShell } from "@/components/layout/PortalShell";
import { useLanguage } from "@/contexts/LanguageContext";
import LoadingScreen from "@/components/common/LoadingScreen";
import EmptyState from "@/components/common/EmptyState";
import { listProfiles } from "@/services/admin";

export default function AdminUsers() {
  const langCtx:any = useLanguage() as any;
  const lang = langCtx?.lang ?? "en";
  const t = langCtx?.t ?? ((en:string, mm:string)=> (lang==="my"||lang==="mm")?mm:en);

  const [loading, setLoading] = React.useState(true);
  const [rows, setRows] = React.useState<any[]>([]);
  const [q, setQ] = React.useState("");

  async function refresh() {
    setLoading(true);
    const d = await listProfiles(100);
    setRows(Array.isArray(d) ? d : []);
    setLoading(false);
  }

  React.useEffect(() => { void refresh(); }, []);

  const filtered = React.useMemo(() => {
    if (!q) return rows;
    const s = q.toLowerCase();
    return rows.filter(r =>
      String(r.email||"").toLowerCase().includes(s) ||
      String(r.role||r.role_code||"").toLowerCase().includes(s)
    );
  }, [rows, q]);

  return (
    <PortalShell title={t("Admin Users","Admin Users (အသုံးပြုသူများ)")}>
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder={t("Search email/role...","email/role ရှာရန်...")}
            className="w-full md:w-72 bg-black/40 border border-white/10 rounded-xl h-10 px-3 text-xs text-slate-200"/>
          <button onClick={refresh} className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-widest">
            {t("Refresh","ပြန်ရယူ")}
          </button>
        </div>

        {loading ? <LoadingScreen label={t("Loading users...","users ရယူနေသည်...")} /> : (
          filtered.length === 0 ? (
            <EmptyState title={t("No profiles found","profile မတွေ့ပါ")} hint={t("If RLS blocks access, use service role via admin backend.","RLS ကပိတ်ထားနိုင်လို့ backend admin service role သုံးပါ။")} />
          ) : (
            <div className="rounded-3xl border border-white/10 bg-[#0B101B] overflow-hidden">
              <div className="p-4 text-[10px] font-mono text-slate-500 tracking-widest uppercase">
                {t("Profiles","Profiles")} • {filtered.length}
              </div>
              <div className="divide-y divide-white/5">
                {filtered.map((r, idx) => (
                  <div key={idx} className="p-4 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-xs font-mono text-white truncate">{r.email ?? r.id ?? "—"}</div>
                      <div className="text-[10px] font-mono text-slate-500 mt-1 truncate">
                        role: {r.role ?? r.role_code ?? "—"}
                      </div>
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 whitespace-nowrap">
                      {r.created_at ? String(r.created_at).replace("T"," ").slice(0,19) : "—"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        )}
      </div>
    </PortalShell>
  );
}
EOF

# -------------------- PermissionAssignment --------------------
cat > src/pages/PermissionAssignment.tsx <<'EOF'
// @ts-nocheck
import React from "react";
import { PortalShell } from "@/components/layout/PortalShell";
import { useLanguage } from "@/contexts/LanguageContext";
import { loadStore, saveStore, PERMISSIONS, getAccountByEmail, canGrantPermission, uuid, nowIso } from "@/lib/accountControlStore";
import EmptyState from "@/components/common/EmptyState";

export default function PermissionAssignment() {
  const langCtx:any = useLanguage() as any;
  const lang = langCtx?.lang ?? "en";
  const t = langCtx?.t ?? ((en:string, mm:string)=> (lang==="my"||lang==="mm")?mm:en);

  const [email, setEmail] = React.useState("");
  const [perm, setPerm] = React.useState(PERMISSIONS[0]?.code ?? "AUDIT_READ");
  const [msg, setMsg] = React.useState("");

  const store = React.useMemo(() => (typeof window !== "undefined" ? loadStore() : null), []);
  const actorEmail = ""; // EN: real actor permissions should come from AuthContext; safe placeholder
  const actor = store ? getAccountByEmail(store.accounts, actorEmail) : undefined;

  const grant = () => {
    if (!store) return;
    const target = getAccountByEmail(store.accounts, email);
    if (!target) { setMsg(t("User not found in registry.","Registry ထဲမှာ user မတွေ့ပါ။")); return; }
    if (actor && !canGrantPermission(store, actor, perm)) { setMsg(t("Not allowed to grant this permission.","ဒီ permission ကို grant လုပ်ခွင့်မရှိပါ။")); return; }

    const next = {
      ...store,
      grants: [
        { id: uuid(), subjectEmail: target.email, permission: perm, grantedAt: nowIso(), grantedBy: actorEmail || "SYSTEM" },
        ...store.grants,
      ].slice(0, 500),
    };
    saveStore(next);
    setMsg(t("Granted successfully.","Grant အောင်မြင်ပါပြီ။"));
  };

  return (
    <PortalShell title={t("Permission Assignment","Permission Assignment (ခွင့်ပြုချက်)")}>
      <div className="space-y-4">
        <div className="rounded-3xl bg-[#0B101B] border border-white/10 p-6 space-y-4">
          <div className="text-xs font-mono text-slate-500 tracking-widest uppercase">
            {t("Assign authority grants (local registry)","Authority grants ချမှတ်ခြင်း (local registry)")}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input value={email} onChange={e=>setEmail(e.target.value)} placeholder={t("Target email","Target email")}
              className="bg-black/40 border border-white/10 rounded-xl h-10 px-3 text-xs text-slate-200"/>
            <select value={perm} onChange={e=>setPerm(e.target.value)}
              className="bg-black/40 border border-white/10 rounded-xl h-10 px-3 text-xs text-slate-200">
              {PERMISSIONS.map(p => (
                <option key={p.code} value={p.code}>{lang==="en" ? p.en : p.mm}</option>
              ))}
            </select>
            <button onClick={grant} className="h-10 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-widest">
              {t("Grant","Grant")}
            </button>
          </div>

          {msg ? <div className="text-xs font-mono text-emerald-300">{msg}</div> : null}
        </div>

        <EmptyState
          title={t("Enterprise-ready design","Enterprise-ready design")}
          hint={t("This uses a local authority registry for now. Replace with Supabase tables + RLS for production governance.",
                  "ယခုအချိန်မှာ local registry သုံးထားသည်။ Production မှာ Supabase table + RLS ဖြင့် အစားထိုးပါ။")}
        />
      </div>
    </PortalShell>
  );
}
EOF

# -----------------------------------------------------------------------------
# Portals: Operations / Finance / HR / Support / Execution / Warehouse / Branch /
# Supervisor / Merchant / Customer
# -----------------------------------------------------------------------------

cat > src/pages/portals/OperationsPortal.tsx <<'EOF'
// @ts-nocheck
import React from "react";
import { PortalShell } from "@/components/layout/PortalShell";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";

export default function OperationsPortal() {
  const nav = useNavigate();
  const langCtx:any = useLanguage() as any;
  const lang = langCtx?.lang ?? "en";
  const t = langCtx?.t ?? ((en:string, mm:string)=> (lang==="my"||lang==="mm")?mm:en);

  const tiles = [
    { to: "/portal/operations/manual", en: "Manual / Data Entry", mm: "Manual / Data Entry" },
    { to: "/portal/operations/qr-scan", en: "QR Scan Ops", mm: "QR စကန်" },
    { to: "/portal/operations/tracking", en: "Tracking", mm: "Tracking" },
    { to: "/portal/operations/waybill", en: "Waybill Center", mm: "Waybill Center" },
  ];

  return (
    <PortalShell title={t("Operations Portal","Operations Portal (လုပ်ငန်း)")}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tiles.map((x) => (
          <button key={x.to} onClick={() => nav(x.to)}
            className="p-6 rounded-3xl bg-[#0B101B] border border-white/10 hover:border-emerald-500/30 hover:bg-emerald-500/5 text-left transition">
            <div className="text-lg font-black tracking-widest uppercase text-white">{t(x.en,x.mm)}</div>
            <div className="text-xs font-mono text-slate-500 mt-2">{x.to}</div>
          </button>
        ))}
      </div>
    </PortalShell>
  );
}
EOF

cat > src/pages/portals/OperationsTrackingPage.tsx <<'EOF'
// @ts-nocheck
import React from "react";
import { PortalShell } from "@/components/layout/PortalShell";
import { useLanguage } from "@/contexts/LanguageContext";
import LoadingScreen from "@/components/common/LoadingScreen";
import EmptyState from "@/components/common/EmptyState";
import { listCourierLocations } from "@/services/tracking";

export default function OperationsTrackingPage() {
  const langCtx:any = useLanguage() as any;
  const lang = langCtx?.lang ?? "en";
  const t = langCtx?.t ?? ((en:string, mm:string)=> (lang==="my"||lang==="mm")?mm:en);

  const [loading, setLoading] = React.useState(true);
  const [rows, setRows] = React.useState<any[]>([]);

  async function refresh() {
    setLoading(true);
    const d = await listCourierLocations(200);
    setRows(Array.isArray(d) ? d : []);
    setLoading(false);
  }

  React.useEffect(() => { void refresh(); }, []);

  return (
    <PortalShell title={t("Operations Tracking","Operations Tracking (Tracking)")}>
      <div className="space-y-4">
        <button onClick={refresh} className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-widest">
          {t("Refresh","ပြန်ရယူ")}
        </button>

        {loading ? <LoadingScreen label={t("Loading locations...","Location များရယူနေသည်...")} /> : (
          rows.length === 0 ? (
            <EmptyState title={t("No courier locations","Courier location မတွေ့ပါ")}
              hint={t("If courier_locations table/realtime isn't configured yet, create it and enable realtime.","courier_locations table/realtime မရှိသေးပါက ဖန်တီးပြီး realtime ဖွင့်ပါ။")} />
          ) : (
            <div className="rounded-3xl border border-white/10 bg-[#0B101B] overflow-hidden">
              <div className="p-4 text-[10px] font-mono text-slate-500 tracking-widest uppercase">
                {t("Latest locations","နောက်ဆုံး location များ")} • {rows.length}
              </div>
              <div className="divide-y divide-white/5">
                {rows.slice(0,120).map((r, idx) => (
                  <div key={idx} className="p-4 flex items-center justify-between gap-3">
                    <div className="text-xs font-mono text-white truncate">{r.user_id ?? "—"}</div>
                    <div className="text-[10px] font-mono text-slate-400">
                      lat: {r.lat ?? "—"} • lng: {r.lng ?? "—"} • {r.updated_at ? String(r.updated_at).slice(0,19) : "—"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        )}
      </div>
    </PortalShell>
  );
}
EOF

cat > src/pages/portals/FinancePortal.tsx <<'EOF'
// @ts-nocheck
import React from "react";
import { PortalShell } from "@/components/layout/PortalShell";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";

export default function FinancePortal() {
  const nav = useNavigate();
  const langCtx:any = useLanguage() as any;
  const lang = langCtx?.lang ?? "en";
  const t = langCtx?.t ?? ((en:string, mm:string)=> (lang==="my"||lang==="mm")?mm:en);

  return (
    <PortalShell title={t("Finance Portal","Finance Portal (ငွေစာရင်း)")}>
      <button onClick={() => nav("/portal/finance/recon")}
        className="p-6 rounded-3xl bg-[#0B101B] border border-white/10 hover:border-emerald-500/30 hover:bg-emerald-500/5 text-left transition w-full">
        <div className="text-lg font-black tracking-widest uppercase text-white">{t("Reconciliation","Reconciliation (တိုက်ဆိုင်စစ်)")}</div>
        <div className="text-xs font-mono text-slate-500 mt-2">/portal/finance/recon</div>
      </button>
    </PortalShell>
  );
}
EOF

cat > src/pages/portals/finance/FinanceReconPage.tsx <<'EOF'
// @ts-nocheck
import React from "react";
import { PortalShell } from "@/components/layout/PortalShell";
import { useLanguage } from "@/contexts/LanguageContext";
import LoadingScreen from "@/components/common/LoadingScreen";
import EmptyState from "@/components/common/EmptyState";
import { listPendingCod, createDeposit, createCodCollection, recordSupplyEvent } from "@/services/supplyChain";

export default function FinanceReconPage() {
  const langCtx:any = useLanguage() as any;
  const lang = langCtx?.lang ?? "en";
  const t = langCtx?.t ?? ((en:string, mm:string)=> (lang==="my"||lang==="mm")?mm:en);

  const [loading, setLoading] = React.useState(true);
  const [rows, setRows] = React.useState<any[]>([]);
  const [depositRef, setDepositRef] = React.useState("");

  async function refresh() {
    setLoading(true);
    const d = await listPendingCod();
    setRows(Array.isArray(d) ? d : []);
    setLoading(false);
  }

  React.useEffect(() => { void refresh(); }, []);

  async function doDeposit() {
    if (!depositRef.trim()) return alert(t("Enter deposit reference.","Deposit reference ထည့်ပါ။"));
    await createDeposit({ ref: depositRef.trim(), items: rows });
    await recordSupplyEvent("FIN_DEPOSITED", { ref: depositRef.trim(), count: rows.length });
    alert(t("Deposit recorded (stub).","Deposit မှတ်တမ်းတင်ပြီးပါပြီ (stub)."));
    setDepositRef("");
  }

  return (
    <PortalShell title={t("Finance Reconciliation","Finance Reconciliation (တိုက်ဆိုင်စစ်)")}>
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">
          <button onClick={refresh} className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-widest">
            {t("Refresh","ပြန်ရယူ")}
          </button>

          <div className="flex gap-2 w-full md:w-auto">
            <input value={depositRef} onChange={e=>setDepositRef(e.target.value)} placeholder={t("Deposit ref","Deposit ref")}
              className="flex-1 bg-black/40 border border-white/10 rounded-xl h-10 px-3 text-xs text-slate-200"/>
            <button onClick={doDeposit} className="h-10 px-4 rounded-xl bg-[#D4AF37] hover:bg-[#b5952f] text-black text-xs font-black uppercase tracking-widest">
              {t("Create Deposit","Deposit ဖန်တီး")}
            </button>
          </div>
        </div>

        {loading ? <LoadingScreen label={t("Loading pending COD...","Pending COD ရယူနေသည်...")} /> : (
          rows.length === 0 ? (
            <EmptyState title={t("No pending COD items","Pending COD မရှိပါ")} hint={t("supplyChain stubs return empty by default. Connect to DB later.","supplyChain stub ဖြစ်လို့ empty ဖြစ်နိုင်သည်။ နောက်မှ DB ချိတ်ပါ။")} />
          ) : (
            <div className="rounded-3xl border border-white/10 bg-[#0B101B] overflow-hidden">
              <div className="p-4 text-[10px] font-mono text-slate-500 tracking-widest uppercase">
                {t("Pending COD","Pending COD")} • {rows.length}
              </div>
              <div className="divide-y divide-white/5">
                {rows.map((r, idx) => (
                  <div key={idx} className="p-4 flex items-center justify-between">
                    <div className="text-xs font-mono text-white">{r.way_id ?? r.id ?? "—"}</div>
                    <div className="text-[10px] font-mono text-slate-400">amount: {r.amount ?? r.cod_amount ?? "—"}</div>
                  </div>
                ))}
              </div>
            </div>
          )
        )}
      </div>
    </PortalShell>
  );
}
EOF

cat > src/pages/portals/HrPortal.tsx <<'EOF'
// @ts-nocheck
import React from "react";
import { PortalShell } from "@/components/layout/PortalShell";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";

export default function HrPortal() {
  const nav = useNavigate();
  const langCtx:any = useLanguage() as any;
  const lang = langCtx?.lang ?? "en";
  const t = langCtx?.t ?? ((en:string, mm:string)=> (lang==="my"||lang==="mm")?mm:en);

  return (
    <PortalShell title={t("HR Portal","HR Portal (HR)")}>
      <button onClick={() => nav("/portal/hr/admin")}
        className="p-6 rounded-3xl bg-[#0B101B] border border-white/10 hover:border-emerald-500/30 hover:bg-emerald-500/5 text-left transition w-full">
        <div className="text-lg font-black tracking-widest uppercase text-white">{t("HR Admin Ops","HR Admin Ops")}</div>
        <div className="text-xs font-mono text-slate-500 mt-2">/portal/hr/admin</div>
      </button>
    </PortalShell>
  );
}
EOF

cat > src/pages/portals/hr/HrAdminOpsPage.tsx <<'EOF'
// @ts-nocheck
import React from "react";
import { PortalShell } from "@/components/layout/PortalShell";
import { useLanguage } from "@/contexts/LanguageContext";
import { loadStore, saveStore, getAccountByEmail, uuid, nowIso } from "@/lib/accountControlStore";
import EmptyState from "@/components/common/EmptyState";

export default function HrAdminOpsPage() {
  const langCtx:any = useLanguage() as any;
  const lang = langCtx?.lang ?? "en";
  const t = langCtx?.t ?? ((en:string, mm:string)=> (lang==="my"||lang==="mm")?mm:en);

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [msg, setMsg] = React.useState("");

  const store = React.useMemo(() => (typeof window !== "undefined" ? loadStore() : null), []);

  const create = () => {
    if (!store) return;
    if (!email.trim()) return setMsg(t("Email required.","Email လိုအပ်သည်။"));
    if (getAccountByEmail(store.accounts, email)) return setMsg(t("Account already exists.","အကောင့်ရှိပြီးသား။"));

    const next = {
      ...store,
      accounts: [
        { id: uuid(), name: name || email, email, role: "STAFF", status: "PENDING", createdAt: nowIso(), createdBy: "HR" },
        ...store.accounts,
      ],
    };
    saveStore(next);
    setMsg(t("Account request created (local registry).","Account request ဖန်တီးပြီးပါပြီ (local registry)."));
    setName(""); setEmail("");
  };

  return (
    <PortalShell title={t("HR Admin Ops","HR Admin Ops")}>
      <div className="space-y-4">
        <div className="rounded-3xl bg-[#0B101B] border border-white/10 p-6 space-y-4">
          <div className="text-xs font-mono text-slate-500 tracking-widest uppercase">
            {t("Create staff onboarding request","ဝန်ထမ်း onboarding request ဖန်တီးရန်")}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input value={name} onChange={e=>setName(e.target.value)} placeholder={t("Name","အမည်")}
              className="bg-black/40 border border-white/10 rounded-xl h-10 px-3 text-xs text-slate-200"/>
            <input value={email} onChange={e=>setEmail(e.target.value)} placeholder={t("Email","Email")}
              className="bg-black/40 border border-white/10 rounded-xl h-10 px-3 text-xs text-slate-200"/>
            <button onClick={create} className="h-10 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-widest">
              {t("Create","ဖန်တီး")}
            </button>
          </div>
          {msg ? <div className="text-xs font-mono text-emerald-300">{msg}</div> : null}
        </div>

        <EmptyState
          title={t("Enterprise note","Enterprise မှတ်ချက်")}
          hint={t("Replace local registry with Supabase HR tables + RLS + audit logs.","local registry ကို Supabase HR tables + RLS + audit logs နဲ့ အစားထိုးပါ။")}
        />
      </div>
    </PortalShell>
  );
}
EOF

cat > src/pages/portals/SupportPortal.tsx <<'EOF'
// @ts-nocheck
import React from "react";
import { PortalShell } from "@/components/layout/PortalShell";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { createTicket, listTickets, closeTicket } from "@/services/support";

export default function SupportPortal() {
  const auth:any = useAuth() as any;
  const langCtx:any = useLanguage() as any;
  const lang = langCtx?.lang ?? "en";
  const t = langCtx?.t ?? ((en:string, mm:string)=> (lang==="my"||lang==="mm")?mm:en);

  const [subject, setSubject] = React.useState("");
  const [body, setBody] = React.useState("");
  const [tickets, setTickets] = React.useState<any[]>([]);

  React.useEffect(() => { setTickets(listTickets()); }, []);

  const submit = () => {
    if (!subject.trim()) return alert(t("Subject required.","Subject လိုအပ်သည်။"));
    createTicket(auth?.user?.email ?? "", subject.trim(), body.trim());
    setTickets(listTickets());
    setSubject(""); setBody("");
  };

  const close = (id: string) => {
    closeTicket(id);
    setTickets(listTickets());
  };

  return (
    <PortalShell title={t("Support Portal","Support Portal (အကူအညီ)")}>
      <div className="space-y-4">
        <div className="rounded-3xl bg-[#0B101B] border border-white/10 p-6 space-y-3">
          <div className="text-xs font-mono text-slate-500 tracking-widest uppercase">{t("Create ticket","Ticket ဖန်တီး")}</div>
          <input value={subject} onChange={e=>setSubject(e.target.value)} placeholder={t("Subject","အကြောင်းအရာ")}
            className="w-full bg-black/40 border border-white/10 rounded-xl h-10 px-3 text-xs text-slate-200"/>
          <textarea value={body} onChange={e=>setBody(e.target.value)} placeholder={t("Describe issue...","ပြဿနာအသေးစိတ်...")}
            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-slate-200 min-h-[110px]"/>
          <button onClick={submit} className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-widest">
            {t("Submit","တင်မည်")}
          </button>
        </div>

        <div className="rounded-3xl bg-[#0B101B] border border-white/10 overflow-hidden">
          <div className="p-4 text-[10px] font-mono text-slate-500 tracking-widest uppercase">{t("Tickets","Tickets")} • {tickets.length}</div>
          <div className="divide-y divide-white/5">
            {tickets.map((x:any) => (
              <div key={x.id} className="p-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs font-mono text-white truncate">{x.subject}</div>
                  <div className="text-[10px] font-mono text-slate-500 mt-1">{x.status} • {String(x.at).slice(0,19)}</div>
                </div>
                {x.status === "OPEN" ? (
                  <button onClick={() => close(x.id)} className="h-8 px-3 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-500/30 text-xs font-black uppercase tracking-widest">
                    {t("Close","ပိတ်")}
                  </button>
                ) : null}
              </div>
            ))}
            {tickets.length === 0 ? <div className="p-6 text-xs text-slate-500 font-mono">{t("No tickets yet.","Ticket မရှိသေးပါ။")}</div> : null}
          </div>
        </div>
      </div>
    </PortalShell>
  );
}
EOF

cat > src/pages/portals/ExecutionPortal.tsx <<'EOF'
// @ts-nocheck
import React from "react";
import { PortalShell } from "@/components/layout/PortalShell";
import { useLanguage } from "@/contexts/LanguageContext";
import { listAssignedShipments, markPickedUp, markOutForDelivery, markDelivered } from "@/services/shipments";
import LoadingScreen from "@/components/common/LoadingScreen";
import EmptyState from "@/components/common/EmptyState";

export default function ExecutionPortal() {
  const langCtx:any = useLanguage() as any;
  const lang = langCtx?.lang ?? "en";
  const t = langCtx?.t ?? ((en:string, mm:string)=> (lang==="my"||lang==="mm")?mm:en);

  const [loading, setLoading] = React.useState(true);
  const [rows, setRows] = React.useState<any[]>([]);

  async function refresh() {
    setLoading(true);
    const d = await listAssignedShipments();
    setRows(Array.isArray(d) ? d : []);
    setLoading(false);
  }

  React.useEffect(() => { void refresh(); }, []);

  return (
    <PortalShell title={t("Execution Portal","Execution Portal (ပို့ဆောင်ရေး)")}>
      <div className="space-y-4">
        <button onClick={refresh} className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-widest">
          {t("Refresh","ပြန်ရယူ")}
        </button>

        {loading ? <LoadingScreen label={t("Loading assignments...","Assignments ရယူနေသည်...")} /> : (
          rows.length === 0 ? (
            <EmptyState title={t("No assigned shipments","Assign မရှိပါ")} hint={t("shipments service stub returns empty unless connected to DB.","shipments stub ဖြစ်လို့ empty ဖြစ်နိုင်သည်။ နောက်မှ DB ချိတ်ပါ။")} />
          ) : (
            <div className="rounded-3xl border border-white/10 bg-[#0B101B] overflow-hidden">
              <div className="p-4 text-[10px] font-mono text-slate-500 tracking-widest uppercase">{t("Assigned shipments","Assigned shipments")} • {rows.length}</div>
              <div className="divide-y divide-white/5">
                {rows.map((r:any, idx) => (
                  <div key={idx} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-xs font-mono text-white truncate">{r.way_id ?? r.id ?? "—"}</div>
                      <div className="text-[10px] font-mono text-slate-500 mt-1 truncate">{r.receiver_name ?? "—"} • {r.receiver_phone ?? "—"}</div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <button onClick={() => markPickedUp(r.way_id)} className="h-9 px-3 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-500/30 text-xs font-black uppercase tracking-widest">
                        {t("Picked","ယူပြီး")}
                      </button>
                      <button onClick={() => markOutForDelivery(r.way_id)} className="h-9 px-3 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-500/30 text-xs font-black uppercase tracking-widest">
                        {t("OFD","ပို့မည်")}
                      </button>
                      <button onClick={() => markDelivered(r.way_id)} className="h-9 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-widest">
                        {t("Delivered","ပို့ပြီး")}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        )}
      </div>
    </PortalShell>
  );
}
EOF

cat > src/pages/portals/ExecutionNavigationPage.tsx <<'EOF'
// @ts-nocheck
import React from "react";
import { PortalShell } from "@/components/layout/PortalShell";
import { useLanguage } from "@/contexts/LanguageContext";
import EmptyState from "@/components/common/EmptyState";

export default function ExecutionNavigationPage() {
  const langCtx:any = useLanguage() as any;
  const lang = langCtx?.lang ?? "en";
  const t = langCtx?.t ?? ((en:string, mm:string)=> (lang==="my"||lang==="mm")?mm:en);

  const hasMapbox = Boolean(import.meta.env.VITE_MAPBOX_TOKEN);

  return (
    <PortalShell title={t("Execution Navigation","Execution Navigation (လမ်းကြောင်း)")}>
      {hasMapbox ? (
        <EmptyState
          title={t("Map integration ready","Map integration ready")}
          hint={t("Mapbox token detected. Integrate navigation/route UI next.","Mapbox token တွေ့ပါပြီ။ နောက်တစ်ဆင့် navigation/route UI ထည့်ပါ။")}
        />
      ) : (
        <EmptyState
          title={t("Mapbox token missing","Mapbox token မရှိပါ")}
          hint={t("Set VITE_MAPBOX_TOKEN in environment for navigation maps.","Environment မှာ VITE_MAPBOX_TOKEN ထည့်ပါ။")}
        />
      )}
    </PortalShell>
  );
}
EOF

cat > src/pages/portals/WarehousePortal.tsx <<'EOF'
// @ts-nocheck
import React from "react";
import { PortalShell } from "@/components/layout/PortalShell";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";

export default function WarehousePortal() {
  const nav = useNavigate();
  const langCtx:any = useLanguage() as any;
  const lang = langCtx?.lang ?? "en";
  const t = langCtx?.t ?? ((en:string, mm:string)=> (lang==="my"||lang==="mm")?mm:en);

  const tiles = [
    { to: "/portal/warehouse/receiving", en: "Receiving", mm: "Receiving (လက်ခံ)" },
    { to: "/portal/warehouse/dispatch", en: "Dispatch", mm: "Dispatch (ထုတ်ပေး)" },
  ];

  return (
    <PortalShell title={t("Warehouse Portal","Warehouse Portal (ဂိုဒေါင်)")}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tiles.map((x) => (
          <button key={x.to} onClick={() => nav(x.to)}
            className="p-6 rounded-3xl bg-[#0B101B] border border-white/10 hover:border-emerald-500/30 hover:bg-emerald-500/5 text-left transition">
            <div className="text-lg font-black tracking-widest uppercase text-white">{t(x.en,x.mm)}</div>
            <div className="text-xs font-mono text-slate-500 mt-2">{x.to}</div>
          </button>
        ))}
      </div>
    </PortalShell>
  );
}
EOF

cat > src/pages/portals/warehouse/WarehouseReceivingPage.tsx <<'EOF'
// @ts-nocheck
import React from "react";
import { PortalShell } from "@/components/layout/PortalShell";
import { useLanguage } from "@/contexts/LanguageContext";
import { receiveWayId } from "@/services/warehouse";

export default function WarehouseReceivingPage() {
  const langCtx:any = useLanguage() as any;
  const lang = langCtx?.lang ?? "en";
  const t = langCtx?.t ?? ((en:string, mm:string)=> (lang==="my"||lang==="mm")?mm:en);

  const [wayId, setWayId] = React.useState("");
  const [msg, setMsg] = React.useState("");

  const submit = async () => {
    if (!wayId.trim()) return setMsg(t("Enter Waybill ID.","Waybill ID ထည့်ပါ။"));
    await receiveWayId(wayId.trim());
    setMsg(t("Recorded WH_RECEIVED (stub).","WH_RECEIVED မှတ်တမ်းတင်ပြီးပါပြီ (stub)."));
    setWayId("");
  };

  return (
    <PortalShell title={t("Warehouse Receiving","Warehouse Receiving (လက်ခံ)")}>
      <div className="rounded-3xl bg-[#0B101B] border border-white/10 p-6 space-y-3">
        <div className="text-xs font-mono text-slate-500 tracking-widest uppercase">{t("Scan/Enter Waybill","Waybill စကန်/ထည့်")}</div>
        <input value={wayId} onChange={e=>setWayId(e.target.value)} placeholder="BR-2026-xx-xxxx"
          className="w-full bg-black/40 border border-white/10 rounded-xl h-10 px-3 text-xs text-slate-200"/>
        <button onClick={submit} className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-widest">
          {t("Confirm Receive","လက်ခံအတည်ပြု")}
        </button>
        {msg ? <div className="text-xs font-mono text-emerald-300">{msg}</div> : null}
      </div>
    </PortalShell>
  );
}
EOF

cat > src/pages/portals/warehouse/WarehouseDispatchPage.tsx <<'EOF'
// @ts-nocheck
import React from "react";
import { PortalShell } from "@/components/layout/PortalShell";
import { useLanguage } from "@/contexts/LanguageContext";
import { dispatchWayId } from "@/services/warehouse";

export default function WarehouseDispatchPage() {
  const langCtx:any = useLanguage() as any;
  const lang = langCtx?.lang ?? "en";
  const t = langCtx?.t ?? ((en:string, mm:string)=> (lang==="my"||lang==="mm")?mm:en);

  const [wayId, setWayId] = React.useState("");
  const [msg, setMsg] = React.useState("");

  const submit = async () => {
    if (!wayId.trim()) return setMsg(t("Enter Waybill ID.","Waybill ID ထည့်ပါ။"));
    await dispatchWayId(wayId.trim());
    setMsg(t("Recorded WH_DISPATCHED (stub).","WH_DISPATCHED မှတ်တမ်းတင်ပြီးပါပြီ (stub)."));
    setWayId("");
  };

  return (
    <PortalShell title={t("Warehouse Dispatch","Warehouse Dispatch (ထုတ်ပေး)")}>
      <div className="rounded-3xl bg-[#0B101B] border border-white/10 p-6 space-y-3">
        <div className="text-xs font-mono text-slate-500 tracking-widest uppercase">{t("Scan/Enter Waybill","Waybill စကန်/ထည့်")}</div>
        <input value={wayId} onChange={e=>setWayId(e.target.value)} placeholder="BR-2026-xx-xxxx"
          className="w-full bg-black/40 border border-white/10 rounded-xl h-10 px-3 text-xs text-slate-200"/>
        <button onClick={submit} className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-widest">
          {t("Confirm Dispatch","ထုတ်ပေးအတည်ပြု")}
        </button>
        {msg ? <div className="text-xs font-mono text-emerald-300">{msg}</div> : null}
      </div>
    </PortalShell>
  );
}
EOF

cat > src/pages/portals/BranchPortal.tsx <<'EOF'
// @ts-nocheck
import React from "react";
import { PortalShell } from "@/components/layout/PortalShell";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";

export default function BranchPortal() {
  const nav = useNavigate();
  const langCtx:any = useLanguage() as any;
  const lang = langCtx?.lang ?? "en";
  const t = langCtx?.t ?? ((en:string, mm:string)=> (lang==="my"||lang==="mm")?mm:en);

  const tiles = [
    { to: "/portal/branch/inbound", en: "Inbound", mm: "Inbound (အဝင်)" },
    { to: "/portal/branch/outbound", en: "Outbound", mm: "Outbound (အထွက်)" },
  ];

  return (
    <PortalShell title={t("Branch Portal","Branch Portal (ဌာနခွဲ)")}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tiles.map((x) => (
          <button key={x.to} onClick={() => nav(x.to)}
            className="p-6 rounded-3xl bg-[#0B101B] border border-white/10 hover:border-emerald-500/30 hover:bg-emerald-500/5 text-left transition">
            <div className="text-lg font-black tracking-widest uppercase text-white">{t(x.en,x.mm)}</div>
            <div className="text-xs font-mono text-slate-500 mt-2">{x.to}</div>
          </button>
        ))}
      </div>
    </PortalShell>
  );
}
EOF

cat > src/pages/portals/branch/BranchInboundPage.tsx <<'EOF'
// @ts-nocheck
import React from "react";
import { PortalShell } from "@/components/layout/PortalShell";
import { useLanguage } from "@/contexts/LanguageContext";
import { inboundWayId } from "@/services/branch";

export default function BranchInboundPage() {
  const langCtx:any = useLanguage() as any;
  const lang = langCtx?.lang ?? "en";
  const t = langCtx?.t ?? ((en:string, mm:string)=> (lang==="my"||lang==="mm")?mm:en);

  const [wayId, setWayId] = React.useState("");
  const [msg, setMsg] = React.useState("");

  const submit = async () => {
    if (!wayId.trim()) return setMsg(t("Enter Waybill ID.","Waybill ID ထည့်ပါ။"));
    await inboundWayId(wayId.trim());
    setMsg(t("Recorded BR_INBOUND (stub).","BR_INBOUND မှတ်တမ်းတင်ပြီးပါပြီ (stub)."));
    setWayId("");
  };

  return (
    <PortalShell title={t("Branch Inbound","Branch Inbound (အဝင်)")}>
      <div className="rounded-3xl bg-[#0B101B] border border-white/10 p-6 space-y-3">
        <input value={wayId} onChange={e=>setWayId(e.target.value)} placeholder="BR-2026-xx-xxxx"
          className="w-full bg-black/40 border border-white/10 rounded-xl h-10 px-3 text-xs text-slate-200"/>
        <button onClick={submit} className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-widest">
          {t("Confirm Inbound","Inbound အတည်ပြု")}
        </button>
        {msg ? <div className="text-xs font-mono text-emerald-300">{msg}</div> : null}
      </div>
    </PortalShell>
  );
}
EOF

cat > src/pages/portals/branch/BranchOutboundPage.tsx <<'EOF'
// @ts-nocheck
import React from "react";
import { PortalShell } from "@/components/layout/PortalShell";
import { useLanguage } from "@/contexts/LanguageContext";
import { outboundWayId } from "@/services/branch";

export default function BranchOutboundPage() {
  const langCtx:any = useLanguage() as any;
  const lang = langCtx?.lang ?? "en";
  const t = langCtx?.t ?? ((en:string, mm:string)=> (lang==="my"||lang==="mm")?mm:en);

  const [wayId, setWayId] = React.useState("");
  const [msg, setMsg] = React.useState("");

  const submit = async () => {
    if (!wayId.trim()) return setMsg(t("Enter Waybill ID.","Waybill ID ထည့်ပါ။"));
    await outboundWayId(wayId.trim());
    setMsg(t("Recorded BR_OUTBOUND (stub).","BR_OUTBOUND မှတ်တမ်းတင်ပြီးပါပြီ (stub)."));
    setWayId("");
  };

  return (
    <PortalShell title={t("Branch Outbound","Branch Outbound (အထွက်)")}>
      <div className="rounded-3xl bg-[#0B101B] border border-white/10 p-6 space-y-3">
        <input value={wayId} onChange={e=>setWayId(e.target.value)} placeholder="BR-2026-xx-xxxx"
          className="w-full bg-black/40 border border-white/10 rounded-xl h-10 px-3 text-xs text-slate-200"/>
        <button onClick={submit} className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-widest">
          {t("Confirm Outbound","Outbound အတည်ပြု")}
        </button>
        {msg ? <div className="text-xs font-mono text-emerald-300">{msg}</div> : null}
      </div>
    </PortalShell>
  );
}
EOF

cat > src/pages/portals/SupervisorPortal.tsx <<'EOF'
// @ts-nocheck
import React from "react";
import { PortalShell } from "@/components/layout/PortalShell";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";

export default function SupervisorPortal() {
  const nav = useNavigate();
  const langCtx:any = useLanguage() as any;
  const lang = langCtx?.lang ?? "en";
  const t = langCtx?.t ?? ((en:string, mm:string)=> (lang==="my"||lang==="mm")?mm:en);

  const tiles = [
    { to: "/portal/supervisor/approval", en: "Approval Gateway", mm: "Approval Gateway (အတည်ပြု)" },
    { to: "/portal/supervisor/fraud", en: "Fraud Signals", mm: "Fraud Signals (လိမ်လည်မှု)" },
  ];

  return (
    <PortalShell title={t("Supervisor Portal","Supervisor Portal (ကြီးကြပ်)")}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tiles.map((x) => (
          <button key={x.to} onClick={() => nav(x.to)}
            className="p-6 rounded-3xl bg-[#0B101B] border border-white/10 hover:border-emerald-500/30 hover:bg-emerald-500/5 text-left transition">
            <div className="text-lg font-black tracking-widest uppercase text-white">{t(x.en,x.mm)}</div>
            <div className="text-xs font-mono text-slate-500 mt-2">{x.to}</div>
          </button>
        ))}
      </div>
    </PortalShell>
  );
}
EOF

cat > src/pages/portals/supervisor/SupervisorApprovalPage.tsx <<'EOF'
// @ts-nocheck
import React from "react";
import { PortalShell } from "@/components/layout/PortalShell";
import { useLanguage } from "@/contexts/LanguageContext";
import LoadingScreen from "@/components/common/LoadingScreen";
import EmptyState from "@/components/common/EmptyState";
import { listPendingApprovals, approveShipment, rejectShipment } from "@/services/approvals";

export default function SupervisorApprovalPage() {
  const langCtx:any = useLanguage() as any;
  const lang = langCtx?.lang ?? "en";
  const t = langCtx?.t ?? ((en:string, mm:string)=> (lang==="my"||lang==="mm")?mm:en);

  const [loading, setLoading] = React.useState(true);
  const [rows, setRows] = React.useState<any[]>([]);
  const [note, setNote] = React.useState("");

  async function refresh() {
    setLoading(true);
    const d = await listPendingApprovals(80);
    setRows(Array.isArray(d) ? d : []);
    setLoading(false);
  }
  React.useEffect(() => { void refresh(); }, []);

  const doApprove = async (wayId: string) => {
    await approveShipment(wayId, note.trim());
    alert(t("Approved (stub).","Approve လုပ်ပြီးပါပြီ (stub)."));
    setNote("");
    await refresh();
  };

  const doReject = async (wayId: string) => {
    const reason = prompt(t("Enter reject reason","Reject reason ထည့်ပါ")) || "";
    await rejectShipment(wayId, reason);
    alert(t("Rejected (stub).","Reject လုပ်ပြီးပါပြီ (stub)."));
    await refresh();
  };

  return (
    <PortalShell title={t("Approval Gateway","Approval Gateway (အတည်ပြု)")}>
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">
          <button onClick={refresh} className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-widest">
            {t("Refresh","ပြန်ရယူ")}
          </button>
          <input value={note} onChange={e=>setNote(e.target.value)} placeholder={t("Optional note...","note ထည့်နိုင်သည်...")}
            className="w-full md:w-80 bg-black/40 border border-white/10 rounded-xl h-10 px-3 text-xs text-slate-200"/>
        </div>

        {loading ? <LoadingScreen label={t("Loading pending approvals...","Pending approvals ရယူနေသည်...")} /> : (
          rows.length === 0 ? (
            <EmptyState title={t("No pending shipments","Pending shipments မရှိပါ")} hint={t("This reads shipments where status=PENDING.","shipments table မှ status=PENDING ကိုဖတ်သည်။")} />
          ) : (
            <div className="rounded-3xl border border-white/10 bg-[#0B101B] overflow-hidden">
              <div className="p-4 text-[10px] font-mono text-slate-500 tracking-widest uppercase">{t("Pending approvals","Pending approvals")} • {rows.length}</div>
              <div className="divide-y divide-white/5">
                {rows.map((r:any, idx) => (
                  <div key={idx} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-xs font-mono text-white truncate">{r.way_id ?? r.id ?? "—"}</div>
                      <div className="text-[10px] font-mono text-slate-500 mt-1 truncate">{r.receiver_name ?? "—"} • {r.receiver_phone ?? "—"}</div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <button onClick={() => doReject(r.way_id)} className="h-9 px-3 rounded-xl bg-white/5 border border-white/10 hover:border-rose-500/30 text-xs font-black uppercase tracking-widest">
                        {t("Reject","ငြင်း")}
                      </button>
                      <button onClick={() => doApprove(r.way_id)} className="h-9 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-widest">
                        {t("Approve","အတည်ပြု")}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        )}
      </div>
    </PortalShell>
  );
}
EOF

cat > src/pages/portals/supervisor/SupervisorFraudPage.tsx <<'EOF'
// @ts-nocheck
import React from "react";
import { PortalShell } from "@/components/layout/PortalShell";
import { useLanguage } from "@/contexts/LanguageContext";
import EmptyState from "@/components/common/EmptyState";

export default function SupervisorFraudPage() {
  const langCtx:any = useLanguage() as any;
  const lang = langCtx?.lang ?? "en";
  const t = langCtx?.t ?? ((en:string, mm:string)=> (lang==="my"||lang==="mm")?mm:en);

  return (
    <PortalShell title={t("Fraud Signals","Fraud Signals (လိမ်လည်မှု)")}>
      <EmptyState
        title={t("Fraud engine placeholder","Fraud engine placeholder")}
        hint={t("Integrate fraud_signals view + rules engine later (enterprise).","enterprise အတွက် fraud_signals view + rules engine ကို နောက်မှချိတ်ပါ။")}
      />
    </PortalShell>
  );
}
EOF

cat > src/pages/portals/operations/DataEntryOpsPage.tsx <<'EOF'
// @ts-nocheck
import React from "react";
import { PortalShell } from "@/components/layout/PortalShell";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/lib/supabase";

export default function DataEntryOpsPage() {
  const langCtx:any = useLanguage() as any;
  const lang = langCtx?.lang ?? "en";
  const t = langCtx?.t ?? ((en:string, mm:string)=> (lang==="my"||lang==="mm")?mm:en);

  const [receiver, setReceiver] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [addr, setAddr] = React.useState("");
  const [city, setCity] = React.useState("");
  const [msg, setMsg] = React.useState("");

  const create = async () => {
    setMsg("");
    if (!receiver.trim() || !phone.trim() || !addr.trim() || !city.trim()) {
      setMsg(t("Fill mandatory fields.","မဖြစ်မနေ field များ ဖြည့်ပါ။"));
      return;
    }

    try {
      // EN: attempt insert; if table missing it will error but UI remains stable
      // MY: table မရှိလည်း UI မပျက်
      const payload = { receiver_name: receiver, receiver_phone: phone, receiver_address: addr, receiver_city: city, status: "PENDING" };
      const res = await supabase.from("shipments").insert(payload).select("*").maybeSingle();
      if (res?.error) {
        setMsg(t("Insert failed (check table/RLS).","Insert မရပါ (table/RLS စစ်ပါ)."));
      } else {
        setMsg(t("Shipment created (PENDING).","Shipment ဖန်တီးပြီးပါပြီ (PENDING)."));
        setReceiver(""); setPhone(""); setAddr(""); setCity("");
      }
    } catch {
      setMsg(t("Insert failed (schema missing).","Insert မရပါ (schema မရှိနိုင်)."));
    }
  };

  return (
    <PortalShell title={t("Manual / Data Entry","Manual / Data Entry")}>
      <div className="rounded-3xl bg-[#0B101B] border border-white/10 p-6 space-y-3">
        <div className="text-xs font-mono text-slate-500 tracking-widest uppercase">{t("Create Shipment","Shipment ဖန်တီး")}</div>
        <input value={receiver} onChange={e=>setReceiver(e.target.value)} placeholder={t("Receiver name*","လက်ခံသူ အမည်*")}
          className="w-full bg-black/40 border border-white/10 rounded-xl h-10 px-3 text-xs text-slate-200"/>
        <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder={t("Receiver phone*","ဖုန်းနံပါတ်*")}
          className="w-full bg-black/40 border border-white/10 rounded-xl h-10 px-3 text-xs text-slate-200"/>
        <input value={addr} onChange={e=>setAddr(e.target.value)} placeholder={t("Address*","လိပ်စာ*")}
          className="w-full bg-black/40 border border-white/10 rounded-xl h-10 px-3 text-xs text-slate-200"/>
        <input value={city} onChange={e=>setCity(e.target.value)} placeholder={t("City*","မြို့*")}
          className="w-full bg-black/40 border border-white/10 rounded-xl h-10 px-3 text-xs text-slate-200"/>
        <button onClick={create} className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-widest">
          {t("Create","ဖန်တီး")}
        </button>
        {msg ? <div className="text-xs font-mono text-emerald-300">{msg}</div> : null}
      </div>
    </PortalShell>
  );
}
EOF

cat > src/pages/portals/operations/QROpsScanPage.tsx <<'EOF'
// @ts-nocheck
import React from "react";
import { PortalShell } from "@/components/layout/PortalShell";
import { useLanguage } from "@/contexts/LanguageContext";
import { recordSupplyEvent } from "@/services/supplyChain";
import { addTrackingNote } from "@/services/shipments";

export default function QROpsScanPage() {
  const langCtx:any = useLanguage() as any;
  const lang = langCtx?.lang ?? "en";
  const t = langCtx?.t ?? ((en:string, mm:string)=> (lang==="my"||lang==="mm")?mm:en);

  const [wayId, setWayId] = React.useState("");
  const [note, setNote] = React.useState("");
  const [msg, setMsg] = React.useState("");

  const submit = async () => {
    setMsg("");
    if (!wayId.trim()) { setMsg(t("Enter Waybill ID.","Waybill ID ထည့်ပါ။")); return; }
    await recordSupplyEvent("OPS_QR_SCAN", { way_id: wayId.trim() });
    if (note.trim()) await addTrackingNote(wayId.trim(), note.trim(), { source: "QROpsScan" });
    setMsg(t("QR event recorded (stub).","QR event မှတ်တမ်းတင်ပြီးပါပြီ (stub)."));
    setWayId(""); setNote("");
  };

  return (
    <PortalShell title={t("QR Scan Ops","QR Scan Ops (စကန်)")}>
      <div className="rounded-3xl bg-[#0B101B] border border-white/10 p-6 space-y-3">
        <input value={wayId} onChange={e=>setWayId(e.target.value)} placeholder="BR-2026-xx-xxxx"
          className="w-full bg-black/40 border border-white/10 rounded-xl h-10 px-3 text-xs text-slate-200"/>
        <input value={note} onChange={e=>setNote(e.target.value)} placeholder={t("Optional note","Optional note")}
          className="w-full bg-black/40 border border-white/10 rounded-xl h-10 px-3 text-xs text-slate-200"/>
        <button onClick={submit} className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-widest">
          {t("Record Scan","Scan မှတ်တမ်းတင်")}
        </button>
        {msg ? <div className="text-xs font-mono text-emerald-300">{msg}</div> : null}
      </div>
    </PortalShell>
  );
}
EOF

cat > src/pages/portals/operations/WaybillCenterPage.tsx <<'EOF'
// @ts-nocheck
import React from "react";
import { PortalShell } from "@/components/layout/PortalShell";
import { useLanguage } from "@/contexts/LanguageContext";
import EmptyState from "@/components/common/EmptyState";

export default function WaybillCenterPage() {
  const langCtx:any = useLanguage() as any;
  const lang = langCtx?.lang ?? "en";
  const t = langCtx?.t ?? ((en:string, mm:string)=> (lang==="my"||lang==="mm")?mm:en);

  return (
    <PortalShell title={t("Waybill Center","Waybill Center")}>
      <EmptyState
        title={t("Waybill printing pipeline ready","Waybill printing pipeline ready")}
        hint={t("Implement 4x6 HTML template + browser print + audit print jobs next.","4x6 HTML template + browser print + print audit ကို နောက်တစ်ဆင့် ထည့်ပါ။")}
      />
    </PortalShell>
  );
}
EOF

# Minimal portals for Marketing / Merchant / Customer / AdminPortal (legacy)
cat > src/pages/portals/MarketingPortal.tsx <<'EOF'
// @ts-nocheck
import React from "react";
import { PortalShell } from "@/components/layout/PortalShell";
import { useLanguage } from "@/contexts/LanguageContext";
import EmptyState from "@/components/common/EmptyState";

export default function MarketingPortal() {
  const langCtx:any = useLanguage() as any;
  const lang = langCtx?.lang ?? "en";
  const t = langCtx?.t ?? ((en:string, mm:string)=> (lang==="my"||lang==="mm")?mm:en);
  return (
    <PortalShell title={t("Marketing Portal","Marketing Portal")}>
      <EmptyState title={t("Marketing module placeholder","Marketing placeholder")} hint={t("Integrate campaigns + segmentation later.","Campaigns/segmentation ကို နောက်မှချိတ်ပါ။")} />
    </PortalShell>
  );
}
EOF

cat > src/pages/portals/MerchantPortal.tsx <<'EOF'
// @ts-nocheck
import React from "react";
import { PortalShell } from "@/components/layout/PortalShell";
import { useLanguage } from "@/contexts/LanguageContext";
import EmptyState from "@/components/common/EmptyState";

export default function MerchantPortal() {
  const langCtx:any = useLanguage() as any;
  const lang = langCtx?.lang ?? "en";
  const t = langCtx?.t ?? ((en:string, mm:string)=> (lang==="my"||lang==="mm")?mm:en);
  return (
    <PortalShell title={t("Merchant Portal","Merchant Portal (ကုန်သည်)")}>
      <EmptyState title={t("Merchant tools placeholder","Merchant tools placeholder")} hint={t("Add bulk CSV intake + shipment tracking view later.","CSV intake + tracking view ကို နောက်မှထည့်ပါ။")} />
    </PortalShell>
  );
}
EOF

cat > src/pages/portals/CustomerPortal.tsx <<'EOF'
// @ts-nocheck
import React from "react";
import { PortalShell } from "@/components/layout/PortalShell";
import { useLanguage } from "@/contexts/LanguageContext";
import { traceByWayId } from "@/services/supplyChain";

export default function CustomerPortal() {
  const langCtx:any = useLanguage() as any;
  const lang = langCtx?.lang ?? "en";
  const t = langCtx?.t ?? ((en:string, mm:string)=> (lang==="my"||lang==="mm")?mm:en);

  const [wayId, setWayId] = React.useState("");
  const [rows, setRows] = React.useState<any[]>([]);

  const track = async () => {
    const d = await traceByWayId(wayId.trim());
    setRows(Array.isArray(d) ? d : []);
  };

  return (
    <PortalShell title={t("Customer Portal","Customer Portal (Customer)")}>
      <div className="space-y-4">
        <div className="rounded-3xl bg-[#0B101B] border border-white/10 p-6 space-y-3">
          <div className="text-xs font-mono text-slate-500 tracking-widest uppercase">{t("Track shipment","Shipment tracking")}</div>
          <input value={wayId} onChange={e=>setWayId(e.target.value)} placeholder="BR-2026-xx-xxxx"
            className="w-full bg-black/40 border border-white/10 rounded-xl h-10 px-3 text-xs text-slate-200"/>
          <button onClick={track} className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-widest">
            {t("Track","Track")}
          </button>
        </div>

        <div className="rounded-3xl bg-[#0B101B] border border-white/10 overflow-hidden">
          <div className="p-4 text-[10px] font-mono text-slate-500 tracking-widest uppercase">{t("Timeline","Timeline")} • {rows.length}</div>
          <div className="divide-y divide-white/5">
            {rows.map((x:any, idx) => (
              <div key={idx} className="p-4 flex items-center justify-between">
                <div className="text-xs font-mono text-white">{x.status ?? x.event_type ?? "EVENT"}</div>
                <div className="text-[10px] font-mono text-slate-500">{x.at ?? x.created_at ?? "—"}</div>
              </div>
            ))}
            {rows.length === 0 ? <div className="p-6 text-xs text-slate-500 font-mono">{t("No events (stub).","Events မရှိပါ (stub).")}</div> : null}
          </div>
        </div>
      </div>
    </PortalShell>
  );
}
EOF

cat > src/pages/portals/AdminPortal.tsx <<'EOF'
// @ts-nocheck
import React from "react";
import { PortalShell } from "@/components/layout/PortalShell";
import { useLanguage } from "@/contexts/LanguageContext";
import EmptyState from "@/components/common/EmptyState";

export default function AdminPortal() {
  const langCtx:any = useLanguage() as any;
  const lang = langCtx?.lang ?? "en";
  const t = langCtx?.t ?? ((en:string, mm:string)=> (lang==="my"||lang==="mm")?mm:en);
  return (
    <PortalShell title={t("Admin Portal (Legacy)","Admin Portal (Legacy)")}>
      <EmptyState title={t("Legacy Admin portal placeholder","Legacy Admin placeholder")} hint={t("Use /portal/admin for Super Admin.","Super Admin အတွက် /portal/admin ကိုသုံးပါ။")} />
    </PortalShell>
  );
}
EOF

# Keep existing ExecutionManualPage if created by you; we won't overwrite it here.
# But ensure missing "ExecutionManualPage.tsx" exists
if [ ! -f src/pages/portals/execution/ExecutionManualPage.tsx ]; then
cat > src/pages/portals/execution/ExecutionManualPage.tsx <<'EOF'
// @ts-nocheck
import React from "react";
import { PortalShell } from "@/components/layout/PortalShell";
import { useLanguage } from "@/contexts/LanguageContext";
import EmptyState from "@/components/common/EmptyState";

export default function ExecutionManualPage() {
  const langCtx:any = useLanguage() as any;
  const lang = langCtx?.lang ?? "en";
  const t = langCtx?.t ?? ((en:string, mm:string)=> (lang==="my"||lang==="mm")?mm:en);
  return (
    <PortalShell title={t("Execution Manual","Execution Manual (လမ်းညွှန်)")}>
      <EmptyState title={t("Manual module placeholder","Manual placeholder")} hint={t("Add rider checklists + POD capture later.","Rider checklist + POD capture ကို နောက်မှထည့်ပါ။")} />
    </PortalShell>
  );
}
EOF
fi

echo "✅ Enterprise pages/services patched successfully."
echo "✅ Enterprise စာမျက်နှာများ/services များ patch ပြီးပါပြီ။"

echo ""
echo "Next (run one-by-one):"
echo "  npm run build"
echo "  git add src/services src/pages src/lib src/components"
echo "  git commit -m \"feat: enterprise portal integration (EN/MM)\""
echo "  git push origin master"
echo "  npx vercel --prod --force"

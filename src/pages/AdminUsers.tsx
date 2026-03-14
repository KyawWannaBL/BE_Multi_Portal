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

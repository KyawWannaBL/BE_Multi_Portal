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

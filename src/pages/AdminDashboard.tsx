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

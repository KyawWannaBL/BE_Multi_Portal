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

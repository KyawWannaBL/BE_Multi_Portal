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

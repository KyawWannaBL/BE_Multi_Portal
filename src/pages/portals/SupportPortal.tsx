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

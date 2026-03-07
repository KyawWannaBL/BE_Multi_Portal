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

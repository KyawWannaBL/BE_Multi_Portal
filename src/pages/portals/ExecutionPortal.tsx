import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PortalShell } from "@/components/layout/PortalShell";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { listAssignedShipments, markDelivered, markPickedUp, type Shipment } from "@/services/shipments";

const MANUAL = {
  title: { en: "QR Operations Manual", my: "QR လုပ်ငန်းလမ်းညွှန်" },
  subtitle: { en: "Scanning • e-POD • exceptions", my: "စကန် • e-POD • Exception ကိုင်တွယ်" },
  open: { en: "Open", my: "ဖွင့်ရန်" },
} as const;

export default function ExecutionPortal() {
  const { lang } = useLanguage();
  const t = useMemo(() => (lang === "en" ? "en" : "my"), [lang]);

  const { role } = useAuth();
  const normalizedRole = (role ?? "").trim().toUpperCase();
  const showManual = ["RIDER", "DRIVER", "HELPER"].includes(normalizedRole);

  const [rows, setRows] = useState<Shipment[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function refresh() {
    try {
      setErr(null);
      const r = await listAssignedShipments();
      setRows(r);
    } catch (e: any) {
      setErr(e.message || String(e));
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function pickup(id: string) {
    setBusy(id);
    try {
      await markPickedUp(id);
      await refresh();
    } catch (e: any) {
      setErr(e.message || String(e));
    } finally {
      setBusy(null);
    }
  }

  async function deliver(id: string) {
    setBusy(id);
    try {
      await markDelivered(id);
      await refresh();
    } catch (e: any) {
      setErr(e.message || String(e));
    } finally {
      setBusy(null);
    }
  }

  return (
    <PortalShell
      title="Execution Portal"
      links={
        showManual
          ? [
              { to: "/portal/execution/manual", label: t === "en" ? "QR Ops Manual" : "QR လမ်းညွှန်" },
              { to: "/portal/supervisor", label: "Supervisor" },
            ]
          : [{ to: "/portal/supervisor", label: "Supervisor" }]
      }
    >
      <div className="space-y-4">
        {showManual ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold">{MANUAL.title[t]}</div>
            <div className="text-xs opacity-70">{MANUAL.subtitle[t]}</div>
          </div>
          <Link to="/portal/execution/manual">
            <Button size="sm" variant="outline">
              {MANUAL.open[t]}
            </Button>
          </Link>
          </div>
        ) : null}

        {err ? <div className="text-xs text-red-400">Error: {err}</div> : null}

        <div className="grid gap-3">
          {rows.map((s) => (
            <div key={s.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-mono text-xs">{s.way_id}</div>
                <div className="text-[10px] opacity-70">{new Date(s.created_at).toLocaleString()}</div>
              </div>
              <div className="text-sm">{s.receiver_name}</div>
              <div className="text-xs opacity-70">
                {s.receiver_phone} • {s.receiver_address}
              </div>
              <div className="text-xs opacity-70">
                Picked up: {s.actual_pickup_time ? "Yes" : "No"} • Delivered: {s.actual_delivery_time ? "Yes" : "No"}
              </div>

              <div className="flex gap-2 flex-wrap pt-1">
                <button
                  disabled={busy === s.id || Boolean(s.actual_pickup_time)}
                  onClick={() => void pickup(s.id)}
                  className="text-xs px-3 py-2 rounded-xl border border-white/10 hover:border-white/20 hover:bg-white/5 disabled:opacity-50"
                >
                  Mark Picked Up
                </button>
                <button
                  disabled={busy === s.id || !s.actual_pickup_time || Boolean(s.actual_delivery_time)}
                  onClick={() => void deliver(s.id)}
                  className="text-xs px-3 py-2 rounded-xl border border-emerald-500/30 bg-emerald-500/15 hover:bg-emerald-500/20 disabled:opacity-50"
                >
                  Mark Delivered
                </button>
              </div>
            </div>
          ))}
          {!rows.length ? <div className="text-xs opacity-60">No assigned shipments.</div> : null}
        </div>
      </div>
    </PortalShell>
  );
}

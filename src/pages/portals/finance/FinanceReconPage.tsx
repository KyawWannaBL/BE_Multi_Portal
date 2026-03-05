import React, { useEffect, useMemo, useState } from "react";
import { PortalShell } from "@/components/layout/PortalShell";
import { listPendingCod, createDeposit, createCodCollection, recordSupplyEvent } from "@/services/supplyChain";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TraceTimeline } from "@/components/supplychain/TraceTimeline";

export default function FinanceReconPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [depositRef, setDepositRef] = useState("");
  const [depositAmount, setDepositAmount] = useState("0");
  const [depositId, setDepositId] = useState<string | null>(null);

  const totalPending = useMemo(() => rows.reduce((a, r) => a + Number(r.cod_amount || 0), 0), [rows]);

  async function refresh() {
    setErr(null);
    const data = await listPendingCod(200);
    setRows(data);
  }

  useEffect(() => {
    void refresh().catch((e:any)=>setErr(e?.message||String(e)));
  }, []);

  async function createNewDeposit() {
    setBusy(true);
    setErr(null);
    try {
      const id = await createDeposit({ amount: Number(depositAmount || 0), reference: depositRef || null });
      setDepositId(id);
    } catch (e: any) {
      setErr(e?.message || String(e));
    } finally {
      setBusy(false);
    }
  }

  async function attachToDeposit(r: any) {
    if (!depositId) return setErr("EN: Create deposit first. | MY: Deposit ကို အရင်ဖန်တီးပါ။");
    setBusy(true);
    setErr(null);
    try {
      await createCodCollection({ shipment_id: r.shipment_id, way_id: r.way_id, amount: Number(r.cod_amount || 0), deposit_id: depositId });
      // ledger event for finance
      await recordSupplyEvent({
        way_id: r.way_id,
        event_type: "FIN_DEPOSITED",
        segment: "FINANCE",
        note: `COD deposited (deposit_id=${depositId})`,
        meta: { deposit_id: depositId, amount: Number(r.cod_amount || 0) },
      });
      await refresh();
    } catch (e: any) {
      setErr(e?.message || String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <PortalShell
      title="Finance • COD Reconciliation"
      links={[
        { to: "/portal/finance", label: "Finance" },
        { to: "/portal/operations/qr-scan", label: "QR Ops" },
      ]}
    >
      <div className="space-y-6">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-bold">Pending COD / မပြေလည်သေးသော COD</div>
              <div className="text-xs opacity-70">Total pending: {totalPending}</div>
            </div>
            <Button disabled={busy} onClick={() => void refresh()} className="rounded-xl bg-white/10 hover:bg-white/15">
              Refresh
            </Button>
          </div>

          {err ? <div className="mt-3 text-xs text-red-300">Error: {err}</div> : null}

          <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="text-xs font-bold">Create Deposit / Deposit ဖန်တီးခြင်း</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
              <Input className="bg-[#0B0E17] border border-white/10 rounded-xl h-11 text-white" placeholder="Reference" value={depositRef} onChange={(e)=>setDepositRef(e.target.value)} />
              <Input className="bg-[#0B0E17] border border-white/10 rounded-xl h-11 text-white" placeholder="Amount" value={depositAmount} onChange={(e)=>setDepositAmount(e.target.value)} />
              <Button disabled={busy} onClick={() => void createNewDeposit()} className="h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-black">
                {depositId ? `Deposit: ${depositId.slice(0,8)}…` : "Create Deposit"}
              </Button>
            </div>
            <div className="text-[11px] opacity-70 mt-2">
              EN: Attach COD rows to deposit to complete chain. <br/>
              MY: COD အတန်းတွေကို deposit နဲ့ချိတ်ပါ။
            </div>
          </div>

          <div className="mt-4 grid gap-2">
            {rows.map((r:any) => (
              <div key={r.way_id} className="rounded-2xl border border-white/10 bg-black/20 p-3 flex items-center justify-between gap-3">
                <div>
                  <div className="font-mono text-xs">{r.way_id}</div>
                  <div className="text-xs opacity-70">COD: {r.cod_amount} • Delivered: {r.actual_delivery_time ? new Date(r.actual_delivery_time).toLocaleString() : "-"}</div>
                </div>
                <Button disabled={busy} onClick={() => void attachToDeposit(r)} className="rounded-xl bg-[#D4AF37] hover:bg-[#b5952f] text-black font-black">
                  Deposit
                </Button>
              </div>
            ))}
            {!rows.length && !err ? <div className="text-xs opacity-60">No pending COD.</div> : null}
          </div>
        </div>

        <TraceTimeline />
      </div>
    </PortalShell>
  );
}

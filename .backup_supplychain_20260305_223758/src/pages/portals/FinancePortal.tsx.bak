import React, { useEffect, useState } from "react";
import { PortalShell } from "@/components/layout/PortalShell";
import { createFinancialTransaction, listFinancialTransactions, listInvoices, type FinancialTx, type Invoice } from "@/services/finance";

export default function FinancePortal() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [txs, setTxs] = useState<FinancialTx[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function refresh() {
    setErr(null);
    try {
      const [i, t] = await Promise.all([listInvoices(20), listFinancialTransactions(20)]);
      setInvoices(i);
      setTxs(t);
    } catch (e: any) {
      setErr(e.message || String(e));
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function createDemoTx() {
    setBusy(true);
    setErr(null);
    try {
      const ref = invoices[0]?.id || txs[0]?.reference_id;
      if (!ref) throw new Error("No invoice/tx reference available to attach a transaction.");
      await createFinancialTransaction({
        transaction_type: "payment",
        reference_type: "invoice",
        reference_id: ref,
        amount: 1000,
        description: "Demo payment",
      });
      await refresh();
    } catch (e: any) {
      setErr(e.message || String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <PortalShell title="Finance Portal">
      <div className="space-y-5">
        {err ? <div className="text-xs text-red-400">Error: {err}</div> : null}

        <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-bold">Invoices</div>
              <div className="text-xs opacity-70">Table: public.invoices</div>
            </div>
            <button
              disabled={busy}
              onClick={() => void createDemoTx()}
              className="text-xs px-3 py-2 rounded-xl border border-white/10 hover:border-white/20 hover:bg-white/5 disabled:opacity-50"
            >
              Create demo transaction
            </button>
          </div>

          <div className="mt-3 grid gap-2">
            {invoices.map((i) => (
              <div key={i.id} className="rounded-2xl border border-white/10 bg-black/20 p-3">
                <div className="flex items-center justify-between">
                  <div className="font-mono text-xs">{i.invoice_number}</div>
                  <div className="text-[10px] opacity-70">{i.invoice_status}</div>
                </div>
                <div className="text-xs opacity-70">{i.customer_name}</div>
                <div className="text-xs opacity-70">Total: {i.total_amount} • Paid: {i.paid_amount}</div>
              </div>
            ))}
            {!invoices.length ? <div className="text-xs opacity-60">No invoices (or blocked by RLS).</div> : null}
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="text-sm font-bold">Transactions</div>
          <div className="text-xs opacity-70">Table: public.financial_transactions</div>
          <div className="mt-3 grid gap-2">
            {txs.map((t) => (
              <div key={t.id} className="rounded-2xl border border-white/10 bg-black/20 p-3">
                <div className="flex items-center justify-between">
                  <div className="font-mono text-xs">{t.transaction_id}</div>
                  <div className="text-[10px] opacity-70">{t.status}</div>
                </div>
                <div className="text-xs opacity-70">{t.transaction_type} • {t.amount} {t.currency}</div>
                <div className="text-[10px] opacity-60">{new Date(t.created_at).toLocaleString()}</div>
              </div>
            ))}
            {!txs.length ? <div className="text-xs opacity-60">No transactions (or blocked by RLS).</div> : null}
          </div>
        </section>
      </div>
    </PortalShell>
  );
}

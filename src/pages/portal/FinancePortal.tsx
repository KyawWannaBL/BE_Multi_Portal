import React, { useEffect, useState } from "react";
import { listInvoices, listTransactions, createTransaction, type Invoice, type FinancialTransaction } from "@/services/finance";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function FinancePortal() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [txs, setTxs] = useState<FinancialTransaction[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [txId, setTxId] = useState("");
  const [txType, setTxType] = useState("payment");
  const [refType, setRefType] = useState("shipment");
  const [refId, setRefId] = useState("");
  const [amount, setAmount] = useState("");

  const load = async () => {
    setError(null);
    const inv = await listInvoices(30);
    const t = await listTransactions(30);
    if (inv.error) setError(inv.error);
    if (t.error) setError(t.error);
    setInvoices(inv.data ?? []);
    setTxs(t.data ?? []);
  };

  useEffect(() => {
    void load();
  }, []);

  const onCreate = async () => {
    setError(null);
    if (!txId || !refId || !amount) {
      setError("transaction_id, reference_id, amount are required");
      return;
    }
    const res = await createTransaction({
      transaction_id: txId,
      transaction_type: txType,
      reference_type: refType,
      reference_id: refId,
      amount: Number(amount),
      currency: "MMK",
      status: "pending",
    });
    if (res.error) setError(res.error);
    setTxId("");
    setRefId("");
    setAmount("");
    await load();
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="text-2xl font-bold">Finance Portal</div>
        <div className="text-sm text-white/60 mt-1">Invoices & financial transactions</div>
      </div>

      {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</div>}

      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4">
        <div className="font-semibold">Create Transaction</div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Input placeholder="transaction_id" value={txId} onChange={(e) => setTxId(e.target.value)} />
          <Input placeholder="transaction_type (payment/refund...)" value={txType} onChange={(e) => setTxType(e.target.value)} />
          <Input placeholder="reference_type (shipment/invoice...)" value={refType} onChange={(e) => setRefType(e.target.value)} />
          <Input placeholder="reference_id (uuid)" value={refId} onChange={(e) => setRefId(e.target.value)} />
          <Input placeholder="amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <div className="md:col-span-2 xl:col-span-3" />
          <Button onClick={onCreate}>Create</Button>
        </div>
        <div className="text-xs text-white/50">
          Note: RLS must allow INSERT on financial_transactions for your finance roles.
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="font-semibold">Recent Invoices</div>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-white/60">
                <tr>
                  <th className="text-left py-2">Invoice</th>
                  <th className="text-left py-2">Customer</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-right py-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((i) => (
                  <tr key={i.id} className="border-t border-white/10">
                    <td className="py-2">{i.invoice_number}</td>
                    <td className="py-2">{i.customer_name}</td>
                    <td className="py-2">{i.invoice_status}</td>
                    <td className="py-2 text-right">{Number(i.total_amount).toLocaleString()}</td>
                  </tr>
                ))}
                {invoices.length === 0 && (
                  <tr>
                    <td className="py-4 text-white/50" colSpan={4}>
                      No invoices
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="font-semibold">Recent Transactions</div>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-white/60">
                <tr>
                  <th className="text-left py-2">Txn</th>
                  <th className="text-left py-2">Type</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-right py-2">Amount</th>
                </tr>
              </thead>
              <tbody>
                {txs.map((t) => (
                  <tr key={t.id} className="border-t border-white/10">
                    <td className="py-2">{t.transaction_id}</td>
                    <td className="py-2">{t.transaction_type}</td>
                    <td className="py-2">{t.status}</td>
                    <td className="py-2 text-right">{Number(t.amount).toLocaleString()} {t.currency}</td>
                  </tr>
                ))}
                {txs.length === 0 && (
                  <tr>
                    <td className="py-4 text-white/50" colSpan={4}>
                      No transactions
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

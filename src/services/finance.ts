import { supabase } from "@/lib/supabase";
import { assertOk } from "@/services/supabaseHelpers";
import { getCurrentIdentity } from "@/lib/appIdentity";

export type Invoice = {
  id: string;
  invoice_number: string;
  customer_name: string;
  invoice_date: string;
  due_date: string;
  total_amount: number;
  paid_amount: number;
  invoice_status: string;
};

export type FinancialTx = {
  id: string;
  transaction_id: string;
  transaction_type: string;
  reference_type: string;
  reference_id: string;
  merchant_id: string | null;
  user_id: string | null;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
};

export async function listInvoices(limit = 50): Promise<Invoice[]> {
  const res = await supabase
    .from("invoices")
    .select("id, invoice_number, customer_name, invoice_date, due_date, total_amount, paid_amount, invoice_status")
    .order("invoice_date", { ascending: false })
    .limit(limit);
  return assertOk(res as any, "Load invoices failed") as any;
}

export async function listFinancialTransactions(limit = 50): Promise<FinancialTx[]> {
  const res = await supabase
    .from("financial_transactions")
    .select("id, transaction_id, transaction_type, reference_type, reference_id, merchant_id, user_id, amount, currency, status, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  return assertOk(res as any, "Load transactions failed") as any;
}

export async function createFinancialTransaction(input: {
  transaction_type: string;
  reference_type: string;
  reference_id: string;
  amount: number;
  currency?: string;
  merchant_id?: string | null;
  user_id?: string | null;
  description?: string | null;
}) {
  const identity = await getCurrentIdentity();
  const txid = `TX-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

  const res = await supabase.from("financial_transactions").insert({
    transaction_id: txid,
    transaction_type: input.transaction_type,
    reference_type: input.reference_type,
    reference_id: input.reference_id,
    merchant_id: input.merchant_id ?? identity?.merchant_id ?? null,
    user_id: input.user_id ?? identity?.user_id ?? null,
    amount: input.amount,
    currency: input.currency ?? "MMK",
    description: input.description ?? null,
  });

  assertOk(res as any, "Create transaction failed");
  return txid;
}

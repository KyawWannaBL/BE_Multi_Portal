import { supabase } from '@/lib/supabase';

export const financeAPI = {
  // Fetch real-time balances from the Chart of Accounts
  getAccountBalances: async () => {
    const { data, error } = await supabase
      .from('chart_of_accounts')
      .select('*')
      .order('code', { ascending: true });
    if (error) throw error;
    return data;
  },

  // Deep connection for Financial Metrics (Revenue, Expenses, Net Profit)
  getFinancialMetrics: async () => {
    const { data, error } = await supabase
      .rpc('get_current_financial_metrics'); // Use a database function for performance
    if (error) throw error;
    return data;
  },

  // Securely log a new transaction
  logTransaction: async (transactionData: any) => {
    const { data, error } = await supabase
      .from('transactions')
      .insert([transactionData]);
    if (error) throw error;
    return data;
  }
};

import React, { useState } from "react";
import { useLanguageContext } from "@/lib/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, TrendingUp, TrendingDown, DollarSign } from "lucide-react";

export default function AccountBalancePage() {
  const { t } = useLanguageContext();
  const [searchTerm, setSearchTerm] = useState("");

  // Mock account data
  const accounts = [
    { code: '1000', name: 'Cash in Hand', balance: 450000, type: 'Asset' },
    { code: '1001', name: 'Bank - KBZ', balance: 2500000, type: 'Asset' },
    { code: '1002', name: 'Bank - CB', balance: 1800000, type: 'Asset' },
    { code: '1100', name: 'Accounts Receivable', balance: 750000, type: 'Asset' },
    { code: '1200', name: 'Inventory', balance: 320000, type: 'Asset' },
    { code: '2000', name: 'Accounts Payable', balance: -180000, type: 'Liability' },
    { code: '2001', name: 'Accrued Expenses', balance: -95000, type: 'Liability' },
    { code: '3000', name: 'Owner\'s Equity', balance: -3000000, type: 'Equity' },
    { code: '4000', name: 'Delivery Revenue', balance: -2450000, type: 'Revenue' },
    { code: '4001', name: 'COD Commission', balance: -350000, type: 'Revenue' },
    { code: '5000', name: 'Fuel Expense', balance: 280000, type: 'Expense' },
    { code: '5001', name: 'Vehicle Maintenance', balance: 150000, type: 'Expense' },
    { code: '5002', name: 'Staff Salaries', balance: 800000, type: 'Expense' },
    { code: '5003', name: 'Office Rent', balance: 120000, type: 'Expense' },
  ];

  const filteredAccounts = accounts.filter(account => 
    account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.code.includes(searchTerm)
  );

  const totalAssets = accounts.filter(a => a.type === 'Asset').reduce((sum, a) => sum + a.balance, 0);
  const totalLiabilities = Math.abs(accounts.filter(a => a.type === 'Liability').reduce((sum, a) => sum + a.balance, 0));
  const totalEquity = Math.abs(accounts.filter(a => a.type === 'Equity').reduce((sum, a) => sum + a.balance, 0));
  const totalRevenue = Math.abs(accounts.filter(a => a.type === 'Revenue').reduce((sum, a) => sum + a.balance, 0));
  const totalExpenses = accounts.filter(a => a.type === 'Expense').reduce((sum, a) => sum + a.balance, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {t('accounting.accountBalance')} / စာရင်းကိုင်လက်ကျန်
            </h1>
            <p className="text-gold-300">
              Current account balances as of {new Date().toLocaleDateString()}
            </p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gold-400 w-4 h-4" />
            <Input
              placeholder="Search accounts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-navy-800/50 border-gold-400/30 text-white placeholder:text-gold-300/50"
            />
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="lotus-card border-gold-400/20">
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <div className="text-lg font-bold text-white">{totalAssets.toLocaleString()}</div>
              <div className="text-gold-300 text-sm">Total Assets</div>
            </CardContent>
          </Card>
          
          <Card className="lotus-card border-gold-400/20">
            <CardContent className="p-4 text-center">
              <TrendingDown className="w-8 h-8 text-red-400 mx-auto mb-2" />
              <div className="text-lg font-bold text-white">{totalLiabilities.toLocaleString()}</div>
              <div className="text-gold-300 text-sm">Total Liabilities</div>
            </CardContent>
          </Card>
          
          <Card className="lotus-card border-gold-400/20">
            <CardContent className="p-4 text-center">
              <DollarSign className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <div className="text-lg font-bold text-white">{totalEquity.toLocaleString()}</div>
              <div className="text-gold-300 text-sm">Total Equity</div>
            </CardContent>
          </Card>
          
          <Card className="lotus-card border-gold-400/20">
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <div className="text-lg font-bold text-white">{totalRevenue.toLocaleString()}</div>
              <div className="text-gold-300 text-sm">Total Revenue</div>
            </CardContent>
          </Card>
          
          <Card className="lotus-card border-gold-400/20">
            <CardContent className="p-4 text-center">
              <TrendingDown className="w-8 h-8 text-orange-400 mx-auto mb-2" />
              <div className="text-lg font-bold text-white">{totalExpenses.toLocaleString()}</div>
              <div className="text-gold-300 text-sm">Total Expenses</div>
            </CardContent>
          </Card>
        </div>

        {/* Account Balance Table */}
        <Card className="lotus-card border-gold-400/20">
          <CardHeader>
            <CardTitle className="text-white">Account Balances</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gold-400/20">
                    <th className="text-left py-3 px-4 text-gold-300 font-medium">Account Code</th>
                    <th className="text-left py-3 px-4 text-gold-300 font-medium">Account Name</th>
                    <th className="text-left py-3 px-4 text-gold-300 font-medium">Type</th>
                    <th className="text-right py-3 px-4 text-gold-300 font-medium">Balance (MMK)</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAccounts.map((account, index) => (
                    <tr key={index} className="border-b border-navy-800/50 hover:bg-navy-800/20">
                      <td className="py-3 px-4 text-gold-400 font-mono">{account.code}</td>
                      <td className="py-3 px-4 text-white font-medium">{account.name}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          account.type === 'Asset' ? 'bg-green-500/20 text-green-300' :
                          account.type === 'Liability' ? 'bg-red-500/20 text-red-300' :
                          account.type === 'Equity' ? 'bg-blue-500/20 text-blue-300' :
                          account.type === 'Revenue' ? 'bg-purple-500/20 text-purple-300' :
                          'bg-orange-500/20 text-orange-300'
                        }`}>
                          {account.type}
                        </span>
                      </td>
                      <td className={`py-3 px-4 text-right font-bold ${
                        account.balance >= 0 ? 'text-green-300' : 'text-red-300'
                      }`}>
                        {account.balance.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
import React, { useState } from "react";
import { useLanguageContext } from "@/lib/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, Plus, Save } from "lucide-react";

export default function SimpleTransactionPage() {
  const { t } = useLanguageContext();
  const [transaction, setTransaction] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: '',
    type: 'income',
    category: '',
    reference: ''
  });

  const categories = [
    'Delivery Revenue',
    'COD Collection',
    'Fuel Expense',
    'Vehicle Maintenance',
    'Staff Salary',
    'Office Rent',
    'Utilities',
    'Marketing',
    'Other'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle transaction submission
    console.log('Transaction:', transaction);
    // Reset form
    setTransaction({
      date: new Date().toISOString().split('T')[0],
      description: '',
      amount: '',
      type: 'income',
      category: '',
      reference: ''
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">
            Simple Transaction Entry / ရိုးရှင်းသော ငွေစာရင်းထည့်ခြင်း
          </h1>
          <p className="text-gold-300">
            Quick entry for daily transactions
          </p>
        </div>

        {/* Transaction Form */}
        <Card className="lotus-card border-gold-400/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              New Transaction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gold-300 text-sm font-medium mb-2">
                    Date / ရက်စွဲ
                  </label>
                  <Input
                    type="date"
                    value={transaction.date}
                    onChange={(e) => setTransaction({...transaction, date: e.target.value})}
                    className="bg-navy-800/50 border-gold-400/30 text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-gold-300 text-sm font-medium mb-2">
                    Type / အမျိုးအစား
                  </label>
                  <Select 
                    value={transaction.type} 
                    onValueChange={(value) => setTransaction({...transaction, type: value})}
                  >
                    <SelectTrigger className="bg-navy-800/50 border-gold-400/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Income / ဝင်ငွေ</SelectItem>
                      <SelectItem value="expense">Expense / ထွက်ငွေ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-gold-300 text-sm font-medium mb-2">
                  Description / ဖော်ပြချက်
                </label>
                <Input
                  value={transaction.description}
                  onChange={(e) => setTransaction({...transaction, description: e.target.value})}
                  placeholder="Enter transaction description..."
                  className="bg-navy-800/50 border-gold-400/30 text-white placeholder:text-gold-300/50"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gold-300 text-sm font-medium mb-2">
                    Amount (MMK) / ပမာණ
                  </label>
                  <Input
                    type="number"
                    value={transaction.amount}
                    onChange={(e) => setTransaction({...transaction, amount: e.target.value})}
                    placeholder="0"
                    className="bg-navy-800/50 border-gold-400/30 text-white placeholder:text-gold-300/50"
                  />
                </div>
                
                <div>
                  <label className="block text-gold-300 text-sm font-medium mb-2">
                    Category / အမျိုးအစားခွဲ
                  </label>
                  <Select 
                    value={transaction.category} 
                    onValueChange={(value) => setTransaction({...transaction, category: value})}
                  >
                    <SelectTrigger className="bg-navy-800/50 border-gold-400/30 text-white">
                      <SelectValue placeholder="Select category..." />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-gold-300 text-sm font-medium mb-2">
                  Reference / ကိုးကားချက်
                </label>
                <Input
                  value={transaction.reference}
                  onChange={(e) => setTransaction({...transaction, reference: e.target.value})}
                  placeholder="Reference number or note..."
                  className="bg-navy-800/50 border-gold-400/30 text-white placeholder:text-gold-300/50"
                />
              </div>

              <div className="flex space-x-4">
                <Button type="submit" className="luxury-button flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  Save Transaction / သိမ်းရန်
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="border-gold-400/30 text-gold-300"
                  onClick={() => setTransaction({
                    date: new Date().toISOString().split('T')[0],
                    description: '',
                    amount: '',
                    type: 'income',
                    category: '',
                    reference: ''
                  })}
                >
                  Clear / ရှင်းလင်းရန်
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="lotus-card border-gold-400/20">
          <CardHeader>
            <CardTitle className="text-white">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { date: '2026-02-04', desc: 'Delivery Revenue - YGN Route', amount: 45000, type: 'income' },
                { date: '2026-02-04', desc: 'Fuel Expense', amount: -15000, type: 'expense' },
                { date: '2026-02-03', desc: 'COD Collection', amount: 125000, type: 'income' },
                { date: '2026-02-03', desc: 'Vehicle Maintenance', amount: -25000, type: 'expense' },
              ].map((tx, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-navy-800/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${tx.type === 'income' ? 'bg-green-400' : 'bg-red-400'}`}></div>
                    <div>
                      <div className="text-white text-sm font-medium">{tx.desc}</div>
                      <div className="text-gold-300 text-xs">{tx.date}</div>
                    </div>
                  </div>
                  <div className={`font-bold ${tx.type === 'income' ? 'text-green-300' : 'text-red-300'}`}>
                    {tx.type === 'income' ? '+' : ''}{tx.amount.toLocaleString()} MMK
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
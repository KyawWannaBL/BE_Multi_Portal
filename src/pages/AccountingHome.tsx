import React from "react";
import { useNavigate } from "react-router-dom";
import { useLanguageContext } from "@/lib/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Calculator, 
  FileText, 
  DollarSign, 
  TrendingUp, 
  Building, 
  CreditCard,
  BookOpen,
  BarChart3
} from "lucide-react";
import { ROUTE_PATHS } from "@/lib/index";

export default function AccountingHome() {
  const { t } = useLanguageContext();
  const navigate = useNavigate();

  const accountingModules = [
    {
      title: t('accounting.journalVoucherEntry'),
      description: "Create journal entries for transactions",
      icon: FileText,
      path: ROUTE_PATHS.ACCOUNTING_JOURNAL,
      color: "bg-blue-500/20 text-blue-400"
    },
    {
      title: t('accounting.journalVoucherList'),
      description: "View all journal vouchers",
      icon: BookOpen,
      path: ROUTE_PATHS.ACCOUNTING_JOURNAL_LIST,
      color: "bg-green-500/20 text-green-400"
    },
    {
      title: t('accounting.cashVoucherEntry'),
      description: "Record cash transactions",
      icon: DollarSign,
      path: ROUTE_PATHS.ACCOUNTING_CASH,
      color: "bg-yellow-500/20 text-yellow-400"
    },
    {
      title: t('accounting.cashVoucherList'),
      description: "View all cash vouchers",
      icon: CreditCard,
      path: ROUTE_PATHS.ACCOUNTING_CASH_LIST,
      color: "bg-purple-500/20 text-purple-400"
    },
    {
      title: t('accounting.chartOfAccounts'),
      description: "Manage chart of accounts",
      icon: BarChart3,
      path: ROUTE_PATHS.ACCOUNTING_CHART,
      color: "bg-orange-500/20 text-orange-400"
    },
    {
      title: t('accounting.accountBalance'),
      description: "View account balances",
      icon: Calculator,
      path: ROUTE_PATHS.ACCOUNTING_BALANCE,
      color: "bg-teal-500/20 text-teal-400"
    },
    {
      title: t('accounting.bankList'),
      description: "Manage bank accounts",
      icon: Building,
      path: ROUTE_PATHS.ACCOUNTING_BANKS,
      color: "bg-indigo-500/20 text-indigo-400"
    },
    {
      title: t('accounting.branchAccounting'),
      description: "Branch-wise accounting",
      icon: TrendingUp,
      path: ROUTE_PATHS.ACCOUNTING_BRANCH,
      color: "bg-pink-500/20 text-pink-400"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">
            Accounting System / စာရင်းကိုင်စနစ်
          </h1>
          <p className="text-gold-300">
            Complete financial management for Britium Express
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="lotus-card border-gold-400/20">
            <CardContent className="p-4 text-center">
              <DollarSign className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <div className="text-xl font-bold text-white">2,450,000</div>
              <div className="text-gold-300 text-sm">Total Revenue (MMK)</div>
            </CardContent>
          </Card>
          
          <Card className="lotus-card border-gold-400/20">
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <div className="text-xl font-bold text-white">1,850,000</div>
              <div className="text-gold-300 text-sm">Total Expenses (MMK)</div>
            </CardContent>
          </Card>
          
          <Card className="lotus-card border-gold-400/20">
            <CardContent className="p-4 text-center">
              <Calculator className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <div className="text-xl font-bold text-white">600,000</div>
              <div className="text-gold-300 text-sm">Net Profit (MMK)</div>
            </CardContent>
          </Card>
          
          <Card className="lotus-card border-gold-400/20">
            <CardContent className="p-4 text-center">
              <FileText className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <div className="text-xl font-bold text-white">156</div>
              <div className="text-gold-300 text-sm">Transactions Today</div>
            </CardContent>
          </Card>
        </div>

        {/* Accounting Modules */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accountingModules.map((module, index) => (
            <Card 
              key={index}
              className="lotus-card border-gold-400/20 cursor-pointer hover:border-gold-400/50 transition-all"
              onClick={() => navigate(module.path)}
            >
              <CardHeader>
                <div className={`w-12 h-12 rounded-full ${module.color} flex items-center justify-center mb-3`}>
                  <module.icon className="w-6 h-6" />
                </div>
                <CardTitle className="text-white text-lg">{module.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gold-300 text-sm">{module.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
import React from "react";
import { useNavigate } from "react-router-dom";
import { useLanguageContext } from "@/lib/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart3, 
  FileText, 
  Users, 
  MapPin, 
  Shield, 
  Truck,
  TrendingUp,
  DollarSign,
  Package,
  AlertTriangle
} from "lucide-react";
import { ROUTE_PATHS } from "@/lib/index";

export default function ReportsHome() {
  const { t } = useLanguageContext();
  const navigate = useNavigate();

  const reportCategories = [
    {
      title: "Delivery Reports",
      reports: [
        {
          title: "By Deliveryman",
          description: "Performance reports by delivery personnel",
          icon: Users,
          path: ROUTE_PATHS.REPORTS_DELIVERYMAN,
          color: "bg-blue-500/20 text-blue-400"
        },
        {
          title: "By Merchant",
          description: "Merchant-wise delivery statistics",
          icon: Package,
          path: ROUTE_PATHS.REPORTS_MERCHANT,
          color: "bg-green-500/20 text-green-400"
        },
        {
          title: "By Town/City",
          description: "Location-based delivery reports",
          icon: MapPin,
          path: ROUTE_PATHS.REPORTS_TOWN,
          color: "bg-yellow-500/20 text-yellow-400"
        },
        {
          title: "Ways to Deliver",
          description: "Delivery method analysis",
          icon: Truck,
          path: ROUTE_PATHS.REPORTS_DELIVERY_WAYS,
          color: "bg-purple-500/20 text-purple-400"
        }
      ]
    },
    {
      title: "Financial Reports",
      reports: [
        {
          title: t('reports.balanceSheet'),
          description: "Assets, liabilities and equity",
          icon: BarChart3,
          path: ROUTE_PATHS.REPORTS_BALANCE_SHEET,
          color: "bg-orange-500/20 text-orange-400"
        },
        {
          title: t('reports.generalLedger'),
          description: "Complete transaction history",
          icon: FileText,
          path: ROUTE_PATHS.REPORTS_GENERAL_LEDGER,
          color: "bg-teal-500/20 text-teal-400"
        },
        {
          title: t('reports.incomeStatement'),
          description: "Revenue and expense summary",
          icon: DollarSign,
          path: ROUTE_PATHS.REPORTS_INCOME_STATEMENT,
          color: "bg-indigo-500/20 text-indigo-400"
        },
        {
          title: t('reports.profitLoss'),
          description: "Profit and loss analysis",
          icon: TrendingUp,
          path: ROUTE_PATHS.REPORTS_PROFIT_LOSS,
          color: "bg-pink-500/20 text-pink-400"
        }
      ]
    },
    {
      title: "System Reports",
      reports: [
        {
          title: "Audit Logs",
          description: "System activity and security logs",
          icon: Shield,
          path: ROUTE_PATHS.REPORTS_AUDIT,
          color: "bg-red-500/20 text-red-400"
        },
        {
          title: t('reports.ticketsOpen'),
          description: "Open support tickets",
          icon: AlertTriangle,
          path: ROUTE_PATHS.REPORTS_TICKETS_OPEN,
          color: "bg-amber-500/20 text-amber-400"
        },
        {
          title: t('reports.ticketsClosed'),
          description: "Resolved support tickets",
          icon: FileText,
          path: ROUTE_PATHS.REPORTS_TICKETS_CLOSED,
          color: "bg-emerald-500/20 text-emerald-400"
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">
            Reports & Analytics / အစီရင်ခံစာများ
          </h1>
          <p className="text-gold-300">
            Comprehensive business intelligence and reporting
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="lotus-card border-gold-400/20">
            <CardContent className="p-4 text-center">
              <Package className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <div className="text-xl font-bold text-white">1,247</div>
              <div className="text-gold-300 text-sm">Total Deliveries</div>
            </CardContent>
          </Card>
          
          <Card className="lotus-card border-gold-400/20">
            <CardContent className="p-4 text-center">
              <Users className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <div className="text-xl font-bold text-white">89</div>
              <div className="text-gold-300 text-sm">Active Riders</div>
            </CardContent>
          </Card>
          
          <Card className="lotus-card border-gold-400/20">
            <CardContent className="p-4 text-center">
              <DollarSign className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <div className="text-xl font-bold text-white">2.45M</div>
              <div className="text-gold-300 text-sm">Revenue (MMK)</div>
            </CardContent>
          </Card>
          
          <Card className="lotus-card border-gold-400/20">
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <div className="text-xl font-bold text-white">94.2%</div>
              <div className="text-gold-300 text-sm">Success Rate</div>
            </CardContent>
          </Card>
        </div>

        {/* Report Categories */}
        {reportCategories.map((category, categoryIndex) => (
          <div key={categoryIndex} className="space-y-4">
            <h2 className="text-xl font-bold text-white">{category.title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {category.reports.map((report, index) => (
                <Card 
                  key={index}
                  className="lotus-card border-gold-400/20 cursor-pointer hover:border-gold-400/50 transition-all"
                  onClick={() => navigate(report.path)}
                >
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-full ${report.color} flex items-center justify-center mb-3`}>
                      <report.icon className="w-6 h-6" />
                    </div>
                    <CardTitle className="text-white text-lg">{report.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gold-300 text-sm">{report.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
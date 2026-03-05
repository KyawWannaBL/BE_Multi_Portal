import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Users, Package } from "lucide-react";

export default function KPIAnalytics() {
  const { t } = useTranslation();
  
  const stats = [
    { title: 'Total Shipments', value: '12,843', icon: <Package />, color: 'text-blue-600' },
    { title: 'Active Riders', value: '142', icon: <Users />, color: 'text-green-600' },
    { title: 'Success Rate', value: '98.2%', icon: <TrendingUp />, color: 'text-purple-600' },
    { title: 'Avg. Lead Time', value: '1.4 Days', icon: <BarChart3 />, color: 'text-orange-600' },
  ];

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold font-display">Enterprise KPI Analytics</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="border-none shadow-lg bg-white/50 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">{stat.title}</CardTitle>
              <div className={stat.color}>{stat.icon}</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="h-[400px] w-full bg-slate-50 rounded-3xl border-2 border-dashed flex items-center justify-center text-slate-400">
        [Real-time Charting Component Ready for Data Stream]
      </div>
    </div>
  );
}

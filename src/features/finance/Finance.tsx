// Simplified Finance page
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, CreditCard, Wallet } from 'lucide-react';

export default function Finance() {
  const stats = [
    { label: 'Total Revenue', value: '$125,000', icon: DollarSign, trend: '+12%' },
    { label: 'COD Collected', value: '$45,000', icon: Wallet, trend: '+8%' },
    { label: 'Outstanding AR', value: '$23,000', icon: CreditCard, trend: '-5%' },
    { label: 'Monthly Growth', value: '15.2%', icon: TrendingUp, trend: '+3%' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Finance</h1>
        <p className="text-muted-foreground">Financial overview and management</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index} className="card-modern">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-success">{stat.trend}</span> from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="card-modern">
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">COD Collection - EDS001</p>
                <p className="text-sm text-muted-foreground">Today, 2:30 PM</p>
              </div>
              <div className="text-right">
                <p className="font-medium">$150.00</p>
                <p className="text-sm text-success">Completed</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">COD Collection - EDS002</p>
                <p className="text-sm text-muted-foreground">Today, 1:15 PM</p>
              </div>
              <div className="text-right">
                <p className="font-medium">$75.50</p>
                <p className="text-sm text-success">Completed</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
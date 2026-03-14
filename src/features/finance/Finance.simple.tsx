import React from 'react';
import { CreditCard, TrendingUp, DollarSign, Receipt } from 'lucide-react';

export default function Finance() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Financial Management</h1>
        <p className="text-muted-foreground mt-2">
          Monitor financial performance and generate reports
        </p>
      </div>

      {/* Financial Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Monthly Revenue</p>
              <p className="text-2xl font-bold">₹2,45,670</p>
              <p className="text-xs text-green-600">+12.5% from last month</p>
            </div>
            <DollarSign className="h-8 w-8 text-primary" />
          </div>
        </div>
        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Expenses</p>
              <p className="text-2xl font-bold">₹1,89,450</p>
              <p className="text-xs text-red-600">+5.2% from last month</p>
            </div>
            <CreditCard className="h-8 w-8 text-red-500" />
          </div>
        </div>
        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Net Profit</p>
              <p className="text-2xl font-bold">₹56,220</p>
              <p className="text-xs text-green-600">+18.7% from last month</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Invoices</p>
              <p className="text-2xl font-bold">1,247</p>
              <p className="text-xs text-blue-600">156 pending</p>
            </div>
            <Receipt className="h-8 w-8 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card p-6 rounded-lg border border-border">
          <h2 className="text-xl font-semibold mb-4">Revenue Breakdown</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Domestic Shipping</span>
              <span className="font-medium">₹1,85,450 (75.5%)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">International Shipping</span>
              <span className="font-medium">₹45,220 (18.4%)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Express Services</span>
              <span className="font-medium">₹12,000 (4.9%)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Other Services</span>
              <span className="font-medium">₹3,000 (1.2%)</span>
            </div>
          </div>
        </div>
        <div className="bg-card p-6 rounded-lg border border-border">
          <h2 className="text-xl font-semibold mb-4">Expense Categories</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Fuel & Transportation</span>
              <span className="font-medium">₹89,450 (47.2%)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Staff Salaries</span>
              <span className="font-medium">₹65,000 (34.3%)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Maintenance</span>
              <span className="font-medium">₹25,000 (13.2%)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Other Expenses</span>
              <span className="font-medium">₹10,000 (5.3%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-card p-6 rounded-lg border border-border">
        <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span>Payment received - Invoice #INV-2026-001247</span>
            <span className="text-green-600 font-medium">+₹2,450</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Fuel expense - Vehicle TR-001</span>
            <span className="text-red-600 font-medium">-₹1,200</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>International shipping fee</span>
            <span className="text-green-600 font-medium">+₹8,500</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Maintenance - Vehicle TR-003</span>
            <span className="text-red-600 font-medium">-₹3,500</span>
          </div>
        </div>
      </div>
    </div>
  );
}
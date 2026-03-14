import React from 'react';
import { BarChart3, TrendingUp, DollarSign, Package } from 'lucide-react';

export default function Analytics() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Monitor performance metrics and business insights
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Revenue</p>
              <p className="text-2xl font-bold">₹2,45,670</p>
              <p className="text-xs text-green-600">+12.5% from last month</p>
            </div>
            <DollarSign className="h-8 w-8 text-primary" />
          </div>
        </div>
        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Shipments</p>
              <p className="text-2xl font-bold">1,247</p>
              <p className="text-xs text-green-600">+8.3% from last month</p>
            </div>
            <Package className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Efficiency</p>
              <p className="text-2xl font-bold">94.2%</p>
              <p className="text-xs text-green-600">+2.1% from last month</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Growth Rate</p>
              <p className="text-2xl font-bold">15.7%</p>
              <p className="text-xs text-green-600">+3.2% from last month</p>
            </div>
            <BarChart3 className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card p-6 rounded-lg border border-border">
          <h2 className="text-xl font-semibold mb-4">Monthly Revenue</h2>
          <div className="h-64 bg-background rounded-lg border border-border flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">Revenue chart visualization</p>
            </div>
          </div>
        </div>
        <div className="bg-card p-6 rounded-lg border border-border">
          <h2 className="text-xl font-semibold mb-4">Shipment Trends</h2>
          <div className="h-64 bg-background rounded-lg border border-border flex items-center justify-center">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">Shipment trends visualization</p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="bg-card p-6 rounded-lg border border-border">
        <h2 className="text-xl font-semibold mb-4">Performance Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="font-medium mb-2">Top Performing Routes</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Yangon - Mandalay</span>
                <span className="text-green-600">98.5%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Yangon - Naypyidaw</span>
                <span className="text-green-600">97.2%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Mandalay - Taunggyi</span>
                <span className="text-green-600">96.8%</span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="font-medium mb-2">Customer Satisfaction</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Delivery Speed</span>
                <span className="text-blue-600">4.8/5</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Package Condition</span>
                <span className="text-blue-600">4.9/5</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Service Quality</span>
                <span className="text-blue-600">4.7/5</span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="font-medium mb-2">Cost Efficiency</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Fuel Cost per KM</span>
                <span className="text-purple-600">₹12.50</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Avg Delivery Cost</span>
                <span className="text-purple-600">₹45.20</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Cost Reduction</span>
                <span className="text-green-600">-8.3%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
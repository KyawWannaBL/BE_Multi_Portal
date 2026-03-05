import React from 'react';
import { Warehouse as WarehouseIcon, Package, TrendingUp, AlertTriangle } from 'lucide-react';

export default function Warehouse() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Warehouse Management</h1>
        <p className="text-muted-foreground mt-2">
          Monitor inventory and warehouse operations
        </p>
      </div>

      {/* Warehouse Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Items</p>
              <p className="text-2xl font-bold">15,247</p>
            </div>
            <Package className="h-8 w-8 text-primary" />
          </div>
        </div>
        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Storage Capacity</p>
              <p className="text-2xl font-bold">78%</p>
            </div>
            <WarehouseIcon className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Processed Today</p>
              <p className="text-2xl font-bold">342</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Low Stock Items</p>
              <p className="text-2xl font-bold">12</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Warehouse Sections */}
      <div className="bg-card p-6 rounded-lg border border-border">
        <h2 className="text-xl font-semibold mb-4">Warehouse Sections</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-background rounded-lg border border-border">
            <h3 className="font-medium mb-2">Section A - Electronics</h3>
            <p className="text-sm text-muted-foreground mb-2">Capacity: 85% • Items: 2,456</p>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              Near Capacity
            </span>
          </div>
          <div className="p-4 bg-background rounded-lg border border-border">
            <h3 className="font-medium mb-2">Section B - Clothing</h3>
            <p className="text-sm text-muted-foreground mb-2">Capacity: 62% • Items: 1,834</p>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Optimal
            </span>
          </div>
          <div className="p-4 bg-background rounded-lg border border-border">
            <h3 className="font-medium mb-2">Section C - Documents</h3>
            <p className="text-sm text-muted-foreground mb-2">Capacity: 45% • Items: 892</p>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Available
            </span>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-card p-6 rounded-lg border border-border">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span>Package BE-001247 received in Section A</span>
            <span className="text-muted-foreground">2 minutes ago</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Batch sorting completed for Route #12</span>
            <span className="text-muted-foreground">15 minutes ago</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Low stock alert: Electronics accessories</span>
            <span className="text-muted-foreground">1 hour ago</span>
          </div>
        </div>
      </div>
    </div>
  );
}
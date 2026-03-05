import React from 'react';
import { Briefcase, Package, Truck, Activity } from 'lucide-react';

export default function Operations() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Operations Center</h1>
        <p className="text-muted-foreground mt-2">
          Manage daily operations and monitor system performance
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Operations</p>
              <p className="text-2xl font-bold">24</p>
            </div>
            <Activity className="h-8 w-8 text-primary" />
          </div>
        </div>
        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pending Shipments</p>
              <p className="text-2xl font-bold">156</p>
            </div>
            <Package className="h-8 w-8 text-primary" />
          </div>
        </div>
        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Vehicles</p>
              <p className="text-2xl font-bold">18</p>
            </div>
            <Truck className="h-8 w-8 text-primary" />
          </div>
        </div>
        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Efficiency Rate</p>
              <p className="text-2xl font-bold">94%</p>
            </div>
            <Briefcase className="h-8 w-8 text-primary" />
          </div>
        </div>
      </div>

      {/* Operations Overview */}
      <div className="bg-card p-6 rounded-lg border border-border">
        <h2 className="text-xl font-semibold mb-4">Current Operations</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-background rounded-lg border border-border">
            <div>
              <h3 className="font-medium">Morning Delivery Route #1</h3>
              <p className="text-sm text-muted-foreground">Driver: John Smith • Vehicle: TR-001</p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                In Progress
              </span>
              <p className="text-sm text-muted-foreground mt-1">12/15 deliveries</p>
            </div>
          </div>
          <div className="flex items-center justify-between p-4 bg-background rounded-lg border border-border">
            <div>
              <h3 className="font-medium">Warehouse Sorting Operation</h3>
              <p className="text-sm text-muted-foreground">Location: Main Hub • Team: Alpha</p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Active
              </span>
              <p className="text-sm text-muted-foreground mt-1">245 packages</p>
            </div>
          </div>
          <div className="flex items-center justify-between p-4 bg-background rounded-lg border border-border">
            <div>
              <h3 className="font-medium">International Shipment Processing</h3>
              <p className="text-sm text-muted-foreground">Destination: Singapore • Priority: High</p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Pending
              </span>
              <p className="text-sm text-muted-foreground mt-1">Customs clearance</p>
            </div>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-card p-6 rounded-lg border border-border">
        <h2 className="text-xl font-semibold mb-4">System Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm">Operations System: Online</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm">GPS Tracking: Active</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm">Communication: Connected</span>
          </div>
        </div>
      </div>
    </div>
  );
}
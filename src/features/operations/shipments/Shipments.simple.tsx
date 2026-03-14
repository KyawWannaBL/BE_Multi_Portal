import React from 'react';
import { Package, MapPin, Clock, Truck } from 'lucide-react';

export default function Shipments() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Shipments</h1>
        <p className="text-muted-foreground mt-2">
          Track and manage all shipments across the network
        </p>
      </div>

      {/* Shipment Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Shipments</p>
              <p className="text-2xl font-bold">1,247</p>
            </div>
            <Package className="h-8 w-8 text-primary" />
          </div>
        </div>
        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">In Transit</p>
              <p className="text-2xl font-bold">89</p>
            </div>
            <Truck className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Delivered Today</p>
              <p className="text-2xl font-bold">156</p>
            </div>
            <MapPin className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold">23</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Recent Shipments */}
      <div className="bg-card p-6 rounded-lg border border-border">
        <h2 className="text-xl font-semibold mb-4">Recent Shipments</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-background rounded-lg border border-border">
            <div>
              <h3 className="font-medium">BE-2026-001247</h3>
              <p className="text-sm text-muted-foreground">Yangon → Mandalay</p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                In Transit
              </span>
              <p className="text-sm text-muted-foreground mt-1">ETA: 2 hours</p>
            </div>
          </div>
          <div className="flex items-center justify-between p-4 bg-background rounded-lg border border-border">
            <div>
              <h3 className="font-medium">BE-2026-001246</h3>
              <p className="text-sm text-muted-foreground">Mandalay → Naypyidaw</p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Delivered
              </span>
              <p className="text-sm text-muted-foreground mt-1">Today 14:30</p>
            </div>
          </div>
          <div className="flex items-center justify-between p-4 bg-background rounded-lg border border-border">
            <div>
              <h3 className="font-medium">BE-2026-001245</h3>
              <p className="text-sm text-muted-foreground">Yangon → Singapore</p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Customs
              </span>
              <p className="text-sm text-muted-foreground mt-1">Processing</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-card p-6 rounded-lg border border-border">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 text-left bg-background rounded-lg border border-border hover:bg-accent transition-colors">
            <Package className="h-6 w-6 text-primary mb-2" />
            <h3 className="font-medium">Create Shipment</h3>
            <p className="text-sm text-muted-foreground">Register new shipment</p>
          </button>
          <button className="p-4 text-left bg-background rounded-lg border border-border hover:bg-accent transition-colors">
            <MapPin className="h-6 w-6 text-primary mb-2" />
            <h3 className="font-medium">Track Package</h3>
            <p className="text-sm text-muted-foreground">Find shipment location</p>
          </button>
          <button className="p-4 text-left bg-background rounded-lg border border-border hover:bg-accent transition-colors">
            <Truck className="h-6 w-6 text-primary mb-2" />
            <h3 className="font-medium">Assign Vehicle</h3>
            <p className="text-sm text-muted-foreground">Allocate delivery vehicle</p>
          </button>
        </div>
      </div>
    </div>
  );
}
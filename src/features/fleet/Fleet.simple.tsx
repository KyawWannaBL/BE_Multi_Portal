import React from 'react';
import { Truck, MapPin, Fuel, Wrench } from 'lucide-react';

export default function Fleet() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Fleet Management</h1>
        <p className="text-muted-foreground mt-2">
          Monitor and manage your vehicle fleet
        </p>
      </div>

      {/* Fleet Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Vehicles</p>
              <p className="text-2xl font-bold">24</p>
            </div>
            <Truck className="h-8 w-8 text-primary" />
          </div>
        </div>
        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Routes</p>
              <p className="text-2xl font-bold">18</p>
            </div>
            <MapPin className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Fuel Efficiency</p>
              <p className="text-2xl font-bold">12.5L</p>
            </div>
            <Fuel className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Maintenance Due</p>
              <p className="text-2xl font-bold">3</p>
            </div>
            <Wrench className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Vehicle List */}
      <div className="bg-card p-6 rounded-lg border border-border">
        <h2 className="text-xl font-semibold mb-4">Active Vehicles</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-background rounded-lg border border-border">
            <div>
              <h3 className="font-medium">TR-001 • Toyota Hiace</h3>
              <p className="text-sm text-muted-foreground">Driver: John Smith • Route: Yangon Central</p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Active
              </span>
              <p className="text-sm text-muted-foreground mt-1">12/15 deliveries</p>
            </div>
          </div>
          <div className="flex items-center justify-between p-4 bg-background rounded-lg border border-border">
            <div>
              <h3 className="font-medium">TR-002 • Isuzu NPR</h3>
              <p className="text-sm text-muted-foreground">Driver: Mary Johnson • Route: Mandalay Express</p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                En Route
              </span>
              <p className="text-sm text-muted-foreground mt-1">8/10 deliveries</p>
            </div>
          </div>
          <div className="flex items-center justify-between p-4 bg-background rounded-lg border border-border">
            <div>
              <h3 className="font-medium">TR-003 • Ford Transit</h3>
              <p className="text-sm text-muted-foreground">Driver: David Lee • Route: Airport Pickup</p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Maintenance
              </span>
              <p className="text-sm text-muted-foreground mt-1">Scheduled service</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
import React from 'react';
import { MapPin, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export default function Delivery() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Delivery Management</h1>
        <p className="text-muted-foreground mt-2">
          Track and manage delivery operations
        </p>
      </div>

      {/* Delivery Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Today's Deliveries</p>
              <p className="text-2xl font-bold">156</p>
            </div>
            <MapPin className="h-8 w-8 text-primary" />
          </div>
        </div>
        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold">142</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">In Progress</p>
              <p className="text-2xl font-bold">12</p>
            </div>
            <Clock className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Failed</p>
              <p className="text-2xl font-bold">2</p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Active Deliveries */}
      <div className="bg-card p-6 rounded-lg border border-border">
        <h2 className="text-xl font-semibold mb-4">Active Deliveries</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-background rounded-lg border border-border">
            <div>
              <h3 className="font-medium">Route #12 - Central Yangon</h3>
              <p className="text-sm text-muted-foreground">Driver: John Smith • 8/12 completed</p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                In Progress
              </span>
              <p className="text-sm text-muted-foreground mt-1">ETA: 2 hours</p>
            </div>
          </div>
          <div className="flex items-center justify-between p-4 bg-background rounded-lg border border-border">
            <div>
              <h3 className="font-medium">Route #15 - Mandalay Express</h3>
              <p className="text-sm text-muted-foreground">Driver: Mary Johnson • 15/15 completed</p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Completed
              </span>
              <p className="text-sm text-muted-foreground mt-1">Finished at 16:30</p>
            </div>
          </div>
        </div>
      </div>

      {/* Delivery Performance */}
      <div className="bg-card p-6 rounded-lg border border-border">
        <h2 className="text-xl font-semibold mb-4">Performance Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-background rounded-lg border border-border">
            <p className="text-2xl font-bold text-green-500">98.7%</p>
            <p className="text-sm text-muted-foreground">Success Rate</p>
          </div>
          <div className="text-center p-4 bg-background rounded-lg border border-border">
            <p className="text-2xl font-bold text-blue-500">24 min</p>
            <p className="text-sm text-muted-foreground">Avg Delivery Time</p>
          </div>
          <div className="text-center p-4 bg-background rounded-lg border border-border">
            <p className="text-2xl font-bold text-primary">4.8/5</p>
            <p className="text-sm text-muted-foreground">Customer Rating</p>
          </div>
        </div>
      </div>
    </div>
  );
}
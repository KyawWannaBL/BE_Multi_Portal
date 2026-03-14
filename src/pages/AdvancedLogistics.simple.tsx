import React from 'react';
import { Zap, MapPin, Navigation, PenTool } from 'lucide-react';

export default function AdvancedLogistics() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Advanced Logistics</h1>
        <p className="text-muted-foreground mt-2">
          GPS tracking, route optimization, and electronic signatures
        </p>
      </div>

      {/* Feature Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">GPS Tracked Vehicles</p>
              <p className="text-2xl font-bold">18</p>
            </div>
            <MapPin className="h-8 w-8 text-primary" />
          </div>
        </div>
        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Optimized Routes</p>
              <p className="text-2xl font-bold">24</p>
            </div>
            <Navigation className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Digital Signatures</p>
              <p className="text-2xl font-bold">156</p>
            </div>
            <PenTool className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Automation Level</p>
              <p className="text-2xl font-bold">87%</p>
            </div>
            <Zap className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Advanced Features */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center space-x-3 mb-4">
            <MapPin className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold">Real-time GPS Tracking</h2>
          </div>
          <div className="h-48 bg-background rounded-lg border border-border flex items-center justify-center">
            <div className="text-center">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">Live GPS tracking map</p>
            </div>
          </div>
          <div className="mt-4">
            <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90">
              View Live Tracking
            </button>
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center space-x-3 mb-4">
            <Navigation className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold">Route Optimization</h2>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Route Efficiency</span>
              <span className="font-medium text-green-600">+23%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Fuel Savings</span>
              <span className="font-medium text-green-600">₹12,450</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Time Saved</span>
              <span className="font-medium text-blue-600">4.5 hours</span>
            </div>
          </div>
          <div className="mt-4">
            <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90">
              Optimize Routes
            </button>
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center space-x-3 mb-4">
            <PenTool className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold">Electronic Signatures</h2>
          </div>
          <div className="h-32 bg-background rounded-lg border border-border flex items-center justify-center">
            <div className="text-center">
              <PenTool className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">Digital signature pad</p>
            </div>
          </div>
          <div className="mt-4">
            <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90">
              Capture Signature
            </button>
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center space-x-3 mb-4">
            <Zap className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold">Data Entry Automation</h2>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Auto-filled Forms</span>
              <span className="font-medium">1,247</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">OCR Processed</span>
              <span className="font-medium">892</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Accuracy Rate</span>
              <span className="font-medium text-green-600">98.5%</span>
            </div>
          </div>
          <div className="mt-4">
            <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90">
              Process Documents
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
import React from 'react';
import { QrCode, Package, MapPin, Clock } from 'lucide-react';

export default function ParcelPickup() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Parcel Pickup System</h1>
        <p className="text-muted-foreground mt-2">
          Register parcels and generate QR codes for tracking
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Today's Pickups</p>
              <p className="text-2xl font-bold">45</p>
            </div>
            <Package className="h-8 w-8 text-primary" />
          </div>
        </div>
        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">QR Codes Generated</p>
              <p className="text-2xl font-bold">156</p>
            </div>
            <QrCode className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pending Pickup</p>
              <p className="text-2xl font-bold">12</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Routes Planned</p>
              <p className="text-2xl font-bold">8</p>
            </div>
            <MapPin className="h-8 w-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Parcel Registration Form */}
      <div className="bg-card p-6 rounded-lg border border-border">
        <h2 className="text-xl font-semibold mb-4">Register New Parcel</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Sender Name</label>
            <input type="text" className="w-full p-2 border border-border rounded-lg" placeholder="Enter sender name" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Recipient Name</label>
            <input type="text" className="w-full p-2 border border-border rounded-lg" placeholder="Enter recipient name" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Pickup Address</label>
            <input type="text" className="w-full p-2 border border-border rounded-lg" placeholder="Enter pickup address" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Delivery Address</label>
            <input type="text" className="w-full p-2 border border-border rounded-lg" placeholder="Enter delivery address" />
          </div>
        </div>
        <div className="mt-4">
          <button className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90">
            Generate QR Code & Register
          </button>
        </div>
      </div>

      {/* Recent Parcels */}
      <div className="bg-card p-6 rounded-lg border border-border">
        <h2 className="text-xl font-semibold mb-4">Recent Parcels</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-background rounded-lg border border-border">
            <div>
              <h3 className="font-medium">BE-PCL-001247</h3>
              <p className="text-sm text-muted-foreground">John Smith → Mary Johnson</p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Registered
              </span>
              <p className="text-sm text-muted-foreground mt-1">QR Generated</p>
            </div>
          </div>
          <div className="flex items-center justify-between p-4 bg-background rounded-lg border border-border">
            <div>
              <h3 className="font-medium">BE-PCL-001246</h3>
              <p className="text-sm text-muted-foreground">David Lee → Sarah Wilson</p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Picked Up
              </span>
              <p className="text-sm text-muted-foreground mt-1">In Transit</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
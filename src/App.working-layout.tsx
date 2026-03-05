import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ROUTE_PATHS } from "@/lib/index";
import { SimpleLayout } from "@/components/SimpleLayout";

// Simple Dashboard
function Dashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome to Britium Express Enterprise Logistics Platform
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card p-6 rounded-lg border border-border">
          <h3 className="text-lg font-semibold mb-2">Total Shipments</h3>
          <p className="text-2xl font-bold">1,247</p>
          <p className="text-sm text-muted-foreground">All time shipments</p>
        </div>
        <div className="bg-card p-6 rounded-lg border border-border">
          <h3 className="text-lg font-semibold mb-2">Active Deliveries</h3>
          <p className="text-2xl font-bold">89</p>
          <p className="text-sm text-muted-foreground">Currently in transit</p>
        </div>
        <div className="bg-card p-6 rounded-lg border border-border">
          <h3 className="text-lg font-semibold mb-2">Total Users</h3>
          <p className="text-2xl font-bold">156</p>
          <p className="text-sm text-muted-foreground">Registered users</p>
        </div>
        <div className="bg-card p-6 rounded-lg border border-border">
          <h3 className="text-lg font-semibold mb-2">Revenue</h3>
          <p className="text-2xl font-bold">₹2,45,670</p>
          <p className="text-sm text-muted-foreground">This month</p>
        </div>
      </div>

      <div className="bg-card p-6 rounded-lg border border-border">
        <h3 className="text-lg font-semibold mb-4">System Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-muted-foreground">Database: Online</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-muted-foreground">API Services: Active</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-muted-foreground">GPS Tracking: Enabled</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple placeholder pages
function Operations() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground mb-4">Operations</h1>
      <div className="bg-card p-6 rounded-lg border border-border">
        <p className="text-muted-foreground">Operations management interface coming soon...</p>
      </div>
    </div>
  );
}

function Shipments() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground mb-4">Shipments</h1>
      <div className="bg-card p-6 rounded-lg border border-border">
        <p className="text-muted-foreground">Shipment tracking interface coming soon...</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <SimpleLayout>
        <Routes>
          <Route path={ROUTE_PATHS.DASHBOARD} element={<Dashboard />} />
          <Route path={ROUTE_PATHS.OPERATIONS} element={<Operations />} />
          <Route path={ROUTE_PATHS.SHIPMENTS} element={<Shipments />} />
          <Route path="*" element={<Navigate to={ROUTE_PATHS.DASHBOARD} replace />} />
        </Routes>
      </SimpleLayout>
    </BrowserRouter>
  );
}
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ROUTE_PATHS } from "@/lib/index";

// Simple Dashboard without Layout
function SimpleDashboard() {
  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-primary mb-8">
          Britium Express Dashboard
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card p-6 rounded-lg border border-border">
            <h3 className="text-lg font-semibold mb-2">Operations</h3>
            <p className="text-muted-foreground">Manage daily operations</p>
          </div>
          <div className="bg-card p-6 rounded-lg border border-border">
            <h3 className="text-lg font-semibold mb-2">Shipments</h3>
            <p className="text-muted-foreground">Track shipments</p>
          </div>
          <div className="bg-card p-6 rounded-lg border border-border">
            <h3 className="text-lg font-semibold mb-2">Analytics</h3>
            <p className="text-muted-foreground">View reports</p>
          </div>
        </div>
        <div className="mt-8 text-center text-muted-foreground">
          © 2026 Britium Express Logistics Platform
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SimpleDashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
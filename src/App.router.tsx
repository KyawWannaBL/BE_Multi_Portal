import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";

// Simple Login Component
function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 'admin@britiumexpress.com' && password === 'demo123') {
      localStorage.setItem('isLoggedIn', 'true');
      navigate('/dashboard');
    } else {
      alert('Use: admin@britiumexpress.com / demo123');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-md mx-auto bg-card p-8 rounded-lg border border-border">
        <h1 className="text-3xl font-bold text-center mb-4 text-primary">
          Britium Express
        </h1>
        <p className="text-center mb-8 text-muted-foreground">
          Enterprise Logistics Platform
        </p>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-background border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-background border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
          <button 
            type="submit" 
            className="w-full py-3 bg-primary text-primary-foreground rounded-md font-semibold hover:bg-primary/90 transition-colors"
          >
            Sign In
          </button>
        </form>
        <div className="mt-8 text-sm text-muted-foreground text-center">
          Demo: admin@britiumexpress.com / demo123
        </div>
      </div>
    </div>
  );
}

// Simple Dashboard Component
function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-card p-8 rounded-lg border border-border mb-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-primary">
              Britium Express Dashboard
            </h1>
            <button 
              onClick={handleLogout}
              className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md font-semibold hover:bg-destructive/90 transition-colors"
            >
              Logout
            </button>
          </div>
          <p className="text-muted-foreground mb-8">
            Welcome to the Enterprise Logistics Platform! The routing system is working correctly.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-background p-6 rounded-lg border border-border">
              <h3 className="text-lg font-semibold mb-2">Operations</h3>
              <p className="text-muted-foreground">Manage daily operations</p>
            </div>
            <div className="bg-background p-6 rounded-lg border border-border">
              <h3 className="text-lg font-semibold mb-2">Shipments</h3>
              <p className="text-muted-foreground">Track shipments</p>
            </div>
            <div className="bg-background p-6 rounded-lg border border-border">
              <h3 className="text-lg font-semibold mb-2">Analytics</h3>
              <p className="text-muted-foreground">View reports</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
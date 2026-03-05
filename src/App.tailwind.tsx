import React, { useState } from 'react';

export default function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 'admin@britiumexpress.com' && password === 'demo123') {
      setCurrentPage('dashboard');
    } else {
      alert('Use: admin@britiumexpress.com / demo123');
    }
  };

  if (currentPage === 'dashboard') {
    return (
      <div className="min-h-screen bg-background text-foreground p-8">
        <div className="max-w-md mx-auto bg-card p-8 rounded-lg border border-border">
          <h1 className="text-3xl font-bold text-center mb-8 text-primary">
            Britium Express Dashboard
          </h1>
          <p className="text-center mb-8 text-muted-foreground">
            Welcome! The app is working correctly with Tailwind CSS.
          </p>
          <button 
            className="w-full py-3 bg-primary text-primary-foreground rounded-md font-semibold hover:bg-primary/90 transition-colors"
            onClick={() => setCurrentPage('login')}
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

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
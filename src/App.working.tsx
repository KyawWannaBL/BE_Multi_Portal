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

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#0B0C10',
      color: '#D4AF37',
      fontFamily: 'system-ui, sans-serif',
      padding: '2rem'
    },
    card: {
      maxWidth: '400px',
      margin: '0 auto',
      backgroundColor: '#1A1D23',
      padding: '2rem',
      borderRadius: '8px',
      border: '1px solid #D4AF37'
    },
    input: {
      width: '100%',
      padding: '0.75rem',
      marginBottom: '1rem',
      backgroundColor: '#0B0C10',
      border: '1px solid #D4AF37',
      borderRadius: '4px',
      color: '#D4AF37',
      fontSize: '1rem'
    },
    button: {
      width: '100%',
      padding: '0.75rem',
      backgroundColor: '#D4AF37',
      color: '#0B0C10',
      border: 'none',
      borderRadius: '4px',
      fontSize: '1rem',
      fontWeight: 'bold',
      cursor: 'pointer'
    },
    title: {
      fontSize: '2rem',
      fontWeight: 'bold',
      textAlign: 'center' as const,
      marginBottom: '2rem'
    }
  };

  if (currentPage === 'dashboard') {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.title}>Britium Express Dashboard</h1>
          <p style={{ textAlign: 'center', marginBottom: '2rem' }}>
            Welcome! The app is working correctly.
          </p>
          <button 
            style={styles.button}
            onClick={() => setCurrentPage('login')}
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Britium Express</h1>
        <p style={{ textAlign: 'center', marginBottom: '2rem', opacity: 0.8 }}>
          Enterprise Logistics Platform
        </p>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
          />
          <button type="submit" style={styles.button}>
            Sign In
          </button>
        </form>
        <div style={{ marginTop: '2rem', fontSize: '0.9rem', opacity: 0.6, textAlign: 'center' }}>
          Demo: admin@britiumexpress.com / demo123
        </div>
      </div>
    </div>
  );
}
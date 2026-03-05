import React from 'react';

export default function App() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#0B0C10',
      color: '#D4AF37',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem', fontWeight: 'bold' }}>
          Britium Express
        </h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '2rem', opacity: 0.8 }}>
          Enterprise Logistics Platform - Testing Mode
        </p>
        <div style={{ 
          display: 'inline-block',
          padding: '1rem 2rem',
          backgroundColor: '#D4AF37',
          color: '#0B0C10',
          borderRadius: '0.5rem',
          fontWeight: 'bold',
          cursor: 'pointer'
        }}>
          System is Loading...
        </div>
        <div style={{ marginTop: '2rem', fontSize: '0.9rem', opacity: 0.6 }}>
          If you see this, React is working. Diagnosing the issue...
        </div>
      </div>
    </div>
  );
}
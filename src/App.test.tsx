import React from 'react';

// Minimal test app to diagnose black screen
export default function App() {
  return (
    <div style={{ 
      height: '100vh', 
      width: '100%', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#0B0C10',
      color: '#D4AF37',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
          Britium Express - Test Mode
        </h1>
        <p style={{ marginBottom: '2rem' }}>
          If you can see this, React is working. Loading full app...
        </p>
        <div style={{
          height: '32px',
          width: '32px',
          border: '4px solid #D4AF37',
          borderTop: '4px solid transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto'
        }} />
      </div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
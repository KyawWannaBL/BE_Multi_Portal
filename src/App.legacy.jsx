import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

function App() {
  const [session, setSession] = useState(null);

  // 1. Listen for Auth State Changes (Login/Logout)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. Navigation & Signout Logic
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/'; 
  };

  const goBack = () => window.history.back();
  const goForward = () => window.history.forward();

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Global Navigation Bar - Only shows if logged in */}
      {session && (
        <nav style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          padding: '1rem', 
          background: '#111827',
          borderBottom: '1px solid #374151' 
        }}>
          <div>
            <button onClick={goBack} style={{ marginRight: '10px', padding: '5px 15px', borderRadius: '4px', background: '#374151' }}>← Previous</button>
            <button onClick={goForward} style={{ padding: '5px 15px', borderRadius: '4px', background: '#374151' }}>Next →</button>
          </div>
          <button 
            onClick={handleSignOut} 
            style={{ padding: '5px 15px', background: '#ef4444', borderRadius: '4px', fontWeight: 'bold' }}
          >
            Sign Out
          </button>
        </nav>
      )}

      {/* Main Content Area */}
      <main className="p-8">
        {!session ? (
          <div className="text-center">
            <h1 className="text-2xl font-bold">Welcome to Britium Portal</h1>
            <p className="mt-4">Please log in to continue.</p>
            {/* Your Login Component would go here */}
          </div>
        ) : (
          <div>
            <h1 className="text-2xl font-bold">Command Center</h1>
            <p className="mt-2">Logged in as: {session.user.email}</p>
            {/* Your Dashboard/App content goes here */}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;

import { supabase } from './supabaseClient'

export const handleSignOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) console.error('Error signing out:', error.message)
  else window.location.href = '/login' // Redirect to login page
}

export const Navigation = () => {
  return (
    <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#1a1a1a' }}>
      <div>
        <button onClick={() => window.history.back()}>← Previous</button>
        <button onClick={() => window.history.forward()} style={{ marginLeft: '10px' }}>Next →</button>
      </div>
      <button 
        onClick={handleSignOut} 
        style={{ backgroundColor: '#ff4b4b', color: 'white' }}
      >
        Sign Out
      </button>
    </nav>
  )
}

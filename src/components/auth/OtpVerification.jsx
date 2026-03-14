import { useState } from 'react';
import { supabase } from './supabaseClient';

export const OtpVerification = ({ email, type = 'reauthentication' }) => {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type, // 'reauthentication', 'magiclink', or 'signup'
    });

    if (error) {
      alert(`Verification failed: ${error.message}`);
    } else {
      alert("Verified successfully!");
      // Proceed to sensitive action or dashboard
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleVerify} className="otp-container">
      <h3>Enter Verification Code</h3>
      <input 
        type="text" 
        maxLength="6" 
        value={token} 
        onChange={(e) => setToken(e.target.value)}
        placeholder="123456"
        style={{ fontSize: '24px', textAlign: 'center', letterSpacing: '4px' }}
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Verifying...' : 'Submit Code'}
      </button>
    </form>
  );
};
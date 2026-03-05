import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
  };

  return (
    <div className="min-h-screen bg-[#05080F] flex items-center justify-center p-6">
      <form onSubmit={handleLogin} className="bg-white/5 p-8 rounded-[2rem] border border-white/10 w-full max-w-md">
        <h2 className="text-2xl font-black text-white mb-6 uppercase tracking-tighter text-center">Enterprise Login</h2>
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full h-12 bg-black border border-white/10 rounded-xl mb-4 px-4 text-white" />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full h-12 bg-black border border-white/10 rounded-xl mb-6 px-4 text-white" />
        <button type="submit" className="w-full h-12 bg-emerald-600 rounded-xl font-black uppercase tracking-widest text-white hover:bg-emerald-500 transition-all">Sign In</button>
      </form>
    </div>
  );
}

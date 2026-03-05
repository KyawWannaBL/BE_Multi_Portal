import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Download, ArrowRight, Loader2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#05080F] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-4 border border-white/10 shadow-2xl">
             <img src="/logo.png" className="h-12 w-12" alt="Britium" />
          </div>
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Enterprise Portal</h2>
        </div>

        <form onSubmit={handleLogin} className="bg-[#111622] p-8 rounded-[2.5rem] border border-white/10 shadow-3xl space-y-4">
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full h-14 bg-black/40 border border-white/10 rounded-2xl px-5 text-white focus:border-emerald-500 transition-all" />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full h-14 bg-black/40 border border-white/10 rounded-2xl px-5 text-white focus:border-emerald-500 transition-all" />
          <button type="submit" disabled={loading} className="w-full h-14 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-xl">
            {loading ? <Loader2 className="animate-spin" /> : <>Authenticate <ArrowRight className="h-5 w-5" /></>}
          </button>
        </form>

        <a href="/android.apk" download className="flex items-center justify-center gap-2 w-full h-12 rounded-2xl border border-white/10 bg-white/5 text-white font-black uppercase text-[11px] hover:bg-white/10 transition-all">
          <Download className="h-4 w-4" /> Download Android APK
        </a>
      </div>
    </div>
  );
}

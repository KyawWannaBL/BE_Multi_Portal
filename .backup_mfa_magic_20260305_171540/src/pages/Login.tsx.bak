import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Mail, Lock, Download, Globe, AlertTriangle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { lang, toggleLang } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  setAuthError("");

  const res = await login(email, password);
  if (!res.success) {
    setAuthError(lang === "en" ? "Invalid Credentials" : "အချက်အလက် မှားယွင်းနေပါသည်");
    setIsLoading(false);
    return;
  }

  navigate("/", { replace: true });
};

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#05080F] p-4 overflow-hidden">
      {/* Background Video Restoration */}
      <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover opacity-20 grayscale">
        <source src="/background.mp4" type="video/mp4" />
      </video>

      <div className="relative z-10 w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-6 shadow-2xl">
            <ShieldCheck className="text-emerald-500 h-8 w-8" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-widest uppercase">
            Britium <span className="text-emerald-500">Express</span>
          </h1>
        </div>

        <div className="bg-[#111622]/90 backdrop-blur-xl rounded-3xl p-8 border-t-4 border-emerald-500 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <input type="email" required placeholder="admin@britium.com" className="w-full h-14 bg-[#0B0E17] border border-white/5 rounded-xl px-4 text-white outline-none focus:border-emerald-500" onChange={e => setEmail(e.target.value)} />
              <input type="password" required placeholder="••••••••" className="w-full h-14 bg-[#0B0E17] border border-white/5 rounded-xl px-4 text-white outline-none focus:border-emerald-500" onChange={e => setPassword(e.target.value)} />
            </div>
            
            <Button type="submit" disabled={isLoading} className="w-full h-14 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase">
              {isLoading ? <Loader2 className="animate-spin" /> : 'Authenticate'}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 space-y-4 text-center">
             <button className="w-full h-12 border border-white/5 rounded-xl text-[10px] text-slate-500 font-mono hover:bg-white/5 flex items-center justify-center gap-2">
                <Download size={14} /> DOWNLOAD SECURE APK
             </button>
             <div className="flex justify-between px-2">
                <Link to="/signup" className="text-[10px] text-slate-500 hover:text-emerald-500 uppercase font-mono">Sign Up</Link>
                <Link to="/forgot-password"  className="text-[10px] text-slate-500 hover:text-emerald-500 uppercase font-mono">Forgot Password?</Link>
             </div>
             <button onClick={toggleLang} className="text-slate-500 hover:text-white flex items-center gap-2 text-[10px] mx-auto uppercase font-mono">
                <Globe size={12} /> {lang === 'en' ? 'မြန်မာစာ' : 'English'}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}

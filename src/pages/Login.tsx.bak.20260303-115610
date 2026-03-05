import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Mail, Lock, Download, Globe, AlertTriangle, KeyRound, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/supabaseClient';

export default function Login() {
  const navigate = useNavigate();
  const { toggleLang, lang } = useLanguage();
  
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // Security Update State (Must Change Password)
  const [requirePasswordChange, setRequirePasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userId, setUserId] = useState('');
  const [userRole, setUserRole] = useState('');

  const finishLogin = (userEmail: string, role: string) => {
    localStorage.setItem('btx_session', JSON.stringify({ email: userEmail, role: role }));
    navigate('/admin/dashboard');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError('');
    
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      // Check profile for security flags
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('must_change_password, role')
        .eq('id', authData.user.id)
        .single();

      if (profileError) throw profileError;

      if (profile.must_change_password) {
        setUserId(authData.user.id);
        setUserRole(profile.role);
        setRequirePasswordChange(true);
        setIsLoading(false);
        return;
      }

      finishLogin(authData.user.email!, profile.role);

    } catch (error: any) {
      setAuthError(lang === 'en' ? 'Invalid clearance credentials.' : 'လျှို့ဝှက်ကုဒ် မှားယွင်းနေပါသည်။');
      setIsLoading(false);
    }
  };

  // --- UPGRADED: Enterprise Password Rotation & Audit Logging ---
  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    // Retained necessary UI validation
    if (newPassword !== confirmPassword) {
      setAuthError(lang === 'en' ? 'Passwords do not match.' : 'စကားဝှက်များ မတူညီပါ။');
      return;
    }

    if (newPassword.length < 6) {
      setAuthError(lang === 'en' ? 'Password must be at least 6 characters.' : 'စကားဝှက် အနည်းဆုံး ၆ လုံး ရှိရမည်။');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Update Auth Password
      const { error: authErr } = await supabase.auth.updateUser({ password: newPassword });
      if (authErr) throw authErr;

      // 2. Atomic Update of Profile Flag
      const { error: profileErr } = await supabase.from('profiles').update({ must_change_password: false }).eq('id', userId);
      if (profileErr) throw profileErr;
      
      // 3. Write to Immutable Audit Log
      await supabase.from('audit_logs').insert({
        user_id: userId,
        event_type: 'PASSWORD_CHANGE',
        metadata: { status: 'SUCCESS_MANDATORY_ROTATION' }
      });

      finishLogin(email, userRole);
    } catch (err: any) {
      console.error("Security Update Error:", err);
      setAuthError(lang === 'en' ? 'Security Policy Violation' : 'စနစ် လုံခြုံရေး အမှားအယွင်း');
    } finally {
      setIsLoading(false);
    }
  };

  // --- UPGRADED: Secure Artifact Distribution ---
  const downloadSecureAPK = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-download-url');
      if (data?.signedUrl) {
        window.location.href = data.signedUrl;
      } else {
        alert(lang === 'en' ? "Unauthorized: Access Denied" : "ဝင်ရောက်ခွင့် မရှိပါ။");
      }
    } catch (err) {
      console.error("Download Request Failed:", err);
      alert(lang === 'en' ? "Secure gateway connection failed." : "ချိတ်ဆက်မှု အမှားအယွင်းဖြစ်နေပါသည်။");
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#05080F] p-4">
      <video autoPlay muted loop playsInline className="absolute z-0 min-w-full min-h-full object-cover opacity-20 grayscale-[0.3]">
        <source src="/background.mp4" type="video/mp4" />
      </video>

      <div className="relative z-10 w-full max-w-md flex flex-col items-center">
        <div className={`w-16 h-16 backdrop-blur-md border rounded-2xl flex items-center justify-center mb-6 shadow-2xl transition-all ${requirePasswordChange ? 'bg-amber-500/10 border-amber-500/50' : 'bg-[#0B101B]/80 border-white/5'}`}>
          {requirePasswordChange ? <KeyRound className="text-amber-500 h-8 w-8" /> : <ShieldCheck className="text-emerald-500 h-8 w-8" />}
        </div>

        <h1 className="text-4xl font-black text-white tracking-widest uppercase mb-3 text-center">
          {requirePasswordChange ? <>SECURITY <span className="text-amber-500">UPDATE</span></> : <>BRITIUM <span className="text-emerald-500">EXPRESS</span></>}
        </h1>

        <div className={`w-full bg-[#111622]/95 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl border-t-[6px] transition-all ${requirePasswordChange ? 'border-amber-500' : 'border-emerald-500'}`}>
          
          {authError && (
            <div className="bg-rose-500/10 border border-rose-500/50 text-rose-500 text-xs font-mono p-3 rounded-lg flex items-center gap-2 mb-6">
              <AlertTriangle size={14} /> {authError}
            </div>
          )}

          {!requirePasswordChange ? (
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-4">
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
                  <input type="email" required className="w-full bg-[#0B0E17] border border-white/5 rounded-xl h-14 pl-12 pr-4 text-white font-mono text-sm outline-none focus:border-emerald-500/50 transition-all" placeholder="admin@britium.com" onChange={e => setEmail(e.target.value)} />
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
                  <input type="password" required className="w-full bg-[#0B0E17] border border-white/5 rounded-xl h-14 pl-12 pr-4 text-white font-mono text-lg tracking-widest outline-none focus:border-emerald-500/50 transition-all" placeholder="••••••••••••" onChange={e => setPassword(e.target.value)} />
                </div>
              </div>
              <Button type="submit" disabled={isLoading} className="w-full h-14 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-lg tracking-widest uppercase shadow-lg shadow-emerald-900/20">
                {isLoading ? (lang === 'en' ? "VALIDATING..." : "စစ်ဆေးနေပါသည်...") : (lang === 'en' ? 'AUTHENTICATE' : 'စနစ်သို့ဝင်မည်')}
              </Button>
            </form>
          ) : (
            <form onSubmit={handlePasswordUpdate} className="space-y-6">
              <div className="space-y-4">
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-amber-500 transition-colors" />
                  <input type="password" required minLength={6} className="w-full bg-[#0B0E17] border border-white/5 rounded-xl h-14 pl-12 pr-4 text-white font-mono text-lg outline-none focus:border-amber-500/50 transition-all" placeholder="NEW PASSWORD" onChange={e => setNewPassword(e.target.value)} />
                </div>
                <div className="relative group">
                  <CheckCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-amber-500 transition-colors" />
                  <input type="password" required minLength={6} className="w-full bg-[#0B0E17] border border-white/5 rounded-xl h-14 pl-12 pr-4 text-white font-mono text-lg outline-none focus:border-amber-500/50 transition-all" placeholder="CONFIRM PASSWORD" onChange={e => setConfirmPassword(e.target.value)} />
                </div>
              </div>
              <Button type="submit" disabled={isLoading} className="w-full h-14 bg-amber-600 hover:bg-amber-500 text-white font-black rounded-xl text-lg tracking-widest uppercase shadow-lg shadow-amber-900/20">
                {isLoading ? "UPDATING..." : "UPDATE & PROCEED"}
              </Button>
            </form>
          )}

          <div className="mt-8 pt-6 border-t border-white/5 space-y-4">
            {/* --- UPGRADED: Edge Function Bound Download Button --- */}
            <Button 
              variant="outline" 
              type="button"
              className="w-full h-12 border-white/10 text-slate-400 hover:bg-white/5 font-mono tracking-widest text-xs"
              onClick={downloadSecureAPK}
            >
              <Download className="mr-2 h-4 w-4" />
              {lang === 'en' ? 'DOWNLOAD SECURE APK' : 'APK ဒေါင်းလုဒ်လုပ်ရန်'}
            </Button>
            <Button onClick={toggleLang} variant="ghost" className="w-full text-slate-500 hover:text-white flex items-center justify-center gap-2 text-[10px] font-bold font-mono uppercase tracking-widest h-8">
              <Globe size={14} /> {lang === 'en' ? "မြန်မာစာ" : "English"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
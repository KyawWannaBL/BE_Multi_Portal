import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useLanguageContext } from '@/lib/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Loader2, Lock, Mail, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const { t, lang } = useLanguageContext();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const finishLogin = (userEmail: string, role: string) => {
    // Normalization to fix the "SUPER_A" truncation
    let cleanRole = role.trim().toUpperCase();
    if (cleanRole.startsWith('SUPER')) cleanRole = 'SUPER_ADMIN';
    if (cleanRole.startsWith('APP')) cleanRole = 'APP_OWNER';
    if (cleanRole.startsWith('SYS')) cleanRole = 'SYS';

    localStorage.setItem('btx_session', JSON.stringify({ email: userEmail, role: cleanRole }));
    navigate('/admin/dashboard');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      const { data: profile, error: pError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (pError) throw pError;

      finishLogin(data.user.email!, profile.role);
    } catch (err: any) {
      setErrorMsg(lang === 'en' ? 'Access Denied: Invalid Credentials' : 'ဝင်ရောက်ခွင့် ငြင်းပယ်ခံရသည်- အချက်အလက်မှားယွင်းနေသည်');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05080F] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="mx-auto h-16 w-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-6">
            <ShieldCheck className="h-8 w-8 text-emerald-500" />
          </div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter">
            Britium <span className="text-emerald-500">Express</span>
          </h1>
          <p className="text-[10px] font-mono text-slate-500 tracking-widest uppercase">
            {t('Secure Gateway • Authorized Personnel Only', 'လုံခြုံရေးဂိတ် • ခွင့်ပြုချက်ရသူများသာ')}
          </p>
        </div>

        <Card className="bg-[#0B101B] border-white/5 shadow-2xl rounded-3xl overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-600 to-emerald-400" />
          <CardContent className="p-8">
            <form onSubmit={handleLogin} className="space-y-6">
              {errorMsg && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 text-rose-400">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <p className="text-xs font-bold uppercase">{errorMsg}</p>
                </div>
              )}
              <div className="space-y-4">
                <Input 
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/5 border-white/10 text-white h-14 rounded-xl"
                  placeholder={lang === 'en' ? "Corporate Email" : "အီးမေးလ်"}
                />
                <Input 
                  type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/5 border-white/10 text-white h-14 rounded-xl"
                  placeholder={lang === 'en' ? "Password" : "စကားဝှက်"}
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full h-14 bg-emerald-600 hover:bg-emerald-500">
                {loading ? <Loader2 className="animate-spin" /> : t('Authenticate', 'အကောင့်ဝင်မည်')}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
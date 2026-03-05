// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { supabase, setRememberMe, getRememberMe } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Download, ArrowRight, ArrowLeft, Loader2, Mail, Lock } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const { lang } = useLanguage();
  const [view, setView] = useState('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(getRememberMe());
  const [apkMeta, setApkMeta] = useState({ size: '...', updated: '...' });

  const t = (en: string, my: string) => lang === 'en' ? en : my;

  useEffect(() => {
    fetch('/android.apk', { method: 'HEAD' }).then(res => {
      const size = (parseInt(res.headers.get('content-length') || '0') / 1024 / 1024).toFixed(1);
      setApkMeta({ size: `${size} MB`, updated: res.headers.get('last-modified')?.split(' ').slice(1,4).join(' ') || 'Recent' });
    }).catch(() => {});
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setRememberMe(remember);
    const { error } = await login(email, password);
    if (error) alert(error.message);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#05080F] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="mx-auto w-24 h-24 bg-white/5 rounded-[2rem] flex items-center justify-center mb-6 border border-white/10 shadow-2xl">
            <img src="/logo.png" className="h-16 w-16" alt="Britium" />
          </div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Enterprise Portal</h1>
        </div>

        <Card className="bg-[#111622] rounded-[2.5rem] border border-white/10 overflow-hidden shadow-3xl">
          <div className="h-1.5 w-full bg-emerald-500" />
          <CardContent className="p-8 space-y-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-4 h-5 w-5 text-slate-500" />
                <Input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="pl-12 h-14 bg-black/40 border-white/10 rounded-2xl text-white" />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-4 h-5 w-5 text-slate-500" />
                <Input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="pl-12 h-14 bg-black/40 border-white/10 rounded-2xl text-white" />
              </div>
              <label className="flex items-center gap-2 text-xs text-slate-400">
                <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} className="accent-emerald-500" /> {t('Remember me', 'မှတ်ထားမည်')}
              </label>
              <Button type="submit" disabled={loading} className="w-full h-14 bg-emerald-600 hover:bg-emerald-500 rounded-2xl font-black uppercase">
                {loading ? <Loader2 className="animate-spin" /> : <>Authenticate <ArrowRight className="ml-2 h-5 w-5" /></>}
              </Button>
            </form>

            <div className="flex justify-between gap-4">
               <Button variant="ghost" onClick={() => setView('request')} className="text-slate-400 text-xs"><ArrowLeft className="mr-2 h-4 w-4" /> Previous</Button>
               <Button variant="ghost" className="text-slate-400 text-xs">Next <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </div>

            <Separator className="bg-white/5" />

            <a href="/android.apk" download className="flex flex-col items-center justify-center p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all">
              <div className="flex items-center gap-2 text-white font-black uppercase text-xs">
                <Download className="h-4 w-4" /> Download APK
              </div>
              <div className="text-[10px] text-slate-500 mt-1 font-mono">{apkMeta.size} • {apkMeta.updated}</div>
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Mail, Lock, User, ArrowLeft, Globe } from 'lucide-react';

export default function SignUp() {
  const navigate = useNavigate();
  const { toggleLang, lang } = useLanguage();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      alert(lang === 'en' ? 'Access request submitted to platform administrators.' : 'အကောင့်ဖွင့်ရန် တောင်းဆိုမှု အောင်မြင်ပါသည်။');
      navigate('/login');
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#05080F] p-4 relative">
      <div className="relative z-10 w-full max-w-md flex flex-col items-center">
        <h1 className="text-4xl font-black text-white uppercase mb-8">Request Access</h1>
        <form onSubmit={handleSignup} className="w-full space-y-6 bg-[#111622] p-8 rounded-3xl border border-white/5">
          <Input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required className="h-14 bg-black/40 rounded-2xl pl-4 text-white" />
          <Input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} required className="h-14 bg-black/40 rounded-2xl pl-4 text-white" />
          <Input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className="h-14 bg-black/40 rounded-2xl pl-4 text-white" />
          <Button type="submit" disabled={isLoading} className="w-full h-14 bg-emerald-600 rounded-2xl font-black uppercase">Submit Request</Button>
          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => navigate('/login')} className="text-slate-400"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
            <Button variant="ghost" onClick={toggleLang} className="text-slate-400"><Globe className="mr-2 h-4 w-4" /> {lang === 'en' ? 'MY' : 'EN'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

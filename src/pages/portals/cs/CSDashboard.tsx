import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/supabase';
import { Search, Phone, MapPin, Package, ShieldCheck, Loader2 } from 'lucide-react';

export default function CSDashboard() {
  const { lang } = useLanguage();
  const [query, setQuery] = useState('');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const t = (en: string, my: string) => (lang === 'en' ? en : my);

  const onSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Search by Tracking ID or Phone
    const { data: res } = await supabase
      .from('shipments')
      .select('*')
      .or(`tracking_number.eq.${query.toUpperCase()},recipient_phone.eq.${query}`)
      .single();
    setData(res);
    setLoading(false);
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <header className="flex items-center gap-4">
        <div className="w-12 h-12 bg-sky-500/10 rounded-2xl flex items-center justify-center text-sky-500 border border-sky-500/20">
          <Phone size={24} />
        </div>
        <h1 className="text-2xl font-black text-white uppercase tracking-widest">{t("CS Control Node", "ဖောက်သည်ဝန်ဆောင်မှုဌာန")}</h1>
      </header>

      <div className="bg-[#0E1525] border border-white/5 p-8 rounded-[2.5rem] shadow-2xl">
        <form onSubmit={onSearch} className="relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" />
          <input 
            value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder={t("Enter Tracking ID or Phone Number...", "ခြေရာခံနံပါတ် သို့မဟုတ် ဖုန်းထည့်ပါ...")}
            className="w-full bg-[#05080F] border border-white/10 rounded-2xl pl-16 pr-6 py-5 text-white outline-none focus:border-sky-500 font-mono uppercase"
          />
        </form>
      </div>

      {data && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in slide-in-from-bottom-4">
          <div className="bg-[#0E1525] border border-white/5 p-6 rounded-[2rem]">
            <p className="text-[10px] font-black text-sky-500 uppercase tracking-widest mb-4">Shipment Details</p>
            <h2 className="text-2xl font-black text-white mb-2">{data.tracking_number}</h2>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-[10px] font-black uppercase">
              <ShieldCheck size={12}/> {data.status}
            </div>
          </div>
          <div className="bg-[#0E1525] border border-white/5 p-6 rounded-[2rem]">
            <p className="text-[10px] font-black text-sky-500 uppercase tracking-widest mb-4">Consignee Info</p>
            <p className="text-white font-bold">{data.recipient_name}</p>
            <p className="text-sm text-slate-400 mt-1">{data.delivery_address}</p>
          </div>
        </div>
      )}
    </div>
  );
}

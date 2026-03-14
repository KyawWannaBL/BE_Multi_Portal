import React, { useState } from 'react';
import { AdminShell } from '@/components/layout/AdminShell';
import { useLanguage } from '@/contexts/LanguageContext';
import { Send, Smartphone, MessageCircle, Megaphone, Users } from 'lucide-react';

export default function MarketingBlast() {
  const { lang } = useLanguage();
  const t = (en: string, my: string) => (lang === 'en' ? en : my);
  const [msg, setMsg] = useState("");

  return (
    <AdminShell title={t("Marketing Center", "စျေးကွက်ရှာဖွေရေး")}>
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 animate-in fade-in duration-500">
        
        {/* SMS Composer */}
        <div className="xl:col-span-7 space-y-6">
          <div className="bg-[#0E1525] border border-white/5 p-8 rounded-[2.5rem] shadow-2xl">
            <h3 className="text-xs font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
              <Megaphone className="h-4 w-4 text-blue-500" /> {t("Create SMS Blast", "SMS အများအပြားပို့ရန်")}
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Target Audience</label>
                 <select className="w-full bg-[#05080F] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 outline-none">
                    <option>All Merchants</option>
                    <option>All Sub-Stations</option>
                    <option>Top 100 Customers</option>
                 </select>
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Message Template</label>
                 <textarea 
                   rows={6}
                   value={msg}
                   onChange={(e) => setMsg(e.target.value)}
                   className="w-full bg-[#05080F] border border-white/10 rounded-xl px-4 py-4 text-sm text-white focus:border-blue-500 outline-none resize-none" 
                   placeholder="Type your promotion or update message here..." 
                 />
                 <p className="text-right text-[10px] text-gray-600 font-bold">{msg.length}/160 Characters</p>
              </div>

              <button className="w-full h-14 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-600/20">
                <Send size={16} /> Send SMS Blast Now
              </button>
            </div>
          </div>
        </div>

        {/* Live Preview */}
        <div className="xl:col-span-5 flex flex-col items-center justify-center">
           <div className="w-[280px] h-[580px] bg-[#05080F] border-[8px] border-gray-800 rounded-[3rem] p-4 relative shadow-2xl overflow-hidden">
              <div className="w-1/3 h-1.5 bg-gray-800 rounded-full mx-auto mb-8" />
              <div className="space-y-4">
                 <div className="bg-blue-600 p-4 rounded-2xl text-xs text-white max-w-[80%] float-left">
                    {msg || "Your message preview will appear here..."}
                 </div>
              </div>
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-10 h-10 border-2 border-gray-800 rounded-full" />
           </div>
           <p className="mt-6 text-[10px] text-gray-600 font-black uppercase tracking-widest">Real-time Mobile Preview</p>
        </div>
      </div>
    </AdminShell>
  );
}

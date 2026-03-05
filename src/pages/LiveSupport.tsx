import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  MessageSquare, Send, Phone, User, 
  Globe, Search, CheckCheck, Clock, 
  Headset, ShieldCheck 
} from 'lucide-react';

export default function LiveSupport() {
  const { toggleLang, lang } = useLanguage();
  const [activeChat, setActiveChat] = useState(0);

  const chats = [
    { id: 1, name: 'Zayar Min', role: 'RIDER', msg: 'I am at the Yangon Hub now.', time: '2m ago', online: true },
    { id: 2, name: 'Premium Fashion', role: 'MERCHANT', msg: 'When is the next pickup?', time: '5m ago', online: true },
    { id: 3, name: 'Kyaw Kyaw', role: 'RIDER', msg: 'Customer not answering.', time: '12m ago', online: false }
  ];

  return (
    <div className="flex h-screen bg-[#0B101B] text-slate-300 overflow-hidden">
      {/* Inbox Surveillance (ဝင်စာ စောင့်ကြည့်မှု) */}
      <div className="w-96 bg-[#05080F] border-r border-white/5 flex flex-col">
        <div className="p-8 border-b border-white/5">
          <h1 className="text-2xl font-black text-white flex items-center gap-3 italic">
            <Headset className="text-emerald-500" /> {lang === 'en' ? 'Support Hub' : 'အကူအညီပေးရေးဗဟို'}
          </h1>
          <div className="mt-6 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input className="w-full bg-[#0B101B] border border-white/10 rounded-xl h-12 pl-12 text-sm" placeholder="Search Chats..." />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {chats.map((chat, i) => (
            <div 
              key={chat.id} 
              onClick={() => setActiveChat(i)}
              className={`p-6 border-b border-white/5 cursor-pointer transition-all ${activeChat === i ? 'bg-emerald-500/5 border-r-4 border-r-emerald-500' : 'hover:bg-white/5'}`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                      <User size={18} />
                    </div>
                    {chat.online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#05080F]"></div>}
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">{chat.name}</p>
                    <p className="text-[10px] text-sky-400 font-mono uppercase">{chat.role}</p>
                  </div>
                </div>
                <span className="text-[10px] text-slate-600 font-mono">{chat.time}</span>
              </div>
              <p className="text-xs text-slate-500 truncate">{chat.msg}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Active Conversation (လက်ရှိ စကားပြောဆိုမှု) */}
      <div className="flex-1 flex flex-col relative">
        <div className="absolute top-8 right-8 z-50">
          <Button onClick={toggleLang} className="bg-white/5 border border-white/10 text-white h-12 px-6 rounded-xl">
             <Globe className="mr-2 h-4 w-4" /> {lang === 'en' ? "မြန်မာစာ" : "English"}
          </Button>
        </div>

        {/* Chat Header */}
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-[#05080F]/50 backdrop-blur-xl">
          <div className="flex items-center gap-4">
             <h2 className="text-xl font-black text-white">{chats[activeChat].name}</h2>
             <span className="bg-emerald-500/10 text-emerald-500 text-[10px] font-black px-3 py-1 rounded-full uppercase">Verified User</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="h-12 w-12 border-white/10 rounded-xl"><Phone size={18}/></Button>
            <Button variant="outline" className="h-12 w-12 border-white/10 rounded-xl"><ShieldCheck size={18} className="text-emerald-500"/></Button>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 p-10 space-y-6 overflow-y-auto bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30">
          <div className="flex justify-start">
            <div className="bg-[#05080F] p-4 rounded-2xl rounded-tl-none border border-white/5 max-w-md">
              <p className="text-sm text-slate-300">{chats[activeChat].msg}</p>
              <div className="flex items-center gap-2 mt-2">
                <Clock size={10} className="text-slate-600"/>
                <span className="text-[8px] text-slate-600 uppercase font-mono">{chats[activeChat].time}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Message Input (စာသားရိုက်ထည့်ရန်) */}
        <div className="p-8 bg-[#05080F] border-t border-white/5">
          <div className="flex gap-4 max-w-5xl mx-auto">
            <input 
              className="flex-1 bg-[#0B101B] border border-white/10 rounded-2xl h-16 px-8 text-white outline-none focus:border-emerald-500" 
              placeholder={lang === 'en' ? "Type your response..." : "အကြောင်းပြန်ရန် စာရိုက်ပါ..."} 
            />
            <Button className="h-16 w-16 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl shadow-xl shadow-emerald-900/20">
              <Send size={24} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

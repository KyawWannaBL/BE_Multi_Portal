import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Printer, Share2, Globe, CheckCircle } from 'lucide-react';

export default function AuditReports() {
  const { toggleLang, lang } = useLanguage();

  return (
    <div className="p-10 space-y-10 bg-[#0B101B] min-h-screen text-slate-300">
      <div className="flex justify-between items-center bg-[#05080F] p-10 rounded-[3rem] border border-white/5 shadow-2xl">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20"><FileText className="h-8 w-8 text-emerald-500"/></div>
          <div>
            <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">Executive Audit Reports</h1>
            <p className="text-emerald-500 font-mono text-xs mt-1 uppercase tracking-widest">{lang === 'en' ? 'L5_BOARD_OF_DIRECTORS_EXPORT' : 'အမှုဆောင်အဖွဲ့ဝင်များအတွက်_အစီရင်ခံစာ'}</p>
          </div>
        </div>
        <Button onClick={toggleLang} className="bg-emerald-600 text-white font-black h-12 px-8 rounded-xl"><Globe className="mr-2 h-4 w-4"/> {lang === 'en' ? "မြန်မာစာ" : "English"}</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="bg-[#05080F] border-none ring-1 ring-white/5 rounded-[3rem] p-10 space-y-6">
          <h2 className="text-2xl font-black text-white italic">{lang === 'en' ? 'Monthly Performance PDF' : 'လစဉ် လုပ်ငန်းဆောင်ရွက်မှု အစီရင်ခံစာ'}</h2>
          <p className="text-slate-500 text-sm leading-relaxed">{lang === 'en' ? 'Includes gross revenue, regional success rates, and rider efficiency metrics formatted for official distribution.' : 'စုစုပေါင်းဝင်ငွေ၊ ဒေသအလိုက်အောင်မြင်မှုနှုန်းနှင့် ဝန်ထမ်းစွမ်းဆောင်ရည်များကို တရားဝင်ထုတ်ပြန်ရန် ပုံစံပြုထားပါသည်။'}</p>
          <div className="flex gap-4 pt-4">
             <Button className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black h-14 rounded-2xl"><Download className="mr-2 h-5 w-5"/> Export PDF</Button>
             <Button variant="outline" className="h-14 w-14 border-white/10 rounded-2xl"><Printer className="h-5 w-5"/></Button>
          </div>
        </Card>

        <Card className="bg-[#05080F] border-none ring-1 ring-emerald-500/30 rounded-[3rem] p-10 flex flex-col items-center justify-center space-y-4">
          <CheckCircle className="h-16 w-16 text-emerald-500 mb-2"/>
          <h3 className="text-xl font-black text-white uppercase tracking-widest">Reports Synced</h3>
          <p className="text-slate-500 text-xs italic">Last Sync: {new Date().toLocaleTimeString()}</p>
          <Button variant="ghost" className="text-emerald-500 font-black flex items-center gap-2"><Share2 size={16}/> Secure Share to Board</Button>
        </Card>
      </div>
    </div>
  );
}

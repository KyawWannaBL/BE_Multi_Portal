import React from 'react';
import { MerchantShell } from '@/components/layout/MerchantShell';
import { useLanguage } from '@/contexts/LanguageContext';
import { UploadCloud, FileSpreadsheet, CheckCircle2 } from 'lucide-react';

export default function MerchantBulkUpload() {
  const { lang } = useLanguage();
  const t = (en: string, my: string) => (lang === 'en' ? en : my);

  return (
    <MerchantShell title={t("Bulk Orders", "အော်ဒါအများအပြားတင်ရန်")}>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        <div className="bg-[#0E1525] border border-white/5 p-8 rounded-[2rem] text-center space-y-6">
          <h2 className="text-2xl font-black text-white">{t("Upload Excel Manifest", "Excel ဖိုင်ဖြင့် အော်ဒါတင်ရန်")}</h2>
          <p className="text-xs text-gray-400 max-w-lg mx-auto leading-relaxed">
            {t("Save time by uploading up to 500 orders at once. Download our standard template, fill in your customer details, and upload it here.", "အော်ဒါ ၅၀၀ အထိ တစ်ကြိမ်တည်းဖြင့် အလွယ်တကူတင်နိုင်ပါသည်။ စံသတ်မှတ်ထားသော Excel ဖိုင်ကို ဒေါင်းလုဒ်ရယူပြီး အချက်အလက်များဖြည့်သွင်းပါ။")}
          </p>

          <button className="px-6 py-3 bg-[#0A0F1C] border border-white/10 hover:border-indigo-500 text-indigo-400 rounded-xl transition-all text-xs font-bold uppercase tracking-widest flex items-center gap-2 mx-auto">
            <FileSpreadsheet className="h-4 w-4" /> Download Standard .XLSX Template
          </button>

          <div className="border-2 border-dashed border-indigo-500/30 hover:border-indigo-500 bg-indigo-500/5 rounded-[2rem] p-12 flex flex-col items-center justify-center cursor-pointer transition-colors group mt-8">
            <UploadCloud className="h-16 w-16 text-indigo-500/50 group-hover:text-indigo-400 mb-4 transition-colors" />
            <p className="text-sm font-bold uppercase text-white tracking-widest mb-2">{t('Drag & Drop Excel File Here', 'ဖိုင်ကို ဤနေရာသို့ ဆွဲထည့်ပါ')}</p>
            <p className="text-xs text-gray-500">or click to browse from your computer</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Auto-AWB Generation</span>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Smart COD Calc</span>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Route Prediction</span>
          </div>
        </div>

      </div>
    </MerchantShell>
  );
}

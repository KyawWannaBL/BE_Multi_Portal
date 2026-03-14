import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  ArrowLeft, QrCode, ScanBarcode, 
  CheckCircle2, AlertCircle, Loader2, 
  Package, Send, ArchiveRestore 
} from 'lucide-react';

type ScanAction = 'INBOUND_HUB' | 'OUT_FOR_DELIVERY' | 'SORTING';

interface ScannedItem {
  awb: string;
  status: 'SUCCESS' | 'ERROR';
  message: string;
  timestamp: Date;
}

export default function QROpsScanPage() {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const t = (en: string, my: string) => (lang === 'en' ? en : my);

  const [scanAction, setScanAction] = useState<ScanAction>('INBOUND_HUB');
  const [awbInput, setAwbInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [scannedLog, setScannedLog] = useState<ScannedItem[]>([]);
  
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep focus on input for rapid barcode scanner gun usage
  useEffect(() => {
    inputRef.current?.focus();
  }, [scanAction, isProcessing]);

  const handleScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const scannedCode = awbInput.trim().toUpperCase();
    if (!scannedCode) return;

    setIsProcessing(true);
    setAwbInput(''); // Clear input immediately for next scan

    // Mock API Call for processing the scan
    setTimeout(() => {
      const isSuccess = Math.random() > 0.1; // 90% success rate mock
      
      setScannedLog(prev => [{
        awb: scannedCode,
        status: isSuccess ? 'SUCCESS' : 'ERROR',
        message: isSuccess ? 'Status updated successfully' : 'Invalid AWB or Network Error',
        timestamp: new Date()
      }, ...prev]);
      
      setIsProcessing(false);
    }, 400);
  };

  const activeActionDetails = {
    INBOUND_HUB: { color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/50', icon: <ArchiveRestore className="h-5 w-5" /> },
    OUT_FOR_DELIVERY: { color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/50', icon: <Send className="h-5 w-5" /> },
    SORTING: { color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/50', icon: <Package className="h-5 w-5" /> }
  }[scanAction];

  return (
    <div className="min-h-screen bg-[#0A0F1C] text-slate-200 font-sans selection:bg-blue-500/30">
      
      {/* 🌐 App Bar */}
      <header className="px-8 py-5 flex items-center gap-4 border-b border-white/5 bg-[#0A0F1C]/90 backdrop-blur-md sticky top-0 z-50">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 bg-[#0E1525] rounded-full border border-white/5 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-sm font-black uppercase tracking-widest text-white">
            {t('Rapid QR Scan Station', 'QR စကင်ဖတ်ရန်နေရာ')}
          </h1>
          <p className="text-[10px] text-blue-500 font-bold tracking-[0.2em] uppercase">
            {t('Operations Core', 'လုပ်ငန်းလည်ပတ်မှုဗဟို')}
          </p>
        </div>
      </header>

      <main className="p-8 max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 mt-4">
        
        {/* LEFT COLUMN: Controls & Scanner */}
        <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-left-8 duration-500">
          
          <div>
            <h2 className="text-3xl font-black text-white leading-tight">
              {t('Bulk Scan', 'အများအပြားစကင်ဖတ်ရန်')} <br/>
              <span className="text-blue-500">{t('Parcels.', 'ပါဆယ်များ')}</span>
            </h2>
            <p className="text-xs text-gray-500 mt-3 leading-relaxed">
              {t('Select the target status, then use a barcode scanner or camera to rapid-scan AWBs.', 'အခြေအနေကိုရွေးချယ်ပြီး ဘားကုဒ်စကင်နာဖြင့် အမြန်စကင်ဖတ်ပါ။')}
            </p>
          </div>

          {/* Action Selector */}
          <div className="space-y-3">
            <label className="text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase px-2">
              {t('Target Status', 'ပြောင်းလဲမည့်အခြေအနေ')}
            </label>
            <div className="grid grid-cols-1 gap-3">
              {(['INBOUND_HUB', 'OUT_FOR_DELIVERY', 'SORTING'] as ScanAction[]).map((action) => (
                <button
                  key={action}
                  onClick={() => setScanAction(action)}
                  className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                    scanAction === action 
                      ? `bg-[#0E1525] border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.15)]` 
                      : `bg-[#0A0F1C] border-white/5 hover:border-gray-600 opacity-60`
                  }`}
                >
                  <div className={`p-2 rounded-xl ${scanAction === action ? activeActionDetails.bg : 'bg-gray-800'}`}>
                    <div className={scanAction === action ? activeActionDetails.color : 'text-gray-500'}>
                      {action === 'INBOUND_HUB' && <ArchiveRestore className="h-5 w-5" />}
                      {action === 'OUT_FOR_DELIVERY' && <Send className="h-5 w-5" />}
                      {action === 'SORTING' && <Package className="h-5 w-5" />}
                    </div>
                  </div>
                  <span className={`text-sm font-bold tracking-widest uppercase ${scanAction === action ? 'text-white' : 'text-gray-500'}`}>
                    {t(action.replace(/_/g, ' '), action === 'INBOUND_HUB' ? 'ဂိုဒေါင်သို့ရောက်ရှိ' : action === 'OUT_FOR_DELIVERY' ? 'ပို့ဆောင်ရန်ထွက်ခွာ' : 'ခွဲခြားနေဆဲ')}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Scanner Input Area */}
          <form onSubmit={handleScanSubmit} className={`relative bg-[#0E1525] rounded-3xl p-6 border-2 transition-all ${activeActionDetails.border} shadow-2xl`}>
            <div className="flex justify-between items-center mb-4">
              <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold flex items-center gap-2">
                <ScanBarcode className="h-4 w-4" /> {t('Awaiting Scan / Input', 'စကင်ဖတ်ရန် စောင့်နေပါသည်')}
              </label>
              {isProcessing && <Loader2 className="h-4 w-4 animate-spin text-blue-500" />}
            </div>
            
            <input 
              ref={inputRef}
              value={awbInput}
              onChange={(e) => setAwbInput(e.target.value)}
              disabled={isProcessing}
              className={`w-full bg-[#0A0F1C] border border-white/10 rounded-2xl text-2xl font-mono font-bold text-white placeholder:text-gray-700 outline-none uppercase py-6 px-6 focus:border-blue-500/50 transition-colors disabled:opacity-50`} 
              placeholder="SCAN BARCODE..."
              autoFocus
            />
            <button type="submit" className="hidden">Submit</button>
            <p className="text-[10px] text-center text-gray-600 mt-4 uppercase tracking-widest">
              {t('Scanner Gun Auto-Submits on Enter', 'ဘားကုဒ်စကင်နာသုံးပါက အလိုအလျောက် အလုပ်လုပ်ပါမည်')}
            </p>
          </form>

        </div>

        {/* RIGHT COLUMN: Scan Logs */}
        <div className="lg:col-span-7 bg-[#0E1525] border border-white/5 rounded-[2rem] flex flex-col overflow-hidden animate-in fade-in slide-in-from-right-8 duration-500">
          <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#0A0F1C]/50">
            <h3 className="text-xs font-black uppercase tracking-widest text-white">
              {t('Session Logs', 'ယခုလုပ်ဆောင်ချက်မှတ်တမ်း')}
            </h3>
            <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-[10px] font-bold tracking-widest">
              {scannedLog.length} {t('SCANNED', 'ခု စကင်ဖတ်ပြီး')}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar min-h-[400px]">
            {scannedLog.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-600 space-y-4 py-20">
                <QrCode className="h-16 w-16 opacity-20" />
                <p className="text-xs uppercase tracking-widest font-bold">
                  {t('No scans recorded yet.', 'မှတ်တမ်းမရှိသေးပါ။')}
                </p>
              </div>
            ) : (
              scannedLog.map((log, index) => (
                <div key={index} className={`flex items-center justify-between p-4 rounded-2xl border ${
                  log.status === 'SUCCESS' ? 'bg-[#0A0F1C] border-emerald-500/20' : 'bg-rose-950/20 border-rose-500/20'
                } transition-all animate-in slide-in-from-top-2`}>
                  <div className="flex items-center gap-4">
                    {log.status === 'SUCCESS' ? (
                      <CheckCircle2 className="h-6 w-6 text-emerald-500 shrink-0" />
                    ) : (
                      <AlertCircle className="h-6 w-6 text-rose-500 shrink-0" />
                    )}
                    <div>
                      <p className={`font-mono text-lg font-bold uppercase tracking-wider ${log.status === 'SUCCESS' ? 'text-white' : 'text-rose-400'}`}>
                        {log.awb}
                      </p>
                      <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest">
                        {log.timestamp.toLocaleTimeString()} • {log.message}
                      </p>
                    </div>
                  </div>
                  {log.status === 'SUCCESS' && (
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-lg">
                      OK
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

      </main>
    </div>
  );
}

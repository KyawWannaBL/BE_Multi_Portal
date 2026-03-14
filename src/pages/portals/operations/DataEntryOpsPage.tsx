import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  ArrowLeft, Search, AlertTriangle, 
  FileEdit, MapPin, Phone, User, 
  CheckCircle2, Loader2, RefreshCw, Send
} from 'lucide-react';

interface ExceptionItem {
  awb: string;
  issue: string;
  reportedBy: string;
  time: string;
  customerName: string;
  phone: string;
  address: string;
}

export default function DataEntryOpsPage() {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const t = (en: string, my: string) => (lang === 'en' ? en : my);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedException, setSelectedException] = useState<ExceptionItem | null>(null);
  const [loading, setLoading] = useState(false);

  // Editable Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    action: 'RESCHEDULE'
  });

  // Mock Exception Queue (NDRs)
  const [exceptions, setExceptions] = useState<ExceptionItem[]>([
    { awb: 'AWB-8821099', issue: 'Wrong Address', reportedBy: 'R-002 (Aung Htet)', time: '10 mins ago', customerName: 'U Ba', phone: '09-11122233', address: 'No 45, Unknown Street, Yangon' },
    { awb: 'AWB-8821098', issue: 'Customer Unreachable', reportedBy: 'R-005 (Kyaw Kyaw)', time: '25 mins ago', customerName: 'Daw Su', phone: '09-44455566', address: 'Bldg 2, Room 10, Mandalay' },
    { awb: 'AWB-8821097', issue: 'Refused to Accept', reportedBy: 'R-001 (Kyaw Zin)', time: '1 hour ago', customerName: 'Ko Nyi', phone: '09-77788899', address: '12th Street, Lanmadaw, Yangon' },
  ]);

  const filteredExceptions = exceptions.filter(ex => 
    ex.awb.toLowerCase().includes(searchQuery.toLowerCase()) || 
    ex.phone.includes(searchQuery)
  );

  const handleSelectException = (ex: ExceptionItem) => {
    setSelectedException(ex);
    setFormData({
      name: ex.customerName,
      phone: ex.phone,
      address: ex.address,
      action: 'RESCHEDULE'
    });
  };

  const handleResolve = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedException) return;
    
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Remove from queue upon success
      setExceptions(prev => prev.filter(ex => ex.awb !== selectedException.awb));
      setSelectedException(null);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#0A0F1C] text-slate-200 font-sans selection:bg-amber-500/30">
      
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
            {t('Data Entry & Exceptions', 'အချက်အလက်ပြင်ဆင်ခြင်း')}
          </h1>
          <p className="text-[10px] text-amber-500 font-bold tracking-[0.2em] uppercase">
            {t('Operations Core', 'လုပ်ငန်းလည်ပတ်မှုဗဟို')}
          </p>
        </div>
      </header>

      <main className="p-8 max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 mt-4 h-[calc(100vh-120px)]">
        
        {/* LEFT PANE: Exception Queue */}
        <div className="lg:col-span-5 flex flex-col bg-[#0E1525] border border-white/5 rounded-[2rem] overflow-hidden animate-in fade-in slide-in-from-left-8 duration-500">
          
          <div className="p-6 border-b border-white/5 bg-[#0A0F1C]/50 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xs font-black uppercase tracking-widest text-amber-500 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" /> {t('Pending Resolutions', 'ဖြေရှင်းရန်ကျန်ရှိသော')}
              </h2>
              <span className="px-3 py-1 bg-amber-500/10 text-amber-500 rounded-full text-[10px] font-bold tracking-widest">
                {exceptions.length} {t('QUEUED', 'ခု ကျန်ရှိ')}
              </span>
            </div>
            
            <div className="bg-[#0A0F1C] p-3 rounded-xl border border-white/5 flex items-center gap-3 focus-within:border-amber-500/50 transition-colors">
              <Search className="h-4 w-4 text-gray-500" />
              <input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-sm text-white placeholder:text-gray-600 outline-none"
                placeholder={t('Search AWB or Phone...', 'ရှာဖွေရန်...')}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {filteredExceptions.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-600 opacity-50">
                <CheckCircle2 className="h-12 w-12 mb-3" />
                <p className="text-xs uppercase tracking-widest font-bold">{t('Queue is empty', 'စာရင်းလွတ်နေပါသည်')}</p>
              </div>
            ) : (
              filteredExceptions.map(ex => (
                <button
                  key={ex.awb}
                  onClick={() => handleSelectException(ex)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all ${
                    selectedException?.awb === ex.awb 
                      ? 'bg-amber-500/10 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.15)]' 
                      : 'bg-[#0A0F1C] border-white/5 hover:border-gray-600'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`font-mono font-bold ${selectedException?.awb === ex.awb ? 'text-white' : 'text-gray-300'}`}>{ex.awb}</span>
                    <span className="text-[10px] text-gray-500">{ex.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-rose-400 text-xs font-bold mb-2">
                    <AlertTriangle className="h-3 w-3" /> {ex.issue}
                  </div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest">By: {ex.reportedBy}</p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* RIGHT PANE: Resolution Form */}
        <div className="lg:col-span-7 flex flex-col animate-in fade-in slide-in-from-right-8 duration-500">
          
          {selectedException ? (
            <div className="bg-[#0E1525] border border-white/5 rounded-[2rem] overflow-hidden flex flex-col h-full">
              
              <div className="p-6 border-b border-white/5 bg-[#0A0F1C]/50 flex items-center gap-4">
                <div className="p-3 bg-amber-500/10 rounded-xl"><FileEdit className="h-6 w-6 text-amber-500" /></div>
                <div>
                  <h2 className="text-lg font-black text-white uppercase tracking-wider">{selectedException.awb}</h2>
                  <p className="text-[10px] text-rose-400 font-bold uppercase tracking-widest">{selectedException.issue}</p>
                </div>
              </div>

              <form onSubmit={handleResolve} className="p-8 flex-1 flex flex-col justify-between overflow-y-auto custom-scrollbar space-y-6">
                
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2"><User className="h-3 w-3"/> {t('Receiver Name', 'လက်ခံသူအမည်')}</label>
                      <input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-[#0A0F1C] border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-amber-500 outline-none transition-colors" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2"><Phone className="h-3 w-3"/> {t('Contact Number', 'ဖုန်းနံပါတ်')}</label>
                      <input required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full bg-[#0A0F1C] border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-amber-500 outline-none transition-colors font-mono" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2"><MapPin className="h-3 w-3"/> {t('Corrected Address', 'ပြင်ဆင်ထားသောလိပ်စာ')}</label>
                    <textarea required value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full bg-[#0A0F1C] border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-amber-500 outline-none transition-colors min-h-[120px] resize-none" />
                  </div>

                  <div className="space-y-3 pt-4 border-t border-white/5">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t('Resolution Action', 'လုပ်ဆောင်ချက်')}</label>
                    <div className="grid grid-cols-3 gap-4">
                      <label className={`cursor-pointer p-4 rounded-xl border transition-all text-center ${formData.action === 'RESCHEDULE' ? 'bg-amber-500/20 border-amber-500 text-amber-500' : 'bg-[#0A0F1C] border-white/5 text-gray-400 hover:border-gray-500'}`}>
                        <input type="radio" name="action" value="RESCHEDULE" checked={formData.action === 'RESCHEDULE'} onChange={(e) => setFormData({...formData, action: e.target.value})} className="hidden" />
                        <RefreshCw className="h-5 w-5 mx-auto mb-2" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">{t('Reschedule', 'ရက်ရွှေ့မည်')}</span>
                      </label>
                      <label className={`cursor-pointer p-4 rounded-xl border transition-all text-center ${formData.action === 'FORWARD' ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'bg-[#0A0F1C] border-white/5 text-gray-400 hover:border-gray-500'}`}>
                        <input type="radio" name="action" value="FORWARD" checked={formData.action === 'FORWARD'} onChange={(e) => setFormData({...formData, action: e.target.value})} className="hidden" />
                        <Send className="h-5 w-5 mx-auto mb-2" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">{t('Forward', 'လွှဲပြောင်းမည်')}</span>
                      </label>
                      <label className={`cursor-pointer p-4 rounded-xl border transition-all text-center ${formData.action === 'RETURN' ? 'bg-rose-500/20 border-rose-500 text-rose-400' : 'bg-[#0A0F1C] border-white/5 text-gray-400 hover:border-gray-500'}`}>
                        <input type="radio" name="action" value="RETURN" checked={formData.action === 'RETURN'} onChange={(e) => setFormData({...formData, action: e.target.value})} className="hidden" />
                        <ArrowLeft className="h-5 w-5 mx-auto mb-2" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">{t('Return', 'ပြန်ပို့မည်')}</span>
                      </label>
                    </div>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full mt-6 h-16 bg-amber-600 hover:bg-amber-500 text-black font-black text-xs uppercase tracking-[0.2em] rounded-2xl disabled:opacity-50 transition-all flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.3)]"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : t('SAVE & RESOLVE', 'သိမ်းဆည်းမည်')}
                </button>
              </form>
            </div>
          ) : (
            <div className="h-full bg-[#0E1525] rounded-[2rem] border border-white/5 flex flex-col items-center justify-center text-gray-600 space-y-4">
              <FileEdit className="h-16 w-16 opacity-20" />
              <p className="text-xs font-bold tracking-widest uppercase">{t('Select an exception from the queue', 'စာရင်းထဲမှရွေးချယ်ပါ')}</p>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

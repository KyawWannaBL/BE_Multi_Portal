import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  ArrowLeft, FileText, Printer, Search, 
  Plus, User, MapPin, Package, Loader2, 
  CheckCircle2, AlertCircle, Phone
} from 'lucide-react';

type TabView = 'CREATE' | 'MANAGE';

interface MockAWB {
  awb: string;
  sender: string;
  receiver: string;
  status: string;
  date: string;
}

export default function WaybillCenterPage() {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const t = (en: string, my: string) => (lang === 'en' ? en : my);

  const [activeTab, setActiveTab] = useState<TabView>('CREATE');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    senderName: '',
    senderPhone: '',
    receiverName: '',
    receiverPhone: '',
    receiverAddress: '',
    weight: '1',
    serviceType: 'STANDARD'
  });

  // Mock Data
  const recentAWBs: MockAWB[] = [
    { awb: 'AWB-8821045', sender: 'Tech Store MM', receiver: 'U Aung', status: 'PRINTED', date: 'Today, 10:45 AM' },
    { awb: 'AWB-8821044', sender: 'Walk-in', receiver: 'Daw Mya', status: 'DRAFT', date: 'Today, 10:30 AM' },
    { awb: 'AWB-8821043', sender: 'Fashion Hub', receiver: 'Ko Tun', status: 'PRINTED', date: 'Today, 09:15 AM' },
  ];

  const handleGenerateAWB = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Mock API generation
    setTimeout(() => {
      setLoading(false);
      setFormData({
        senderName: '', senderPhone: '', receiverName: '', receiverPhone: '', receiverAddress: '', weight: '1', serviceType: 'STANDARD'
      });
      setActiveTab('MANAGE');
    }, 1000);
  };

  const handlePrint = (awb: string) => {
    // In production, this triggers the thermal printer API or opens a PDF blob
    console.log(`Printing AWB: ${awb}`);
  };

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
            {t('Waybill Center', 'ဘေလ်နံပါတ်ဗဟို')}
          </h1>
          <p className="text-[10px] text-blue-500 font-bold tracking-[0.2em] uppercase">
            {t('Operations Core', 'လုပ်ငန်းလည်ပတ်မှုဗဟို')}
          </p>
        </div>
      </header>

      <main className="p-8 max-w-6xl mx-auto mt-4">
        
        {/* Navigation Tabs */}
        <div className="flex bg-[#0E1525] p-1 rounded-2xl w-fit mb-8 border border-white/5">
          <button
            onClick={() => setActiveTab('CREATE')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold tracking-widest uppercase transition-all ${
              activeTab === 'CREATE' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'
            }`}
          >
            <Plus className="h-4 w-4" /> {t('Create AWB', 'ဘေလ်အသစ်ပြုလုပ်ရန်')}
          </button>
          <button
            onClick={() => setActiveTab('MANAGE')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold tracking-widest uppercase transition-all ${
              activeTab === 'MANAGE' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'
            }`}
          >
            <Printer className="h-4 w-4" /> {t('Manage & Print', 'စီမံရန်နှင့် ပရင့်ထုတ်ရန်')}
          </button>
        </div>

        {/* TAB 1: CREATE AWB */}
        {activeTab === 'CREATE' && (
          <form onSubmit={handleGenerateAWB} className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Left Column: Sender & Receiver */}
            <div className="space-y-6">
              
              <div className="bg-[#0E1525] p-6 rounded-[2rem] border border-white/5 space-y-4">
                <div className="flex items-center gap-3 mb-6">
                  <User className="h-5 w-5 text-blue-500" />
                  <h2 className="text-sm font-bold tracking-widest text-white uppercase">{t('Sender Details', 'ပေးပို့သူ အချက်အလက်')}</h2>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">{t('Name / Shop', 'အမည် / ဆိုင်အမည်')}</label>
                    <input required value={formData.senderName} onChange={(e) => setFormData({...formData, senderName: e.target.value})} className="w-full bg-[#0A0F1C] border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 outline-none transition-colors" placeholder="Walk-in Customer" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">{t('Phone Number', 'ဖုန်းနံပါတ်')}</label>
                    <input required value={formData.senderPhone} onChange={(e) => setFormData({...formData, senderPhone: e.target.value})} className="w-full bg-[#0A0F1C] border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 outline-none transition-colors font-mono" placeholder="09..." />
                  </div>
                </div>
              </div>

              <div className="bg-[#0E1525] p-6 rounded-[2rem] border border-white/5 space-y-4">
                <div className="flex items-center gap-3 mb-6">
                  <MapPin className="h-5 w-5 text-amber-500" />
                  <h2 className="text-sm font-bold tracking-widest text-white uppercase">{t('Receiver Details', 'လက်ခံသူ အချက်အလက်')}</h2>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">{t('Full Name', 'အမည်အပြည့်အစုံ')}</label>
                    <input required value={formData.receiverName} onChange={(e) => setFormData({...formData, receiverName: e.target.value})} className="w-full bg-[#0A0F1C] border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 outline-none transition-colors" placeholder="Receiver Name" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">{t('Phone Number', 'ဖုန်းနံပါတ်')}</label>
                    <input required value={formData.receiverPhone} onChange={(e) => setFormData({...formData, receiverPhone: e.target.value})} className="w-full bg-[#0A0F1C] border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 outline-none transition-colors font-mono" placeholder="09..." />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">{t('Delivery Address', 'ပို့ဆောင်ရမည့်လိပ်စာ')}</label>
                  <textarea required value={formData.receiverAddress} onChange={(e) => setFormData({...formData, receiverAddress: e.target.value})} className="w-full bg-[#0A0F1C] border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 outline-none transition-colors min-h-[100px] resize-none" placeholder="Full address..." />
                </div>
              </div>

            </div>

            {/* Right Column: Parcel & Summary */}
            <div className="space-y-6">
              
              <div className="bg-[#0E1525] p-6 rounded-[2rem] border border-white/5 space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <Package className="h-5 w-5 text-emerald-500" />
                  <h2 className="text-sm font-bold tracking-widest text-white uppercase">{t('Parcel Logistics', 'ပါဆယ် အချက်အလက်')}</h2>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">{t('Weight (KG)', 'အလေးချိန် (ကီလို)')}</label>
                    <input type="number" min="0.1" step="0.1" required value={formData.weight} onChange={(e) => setFormData({...formData, weight: e.target.value})} className="w-full bg-[#0A0F1C] border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 outline-none transition-colors font-mono" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">{t('Service Level', 'ဝန်ဆောင်မှုအမျိုးအစား')}</label>
                    <select value={formData.serviceType} onChange={(e) => setFormData({...formData, serviceType: e.target.value})} className="w-full bg-[#0A0F1C] border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 outline-none transition-colors appearance-none">
                      <option value="STANDARD">Standard (1-3 Days)</option>
                      <option value="EXPRESS">Express (Next Day)</option>
                      <option value="SAME_DAY">Same Day</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Submission Area */}
              <div className="bg-gradient-to-br from-[#0E1525] to-[#0A0F1C] p-8 rounded-[2rem] border border-blue-500/30 flex flex-col justify-center items-center text-center space-y-6">
                <div>
                  <h3 className="text-2xl font-black text-white">{t('Ready to Generate', 'ထုတ်ယူရန်အသင့်ဖြစ်ပါပြီ')}</h3>
                  <p className="text-xs text-gray-400 mt-2">{t('Review details carefully before confirming the waybill.', 'မအတည်ပြုမီ အချက်အလက်များကို သေချာစွာစစ်ဆေးပါ။')}</p>
                </div>
                
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full h-16 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl disabled:opacity-50 transition-all flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.3)]"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : t('GENERATE AWB', 'ဘေလ်ထုတ်မည်')}
                </button>
              </div>

            </div>

          </form>
        )}

        {/* TAB 2: MANAGE & PRINT */}
        {activeTab === 'MANAGE' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Search Bar */}
            <div className="bg-[#0E1525] p-4 rounded-2xl border border-white/5 flex items-center gap-4 focus-within:border-blue-500/50 transition-colors">
              <Search className="h-5 w-5 text-gray-500 ml-2" />
              <input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-sm text-white placeholder:text-gray-600 outline-none uppercase font-mono"
                placeholder="SEARCH BY AWB OR PHONE..."
              />
            </div>

            {/* List */}
            <div className="bg-[#0E1525] border border-white/5 rounded-[2rem] overflow-hidden">
              <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/5 bg-[#0A0F1C]/50 text-[10px] font-bold tracking-widest text-gray-500 uppercase">
                <div className="col-span-3">{t('AWB Number', 'ဘေလ်နံပါတ်')}</div>
                <div className="col-span-3">{t('Sender', 'ပေးပို့သူ')}</div>
                <div className="col-span-3">{t('Receiver', 'လက်ခံသူ')}</div>
                <div className="col-span-2">{t('Status', 'အခြေအနေ')}</div>
                <div className="col-span-1 text-right">{t('Action', 'လုပ်ဆောင်ချက်')}</div>
              </div>
              
              <div className="divide-y divide-white/5">
                {recentAWBs.map((awb, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-[#131C31] transition-colors">
                    <div className="col-span-3">
                      <p className="font-mono text-sm font-bold text-white">{awb.awb}</p>
                      <p className="text-[10px] text-gray-500 mt-1">{awb.date}</p>
                    </div>
                    <div className="col-span-3 text-sm text-gray-300">{awb.sender}</div>
                    <div className="col-span-3 text-sm text-gray-300">{awb.receiver}</div>
                    <div className="col-span-2">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border ${
                        awb.status === 'PRINTED' ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' : 'text-amber-500 bg-amber-500/10 border-amber-500/20'
                      }`}>
                        {awb.status}
                      </span>
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <button onClick={() => handlePrint(awb.awb)} className="p-2 bg-[#0A0F1C] border border-white/5 hover:border-blue-500 hover:text-blue-500 text-gray-400 rounded-xl transition-all">
                        <Printer className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}

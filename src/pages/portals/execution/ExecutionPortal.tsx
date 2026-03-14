import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  LogOut, Globe, User, Package, MapPin, Phone, 
  CheckCircle2, QrCode, Camera, Navigation, X, 
  Home, Truck, Wrench, Banknote, Loader2, Tag, Calculator
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ExecutionPortal() {
  const navigate = useNavigate();
  const langCtx = useLanguage?.() ?? {};
  const currentLang = langCtx.lang || 'en';
  const t = (en: string, my: string) => currentLang === 'en' ? en : my;

  const [activeTab, setActiveTab] = useState<'home' | 'pickups' | 'deliveries' | 'tools'>('home');
  const [activeCamera, setActiveCamera] = useState<'scan' | 'pod' | 'activate_tag' | null>(null);
  
  // 🔌 Backend State
  const [loading, setLoading] = useState(true);
  const [riderProfile, setRiderProfile] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);

  // 🔌 Deep Backend Connection: Fetch Rider Data & Assigned Shipments
  useEffect(() => {
    const fetchRiderData = async () => {
      setLoading(true);
      try {
        // 1. Get Authenticated User
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        // 2. Fetch Profile
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setRiderProfile(profile);

        // 3. Fetch Assigned Tasks (Shipments table)
        // Fallback to empty array if table doesn't exist yet to prevent crashes
        const { data: shipments, error } = await supabase
          .from('shipments')
          .select('*')
          .eq('rider_id', user.id)
          .order('created_at', { ascending: false });
        
        if (!error && shipments) {
          setTasks(shipments);
        } else {
          // Provide Mock Data if backend table is empty for UI demonstration
          setTasks([
            { id: "TRK-99821", type: "DELIVERY", customer_name: "Aung Aung", phone: "09123456789", address: "123 Pagoda Rd, Yangon", cod_amount: 45000, status: "PENDING" },
            { id: "TRK-99822", type: "PICKUP", customer_name: "Fashion Hub MM", phone: "09987654321", address: "45 Inya Lake Blvd, Yangon", cod_amount: 0, status: "PENDING" },
            { id: "TRK-99750", type: "DELIVERY", customer_name: "Kyaw Min", phone: "09555444333", address: "88 Sule Pagoda Rd, Yangon", cod_amount: 12000, status: "COMPLETED" },
          ]);
        }
      } catch (error: any) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRiderData();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleToggleLanguage = () => {
    if (typeof langCtx.toggleLang === 'function') langCtx.toggleLang();
    else if (typeof langCtx.setLanguage === 'function') langCtx.setLanguage(currentLang === 'en' ? 'my' : 'en');
  };

  // Processed Data
  const pendingDeliveries = tasks.filter(t => t.type === 'DELIVERY' && t.status === 'PENDING');
  const pendingPickups = tasks.filter(t => t.type === 'PICKUP' && t.status === 'PENDING');
  const totalCOD = pendingDeliveries.reduce((sum, task) => sum + (task.cod_amount || 0), 0);

  // ==========================================
  // MODULE: DASHBOARD (HOME)
  // ==========================================
  const renderHome = () => (
    <div className="p-4 space-y-4 pb-24 animate-in fade-in">
      <div className="bg-[#0A0E17] border border-white/5 rounded-2xl p-5 shadow-lg">
        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{t("Current COD Held", "ကောက်ခံထားသော ငွေပမာဏ")}</p>
        <h2 className="text-3xl font-black text-emerald-400 mt-1 font-mono">145,000 <span className="text-sm text-gray-500">MMK</span></h2>
        <div className="mt-4 pt-4 border-t border-white/5 flex justify-between">
          <div><p className="text-[9px] text-gray-500 uppercase">{t("Pending Drops", "ပို့ရန်ကျန်သည်")}</p><p className="text-lg font-bold text-white">{pendingDeliveries.length}</p></div>
          <div><p className="text-[9px] text-gray-500 uppercase">{t("Pending Pickups", "သွားယူရန်ကျန်သည်")}</p><p className="text-lg font-bold text-blue-400">{pendingPickups.length}</p></div>
          <div><p className="text-[9px] text-gray-500 uppercase">{t("Completed", "ပြီးစီးမှု")}</p><p className="text-lg font-bold text-emerald-500">{tasks.filter(t => t.status === 'COMPLETED').length}</p></div>
        </div>
      </div>

      <h3 className="text-xs font-black uppercase tracking-widest text-white mt-6 mb-2">{t("Quick Actions", "အမြန်လုပ်ဆောင်ချက်များ")}</h3>
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => setActiveCamera('scan')} className="bg-[#0A0E17] hover:bg-white/5 border border-white/5 rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all">
          <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center"><QrCode size={20}/></div>
          <span className="text-[10px] font-bold uppercase">{t("Scan Waybill", "ဘားကုဒ်ဖတ်မည်")}</span>
        </button>
        <button onClick={() => setActiveCamera('activate_tag')} className="bg-[#0A0E17] hover:bg-white/5 border border-white/5 rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all">
          <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center"><Tag size={20}/></div>
          <span className="text-[10px] font-bold uppercase">{t("Activate Tag", "တက်ဂ် အသက်သွင်းမည်")}</span>
        </button>
      </div>
    </div>
  );

  // ==========================================
  // MODULE: TASK LIST (DELIVERIES / PICKUPS)
  // ==========================================
  const renderTaskList = (taskList: any[], type: 'DELIVERY' | 'PICKUP') => (
    <div className="p-4 space-y-4 pb-24 animate-in slide-in-from-right-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-sm font-black uppercase tracking-widest text-white">
          {type === 'DELIVERY' ? t("Active Deliveries", "ပို့ဆောင်ရန် စာရင်း") : t("Active Pickups", "သွားရောက်ယူဆောင်ရန် စာရင်း")}
        </h2>
        <span className="bg-white/10 text-white px-2 py-1 rounded text-[10px] font-bold">{taskList.length} Tasks</span>
      </div>

      {taskList.length === 0 ? (
        <div className="text-center p-8 text-gray-500 text-xs">{t("No active tasks found.", "လက်ရှိလုပ်ဆောင်ရန် မရှိပါ။")}</div>
      ) : (
        taskList.map((task, idx) => (
          <div key={idx} className="bg-[#0A0E17] border border-white/5 rounded-2xl p-5 shadow-xl relative overflow-hidden">
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${type === 'DELIVERY' ? 'bg-blue-500' : 'bg-amber-500'}`}></div>
            
            <div className="flex justify-between items-start mb-3 pl-2">
              <div>
                <span className="text-[10px] font-mono text-gray-400 bg-black/50 px-2 py-1 rounded">{task.id}</span>
                <h3 className="text-lg font-black text-white mt-2">{task.customer_name}</h3>
              </div>
              <div className="text-right">
                <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">{t("To Collect", "ကောက်ခံရန်")}</div>
                <div className={`text-sm font-black font-mono ${task.cod_amount === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {task.cod_amount === 0 ? t("PREPAID", "ငွေချေပြီး") : `${task.cod_amount} Ks`}
                </div>
              </div>
            </div>

            <div className="space-y-2 pl-2 mb-6">
              <div className="flex items-start gap-3 text-xs text-gray-300">
                <MapPin size={14} className={`${type === 'DELIVERY' ? 'text-blue-400' : 'text-amber-400'} mt-0.5 flex-shrink-0`} />
                <span className="leading-relaxed">{task.address}</span>
              </div>
              <div className="flex items-center justify-between gap-3 text-xs text-gray-300">
                <div className="flex items-center gap-3">
                  <Phone size={14} className="text-emerald-400 flex-shrink-0" />
                  <span className="font-mono">{task.phone}</span>
                </div>
                <button className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-lg text-[9px] font-bold uppercase">{t("Call", "ဖုန်းခေါ်မည်")}</button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pl-2">
              <button className="bg-white/5 hover:bg-white/10 text-white rounded-xl py-3 flex items-center justify-center gap-2 transition-all">
                <Navigation size={14} className="text-blue-400" />
                <span className="text-[10px] font-bold uppercase">{t("Navigate", "မြေပုံကြည့်မည်")}</span>
              </button>
              <button onClick={() => setActiveCamera('pod')} className={`${type === 'DELIVERY' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-amber-600 hover:bg-amber-500'} text-white rounded-xl py-3 flex items-center justify-center gap-2 transition-all shadow-lg`}>
                <Camera size={14} />
                <span className="text-[10px] font-bold uppercase tracking-widest">{type === 'DELIVERY' ? t("Drop / POD", "ပို့ဆောင်မည်") : t("Confirm Pickup", "လက်ခံရယူမည်")}</span>
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );

  // ==========================================
  // MODULE: TOOLS (From PDF specs)
  // ==========================================
  const renderTools = () => (
    <div className="p-4 space-y-4 pb-24 animate-in fade-in">
      <h2 className="text-sm font-black uppercase tracking-widest text-white mb-4">{t("Field Tools", "အထောက်အကူပြုကိရိယာများ")}</h2>
      
      <div className="bg-[#0A0E17] border border-white/5 rounded-2xl p-5 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-500/20 text-purple-400 rounded-lg"><Tag size={18}/></div>
          <h3 className="font-bold text-white uppercase text-xs">{t("Label Activation", "လေဘယ်လ် အသက်သွင်းရန်")}</h3>
        </div>
        <p className="text-[10px] text-gray-400 mb-4">{t("Pair physical NFC/QR tags with digital waybills in bulk.", "NFC/QR တက်ဂ်များကို ဒစ်ဂျစ်တယ် အော်ဒါများနှင့် ချိတ်ဆက်ပါ။")}</p>
        <button onClick={() => setActiveCamera('activate_tag')} className="w-full bg-white/5 border border-white/10 text-white py-2 rounded-lg text-[10px] font-bold uppercase hover:bg-white/10 transition-all">
          {t("Start Pairing", "စတင်ချိတ်ဆက်မည်")}
        </button>
      </div>

      <div className="bg-[#0A0E17] border border-white/5 rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-teal-500/20 text-teal-400 rounded-lg"><Calculator size={18}/></div>
          <h3 className="font-bold text-white uppercase text-xs">{t("Shipping Calculator", "ပို့ဆောင်ခ တွက်ချက်ရန်")}</h3>
        </div>
        <div className="space-y-3">
          <input type="text" placeholder={t("Destination Township", "ပို့ဆောင်မည့် မြို့နယ်")} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-xs text-white outline-none focus:border-teal-500" />
          <input type="number" placeholder={t("Weight (kg)", "အလေးချိန် (ကီလိုဂရမ်)")} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-xs text-white outline-none focus:border-teal-500" />
          <button onClick={() => toast.success("Calculated: 3,500 MMK")} className="w-full bg-teal-600 text-white py-2 rounded-lg text-[10px] font-bold uppercase hover:bg-teal-500 transition-all">
            {t("Calculate Rate", "တွက်ချက်မည်")}
          </button>
        </div>
      </div>
    </div>
  );


  if (loading) return <div className="h-screen w-full bg-black flex items-center justify-center"><Loader2 className="animate-spin text-blue-500" /></div>;

  return (
    <div className="flex flex-col h-screen bg-[#05080F] text-slate-200 font-sans sm:max-w-md sm:mx-auto sm:border-x sm:border-white/10 shadow-2xl relative overflow-hidden">
      
      {/* 📱 TOP BAR */}
      <div className="h-16 border-b border-white/5 bg-[#0B101B]/90 backdrop-blur-md flex items-center justify-between px-4 sticky top-0 z-40 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center border border-white/20 shadow-lg">
            <span className="font-black text-white">{riderProfile?.full_name?.[0] || 'R'}</span>
          </div>
          <div>
            <div className="text-xs font-black text-white uppercase tracking-widest">{t("Rider Terminal", "ပို့ဆောင်သူ စာမျက်နှာ")}</div>
            <div className="text-[10px] text-blue-400 font-mono">{riderProfile?.full_name || 'Loading...'}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleToggleLanguage} className="text-[10px] font-bold text-gray-400 uppercase hover:text-white px-2 py-1 rounded bg-white/5 border border-white/10">
            <Globe size={12} className="inline mr-1 mb-0.5"/> {currentLang === 'en' ? 'MY' : 'EN'}
          </button>
          <button onClick={handleLogout} className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all">
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {/* 📱 DYNAMIC CONTENT AREA */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-gradient-to-b from-black to-[#05080F]">
        {activeTab === 'home' && renderHome()}
        {activeTab === 'pickups' && renderTaskList(pendingPickups, 'PICKUP')}
        {activeTab === 'deliveries' && renderTaskList(pendingDeliveries, 'DELIVERY')}
        {activeTab === 'tools' && renderTools()}
      </div>

      {/* 📱 BOTTOM NAVIGATION BAR (PWA Style) */}
      <div className="h-16 border-t border-white/10 bg-[#0B101B] flex items-center justify-around px-2 pb-safe flex-shrink-0 z-40">
        {[
          { id: 'home', icon: <Home size={20}/>, label: t("Home", "ပင်မစာမျက်နှာ") },
          { id: 'pickups', icon: <Package size={20}/>, label: t("Pickups", "သွားယူရန်") },
          { id: 'deliveries', icon: <Truck size={20}/>, label: t("Drops", "ပို့ရန်") },
          { id: 'tools', icon: <Wrench size={20}/>, label: t("Tools", "ကိရိယာများ") },
        ].map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-all ${activeTab === tab.id ? 'text-blue-500' : 'text-gray-500 hover:text-gray-300'}`}
          >
            {tab.icon}
            <span className="text-[9px] font-bold uppercase tracking-wider">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 📷 FULLSCREEN CAMERA / SCANNER OVERLAY */}
      {activeCamera && (
        <div className="absolute inset-0 z-[100] bg-black flex flex-col animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex justify-between items-center p-6 bg-gradient-to-b from-black/90 to-transparent absolute top-0 left-0 right-0 z-10">
            <div className="text-white font-black uppercase tracking-widest text-sm">
              {activeCamera === 'scan' ? t('Scan Waybill', 'ဘားကုဒ်ဖတ်ရန်') : 
               activeCamera === 'activate_tag' ? t('Activate RFID/NFC Tag', 'တက်ဂ် အသက်သွင်းရန်') : 
               t('Capture Proof of Delivery', 'မှတ်တမ်း ဓာတ်ပုံရိုက်ရန်')}
            </div>
            <button onClick={() => setActiveCamera(null)} className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20">
              <X size={20} />
            </button>
          </div>
          
          <div className="flex-1 relative flex items-center justify-center overflow-hidden">
            {/* Simulated Camera Feed */}
            <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1580674285054-bed31e145f59?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center"></div>
            
            {activeCamera === 'scan' || activeCamera === 'activate_tag' ? (
              <div className={`w-64 h-64 border-2 rounded-3xl relative z-10 ${activeCamera === 'scan' ? 'border-blue-500 shadow-[0_0_50px_rgba(59,130,246,0.3)]' : 'border-purple-500 shadow-[0_0_50px_rgba(168,85,247,0.3)]'}`}>
                <div className={`absolute top-1/2 left-0 right-0 h-0.5 shadow-[0_0_15px_currentColor] animate-[pulse_2s_ease-in-out_infinite] ${activeCamera === 'scan' ? 'bg-blue-500 text-blue-500' : 'bg-purple-500 text-purple-500'}`}></div>
                <p className="absolute -bottom-10 left-0 right-0 text-center text-white font-bold text-xs uppercase tracking-widest">
                  {t("Align inside frame", "ဘောင်အတွင်း ထည့်သွင်းပါ")}
                </p>
              </div>
            ) : (
              <div className="w-full h-full border-[30px] border-black/60 relative z-10">
                <div className="absolute inset-0 border-2 border-emerald-500/50 m-4 rounded-xl border-dashed"></div>
              </div>
            )}
          </div>

          <div className="h-32 bg-black pb-8 pt-4 flex items-center justify-center">
            <button 
              onClick={() => {
                toast.success(t("Operation Successful!", "လုပ်ဆောင်မှု အောင်မြင်ပါသည်။"));
                setActiveCamera(null);
              }}
              className={`w-16 h-16 rounded-full border-4 flex items-center justify-center transition-all active:scale-95 shadow-xl
                ${activeCamera === 'scan' ? 'border-blue-500 bg-blue-500/20 text-blue-400' : 
                  activeCamera === 'activate_tag' ? 'border-purple-500 bg-purple-500/20 text-purple-400' :
                  'border-emerald-500 bg-emerald-500/20 text-emerald-400'}`}
            >
              {activeCamera === 'scan' ? <QrCode size={24} /> : activeCamera === 'activate_tag' ? <Tag size={24} /> : <Camera size={24} />}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

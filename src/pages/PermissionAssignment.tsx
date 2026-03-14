import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  ArrowLeft, Key, ShieldCheck, Search, 
  Lock, Edit3, CheckCircle2, ShieldAlert, 
  Layers, Users, Server, Loader2
} from 'lucide-react';

interface RoleClearance {
  id: string;
  name: string;
  level: string;
  userCount: number;
  description: string;
  portals: string[];
  isSystem: boolean;
}

export default function PermissionAssignment() {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const t = (en: string, my: string) => (lang === 'en' ? en : my);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<RoleClearance | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editLevel, setEditLevel] = useState('');

  // Mock RBAC Data mapping to your App.tsx SecurityGateway
  const [roles, setRoles] = useState<RoleClearance[]>([
    { id: 'SUPER_ADMIN', name: 'Super Administrator', level: 'L5', userCount: 2, isSystem: true, description: 'Absolute system control. Can bypass all routing rules.', portals: ['Executive Command', 'Audit Logs', 'Account Control', 'Permissions'] },
    { id: 'HUB_MANAGER', name: 'Branch/Hub Manager', level: 'L4', userCount: 15, isSystem: false, description: 'Full oversight of a specific geographical branch.', portals: ['Branch Portal', 'Operations', 'Supervisor Overrides'] },
    { id: 'FINANCE_SENIOR', name: 'Senior Finance Officer', level: 'L4', userCount: 4, isSystem: false, description: 'Access to financial reconciliation and master ledgers.', portals: ['Finance Portal', 'Reconciliation', 'Reporting'] },
    { id: 'OPT_MGR', name: 'Operations Manager', level: 'L3', userCount: 12, isSystem: false, description: 'Manages daily field and warehouse operations.', portals: ['Operations Portal', 'Fleet Tracking', 'Waybill Center'] },
    { id: 'DATA_ENTRY', name: 'Data Entry Clerk', level: 'L2', userCount: 45, isSystem: false, description: 'Counter staff for walk-ins and manual exception resolution.', portals: ['Manual Data Entry', 'Waybill Creation'] },
    { id: 'RIDER', name: 'Field Execution (Rider)', level: 'L1', userCount: 214, isSystem: false, description: 'Mobile access for pickups, deliveries, and drop-offs.', portals: ['Execution Portal', 'Driver Wallet'] },
  ]);

  const filteredRoles = roles.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectRole = (role: RoleClearance) => {
    setSelectedRole(role);
    setEditLevel(role.level);
    setIsEditing(false);
  };

  const handleSaveChanges = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;
    
    setLoading(true);
    setTimeout(() => {
      setRoles(prev => prev.map(r => 
        r.id === selectedRole.id ? { ...r, level: editLevel } : r
      ));
      setSelectedRole(prev => prev ? { ...prev, level: editLevel } : null);
      setIsEditing(false);
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#05080F] text-slate-200 font-sans selection:bg-[#D4AF37]/30 pb-10">
      
      {/* 👑 Executive App Bar */}
      <header className="sticky top-0 z-50 bg-[#05080F]/90 backdrop-blur-xl border-b border-[#D4AF37]/20 px-8 py-5 flex items-center gap-4">
        <button 
          onClick={() => navigate('/portal/admin')} 
          className="p-2 bg-[#1A1500] rounded-full border border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-sm font-black text-white tracking-widest uppercase">
            {t('Permissions & RBAC', 'လုပ်ပိုင်ခွင့်များသတ်မှတ်ရန်')}
          </h1>
          <p className="text-[10px] text-[#D4AF37] tracking-[0.2em] uppercase font-bold flex items-center gap-2 mt-1">
            <Key className="h-3 w-3" /> {t('Access Control Matrix', 'ဝင်ရောက်ခွင့်ထိန်းချုပ်မှု')}
          </p>
        </div>
      </header>

      <main className="p-8 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 mt-4 h-[calc(100vh-120px)]">
        
        {/* LEFT PANE: Role Directory */}
        <div className="lg:col-span-4 flex flex-col bg-[#0E1525] border border-white/5 rounded-[2rem] overflow-hidden animate-in fade-in slide-in-from-left-8 duration-500 shadow-2xl">
          
          <div className="p-6 border-b border-white/5 bg-[#0A0F1C]/50 space-y-4">
            <h2 className="text-xs font-black uppercase tracking-widest text-[#D4AF37]">
              {t('System Roles', 'စနစ်ရာထူးများ')}
            </h2>
            <div className="bg-[#0A0F1C] p-3 rounded-xl border border-white/5 flex items-center gap-3 focus-within:border-[#D4AF37]/50 transition-colors">
              <Search className="h-4 w-4 text-gray-500" />
              <input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-sm text-white placeholder:text-gray-600 outline-none uppercase font-mono"
                placeholder={t('Search Roles...', 'ရာထူးရှာရန်...')}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {filteredRoles.map(role => (
              <button
                key={role.id}
                onClick={() => handleSelectRole(role)}
                className={`w-full text-left p-4 rounded-2xl border transition-all ${
                  selectedRole?.id === role.id 
                    ? 'bg-[#1A1500] border-[#D4AF37]/50 shadow-[0_0_15px_rgba(212,175,55,0.15)]' 
                    : 'bg-[#0A0F1C] border-white/5 hover:border-gray-600'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`font-bold ${selectedRole?.id === role.id ? 'text-white' : 'text-gray-300'}`}>{role.name}</span>
                  <span className={`text-[10px] font-mono px-2 py-1 rounded border ${
                    selectedRole?.id === role.id ? 'border-[#D4AF37] text-[#D4AF37] bg-[#D4AF37]/10' : 'border-white/10 text-gray-500'
                  }`}>
                    {role.level}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-gray-500 uppercase tracking-widest">
                  <Users className="h-3 w-3" /> {role.userCount} {t('Assigned', 'ဦး')}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT PANE: Clearance Details & Editing */}
        <div className="lg:col-span-8 flex flex-col animate-in fade-in slide-in-from-right-8 duration-500">
          
          {selectedRole ? (
            <div className="bg-[#0E1525] border border-white/5 rounded-[2rem] overflow-hidden flex flex-col h-full shadow-2xl">
              
              <div className="p-8 border-b border-white/5 bg-gradient-to-br from-[#0A0F1C] to-[#1A1500]/30 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <ShieldCheck className="h-6 w-6 text-[#D4AF37]" />
                    <h2 className="text-2xl font-black text-white uppercase tracking-wider">{selectedRole.name}</h2>
                  </div>
                  <p className="text-xs text-gray-400 font-mono tracking-widest bg-black/50 px-3 py-1 rounded-lg w-fit border border-white/5">
                    ROLE_ID: {selectedRole.id}
                  </p>
                </div>
                
                {selectedRole.isSystem && (
                  <div className="flex items-center gap-2 text-[10px] font-black tracking-widest text-rose-500 bg-rose-500/10 border border-rose-500/20 px-4 py-2 rounded-xl">
                    <ShieldAlert className="h-4 w-4" /> {t('SYSTEM IMMUTABLE', 'ပြင်ဆင်၍မရပါ')}
                  </div>
                )}
              </div>

              <div className="p-8 flex-1 overflow-y-auto custom-scrollbar space-y-8">
                
                {/* Info Block */}
                <div>
                  <h3 className="text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase mb-3">{t('Role Description', 'ရာထူးတာဝန်')}</h3>
                  <p className="text-sm text-gray-300 leading-relaxed bg-[#0A0F1C] p-4 rounded-xl border border-white/5">
                    {selectedRole.description}
                  </p>
                </div>

                {/* Clearance Level Edit */}
                <div className="bg-gradient-to-r from-[#1A1500]/50 to-transparent p-6 rounded-2xl border border-[#D4AF37]/20">
                  <div className="flex justify-between items-end">
                    <div className="space-y-2 flex-1">
                      <h3 className="text-[10px] font-bold tracking-[0.2em] text-[#D4AF37] uppercase">{t('Clearance Level', 'လုပ်ပိုင်ခွင့်အဆင့်')}</h3>
                      
                      {isEditing ? (
                        <select 
                          value={editLevel}
                          onChange={(e) => setEditLevel(e.target.value)}
                          className="bg-[#0A0F1C] border border-[#D4AF37] text-[#D4AF37] text-xl font-black font-mono px-4 py-2 rounded-xl outline-none appearance-none"
                        >
                          {['L1', 'L2', 'L3', 'L4', 'L5'].map(l => (
                            <option key={l} value={l}>{l}</option>
                          ))}
                        </select>
                      ) : (
                        <div className="flex items-center gap-3">
                          <span className="text-3xl font-black font-mono text-white">{selectedRole.level}</span>
                          {!selectedRole.isSystem && (
                            <button onClick={() => setIsEditing(true)} className="p-2 bg-[#0A0F1C] border border-white/10 hover:border-[#D4AF37] text-gray-400 hover:text-[#D4AF37] rounded-lg transition-colors">
                              <Edit3 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {isEditing && (
                      <div className="flex gap-3">
                        <button onClick={() => { setIsEditing(false); setEditLevel(selectedRole.level); }} className="px-4 py-3 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors">
                          {t('Cancel', 'ပယ်ဖျက်')}
                        </button>
                        <button onClick={handleSaveChanges} disabled={loading} className="px-6 py-3 bg-[#D4AF37] hover:bg-[#b5952f] text-black text-xs font-black uppercase tracking-[0.2em] rounded-xl disabled:opacity-50 transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(212,175,55,0.4)]">
                          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><CheckCircle2 className="h-4 w-4" /> {t('SAVE', 'သိမ်းမည်')}</>}
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-500 mt-4 uppercase tracking-widest">
                    {t('Modifying the clearance level immediately updates routing gateways in App.tsx.', 'လုပ်ပိုင်ခွင့်အဆင့်ပြောင်းလဲမှုသည် ချက်ချင်းအသက်ဝင်မည်ဖြစ်သည်။')}
                  </p>
                </div>

                {/* Assigned Portals Matrix */}
                <div>
                  <h3 className="text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase mb-4 flex items-center gap-2">
                    <Layers className="h-4 w-4" /> {t('Permitted Gateways', 'ဝင်ရောက်ခွင့်ရှိသောနေရာများ')}
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedRole.portals.map((portal, idx) => (
                      <div key={idx} className="flex items-center gap-3 bg-[#0A0F1C] p-4 rounded-xl border border-white/5">
                        <Lock className="h-4 w-4 text-emerald-500" />
                        <span className="text-sm font-bold text-gray-300">{portal}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          ) : (
            <div className="h-full bg-[#0E1525] rounded-[2rem] border border-white/5 flex flex-col items-center justify-center text-gray-600 space-y-4">
              <Server className="h-16 w-16 opacity-20" />
              <p className="text-xs font-bold tracking-widest uppercase">{t('Select a role to configure permissions', 'ရာထူးကိုရွေးချယ်ပါ')}</p>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

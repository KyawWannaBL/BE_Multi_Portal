import React, { useState } from 'react';
import { Shield, Save, Search, Lock, CheckCircle2, AlertCircle } from 'lucide-react';

// Mock data for initial setup
const ROLES = ['SUPER_ADMIN', 'OPERATIONS_ADMIN', 'FINANCE_ADMIN', 'RIDER', 'SUBSTATION_MANAGER'];
const PERMISSION_CATEGORIES = {
  Operations: ['shipment.create', 'shipment.edit', 'wayplan.generate', 'pickup.verify'],
  Finance: ['cod.reconcile', 'payout.approve', 'finance.export'],
  UserMgmt: ['user.create', 'user.suspend', 'role.assign']
};

export default function RoleManagement() {
  const [selectedRole, setSelectedRole] = useState('OPERATIONS_ADMIN');
  const [activePermissions, setActivePermissions] = useState<string[]>(['shipment.create', 'shipment.edit']);
  const [isSaving, setIsSaving] = useState(false);

  const togglePermission = (perm: string) => {
    setActivePermissions(prev => 
      prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
    );
  };

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API Call
    setTimeout(() => {
      setIsSaving(false);
      alert(`Permissions updated for ${selectedRole}`);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
            Access Control
          </h1>
          <p className="text-slate-400 mt-1">Manage system-wide roles and granular permission sets.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50"
        >
          {isSaving ? <div className="h-5 w-5 border-2 border-white/30 border-t-white animate-spin rounded-full" /> : <Save size={18} />}
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Role Selector Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="luxury-glass p-4 rounded-2xl border border-slate-700/50">
            <div className="flex items-center gap-2 text-slate-400 mb-4 px-2">
              <Search size={16} />
              <span className="text-xs font-bold uppercase tracking-widest">Select Role</span>
            </div>
            <div className="space-y-1">
              {ROLES.map(role => (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                    selectedRole === role 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-lg shadow-emerald-500/5' 
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{role.replace('_', ' ')}</span>
                    {selectedRole === role && <CheckCircle2 size={14} />}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10">
            <div className="flex gap-2 text-amber-500 mb-2">
              <AlertCircle size={16} />
              <span className="text-xs font-bold uppercase">Security Note</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Changes to permissions take effect immediately upon the user's next session synchronization.
            </p>
          </div>
        </div>

        {/* Permission Matrix */}
        <div className="lg:col-span-3 space-y-6">
          {Object.entries(PERMISSION_CATEGORIES).map(([category, perms]) => (
            <div key={category} className="luxury-glass rounded-2xl border border-slate-700/50 overflow-hidden">
              <div className="px-6 py-4 bg-slate-800/30 border-b border-slate-700/50 flex items-center justify-between">
                <h3 className="text-white font-bold tracking-wide">{category} Permissions</h3>
                <span className="text-[10px] bg-slate-700 px-2 py-1 rounded text-slate-300 uppercase font-mono">
                  Module: {category.toLowerCase()}
                </span>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {perms.map(perm => (
                  <div 
                    key={perm}
                    onClick={() => togglePermission(perm)}
                    className={`group flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                      activePermissions.includes(perm)
                        ? 'bg-emerald-500/5 border-emerald-500/30'
                        : 'bg-slate-900/40 border-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg transition-colors ${activePermissions.includes(perm) ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                        <Shield size={16} />
                      </div>
                      <div>
                        <p className={`text-sm font-semibold transition-colors ${activePermissions.includes(perm) ? 'text-white' : 'text-slate-400'}`}>
                          {perm.split('.').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')}
                        </p>
                        <p className="text-[10px] text-slate-500 font-mono">{perm}</p>
                      </div>
                    </div>
                    <div className={`h-5 w-5 rounded-md border-2 transition-all flex items-center justify-center ${
                      activePermissions.includes(perm) 
                        ? 'bg-emerald-500 border-emerald-500' 
                        : 'border-slate-700 group-hover:border-slate-500'
                    }`}>
                      {activePermissions.includes(perm) && <CheckCircle2 size={12} className="text-white" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Critical Actions Protection */}
          <div className="p-6 rounded-2xl border border-red-500/20 bg-red-500/5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
                <Lock size={24} />
              </div>
              <div>
                <h4 className="text-white font-bold">Restrictive Mode</h4>
                <p className="text-sm text-slate-400">Force multi-factor authentication for this role on sensitive operations.</p>
              </div>
            </div>
            <div className="h-6 w-11 bg-slate-700 rounded-full relative cursor-not-allowed">
              <div className="absolute left-1 top-1 h-4 w-4 bg-slate-500 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
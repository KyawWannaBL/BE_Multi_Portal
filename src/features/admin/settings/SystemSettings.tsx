import React from 'react';
import { Settings, Globe, Database, Bell, Save, Cpu } from 'lucide-react';

export default function SystemSettings() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
          System Settings
        </h1>
        <p className="text-slate-400 mt-1">Configure core engine parameters and global variables.</p>
      </div>

      <div className="space-y-6">
        {/* General Config */}
        <div className="luxury-glass p-6 rounded-2xl border border-slate-700/50">
          <div className="flex items-center gap-3 mb-6 text-emerald-400">
            <Globe size={20} />
            <h3 className="font-bold uppercase tracking-widest text-sm">Localization & Region</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SettingField label="Default Currency" value="MMK (Kyat)" />
            <SettingField label="Primary Language" value="Burmese / English (Bilingual)" />
            <SettingField label="Time Zone" value="UTC+6:30 (Yangon)" />
          </div>
        </div>

        {/* Technical Config */}
        <div className="luxury-glass p-6 rounded-2xl border border-slate-700/50">
          <div className="flex items-center gap-3 mb-6 text-blue-400">
            <Cpu size={20} />
            <h3 className="font-bold uppercase tracking-widest text-sm">Platform Engine</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-900/40 rounded-xl border border-slate-800">
              <div>
                <p className="text-sm font-semibold text-white">Maintenance Mode</p>
                <p className="text-xs text-slate-500">Disable client-side access during updates.</p>
              </div>
              <div className="w-10 h-5 bg-slate-700 rounded-full relative">
                <div className="absolute left-1 top-1 h-3 w-3 bg-slate-500 rounded-full" />
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-900/40 rounded-xl border border-slate-800">
              <div>
                <p className="text-sm font-semibold text-white">Auto-Manifest Backup</p>
                <p className="text-xs text-slate-500">Run nightly SQL dumps to off-site storage.</p>
              </div>
              <div className="w-10 h-5 bg-emerald-600 rounded-full relative">
                <div className="absolute right-1 top-1 h-3 w-3 bg-white rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button className="flex items-center gap-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all shadow-xl shadow-emerald-600/20">
          <Save size={18} />
          Apply Global Config
        </button>
      </div>
    </div>
  );
}

function SettingField({ label, value }: { label: string, value: string }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</label>
      <input 
        disabled 
        value={value}
        className="w-full bg-slate-900/50 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-300 cursor-not-allowed" 
      />
    </div>
  );
}
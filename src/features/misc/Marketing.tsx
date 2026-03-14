import React from 'react';
import { 
  Megaphone, 
  Users, 
  MousePointerClick, 
  Percent, 
  Plus, 
  BarChart3, 
  Calendar,
  Share2
} from 'lucide-react';

const campaigns = [
  { id: 1, name: 'New Year Express Promo', status: 'Active', reach: '12.5k', conversion: '3.2%', spend: '450,000 MMK' },
  { id: 2, name: 'Merchant Partnership Drive', status: 'Scheduled', reach: '--', conversion: '--', spend: '200,000 MMK' },
  { id: 3, name: 'Rider Recruitment - Yangon', status: 'Completed', reach: '45.2k', conversion: '1.8%', spend: '1,200,000 MMK' },
];

export default function Marketing() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-rose-500">
            Marketing Hub
          </h1>
          <p className="text-slate-400 mt-1">Manage campaigns and monitor growth metrics for Britium.</p>
        </div>
        <button className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 rounded-xl font-bold transition-all shadow-lg shadow-rose-900/20">
          <Plus size={18} /> NEW CAMPAIGN
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MarketingCard label="Total Reach" value="128.4k" change="+14.2%" icon={Users} color="text-pink-400" />
        <MarketingCard label="Avg. Click Rate" value="4.12%" change="+0.8%" icon={MousePointerClick} color="text-rose-400" />
        <MarketingCard label="Active Promos" value="12" change="Stable" icon={Percent} color="text-orange-400" />
        <MarketingCard label="Marketing ROI" value="3.4x" change="+22%" icon={BarChart3} color="text-violet-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Campaign Management */}
        <div className="lg:col-span-2 luxury-glass rounded-2xl border border-slate-700/50 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-700/50 flex justify-between items-center">
            <h3 className="text-white font-bold flex items-center gap-2">
              <Megaphone size={18} className="text-pink-500" /> Recent Campaigns
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-800/50 text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                <tr>
                  <th className="px-6 py-3">Campaign Name</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Reach</th>
                  <th className="px-6 py-3">Spend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {campaigns.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-white">{c.name}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        c.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' : 
                        c.status === 'Scheduled' ? 'bg-blue-500/10 text-blue-400' : 'bg-slate-700 text-slate-400'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">{c.reach}</td>
                    <td className="px-6 py-4 text-sm font-mono text-slate-300">{c.spend}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Tools */}
        <div className="space-y-6">
          <div className="luxury-glass p-6 rounded-2xl border border-slate-700/50">
            <h3 className="text-white font-bold mb-4">Quick Tools</h3>
            <div className="grid grid-cols-2 gap-3">
              <ToolButton icon={Calendar} label="Schedule" />
              <ToolButton icon={Share2} label="Social Post" />
              <ToolButton icon={Percent} label="Coupons" />
              <ToolButton icon={Users} label="Segments" />
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-pink-500/10 to-transparent border border-pink-500/20">
            <h4 className="text-sm font-bold text-pink-300 mb-2">Growth Tip</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Localized Myanmar-language ads perform 40% better in the Yangon region. Consider running a weekend-specific promo.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MarketingCard({ label, value, change, icon: Icon, color }: any) {
  return (
    <div className="luxury-glass p-5 rounded-2xl border border-slate-700/50 hover:border-pink-500/30 transition-all group">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2 rounded-lg bg-slate-900 group-hover:scale-110 transition-transform ${color}`}>
          <Icon size={20} />
        </div>
        <span className="text-[10px] font-bold text-emerald-500">{change}</span>
      </div>
      <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">{label}</p>
      <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
    </div>
  );
}

function ToolButton({ icon: Icon, label }: any) {
  return (
    <button className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-slate-800/40 hover:bg-slate-700/60 border border-slate-700/50 transition-all group">
      <Icon size={20} className="text-slate-400 group-hover:text-pink-400" />
      <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">{label}</span>
    </button>
  );
}
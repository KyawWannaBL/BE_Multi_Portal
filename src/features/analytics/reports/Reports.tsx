import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Zap, 
  AlertTriangle, 
  Fuel, 
  Map as MapIcon, 
  Clock, 
  ChevronRight,
  Download,
  Filter
} from 'lucide-react';

// Report Categories based on Enterprise Requirements
const reportCategories = [
  { id: 'operational', label: 'Operational Efficiency', icon: Zap, color: 'text-amber-400' },
  { id: 'financial', label: 'Financial & Cost', icon: TrendingUp, color: 'text-emerald-400' },
  { id: 'cx', label: 'Customer Experience', icon: Users, color: 'text-blue-400' },
  { id: 'strategic', label: 'Strategic & Predictive', icon: BarChart3, color: 'text-violet-400' },
];

export default function Reports() {
  const [activeCategory, setActiveCategory] = useState('operational');

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Analytics & Insights</h1>
          <p className="text-slate-400 mt-1">Driving logistics decisions through multi-level data intelligence.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-300 rounded-xl border border-slate-700 hover:bg-slate-700 transition-all text-sm font-bold">
            <Filter size={16} /> FILTERS
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 transition-all text-sm font-bold shadow-lg shadow-emerald-900/20">
            <Download size={16} /> EXPORT ALL
          </button>
        </div>
      </div>

      {/* Automated Exception Alert (Management by Exception) */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between group cursor-pointer hover:bg-amber-500/15 transition-all">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-amber-500 rounded-lg text-slate-900">
            <AlertTriangle size={20} />
          </div>
          <div>
            <h4 className="text-amber-500 font-bold text-sm">Automated Exception Report</h4>
            <p className="text-amber-200/60 text-xs">14 shipments currently breached SLA or stuck in Hub {'>'} 24h.</p>
          </div>
        </div>
        <ChevronRight size={20} className="text-amber-500 group-hover:translate-x-1 transition-transform" />
      </div>

      {/* Category Navigation */}
      <div className="flex flex-wrap gap-4">
        {reportCategories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex items-center gap-3 px-5 py-3 rounded-2xl border transition-all ${
              activeCategory === cat.id 
              ? 'bg-slate-800 border-slate-500 text-white shadow-xl' 
              : 'bg-slate-900/50 border-slate-800 text-slate-500 hover:border-slate-700'
            }`}
          >
            <cat.icon size={18} className={activeCategory === cat.id ? cat.color : ''} />
            <span className="text-sm font-bold">{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Report Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeCategory === 'operational' && (
          <>
            <ReportCard title="On-Time Delivery (OTD)" value="94.2%" trend="+1.2%" desc="Primary KPI: Shipments within window." />
            <ReportCard title="Courier Performance" value="4.8/5" trend="Top" desc="Deliveries/hour & avg service time." />
            <ReportCard title="Failed (NDR) Rate" value="3.1%" trend="-0.5%" desc="Non-Delivery reasons & re-attempts." />
            <ReportCard title="Vehicle Utilization" value="78%" trend="High" desc="Volume/Weight efficiency per trip." />
          </>
        )}

        {activeCategory === 'financial' && (
          <>
            <ReportCard title="Cost Per Delivery" value="1,250 MMK" trend="-5%" desc="Total operational cost / successful drops." />
            <ReportCard title="Fuel & Maintenance" value="Critical" trend="Alert" desc="Maintenance prediction & fuel patterns." icon={Fuel} />
            <ReportCard title="Route Profitability" value="3.2x" trend="+0.4" desc="Zone revenue vs. fuel/labor/tolls." icon={MapIcon} />
          </>
        )}

        {activeCategory === 'cx' && (
          <>
            <ReportCard title="Average NPS / CSAT" value="4.6" trend="Stable" desc="Post-delivery end-user ratings." />
            <ReportCard title="First-Attempt Success" value="89%" trend="+2%" desc="Direct correlation with brand loyalty." />
            <ReportCard title="Click-to-Door Time" value="42h" trend="-4h" desc="Total duration from 'Buy' to 'Arrived'." icon={Clock} />
          </>
        )}

        {activeCategory === 'strategic' && (
          <>
            <ReportCard title="Heatmaps (Density)" value="View Map" trend="Live" desc="Highest volume density for hub placement." icon={MapIcon} />
            <ReportCard title="SLA Breach Trends" value="Weekends" trend="Alert" desc="Predictive breach during peak/weather." />
            <ReportCard title="Carbon Footprint" value="1.2kg/drop" trend="-10%" desc="Emissions per delivery for ESG goals." />
          </>
        )}
      </div>

      {/* Detailed Insights Table Area */}
      <div className="luxury-glass rounded-2xl border border-slate-700/50 overflow-hidden">
        <div className="p-6 border-b border-slate-700/50">
          <h3 className="text-white font-bold">Deep Dive Analysis</h3>
        </div>
        <div className="p-20 text-center">
          <div className="inline-flex p-4 rounded-full bg-slate-800 text-slate-500 mb-4">
            <BarChart3 size={32} />
          </div>
          <h4 className="text-slate-300 font-bold">Select a KPI to generate a detailed data table</h4>
          <p className="text-slate-500 text-sm mt-1">Cross-reference metrics to identify operational leaks.</p>
        </div>
      </div>
    </div>
  );
}

function ReportCard({ title, value, trend, desc, icon: Icon }: any) {
  return (
    <div className="luxury-glass p-6 rounded-2xl border border-slate-700/50 hover:border-slate-500/50 transition-all">
      <div className="flex justify-between items-start mb-4">
        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{title}</p>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
          trend.includes('+') || trend === 'High' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
        }`}>
          {trend}
        </span>
      </div>
      <div className="flex items-center gap-3 mb-2">
        {Icon && <Icon size={20} className="text-slate-400" />}
        <h3 className="text-2xl font-bold text-white">{value}</h3>
      </div>
      <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
    </div>
  );
}
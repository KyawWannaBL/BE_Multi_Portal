import React, { useState } from 'react';
import { useLanguageContext } from '@/lib/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Archive, ShieldCheck, QrCode, Smartphone, 
  RefreshCw, Globe, ArrowLeft, History, 
  AlertTriangle, Plus, Download 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Inventory() {
  const { language } = useLanguageContext();
  const navigate = useNavigate();

  // Enterprise Asset Data (Bilingual)
  const assets = [
    { nameEn: 'SEC-01 Tamper Tags', nameMy: 'လုံခြုံရေးတက်ဂ်များ', stock: 4500, unit: 'pcs', status: 'STABLE' },
    { nameEn: 'AWB Thermal Labels', nameMy: 'QR လေဘယ်လိပ်များ', stock: 12, unit: 'rolls', status: 'LOW' },
    { nameEn: 'L2 Handheld Scanners', nameMy: 'စကင်ဖတ်စက်များ', stock: 24, unit: 'units', status: 'STABLE' }
  ];

  return (
    <div className="p-10 space-y-10 bg-[#0B101B] min-h-screen text-slate-300">
      {/* Header Surveillance (စောင့်ကြည့်မှု ခေါင်းစဉ်) */}
      <div className="flex justify-between items-center bg-[#05080F] p-10 rounded-[3rem] border border-white/5 shadow-2xl">
        <div className="flex items-center gap-6">
          <Button onClick={() => navigate(-1)} variant="ghost" className="p-0 hover:bg-transparent text-slate-500">
            <ArrowLeft size={32}/>
          </Button>
          <div>
            <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">
              {language === 'en' ? 'Asset Inventory' : 'ပစ္စည်းစာရင်း စီမံခန့်ခွဲမှု'}
            </h1>
            <p className="text-sky-500 font-mono text-[10px] mt-1 uppercase tracking-widest italic">
              L2_WAREHOUSE_STOCK • {language === 'en' ? 'REAL_TIME_AUDIT' : 'တိုက်ရိုက်_စာရင်းစစ်ဆေးခြင်း'}
            </p>
          </div>
        </div>
        <div className="flex gap-4">
          <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-black h-12 px-8 rounded-xl shadow-lg">
             <Plus className="mr-2 h-4 w-4" /> {language === 'en' ? "Add Stock" : "ပစ္စည်းအသစ်ထည့်မည်"}
          </Button>
        </div>
      </div>

      {/* Stock Cards (လက်ကျန်ပစ္စည်း ကတ်များ) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {assets.map((asset, i) => (
          <Card key={i} className="bg-[#05080F] border-none ring-1 ring-white/5 rounded-[2.5rem] p-8 space-y-6 relative overflow-hidden group">
            <div className="flex justify-between items-start">
               <div className={`p-4 rounded-2xl ${asset.status === 'LOW' ? 'bg-rose-500/10' : 'bg-sky-500/10'}`}>
                  {asset.nameEn.includes('Tags') ? <ShieldCheck className="text-emerald-500" /> : <Archive className="text-sky-500" />}
               </div>
               <span className={`text-[9px] font-black px-3 py-1 rounded-full border ${asset.status === 'LOW' ? 'border-rose-500 text-rose-500 bg-rose-500/5' : 'border-emerald-500 text-emerald-500 bg-emerald-500/5'}`}>
                 {asset.status}
               </span>
            </div>
            <div>
               <h3 className="text-xl font-bold text-white italic">{language === 'en' ? asset.nameEn : asset.nameMy}</h3>
               <p className="text-4xl font-black text-white mt-2 tracking-tighter">
                 {asset.stock.toLocaleString()} <span className="text-sm text-slate-500 uppercase">{asset.unit}</span>
               </p>
            </div>
            {asset.status === 'LOW' && (
              <div className="flex items-center gap-2 text-rose-500 text-[10px] font-black uppercase animate-pulse">
                <AlertTriangle size={12}/> {language === 'en' ? 'Reorder Immediate' : 'ချက်ချင်း မှာယူရန် လိုအပ်သည်'}
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Asset Audit Ledger (ပစ္စည်းလှုပ်ရှားမှု မှတ်တမ်း) */}
      <Card className="bg-[#05080F] border-none ring-1 ring-white/5 rounded-[3rem] overflow-hidden">
        <div className="p-8 border-b border-white/5 flex justify-between items-center">
          <h2 className="text-xl font-black text-white uppercase italic flex items-center gap-3">
             <History className="text-sky-500" /> {language === 'en' ? 'Inventory Logs' : 'စာရင်းသွင်း/ထုတ် မှတ်တမ်း'}
          </h2>
          <Button variant="ghost" className="text-[10px] font-black text-sky-500 uppercase tracking-widest hover:bg-sky-500/10">
            <Download size={14} className="mr-2"/> Export Audit CSV
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-[10px] text-slate-500 font-mono uppercase tracking-widest">
              <tr>
                <th className="p-8">Timestamp</th>
                <th className="p-8">Asset Type</th>
                <th className="p-8">Action</th>
                <th className="p-8">Quantity</th>
                <th className="p-8 text-right">Operator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <tr className="group hover:bg-white/5 transition-all">
                <td className="p-8 text-slate-500 text-xs font-mono">2026-03-02 16:21</td>
                <td className="p-8 font-bold text-white italic">SEC-01 Tamper Tags</td>
                <td className="p-8"><span className="text-emerald-500 font-black text-[10px] uppercase">Restock</span></td>
                <td className="p-8 text-white font-black">+1,000 pcs</td>
                <td className="p-8 text-right text-slate-400 text-xs font-bold">WH_MANAGER_YGN</td>
              </tr>
              <tr className="group hover:bg-white/5 transition-all">
                <td className="p-8 text-slate-500 text-xs font-mono">2026-03-02 14:05</td>
                <td className="p-8 font-bold text-white italic">AWB Thermal Labels</td>
                <td className="p-8"><span className="text-rose-500 font-black text-[10px] uppercase">Usage</span></td>
                <td className="p-8 text-white font-black">-2 rolls</td>
                <td className="p-8 text-right text-slate-400 text-xs font-bold">SORT_LEAD_04</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

import React from 'react';
import { AdminShell } from '@/components/layout/AdminShell';
import { useLanguage } from '@/contexts/LanguageContext';
import { Trophy, Star, Zap, TrendingUp, Award, Medal } from 'lucide-react';

export default function FranchiseLeaderboard() {
  const { lang } = useLanguage();
  const t = (en: string, my: string) => (lang === 'en' ? en : my);

  const partners = [
    { rank: 1, name: "Mandalay City Hub", manager: "U Kyaw Kyaw", success: "99.4%", speed: "1.2 Days", rating: 4.9, volume: 4500 },
    { rank: 2, name: "Yangon North Sub-Station", manager: "Daw Hla Hla", success: "98.2%", speed: "1.4 Days", rating: 4.8, volume: 3800 },
    { rank: 3, name: "Naypyitaw Central", manager: "U Tun Tun", success: "97.5%", speed: "1.5 Days", rating: 4.7, volume: 3200 },
    { rank: 4, name: "Bago Regional Agent", manager: "Daw Aye Aye", success: "95.0%", speed: "2.1 Days", rating: 4.5, volume: 2100 },
  ];

  return (
    <AdminShell title={t("Franchise Leaderboard", "စွမ်းဆောင်ရည်ဇယား")}>
      <div className="space-y-8 animate-in fade-in duration-500">
        
        {/* Top 3 Spotlight */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          {/* Silver - 2nd */}
          <div className="bg-[#0E1525] border border-slate-400/20 p-8 rounded-[2.5rem] text-center order-2 md:order-1 h-64 flex flex-col justify-center">
            <Medal className="h-10 w-10 text-slate-400 mx-auto mb-4" />
            <h3 className="font-black text-white uppercase">{partners[1].name}</h3>
            <p className="text-2xl font-black text-slate-400 mt-2">#2</p>
          </div>
          {/* Gold - 1st */}
          <div className="bg-gradient-to-b from-amber-500/20 to-[#0E1525] border border-amber-500/40 p-10 rounded-[3rem] text-center order-1 md:order-2 h-80 flex flex-col justify-center shadow-[0_0_50px_rgba(245,158,11,0.1)] relative">
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-amber-500 p-3 rounded-full shadow-lg shadow-amber-500/50">
              <Trophy className="h-8 w-8 text-black" />
            </div>
            <h3 className="text-xl font-black text-white uppercase tracking-wider">{partners[0].name}</h3>
            <p className="text-4xl font-black text-amber-500 mt-2">#1</p>
            <div className="mt-6 flex justify-center gap-4">
              <div className="text-center">
                <p className="text-[8px] font-black text-gray-500 uppercase">Success</p>
                <p className="text-xs font-bold text-white">{partners[0].success}</p>
              </div>
              <div className="w-px h-8 bg-white/5" />
              <div className="text-center">
                <p className="text-[8px] font-black text-gray-500 uppercase">Rating</p>
                <p className="text-xs font-bold text-white">{partners[0].rating} <Star className="h-2 w-2 inline text-amber-500 fill-amber-500" /></p>
              </div>
            </div>
          </div>
          {/* Bronze - 3rd */}
          <div className="bg-[#0E1525] border border-orange-800/20 p-8 rounded-[2.5rem] text-center order-3 h-56 flex flex-col justify-center">
            <Award className="h-10 w-10 text-orange-800 mx-auto mb-4" />
            <h3 className="font-black text-white uppercase">{partners[2].name}</h3>
            <p className="text-2xl font-black text-orange-800 mt-2">#3</p>
          </div>
        </div>

        {/* Full Ranking Table */}
        <div className="bg-[#0E1525] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-white/5 bg-[#0A0F1C]/50 flex justify-between items-center">
            <h3 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500" /> {t("Network Performance Ranking", "ကွန်ရက်စွမ်းဆောင်ရည် အဆင့်သတ်မှတ်ချက်")}
            </h3>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest italic">Updated: {new Date().toLocaleDateString()}</span>
          </div>
          <table className="w-full text-left">
            <thead className="bg-[#0A0F1C] text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 border-b border-white/5">
              <tr>
                <th className="p-6">Rank</th>
                <th className="p-6">Franchise / Station</th>
                <th className="p-6">SLA Speed</th>
                <th className="p-6">Completion</th>
                <th className="p-6">Satisfaction</th>
                <th className="p-6 text-right">Volume</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
              {partners.map((p) => (
                <tr key={p.rank} className="hover:bg-white/5 transition-colors group">
                  <td className="p-6">
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-black ${p.rank === 1 ? 'bg-amber-500 text-black' : 'bg-white/5 text-gray-500 group-hover:text-white'}`}>
                      {p.rank}
                    </span>
                  </td>
                  <td className="p-6">
                    <p className="font-black text-white uppercase tracking-wider">{p.name}</p>
                    <p className="text-[9px] text-gray-500 font-bold uppercase mt-0.5">{p.manager}</p>
                  </td>
                  <td className="p-6 font-mono text-blue-400 font-bold">{p.speed}</td>
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: p.success }} />
                      </div>
                      <span className="font-bold text-emerald-500">{p.success}</span>
                    </div>
                  </td>
                  <td className="p-6 flex items-center gap-1 font-bold text-white">
                    {p.rating} <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                  </td>
                  <td className="p-6 text-right font-mono font-bold text-gray-400">
                    {p.volume.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </AdminShell>
  );
}

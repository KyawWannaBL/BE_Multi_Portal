import React, { useState } from 'react';
import { Users, UserPlus, Star, MapPin, Phone, Mail, MoreVertical } from 'lucide-react';

export default function HumanResources() {
  const [searchTerm, setSearchTerm] = useState('');

  const staff = [
    { name: 'Aung Kyaw', role: 'Senior Rider', branch: 'Yangon Central', rating: 4.8, status: 'Active' },
    { name: 'Zarni Hein', role: 'Driver', branch: 'Mandalay South', rating: 4.5, status: 'On Leave' },
    { name: 'Thiri Win', role: 'Finance Admin', branch: 'Head Office', rating: 5.0, status: 'Active' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
            Human Resources
          </h1>
          <p className="text-slate-400 mt-1">Manage enterprise personnel and performance metrics.</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold transition-all shadow-lg shadow-emerald-600/20">
          <UserPlus size={18} />
          Onboard Staff
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Quick Stats */}
        <div className="luxury-glass p-6 rounded-2xl border border-slate-700/50">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Total Staff</p>
          <h3 className="text-3xl font-bold text-white mt-2">142</h3>
        </div>
        <div className="luxury-glass p-6 rounded-2xl border border-slate-700/50">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Active Riders</p>
          <h3 className="text-3xl font-bold text-emerald-400 mt-2">106</h3>
        </div>
        <div className="luxury-glass p-6 rounded-2xl border border-slate-700/50">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Pending Interviews</p>
          <h3 className="text-3xl font-bold text-blue-400 mt-2">12</h3>
        </div>
      </div>

      {/* Staff Directory */}
      <div className="luxury-glass rounded-2xl border border-slate-700/50 overflow-hidden">
        <div className="p-6 border-b border-slate-700/50 flex flex-col md:flex-row gap-4 justify-between items-center">
          <h3 className="text-white font-bold">Personnel Directory</h3>
          <input 
            type="text" 
            placeholder="Search by name or role..."
            className="bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-sm w-full md:w-64 focus:ring-1 focus:ring-emerald-500 outline-none"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-800/30 text-slate-500 text-xs uppercase tracking-tighter">
              <tr>
                <th className="px-6 py-4 font-semibold">Staff Member</th>
                <th className="px-6 py-4 font-semibold">Branch</th>
                <th className="px-6 py-4 font-semibold">Performance</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {staff.map((person, i) => (
                <tr key={i} className="hover:bg-slate-800/20 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-emerald-400">
                        {person.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{person.name}</p>
                        <p className="text-xs text-slate-500">{person.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400">{person.branch}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-amber-400">
                      <Star size={14} fill="currentColor" />
                      <span className="text-sm font-mono">{person.rating}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${person.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-700 text-slate-400'}`}>
                      {person.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-slate-600 hover:text-white transition-colors">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
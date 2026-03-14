import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Package, Truck, CheckCircle2, MapPin, Download, ExternalLink } from 'lucide-react';

export default function TrackingView() {
  const { id } = useParams();
  const [status, setStatus] = useState('IN_TRANSIT');

  const steps = [
    { label: 'Order Picked Up', date: 'Mar 08, 10:30 AM', icon: <Package />, done: true },
    { label: 'Arrived at Hub (YGN)', date: 'Mar 08, 04:15 PM', icon: <MapPin />, done: true },
    { label: 'Out for Delivery', date: 'Mar 09, 09:00 AM', icon: <Truck />, done: true },
    { label: 'Delivered', date: 'Pending', icon: <CheckCircle2 />, done: false },
  ];

  return (
    <div className="min-h-screen bg-[#05080F] text-white font-sans p-6 flex flex-col items-center">
      <div className="w-full max-w-lg space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Branding */}
        <div className="text-center">
          <h1 className="text-2xl font-black tracking-tighter text-blue-500 italic">BRITIUM EXPRESS</h1>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em]">Live Shipment Tracking</p>
        </div>

        {/* Status Card */}
        <div className="bg-[#0E1525] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <Truck className="h-24 w-24 text-blue-500" />
          </div>
          
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Tracking Number</p>
          <h2 className="text-3xl font-black font-mono mt-1">{id || 'BTM-77218'}</h2>
          
          <div className="mt-6 flex items-center gap-2">
            <span className="h-3 w-3 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">On the way to Mandalay</span>
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-0 pl-4 border-l-2 border-white/5">
          {steps.map((step, idx) => (
            <div key={idx} className="relative pb-10 last:pb-0 pl-8">
              <div className={`absolute -left-[25px] p-2 rounded-full border-4 border-[#05080F] ${step.done ? 'bg-blue-600' : 'bg-[#0E1525] text-gray-700'}`}>
                {React.cloneElement(step.icon as React.ReactElement, { size: 14 })}
              </div>
              <div>
                <p className={`text-sm font-black uppercase tracking-wider ${step.done ? 'text-white' : 'text-gray-700'}`}>{step.label}</p>
                <p className="text-[10px] text-gray-500 font-bold mt-1">{step.date}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Action: Digital Invoice */}
        <button className="w-full h-14 bg-white text-black font-black text-xs uppercase tracking-[0.2em] rounded-2xl flex items-center justify-center gap-3 hover:bg-blue-500 hover:text-white transition-all shadow-xl">
          <Download size={16} /> Download Digital Receipt
        </button>

        <p className="text-[10px] text-center text-gray-600 font-bold uppercase tracking-widest">
          Powered by Britium Logistics Cloud
        </p>
      </div>
    </div>
  );
}

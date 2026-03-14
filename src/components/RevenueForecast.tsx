import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, LineChart, Line 
} from 'recharts';
import { TrendingUp, DollarSign } from 'lucide-react';

const data = [
  { name: 'Mon', revenue: 4200, projection: 4000 },
  { name: 'Tue', revenue: 5100, projection: 4800 },
  { name: 'Wed', revenue: 4800, projection: 5200 },
  { name: 'Thu', revenue: 6200, projection: 5800 },
  { name: 'Fri', revenue: 7800, projection: 6500 },
  { name: 'Sat', revenue: 8400, projection: 7200 },
  { name: 'Sun', revenue: 9100, projection: 8000 },
];

export default function RevenueForecast() {
  return (
    <div className="luxury-card p-8 h-full min-h-[400px]">
      <div className="flex justify-between items-start mb-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
            <DollarSign className="h-6 w-6 text-emerald-500" />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-luxury-cream">Revenue Intelligence</h3>
            <p className="text-[10px] text-white/30 uppercase">Weekly Performance vs Projection</p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2 text-emerald-400">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xl font-bold">+24.8%</span>
          </div>
          <p className="text-[10px] text-white/30 uppercase tracking-tighter">Above Target</p>
        </div>
      </div>

      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#ffffff30', fontSize: 10, fontWeight: 'bold' }} 
              dy={15}
            />
            <YAxis hide />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#0B0C10', 
                border: '1px solid rgba(255,255,255,0.1)', 
                borderRadius: '12px',
                fontSize: '12px',
                color: '#FAF9F6'
              }} 
            />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="#D4AF37" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorRev)" 
            />
            <Line 
              type="monotone" 
              dataKey="projection" 
              stroke="#ffffff20" 
              strokeWidth={2} 
              strokeDasharray="5 5" 
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div className="flex gap-6 mt-6 border-t border-white/5 pt-6">
         <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-luxury-gold" />
            <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Actual Revenue</span>
         </div>
         <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-white/10" />
            <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Target Projection</span>
         </div>
      </div>
    </div>
  );
}
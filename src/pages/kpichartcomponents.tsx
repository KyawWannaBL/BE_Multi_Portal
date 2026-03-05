import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export const LuxuryChart = ({ data }) => (
  <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
    <h3 className="text-xl font-display font-bold text-slate-900 mb-8 tracking-tight">Efficiency Protocol Analysis</h3>
    <div className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="barGradient" x1="0" y2="1">
              <stop offset="0%" stopColor="#D4AF37" stopOpacity={1} />
              <stop offset="100%" stopColor="#D4AF37" stopOpacity={0.6} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="0" vertical={false} stroke="#f8fafc" />
          <XAxis 
            dataKey="status" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
            dy={15}
          />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
          <Tooltip 
            cursor={{ fill: '#f1f5f9' }}
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
          />
          <Bar 
            dataKey="count" 
            fill="url(#barGradient)" 
            radius={[6, 6, 0, 0]} 
            barSize={40} 
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);
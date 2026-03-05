import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const data = [
  { day: 'Mon', revenue: 4200 },
  { day: 'Tue', revenue: 5100 },
  { day: 'Wed', revenue: 4800 },
  { day: 'Thu', revenue: 6200 },
  { day: 'Fri', revenue: 7800 },
  { day: 'Sat', revenue: 8400 },
  { day: 'Sun', revenue: 9100 },
];

export default function RevenueForecast() {
  return (
    <div className="bg-navy-800/60 border border-gold-500/20 rounded-2xl p-6 h-full">
      <h3 className="font-bold mb-4">Weekly Revenue Forecast</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#facc15"
            fill="#facc15"
            fillOpacity={0.3}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
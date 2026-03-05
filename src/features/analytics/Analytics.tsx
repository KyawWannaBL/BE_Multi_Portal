import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  DollarSign,
  Truck,
  AlertCircle,
  Calendar,
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  PieChart as PieChartIcon,
  Target,
  FileText
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
  Legend,
} from 'recharts';
import { motion } from 'framer-motion';
import { formatCurrency } from '@/lib/index';
import { useLanguage } from '@/contexts/LanguageContext';
import { IMAGES } from '@/assets/images';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const REVENUE_FORECAST_DATA = [
  { name: 'Jan', revenue: 42000, forecast: 40000 },
  { name: 'Feb', revenue: 45000, forecast: 44000 },
  { name: 'Mar', revenue: 48000, forecast: 49000 },
  { name: 'Apr', revenue: 52000, forecast: 53000 },
  { name: 'May', revenue: 51000, forecast: 56000 },
  { name: 'Jun', revenue: 59000, forecast: 61000 },
  { name: 'Jul', revenue: 64000, forecast: 65000 },
  { name: 'Aug', revenue: 68000, forecast: 70000 },
  { name: 'Sep', revenue: 72000, forecast: 74000 },
  { name: 'Oct', revenue: 75000, forecast: 78000 },
  { name: 'Nov', revenue: 82000, forecast: 85000 },
  { name: 'Dec', revenue: 95000, forecast: 98000 },
];

const BRANCH_PERFORMANCE = [
  { id: 'BR-001', name: 'Downtown Hub', volume: 12450, efficiency: 98.4, growth: 12.5 },
  { id: 'BR-002', name: 'Westside Logistics', volume: 9820, efficiency: 96.2, growth: -2.1 },
  { id: 'BR-003', name: 'Airport Cargo Terminal', volume: 15600, efficiency: 99.1, growth: 18.4 },
  { id: 'BR-004', name: 'East Harbor Port', volume: 11200, efficiency: 94.8, growth: 5.2 },
  { id: 'BR-005', name: 'North Industrial Park', volume: 8400, efficiency: 97.5, growth: 8.9 },
];

const STATUS_DISTRIBUTION = [
  { name: 'Delivered', value: 4500, color: 'oklch(0.62 0.18 150)' },
  { name: 'In Transit', value: 2100, color: 'oklch(0.65 0.2 50)' },
  { name: 'Pending', value: 800, color: 'oklch(0.55 0.15 25)' },
  { name: 'Exception', value: 200, color: 'oklch(0.6 0.25 25)' },
];

const HOURLY_VOLUME = [
  { hour: '08:00', count: 120 },
  { hour: '10:00', count: 240 },
  { hour: '12:00', count: 310 },
  { hour: '14:00', count: 280 },
  { hour: '16:00', count: 450 },
  { hour: '18:00', count: 390 },
  { hour: '20:00', count: 180 },
];

interface MetricsCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: { value: number; isPositive: boolean };
  description?: string;
}

function MetricsCard({ title, value, icon: Icon, trend, description }: MetricsCardProps) {
  return (
    <Card className="luxury-card overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="rounded-full bg-primary/10 p-2">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold font-mono">{value}</div>
        <div className="flex items-center gap-2 mt-1">
          {trend && (
            <span className={`flex items-center text-xs font-medium ${trend.isPositive ? 'text-green-500' : 'text-destructive'}`}>
              {trend.isPositive ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
              {trend.value}%
            </span>
          )}
          <p className="text-xs text-muted-foreground">{description || 'vs last month'}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Analytics() {
  const { language } = useLanguage();
  const [timeRange, setTimeRange] = useState('12M');

  const t = useMemo(() => ({
    en: {
      title: 'Operational Intelligence',
      subtitle: 'Comprehensive performance analytics and revenue forecasting for 2026.',
      revenue: 'Total Revenue',
      onTime: 'On-Time Delivery',
      volume: 'Operational Volume',
      exceptions: 'Delivery Exceptions',
      revenueTrend: 'Revenue Trends & Forecasting',
      revenueDesc: 'Actual vs Predicted revenue growth (USD)',
      distribution: 'Volume Distribution',
      peakHours: 'Peak Operating Hours',
      peakDesc: 'Shipment processing volume per hour',
      branchMatrix: 'Branch Efficiency Matrix',
      branchDesc: 'Comparative operational performance across major hubs',
      export: 'Export Report',
      filter: 'Filter',
    },
    my: {
      title: 'လုပ်ငန်းလည်ပတ်မှု အချက်အလက်များ',
      subtitle: '၂၀၂၆ ခုနှစ်အတွက် စွမ်းဆောင်ရည်ပိုင်းခြားစိတ်ဖြာချက်နှင့် ဝင်ငွေခန့်မှန်းချက်များ။',
      revenue: 'စုစုပေါင်းဝင်ငွေ',
      onTime: 'အချိန်မှန်ပို့ဆောင်မှု',
      volume: 'လုပ်ငန်းပမာဏ',
      exceptions: 'ပို့ဆောင်မှုပြဿနာများ',
      revenueTrend: 'ဝင်ငွေလမ်းကြောင်းနှင့် ခန့်မှန်းချက်',
      revenueDesc: 'အမှန်တကယ်နှင့် ခန့်မှန်းထားသော ဝင်ငွေတိုးတက်မှု (USD)',
      distribution: 'ပမာဏခွဲဝေမှု',
      peakHours: 'အလုပ်အများဆုံးအချိန်များ',
      peakDesc: 'တစ်နာရီလျှင် ပါဆယ်လ်ကိုင်တွယ်မှုပမာဏ',
      branchMatrix: 'ဌာနခွဲများ၏ စွမ်းဆောင်ရည်',
      branchDesc: 'အဓိကအချက်အချာဌာနများ၏ စွမ်းဆောင်ရည်နှိုင်းယှဉ်ချက်',
      export: 'အစီရင်ခံစာထုတ်ယူရန်',
      filter: 'စစ်ထုတ်ရန်',
    }
  }[language]), [language]);

  return (
    <div className="flex flex-col gap-6 p-6 pb-24">
      {/* Header Section */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
            {t.title}
          </h1>
          <p className="text-muted-foreground">
            {t.subtitle}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex overflow-hidden rounded-lg border border-border bg-card shadow-sm">
            {['1M', '3M', '6M', '12M'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 text-xs font-bold transition-all ${ 
                  timeRange === range 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" />
            {t.filter}
          </Button>
          <Button size="sm" className="luxury-button h-9 px-4 py-0 text-[9px] gap-2">
            <Download className="h-4 w-4" />
            {t.export}
          </Button>
        </div>
      </div>

      {/* Key Performance Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricsCard
          title={t.revenue}
          value={formatCurrency(845230, 'USD')}
          icon={DollarSign}
          trend={{ value: 12.5, isPositive: true }}
        />
        <MetricsCard
          title={t.onTime}
          value="98.4%"
          icon={Target}
          trend={{ value: 0.8, isPositive: true }}
        />
        <MetricsCard
          title={t.volume}
          value="145,200"
          icon={Truck}
          trend={{ value: 4.2, isPositive: true }}
        />
        <MetricsCard
          title={t.exceptions}
          value="42"
          icon={AlertCircle}
          trend={{ value: 15.4, isPositive: false }}
        />
      </div>

      {/* Main Analytics Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Revenue Forecast Area Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="col-span-1 lg:col-span-2"
        >
          <Card className="luxury-card h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">{t.revenueTrend}</CardTitle>
                <CardDescription>{t.revenueDesc}</CardDescription>
              </div>
              <TrendingUp className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent className="h-[400px] w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={REVENUE_FORECAST_DATA}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis 
                    dataKey="name" 
                    stroke="var(--muted-foreground)" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="var(--muted-foreground)" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `$${value/1000}k`} 
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="var(--primary)" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="forecast" 
                    stroke="var(--chart-2)" 
                    strokeWidth={2} 
                    strokeDasharray="5 5" 
                    fillOpacity={1} 
                    fill="url(#colorForecast)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Shipment Status Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="luxury-card h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">{t.distribution}</CardTitle>
              <PieChartIcon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent className="flex-1">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={STATUS_DISTRIBUTION}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={8}
                      dataKey="value"
                    >
                      {STATUS_DISTRIBUTION.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px' }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36} 
                      iconType="circle" 
                      wrapperStyle={{ fontSize: '11px', paddingTop: '20px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Top Sector: Standard</span>
                  <span className="font-bold">85% Efficiency</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '85%' }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full bg-primary shadow-[0_0_10px_rgba(212,175,55,0.4)]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Secondary Insights Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Hourly Volume Bar Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card className="luxury-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">{t.peakHours}</CardTitle>
                <CardDescription>{t.peakDesc}</CardDescription>
              </div>
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={HOURLY_VOLUME}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis 
                    dataKey="hour" 
                    stroke="var(--muted-foreground)" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="var(--muted-foreground)" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <Tooltip 
                    cursor={{fill: 'var(--muted)', opacity: 0.2}}
                    contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px' }}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="var(--primary)" 
                    radius={[6, 6, 0, 0]} 
                    barSize={40} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Branch Performance Table */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card className="luxury-card overflow-hidden h-full">
            <CardHeader>
              <CardTitle className="text-lg">{t.branchMatrix}</CardTitle>
              <CardDescription>{t.branchDesc}</CardDescription>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 text-muted-foreground">
                  <tr>
                    <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Branch Name</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Volume</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Efficiency</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Growth</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {BRANCH_PERFORMANCE.map((branch) => (
                    <tr key={branch.id} className="hover:bg-muted/30 transition-colors group">
                      <td className="px-6 py-4 font-semibold text-foreground">{branch.name}</td>
                      <td className="px-6 py-4 font-mono">{branch.volume.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
                            <div 
                              className="h-full bg-primary"
                              style={{ width: `${branch.efficiency}%` }}
                            />
                          </div>
                          <span className="font-bold">{branch.efficiency}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={branch.growth >= 0 ? 'default' : 'destructive'} className="gap-1 px-2">
                          {branch.growth >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                          {Math.abs(branch.growth)}%
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Visual Insights Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <motion.div 
          whileHover={{ y: -5 }}
          className="relative h-72 overflow-hidden rounded-[2rem] border border-border group"
        >
          <img 
            src={IMAGES.DASHBOARD_ANALYTICS_3}
            alt="Global Logistics View" 
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
          <div className="absolute bottom-0 left-0 p-8">
            <Badge className="mb-3 bg-primary/90 text-primary-foreground font-bold tracking-[0.2em] text-[10px]">
              NETWORK EXPANSION
            </Badge>
            <h4 className="font-heading text-2xl font-bold text-foreground mb-1">APAC Transit Corridor</h4>
            <p className="text-sm text-muted-foreground">Live efficiency tracking for the New Silk Road route across 12 countries.</p>
            <Button variant="link" className="text-primary p-0 h-auto mt-4 font-bold text-xs uppercase tracking-widest">
              View Details <ArrowUpRight className="ml-1 h-3 w-3" />
            </Button>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="relative h-72 overflow-hidden rounded-[2rem] border border-border group"
        >
          <img 
            src={IMAGES.DASHBOARD_ANALYTICS_4}
            alt="Predictive Analytics" 
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
          <div className="absolute bottom-0 left-0 p-8">
            <Badge className="mb-3 bg-accent text-accent-foreground font-bold tracking-[0.2em] text-[10px]">
              AI INSIGHTS
            </Badge>
            <h4 className="font-heading text-2xl font-bold text-foreground mb-1">Autonomous Optimization</h4>
            <p className="text-sm text-muted-foreground">Predictive modeling reduced fuel costs by 18.2% in the last fiscal quarter.</p>
            <Button variant="link" className="text-primary p-0 h-auto mt-4 font-bold text-xs uppercase tracking-widest">
              Access Models <ArrowUpRight className="ml-1 h-3 w-3" />
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Bottom Quick Action */}
      <div className="mt-4 flex justify-center">
        <Button className="luxury-button px-12 group">
          Generate Full BI Report
          <FileText className="ml-2 h-4 w-4 transition-transform group-hover:rotate-12" />
        </Button>
      </div>
    </div>
  );
}
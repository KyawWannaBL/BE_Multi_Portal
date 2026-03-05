import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Package,
  Truck,
  DollarSign,
  Calendar,
  Filter,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  ChevronDown
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
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { logisticsAPI, DashboardMetrics } from '@/services/logistics-api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { springPresets, fadeInUp, staggerContainer, staggerItem } from '@/lib/motion';

const REVENUE_DATA = [
  { name: 'Jan', revenue: 4500, volume: 120 },
  { name: 'Feb', revenue: 5200, volume: 145 },
  { name: 'Mar', revenue: 4800, volume: 132 },
  { name: 'Apr', revenue: 6100, volume: 180 },
  { name: 'May', revenue: 5900, volume: 175 },
  { name: 'Jun', revenue: 7200, volume: 210 },
  { name: 'Jul', revenue: 8400, volume: 250 },
];

const STATUS_DATA = [
  { name: 'Delivered', value: 65, color: 'oklch(0.62 0.18 150)' },
  { name: 'In Transit', value: 20, color: 'oklch(0.65 0.2 50)' },
  { name: 'Pending', value: 10, color: 'oklch(0.55 0.15 25)' },
  { name: 'Exception', value: 5, color: 'oklch(0.6 0.25 25)' },
];

const MerchantAnalytics: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    const fetchMetrics = async () => {
      setIsLoading(true);
      try {
        const response = await logisticsAPI.getDashboardMetrics(user?.id);
        if (response.success) {
          setMetrics(response.metrics);
        }
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetrics();
  }, [user?.id, timeRange]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-background p-6 space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Business Analytics</h1>
          <p className="text-muted-foreground">Comprehensive performance insights for 2026 operations</p>
        </div>

        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[160px] luxury-glass">
              <Calendar className="mr-2 h-4 w-4 text-primary" />
              <SelectValue placeholder="Select Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last Quarter</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="luxury-glass border-primary/20 hover:border-primary/50">
            <Download className="mr-2 h-4 w-4 text-primary" />
            Export Report
          </Button>
        </div>
      </header>

      <motion.div 
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {[ 
          {
            label: 'Total Shipments',
            value: metrics?.total_shipments || 0,
            change: '+12.5%',
            trend: 'up',
            icon: Package,
            color: 'text-primary'
          },
          {
            label: 'Total Revenue',
            value: formatCurrency(metrics?.total_revenue || 0),
            change: '+8.2%',
            trend: 'up',
            icon: DollarSign,
            color: 'text-chart-5'
          },
          {
            label: 'Delivery Rate',
            value: `${metrics?.delivery_rate || 0}%`,
            change: '+2.4%',
            trend: 'up',
            icon: Activity,
            color: 'text-chart-4'
          },
          {
            label: 'COD Collected',
            value: formatCurrency(metrics?.cod_collected || 0),
            change: '-1.5%',
            trend: 'down',
            icon: Truck,
            color: 'text-chart-2'
          }
        ].map((item, index) => (
          <motion.div key={index} variants={staggerItem}>
            <Card className="luxury-card overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className={`p-3 rounded-2xl bg-primary/10 ${item.color}`}>
                    <item.icon size={24} />
                  </div>
                  <div className={`flex items-center gap-1 text-sm font-medium ${item.trend === 'up' ? 'text-chart-5' : 'text-destructive'}`}>
                    {item.change}
                    {item.trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  </div>
                </div>
                <div className="mt-4 space-y-1">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{item.label}</p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    <h3 className="text-2xl font-bold">{item.value}</h3>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div 
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="lg:col-span-2"
        >
          <Card className="luxury-card h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-8">
              <div>
                <CardTitle className="text-xl">Revenue & Volume Trends</CardTitle>
                <CardDescription>Monthly growth performance for the current fiscal year</CardDescription>
              </div>
              <TrendingUp className="text-primary h-5 w-5" />
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={REVENUE_DATA}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-luxury-gold)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="var(--color-luxury-gold)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      stroke="#888888" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <YAxis 
                      stroke="#888888" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(11, 12, 16, 0.95)', border: '1px solid rgba(212, 175, 55, 0.2)', borderRadius: '12px' }}
                      itemStyle={{ color: '#D4AF37' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="var(--color-luxury-gold)" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorRevenue)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="volume" 
                      stroke="#6366f1" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      fill="transparent"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div 
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="space-y-8"
        >
          <Card className="luxury-card">
            <CardHeader>
              <CardTitle className="text-xl">Shipment Status</CardTitle>
              <CardDescription>Distribution of active shipments</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={STATUS_DATA}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {STATUS_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(11, 12, 16, 0.95)', border: '1px solid rgba(212, 175, 55, 0.2)', borderRadius: '12px' }}
                    />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="luxury-card">
            <CardHeader>
              <CardTitle className="text-xl">Operational Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/10">
                <div className="flex items-center gap-3">
                  <Package className="text-primary" size={20} />
                  <span className="text-sm font-medium">Peak Shipping Hour</span>
                </div>
                <span className="text-sm font-bold">14:00 - 16:00</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/10">
                <div className="flex items-center gap-3">
                  <Truck className="text-primary" size={20} />
                  <span className="text-sm font-medium">Avg. Delivery Time</span>
                </div>
                <span className="text-sm font-bold">1.2 Days</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/10">
                <div className="flex items-center gap-3">
                  <Filter className="text-primary" size={20} />
                  <span className="text-sm font-medium">Regional Focus</span>
                </div>
                <span className="text-sm font-bold">Yangon Central</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div 
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 md:grid-cols-2 gap-8"
      >
        <Card className="luxury-card">
          <CardHeader>
            <CardTitle>Top Customers</CardTitle>
            <CardDescription>Most frequent receivers by volume</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="space-y-6">
                {[1, 2, 3].map((_, i) => (
                  <div key={i} className="flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center font-bold text-primary border border-primary/20">
                        {i + 1}
                      </div>
                      <div>
                        <p className="font-semibold">Client Alpha {i + 1}</p>
                        <p className="text-xs text-muted-foreground">Yangon, Myanmar</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{150 - (i * 30)} Units</p>
                      <p className="text-xs text-chart-5">+15% monthly</p>
                    </div>
                  </div>
                ))}
             </div>
          </CardContent>
        </Card>

        <Card className="luxury-card">
          <CardHeader>
            <CardTitle>Regional Performance</CardTitle>
            <CardDescription>Volume distribution across states</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { region: 'Yangon', value: 850 },
                { region: 'Mandalay', value: 420 },
                { region: 'Naypyidaw', value: 290 },
                { region: 'Bago', value: 180 },
                { region: 'Shan', value: 150 },
              ]}>
                <XAxis dataKey="region" stroke="#888888" fontSize={12} axisLine={false} tickLine={false} />
                <Tooltip 
                   contentStyle={{ backgroundColor: 'rgba(11, 12, 16, 0.95)', border: '1px solid rgba(212, 175, 55, 0.2)', borderRadius: '12px' }}
                />
                <Bar dataKey="value" fill="var(--color-luxury-gold)" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default MerchantAnalytics;
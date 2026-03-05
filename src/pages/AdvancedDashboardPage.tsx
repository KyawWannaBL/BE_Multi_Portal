import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown,
  Package,
  Truck,
  Users,
  MapPin,
  Clock,
  DollarSign,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Target,
  Award,
  Globe,
  Smartphone,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Bell,
  Settings
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart as RechartsPieChart, 
  Pie,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { useLanguageContext } from '@/lib/LanguageContext';
import { useTranslation } from '@/lib/translations';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/motion';
import { IMAGES } from '@/assets/images';

// Advanced analytics data
const ANALYTICS_DATA = {
  overview: {
    totalOrders: 12847,
    totalRevenue: 2847500000,
    activeRiders: 156,
    deliveryRate: 98.7,
    avgDeliveryTime: 28,
    customerSatisfaction: 4.8
  },
  trends: {
    orders: [
      { name: 'Mon', orders: 1200, revenue: 2400000, deliveries: 1180 },
      { name: 'Tue', orders: 1350, revenue: 2700000, deliveries: 1320 },
      { name: 'Wed', orders: 1100, revenue: 2200000, deliveries: 1080 },
      { name: 'Thu', orders: 1450, revenue: 2900000, deliveries: 1420 },
      { name: 'Fri', orders: 1600, revenue: 3200000, deliveries: 1580 },
      { name: 'Sat', orders: 1800, revenue: 3600000, deliveries: 1750 },
      { name: 'Sun', orders: 1400, revenue: 2800000, deliveries: 1380 }
    ]
  },
  statusDistribution: [
    { name: 'Delivered', value: 8547, color: '#10b981' },
    { name: 'In Transit', value: 2156, color: '#3b82f6' },
    { name: 'Pending', value: 1842, color: '#f59e0b' },
    { name: 'Failed', value: 302, color: '#ef4444' }
  ],
  topPerformers: [
    { name: 'Ko Aung Myat', deliveries: 245, rating: 4.9, earnings: 1250000 },
    { name: 'Ma Thida Oo', deliveries: 189, rating: 4.8, earnings: 980000 },
    { name: 'Ko Zaw Win', deliveries: 156, rating: 4.7, earnings: 780000 },
    { name: 'Ma Khin Myo', deliveries: 134, rating: 4.6, earnings: 670000 }
  ],
  realtimeMetrics: {
    ordersToday: 1247,
    activeDeliveries: 89,
    avgResponseTime: '2.3s',
    systemUptime: '99.9%'
  }
};

const AdvancedDashboardPage: React.FC = () => {
  const { language } = useLanguageContext();
  const { t } = useTranslation(language);
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');
  const [isLive, setIsLive] = useState(true);
  const [metrics, setMetrics] = useState(ANALYTICS_DATA);

  // Simulate real-time updates
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        realtimeMetrics: {
          ...prev.realtimeMetrics,
          ordersToday: prev.realtimeMetrics.ordersToday + Math.floor(Math.random() * 3),
          activeDeliveries: Math.max(50, prev.realtimeMetrics.activeDeliveries + Math.floor(Math.random() * 6) - 3)
        }
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, [isLive]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'MMK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount).replace('MMK', 'MMK ');
  };

  const MetricCard = ({ title, value, change, icon: Icon, trend, color = "navy" }: any) => (
    <Card className="delivery-card hover-lift border-none shadow-xl">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              {title}
            </p>
            <p className="text-3xl font-bold text-navy-900">
              {typeof value === 'number' && value > 1000 ? value.toLocaleString() : value}
            </p>
            {change && (
              <div className={`flex items-center space-x-1 text-sm ${
                trend === 'up' ? 'text-success' : trend === 'down' ? 'text-error' : 'text-muted-foreground'
              }`}>
                {trend === 'up' ? (
                  <TrendingUp className="h-4 w-4" />
                ) : trend === 'down' ? (
                  <TrendingDown className="h-4 w-4" />
                ) : null}
                <span className="font-medium">{change}</span>
              </div>
            )}
          </div>
          <div className={`p-4 rounded-2xl ${
            color === 'gold' ? 'bg-gold-500/10' : 
            color === 'success' ? 'bg-success/10' : 
            color === 'warning' ? 'bg-warning/10' : 
            color === 'error' ? 'bg-error/10' : 
            'bg-navy-500/10'
          }`}>
            <Icon className={`h-8 w-8 ${
              color === 'gold' ? 'text-gold-500' : 
              color === 'success' ? 'text-success' : 
              color === 'warning' ? 'text-warning' : 
              color === 'error' ? 'text-error' : 
              'text-navy-500'
            }`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-50 via-white to-gold-50/20">
      {/* Header */}
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="mobile-padding py-8 border-b border-navy-100"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <motion.div variants={staggerItem}>
            <h1 className="text-4xl font-bold font-display text-gradient-navy">
              Delivery Analytics
            </h1>
            <p className="text-muted-foreground mt-2">
              Real-time insights and performance metrics
            </p>
          </motion.div>
          
          <motion.div variants={staggerItem} className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-success">Live Data</span>
            </div>
            
            <Button variant="outline" size="sm">
              <Calendar className="mr-2 h-4 w-4" />
              Last 7 days
            </Button>
            
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            
            <Button size="sm" className="btn-premium">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </motion.div>
        </div>
      </motion.div>

      <div className="mobile-padding py-8 space-y-8">
        {/* Key Metrics Grid */}
        <motion.div 
          variants={staggerContainer}
          className="dashboard-grid"
        >
          <motion.div variants={staggerItem}>
            <MetricCard
              title="Total Orders"
              value={metrics.overview.totalOrders}
              change="+12.5%"
              trend="up"
              icon={Package}
              color="navy"
            />
          </motion.div>
          
          <motion.div variants={staggerItem}>
            <MetricCard
              title="Revenue"
              value={formatCurrency(metrics.overview.totalRevenue)}
              change="+8.2%"
              trend="up"
              icon={DollarSign}
              color="gold"
            />
          </motion.div>
          
          <motion.div variants={staggerItem}>
            <MetricCard
              title="Active Riders"
              value={metrics.overview.activeRiders}
              change="+5.1%"
              trend="up"
              icon={Users}
              color="success"
            />
          </motion.div>
          
          <motion.div variants={staggerItem}>
            <MetricCard
              title="Delivery Rate"
              value={`${metrics.overview.deliveryRate}%`}
              change="+0.3%"
              trend="up"
              icon={Target}
              color="success"
            />
          </motion.div>
          
          <motion.div variants={staggerItem}>
            <MetricCard
              title="Avg Delivery Time"
              value={`${metrics.overview.avgDeliveryTime}min`}
              change="-2.1min"
              trend="up"
              icon={Clock}
              color="warning"
            />
          </motion.div>
          
          <motion.div variants={staggerItem}>
            <MetricCard
              title="Customer Rating"
              value={metrics.overview.customerSatisfaction}
              change="+0.1"
              trend="up"
              icon={Award}
              color="gold"
            />
          </motion.div>
        </motion.div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Orders Trend */}
          <motion.div variants={staggerItem}>
            <Card className="delivery-card border-none shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold">Orders & Revenue Trend</CardTitle>
                  <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                    +15.2% vs last week
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={metrics.trends.orders}>
                    <defs>
                      <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="orders"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#ordersGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Status Distribution */}
          <motion.div variants={staggerItem}>
            <Card className="delivery-card border-none shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl font-bold">Delivery Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={metrics.statusDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {metrics.statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Real-time Metrics */}
        <motion.div variants={staggerItem}>
          <Card className="lotus-card text-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold text-white">
                  Real-time Operations
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-gold-400" />
                  <span className="text-gold-200 text-sm">Live Updates</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gold-400 mb-2">
                    {metrics.realtimeMetrics.ordersToday}
                  </div>
                  <div className="text-gold-200 text-sm">Orders Today</div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-gold-400 mb-2">
                    {metrics.realtimeMetrics.activeDeliveries}
                  </div>
                  <div className="text-gold-200 text-sm">Active Deliveries</div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-gold-400 mb-2">
                    {metrics.realtimeMetrics.avgResponseTime}
                  </div>
                  <div className="text-gold-200 text-sm">Avg Response</div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-gold-400 mb-2">
                    {metrics.realtimeMetrics.systemUptime}
                  </div>
                  <div className="text-gold-200 text-sm">System Uptime</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Performers */}
        <motion.div variants={staggerItem}>
          <Card className="delivery-card border-none shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold">Top Performing Riders</CardTitle>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.topPerformers.map((rider, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-navy-50 rounded-xl hover-lift">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-gold-500 to-gold-400 rounded-full flex items-center justify-center text-navy-900 font-bold">
                        #{index + 1}
                      </div>
                      <div>
                        <h4 className="font-semibold text-navy-900">{rider.name}</h4>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>{rider.deliveries} deliveries</span>
                          <span>★ {rider.rating}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-navy-900">{formatCurrency(rider.earnings)}</p>
                      <p className="text-sm text-muted-foreground">This month</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Performance Insights */}
        <motion.div variants={staggerItem}>
          <Card className="delivery-card border-none shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Performance Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Peak Hours</span>
                    <Badge className="bg-success/10 text-success">12PM - 2PM</Badge>
                  </div>
                  <Progress value={85} className="h-2" />
                  <p className="text-xs text-muted-foreground">85% of daily orders</p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Popular Areas</span>
                    <Badge className="bg-info/10 text-info">Downtown</Badge>
                  </div>
                  <Progress value={72} className="h-2" />
                  <p className="text-xs text-muted-foreground">72% delivery concentration</p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Customer Retention</span>
                    <Badge className="bg-gold-500/10 text-gold-600">94.2%</Badge>
                  </div>
                  <Progress value={94} className="h-2" />
                  <p className="text-xs text-muted-foreground">Monthly retention rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Floating Action Button */}
      <Button className="fab">
        <Bell className="h-6 w-6" />
      </Button>
    </div>
  );
};

export default AdvancedDashboardPage;
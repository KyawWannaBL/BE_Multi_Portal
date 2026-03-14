import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Package,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Filter,
  Download,
  BrainCircuit,
  Users,
  Calendar,
  Target,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { SHIPMENT_STATUS, MOCK_TOWNSHIPS } from '@/lib/index';
import { ROUTE_PATHS_ADMIN } from '@/lib/admin-system';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Mock Data for 2026 Merchant Insights
const REVENUE_DATA = [
  { name: 'Sep', revenue: 12500, orders: 420 },
  { name: 'Oct', revenue: 15200, orders: 480 },
  { name: 'Nov', revenue: 21000, orders: 650 },
  { name: 'Dec', revenue: 28500, orders: 890 },
  { name: 'Jan', revenue: 24200, orders: 720 },
  { name: 'Feb', revenue: 26800, orders: 780 },
];

const DELIVERY_PERFORMANCE = [
  { name: 'Delivered', value: 85, color: 'oklch(0.65 0.15 180)' },
  { name: 'In Transit', value: 10, color: 'oklch(0.55 0.18 245)' },
  { name: 'Failed/NDR', value: 5, color: 'oklch(0.55 0.22 25)' },
];

const TOWNSHIP_DATA = MOCK_TOWNSHIPS.map(t => ({
  township: t,
  volume: Math.floor(Math.random() * 500) + 100,
  revenue: Math.floor(Math.random() * 5000) + 1000,
}));

const TOP_CUSTOMERS = [
  { name: 'Quantum Retail Group', orders: 124, spent: '$12,400', growth: '+12%' },
  { name: 'Nexus Logistics Co', orders: 98, spent: '$9,800', growth: '+8%' },
  { name: 'Solaris E-commerce', orders: 86, spent: '$8,200', growth: '+15%' },
  { name: 'Apex Electronics', orders: 74, spent: '$7,100', growth: '-2%' },
];

const PREDICTIVE_INSIGHTS = [
  {
    title: 'Peak Season Forecast',
    description: 'Predicted 24% volume increase in North District next month.',
    type: 'positive',
    icon: <TrendingUp className="w-4 h-4 text-green-500" />,
  },
  {
    title: 'NDR Risk Alert',
    description: 'Solaris E-commerce orders showing 12% higher risk of delivery failure.',
    type: 'warning',
    icon: <AlertCircle className="w-4 h-4 text-amber-500" />,
  },
  {
    title: 'Revenue Projection',
    description: 'Projected Q1 revenue: $82,400 based on current momentum.',
    type: 'neutral',
    icon: <Target className="w-4 h-4 text-blue-500" />,
  },
];

const MerchantAnalytics: React.FC = () => {
  const { user, legacyUser } = useAuth();
  const [timeRange, setTimeRange] = useState('6m');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-7xl mx-auto space-y-8"
      >
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Merchant Analytics</h1>
            <p className="text-muted-foreground">Real-time performance insights for 2026 operations</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[160px] bg-card">
                <Calendar className="w-4 h-4 mr-2 opacity-50" />
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="6m">Last 6 Months</SelectItem>
                <SelectItem value="1y">Last Year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="btn-modern">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div variants={itemVariants}>
            <Card className="card-modern">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <DollarSign className="w-6 h-6 text-primary" />
                  </div>
                  <Badge className="bg-green-500/10 text-green-600 border-none">+18.2%</Badge>
                </div>
                <div className="mt-4">
                  <p className="text-sm font-medium text-muted-foreground uppercase">Total Revenue</p>
                  <h2 className="text-2xl font-bold font-mono mt-1">$26,800.00</h2>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="card-modern">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Package className="w-6 h-6 text-blue-500" />
                  </div>
                  <Badge className="bg-blue-500/10 text-blue-600 border-none">780 Items</Badge>
                </div>
                <div className="mt-4">
                  <p className="text-sm font-medium text-muted-foreground uppercase">Monthly Shipments</p>
                  <h2 className="text-2xl font-bold font-mono mt-1">3,420</h2>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="card-modern">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                  </div>
                  <Badge className="bg-green-500/10 text-green-600 border-none">96.4%</Badge>
                </div>
                <div className="mt-4">
                  <p className="text-sm font-medium text-muted-foreground uppercase">Success Rate</p>
                  <h2 className="text-2xl font-bold font-mono mt-1">SLA Grade A</h2>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="card-modern">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="p-2 bg-amber-500/10 rounded-lg">
                    <AlertCircle className="w-6 h-6 text-amber-500" />
                  </div>
                  <Badge variant="destructive" className="border-none">14 NDRs</Badge>
                </div>
                <div className="mt-4">
                  <p className="text-sm font-medium text-muted-foreground uppercase">Exceptions</p>
                  <h2 className="text-2xl font-bold font-mono mt-1">2.1% Risk</h2>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Charts Section */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div variants={itemVariants}>
              <Card className="card-modern">
                <CardHeader>
                  <CardTitle>Revenue & Volume Trends</CardTitle>
                  <CardDescription>Performance comparison over time</CardDescription>
                </CardHeader>
                <CardContent className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={REVENUE_DATA}>
                      <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(0.91 0.01 245)" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'var(--card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                        itemStyle={{ color: 'var(--primary)' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="var(--primary)" 
                        strokeWidth={3} 
                        fillOpacity={1} 
                        fill="url(#colorRev)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div variants={itemVariants}>
                <Card className="card-modern h-full">
                  <CardHeader>
                    <CardTitle>Delivery Distribution</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[250px] flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={DELIVERY_PERFORMANCE}
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {DELIVERY_PERFORMANCE.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-2 ml-4">
                      {DELIVERY_PERFORMANCE.map((item) => (
                        <div key={item.name} className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-xs font-medium">{item.name} ({item.value}%)</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="card-modern h-full">
                  <CardHeader>
                    <CardTitle>Volume by Township</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={TOWNSHIP_DATA}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(0.91 0.01 245)" />
                        <XAxis dataKey="township" axisLine={false} tickLine={false} fontSize={10} />
                        <YAxis axisLine={false} tickLine={false} />
                        <Tooltip cursor={{fill: 'var(--muted)'}} />
                        <Bar dataKey="volume" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>

          {/* Insights & Customer Column */}
          <div className="space-y-6">
            <motion.div variants={itemVariants}>
              <Card className="card-glass border-primary/20">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BrainCircuit className="w-5 h-5 text-primary" />
                    AI Logi-Sense Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {PREDICTIVE_INSIGHTS.map((insight, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-background/50 border border-border/50 hover:border-primary/30 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">{insight.icon}</div>
                        <div>
                          <p className="text-sm font-semibold">{insight.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">{insight.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full text-xs">
                    Generate Full AI Report
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="card-modern">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Top Customers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {TOP_CUSTOMERS.map((customer, idx) => (
                      <div key={idx} className="flex items-center justify-between group cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold">
                            {customer.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium group-hover:text-primary transition-colors">{customer.name}</p>
                            <p className="text-xs text-muted-foreground">{customer.orders} Orders</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-mono">{customer.spent}</p>
                          <p className={`text-xs ${customer.growth.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                            {customer.growth}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button variant="ghost" className="w-full mt-4 text-xs flex items-center justify-center gap-1">
                    View All Customers
                    <ChevronRight className="w-3 h-3" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="card-modern bg-gradient-to-br from-primary/5 to-transparent border-primary/10">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-primary text-primary-foreground rounded-lg">
                      <Filter className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold">Quick Analytics</h3>
                      <p className="text-xs text-muted-foreground">Filter by region or category</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" className="text-xs">Electronics</Button>
                    <Button variant="outline" size="sm" className="text-xs">Fashion</Button>
                    <Button variant="outline" size="sm" className="text-xs">North Hub</Button>
                    <Button variant="outline" size="sm" className="text-xs">South Hub</Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default MerchantAnalytics;

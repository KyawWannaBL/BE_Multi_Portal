import React, { useState } from 'react';
import {
  TrendingUp,
  Users,
  Target,
  Megaphone,
  BarChart3,
  Plus,
  Filter,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  MoreVertical,
  Mail,
  MessageSquare,
  Bell,
  Layers
} from 'lucide-react';
import { motion } from 'framer-motion';
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
  AreaChart,
  Area,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { useAuth } from '@/hooks/useAuth';
import { ROUTE_PATHS_ADMIN } from '@/lib/admin-system';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CAMPAIGN_DATA = [
  { name: 'Jan', conversion: 4000, reach: 24000, spend: 2400 },
  { name: 'Feb', conversion: 3000, reach: 13980, spend: 2210 },
  { name: 'Mar', conversion: 2000, reach: 98000, spend: 2290 },
  { name: 'Apr', conversion: 2780, reach: 39080, spend: 2000 },
  { name: 'May', conversion: 1890, reach: 48000, spend: 2181 },
  { name: 'Jun', conversion: 2390, reach: 38000, spend: 2500 },
  { name: 'Jul', conversion: 3490, reach: 43000, spend: 2100 },
];

const SEGMENT_DATA = [
  { name: 'Power Users', value: 400, color: 'var(--primary)' },
  { name: 'Casual', value: 300, color: 'var(--chart-2)' },
  { name: 'At Risk', value: 150, color: 'var(--destructive)' },
  { name: 'New Leads', value: 200, color: 'var(--chart-4)' },
];

const ACTIVE_CAMPAIGNS = [
  {
    id: 'CMP-001',
    title: 'Spring Logistics Expo 2026',
    type: 'Event',
    status: 'Running',
    progress: 65,
    leads: 1240,
    budget: '$15,000',
    roi: '+12.5%',
  },
  {
    id: 'CMP-002',
    title: 'New Merchant Onboarding Boost',
    type: 'Email',
    status: 'Active',
    progress: 82,
    leads: 3500,
    budget: '$5,000',
    roi: '+24.1%',
  },
  {
    id: 'CMP-003',
    title: 'Last-Mile Efficiency Promo',
    type: 'Social',
    status: 'Scheduled',
    progress: 0,
    leads: 0,
    budget: '$8,500',
    roi: 'N/A',
  },
];

const MarketingDashboard: React.FC = () => {
  const { user, legacyUser } = useAuth();
  const [timeRange, setTimeRange] = useState('7d');

  const stats = [
    {
      label: 'Total Conversion',
      value: '24.8%',
      change: '+4.3%',
      trend: 'up',
      icon: TrendingUp,
      color: 'text-primary',
    },
    {
      label: 'Active Segments',
      value: '12',
      change: '+2',
      trend: 'up',
      icon: Layers,
      color: 'text-chart-2',
    },
    {
      label: 'Avg. CAC',
      value: '$12.45',
      change: '-$1.20',
      trend: 'down',
      icon: Target,
      color: 'text-chart-5',
    },
    {
      label: 'Marketing ROI',
      value: '4.2x',
      change: '+0.8x',
      trend: 'up',
      icon: BarChart3,
      color: 'text-primary',
    },
  ];

  return (
    <div className="min-h-screen bg-background p-6 lg:p-10 space-y-8">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Marketing Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {legacyUser?.name || 'Specialist'}. Here's your strategy performance for Feb 2026.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last Quarter</SelectItem>
            </SelectContent>
          </Select>
          <Button className="btn-modern bg-primary text-primary-foreground">
            <Plus className="mr-2 h-4 w-4" /> New Campaign
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="card-modern">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg bg-muted/50 ${stat.color}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <div className={`flex items-center text-xs font-medium ${
                    stat.trend === 'up' ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {stat.trend === 'up' ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                    {stat.change}
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 card-modern">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Conversion Funnel</CardTitle>
              <CardDescription>Performance tracking across multiple channels</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon"><Download className="h-4 w-4" /></Button>
              <Button variant="outline" size="icon"><Filter className="h-4 w-4" /></Button>
            </div>
          </CardHeader>
          <CardContent className="h-[400px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={CAMPAIGN_DATA}>
                <defs>
                  <linearGradient id="colorConv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
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
                  tickFormatter={(value) => `${value/1000}k`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--card)', 
                    borderColor: 'var(--border)',
                    borderRadius: 'var(--radius)',
                    color: 'var(--foreground)'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="reach" 
                  stroke="var(--primary)" 
                  fillOpacity={1} 
                  fill="url(#colorConv)" 
                  strokeWidth={2}
                />
                <Area 
                  type="monotone" 
                  dataKey="conversion" 
                  stroke="var(--chart-2)" 
                  fillOpacity={0.1} 
                  fill="var(--chart-2)" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="card-modern">
          <CardHeader>
            <CardTitle>Audience Segmentation</CardTitle>
            <CardDescription>Current customer tier distribution</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={SEGMENT_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {SEGMENT_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-4 w-full mt-4">
              {SEGMENT_DATA.map((s) => (
                <div key={s.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-xs text-muted-foreground font-medium">{s.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for detailed management */}
      <Tabs defaultValue="campaigns" className="space-y-6">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="campaigns">Active Campaigns</TabsTrigger>
          <TabsTrigger value="tools">Marketing Tools</TabsTrigger>
          <TabsTrigger value="segments">Customer Segments</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns">
          <Card className="card-modern">
            <div className="p-6 border-b border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input className="pl-10" placeholder="Search campaigns..." />
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">Bulk Actions</Button>
                <Button variant="outline" size="sm">Export CSV</Button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-muted/30">
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Campaign</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Performance</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Budget</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Leads</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {ACTIVE_CAMPAIGNS.map((campaign) => (
                    <tr key={campaign.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold">{campaign.title}</span>
                          <span className="text-xs text-muted-foreground">{campaign.type} • {campaign.id}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={campaign.status === 'Running' ? 'default' : campaign.status === 'Active' ? 'secondary' : 'outline'}>
                          {campaign.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="w-32">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium">{campaign.progress}%</span>
                            <span className="text-[10px] text-green-500 font-bold">{campaign.roi}</span>
                          </div>
                          <Progress value={campaign.progress} className="h-1.5" />
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-sm">{campaign.budget}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3 text-muted-foreground" />
                          <span className="font-medium">{campaign.leads.toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="tools">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[ 
              { name: 'Email Marketing', icon: Mail, desc: 'Design and automate email workflows', color: 'bg-blue-500' },
              { name: 'Push Notifications', icon: Bell, desc: 'Real-time alerts for mobile users', color: 'bg-orange-500' },
              { name: 'Customer Chat', icon: MessageSquare, desc: 'Engage visitors with AI-powered chat', color: 'bg-green-500' },
              { name: 'A/B Testing', icon: BarChart3, desc: 'Validate campaign variants', color: 'bg-purple-500' },
              { name: 'Brand Assets', icon: Megaphone, desc: 'Manage logos, banners, and media', color: 'bg-pink-500' },
              { name: 'API Integrations', icon: Target, desc: 'Connect 3rd party marketing stacks', color: 'bg-indigo-500' },
            ].map((tool, idx) => (
              <Card key={idx} className="card-modern group cursor-pointer hover:border-primary/50">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-xl ${tool.color} text-white flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                    <tool.icon className="h-6 w-6" />
                  </div>
                  <h4 className="font-bold text-lg">{tool.name}</h4>
                  <p className="text-sm text-muted-foreground mt-2">{tool.desc}</p>
                  <Button variant="link" className="p-0 h-auto mt-4 group-hover:text-primary transition-colors">
                    Launch Tool <ArrowUpRight className="ml-1 h-3 w-3" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MarketingDashboard;
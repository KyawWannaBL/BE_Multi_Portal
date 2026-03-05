import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  Truck,
  Plus,
  Upload,
  BarChart3,
  FileText,
  Search,
  Settings,
  DollarSign,
  Clock,
  ArrowUpRight,
  ChevronRight,
  Filter,
  Download,
  Calendar
} from 'lucide-react';
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
  Cell
} from 'recharts';

import { 
  ROUTE_PATHS, 
  formatDate, 
  formatCurrency, 
  Shipment, 
  SHIPMENT_STATUS 
} from '@/lib/index';
import { useLanguage } from '@/contexts/LanguageContext';
import { DataEntryForm } from '@/components/DataEntryForm';
import { ShippingCalculator } from '@/components/ShippingCalculator';
import { StatusBadge } from '@/components/StatusBadge';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { IMAGES } from '@/assets/images';

// Mock data for the Merchant Portal
const MOCK_ANALYTICS = [
  { name: 'Mon', shipments: 45, revenue: 125000 },
  { name: 'Tue', shipments: 52, revenue: 148000 },
  { name: 'Wed', shipments: 48, revenue: 132000 },
  { name: 'Thu', shipments: 61, revenue: 185000 },
  { name: 'Fri', shipments: 55, revenue: 162000 },
  { name: 'Sat', shipments: 32, revenue: 95000 },
  { name: 'Sun', shipments: 28, revenue: 78000 },
];

const MOCK_SHIPMENTS: Partial<Shipment>[] = [
  {
    id: 'SHP-001',
    awb_number: 'BRT-2026-992831',
    receiverName: 'Kyaw Zayar',
    destination: 'Mandalay',
    status: 'IN_TRANSIT',
    cod_amount: 45000,
    created_at: '2026-02-18T10:30:00Z',
  },
  {
    id: 'SHP-002',
    awb_number: 'BRT-2026-881273',
    receiverName: 'Hnin Phyu',
    destination: 'Yangon',
    status: 'DELIVERED',
    cod_amount: 0,
    created_at: '2026-02-17T14:20:00Z',
  },
  {
    id: 'SHP-003',
    awb_number: 'BRT-2026-773412',
    receiverName: 'Aung Ko',
    destination: 'Naypyidaw',
    status: 'PENDING',
    cod_amount: 120000,
    created_at: '2026-02-19T08:15:00Z',
  },
];

const MOCK_INVOICES = [
  { id: 'INV-1024', date: '2026-02-15', amount: 850000, status: 'PAID' },
  { id: 'INV-1025', date: '2026-02-19', amount: 420000, status: 'PENDING' },
];

export default function MerchantPortal() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleShipmentSubmit = (data: any) => {
    console.log('Shipment Created:', data);
    setActiveTab('shipments');
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Hero Section */}
      <section className="relative h-[250px] flex items-center overflow-hidden">
        <img 
          src={IMAGES.DASHBOARD_ANALYTICS_3} 
          className="absolute inset-0 w-full h-full object-cover opacity-20"
          alt="Dashboard background"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="outline" className="mb-4 border-primary text-primary px-3 py-1 uppercase tracking-widest text-[10px]">
              Merchant Hub 2026
            </Badge>
            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-2">
              Welcome back, <span className="text-primary">Global Traders Co.</span>
            </h1>
            <p className="text-muted-foreground max-w-lg">
              Manage your logistics pipeline, track revenue, and scale your business with Britium Enterprise.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-6 -mt-10 relative z-20">
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatCard 
            icon={<Package className="w-5 h-5" />} 
            label="Active Shipments" 
            value="142" 
            trend="+12%" 
          />
          <StatCard 
            icon={<DollarSign className="w-5 h-5" />} 
            label="COD Pending" 
            value={formatCurrency(1245000)} 
            trend="+5.4%" 
          />
          <StatCard 
            icon={<Clock className="w-5 h-5" />} 
            label="Pickup Pending" 
            value="8" 
            trend="-2" 
          />
          <StatCard 
            icon={<ArrowUpRight className="w-5 h-5" />} 
            label="Success Rate" 
            value="98.2%" 
            trend="+0.5%" 
          />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 bg-background/80 backdrop-blur-md py-4 z-30 border-b">
            <TabsList className="bg-muted/50 p-1 rounded-xl">
              <TabsTrigger value="dashboard" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <BarChart3 className="w-4 h-4 mr-2" /> Overview
              </TabsTrigger>
              <TabsTrigger value="shipments" className="rounded-lg">
                <Package className="w-4 h-4 mr-2" /> My Shipments
              </TabsTrigger>
              <TabsTrigger value="create" className="rounded-lg">
                <Plus className="w-4 h-4 mr-2" /> Create New
              </TabsTrigger>
              <TabsTrigger value="financials" className="rounded-lg">
                <FileText className="w-4 h-4 mr-2" /> Invoices
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="rounded-full">
                <Calendar className="w-4 h-4 mr-2" /> Feb 2026
              </Button>
              <Button className="luxury-button py-2 px-6 h-9">
                <Download className="w-4 h-4 mr-2" /> Export Report
              </Button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <TabsContent value="dashboard" className="m-0">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              >
                {/* Main Analytics Chart */}
                <Card className="lg:col-span-2 luxury-card">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Shipment Volume</CardTitle>
                        <CardDescription>Daily performance overview for the current week</CardDescription>
                      </div>
                      <Badge variant="secondary">Live 2026</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={MOCK_ANALYTICS}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="name" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1A1D23', border: '1px solid #D4AF37', borderRadius: '12px' }}
                          itemStyle={{ color: '#D4AF37' }}
                        />
                        <Bar dataKey="shipments" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Cost Estimator Sidebar */}
                <div className="space-y-6">
                  <Card className="luxury-card">
                    <CardHeader>
                      <CardTitle className="text-lg">Quick Calculator</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ShippingCalculator embedded />
                    </CardContent>
                  </Card>

                  <Card className="bg-primary/5 border-primary/20 luxury-card">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-primary rounded-xl text-primary-foreground">
                          <Plus className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-bold">Bulk Upload</h4>
                          <p className="text-xs text-muted-foreground">Upload CSV/Excel to create bulk orders</p>
                        </div>
                      </div>
                      <Button className="w-full variant-outline bg-transparent border-primary/50 text-primary hover:bg-primary/10">
                        <Upload className="w-4 h-4 mr-2" /> Select Files
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            </TabsContent>

            <TabsContent value="shipments" className="m-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-4 bg-muted/30 p-4 rounded-2xl border">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input className="pl-10 bg-background border-none shadow-none" placeholder="Search tracking ID, receiver name..." />
                  </div>
                  <Button variant="outline" className="rounded-xl">
                    <Filter className="w-4 h-4 mr-2" /> Filter
                  </Button>
                </div>

                <Card className="luxury-card overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead>Tracking ID</TableHead>
                        <TableHead>Recipient</TableHead>
                        <TableHead>Destination</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>COD Amount</TableHead>
                        <TableHead>Date Created</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {MOCK_SHIPMENTS.map((shipment) => (
                        <TableRow key={shipment.id} className="hover:bg-muted/30">
                          <TableCell className="font-mono text-xs font-bold">{shipment.awb_number}</TableCell>
                          <TableCell>{shipment.receiverName}</TableCell>
                          <TableCell>{shipment.destination}</TableCell>
                          <TableCell>
                            <StatusBadge status={shipment.status || ''} type="shipment" />
                          </TableCell>
                          <TableCell>{shipment.cod_amount ? formatCurrency(shipment.cod_amount) : '-'}</TableCell>
                          <TableCell>{formatDate(shipment.created_at || '')}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon">
                              <ChevronRight className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="create" className="m-0">
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-4xl mx-auto"
              >
                <Card className="luxury-card">
                  <CardHeader>
                    <CardTitle>Register New Shipment</CardTitle>
                    <CardDescription>Enter recipient details and package dimensions to generate a tracking ID</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <DataEntryForm onSubmit={handleShipmentSubmit} mode="create" />
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="financials" className="m-0">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 luxury-card">
                  <CardHeader>
                    <CardTitle>Invoices & Settlements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Invoice #</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Download</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {MOCK_INVOICES.map((inv) => (
                          <TableRow key={inv.id}>
                            <TableCell className="font-bold">{inv.id}</TableCell>
                            <TableCell>{inv.date}</TableCell>
                            <TableCell>{formatCurrency(inv.amount)}</TableCell>
                            <TableCell>
                              <Badge variant={inv.status === 'PAID' ? 'default' : 'outline'} className={inv.status === 'PAID' ? 'bg-success text-success-foreground' : ''}>
                                {inv.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm">
                                <Download className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                <Card className="luxury-card bg-primary text-primary-foreground">
                  <CardHeader>
                    <CardTitle>Wallet Balance</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <p className="text-sm opacity-80">Available for Payout</p>
                      <h2 className="text-4xl font-bold">{formatCurrency(2840000)}</h2>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Pending Settlement</span>
                        <span>{formatCurrency(120000)}</span>
                      </div>
                      <div className="w-full h-1 bg-white/20 rounded-full">
                        <div className="w-[70%] h-full bg-white rounded-full" />
                      </div>
                    </div>
                    <Button className="w-full bg-white text-primary hover:bg-white/90 font-bold uppercase tracking-widest text-[10px]">
                      Request Withdrawal
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </AnimatePresence>
        </Tabs>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend: string;
}

function StatCard({ icon, label, value, trend }: StatCardProps) {
  const isPositive = trend.startsWith('+');

  return (
    <Card className="luxury-card hover:translate-y-[-4px]">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-primary/10 text-primary rounded-lg">
            {icon}
          </div>
          <Badge 
            variant="secondary" 
            className={`text-[10px] ${isPositive ? 'text-success' : 'text-muted-foreground'}`}
          >
            {trend}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mb-1">{label}</p>
        <h3 className="text-2xl font-bold tracking-tight">{value}</h3>
      </CardContent>
    </Card>
  );
}

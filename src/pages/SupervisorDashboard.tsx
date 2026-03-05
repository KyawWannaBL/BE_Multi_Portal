import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  ChevronRight,
  MapPin,
  Package,
  TrendingUp,
  Truck,
  Users,
  Search,
  Filter,
  Download
} from 'lucide-react';
import { 
  formatCurrency, 
  formatDate, 
  Shipment, 
  FleetVehicle, 
} from '@/lib/index';
import { useLanguage } from '@/contexts/LanguageContext';
import { AuditFeed } from '@/components/AuditFeed';
import { FleetStatus } from '@/components/FleetStatus'; // Changed to named import
import { StatusBadge } from '@/components/StatusBadge'; // Changed to named import
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { IMAGES } from '@/assets/images';
import { springPresets, staggerContainer, staggerItem } from '@/lib/motion';

const MOCK_EXCEPTIONS: Shipment[] = [
  {
    id: 'SHP-001',
    trackingNumber: 'BRT-2026-948271',
    senderName: 'Yangon Electronics',
    receiverName: 'U Kyaw Zay Yar',
    origin: 'Yangon',
    destination: 'Mandalay',
    status: 'EXCEPTION',
    priority: 'HIGH',
    created_at: '2026-02-18T10:30:00Z',
    metadata: { reason: 'Address Unreachable' }
  },
  {
    id: 'SHP-002',
    trackingNumber: 'BRT-2026-112345',
    senderName: 'Elite Fashion',
    receiverName: 'Daw Aye Myat',
    origin: 'Bago',
    destination: 'Taunggyi',
    status: 'EXCEPTION',
    priority: 'MEDIUM',
    created_at: '2026-02-19T08:15:00Z',
    metadata: { reason: 'Weather Delay' }
  }
];

const MOCK_VEHICLES: FleetVehicle[] = [
  {
    id: 'V-101',
    plateNumber: 'YGN-7721',
    type: 'TRUCK',
    status: 'ACTIVE',
    currentLocation: { lat: 16.8661, lng: 96.1951 },
    fuelLevel: 85,
    lastService: '2026-01-15'
  },
  {
    id: 'V-102',
    plateNumber: 'MDY-4490',
    type: 'VAN',
    status: 'IN_USE',
    currentLocation: { lat: 21.9588, lng: 96.0891 },
    fuelLevel: 42,
    lastService: '2026-02-01'
  }
];

export default function SupervisorDashboard() {
  const { language } = useLanguage(); // Assuming useLanguage returns language string or object
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Fixed Search Logic
  const filteredExceptions = useMemo(() => {
    return MOCK_EXCEPTIONS.filter(s => 
      s.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.senderName?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const stats = useMemo(() => [
    {
      label: 'Total Shipments',
      value: '1,284',
      change: '+12.5%',
      icon: <Package className="h-5 w-5 text-luxury-gold" />,
      description: 'Active for Feb 2026'
    },
    {
      label: 'Active Routes',
      value: '42',
      change: '+3',
      icon: <Truck className="h-5 w-5 text-luxury-gold" />,
      description: 'Currently monitored'
    },
    {
      label: 'Critical Exceptions',
      value: '08',
      change: '-2',
      icon: <AlertTriangle className="h-5 w-5 text-destructive" />,
      description: 'Immediate action required'
    },
    {
      label: 'Operational Revenue',
      value: formatCurrency(45200000),
      change: '+8.2%',
      icon: <TrendingUp className="h-5 w-5 text-luxury-gold" />,
      description: 'Month to date'
    }
  ], []);

  return (
    <div className="min-h-screen bg-background text-foreground p-6 space-y-8">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Supervisor Command Center</h1>
          <p className="text-muted-foreground">Real-time operational oversight and delivery integrity.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-luxury-gold/30 hover:border-luxury-gold">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button className="bg-luxury-gold text-black hover:bg-luxury-gold/90 font-bold">
            <Activity className="mr-2 h-4 w-4" />
            Live View
          </Button>
        </div>
      </motion.div>

      {/* KPI Bento Grid */}
      <motion.div 
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {stats.map((stat, idx) => (
          <motion.div key={idx} variants={staggerItem}>
            <Card className="luxury-card border-none shadow-xl overflow-hidden relative bg-card/50 backdrop-blur-sm">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-luxury-gold/50 to-transparent" />
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <div className="p-2 rounded-full bg-secondary/50">
                  {stat.icon}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs font-medium ${stat.change.startsWith('+') ? 'text-green-500' : 'text-destructive'}`}>
                    {stat.change}
                  </span>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <Card className="luxury-card border-none bg-card/30">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Shipment Exceptions</CardTitle>
                <CardDescription>Flagged for delays or processing errors.</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search AWB..." 
                    className="pl-9 bg-secondary/30 border-none focus-visible:ring-luxury-gold/50"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative overflow-x-auto rounded-xl">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase bg-secondary/50">
                    <tr>
                      <th className="px-4 py-3">AWB / Tracking</th>
                      <th className="px-4 py-3">Route</th>
                      <th className="px-4 py-3">Reason</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredExceptions.map((shipment) => (
                      <tr key={shipment.id} className="hover:bg-secondary/20 transition-colors">
                        <td className="px-4 py-4">
                          <div className="font-mono font-bold text-luxury-gold">{shipment.trackingNumber}</div>
                          <div className="text-xs text-muted-foreground">{shipment.senderName}</div>
                        </td>
                        <td className="px-4 py-4 text-xs">
                          <div className="flex items-center gap-1 font-medium">
                            <span>{shipment.origin}</span>
                            <ChevronRight className="h-3 w-3 text-muted-foreground" />
                            <span>{shipment.destination}</span>
                          </div>
                          <div className="text-muted-foreground">{formatDate(shipment.created_at || '')}</div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2 text-destructive font-medium text-xs">
                            <AlertTriangle className="h-3 w-3" />
                            {shipment.metadata?.reason}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <StatusBadge status={shipment.status} size="sm" />
                        </td>
                        <td className="px-4 py-4 text-right">
                          <Button variant="ghost" size="sm" className="hover:text-luxury-gold hover:bg-luxury-gold/10">
                            Investigate
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Coverage Map Section */}
          <Card className="luxury-card border-none overflow-hidden h-[400px] relative bg-card/30">
            <img 
              src={IMAGES.DASHBOARD_ANALYTICS_4} 
              className="absolute inset-0 w-full h-full object-cover opacity-10 grayscale"
              alt="Fleet Map"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
            <div className="absolute top-6 left-6 z-10">
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-luxury-gold" />
                Branch Coverage Map
              </CardTitle>
              <p className="text-xs text-muted-foreground">Active delivery clusters for Yangon & Mandalay.</p>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-4 px-8 py-6 luxury-glass rounded-2xl border border-white/10 shadow-2xl">
                <div className="flex items-center justify-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                  <span className="text-sm font-semibold tracking-wider">GPS LINK ACTIVE</span>
                </div>
                <Button className="bg-transparent border border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-black transition-all duration-300 px-8">
                  Open Interactive Map
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="luxury-card border-none bg-card/30">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Fleet Status</CardTitle>
                <StatusBadge status="ACTIVE" size="sm" />
              </div>
            </CardHeader>
            <CardContent>
              <FleetStatus vehicles={MOCK_VEHICLES} />
            </CardContent>
          </Card>

          <Card className="luxury-card border-none bg-card/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">System Audit</CardTitle>
              <CardDescription>Recent administrative actions.</CardDescription>
            </CardHeader>
            <CardContent>
              <AuditFeed maxEntries={5} />
            </CardContent>
          </Card>

          <Card className="luxury-card border-none bg-gradient-to-br from-luxury-gold/15 to-transparent border border-luxury-gold/10">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2 uppercase tracking-widest opacity-70">
                <Users className="h-4 w-4" />
                Branch Capacity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] uppercase font-bold tracking-tighter">
                  <span className="text-muted-foreground">Active Riders</span>
                  <span className="text-luxury-gold">28 / 35</span>
                </div>
                <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden border border-white/5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '80%' }}
                    transition={springPresets.slow}
                    className="h-full bg-luxury-gold" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] uppercase font-bold tracking-tighter">
                  <span className="text-muted-foreground">Warehouse Load</span>
                  <span className="text-destructive">92%</span>
                </div>
                <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden border border-white/5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '92%' }}
                    transition={springPresets.slow}
                    className="h-full bg-destructive" 
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
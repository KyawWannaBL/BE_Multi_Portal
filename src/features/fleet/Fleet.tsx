import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Truck,
  Fuel,
  Wrench,
  Navigation2,
  Search,
  Filter,
  Activity,
  Users,
  Map as MapIcon,
  List,
  Calendar,
  AlertTriangle,
  Zap,
  ChevronRight,
  Plus
} from 'lucide-react';
import { IMAGES } from '@/assets/images';
import { FleetVehicle, ROUTE_PATHS, getStatusVariant } from '@/lib/index';
import { useLanguage } from '@/contexts/LanguageContext';
import { FleetStatus } from '@/components/FleetStatus';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

const MOCK_VEHICLES: FleetVehicle[] = [
  {
    id: 'V-001',
    plateNumber: 'NY-8829-TR',
    type: 'TRUCK',
    status: 'ACTIVE',
    currentLocation: { lat: 40.7128, lng: -74.0060 },
    assignedRiderId: 'R-101',
    fuelLevel: 82,
    lastService: '2026-01-15',
  },
  {
    id: 'V-002',
    plateNumber: 'CA-2210-VN',
    type: 'VAN',
    status: 'ACTIVE',
    currentLocation: { lat: 34.0522, lng: -118.2437 },
    assignedRiderId: 'R-105',
    fuelLevel: 45,
    lastService: '2025-12-10',
  },
  {
    id: 'V-003',
    plateNumber: 'TX-4491-MC',
    type: 'MOTORCYCLE',
    status: 'IN_USE',
    currentLocation: { lat: 29.7604, lng: -95.3698 },
    assignedRiderId: 'R-112',
    fuelLevel: 95,
    lastService: '2026-02-01',
  },
  {
    id: 'V-004',
    plateNumber: 'FL-3382-TR',
    type: 'TRUCK',
    status: 'MAINTENANCE',
    currentLocation: { lat: 25.7617, lng: -80.1918 },
    fuelLevel: 12,
    lastService: '2026-02-16',
  },
  {
    id: 'V-005',
    plateNumber: 'IL-5563-VN',
    type: 'VAN',
    status: 'ACTIVE',
    currentLocation: { lat: 41.8781, lng: -87.6298 },
    assignedRiderId: 'R-120',
    fuelLevel: 68,
    lastService: '2026-01-20',
  },
];

const MetricsCard = ({ title, value, icon: Icon, trend }: any) => (
  <Card className="luxury-card overflow-hidden">
    <CardContent className="p-6">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{title}</p>
          <h3 className="text-2xl font-bold font-mono">{value}</h3>
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trend.isPositive ? 'text-emerald-500' : 'text-destructive'}`}>
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              <span>{trend.value}% vs last month</span>
            </div>
          )}
        </div>
        <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
          <Icon className="w-5 h-5 text-primary" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const MapMock = () => (
  <div className="relative w-full h-[600px] bg-muted rounded-2xl overflow-hidden border border-border group">
    <div 
      className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity transition-transform duration-[2000ms] group-hover:scale-105"
      style={{ backgroundImage: `url(${IMAGES.DELIVERY_FLEET_3})` }}
    />
    <div className="absolute inset-0 bg-gradient-to-br from-background/80 via-transparent to-background/40" />
    
    {/* Mock Map Markers */}
    {MOCK_VEHICLES.map((v, i) => (
      <motion.div
        key={v.id}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: i * 0.1, type: 'spring', stiffness: 200 }}
        className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 group/marker z-10"
        style={{
          left: `${20 + (i * 15)}%`,
          top: `${30 + (i * 10)}%`,
        }}
      >
        <div className="relative flex flex-col items-center">
          <div className={`p-2 rounded-full shadow-luxury border-2 transition-all duration-300 group-hover/marker:scale-125 ${
            v.status === 'MAINTENANCE' ? 'bg-destructive border-destructive-foreground' : 'bg-primary border-primary-foreground'
          }`}>
            <Truck className="w-4 h-4 text-primary-foreground" />
          </div>
          <div className="mt-2 bg-card/90 backdrop-blur-md px-3 py-1 rounded-lg border border-border text-[10px] font-mono whitespace-nowrap opacity-0 group-hover/marker:opacity-100 transition-all shadow-xl">
            <div className="font-bold">{v.plateNumber}</div>
            <div className="text-muted-foreground">{v.fuelLevel}% Fuel Remaining</div>
          </div>
        </div>
      </motion.div>
    ))}

    {/* Map Controls */}
    <div className="absolute bottom-6 right-6 flex flex-col gap-3 z-20">
      <Button size="icon" variant="secondary" className="rounded-xl luxury-glass hover:bg-primary/20">
        <Zap className="w-4 h-4" />
      </Button>
      <Button size="icon" variant="secondary" className="rounded-xl luxury-glass hover:bg-primary/20">
        <Navigation2 className="w-4 h-4" />
      </Button>
    </div>

    <div className="absolute top-6 left-6 bg-background/95 backdrop-blur-md p-4 rounded-xl border border-border shadow-2xl z-20">
      <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-3">Real-time Fleet Status</h4>
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" />
          <span className="text-xs font-semibold">42 Active Vehicles</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-destructive shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
          <span className="text-xs font-semibold">5 In Maintenance</span>
        </div>
      </div>
    </div>
  </div>
);

export default function Fleet() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('map');

  const filteredVehicles = MOCK_VEHICLES.filter(v => 
    v.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-8 p-6 lg:p-10 max-w-[1600px] mx-auto w-full min-h-screen bg-background text-foreground">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Badge variant="outline" className="mb-3 border-primary/30 text-primary bg-primary/10 px-3 py-1 rounded-full">
            Enterprise Logistics 2026
          </Badge>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground font-heading">
            Fleet Management
          </h1>
          <p className="text-muted-foreground mt-2 max-w-xl">
            Advanced asset monitoring, predictive maintenance, and real-time operational efficiency control center.
          </p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-4"
        >
          <Button variant="outline" className="luxury-glass border-border hover:border-primary/50 gap-2 h-11">
            <Wrench className="w-4 h-4" />
            Maintenance Hub
          </Button>
          <Button className="luxury-button gap-2">
            <Plus className="w-4 h-4" />
            Register Asset
          </Button>
        </motion.div>
      </div>

      {/* Operational Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricsCard 
          title="Active Fleet"
          value="42"
          icon={Truck}
          trend={{ value: 4, isPositive: true }}
        />
        <MetricsCard 
          title="Fuel Efficiency"
          value="78.4%"
          icon={Fuel}
          trend={{ value: 1.2, isPositive: true }}
        />
        <MetricsCard 
          title="In Maintenance"
          value="05"
          icon={AlertTriangle}
          trend={{ value: 2, isPositive: false }}
        />
        <MetricsCard 
          title="Drivers Online"
          value="38"
          icon={Users}
          trend={{ value: 12, isPositive: true }}
        />
      </div>

      {/* Main Content Area */}
      <Tabs defaultValue="map" className="w-full space-y-8" onValueChange={setActiveTab}>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <TabsList className="bg-card/50 border border-border p-1 rounded-xl luxury-glass">
            <TabsTrigger value="map" className="gap-2 px-6 py-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <MapIcon className="w-4 h-4" />
              Live Tracking
            </TabsTrigger>
            <TabsTrigger value="inventory" className="gap-2 px-6 py-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <List className="w-4 h-4" />
              Asset Inventory
            </TabsTrigger>
            <TabsTrigger value="maintenance" className="gap-2 px-6 py-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Calendar className="w-4 h-4" />
              Schedule
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search by plate, ID or rider..."
                className="pl-10 h-11 bg-card/50 border-border focus:border-primary/50 transition-all rounded-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl luxury-glass border-border">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <TabsContent value="map" className="mt-0 focus-visible:outline-none">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              <div className="lg:col-span-8 shadow-luxury">
                <MapMock />
              </div>
              
              <div className="lg:col-span-4">
                <Card className="h-[600px] luxury-card flex flex-col">
                  <CardHeader className="border-b border-border/50 pb-6">
                    <CardTitle className="text-xl flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Activity className="w-5 h-5 text-primary" />
                      </div>
                      Active Feed
                    </CardTitle>
                    <CardDescription>Real-time vehicle telemetry stream</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0 flex-1 overflow-hidden">
                    <ScrollArea className="h-full">
                      <div className="p-6 space-y-4">
                        {filteredVehicles.map((vehicle) => (
                          <div key={vehicle.id} className="p-4 rounded-xl bg-muted/30 border border-border/50 hover:border-primary/30 transition-all cursor-pointer group">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-background border border-border group-hover:bg-primary/5">
                                  <Truck className="w-4 h-4 text-primary" />
                                </div>
                                <div>
                                  <p className="font-bold font-mono text-sm">{vehicle.plateNumber}</p>
                                  <p className="text-[10px] text-muted-foreground">{vehicle.type} • ID: {vehicle.id}</p>
                                </div>
                              </div>
                              <StatusBadge status={vehicle.status} type="user" size="sm" />
                            </div>
                            <div className="flex items-center gap-4 mt-4">
                              <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className={`h-full transition-all duration-1000 ${vehicle.fuelLevel < 20 ? 'bg-destructive' : 'bg-primary'}`}
                                  style={{ width: `${vehicle.fuelLevel}%` }}
                                />
                              </div>
                              <span className="text-[10px] font-mono font-bold">{vehicle.fuelLevel}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                  <div className="p-4 border-t border-border/50 bg-muted/20">
                    <Button variant="ghost" className="w-full text-primary hover:bg-primary/10 gap-2 group text-xs uppercase tracking-widest font-bold">
                      Full Analytics
                      <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </div>
                </Card>
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="inventory" className="mt-0 focus-visible:outline-none">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <FleetStatus vehicles={filteredVehicles} realTimeUpdates={true} />
            </motion.div>
          </TabsContent>

          <TabsContent value="maintenance" className="mt-0 focus-visible:outline-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative rounded-3xl overflow-hidden border border-border h-[500px] flex items-center justify-center bg-card/50 shadow-luxury"
            >
               <div 
                 className="absolute inset-0 bg-cover bg-center opacity-10 grayscale mix-blend-overlay"
                 style={{ backgroundImage: `url(${IMAGES.WAREHOUSE_OPS_5})` }}
               />
               <div className="relative z-10 text-center space-y-6 p-8">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto border border-primary/20">
                    <Calendar className="w-10 h-10 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold font-heading">Maintenance Intelligence</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Our AI-driven maintenance scheduler predicts vehicle failure 48 hours in advance using historical telemetry and real-time sensor data.
                    </p>
                  </div>
                  <Button className="luxury-button">
                    Launch Scheduler
                  </Button>
               </div>
            </motion.div>
          </TabsContent>
        </AnimatePresence>
      </Tabs>

      {/* Footer Info */}
      <footer className="flex flex-col md:flex-row justify-between items-center gap-4 py-8 border-t border-border/50 mt-12 text-[10px] font-medium text-muted-foreground uppercase tracking-[0.2em]">
        <p>© 2026 FleetOps Intelligence System • BRT-OS v4.2.0</p>
        <div className="flex gap-8 items-center">
          <span className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" /> 
            GPS Satellite Uplink Active
          </span>
          <span>Last Sync: 2026-02-19 12:44:10</span>
        </div>
      </footer>
    </div>
  );
}

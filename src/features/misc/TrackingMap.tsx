import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Map as MapIcon,
  Navigation,
  Truck,
  Search,
  Filter,
  Layers,
  Activity,
  ShieldAlert,
  ChevronRight,
  Info,
  Battery,
  Wifi,
  Maximize2,
  Minimize2,
  Zap,
  MapPin
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { logisticsAPI, Vehicle, Shipment } from '@/services/logistics-api';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { springPresets } from '@/lib/motion';

const TrackingMap: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [mapType, setMapType] = useState<'standard' | 'satellite' | 'hybrid'>('standard');
  const [viewMode, setViewMode] = useState<'fleet' | 'shipments'>('fleet');

  // Fetch Vehicles
  const { data: vehiclesData, isLoading: isLoadingVehicles } = useQuery({
    queryKey: ['vehicles', (user as any)?.branch_id],
    queryFn: () => logisticsAPI.getVehicles((user as any)?.branch_id),
    refetchInterval: 10000, // Refresh every 10s for real-time feel
  });

  // Fetch Shipments
  const { data: shipmentsData, isLoading: isLoadingShipments } = useQuery({
    queryKey: ['shipments-tracking'],
    queryFn: () => logisticsAPI.getShipments({ status: 'IN_TRANSIT' }),
  });

  const filteredVehicles = useMemo(() => {
    if (!vehiclesData?.vehicles) return [];
    return vehiclesData.vehicles.filter(v => 
      v.vehicle_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.status.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [vehiclesData, searchQuery]);

  const filteredShipments = useMemo(() => {
    if (!shipmentsData?.shipments) return [];
    return shipmentsData.shipments.filter(s => 
      s.awb_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.receiver_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [shipmentsData, searchQuery]);

  // Simulated Geofences for visualization
  const geofences = [
    { id: '1', name: 'Yangon Hub', color: 'var(--primary)', coords: { x: 45, y: 70 }, radius: 100 },
    { id: '2', name: 'Mandalay Branch', color: '#3b82f6', coords: { x: 50, y: 30 }, radius: 80 },
    { id: '3', name: 'Naypyidaw Transit', color: '#10b981', coords: { x: 48, y: 50 }, radius: 60 },
  ];

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-background">
      {/* Left Sidebar: Fleet & Search */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 360 : 0, opacity: isSidebarOpen ? 1 : 0 }}
        className="border-r border-border bg-card/50 backdrop-blur-xl relative z-20 overflow-hidden"
      >
        <div className="w-[360px] flex flex-col h-full">
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold font-heading flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Live Monitoring
              </h2>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                <span className="relative flex h-2 w-2 mr-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                2026 LIVE
              </Badge>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search vehicle or AWB..."
                  className="pl-10 luxury-glass border-white/5"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <Tabs value={viewMode} onValueChange={(v: any) => setViewMode(v)} className="w-full">
                <TabsList className="grid w-full grid-cols-2 luxury-glass">
                  <TabsTrigger value="fleet" className="gap-2">
                    <Truck className="w-4 h-4" /> Fleet
                  </TabsTrigger>
                  <TabsTrigger value="shipments" className="gap-2">
                    <Navigation className="w-4 h-4" /> Tracking
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-4 space-y-3">
              {viewMode === 'fleet' ? (
                filteredVehicles.length > 0 ? (
                  filteredVehicles.map((vehicle) => (
                    <motion.div
                      key={vehicle.id}
                      layout
                      onClick={() => setSelectedVehicle(vehicle)}
                      className={`p-4 rounded-2xl cursor-pointer border transition-all duration-300 ${
                        selectedVehicle?.id === vehicle.id 
                          ? 'bg-primary/10 border-primary/40 shadow-lg shadow-primary/5' 
                          : 'bg-white/5 border-white/5 hover:border-white/10'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold text-sm">{vehicle.vehicle_number}</h3>
                          <p className="text-xs text-muted-foreground">{vehicle.vehicle_type}</p>
                        </div>
                        <Badge 
                          className={vehicle.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/20 text-amber-400 border-amber-500/20'}
                        >
                          {vehicle.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-[10px] text-muted-foreground uppercase tracking-wider">
                        <span className="flex items-center gap-1">
                          <Battery className="w-3 h-3 text-emerald-500" /> 84%
                        </span>
                        <span className="flex items-center gap-1">
                          <Zap className="w-3 h-3 text-amber-500" /> 42 km/h
                        </span>
                        <span className="flex items-center gap-1 ml-auto">
                          <Wifi className="w-3 h-3 text-primary" /> Latency: 42ms
                        </span>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-10 text-muted-foreground">
                    No active vehicles found
                  </div>
                )
              ) : (
                filteredShipments.length > 0 ? (
                  filteredShipments.map((shipment) => (
                    <motion.div
                      key={shipment.id}
                      layout
                      className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/30 cursor-pointer transition-all"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-mono text-primary font-bold">{shipment.awb_number}</span>
                        <Badge variant="outline" className="text-[10px]">{shipment.status}</Badge>
                      </div>
                      <p className="text-sm font-medium truncate">To: {shipment.receiver_name}</p>
                      <div className="mt-2 flex items-center gap-2 text-[10px] text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        <span>{shipment.current_location || 'Updating GPS...'}</span>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-10 text-muted-foreground">
                    No in-transit shipments found
                  </div>
                )
              )}
            </div>
          </ScrollArea>
        </div>
      </motion.aside>

      {/* Main Map View */}
      <main className="flex-1 relative bg-[#0b0c10] overflow-hidden">
        {/* Map Header Controls */}
        <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-10 pointer-events-none">
          <div className="flex items-center gap-3 pointer-events-auto">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="luxury-glass text-white"
            >
              <Layers className="w-4 h-4" />
            </Button>
            <div className="luxury-glass px-4 py-2 rounded-full flex items-center gap-4">
              <div className="flex items-center gap-2 border-r border-white/10 pr-4">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-medium">{vehiclesData?.vehicles?.length || 0} Online</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-medium">2 Alerts</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pointer-events-auto">
            <Select value={mapType} onValueChange={(v: any) => setMapType(v)}>
              <SelectTrigger className="w-32 luxury-glass border-none h-9 text-xs">
                <SelectValue placeholder="Map Type" />
              </SelectTrigger>
              <SelectContent className="bg-luxury-obsidian border-white/10">
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="satellite">Satellite</SelectItem>
                <SelectItem value="hybrid">Hybrid View</SelectItem>
              </SelectContent>
            </Select>
            <Button size="icon" variant="ghost" className="luxury-glass">
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Interactive Map Visual Simulation */}
        <div className="absolute inset-0 z-0">
          {/* Stylized Map Grid */}
          <div className="absolute inset-0 opacity-10" style={{ 
            backgroundImage: 'radial-gradient(circle at 2px 2px, var(--primary) 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
          
          {/* Myanmar Map Representation (SVG) */}
          <svg viewBox="0 0 1000 1000" className="w-full h-full opacity-20 fill-primary/10 stroke-primary/30 stroke-[0.5]">
            <path d="M450,100 L550,150 L600,300 L580,500 L620,700 L550,850 L450,900 L350,850 L380,700 L420,500 L400,300 L450,100 Z" />
            {/* Add geofences */}
            {geofences.map(gf => (
              <g key={gf.id}>
                <circle 
                  cx={gf.coords.x * 10} 
                  cy={gf.coords.y * 10} 
                  r={gf.radius} 
                  fill={gf.color} 
                  fillOpacity="0.1" 
                  stroke={gf.color} 
                  strokeWidth="1" 
                  strokeDasharray="4 4"
                />
                <text 
                  x={gf.coords.x * 10} 
                  y={gf.coords.y * 10 - gf.radius - 10} 
                  className="text-[12px] fill-muted-foreground font-medium"
                  textAnchor="middle"
                >
                  {gf.name}
                </text>
              </g>
            ))}
          </svg>

          {/* Moving Vehicles Simulation */}
          <AnimatePresence>
            {vehiclesData?.vehicles?.map((v, i) => (
              <motion.div
                key={v.id}
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: 1, 
                  x: (450 + Math.sin(Date.now() / 5000 + i) * 150), 
                  y: (500 + Math.cos(Date.now() / 7000 + i) * 250) 
                }}
                className="absolute cursor-pointer z-10"
                onClick={() => setSelectedVehicle(v)}
              >
                <div className="relative">
                  <div className={`p-1.5 rounded-full ${selectedVehicle?.id === v.id ? 'bg-primary ring-4 ring-primary/20 scale-125' : 'bg-white/20 hover:bg-white/40'} transition-all`}>
                    <Truck className="w-4 h-4 text-white" />
                  </div>
                  {selectedVehicle?.id === v.id && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-32 luxury-glass p-2 rounded-lg text-center"
                    >
                      <p className="text-[10px] font-bold">{v.vehicle_number}</p>
                      <p className="text-[8px] text-muted-foreground">In Transit • 42km/h</p>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Vehicle Quick Info Overlay */}
        <AnimatePresence>
          {selectedVehicle && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="absolute bottom-6 right-6 w-80 z-30"
            >
              <Card className="luxury-card border-primary/20 shadow-2xl overflow-hidden">
                <CardHeader className="p-4 border-b border-white/5">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Vehicle Insight</CardTitle>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6"
                      onClick={() => setSelectedVehicle(null)}
                    >
                      <Minimize2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <Truck className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold">{selectedVehicle.vehicle_number}</h4>
                      <p className="text-xs text-muted-foreground">{selectedVehicle.vehicle_type} • {selectedVehicle.make}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                      <p className="text-[8px] uppercase text-muted-foreground">Speed</p>
                      <p className="text-sm font-bold">42.8 km/h</p>
                    </div>
                    <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                      <p className="text-[8px] uppercase text-muted-foreground">Fuel</p>
                      <p className="text-sm font-bold">{(selectedVehicle as any).fuel_level || '65'}%</p>
                    </div>
                    <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                      <p className="text-[8px] uppercase text-muted-foreground">Battery</p>
                      <p className="text-sm font-bold">13.4V</p>
                    </div>
                    <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                      <p className="text-[8px] uppercase text-muted-foreground">Odometer</p>
                      <p className="text-sm font-bold">{selectedVehicle.odometer_reading.toLocaleString()} km</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Current Location:</span>
                      <span className="font-medium">Yangon Central</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Next Destination:</span>
                      <span className="font-medium">Mandalay Hub</span>
                    </div>
                  </div>

                  <Button className="w-full mt-4 luxury-button text-[9px]">
                    OPEN COMMAND CENTER
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Map Key/Legend */}
        <div className="absolute bottom-6 left-6 luxury-glass p-3 rounded-2xl z-10 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-[10px] font-medium">
            <div className="w-2 h-2 rounded-full bg-emerald-500" /> On Schedule
          </div>
          <div className="flex items-center gap-2 text-[10px] font-medium">
            <div className="w-2 h-2 rounded-full bg-amber-500" /> Slight Delay
          </div>
          <div className="flex items-center gap-2 text-[10px] font-medium">
            <div className="w-2 h-2 rounded-full bg-rose-500" /> Exception Alert
          </div>
          <div className="mt-1 pt-2 border-t border-white/10">
            <p className="text-[9px] text-muted-foreground uppercase tracking-widest">Last sync: 2026-02-19 15:03:15</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TrackingMap;
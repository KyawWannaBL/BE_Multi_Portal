import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Clock,
  Navigation,
  CheckCircle2,
  AlertTriangle,
  Truck,
  TrendingUp,
  Package,
  Activity,
  ChevronRight
} from 'lucide-react';
import { GPSTracker } from '@/components/GPSTracker';
import {
  SHIPMENT_STATUS,
  formatDate,
  getStatusVariant,
  ShipmentStatus
} from '@/lib/index';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { springPresets } from '@/lib/motion';
import { cn } from '@/lib/utils';

interface LocationData {
  lat: number;
  lng: number;
  speed?: number;
  heading?: number;
  timestamp: string;
}

interface RouteStop {
  id: string;
  address: string;
  status: ShipmentStatus;
  eta: string;
  customerName: string;
  orderId: string;
}

interface RealTimeTrackingDashboardProps {
  routeId?: string;
  showMap?: boolean;
}

export function RealTimeTrackingDashboard({
  routeId = 'RT-2026-8891',
  showMap = true,
}: RealTimeTrackingDashboardProps) {
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [progress, setProgress] = useState(65);
  const [activeAlerts, setActiveAlerts] = useState<string[]>([]);

  // Mock data for route stops
  const [stops] = useState<RouteStop[]>([
    { id: '1', address: '452 Industrial Pkwy, Sector 7', status: 'DELIVERED', eta: '09:30 AM', customerName: 'Apex Dynamics', orderId: 'ORD-102' },
    { id: '2', address: '88 Gold Coast Plaza, West Wing', status: 'DELIVERED', eta: '10:15 AM', customerName: 'Luxe Interiors', orderId: 'ORD-105' },
    { id: '3', address: '12 Emerald St, Corporate District', status: 'OUT_FOR_DELIVERY', eta: '11:45 AM', customerName: 'Zenith Tech', orderId: 'ORD-109' },
    { id: '4', address: '902 Obsidian Towers, Floor 12', status: 'PENDING', eta: '01:20 PM', customerName: 'Blackwood Legal', orderId: 'ORD-112' },
    { id: '5', address: 'Warehouse B, Logistics Hub', status: 'PENDING', eta: '03:00 PM', customerName: 'Internal Transfer', orderId: 'ORD-115' },
  ]);

  useEffect(() => {
    // Simulate receiving geofencing alerts
    const timer = setTimeout(() => {
      setActiveAlerts(['Route Deviation Detected: Vehicle moved 500m off-path', 'Delayed: Traffic congestion at Sector 7']);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleLocationUpdate = (location: LocationData) => {
    setCurrentLocation(location);
  };

  return (
    <div className="flex flex-col gap-6 w-full min-h-screen bg-background text-foreground p-4 lg:p-8">
      {/* Dashboard Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="border-primary/50 text-primary uppercase tracking-widest text-[10px]">
              Live Tracking
            </Badge>
            <span className="text-muted-foreground text-xs font-mono">Updated: {new Date().toLocaleTimeString()}</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight font-heading">
            Route <span className="text-primary">{routeId}</span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" className="luxury-card border-border hover:bg-muted">
            Optimize Route
          </Button>
          <Button className="luxury-button shadow-luxury">
            Emergency Signal
          </Button>
        </div>
      </header>

      {/* Top Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="luxury-card border-border/50 bg-card/50 backdrop-blur">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground uppercase tracking-wider font-medium">ETA Next Stop</p>
              <Clock className="w-4 h-4 text-primary" />
            </div>
            <div className="text-2xl font-bold font-mono">18 min</div>
            <p className="text-xs text-green-500 flex items-center mt-1">
              <TrendingUp className="w-3 h-3 mr-1" /> On Schedule
            </p>
          </CardContent>
        </Card>

        <Card className="luxury-card border-border/50 bg-card/50 backdrop-blur">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground uppercase tracking-wider font-medium">Distance Left</p>
              <Navigation className="w-4 h-4 text-primary" />
            </div>
            <div className="text-2xl font-bold font-mono">4.2 km</div>
            <p className="text-xs text-muted-foreground mt-1">Total route: 12.8 km</p>
          </CardContent>
        </Card>

        <Card className="luxury-card border-border/50 bg-card/50 backdrop-blur">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground uppercase tracking-wider font-medium">Fuel Status</p>
              <Activity className="w-4 h-4 text-primary" />
            </div>
            <div className="text-2xl font-bold font-mono">82%</div>
            <Progress value={82} className="h-1 mt-2" />
          </CardContent>
        </Card>

        <Card className="luxury-card border-border/50 bg-card/50 backdrop-blur">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground uppercase tracking-wider font-medium">Completed</p>
              <CheckCircle2 className="w-4 h-4 text-primary" />
            </div>
            <div className="text-2xl font-bold font-mono">2 / 5 Stops</div>
            <p className="text-xs text-muted-foreground mt-1">3 shipments remaining</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Map Area */}
        <div className="lg:col-span-8 space-y-4">
          {showMap && (
            <Card className="luxury-card overflow-hidden border-border/50 h-[500px] relative">
              <GPSTracker 
                shipmentId={routeId} 
                onLocationUpdate={handleLocationUpdate as any} 
              />
              
              {/* Overlay for Active Alerts */}
              <AnimatePresence>
                {activeAlerts.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="absolute top-4 left-4 z-10 space-y-2"
                  >
                    {activeAlerts.map((alert, idx) => (
                      <div 
                        key={idx} 
                        className="flex items-center gap-3 bg-destructive/10 border border-destructive/50 backdrop-blur-md px-4 py-3 rounded-xl shadow-xl"
                      >
                        <AlertTriangle className="w-5 h-5 text-destructive animate-pulse" />
                        <p className="text-sm font-medium text-destructive">{alert}</p>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Map Info Overlay */}
              <div className="absolute bottom-4 right-4 z-10">
                <Card className="luxury-glass border-white/10 p-4 min-w-[200px]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <Truck className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase">Current Speed</p>
                      <p className="text-lg font-bold font-mono">{currentLocation?.speed || 42} km/h</p>
                    </div>
                  </div>
                </Card>
              </div>
            </Card>
          )}

          <div className="flex flex-col md:flex-row gap-4">
             <Card className="luxury-card flex-1 border-border/50 bg-card/30">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Package className="w-5 h-5 text-primary" />
                    Current Load
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                   <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total Weight</span>
                      <span className="font-mono font-bold">420.5 kg</span>
                   </div>
                   <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Volume Used</span>
                      <span className="font-mono font-bold">65%</span>
                   </div>
                   <Progress value={65} className="h-1.5" />
                </CardContent>
             </Card>

             <Card className="luxury-card flex-1 border-border/50 bg-card/30">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    Vehicle Health
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                   <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Engine Temp</span>
                      <span className="font-mono text-green-500">Normal (82°C)</span>
                   </div>
                   <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Tire Pressure</span>
                      <span className="font-mono text-amber-500">Low Front-R</span>
                   </div>
                   <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-green-500" style={{ width: '92%' }} />
                   </div>
                </CardContent>
             </Card>
          </div>
        </div>

        {/* Route Timeline Area */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="luxury-card border-border/50 flex flex-col h-full">
            <CardHeader className="border-b border-border/50">
              <CardTitle className="text-xl flex items-center gap-2">
                <Navigation className="w-5 h-5 text-primary" />
                Route Timeline
              </CardTitle>
              <p className="text-sm text-muted-foreground">Progress Overview</p>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-xs font-medium uppercase tracking-widest">
                   <span>Completion</span>
                   <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            </CardHeader>

            <ScrollArea className="flex-1 p-6">
              <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-primary before:via-border before:to-transparent">
                {stops.map((stop, index) => (
                  <motion.div 
                    key={stop.id} 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, ...springPresets.gentle }}
                    className="relative flex items-start group"
                  >
                    {/* Dot Indicator */}
                    <div className={cn(
                      "absolute left-0 mt-1.5 w-10 h-10 rounded-full border-4 border-background flex items-center justify-center z-10 transition-all duration-300",
                      stop.status === 'DELIVERED' ? "bg-green-500" : 
                      stop.status === 'OUT_FOR_DELIVERY' ? "bg-primary animate-pulse" : "bg-muted"
                    )}>
                      {stop.status === 'DELIVERED' ? (
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      ) : (
                        <span className="text-xs font-bold">{index + 1}</span>
                      )}
                    </div>

                    <div className="ml-14 flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                        <h4 className={cn(
                          "font-bold text-sm",
                          stop.status === 'DELIVERED' ? "text-muted-foreground line-through" : "text-foreground"
                        )}>
                          {stop.customerName}
                        </h4>
                        <Badge variant={getStatusVariant(stop.status) as any} className="text-[9px] uppercase font-bold">
                          {stop.status.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2 flex items-center">
                        <MapPin className="w-3 h-3 mr-1" /> {stop.address}
                      </p>
                      <div className="flex items-center gap-4 text-[10px] text-muted-foreground font-mono">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> ETA {stop.eta}</span>
                        <span className="flex items-center gap-1"><Package className="w-3 h-3" /> {stop.orderId}</span>
                      </div>
                      
                      {stop.status === 'OUT_FOR_DELIVERY' && (
                        <Button variant="outline" size="sm" className="mt-4 w-full text-xs h-8 border-primary/20 hover:bg-primary/10">
                          Contact Rider <ChevronRight className="w-3 h-3 ml-1" />
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>

            <div className="p-6 border-t border-border/50 bg-muted/20">
              <Button className="w-full luxury-button">
                Download Full Route Log
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
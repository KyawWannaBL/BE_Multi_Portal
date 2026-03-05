import React, { useState, useEffect, useMemo } from 'react';
import {
  MapPin,
  Truck,
  Users,
  Calendar,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  UserPlus,
  Navigation,
  Package,
  Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { 
  SHIPMENT_STATUS, 
  formatDate, 
  getStatusVariant,
  UserRole
} from '@/lib/index.ts';

interface Team {
  driver: string;
  rider: string;
  helper: string;
}

interface RouteAssignment {
  id: string;
  zone: string;
  vehicleId: string;
  vehiclePlate: string;
  vehicleType: 'TRUCK' | 'VAN' | 'MOTORCYCLE';
  team: Team;
  shipmentsCount: number;
  loadPercentage: number;
  status: 'READY' | 'IN_PROGRESS' | 'COMPLETED';
  estimatedDuration: string;
}

interface RoutePlanningDashboardProps {
  zone?: string;
  date?: string;
}

export function RoutePlanningDashboard({ 
  zone: initialZone = 'Downtown Core', 
  date: initialDate = '2026-02-18' 
}: RoutePlanningDashboardProps) {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [selectedZone, setSelectedZone] = useState(initialZone);
  const [routes, setRoutes] = useState<RouteAssignment[]>([]);

  // Mock data generator for initial state
  const generateMockRoutes = () => [
    {
      id: 'RT-001',
      zone: 'Downtown Core',
      vehicleId: 'VH-4492',
      vehiclePlate: 'BEX-2026-A',
      vehicleType: 'TRUCK',
      team: {
        driver: 'Marcus Aurelius',
        rider: 'Leo Silva',
        helper: 'Chen Wei'
      },
      shipmentsCount: 42,
      loadPercentage: 85,
      status: 'READY',
      estimatedDuration: '6h 30m'
    },
    {
      id: 'RT-002',
      zone: 'Suburban North',
      vehicleId: 'VH-8821',
      vehiclePlate: 'BEX-2026-B',
      vehicleType: 'VAN',
      team: {
        driver: 'Sarah Jenkins',
        rider: 'Mike Ross',
        helper: 'Elena Rodriguez'
      },
      shipmentsCount: 28,
      loadPercentage: 92,
      status: 'READY',
      estimatedDuration: '5h 15m'
    }
  ] as RouteAssignment[];

  useEffect(() => {
    setRoutes(generateMockRoutes());
  }, []);

  const handleAutoOptimize = () => {
    setIsOptimizing(true);
    // Simulating backend AI optimization and assignment logic
    setTimeout(() => {
      const optimizedRoutes: RouteAssignment[] = [
        ...routes,
        {
          id: `RT-${Math.floor(Math.random() * 900) + 100}`,
          zone: selectedZone,
          vehicleId: 'VH-1102',
          vehiclePlate: 'BEX-2026-C',
          vehicleType: 'MOTORCYCLE',
          team: {
            driver: 'Express Auto',
            rider: 'John Doe',
            helper: 'N/A (Solo)'
          },
          shipmentsCount: 15,
          loadPercentage: 45,
          status: 'READY',
          estimatedDuration: '2h 45m'
        }
      ];
      setRoutes(optimizedRoutes);
      setIsOptimizing(false);
      toast.success('Wayplan generated automatically based on destination clusters and resource availability.');
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-heading">
            Intelligent Route Planning
          </h1>
          <p className="text-muted-foreground">
            Operations Control Center • {formatDate(initialDate)}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Select value={selectedZone} onValueChange={setSelectedZone}>
            <SelectTrigger className="w-[180px] luxury-glass">
              <MapPin className="w-4 h-4 mr-2 text-primary" />
              <SelectValue placeholder="Select Zone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Downtown Core">Downtown Core</SelectItem>
              <SelectItem value="Suburban North">Suburban North</SelectItem>
              <SelectItem value="Industrial West">Industrial West</SelectItem>
              <SelectItem value="Coastal East">Coastal East</SelectItem>
            </SelectContent>
          </Select>

          <Button 
            onClick={handleAutoOptimize} 
            disabled={isOptimizing}
            className="luxury-button"
          >
            {isOptimizing ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Navigation className="w-4 h-4 mr-2" />
            )}
            {isOptimizing ? 'Optimizing...' : 'Auto-Optimize Wayplan'}
          </Button>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[ 
          { label: 'Total Shipments', value: '1,284', icon: Package, color: 'text-blue-500' },
          { label: 'Active Wayplans', value: routes.length.toString(), icon: Layers, color: 'text-primary' },
          { label: 'Available Fleet', value: '24/30', icon: Truck, color: 'text-green-500' },
          { label: 'Personnel Active', value: '72', icon: Users, color: 'text-amber-500' },
        ].map((stat, i) => (
          <Card key={i} className="luxury-card border-none shadow-luxury overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {stat.label}
                  </p>
                  <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                </div>
                <div className={`p-3 rounded-2xl bg-white/5 ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content: Route Table */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2 luxury-card border-none">
          <CardHeader className="border-b border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Wayplan Assignments</CardTitle>
                <CardDescription>Automatically matched drivers, riders, and helpers</CardDescription>
              </div>
              <Badge variant="outline" className="font-mono">2026-Q1 OPS</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[600px]">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border/50">
                    <TableHead className="w-[100px]">ID</TableHead>
                    <TableHead>Resource Team</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Load</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence mode="popLayout">
                    {routes.map((route) => (
                      <motion.tr
                        key={route.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="group hover:bg-white/5 transition-colors border-border/50"
                      >
                        <TableCell className="font-mono font-medium">{route.id}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center text-sm font-semibold">
                              <span className="w-16 text-[10px] text-muted-foreground uppercase">Driver:</span>
                              {route.team.driver}
                            </div>
                            <div className="flex items-center text-sm">
                              <span className="w-16 text-[10px] text-muted-foreground uppercase">Rider:</span>
                              {route.team.rider}
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <span className="w-16 text-[10px] text-muted-foreground uppercase">Helper:</span>
                              {route.team.helper}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-mono text-sm">{route.vehiclePlate}</span>
                            <Badge variant="secondary" className="w-fit text-[9px] mt-1">
                              {route.vehicleType}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="w-[150px]">
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-[10px] text-muted-foreground">
                              <span>{route.shipmentsCount} pkgs</span>
                              <span>{route.loadPercentage}%</span>
                            </div>
                            <Progress value={route.loadPercentage} className="h-1" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={route.status === 'READY' ? 'secondary' : 'default'} 
                            className="bg-primary/10 text-primary border-primary/20"
                          >
                            {route.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" className="hover:bg-primary/20 hover:text-primary">
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Sidebar: Route Details / Map Visualization Placeholder */}
        <div className="space-y-6">
          <Card className="luxury-card border-none bg-gradient-to-br from-card to-background">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Navigation className="w-4 h-4 mr-2 text-primary" />
                Optimization Logic
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl bg-white/5 space-y-3 border border-white/5">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-1 shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    Destinations are clustered using K-means algorithm to minimize travel distance.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-1 shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    Resource assignment based on vehicle capacity and personnel shift balance.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 text-primary mt-1 shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    Real-time traffic data from 2026 API integrated for ETA calculation.
                  </p>
                </div>
              </div>

              <Button variant="outline" className="w-full border-primary/20 hover:bg-primary/10">
                <UserPlus className="w-4 h-4 mr-2" />
                Manual Resource Swap
              </Button>
            </CardContent>
          </Card>

          <Card className="luxury-card border-none overflow-hidden">
            <div className="relative h-64 bg-muted/20 flex items-center justify-center">
              {/* Simulated Map Background */}
              <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=800')] bg-cover grayscale" />
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <p className="mt-2 text-xs font-medium tracking-widest uppercase opacity-60">Live Fleet Map View</p>
                <Button size="sm" variant="link" className="text-primary text-[10px]">
                  Expand Visualizer
                </Button>
              </div>
            </div>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Total Distance</span>
                <span className="font-mono font-bold">412.5 km</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-muted-foreground">Est. Fuel Cost</span>
                <span className="font-mono font-bold">$142.20</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

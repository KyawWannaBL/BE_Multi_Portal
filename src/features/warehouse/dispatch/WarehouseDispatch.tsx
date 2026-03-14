import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Truck,
  Package,
  MapPin,
  ChevronRight,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Navigation,
  Layers,
  BarChart3,
  Clock,
  Printer,
  Plus,
  ArrowRightLeft
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { logisticsAPI, Shipment, Vehicle } from '@/services/logistics-api';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { toast } from 'sonner';
import { springPresets, fadeInUp, staggerContainer, staggerItem } from '@/lib/motion';

export default function WarehouseDispatch() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedShipments, setSelectedShipments] = useState<string[]>([]);
  const [activeVehicle, setActiveVehicle] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [shipmentRes, vehicleRes] = await Promise.all([
        logisticsAPI.getShipments({ status: 'WAREHOUSE_RECEIVED' }),
        logisticsAPI.getVehicles((user as any)?.branch_id, 'AVAILABLE')
      ]);

      if (shipmentRes.success) setShipments(shipmentRes.shipments);
      if (vehicleRes.success) setVehicles(vehicleRes.vehicles);
    } catch (error) {
      console.error('Failed to load dispatch data', error);
      toast.error('Error connecting to logistics server');
    } finally {
      setLoading(false);
    }
  };

  const filteredShipments = useMemo(() => {
    return shipments.filter(s => 
      s.awb_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.receiver_city.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [shipments, searchQuery]);

  const currentVehicle = useMemo(() => 
    vehicles.find(v => v.id === activeVehicle), 
    [vehicles, activeVehicle]
  );

  const currentLoad = useMemo(() => {
    const selected = shipments.filter(s => selectedShipments.includes(s.id));
    const totalWeight = selected.reduce((acc, curr) => acc + (curr.weight || 0), 0);
    const totalVolume = selected.length * 0.5; // Mock volume calculation
    return { weight: totalWeight, volume: totalVolume };
  }, [selectedShipments, shipments]);

  const toggleShipmentSelection = (id: string) => {
    setSelectedShipments(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleDispatch = async () => {
    if (!activeVehicle || selectedShipments.length === 0) {
      toast.warning('Please select a vehicle and at least one shipment');
      return;
    }

    try {
      const promises = selectedShipments.map(id => 
        logisticsAPI.updateShipmentStatus(
          id, 
          'OUT_FOR_DELIVERY', 
          'Warehouse Dispatch Center', 
          user?.id || 'SYSTEM',
          `Assigned to Vehicle ${currentVehicle?.vehicle_number}`
        )
      );

      await Promise.all(promises);
      toast.success(`Successfully dispatched ${selectedShipments.length} parcels`);
      setSelectedShipments([]);
      setActiveVehicle(null);
      fetchData();
    } catch (error) {
      toast.error('Dispatch operation failed');
    }
  };

  const getCapacityColor = (current: number, max: number) => {
    const ratio = current / max;
    if (ratio > 0.9) return 'text-destructive';
    if (ratio > 0.7) return 'text-amber-500';
    return 'text-primary';
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-10 space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-primary font-heading uppercase">
            Dispatch Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Real-time route optimization and load management for Britium Express fleet.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-primary/20 hover:border-primary/50">
            <Printer className="w-4 h-4 mr-2" />
            Print Manifests
          </Button>
          <Button className="luxury-button" onClick={handleDispatch}>
            Start Dispatch
          </Button>
        </div>
      </header>

      <motion.div 
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        <motion.div variants={staggerItem}>
          <Card className="luxury-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <Package className="text-primary h-8 w-8" />
                <Badge variant="outline" className="border-primary/20">Ready</Badge>
              </div>
              <div className="mt-4">
                <p className="text-sm text-muted-foreground font-medium">Pending Shipments</p>
                <h3 className="text-3xl font-bold font-mono">{shipments.length}</h3>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={staggerItem}>
          <Card className="luxury-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <Truck className="text-primary h-8 w-8" />
                <Badge variant="outline" className="border-primary/20">Fleet</Badge>
              </div>
              <div className="mt-4">
                <p className="text-sm text-muted-foreground font-medium">Available Vehicles</p>
                <h3 className="text-3xl font-bold font-mono">{vehicles.length}</h3>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={staggerItem} className="md:col-span-2">
          <Card className="luxury-card h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                Current Load Optimization
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Weight Capacity ({currentLoad.weight} / {currentVehicle?.capacity_weight || 0} kg)</span>
                <span className={getCapacityColor(currentLoad.weight, currentVehicle?.capacity_weight || 1000)}>
                  {Math.round((currentLoad.weight / (currentVehicle?.capacity_weight || 1)) * 100)}%
                </span>
              </div>
              <Progress value={(currentLoad.weight / (currentVehicle?.capacity_weight || 1000)) * 100} className="h-2" />
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="luxury-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Shipment Queue</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search AWB..." 
                      className="pl-10 w-64 bg-background/50"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button variant="outline" size="icon">
                    <Filter className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="max-h-[600px] overflow-auto custom-scrollbar">
                <Table>
                  <TableHeader className="sticky top-0 bg-card z-10">
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>AWB Number</TableHead>
                      <TableHead>Destination</TableHead>
                      <TableHead>Weight</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredShipments.map((shipment) => (
                      <TableRow 
                        key={shipment.id} 
                        className={`transition-colors cursor-pointer hover:bg-white/5 ${selectedShipments.includes(shipment.id) ? 'bg-primary/10' : ''}`}
                        onClick={() => toggleShipmentSelection(shipment.id)}
                      >
                        <TableCell>
                          <div className={`w-5 h-5 rounded border border-primary/50 flex items-center justify-center ${selectedShipments.includes(shipment.id) ? 'bg-primary' : ''}`}>
                            {selectedShipments.includes(shipment.id) && <CheckCircle2 className="w-4 h-4 text-black" />}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono font-medium">{shipment.awb_number}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-semibold">{shipment.receiver_city}</span>
                            <span className="text-xs text-muted-foreground">{shipment.receiver_state}</span>
                          </div>
                        </TableCell>
                        <TableCell>{shipment.weight} kg</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">
                            {shipment.service_type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <ChevronRight className="w-4 h-4 text-primary" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="luxury-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-primary" />
                Vehicle Assignment
              </CardTitle>
              <CardDescription>Assign selected load to a vehicle</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Select Vehicle</label>
                <Select onValueChange={setActiveVehicle} value={activeVehicle || ""}>
                  <SelectTrigger className="bg-background/50 border-primary/20">
                    <SelectValue placeholder="Choose an available truck" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map(v => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.vehicle_number} - {v.vehicle_type} ({v.capacity_weight}kg)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {currentVehicle && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-3"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Vehicle Type</span>
                    <span className="text-sm">{currentVehicle.vehicle_type}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Capacity</span>
                    <span className="text-sm">{currentVehicle.capacity_weight} kg</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Status</span>
                    <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                      Available
                    </Badge>
                  </div>
                </motion.div>
              )}

              <div className="pt-4 border-t border-white/10">
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Selected Load</p>
                    <p className="text-2xl font-bold">{selectedShipments.length} <span className="text-sm font-normal text-muted-foreground">items</span></p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground uppercase">Total Weight</p>
                    <p className="text-2xl font-bold">{currentLoad.weight} <span className="text-sm font-normal text-muted-foreground">kg</span></p>
                  </div>
                </div>
                <Button 
                  className="w-full h-14 luxury-button"
                  disabled={!activeVehicle || selectedShipments.length === 0}
                  onClick={handleDispatch}
                >
                  <Navigation className="w-4 h-4 mr-2" />
                  Confirm Dispatch
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="luxury-card">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" />
                Route Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors border border-white/5">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Navigation className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">Northern Corridor</p>
                  <p className="text-xs text-muted-foreground">12 stops • 45.2 km estimated</p>
                </div>
                <Plus className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors border border-white/5">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Navigation className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">Express Downtown</p>
                  <p className="text-xs text-muted-foreground">8 stops • 12.5 km estimated</p>
                </div>
                <Plus className="w-4 h-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <footer className="flex items-center justify-between text-[10px] text-muted-foreground uppercase tracking-widest pt-10">
        <div className="flex gap-6">
          <span>System Version: v4.2.0-stable</span>
          <span>Last Sync: Just now</span>
        </div>
        <div>© 2026 Britium Express Logistics. All rights reserved.</div>
      </footer>
    </div>
  );
}

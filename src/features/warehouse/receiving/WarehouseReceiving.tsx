import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PackageSearch,
  Scan,
  Database,
  CheckCircle2,
  AlertCircle,
  MapPin,
  ArrowDownToLine,
  History,
  LayoutGrid,
  Search,
  Loader2,
  ClipboardCheck
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { logisticsAPI, Shipment } from '@/services/logistics-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { toast } from 'sonner';
import { springPresets, fadeInUp, staggerContainer, staggerItem } from '@/lib/motion';

const WarehouseReceiving: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [awbInput, setAwbInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [recentShipments, setRecentShipments] = useState<Shipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStorageZone, setSelectedStorageZone] = useState('ZONE-A');

  const STORAGE_ZONES = [
    { id: 'ZONE-A', name: 'Zone A - High Priority', capacity: '85%' },
    { id: 'ZONE-B', name: 'Zone B - Standard', capacity: '42%' },
    { id: 'ZONE-C', name: 'Zone C - Bulky Items', capacity: '15%' },
    { id: 'ZONE-D', name: 'Zone D - International', capacity: '60%' },
  ];

  const fetchRecentShipments = useCallback(async () => {
    try {
      setIsLoading(true);
      // Fetch shipments that are recently updated or in transit to this warehouse
      const response = await logisticsAPI.getShipments({
        limit: 10,
        status: 'IN_TRANSIT'
      });
      if (response.success) {
        setRecentShipments(response.shipments);
      }
    } catch (error) {
      console.error('Failed to fetch shipments:', error);
      toast.error('Failed to load recent shipments');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecentShipments();
  }, [fetchRecentShipments]);

  const handleManualScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!awbInput.trim()) return;

    setIsScanning(true);
    try {
      // Simulate scanning and backend update
      const { success, shipment, tracking_history } = await logisticsAPI.getShipmentTracking(undefined, awbInput);
      
      if (success && shipment) {
        await logisticsAPI.updateShipmentStatus(
          shipment.id,
          'RECEIVED_AT_WAREHOUSE',
          (user as any)?.branch_id || 'MAIN_WH',
          user?.id || 'SYSTEM',
          `Received at bay 04. Assigned to ${selectedStorageZone}`
        );
        
        toast.success(`Package ${awbInput} processed successfully`);
        setAwbInput('');
        fetchRecentShipments();
      } else {
        toast.error('Shipment not found or invalid AWB');
      }
    } catch (error) {
      toast.error('Error processing shipment');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto min-h-screen bg-background text-foreground">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
          <h1 className="text-3xl font-bold tracking-tight text-luxury-gold flex items-center gap-3">
            <ArrowDownToLine className="w-8 h-8" />
            Warehouse Receiving Bay
          </h1>
          <p className="text-muted-foreground mt-1">
            Managing inbound shipments for Branch: <span className="text-foreground font-mono font-bold">{(user as any)?.branch_id || 'HQ-WH-01'}</span>
          </p>
        </motion.div>

        <div className="flex items-center gap-3">
          <Badge variant="outline" className="px-4 py-2 border-luxury-gold/30 bg-luxury-gold/5 text-luxury-gold">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse mr-2" />
            Bay 04 - Online
          </Badge>
          <Button variant="outline" size="icon" className="rounded-full border-border/40">
            <History className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Scanning Interface */}
        <motion.div 
          className="lg:col-span-4 space-y-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={springPresets.gentle}
        >
          <Card className="luxury-card overflow-hidden border-luxury-gold/10">
            <CardHeader className="bg-luxury-gold/5 border-b border-luxury-gold/10">
              <CardTitle className="text-lg flex items-center gap-2">
                <Scan className="w-5 h-5 text-luxury-gold" />
                Entry Point Scan
              </CardTitle>
              <CardDescription>Scan QR or enter AWB manually</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleManualScan} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Shipment AWB</label>
                  <div className="relative">
                    <Input 
                      placeholder="Enter AWB Number (e.g. BRX-12345)"
                      value={awbInput}
                      onChange={(e) => setAwbInput(e.target.value)}
                      className="bg-secondary/50 border-luxury-gold/20 focus:border-luxury-gold transition-all font-mono"
                    />
                    <Button 
                      type="submit"
                      disabled={isScanning || !awbInput}
                      className="absolute right-1 top-1 h-8 bg-luxury-gold hover:bg-luxury-dark-gold text-black"
                      size="sm"
                    >
                      {isScanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Storage Assignment</label>
                  <Select value={selectedStorageZone} onValueChange={setSelectedStorageZone}>
                    <SelectTrigger className="bg-secondary/50 border-luxury-gold/20">
                      <SelectValue placeholder="Select Zone" />
                    </SelectTrigger>
                    <SelectContent className="luxury-glass">
                      {STORAGE_ZONES.map(zone => (
                        <SelectItem key={zone.id} value={zone.id}>
                          <div className="flex items-center justify-between w-full min-w-[200px]">
                            <span>{zone.name}</span>
                            <span className="text-xs text-muted-foreground ml-2">{zone.capacity} Full</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="luxury-card border-border/40">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Database className="w-4 h-4 text-luxury-gold" />
                Inventory Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Pending Sorting</span>
                <span className="font-bold">12 Units</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Processed Today</span>
                <span className="font-bold text-green-500">1,248 Units</span>
              </div>
              <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '65%' }}
                  className="h-full bg-luxury-gold"
                />
              </div>
              <p className="text-[10px] text-center text-muted-foreground uppercase tracking-tighter italic">
                Warehouse utilization at optimal levels
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main List Area */}
        <motion.div 
          className="lg:col-span-8"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <Card className="luxury-card border-border/20 h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
              <div>
                <CardTitle className="text-xl">Live Receiving Log</CardTitle>
                <CardDescription>Recent incoming shipments to this bay</CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Filter shipments..."
                  className="pl-8 h-9 bg-secondary/30 border-border/40 rounded-full"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-border/40 overflow-hidden">
                <Table>
                  <TableHeader className="bg-secondary/50">
                    <TableRow className="hover:bg-transparent border-border/40">
                      <TableHead className="w-[150px] font-bold">AWB Number</TableHead>
                      <TableHead className="font-bold">Merchant</TableHead>
                      <TableHead className="font-bold">Type</TableHead>
                      <TableHead className="font-bold">Weight</TableHead>
                      <TableHead className="font-bold">Status</TableHead>
                      <TableHead className="text-right font-bold">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence mode="popLayout">
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={6} className="h-32 text-center">
                            <Loader2 className="w-8 h-8 animate-spin mx-auto text-luxury-gold" />
                            <p className="mt-2 text-sm text-muted-foreground">Loading shipments...</p>
                          </TableCell>
                        </TableRow>
                      ) : recentShipments.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="h-32 text-center">
                            <PackageSearch className="w-8 h-8 mx-auto text-muted-foreground/30 mb-2" />
                            <p className="text-muted-foreground">No shipments in queue</p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        recentShipments.map((shipment) => (
                          <motion.tr 
                            key={shipment.id} 
                            variants={staggerItem}
                            layout
                            className="group hover:bg-luxury-gold/5 transition-colors border-border/40"
                          >
                            <TableCell className="font-mono font-medium text-luxury-gold">{shipment.awb_number}</TableCell>
                            <TableCell className="text-sm">{shipment.sender_name || 'N/A'}</TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="bg-luxury-gold/10 text-luxury-gold border-none text-[10px]">
                                {shipment.package_type}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">{shipment.weight}kg</TableCell>
                            <TableCell>
                              <Badge className="bg-amber-500/20 text-amber-500 border-none text-[10px] animate-pulse">
                                {shipment.status.replace('_', ' ')}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" className="h-8 text-luxury-gold hover:text-luxury-dark-gold hover:bg-luxury-gold/10">
                                <ClipboardCheck className="w-4 h-4 mr-2" />
                                Sort
                              </Button>
                            </TableCell>
                          </motion.tr>
                        ))
                      )}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </div>

              <div className="mt-6 flex items-center justify-between text-xs text-muted-foreground">
                <p className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  Last update: {new Date().toLocaleTimeString()}
                </p>
                <p>Showing {recentShipments.length} active shipments</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Storage Visualizer Section (Small Widgets) */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STORAGE_ZONES.map((zone) => (
          <motion.div
            key={zone.id}
            whileHover={{ y: -5 }}
            className="p-4 rounded-xl luxury-glass border-border/40 flex flex-col gap-2"
          >
            <div className="flex justify-between items-center">
              <LayoutGrid className="w-4 h-4 text-luxury-gold" />
              <span className="text-[10px] font-bold text-luxury-gold uppercase tracking-tighter">{zone.id}</span>
            </div>
            <div className="mt-2">
              <h4 className="text-sm font-semibold truncate">{zone.name}</h4>
              <div className="flex items-end justify-between mt-1">
                <p className="text-xs text-muted-foreground">Capacity</p>
                <p className="text-sm font-mono font-bold">{zone.capacity}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </section>
    </div>
  );
};

export default WarehouseReceiving;
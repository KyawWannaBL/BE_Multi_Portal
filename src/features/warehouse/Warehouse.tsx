import React, { useState } from 'react';
import {
  Package,
  ArrowDownToLine,
  ArrowUpFromLine,
  Boxes,
  ScanLine,
  LayoutDashboard,
  ClipboardList,
  CheckCircle2,
  Clock,
  Search,
  AlertCircle,
  ChevronRight,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import {
  SHIPMENT_STATUS,
  formatDate,
  formatWeight,
  getStatusVariant,
  type Shipment
} from '@/lib/index';
import { QRScanner } from '@/components/QRScanner';
import { StatusBadge } from '@/components/StatusBadge';
import { IMAGES } from '@/assets/images';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';

// Mock data for warehouse inventory (Context: Feb 2026)
const MOCK_INVENTORY: Shipment[] = [
  {
    id: '1',
    trackingNumber: 'BRT-2026-882931',
    senderName: 'Global Tech Corp',
    senderAddress: '123 Innovation Way, San Jose, CA',
    senderPhone: '+1 555-0102',
    receiverName: 'Alice Johnson',
    receiverAddress: '456 Oak St, Seattle, WA',
    receiverPhone: '+1 555-0199',
    origin: 'San Jose, CA',
    destination: 'Seattle, WA',
    status: 'AT_HUB',
    weight: 12.5,
    dimensions: '30x20x15 cm',
    created_at: '2026-02-15T10:00:00Z',
    updated_at: '2026-02-16T14:30:00Z',
    estimated_delivery: '2026-02-18T17:00:00Z',
    isPriority: true,
  },
  {
    id: '2',
    trackingNumber: 'BRT-2026-112044',
    senderName: 'Green Energy Ltd',
    senderAddress: '789 Solar Rd, Austin, TX',
    senderPhone: '+1 555-0204',
    receiverName: 'Bob Smith',
    receiverAddress: '321 Pine Ln, Portland, OR',
    receiverPhone: '+1 555-0288',
    origin: 'Austin, TX',
    destination: 'Portland, OR',
    status: 'AT_HUB',
    weight: 45.2,
    dimensions: '100x80x60 cm',
    created_at: '2026-02-16T09:15:00Z',
    updated_at: '2026-02-17T08:00:00Z',
    estimated_delivery: '2026-02-19T12:00:00Z',
    isPriority: false,
  },
  {
    id: '3',
    trackingNumber: 'BRT-2026-554109',
    senderName: 'Precision Tools Inc',
    senderAddress: '55 Industrial Blvd, Chicago, IL',
    senderPhone: '+1 555-0311',
    receiverName: 'Charlie Davis',
    receiverAddress: '777 Maple Dr, Denver, CO',
    receiverPhone: '+1 555-0377',
    origin: 'Chicago, IL',
    destination: 'Denver, CO',
    status: 'AT_HUB',
    weight: 2.8,
    dimensions: '15x10x5 cm',
    created_at: '2026-02-17T07:45:00Z',
    updated_at: '2026-02-17T11:20:00Z',
    estimated_delivery: '2026-02-18T10:00:00Z',
    isPriority: true,
  }
];

export default function Warehouse() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleScan = (code: string) => {
    setScanResult(code);
    setIsScanning(false);
    // Process scanned code logic here (e.g., fetch details, update state)
  };

  const filteredInventory = MOCK_INVENTORY.filter(item => 
    item.trackingNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.receiverName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 p-6 min-h-screen bg-background">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-heading">
            Warehouse Operations
          </h1>
          <p className="text-muted-foreground">
            Manage inventory, receiving, and dispatching for Branch #WA-042 (North Seattle Hub)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Dialog open={isScanning} onOpenChange={setIsScanning}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 shadow-lg luxury-button px-6">
                <ScanLine className="mr-2 h-4 w-4" />
                Scan QR Code
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md luxury-glass border-primary/20">
              <DialogHeader>
                <DialogTitle className="font-heading text-xl">Warehouse Scanner</DialogTitle>
              </DialogHeader>
              <div className="aspect-square relative rounded-2xl overflow-hidden bg-black/40 border border-white/10">
                <QRScanner onScan={handleScan} />
              </div>
              <p className="text-center text-sm text-muted-foreground mt-4">
                Position the tracking QR code within the frame to process inbound/outbound
              </p>
            </DialogContent>
          </Dialog>
          <Button variant="outline" className="border-border/50">
            <ClipboardList className="mr-2 h-4 w-4" />
            Stock Count
          </Button>
        </div>
      </div>

      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[ 
          { title: 'Total Inventory', value: MOCK_INVENTORY.length, icon: Boxes, trend: 12, pos: true },
          { title: 'Inbound Today', value: 24, icon: ArrowDownToLine, trend: 5, pos: true },
          { title: 'Pending Dispatch', value: 8, icon: ArrowUpFromLine, trend: 2, pos: false },
          { title: 'Storage Capacity', value: '78%', icon: LayoutDashboard, trend: null }
        ].map((metric, i) => (
          <Card key={i} className="luxury-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <metric.icon className="h-5 w-5 text-primary" />
                </div>
                {metric.trend !== null && (
                  <div className={`flex items-center text-xs font-bold ${metric.pos ? 'text-green-500' : 'text-destructive'}`}>
                    {metric.pos ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                    {metric.trend}%
                  </div>
                )}
              </div>
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">{metric.title}</p>
                <h3 className="text-2xl font-bold mt-1 font-mono">{metric.value}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border/50 shadow-sm luxury-glass">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="font-heading">Shipment Management</CardTitle>
                  <CardDescription>Monitor and process shipments currently at this hub</CardDescription>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tracking or receiver..."
                    className="pl-9 bg-background/50 border-border/40"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="inventory" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6 bg-muted/20 p-1 rounded-xl">
                  <TabsTrigger value="inventory" className="rounded-lg">In-Stock</TabsTrigger>
                  <TabsTrigger value="receiving" className="rounded-lg">Receiving</TabsTrigger>
                  <TabsTrigger value="dispatch" className="rounded-lg">Dispatch</TabsTrigger>
                </TabsList>

                <TabsContent value="inventory">
                  <div className="rounded-xl border border-border/40 overflow-hidden">
                    <Table>
                      <TableHeader className="bg-muted/30">
                        <TableRow>
                          <TableHead className="w-[160px]">Tracking ID</TableHead>
                          <TableHead>Receiver</TableHead>
                          <TableHead>Weight</TableHead>
                          <TableHead>Arrived At</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredInventory.map((item) => (
                          <TableRow key={item.id} className="hover:bg-primary/5 transition-colors border-border/20">
                            <TableCell className="font-mono font-medium text-primary">
                              {item.trackingNumber}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-medium text-foreground">{item.receiverName}</span>
                                <span className="text-xs text-muted-foreground truncate max-w-[150px]">{item.receiverAddress}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {formatWeight(item.weight || 0)}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {formatDate(item.updated_at || '')}
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={item.status} type="shipment" />
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="icon" className="hover:bg-primary/10">
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {filteredInventory.length === 0 && (
                      <div className="py-12 text-center text-muted-foreground">
                        No shipments found matching your search.
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="receiving">
                  <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-border/40 rounded-2xl bg-muted/5">
                    <div className="bg-primary/10 p-5 rounded-full mb-4">
                      <ArrowDownToLine className="h-10 w-10 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold font-heading">Ready for Inbound Receiving</h3>
                    <p className="text-muted-foreground max-w-sm mb-8 mt-2">
                      Scan incoming shipment QR codes to verify contents and assign storage locations within the hub.
                    </p>
                    <Button onClick={() => setIsScanning(true)} className="luxury-button px-8">
                      <ScanLine className="mr-2 h-4 w-4" />
                      Open Hub Scanner
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="dispatch">
                  <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-border/40 rounded-2xl bg-muted/5">
                    <div className="bg-accent/10 p-5 rounded-full mb-4">
                      <ArrowUpFromLine className="h-10 w-10 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold font-heading">Outbound Dispatch Prep</h3>
                    <p className="text-muted-foreground max-w-sm mb-8 mt-2">
                      Consolidate shipments for specific routes and assign them to riders or line-haul vehicles.
                    </p>
                    <Button variant="secondary" className="px-8 border border-border/40">
                      <Package className="mr-2 h-4 w-4" />
                      Create Manifest
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-6">
          {/* Facility Status Card */}
          <Card className="border-border/50 overflow-hidden luxury-glass">
            <div className="h-36 w-full relative">
              <img 
                src={IMAGES.WAREHOUSE_OPS_2} 
                alt="Warehouse facility" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <Badge className="bg-green-500/80 hover:bg-green-600 mb-2 border-none backdrop-blur-sm">Facility Active</Badge>
                <h4 className="font-bold text-lg text-white font-heading">North Seattle Hub (WA-042)</h4>
              </div>
            </div>
            <CardContent className="pt-5 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Current Shift</span>
                <span className="font-medium">Morning Operations</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Active Staff</span>
                <span className="font-medium">12 Personnel</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Daily Efficiency</span>
                <span className="text-primary font-bold">94.2%</span>
              </div>
              <div className="pt-4 border-t border-border/40">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-3 font-bold">Last Stock Sync: 4m ago</p>
                <Button variant="outline" size="sm" className="w-full text-xs h-9">
                  View Facility Settings
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="border-border/50 luxury-glass">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center font-heading">
                <Clock className="mr-2 h-4 w-4 text-primary" />
                Recent Hub Logs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {[
                { id: 1, type: 'INBOUND', msg: 'BRT-2026-9901 received', time: '5m ago', icon: CheckCircle2, color: 'text-green-500' },
                { id: 2, type: 'DISPATCH', msg: 'Rider R-44 departed', time: '12m ago', icon: ArrowUpFromLine, color: 'text-primary' },
                { id: 3, type: 'ALERT', msg: 'Storage Row C nearly full', time: '28m ago', icon: AlertCircle, color: 'text-amber-500' },
                { id: 4, type: 'INBOUND', msg: 'BRT-2026-1120 processed', time: '45m ago', icon: CheckCircle2, color: 'text-green-500' }
              ].map((log) => (
                <div key={log.id} className="flex gap-3 items-start text-sm group cursor-default">
                  <div className={`mt-1 p-1 rounded-full bg-muted/40 ${log.color}`}>
                    <log.icon className="h-3 w-3" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground group-hover:text-primary transition-colors">{log.msg}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">{log.type}</span>
                      <span className="text-[10px] text-muted-foreground">• {log.time}</span>
                    </div>
                  </div>
                </div>
              ))}
              <Button variant="ghost" className="w-full text-xs text-muted-foreground hover:text-primary mt-2 font-semibold">
                View Full Audit Trail
              </Button>
            </CardContent>
          </Card>

          {/* Image Banner */}
          <div className="rounded-2xl overflow-hidden relative h-44 group shadow-xl">
            <img 
              src={IMAGES.WAREHOUSE_OPS_2}
              alt="Logistics cargo"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-primary/30 mix-blend-multiply group-hover:bg-primary/20 transition-colors" />
            <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
              <div className="bg-background/90 backdrop-blur-md p-5 rounded-2xl shadow-2xl border border-white/10">
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Future Ready</p>
                <p className="text-sm font-bold text-foreground font-heading">Smart Sorting System 2.0</p>
                <p className="text-[10px] text-muted-foreground mt-1">Launching Q2 2026</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scanner Result Overlay */}
      <AnimatePresence>
        {scanResult && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-card border border-primary/30 shadow-2xl rounded-2xl p-5 flex items-center gap-6 z-50 min-w-[320px] luxury-glass"
          >
            <div className="h-12 w-12 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/20">
              <CheckCircle2 className="h-7 w-7 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold font-heading">Shipment Identified</p>
              <p className="text-xs text-muted-foreground font-mono mt-0.5">{scanResult}</p>
            </div>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => setScanResult(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                Dismiss
              </Button>
              <Button size="sm" className="luxury-button px-4 py-2 text-[10px]">
                Process Now
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

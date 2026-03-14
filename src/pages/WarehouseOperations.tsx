import React, { useState, useMemo } from 'react';
import { 
  Box, 
  Truck, 
  QrCode, 
  PackagePlus, 
  ClipboardList, 
  Search, 
  Filter, 
  Download, 
  CheckCircle2,
  ArrowUpRight,
  ArrowDownLeft,
  Layers
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger, 
  DialogFooter
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  SHIPMENT_STATUS, 
  formatDate, 
  formatCurrency, 
  generateTrackingNumber,
  Shipment
} from '@/lib/index';
import { useLanguage } from '@/contexts/LanguageContext';
import { QRScanner } from '@/components/QRScanner';
import { QRCodeGenerator } from '@/components/QRCodeGenerator';
import { StatusBadge } from '@/components/StatusBadge';
import { IMAGES } from '@/assets/images';
import { motion, AnimatePresence } from 'framer-motion';

// Mock Data for Warehouse Stock
const MOCK_WAREHOUSE_ITEMS: Shipment[] = [
  {
    id: '1',
    trackingNumber: 'BRT-2026-882190',
    senderName: 'Yangon Electronics',
    receiverName: 'U Kyaw Zwa',
    destination: 'Mandalay',
    status: 'AT_HUB',
    weight: 2.5,
    created_at: '2026-02-18T10:00:00Z',
    updated_at: '2026-02-19T08:30:00Z',
    cod_amount: 45000,
  },
  {
    id: '2',
    trackingNumber: 'BRT-2026-112093',
    senderName: 'Beauty Bloom Co.',
    receiverName: 'Daw Aye Aye',
    destination: 'Naypyidaw',
    status: 'AT_HUB',
    weight: 0.8,
    created_at: '2026-02-17T14:20:00Z',
    updated_at: '2026-02-19T09:15:00Z',
    cod_amount: 12000,
  },
  {
    id: '3',
    trackingNumber: 'BRT-2026-554122',
    senderName: 'Global Fashion',
    receiverName: 'Ma Nan Khin',
    destination: 'Taunggyi',
    status: 'PICKED_UP',
    weight: 1.2,
    created_at: '2026-02-19T11:00:00Z',
    updated_at: '2026-02-19T11:00:00Z',
    cod_amount: 35000,
  }
];

export default function WarehouseOperations() {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState('inventory');
  const [searchQuery, setSearchQuery] = useState('');
  const [scannedId, setScannedId] = useState<string | null>(null);
  const [inventory, setInventory] = useState<Shipment[]>(MOCK_WAREHOUSE_ITEMS);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [manifestData, setManifestData] = useState<string | null>(null);

  const t = {
    en: {
      title: 'Warehouse Operations',
      subtitle: 'Manage receiving, inventory, and dispatch in real-time.',
      receiving: 'Receiving Bay',
      inventory: 'Inventory Tracking',
      dispatch: 'Dispatch Management',
      manifests: 'Manifests',
      scanPackage: 'Scan Package',
      scanDescription: 'Scan QR code to receive items into the hub',
      stockIn: 'Receive into Stock',
      stockOut: 'Dispatch for Delivery',
      searchPlaceholder: 'Search by AWB or Customer...',
      totalStock: 'Total Stock',
      incoming: 'Incoming Today',
      outgoing: 'Outgoing Today',
      location: 'Hub Location: Yangon North',
      generateManifest: 'Generate Manifest',
      manifestTitle: 'Daily Dispatch Manifest',
    },
    my: {
      title: 'ကုန်လှောင်ရုံ လုပ်ငန်းစဉ်များ',
      subtitle: 'လက်ခံခြင်း၊ စာရင်းအင်းနှင့် ပေးပို့ခြင်းများကို စီမံခန့်ခွဲပါ။',
      receiving: 'ကုန်လက်ခံဌာန',
      inventory: 'ကုန်ပစ္စည်းစာရင်း',
      dispatch: 'ပေးပို့ခြင်းစီမံခန့်ခွဲမှု',
      manifests: 'ကုန်ပစ္စည်းစာရင်းဇယား',
      scanPackage: 'QR ကုဒ်ဖတ်ပါ',
      scanDescription: 'ပစ္စည်းများကို ဟပ်တွင်လက်ခံရန် QR ကုဒ်ကိုဖတ်ပါ',
      stockIn: 'စာရင်းသွင်းမည်',
      stockOut: 'ပေးပို့ရန် ထုတ်မည်',
      searchPlaceholder: 'AWB သို့မဟုတ် ဝယ်ယူသူဖြင့် ရှာဖွေပါ...',
      totalStock: 'စုစုပေါင်းလက်ကျန်',
      incoming: 'ယနေ့အဝင်',
      outgoing: 'ယနေ့အထွက်',
      location: 'တည်နေရာ: ရန်ကုန်မြောက်ပိုင်း',
      generateManifest: 'စာရင်းထုတ်ရန်',
      manifestTitle: 'နေ့စဉ်ပေးပို့မှုစာရင်း',
    }
  };

  const labels = language === 'my' ? t.my : t.en;

  const filteredInventory = useMemo(() => {
    return inventory.filter(item => 
      item.trackingNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.receiverName?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [inventory, searchQuery]);

  const handleScanSuccess = (data: string) => {
    setScannedId(data);
    setIsScannerOpen(false);
    // In production, this would trigger an API call to update status to 'AT_HUB'
    alert(`Package ${data} scanned and registered at hub.`);
  };

  const handleDispatch = (id: string) => {
    setInventory(prev => prev.map(item => 
      item.id === id ? { ...item, status: 'OUT_FOR_DELIVERY' } : item
    ));
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Hero Header Section */}
      <div className="relative h-48 rounded-3xl overflow-hidden">
        <img 
          src={IMAGES.WAREHOUSE_OPS_3} 
          alt="Warehouse"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent p-8 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-primary/20 p-2 rounded-lg">
              <Layers className="text-primary w-6 h-6" />
            </div>
            <Badge variant="outline" className="border-primary/50 text-primary uppercase tracking-widest text-[10px]">
              {labels.location}
            </Badge>
          </div>
          <h1 className="text-3xl font-bold text-foreground">{labels.title}</h1>
          <p className="text-muted-foreground max-w-md">{labels.subtitle}</p>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="luxury-card">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-2xl">
              <Box className="text-blue-500 w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">{labels.totalStock}</p>
              <h3 className="text-2xl font-bold">1,248 <span className="text-sm font-normal text-muted-foreground">units</span></h3>
            </div>
          </CardContent>
        </Card>

        <Card className="luxury-card">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-green-500/10 rounded-2xl">
              <ArrowDownLeft className="text-green-500 w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">{labels.incoming}</p>
              <h3 className="text-2xl font-bold">+342 <span className="text-sm font-normal text-muted-foreground">today</span></h3>
            </div>
          </CardContent>
        </Card>

        <Card className="luxury-card">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-2xl">
              <ArrowUpRight className="text-primary w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">{labels.outgoing}</p>
              <h3 className="text-2xl font-bold">215 <span className="text-sm font-normal text-muted-foreground">pending</span></h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Operations Tabs */}
      <Tabs defaultValue="inventory" className="w-full" onValueChange={setActiveTab}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <TabsList className="bg-secondary/50 p-1 border border-border rounded-xl">
            <TabsTrigger value="inventory" className="rounded-lg gap-2">
              <ClipboardList className="w-4 h-4" /> {labels.inventory}
            </TabsTrigger>
            <TabsTrigger value="receiving" className="rounded-lg gap-2">
              <PackagePlus className="w-4 h-4" /> {labels.receiving}
            </TabsTrigger>
            <TabsTrigger value="dispatch" className="rounded-lg gap-2">
              <Truck className="w-4 h-4" /> {labels.dispatch}
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder={labels.searchPlaceholder}
                className="pl-10 bg-secondary/30 border-border rounded-xl h-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon" className="rounded-xl border-border">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Inventory Tab Content */}
        <TabsContent value="inventory">
          <Card className="luxury-card overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="border-b border-border hover:bg-transparent">
                  <TableHead className="w-[150px]">AWB Number</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Received Date</TableHead>
                  <TableHead className="text-right">COD Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInventory.map((item) => (
                  <TableRow key={item.id} className="border-b border-border/50 hover:bg-primary/5 transition-colors">
                    <TableCell className="font-mono font-medium text-primary">{item.trackingNumber}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold">{item.receiverName}</span>
                        <span className="text-[10px] text-muted-foreground uppercase">From: {item.senderName}</span>
                      </div>
                    </TableCell>
                    <TableCell>{item.destination}</TableCell>
                    <TableCell>
                      <StatusBadge status={item.status} type="shipment" size="sm" />
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDate(item.created_at || '')}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(item.cod_amount || 0)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredInventory.length === 0 && (
              <div className="py-20 flex flex-col items-center justify-center text-muted-foreground">
                <Search className="w-12 h-12 mb-4 opacity-20" />
                <p>No packages found in current inventory</p>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Receiving Tab Content */}
        <TabsContent value="receiving">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="luxury-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <QrCode className="text-primary w-5 h-5" />
                  {labels.scanPackage}
                </CardTitle>
                <CardDescription>{labels.scanDescription}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center py-10">
                {!isScannerOpen ? (
                  <div 
                    className="w-full max-w-xs aspect-square border-2 border-dashed border-border rounded-3xl flex flex-col items-center justify-center gap-4 hover:border-primary/50 cursor-pointer transition-all bg-secondary/20"
                    onClick={() => setIsScannerOpen(true)}
                  >
                    <div className="bg-primary/10 p-4 rounded-full">
                      <QrCode className="w-12 h-12 text-primary" />
                    </div>
                    <span className="text-sm font-medium">Start Scanning</span>
                  </div>
                ) : (
                  <div className="w-full overflow-hidden rounded-2xl">
                    <QRScanner onScan={handleScanSuccess} />
                    <Button 
                      variant="ghost" 
                      className="w-full mt-4"
                      onClick={() => setIsScannerOpen(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="luxury-card">
              <CardHeader>
                <CardTitle className="text-lg">Last Scanned</CardTitle>
                <CardDescription>Recently received packages</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px] pr-4">
                  <div className="space-y-4">
                    {inventory.filter(i => i.status === 'AT_HUB').map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/20 border border-border/50">
                        <div className="flex items-center gap-3">
                          <div className="bg-green-500/10 p-2 rounded-lg">
                            <CheckCircle2 className="text-green-500 w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-mono font-medium">{item.trackingNumber}</p>
                            <p className="text-[10px] text-muted-foreground uppercase">{formatDate(item.updated_at || '')}</p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-none">
                          SUCCESS
                        </Badge>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Dispatch Tab Content */}
        <TabsContent value="dispatch">
          <Card className="luxury-card">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <div>
                <CardTitle className="text-lg">Available for Dispatch</CardTitle>
                <CardDescription>Items ready to be assigned to riders</CardDescription>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="luxury-button" disabled={inventory.filter(i => i.status === 'AT_HUB').length === 0}>
                    {labels.generateManifest}
                  </Button>
                </DialogTrigger>
                <DialogContent className="luxury-glass sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>{labels.manifestTitle}</DialogTitle>
                  </DialogHeader>
                  <div className="flex flex-col items-center py-6 gap-6">
                    <QRCodeGenerator 
                      data={`MANIFEST-${new Date().getTime()}`} 
                      size={200}
                      label={`Yangon North - ${formatDate(new Date().toISOString())}`}
                    />
                    <div className="text-center space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Total items included: {inventory.filter(i => i.status === 'AT_HUB').length}
                      </p>
                      <p className="text-xs font-mono text-primary">M-2026-X-99218</p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" className="rounded-xl">Print Label</Button>
                    <Button className="luxury-button h-auto">Download PDF</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border">
                  <TableHead>AWB</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Weight</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventory.filter(i => i.status === 'AT_HUB').map((item) => (
                  <TableRow key={item.id} className="border-b border-border/30">
                    <TableCell className="font-mono">{item.trackingNumber}</TableCell>
                    <TableCell>{item.destination}</TableCell>
                    <TableCell>{item.weight} kg</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        size="sm" 
                        variant="secondary"
                        className="h-8 rounded-lg"
                        onClick={() => handleDispatch(item.id)}
                      >
                        Assign Rider
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Manifest Section (Bottom) */}
      <div className="mt-12">
        <h2 className="text-xl font-bold mb-4">Recent Hub Manifests</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="luxury-card group hover:scale-[1.02] cursor-pointer">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-xl group-hover:bg-primary transition-colors">
                  <Download className="w-5 h-5 text-primary group-hover:text-primary-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase">Manifest #00{i}</p>
                  <p className="font-semibold text-sm">Yangon - Mandalay</p>
                  <p className="text-[10px] opacity-50">2026-02-1{i} 09:30 AM</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

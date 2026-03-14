import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Package,
  Truck,
  Calendar,
  MessageSquare,
  User,
  QrCode,
  History,
  Bell,
  ChevronRight,
  MapPin,
  Clock,
  Headphones,
  Settings,
  CreditCard,
  CheckCircle2
} from 'lucide-react';
import { IMAGES } from '@/assets/images';
import { 
  ROUTE_PATHS, 
  formatDate, 
  formatCurrency, 
  Shipment, 
  SHIPMENT_STATUS 
} from '@/lib/index';
import { useLanguage } from '@/contexts/LanguageContext';
import { QRScanner } from '@/components/QRScanner';
import { StatusBadge } from '@/components/StatusBadge';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger, 
  DialogFooter 
} from '@/components/ui/dialog';
import { springPresets, fadeInUp, staggerContainer, staggerItem } from '@/lib/motion';

// Mock Data for 2026 Context
const MOCK_SHIPMENTS: Shipment[] = [
  {
    id: 'SH-2026-001',
    trackingNumber: 'BRT-2026-882143',
    status: SHIPMENT_STATUS.OUT_FOR_DELIVERY,
    origin: 'Yangon Hub',
    destination: 'Mandalay District',
    receiverName: 'Aung Kyaw',
    estimated_delivery: '2026-02-20T14:30:00Z',
    cod_amount: 45000,
    history: [
      { id: '1', status: 'OUT_FOR_DELIVERY', location: 'Mandalay Hub', timestamp: '2026-02-19T09:00:00Z', description: 'Package is out for delivery with Rider Thura', performedBy: 'System' },
      { id: '2', status: 'IN_TRANSIT', location: 'Yangon-Mandalay Expressway', timestamp: '2026-02-18T18:00:00Z', description: 'Departed from Yangon Hub', performedBy: 'Dispatch' }
    ]
  },
  {
    id: 'SH-2026-002',
    trackingNumber: 'BRT-2026-119283',
    status: SHIPMENT_STATUS.DELIVERED,
    origin: 'Bago Branch',
    destination: 'Yangon (South)',
    receiverName: 'Aung Kyaw',
    estimated_delivery: '2026-02-15T11:00:00Z',
    actual_delivery: '2026-02-15T10:45:00Z',
    cod_amount: 0,
    history: [
      { id: '3', status: 'DELIVERED', location: 'Recipient Home', timestamp: '2026-02-15T10:45:00Z', description: 'Successfully delivered to recipient', performedBy: 'Rider Min' }
    ]
  }
];

const MOCK_TICKETS = [
  {
    id: 'TKT-1029',
    subject: 'Delivery Delay Inquiry',
    status: 'OPEN',
    priority: 'HIGH',
    createdAt: '2026-02-18T10:00:00Z'
  },
  {
    id: 'TKT-1005',
    subject: 'Update Delivery Address',
    status: 'RESOLVED',
    priority: 'MEDIUM',
    createdAt: '2026-02-10T14:00:00Z'
  }
];

export default function CustomerPortal() {
  const { t } = useLanguage();
  const [trackingId, setTrackingId] = useState('');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    const shipment = MOCK_SHIPMENTS.find(s => s.trackingNumber === trackingId);
    if (shipment) {
      setSelectedShipment(shipment);
    }
  };

  const handleScanSuccess = (data: string) => {
    setTrackingId(data);
    setIsScannerOpen(false);
    const shipment = MOCK_SHIPMENTS.find(s => s.trackingNumber === data);
    if (shipment) setSelectedShipment(shipment);
  };

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Hero Header Section */}
      <header className="relative h-[300px] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={IMAGES.PACKAGE_TRACKING_2} 
            alt="Logistics Tracking" 
            className="w-full h-full object-cover opacity-30"
          />
          <div className="hero-overlay" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={springPresets.gentle}
            className="max-w-2xl"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4 font-heading text-foreground">
              Welcome back, <span className="text-primary">Aung Kyaw</span>
            </h1>
            <p className="text-muted-foreground text-lg mb-8">
              Track your shipments in real-time and manage your logistics effortlessly.
            </p>

            <form onSubmit={handleSearch} className="flex gap-2 p-1 bg-card/80 backdrop-blur border border-border rounded-full shadow-luxury max-w-md">
              <div className="flex-1 relative flex items-center px-4">
                <Search className="absolute left-4 w-5 h-5 text-muted-foreground" />
                <Input 
                  placeholder="Enter Tracking Number (e.g. BRT-2026-...)" 
                  className="border-none bg-transparent focus-visible:ring-0 pl-8"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                />
              </div>
              <Button 
                type="button"
                variant="ghost" 
                size="icon" 
                className="rounded-full"
                onClick={() => setIsScannerOpen(true)}
              >
                <QrCode className="w-5 h-5 text-primary" />
              </Button>
              <Button type="submit" className="rounded-full px-6 bg-primary text-primary-foreground">
                Track
              </Button>
            </form>
          </motion.div>
        </div>
      </header>

      <main className="container mx-auto px-4 -mt-10">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <div className="flex justify-center">
            <TabsList className="bg-card border border-border p-1 rounded-full">
              <TabsTrigger value="overview" className="rounded-full px-6">Overview</TabsTrigger>
              <TabsTrigger value="shipments" className="rounded-full px-6">My Shipments</TabsTrigger>
              <TabsTrigger value="support" className="rounded-full px-6">Support</TabsTrigger>
              <TabsTrigger value="profile" className="rounded-full px-6">Account</TabsTrigger>
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Active Tracking Display */}
              <Card className="md:col-span-2 luxury-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="text-primary w-5 h-5" />
                    Live Tracking
                  </CardTitle>
                  <CardDescription>Real-time status of your most recent shipment</CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedShipment ? (
                    <div className="space-y-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-bold">{selectedShipment.trackingNumber}</h3>
                          <p className="text-sm text-muted-foreground">Estimated Delivery: {formatDate(selectedShipment.estimated_delivery!)}</p>
                        </div>
                        <StatusBadge status={selectedShipment.status} />
                      </div>

                      <div className="relative">
                        <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-border" />
                        <div className="space-y-6 relative">
                          {selectedShipment.history?.map((event, idx) => (
                            <div key={event.id} className="flex gap-4">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center z-10 ${idx === 0 ? 'bg-primary shadow-[0_0_10px_rgba(212,175,55,0.5)]' : 'bg-muted'}`}>
                                <CheckCircle2 className={`w-4 h-4 ${idx === 0 ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between">
                                  <p className={`font-medium ${idx === 0 ? 'text-primary' : 'text-foreground'}`}>{event.status.replace('_', ' ')}</p>
                                  <span className="text-xs text-muted-foreground">{formatDate(event.timestamp)}</span>
                                </div>
                                <p className="text-sm text-muted-foreground">{event.location} - {event.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-12 flex flex-col items-center justify-center text-center opacity-50">
                      <Package className="w-12 h-12 mb-4" />
                      <p>Enter a tracking number above to see live updates</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions & Stats */}
              <div className="space-y-6">
                <Card className="luxury-card border-primary/20 bg-primary/5">
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Schedule</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Expecting a delivery? You can reschedule or choose a pickup point.
                    </p>
                    <Button className="w-full luxury-button h-10">Reschedule</Button>
                  </CardContent>
                </Card>

                <Card className="luxury-card">
                  <CardHeader>
                    <CardTitle className="text-lg">Wallet & COD</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Pending COD</span>
                      <span className="font-bold">{formatCurrency(45000)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Saved Points</span>
                      <Badge variant="secondary" className="bg-luxury-gold/10 text-luxury-gold border-luxury-gold/20">1,250 PTS</Badge>
                    </div>
                    <Button variant="outline" className="w-full rounded-full border-border">Top Up Wallet</Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* My Shipments Tab */}
          <TabsContent value="shipments">
            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {MOCK_SHIPMENTS.map((shipment) => (
                <motion.div key={shipment.id} variants={staggerItem}>
                  <Card className="luxury-card group hover:border-primary/50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <Badge variant="outline" className="font-mono">{shipment.trackingNumber}</Badge>
                      <StatusBadge status={shipment.status} size="sm" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col items-center">
                          <div className="w-2 h-2 rounded-full bg-primary" />
                          <div className="w-px h-6 bg-border" />
                          <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                        </div>
                        <div className="flex flex-col text-sm">
                          <span className="font-medium">{shipment.origin}</span>
                          <span className="text-muted-foreground mt-2">{shipment.destination}</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50 text-xs">
                        <div className="flex flex-col">
                          <span className="text-muted-foreground uppercase">Receiver</span>
                          <span className="font-medium">{shipment.receiverName}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-muted-foreground uppercase">Estimated</span>
                          <span className="font-medium">{formatDate(shipment.estimated_delivery!).split(',')[0]}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-between hover:bg-primary/10 hover:text-primary transition-colors"
                        onClick={() => {
                          setSelectedShipment(shipment);
                          setActiveTab('overview');
                        }}
                      >
                        View Full Details
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </TabsContent>

          {/* Support Tab */}
          <TabsContent value="support">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="lg:col-span-2 luxury-card">
                <CardHeader>
                  <CardTitle>Open a Support Ticket</CardTitle>
                  <CardDescription>Need help with a shipment or have a question? Our team is here 24/7.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Issue Type</Label>
                      <select className="w-full bg-input border border-border rounded-md h-10 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                        <option>Delivery Delay</option>
                        <option>Damaged Item</option>
                        <option>Missing Package</option>
                        <option>Address Change</option>
                        <option>Billing Issue</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Related Tracking ID</Label>
                      <Input placeholder="BRT-2026-..." />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Subject</Label>
                    <Input placeholder="Brief description of the issue" />
                  </div>
                  <div className="space-y-2">
                    <Label>Message Details</Label>
                    <Textarea placeholder="Describe your issue in detail..." className="min-h-[120px]" />
                  </div>
                </CardContent>
                <CardFooter className="justify-end border-t border-border/50 pt-6">
                  <Button className="luxury-button">Submit Ticket</Button>
                </CardFooter>
              </Card>

              <div className="space-y-6">
                <Card className="luxury-card">
                  <CardHeader>
                    <CardTitle className="text-lg">Active Tickets</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {MOCK_TICKETS.map(ticket => (
                      <div key={ticket.id} className="p-4 rounded-xl bg-secondary/50 border border-border flex flex-col gap-2">
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-mono text-primary">{ticket.id}</span>
                          <Badge variant={ticket.status === 'RESOLVED' ? 'default' : 'secondary'} className="text-[10px]">
                            {ticket.status}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium line-clamp-1">{ticket.subject}</p>
                        <span className="text-[10px] text-muted-foreground">{formatDate(ticket.createdAt)}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="luxury-card bg-primary text-primary-foreground">
                  <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                      <Headphones className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold">Direct Support</h3>
                    <p className="text-sm opacity-80">Call our premium customer line for immediate assistance.</p>
                    <Button variant="secondary" className="w-full rounded-full">+95 9 1234 5678</Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Profile/Account Tab */}
          <TabsContent value="profile">
             <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="md:col-span-1 space-y-4">
                  <div className="aspect-square rounded-2xl bg-secondary border border-border flex flex-col items-center justify-center overflow-hidden relative group">
                    <User className="w-16 h-16 text-muted-foreground" />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <span className="text-xs text-white">Change Photo</span>
                    </div>
                  </div>
                  <div className="text-center md:text-left">
                    <h2 className="text-xl font-bold">Aung Kyaw</h2>
                    <p className="text-sm text-muted-foreground">Premium Member</p>
                  </div>
                </div>

                <Card className="md:col-span-3 luxury-card">
                  <CardHeader>
                    <CardTitle>Account Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>Full Name</Label>
                        <Input defaultValue="Aung Kyaw" />
                      </div>
                      <div className="space-y-2">
                        <Label>Email Address</Label>
                        <Input defaultValue="aung.kyaw@example.mm" />
                      </div>
                      <div className="space-y-2">
                        <Label>Phone Number</Label>
                        <Input defaultValue="+95 9 778 123 456" />
                      </div>
                      <div className="space-y-2">
                        <Label>Default Branch</Label>
                        <Input defaultValue="Yangon Downtown" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Primary Delivery Address</Label>
                      <Textarea defaultValue="No. 123, Merchant Road, Kyauktada Township, Yangon, Myanmar" />
                    </div>

                    <div className="pt-6 border-t border-border flex gap-4">
                      <Button className="luxury-button">Save Changes</Button>
                      <Button variant="outline" className="rounded-full">Change Password</Button>
                    </div>
                  </CardContent>
                </Card>
             </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* QR Scanner Modal */}
      <Dialog open={isScannerOpen} onOpenChange={setIsScannerOpen}>
        <DialogContent className="sm:max-w-md bg-luxury-obsidian border-luxury-gold/30">
          <DialogHeader>
            <DialogTitle className="text-luxury-gold">Scan Tracking QR</DialogTitle>
          </DialogHeader>
          <div className="aspect-square w-full bg-black rounded-xl overflow-hidden">
            <QRScanner onScan={handleScanSuccess} />
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsScannerOpen(false)} className="w-full">
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

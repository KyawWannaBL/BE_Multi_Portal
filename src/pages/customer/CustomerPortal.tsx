import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  MapPin,
  Ticket,
  CreditCard,
  Bell,
  Search,
  Plus,
  Settings,
  ArrowRight,
  History,
  User,
  ShieldCheck,
  Clock,
  Truck,
  CheckCircle2,
  HelpCircle,
  Star
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { SHIPMENT_STATUS, ShipmentStatus, MOCK_TOWNSHIPS } from '@/lib/index';
import { ROUTE_PATHS_ADMIN, Customer } from '@/lib/admin-system';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

const springPresets = {
  gentle: { type: "spring", stiffness: 260, damping: 20 },
  stiff: { type: "spring", stiffness: 300, damping: 30 },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: springPresets.gentle },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: springPresets.gentle },
};

// Mock Data for 2026 Portal
const MOCK_SHIPMENTS = [
  {
    id: 'AWB-2026-X9921',
    status: 'OUT_FOR_DELIVERY' as ShipmentStatus,
    origin: 'North District',
    destination: 'Downtown',
    estimatedArrival: 'Today, 2:30 PM',
    courier: 'John Doe',
  },
  {
    id: 'AWB-2026-Y4410',
    status: 'WAREHOUSE_RECEIVED_VERIFIED' as ShipmentStatus,
    origin: 'East Industrial',
    destination: 'South District',
    estimatedArrival: 'Feb 13, 2026',
    courier: 'Pending Assignment',
  },
];

const MOCK_ADDRESSES = [
  { id: 'addr_1', label: 'Home', address: '123 Tech Lane, Downtown, Building A, Apt 402', isDefault: true },
  { id: 'addr_2', label: 'Office', address: '88 Innovation Way, West Waterfront, Floor 12', isDefault: false },
];

const MOCK_TICKETS = [
  { id: 'TIC-001', subject: 'Delayed Package', status: 'In Progress', lastUpdate: '2 hours ago' },
  { id: 'TIC-002', subject: 'Address Change Request', status: 'Resolved', lastUpdate: 'Yesterday' },
];

const CustomerPortal: React.FC = () => {
  const { user, legacyUser } = useAuth();
  const [trackingId, setTrackingId] = useState('');
  const customer = user as unknown as Customer;

  const getStatusColor = (status: ShipmentStatus) => {
    switch (status) {
      case 'DELIVERED_POD_CAPTURED': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'OUT_FOR_DELIVERY': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'DELIVERY_FAILED_NDR': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-primary/10 text-primary border-primary/20';
    }
  };

  return (
    <div className="min-h-screen bg-background/95 pb-20">
      {/* Hero Section with Quick Track */}
      <section className="relative pt-12 pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 -z-10" />
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            variants={fadeInUp} 
            initial="hidden" 
            animate="visible"
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8"
          >
            <div>
              <h1 className="text-4xl font-bold tracking-tight mb-2">
                Welcome back, <span className="text-primary">{legacyUser?.name || 'Valued Customer'}</span>
              </h1>
              <p className="text-muted-foreground text-lg">
                Managing your 2026 deliveries with precision and care.
              </p>
            </div>

            <div className="w-full md:w-[400px] card-glass p-1 flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Enter Tracking ID..."
                  className="border-none bg-transparent focus-visible:ring-0 pl-10 h-12 font-mono"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                />
              </div>
              <Button className="rounded-lg h-10 px-6 btn-modern shadow-lg shadow-primary/20">
                Track
              </Button>
            </div>
          </motion.div>

          {/* Quick Stats / Loyalty */}
          <motion.div 
            variants={staggerContainer} 
            initial="hidden" 
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12"
          >
            <motion.div variants={staggerItem} className="card-modern p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Star className="w-6 h-6 fill-current" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Loyalty Points</p>
                <h3 className="text-2xl font-bold font-mono">1,240</h3>
                <Progress value={65} className="h-1.5 mt-2 w-32" />
                <p className="text-[10px] text-muted-foreground mt-1">260 pts to Gold Tier</p>
              </div>
            </motion.div>

            <motion.div variants={staggerItem} className="card-modern p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Shipments</p>
                <h3 className="text-2xl font-bold font-mono">02</h3>
                <p className="text-xs text-emerald-500 mt-1">1 arriving today</p>
              </div>
            </motion.div>

            <motion.div variants={staggerItem} className="card-modern p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                <Ticket className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Support</p>
                <h3 className="text-2xl font-bold font-mono">01</h3>
                <p className="text-xs text-muted-foreground mt-1 underline cursor-pointer">View ticket #TIC-001</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 -mt-12">
        <Tabs defaultValue="shipments" className="space-y-8">
          <TabsList className="bg-card/50 backdrop-blur-sm border border-border/50 p-1">
            <TabsTrigger value="shipments" className="gap-2">
              <Truck className="w-4 h-4" /> Shipments
            </TabsTrigger>
            <TabsTrigger value="addresses" className="gap-2">
              <MapPin className="w-4 h-4" /> Addresses
            </TabsTrigger>
            <TabsTrigger value="preferences" className="gap-2">
              <Settings className="w-4 h-4" /> Preferences
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="w-4 h-4" /> History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="shipments" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Active Shipments List */}
              <div className="lg:col-span-2 space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  In-Transit Shipments
                </h2>
                <AnimatePresence mode='popLayout'>
                  {MOCK_SHIPMENTS.map((shipment) => (
                    <motion.div
                      key={shipment.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="card-modern p-5 hover:border-primary/30 group"
                    >
                      <div className="flex flex-col sm:flex-row justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <span className="font-mono font-bold text-lg">{shipment.id}</span>
                            <Badge variant="outline" className={getStatusColor(shipment.status)}>
                              {shipment.status.replace(/_/g, ' ')}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {shipment.origin} <ArrowRight className="inline w-3 h-3 mx-1" /> {shipment.destination}
                          </p>
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="text-xs text-muted-foreground uppercase tracking-wider">Est. Delivery</p>
                          <p className="font-semibold">{shipment.estimatedArrival}</p>
                        </div>
                      </div>
                      <Separator className="my-4 opacity-50" />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                            <User className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-medium">Courier: {shipment.courier}</span>
                        </div>
                        <Button variant="ghost" size="sm" className="text-primary group-hover:bg-primary/10">
                          Track Details
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Sidebar Widgets */}
              <div className="space-y-6">
                <Card className="card-glass border-primary/20">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-primary" />
                      Delivery Guard
                    </CardTitle>
                    <CardDescription>Advanced protection for your parcels</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span>Insurance Coverage</span>
                      <Badge className="bg-emerald-500">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Secure Release OTP</span>
                      <Badge variant="outline">Enabled</Badge>
                    </div>
                    <Button className="w-full variant-outline" size="sm">Manage Security</Button>
                  </CardContent>
                </Card>

                <Card className="card-modern">
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Support</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {MOCK_TICKETS.map(ticket => (
                      <div key={ticket.id} className="flex items-center justify-between text-sm group cursor-pointer">
                        <div>
                          <p className="font-medium group-hover:text-primary">{ticket.subject}</p>
                          <p className="text-[10px] text-muted-foreground">{ticket.id} • {ticket.lastUpdate}</p>
                        </div>
                        <Badge variant="secondary" className="text-[10px]">{ticket.status}</Badge>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full gap-2" onClick={() => window.location.href = ROUTE_PATHS_ADMIN.CUSTOMER.SUPPORT}>
                      <HelpCircle className="w-4 h-4" /> Contact Help Center
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="addresses" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MOCK_ADDRESSES.map(addr => (
              <motion.div
                key={addr.id}
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                className="card-modern p-6 space-y-4 relative overflow-hidden group"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold">{addr.label}</h3>
                      {addr.isDefault && <Badge className="h-5">Default</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{addr.address}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">Edit</Button>
                  <Button variant="ghost" size="sm" className="text-destructive">Delete</Button>
                </div>
              </motion.div>
            ))}
            <button className="card-modern border-dashed border-2 p-6 flex flex-col items-center justify-center gap-3 hover:bg-primary/5 transition-colors text-muted-foreground hover:text-primary min-h-[160px]">
              <Plus className="w-8 h-8" />
              <span className="font-medium">Add New Address</span>
            </button>
          </TabsContent>

          <TabsContent value="preferences" className="max-w-3xl">
            <Card className="card-modern">
              <CardHeader>
                <CardTitle>Global Delivery Preferences</CardTitle>
                <CardDescription>Default settings for all your incoming 2026 shipments.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                  <div className="space-y-1">
                    <p className="font-medium">Safe Place Delivery</p>
                    <p className="text-xs text-muted-foreground">Allow courier to leave parcel if no one is home.</p>
                  </div>
                  <Button variant="outline">Configure</Button>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                  <div className="space-y-1">
                    <p className="font-medium">Carbon Neutral Shipping</p>
                    <p className="text-xs text-muted-foreground">Offset carbon for every delivery using loyalty points.</p>
                  </div>
                  <Button variant="outline" className="text-emerald-500 border-emerald-500/30">Enabled</Button>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                  <div className="space-y-1">
                    <p className="font-medium">Weekend Deliveries</p>
                    <p className="text-xs text-muted-foreground">Include Saturday and Sunday in delivery window.</p>
                  </div>
                  <Button variant="outline">Disabled</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <div className="card-modern">
              <div className="p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                  <Package className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold">No past shipments found</h3>
                <p className="text-muted-foreground">Shipments from the last 12 months will appear here.</p>
                <Button variant="outline">Search Archive</Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Floating Support Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-8 right-8 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-2xl flex items-center justify-center z-50 shadow-primary/40"
        onClick={() => window.location.href = ROUTE_PATHS_ADMIN.CUSTOMER.SUPPORT}
      >
        <HelpCircle className="w-7 h-7" />
      </motion.button>
    </div>
  );
};

export default CustomerPortal;
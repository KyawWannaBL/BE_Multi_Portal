import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  MapPin,
  CheckCircle,
  AlertTriangle,
  Camera,
  Signature as SignatureIcon,
  Clock,
  ChevronRight,
  Search,
  Phone,
  Navigation,
  X,
  Check,
  Truck,
  ShieldCheck
} from 'lucide-react';
import { IMAGES } from '@/assets/images';
import {
  Shipment,
  SHIPMENT_STATUS,
  formatDate,
  getStatusVariant,
  ROUTE_PATHS
} from '@/lib/index';
import { useLanguage } from '@/contexts/LanguageContext';
import { SignaturePad } from '@/components/SignaturePad';
import { PhotoCapture } from '@/components/PhotoCapture';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { springPresets, fadeInUp, staggerContainer, staggerItem } from '@/lib/motion';

// Mock data for the Rider's delivery queue in 2026
const MOCK_DELIVERIES: Shipment[] = [
  {
    id: '1',
    awb_number: 'BRT-2026-882901',
    receiverName: 'Alice Henderson',
    receiverAddress: '742 Evergreen Terrace, Springfield, IL',
    receiverPhone: '+1-555-9876',
    package_details: {
      weight: 2.5,
      dimensions: '30x20x15 cm',
      description: 'Electronics Package'
    },
    status: 'OUT_FOR_DELIVERY',
    priority: 'HIGH',
    created_at: '2026-02-18T08:00:00Z',
    updated_at: '2026-02-19T10:30:00Z',
    estimated_delivery: '2026-02-19T18:00:00Z',
    isPriority: true,
    weight: 2.5,
    dimensions: '30x20x15 cm',
    history: [
      { id: 'h1', status: 'AT_HUB', location: 'Yangon Hub', timestamp: '2026-02-18T10:00:00Z', description: 'Sorted at facility', performedBy: 'System' },
      { id: 'h2', status: 'OUT_FOR_DELIVERY', location: 'Mobile', timestamp: '2026-02-19T08:30:00Z', description: 'Assigned to Rider 42', performedBy: 'Dispatcher' }
    ]
  },
  {
    id: '2',
    awb_number: 'BRT-2026-441209',
    receiverName: 'Marcus Chen',
    receiverAddress: '21 Baker Street, London Virtual Hub',
    receiverPhone: '+1-555-3344',
    status: 'OUT_FOR_DELIVERY',
    priority: 'NORMAL',
    created_at: '2026-02-18T10:00:00Z',
    weight: 1.2,
    dimensions: '20x20x10 cm',
    isPriority: false
  },
  {
    id: '3',
    awb_number: 'BRT-2026-119283',
    receiverName: 'Sarah Jenkins',
    receiverAddress: '101 Summit Blvd, Denver, CO',
    receiverPhone: '+1-555-7788',
    status: 'EXCEPTION',
    priority: 'HIGH',
    created_at: '2026-02-17T14:00:00Z',
    weight: 15.0,
    dimensions: '50x50x50 cm',
    isPriority: true
  }
];

export default function Delivery() {
  const { t } = useLanguage();
  const [activeShipment, setActiveShipment] = useState<Shipment | null>(null);
  const [isPodOpen, setIsPodOpen] = useState(false);
  const [isExceptionOpen, setIsExceptionOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Local state for POD capture
  const [podData, setPodData] = useState({
    recipientName: '',
    signature: '',
    photo: ''
  });

  const filteredDeliveries = MOCK_DELIVERIES.filter(d => 
    (d.awb_number || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (d.receiverName || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePodSubmit = () => {
    console.log('POD Submitted for', activeShipment?.id, podData);
    setIsPodOpen(false);
    setActiveShipment(null);
    setPodData({ recipientName: '', signature: '', photo: '' });
    // API call would go here to update status to DELIVERED
  };

  const handleExceptionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Exception Reported for', activeShipment?.id);
    setIsExceptionOpen(false);
    setActiveShipment(null);
    // API call would go here to update status to EXCEPTION
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 space-y-8">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-4xl font-bold tracking-tight font-heading text-foreground">
            Delivery Operations
          </h1>
          <p className="text-muted-foreground mt-1">
            Managing precision logistics & real-time fulfillment • 2026 Fleet System
          </p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }} 
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3 bg-secondary/50 backdrop-blur-md p-2 pr-4 rounded-full border border-border"
        >
          <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
            <Truck className="h-5 w-5 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Rider ID: R-42026</span>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-medium">Online & Tracking Active</span>
            </div>
          </div>
        </motion.div>
      </header>

      {/* Stats Quick Grid */}
      <motion.div 
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {[ 
          { label: 'Pending Tasks', value: '12', color: 'text-primary', icon: Clock },
          { label: 'Completed Today', value: '28', color: 'text-green-500', icon: CheckCircle },
          { label: 'Active Exceptions', value: '02', color: 'text-destructive', icon: AlertTriangle },
          { label: 'Route Score', value: '94%', color: 'text-luxury-gold', icon: ShieldCheck }
        ].map((stat, i) => (
          <motion.div key={i} variants={staggerItem}>
            <Card className="border-border/50 bg-card/30 backdrop-blur-sm luxury-card overflow-hidden">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">{stat.label}</p>
                  <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 opacity-20 ${stat.color}`} />
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Task List */}
        <div className="lg:col-span-4 space-y-6">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Search tracking ID or recipient..." 
              className="pl-12 h-14 bg-card/50 border-border focus-visible:ring-primary rounded-xl"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="w-full grid grid-cols-2 p-1 bg-secondary/50 rounded-xl h-12">
              <TabsTrigger value="pending" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Active Tasks
              </TabsTrigger>
              <TabsTrigger value="route" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Map View
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="pending" className="space-y-4 mt-6">
              <ScrollArea className="h-[calc(100vh-450px)] pr-4">
                {filteredDeliveries.map((delivery) => (
                  <motion.div
                    key={delivery.id}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveShipment(delivery)}
                    className={`cursor-pointer rounded-2xl border p-5 mb-4 transition-all duration-300 shadow-sm ${activeShipment?.id === delivery.id ? 'border-primary bg-primary/5 ring-1 ring-primary/30' : 'bg-card/40 border-border hover:border-primary/40 hover:bg-card/60'}`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <Badge variant="outline" className="font-mono border-primary/20 text-primary bg-primary/5 px-2 py-1">
                        {delivery.awb_number}
                      </Badge>
                      {delivery.isPriority && (
                        <Badge className="bg-luxury-gold text-black border-none animate-pulse">
                          PRIORITY
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-bold text-xl text-foreground">{delivery.receiverName}</h3>
                    <div className="flex items-start gap-2 text-sm text-muted-foreground mt-2">
                      <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                      <span className="line-clamp-1">{delivery.receiverAddress}</span>
                    </div>
                    <div className="flex items-center justify-between mt-6">
                      <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground bg-secondary/80 px-2 py-1 rounded">
                        <Clock className="h-3 w-3" />
                        ETA: {delivery.estimated_delivery ? new Date(delivery.estimated_delivery).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'ASAP'}
                      </div>
                      <ChevronRight className="h-5 w-5 text-primary/40" />
                    </div>
                  </motion.div>
                ))}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="route" className="h-[calc(100vh-450px)] flex flex-col items-center justify-center border-2 border-dashed border-border rounded-2xl bg-muted/10 relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 pointer-events-none">
                <img src={IMAGES.DELIVERY_FLEET_1} alt="Map Overlay" className="w-full h-full object-cover" />
              </div>
              <MapPin className="h-16 w-16 text-primary mb-4 opacity-50" />
              <p className="text-foreground font-bold text-lg">Interactive Route Grid</p>
              <p className="text-sm text-muted-foreground mt-1">Powered by Britium OS 2.0</p>
              <Button variant="outline" className="mt-6 border-primary/50 text-primary hover:bg-primary/10">
                Open Navigation
              </Button>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column: Detail View */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {activeShipment ? (
              <motion.div
                key="details"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={springPresets.gentle}
                className="space-y-8"
              >
                <Card className="border-none shadow-2xl overflow-hidden bg-card/20 backdrop-blur-md rounded-3xl">
                  <div className="h-48 bg-luxury-obsidian relative overflow-hidden">
                    <img 
                      src={IMAGES.DELIVERY_FLEET_4} 
                      alt="Delivery Vehicle" 
                      className="w-full h-full object-cover opacity-20 scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute top-6 right-6 text-foreground hover:bg-white/10 rounded-full h-12 w-12"
                      onClick={() => setActiveShipment(null)}
                    >
                      <X className="h-6 w-6" />
                    </Button>
                    
                    <div className="absolute bottom-6 left-8">
                      <StatusBadge status={activeShipment.status} type="shipment" size="lg" />
                    </div>
                  </div>
                  
                  <CardContent className="px-8 pb-8 pt-6">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-10">
                      <div className="space-y-2">
                        <h2 className="text-4xl font-black font-heading text-foreground">
                          {activeShipment.receiverName}
                        </h2>
                        <p className="text-lg text-muted-foreground flex items-start gap-2 max-w-xl">
                          <MapPin className="h-6 w-6 shrink-0 text-primary" />
                          {activeShipment.receiverAddress}
                        </p>
                      </div>
                      <div className="flex gap-3 w-full md:w-auto">
                        <Button variant="secondary" size="lg" className="flex-1 md:flex-none h-14 px-8 rounded-xl font-bold">
                          <Phone className="h-5 w-5 mr-2" />
                          Contact
                        </Button>
                        <Button variant="secondary" size="lg" className="flex-1 md:flex-none h-14 px-8 rounded-xl font-bold">
                          <Navigation className="h-5 w-5 mr-2 text-primary" />
                          Navigate
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-8 border-y border-border/30">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase font-black tracking-widest mb-2">Tracking ID</p>
                        <p className="font-mono text-lg font-bold text-primary">{activeShipment.awb_number}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase font-black tracking-widest mb-2">Weight</p>
                        <p className="text-lg font-bold text-foreground">{activeShipment.weight} kg</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase font-black tracking-widest mb-2">Package Size</p>
                        <p className="text-lg font-bold text-foreground">{activeShipment.dimensions || 'Medium'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase font-black tracking-widest mb-2">Created Date</p>
                        <p className="text-lg font-bold text-foreground">{formatDate(activeShipment.created_at || '')}</p>
                      </div>
                    </div>

                    <div className="mt-10 flex flex-col sm:flex-row gap-4">
                      <Button 
                        size="lg" 
                        className="flex-1 h-16 text-xl font-black rounded-2xl bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20"
                        onClick={() => setIsPodOpen(true)}
                      >
                        <CheckCircle className="h-6 w-6 mr-3" />
                        Complete Delivery
                      </Button>
                      <Button 
                        variant="outline" 
                        size="lg" 
                        className="flex-1 h-16 text-xl font-black rounded-2xl border-destructive/30 text-destructive hover:bg-destructive/5"
                        onClick={() => setIsExceptionOpen(true)}
                      >
                        <AlertTriangle className="h-6 w-6 mr-3" />
                        Report Issue
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/30 bg-card/30 luxury-card">
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Package className="h-5 w-5 text-primary" />
                      Shipment Lifecycle Audit
                    </CardTitle>
                    <CardDescription>Comprehensive tracking history for ID: {activeShipment.awb_number}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8 pb-8">
                    {(activeShipment.history || []).length > 0 ? (
                      activeShipment.history?.map((step, i) => (
                        <div key={i} className="flex gap-6 relative">
                          <div className="flex flex-col items-center">
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 z-10 ${i === 0 ? 'bg-primary shadow-lg shadow-primary/30' : 'bg-secondary'}`}>
                              {i === 0 ? <Check className="h-5 w-5 text-black" /> : <Clock className="h-4 w-4 text-muted-foreground" />}
                            </div>
                            {i !== (activeShipment.history?.length || 0) - 1 && (
                              <div className="w-0.5 h-full bg-border/30 absolute top-10" />
                            )}
                          </div>
                          <div className="flex-1 bg-secondary/20 p-4 rounded-xl border border-border/20">
                            <div className="flex justify-between items-center mb-1">
                              <p className="font-bold text-lg text-foreground">{step.status.replace(/_/g, ' ')}</p>
                              <span className="text-xs font-medium text-muted-foreground">{formatDate(step.timestamp)}</span>
                            </div>
                            <p className="text-sm text-primary font-medium">{step.location}</p>
                            <p className="text-sm text-muted-foreground mt-2 italic">{step.description}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 opacity-50">
                        <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p>No historical events logged for this package yet.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-[80vh] flex flex-col items-center justify-center text-center p-12 bg-card/20 rounded-3xl border border-dashed border-border/50"
              >
                <div className="relative mb-8">
                  <div className="absolute -inset-10 bg-primary/10 rounded-full blur-3xl animate-pulse" />
                  <img 
                    src={IMAGES.PACKAGE_TRACKING_2} 
                    alt="Waiting for selection" 
                    className="h-64 w-64 object-contain rounded-3xl relative z-10 drop-shadow-2xl"
                  />
                </div>
                <h3 className="text-3xl font-black text-foreground mb-4">Fleet Readiness</h3>
                <p className="text-muted-foreground max-w-sm text-lg leading-relaxed">
                  Waiting for shipment assignment. Select a package from the task list to initiate delivery protocol.
                </p>
                <Button variant="outline" className="mt-8 h-12 px-8 rounded-full border-primary/30 text-primary">
                  Sync Queue
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* POD Dialog */}
      <Dialog open={isPodOpen} onOpenChange={setIsPodOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col bg-luxury-obsidian border-luxury-gold/30">
          <DialogHeader className="pb-4 border-b border-border/30">
            <DialogTitle className="text-2xl font-black text-luxury-gold">Proof of Delivery (POD)</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Recipient verification and physical evidence for {activeShipment?.awb_number}
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="flex-1 px-1">
            <div className="space-y-8 py-6">
              <div className="space-y-3">
                <Label className="text-lg font-bold">Recipient Name</Label>
                <Input 
                  placeholder="Who is receiving the package?"
                  className="h-14 bg-card border-border/50 text-lg"
                  value={podData.recipientName}
                  onChange={(e) => setPodData(prev => ({ ...prev, recipientName: e.target.value }))}
                />
              </div>

              <div className="space-y-3">
                <Label className="text-lg font-bold">Photo Evidence</Label>
                <div className="rounded-2xl overflow-hidden border border-border/30 bg-card">
                  <PhotoCapture 
                    label="Take photo of package at location"
                    onCapture={(photo) => setPodData(prev => ({ ...prev, photo }))} 
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-lg font-bold">Digital Signature</Label>
                <div className="rounded-2xl overflow-hidden border border-border/30 bg-card p-2">
                  <SignaturePad 
                    onSave={(sig) => setPodData(prev => ({ ...prev, signature: sig }))} 
                  />
                </div>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="pt-6 border-t border-border/30">
            <Button 
              variant="ghost" 
              className="h-14 px-8 text-muted-foreground"
              onClick={() => setIsPodOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              className="h-14 px-12 bg-primary font-black text-lg rounded-xl"
              onClick={handlePodSubmit}
              disabled={!podData.recipientName || !podData.signature}
            >
              Confirm Delivery
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Exception Dialog */}
      <Dialog open={isExceptionOpen} onOpenChange={setIsExceptionOpen}>
        <DialogContent className="max-w-lg bg-luxury-obsidian border-destructive/30">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2 text-2xl font-black">
              <AlertTriangle className="h-7 w-7" />
              Delivery Exception
            </DialogTitle>
            <DialogDescription>
              Document operational blockers for shipment {activeShipment?.awb_number}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleExceptionSubmit} className="space-y-6 py-4">
            <div className="space-y-2">
              <Label>Reason for Failure</Label>
              <select className="w-full h-12 bg-card border border-border/50 rounded-xl px-4 text-foreground focus:ring-2 focus:ring-destructive/50 outline-none">
                <option value="customer_not_available">Customer Not Available</option>
                <option value="wrong_address">Incorrect/Invalid Address</option>
                <option value="customer_refused">Customer Refused Package</option>
                <option value="access_denied">Access Denied to Location</option>
                <option value="vehicle_breakdown">Vehicle/Equipment Breakdown</option>
                <option value="other">Other Operational Issue</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>Internal Notes</Label>
              <Textarea 
                placeholder="Provide specific details for the dispatch team..."
                className="min-h-[120px] bg-card border-border/50 rounded-xl"
              />
            </div>

            <div className="bg-destructive/10 p-4 rounded-xl border border-destructive/20">
              <p className="text-xs text-destructive font-bold uppercase tracking-widest mb-1">Rider Warning</p>
              <p className="text-sm text-destructive/80">Reporting an exception will trigger an immediate notification to the merchant and dispatch office.</p>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="ghost" onClick={() => setIsExceptionOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-destructive text-white hover:bg-destructive/90 px-8 h-12 rounded-xl font-bold">
                Log Exception
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

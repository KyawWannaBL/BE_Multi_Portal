import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Navigation,
  MapPin,
  PenTool,
  Database,
  Activity,
  Shield,
  Clock,
  ChevronRight,
  LayoutDashboard,
  Maximize2,
  Settings
} from 'lucide-react';
import { GPSTracker } from '@/components/GPSTracker';
import { ElectronicSignaturePad } from '@/components/ElectronicSignaturePad';
import { DataEntryAutomation } from '@/components/DataEntryAutomation';
import { RealTimeTrackingDashboard } from '@/components/RealTimeTrackingDashboard';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { IMAGES } from '@/assets/images';
import { springPresets, fadeInUp, staggerContainer, staggerItem } from '@/lib/motion';

export default function AdvancedLogistics() {
  const [activeTab, setActiveTab] = useState('overview');
  const [lastEvent, setLastEvent] = useState<string>('System Ready - All units operational');

  const handleSignatureComplete = (data: { signature: string; photo: string | null; timestamp: string }) => {
    setLastEvent(`Signature captured for Parcel PKG-2026-X at ${data.timestamp}`);
  };

  const handleDataExtracted = (data: any) => {
    setLastEvent(`Automated entry: ${Object.keys(data).length} fields extracted successfully`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
      {/* Luxury Background Layer */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <img 
          src={IMAGES.SCREENSHOT3650_2_58} 
          className="w-full h-full object-cover opacity-10 filter grayscale blur-xl scale-110"
          alt="Background texture"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 space-y-8">
        {/* Header Section */}
        <motion.header 
          initial="hidden" 
          animate="visible" 
          variants={fadeInUp}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/40 pb-8"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-primary/50 text-primary font-mono text-[10px] tracking-widest">
                PREMIUM ENTERPRISE 2026
              </Badge>
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-tighter">Live Network</span>
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground/80 to-muted-foreground">
              Advanced Logistics
            </h1>
            <p className="text-muted-foreground max-w-2xl font-light leading-relaxed">
              Command center for precision logistics. Real-time telemetry, automated document processing, and biometric proof-of-delivery orchestration.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" className="luxury-glass border-white/5 hover:border-primary/30 h-12 px-6">
              <Settings className="mr-2 h-4 w-4" /> System Config
            </Button>
            <Button className="luxury-button">
              <LayoutDashboard className="mr-2 h-4 w-4" /> Global View
            </Button>
          </div>
        </motion.header>

        {/* Main Interface */}
        <Tabs defaultValue="overview" className="w-full space-y-8" onValueChange={setActiveTab}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 sticky top-4 z-50 p-2 luxury-glass rounded-2xl border-white/10">
            <TabsList className="bg-transparent gap-2 h-12">
              <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground h-10 px-6 rounded-xl transition-all">
                <Activity className="mr-2 h-4 w-4" /> Network Overview
              </TabsTrigger>
              <TabsTrigger value="tracking" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground h-10 px-6 rounded-xl transition-all">
                <Navigation className="mr-2 h-4 w-4" /> GPS Telemetry
              </TabsTrigger>
              <TabsTrigger value="signatures" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground h-10 px-6 rounded-xl transition-all">
                <PenTool className="mr-2 h-4 w-4" /> Digital POD
              </TabsTrigger>
              <TabsTrigger value="automation" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground h-10 px-6 rounded-xl transition-all">
                <Database className="mr-2 h-4 w-4" /> Data Automation
              </TabsTrigger>
            </TabsList>

            <div className="hidden lg:flex items-center gap-4 px-4">
              <div className="text-right">
                <p className="text-[10px] text-muted-foreground uppercase font-mono">Last Update</p>
                <p className="text-sm font-mono">{new Date().toLocaleTimeString()}</p>
              </div>
              <div className="h-8 w-[1px] bg-border" />
              <div className="text-right">
                <p className="text-[10px] text-muted-foreground uppercase font-mono">Status</p>
                <p className="text-sm text-primary font-mono">OPTIMIZED</p>
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <TabsContent value="overview" className="mt-0 outline-none">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={springPresets.gentle}
                className="grid grid-cols-1 lg:grid-cols-4 gap-6"
              >
                <div className="lg:col-span-3">
                  <RealTimeTrackingDashboard routeId="RT-7721-MAIN" showMap={true} />
                </div>
                
                <div className="space-y-6">
                  <Card className="luxury-card border-white/5">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Clock className="h-5 w-5 text-primary" /> Activity Feed
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-4">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="relative pl-6 pb-4 border-l border-white/10 last:pb-0">
                            <div className="absolute left-[-4px] top-1.5 h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_rgba(212,175,55,0.6)]" />
                            <p className="text-xs text-muted-foreground font-mono">14:2{i} GMT</p>
                            <p className="text-sm text-foreground/90 leading-tight mt-1">Unit Delta-{i} entered Geofence Zone B</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="luxury-card border-white/5 bg-primary/5">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <Shield className="h-6 w-6 text-primary" />
                        <Badge variant="outline" className="bg-primary/20 text-primary border-none">Secure</Badge>
                      </div>
                      <h4 className="font-semibold mb-2">Audit Protocol Active</h4>
                      <p className="text-sm text-muted-foreground">Every transaction and location update is cryptographically hashed for 2026 compliance standards.</p>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            </TabsContent>

            <TabsContent value="tracking" className="mt-0 outline-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={springPresets.gentle}
              >
                <GPSTracker 
                  shipmentId="FLEET-2026-X99" 
                  onLocationUpdate={(loc) => console.log('Telemetry Sync:', loc)} 
                />
              </motion.div>
            </TabsContent>

            <TabsContent value="signatures" className="mt-0 outline-none">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={springPresets.gentle}
                >
                  <Card className="luxury-card overflow-hidden">
                    <div className="h-48 relative">
                      <img src={IMAGES.PACKAGE_TRACKING_4} className="w-full h-full object-cover" alt="Signature illustration" />
                      <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
                      <div className="absolute bottom-4 left-6">
                        <Badge className="bg-primary text-black mb-2">Rider Mobile Sync</Badge>
                        <h3 className="text-2xl font-bold">Biometric Confirmation</h3>
                      </div>
                    </div>
                    <CardContent className="p-8 space-y-6">
                      <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <MapPin className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase font-mono">Current Assignment</p>
                          <p className="font-medium">Parcel PKG-4420-Z | Sector 7-G</p>
                        </div>
                      </div>
                      <p className="text-muted-foreground">
                        Our multi-factor proof-of-delivery system requires a digital signature and an AI-validated photo of the parcel at the drop point.
                      </p>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Encryption Status</span>
                          <span className="text-primary font-mono">AES-256</span>
                        </div>
                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                          <div className="w-full h-full bg-primary" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={springPresets.gentle}
                >
                  <ElectronicSignaturePad 
                    parcelId="PKG-4420-Z" 
                    riderId="USR-882-JONES" 
                    onSignatureComplete={handleSignatureComplete} 
                  />
                </motion.div>
              </div>
            </TabsContent>

            <TabsContent value="automation" className="mt-0 outline-none">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <motion.div 
                  className="lg:col-span-3" 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <DataEntryAutomation 
                    targetTable="shipments_log" 
                    onDataExtracted={handleDataExtracted} 
                  />
                </motion.div>

                <motion.div 
                  className="lg:col-span-2 space-y-6"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                >
                  <Card className="luxury-card border-white/5">
                    <CardHeader>
                      <CardTitle className="text-lg">Automation Efficiency</CardTitle>
                      <CardDescription>2026 Performance Metrics</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-mono uppercase">
                          <span>OCR Accuracy</span>
                          <span>99.8%</span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }} 
                            animate={{ width: '99.8%' }} 
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className="h-full bg-primary"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-mono uppercase">
                          <span>Voice Recognition</span>
                          <span>94.2%</span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }} 
                            animate={{ width: '94.2%' }} 
                            transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
                            className="h-full bg-luxury-gold/60"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-mono uppercase">
                          <span>Processing Speed</span>
                          <span>&lt; 0.4s</span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }} 
                            animate={{ width: '100%' }} 
                            transition={{ duration: 1.5, delay: 0.4, ease: "easeOut" }}
                            className="h-full bg-emerald-500"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="luxury-card border-white/5 bg-white/[0.02]">
                    <CardContent className="pt-6">
                      <div className="p-4 rounded-xl border border-white/5 bg-black/40 font-mono text-[11px] text-primary/80">
                        <div className="flex justify-between border-b border-white/5 pb-2 mb-2">
                          <span>SYSTEM_LOG</span>
                          <span>UTC+0</span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-foreground">{`> `}{lastEvent}</p>
                          <p className="opacity-50">{`> `}Awaiting neural input trigger...</p>
                          <p className="opacity-50">{`> `}Fleet integrity verified 100%</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </TabsContent>
          </AnimatePresence>
        </Tabs>

        {/* Global Footer Meta */}
        <footer className="flex flex-col md:flex-row justify-between items-center gap-4 py-12 border-t border-white/5">
          <div className="flex items-center gap-6">
            <div className="flex -space-x-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 w-10 rounded-full border-2 border-background bg-muted overflow-hidden">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 10}`} alt="Dispatcher" />
                </div>
              ))}
              <div className="h-10 w-10 rounded-full border-2 border-background bg-primary flex items-center justify-center text-[10px] font-bold text-black">
                +12
              </div>
            </div>
            <p className="text-sm text-muted-foreground font-light">
              Operational staff currently monitoring <span className="text-foreground font-medium">2,481 shipments</span> globally.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="text-xs text-muted-foreground hover:text-primary">
              System Health
            </Button>
            <Button variant="ghost" className="text-xs text-muted-foreground hover:text-primary">
              Privacy Policy
            </Button>
            <p className="text-[10px] font-mono text-muted-foreground opacity-50">
              © 2026 BRIDGETIUM LOGISTICS CORE
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

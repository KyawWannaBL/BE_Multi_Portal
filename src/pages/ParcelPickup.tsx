import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, 
  QrCode, 
  ArrowLeft, 
  CheckCircle2, 
  Printer, 
  Truck, 
  MapPin, 
  User as UserIcon, 
  Building2 
} from 'lucide-react';
import { ParcelRegistrationForm } from '@/components/ParcelRegistrationForm';
import { ParcelQRLabel } from '@/components/ParcelQRLabel';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { IMAGES } from '@/assets/images';

/**
 * Parcel Pickup Page
 * Allows Merchants and Customers to register shipments and generate printable QR tracking labels.
 * Integrates with automated wayplan management systems.
 */
export default function ParcelPickup() {
  const [userType, setUserType] = useState<'merchant' | 'customer'>('merchant');
  const [createdParcel, setCreatedParcel] = useState<any>(null);

  const handleParcelCreated = (parcel: any) => {
    setCreatedParcel(parcel);
  };

  const handleReset = () => {
    setCreatedParcel(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden pb-20">
      {/* Luxury Themed Background Element */}
      <div className="hero-background opacity-20">
        <img 
          src={IMAGES.CARGO_CONTAINERS_8} 
          alt="Logistics Operations"
          className="w-full h-full object-cover"
        />
        <div className="hero-overlay" />
      </div>

      <div className="container mx-auto px-4 pt-12 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
              <div className="flex items-center gap-2 text-primary font-mono text-sm tracking-widest uppercase mb-2">
                <Truck className="h-4 w-4" />
                Britium Logistics System 2026
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-3">
                Shipment <span className="text-primary">Registration</span>
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl">
                Initialize your pickup order. Our system automatically optimizes the wayplan and assigns dedicated riders based on your destination.
              </p>
            </div>
            {createdParcel && (
              <Button 
                variant="outline" 
                onClick={handleReset}
                className="w-fit rounded-full border-primary/20 hover:bg-primary/10"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                New Registration
              </Button>
            )}
          </div>

          <AnimatePresence mode="wait">
            {!createdParcel ? (
              <motion.div
                key="form-container"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.4 }}
              >
                <Tabs 
                  defaultValue="merchant" 
                  value={userType} 
                  onValueChange={(v) => setUserType(v as 'merchant' | 'customer')}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2 mb-8 bg-secondary/50 p-1.5 rounded-2xl h-16 luxury-glass">
                    <TabsTrigger 
                      value="merchant" 
                      className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold transition-all flex items-center gap-2"
                    >
                      <Building2 className="h-4 w-4" />
                      Merchant Portal
                    </TabsTrigger>
                    <TabsTrigger 
                      value="customer"
                      className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold transition-all flex items-center gap-2"
                    >
                      <UserIcon className="h-4 w-4" />
                      Individual Customer
                    </TabsTrigger>
                  </TabsList>

                  <Card className="luxury-card border-none shadow-2xl overflow-hidden bg-card/40 backdrop-blur-xl">
                    <CardHeader className="border-b border-border/10 pb-8 pt-10 px-10 bg-primary/5">
                      <div className="flex items-center gap-4">
                        <div className="p-4 rounded-2xl bg-primary/10 text-primary shadow-inner">
                          <Package className="h-7 w-7" />
                        </div>
                        <div>
                          <CardTitle className="text-2xl font-bold">Parcel Manifest</CardTitle>
                          <CardDescription className="text-base">
                            {userType === 'merchant' 
                              ? "Enterprise-level shipment registration for business accounts." 
                              : "Direct pickup request for personal delivery services."}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-8 md:p-12">
                      <ParcelRegistrationForm 
                        userType={userType} 
                        onParcelCreated={handleParcelCreated} 
                      />
                    </CardContent>
                  </Card>
                </Tabs>
              </motion.div>
            ) : (
              <motion.div
                key="success-container"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8"
              >
                <div className="lg:col-span-8">
                  <Card className="luxury-card h-full flex flex-col items-center justify-center p-8 md:p-16 bg-card/40 backdrop-blur-xl">
                    <div className="mb-10 text-center">
                      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-success/20 text-success mb-6 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                        <CheckCircle2 className="h-12 w-12" />
                      </div>
                      <h2 className="text-4xl font-bold mb-3 tracking-tight">System Registered</h2>
                      <p className="text-muted-foreground text-lg">
                        Wayplan generated. AWB ID: <span className="text-primary font-mono font-bold">{createdParcel.awb_number || createdParcel.trackingNumber}</span>
                      </p>
                    </div>

                    <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl border-4 border-primary/20">
                      <ParcelQRLabel 
                        parcel={createdParcel} 
                        onPrint={() => window.print()} 
                      />
                    </div>
                    
                    <p className="mt-8 text-sm text-muted-foreground italic">
                      * Affix this label to the parcel before the rider arrives.
                    </p>
                  </Card>
                </div>

                <div className="lg:col-span-4 space-y-6">
                  <Card className="luxury-card p-8 bg-card/40 backdrop-blur-xl border-primary/20">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                      <QrCode className="h-6 w-6 text-primary" />
                      Dispatch Workflow
                    </h3>
                    <div className="space-y-8">
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">1</div>
                        <div>
                          <h4 className="font-bold mb-1">Print & Attach</h4>
                          <p className="text-sm text-muted-foreground">Generate the QR label and secure it to the parcel exterior.</p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">2</div>
                        <div>
                          <h4 className="font-bold mb-1">Rider Assignment</h4>
                          <p className="text-sm text-muted-foreground">Our AI wayplanner has assigned a dedicated rider to your zone.</p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">3</div>
                        <div>
                          <h4 className="font-bold mb-1">Live Tracking</h4>
                          <p className="text-sm text-muted-foreground">Track your shipment status in real-time once picked up.</p>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <div className="flex flex-col gap-4">
                    <Button 
                      className="luxury-button w-full h-16 text-sm"
                      onClick={() => window.print()}
                    >
                      <Printer className="mr-2 h-5 w-5" />
                      Download Label (PDF)
                    </Button>
                    <Button 
                      variant="secondary" 
                      className="w-full py-7 rounded-3xl font-bold bg-white/5 hover:bg-white/10"
                      onClick={handleReset}
                    >
                      New Shipment Request
                    </Button>
                  </div>
                  
                  <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-muted-foreground">
                      <span className="font-bold text-foreground">Automatic Zoning:</span> Your location is identified in Zone-7B. Wayplan 442-A is currently active for this route.
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Hidden reference for context */}
      <img 
        src={IMAGES.SCREENSHOT5867_2_57} 
        className="hidden" 
        alt="System UI Reference"
      />
    </div>
  );
}

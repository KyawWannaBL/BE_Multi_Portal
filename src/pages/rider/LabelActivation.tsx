import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Printer,
  CheckCircle2,
  QrCode,
  AlertCircle,
  Search,
  Package,
  History,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { 
  ROUTE_PATHS, 
  Shipment, 
  SHIPMENT_STATUS 
} from '@/lib/index';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import QRScanner from '@/components/QRScanner';
import StatusBadge from '@/components/StatusBadge';

const LabelActivation: React.FC = () => {
  const { user, legacyUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [activationStep, setActivationStep] = useState<'LIST' | 'PRINT' | 'ACTIVATE'>('LIST');

  // Mock data fetching
  useEffect(() => {
    const mockShipments: Shipment[] = [
      {
        id: 'SHP-1001',
        awb: 'AWB-2026-X881',
        tamperTagId: 'TT-000451',
        status: 'REGISTERED_READY_FOR_LABEL',
        pieces: 1,
        type: 'box',
        condition: 'OK',
        cod: { required: true, amount: 250 },
        destinationTownship: 'Downtown',
        photos: [],
        riderId: legacyUser?.id || 'rdr_1',
        createdAt: new Date().toISOString(),
        labelPrintedCount: 0,
      },
      {
        id: 'SHP-1002',
        awb: 'AWB-2026-Y223',
        tamperTagId: 'TT-000452',
        status: 'LABEL_PRINTED',
        pieces: 2,
        type: 'bag',
        condition: 'OK',
        cod: { required: false },
        destinationTownship: 'North District',
        photos: [],
        riderId: legacyUser?.id || 'rdr_1',
        createdAt: new Date().toISOString(),
        labelPrintedCount: 1,
      }
    ];
    setShipments(mockShipments);
  }, [user]);

  const filteredShipments = shipments.filter(s => 
    s.tamperTagId.includes(searchQuery) || 
    s.awb?.includes(searchQuery) ||
    s.destinationTownship?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePrintLabel = async (shipment: Shipment) => {
    setIsPrinting(true);
    // Simulate printer connection and job
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const updatedShipments = shipments.map(s => 
      s.id === shipment.id 
        ? { ...s, status: SHIPMENT_STATUS.LABEL_PRINTED as any, labelPrintedCount: s.labelPrintedCount + 1 } 
        : s
    );
    
    setShipments(updatedShipments);
    setSelectedShipment({ ...shipment, status: SHIPMENT_STATUS.LABEL_PRINTED as any, labelPrintedCount: shipment.labelPrintedCount + 1 });
    setIsPrinting(false);
    toast.success(`Label printed for ${shipment.awb}`);
    setActivationStep('ACTIVATE');
  };

  const handleActivationScan = (scannedCode: string) => {
    if (!selectedShipment) return;

    if (scannedCode === selectedShipment.awb) {
      const updatedShipments = shipments.map(s => 
        s.id === selectedShipment.id 
          ? { ...s, status: SHIPMENT_STATUS.LABEL_APPLIED_VERIFIED as any } 
          : s
      );
      setShipments(updatedShipments);
      toast.success("Label activated and verified successfully!");
      setIsScanning(false);
      setActivationStep('LIST');
      setSelectedShipment(null);
    } else {
      toast.error("Invalid AWB scan. Please scan the label attached to this parcel.");
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-4xl mx-auto pb-24">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Label Activation</h1>
        <p className="text-muted-foreground">
          Print Air Waybill (AWB) labels and verify their attachment to parcels.
        </p>
      </header>

      {activationStep === 'LIST' && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search TT ID, AWB or Township..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="grid gap-4">
            {filteredShipments.map((shipment) => (
              <Card key={shipment.id} className="card-modern overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-mono text-muted-foreground">TT ID: {shipment.tamperTagId}</span>
                      <span className="text-lg font-bold font-mono">{shipment.awb}</span>
                    </div>
                    <StatusBadge status={shipment.status} />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-primary" />
                      <span>{shipment.pieces} {shipment.type}(s)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <History className="w-4 h-4 text-primary" />
                      <span>Printed: {shipment.labelPrintedCount}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      className="flex-1 btn-modern"
                      variant={shipment.status === 'REGISTERED_READY_FOR_LABEL' ? 'default' : 'secondary'}
                      onClick={() => {
                        setSelectedShipment(shipment);
                        setActivationStep('PRINT');
                      }}
                    >
                      {shipment.status === 'REGISTERED_READY_FOR_LABEL' ? 'Prepare Label' : 'Manage Label'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredShipments.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No shipments pending labels found.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activationStep === 'PRINT' && selectedShipment && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <Card className="card-modern">
            <CardHeader>
              <CardTitle>Verify & Print Label</CardTitle>
              <CardDescription>Confirm details before printing the AWB sticker.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">TT ID</span>
                  <span className="font-mono font-medium">{selectedShipment.tamperTagId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">AWB No.</span>
                  <span className="font-mono font-medium">{selectedShipment.awb}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Destination</span>
                  <span className="font-medium">{selectedShipment.destinationTownship}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">COD Amount</span>
                  <span className="font-bold text-primary">
                    {selectedShipment.cod.required ? `$${selectedShipment.cod.amount}` : 'N/A'}
                  </span>
                </div>
              </div>

              {selectedShipment.labelPrintedCount > 0 && (
                <div className="flex items-start gap-3 p-3 bg-destructive/10 text-destructive rounded-lg border border-destructive/20">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <div className="text-xs">
                    <p className="font-bold uppercase">Reprint Warning</p>
                    <p>This label has been printed {selectedShipment.labelPrintedCount} times already. Reprints are audited.</p>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1" 
                onClick={() => setActivationStep('LIST')}
              >
                Back
              </Button>
              <Button 
                className="flex-1 btn-modern" 
                disabled={isPrinting}
                onClick={() => handlePrintLabel(selectedShipment)}
              >
                {isPrinting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Printer className="w-4 h-4 mr-2" />}
                {selectedShipment.labelPrintedCount > 0 ? 'Reprint Label' : 'Print Label'}
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      )}

      {activationStep === 'ACTIVATE' && selectedShipment && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-6"
        >
          <Card className="card-modern border-primary/20 bg-primary/5">
            <CardContent className="p-6 flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <QrCode className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Step 3: Activation Scan</h3>
                <p className="text-sm text-muted-foreground">
                  Attach the printed AWB label to the parcel next to the Tamper Tag, then scan it to activate.
                </p>
              </div>

              {!isScanning ? (
                <Button 
                  className="w-full h-16 text-lg font-bold btn-modern"
                  onClick={() => setIsScanning(true)}
                >
                  Scan AWB to Activate
                </Button>
              ) : (
                <div className="w-full">
                  <QRScanner 
                    onScan={handleActivationScan} 
                    expectedType="AWB"
                  />
                  <Button 
                    variant="link" 
                    className="mt-4 text-muted-foreground"
                    onClick={() => setIsScanning(false)}
                  >
                    Cancel Scanning
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="bg-card p-4 rounded-xl border border-border flex items-center gap-3">
            <div className="p-2 bg-muted rounded-lg">
              <AlertCircle className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">
              Parcels cannot be received at the warehouse until this activation step is complete. 
              Ensure the scan captures the AWB QR clearly.
            </p>
          </div>
        </motion.div>
      )}

      {/* Bottom Floating Navigation Hint */}
      <AnimatePresence>
        {activationStep !== 'LIST' && (
          <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-6 left-4 right-4 z-50"
          >
            <div className="bg-foreground text-background px-6 py-4 rounded-full shadow-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-sm font-medium">Activating {selectedShipment?.awb}</span>
              </div>
              <button 
                onClick={() => {
                  setActivationStep('LIST');
                  setSelectedShipment(null);
                  setIsScanning(false);
                }}
                className="text-xs font-bold uppercase tracking-wider opacity-70 hover:opacity-100"
              >
                Cancel Process
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LabelActivation;
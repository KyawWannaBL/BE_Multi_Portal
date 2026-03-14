import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  CheckCircle2,
  Package,
  ArrowRight,
  AlertCircle,
  QrCode,
  Scan,
  Loader2,
  Check,
  X
} from 'lucide-react';
import { ROUTE_PATHS, SHIPMENT_STATUS, Shipment } from '@/lib/index';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import QRScanner from '@/components/QRScanner';
import StatusBadge from '@/components/StatusBadge';

const WarehouseDrop: React.FC = () => {
  const navigate = useNavigate();
  const { user, legacyUser } = useAuth();
  const [step, setStep] = useState<1 | 2>(1);
  const [isScanning, setIsScanning] = useState(false);
  const [warehouseVerified, setWarehouseVerified] = useState(false);
  const [scanningParcels, setScanningParcels] = useState(false);
  const [scannedParcels, setScannedParcels] = useState<string[]>([]);
  
  // Mock data for parcels ready to be dropped
  const [pendingParcels, setPendingParcels] = useState<Shipment[]>([
    {
      id: 'SHP-001',
      awb: 'AWB-100201',
      tamperTagId: 'TT-000001',
      status: 'LABEL_APPLIED_VERIFIED',
      pieces: 1,
      type: 'box',
      condition: 'OK',
      cod: { required: false },
      photos: [],
      riderId: legacyUser?.id || '',
      createdAt: new Date().toISOString(),
      labelPrintedCount: 1
    },
    {
      id: 'SHP-002',
      awb: 'AWB-100202',
      tamperTagId: 'TT-000002',
      status: 'LABEL_APPLIED_VERIFIED',
      pieces: 2,
      type: 'bag',
      condition: 'OK',
      cod: { required: true, amount: 150 },
      photos: [],
      riderId: legacyUser?.id || '',
      createdAt: new Date().toISOString(),
      labelPrintedCount: 1
    }
  ]);

  const handleWarehouseScan = (code: string) => {
    if (code === 'WH_GATE_SOUTH' || code === 'WH_GATE_MAIN') {
      setWarehouseVerified(true);
      setIsScanning(false);
      setStep(2);
      toast.success('Warehouse Gate Verified', {
        description: `Location: ${code.replace('_', ' ')}`
      });
    } else {
      toast.error('Invalid Warehouse QR', {
        description: 'Please scan the official WH_GATE QR code.'
      });
    }
  };

  const handleParcelScan = (code: string) => {
    const parcel = pendingParcels.find(p => p.awb === code || p.tamperTagId === code);
    
    if (!parcel) {
      toast.error('Parcel Not Found', {
        description: 'This parcel is not in your pending drop-off list.'
      });
      return;
    }

    if (parcel.status !== 'LABEL_APPLIED_VERIFIED') {
      toast.error('Activation Required', {
        description: 'Label must be activated before warehouse arrival.'
      });
      return;
    }

    if (scannedParcels.includes(parcel.id)) {
      toast.info('Already Scanned', {
        description: 'This parcel is already in the drop-off queue.'
      });
      return;
    }

    setScannedParcels(prev => [...prev, parcel.id]);
    toast.success('Parcel Added', {
      description: `${parcel.awb} verified for drop-off.`
    });
  };

  const handleCompleteDrop = () => {
    if (scannedParcels.length === 0) {
      toast.error('No Parcels Scanned', {
        description: 'Please scan at least one parcel to complete drop-off.'
      });
      return;
    }

    // In production, this would be an API call
    toast.success('Handover Complete', {
      description: `${scannedParcels.length} parcels marked as ARRIVED_WAREHOUSE_GATE.`
    });
    navigate(ROUTE_PATHS.DASHBOARD);
  };

  return (
    <div className="flex flex-col gap-6 p-4 max-w-2xl mx-auto pb-24">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Warehouse Drop-off</h1>
        <p className="text-muted-foreground text-sm">Hand over parcels to the sorting facility.</p>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <div className={`flex-1 h-1 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-muted'}`} />
        <div className={`flex-1 h-1 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
      </div>

      {step === 1 && (
        <Card className="card-modern border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="w-5 h-5 text-primary" />
              Step 1: Arrive at Gate
            </CardTitle>
            <CardDescription>
              Scan the Warehouse Gate QR code to verify your location and start the handover.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center py-6 gap-4">
            {!isScanning ? (
              <div className="flex flex-col items-center gap-4 w-full">
                <div className="w-32 h-32 rounded-full bg-primary/5 flex items-center justify-center border-2 border-dashed border-primary/20">
                  <QrCode className="w-12 h-12 text-primary opacity-40" />
                </div>
                <Button 
                  className="w-full btn-modern" 
                  size="lg"
                  onClick={() => setIsScanning(true)}
                >
                  <Scan className="w-4 h-4 mr-2" />
                  Scan Gate QR
                </Button>
              </div>
            ) : (
              <div className="w-full flex flex-col gap-4">
                <QRScanner 
                  expectedType="LOCATION" 
                  onScan={handleWarehouseScan} 
                />
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => setIsScanning(false)}
                >
                  Cancel Scan
                </Button>
              </div>
            )}

            <div className="mt-4 flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg w-full">
              <AlertCircle className="w-4 h-4 text-primary shrink-0" />
              <p>System uses geofencing to ensure you are at the correct warehouse location. Location services must be enabled.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="card-modern border-success/20 bg-success/5">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center">
                  <Check className="w-4 h-4 text-success" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Warehouse Gate Verified</p>
                  <p className="text-xs text-muted-foreground">Location: WH_GATE_SOUTH</p>
                </div>
              </div>
              <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                Verified
              </Badge>
            </CardContent>
          </Card>

          <Card className="card-modern">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Step 2: Scan Parcels</CardTitle>
                  <CardDescription>Scan AWB or Tamper Tag for each parcel.</CardDescription>
                </div>
                <Badge variant="secondary">
                  {scannedParcels.length} / {pendingParcels.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {scanningParcels ? (
                <div className="flex flex-col gap-4">
                  <QRScanner 
                    onScan={handleParcelScan} 
                  />
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => setScanningParcels(false)}
                  >
                    Done Scanning
                  </Button>
                </div>
              ) : (
                <Button 
                  className="w-full py-8 border-dashed bg-primary/5 hover:bg-primary/10 text-primary border-primary/20"
                  variant="outline"
                  onClick={() => setScanningParcels(true)}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Scan className="w-6 h-6" />
                    <span>Tap to Scan Parcel</span>
                  </div>
                </Button>
              )}

              <div className="space-y-3 mt-2">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Scanned for Drop-off</p>
                {scannedParcels.length === 0 ? (
                  <div className="text-center py-8 bg-muted/20 rounded-xl border border-dashed">
                    <Package className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-20" />
                    <p className="text-sm text-muted-foreground">No parcels scanned yet</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {pendingParcels.filter(p => scannedParcels.includes(p.id)).map((parcel) => (
                      <div key={parcel.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                        <div className="flex items-center gap-3">
                          <Package className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-mono font-medium">{parcel.awb}</p>
                            <p className="text-xs text-muted-foreground">TT: {parcel.tamperTagId}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                           <Badge variant="outline" className="text-[10px] px-1.5 py-0">{parcel.type}</Badge>
                           <CheckCircle2 className="w-5 h-5 text-success" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {pendingParcels.length > scannedParcels.length && (
                <div className="space-y-3">
                   <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Remaining in Vehicle</p>
                   <div className="flex flex-col gap-2">
                    {pendingParcels.filter(p => !scannedParcels.includes(p.id)).map((parcel) => (
                      <div key={parcel.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30 opacity-60">
                        <div className="flex items-center gap-3">
                          <Package className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-mono">{parcel.awb}</p>
                            <p className="text-xs text-muted-foreground">TT: {parcel.tamperTagId}</p>
                          </div>
                        </div>
                        <Badge variant="outline">Pending</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t pt-6">
              <Button 
                className="w-full btn-modern" 
                size="lg" 
                disabled={scannedParcels.length === 0 || scanningParcels}
                onClick={handleCompleteDrop}
              >
                Complete Handover ({scannedParcels.length})
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-md border-t flex items-center justify-between md:hidden">
        <div className="flex flex-col">
          <p className="text-[10px] text-muted-foreground uppercase font-bold">Step {step} of 2</p>
          <p className="text-sm font-semibold">{step === 1 ? 'Location Verification' : 'Parcel Handover'}</p>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate(ROUTE_PATHS.DASHBOARD)}
        >
          <X className="w-4 h-4 mr-2" />
          Exit
        </Button>
      </div>
    </div>
  );
};

export default WarehouseDrop;

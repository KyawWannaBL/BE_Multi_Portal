import React, { useState } from 'react';
import { 
  Package, 
  QrCode, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  ArrowRight, 
  ChevronRight, 
  MapPin,
  ClipboardCheck,
  FileWarning
} from 'lucide-react';
import { SHIPMENT_STATUS, ROUTE_PATHS, Shipment } from '@/lib/index';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

const MOCK_MANIFESTS = [
  {
    id: 'MF-2026-001',
    origin: 'Main Hub Warehouse',
    expectedCount: 12,
    scannedCount: 0,
    status: 'IN_TRANSIT',
    parcels: [
      { id: 'AWB-987654321', ttId: 'TT-000101', status: SHIPMENT_STATUS.IN_TRANSIT_TO_SUBSTATION },
      { id: 'AWB-987654322', ttId: 'TT-000102', status: SHIPMENT_STATUS.IN_TRANSIT_TO_SUBSTATION },
      { id: 'AWB-987654323', ttId: 'TT-000103', status: SHIPMENT_STATUS.IN_TRANSIT_TO_SUBSTATION },
    ]
  },
  {
    id: 'MF-2026-002',
    origin: 'East Sorting Center',
    expectedCount: 8,
    scannedCount: 8,
    status: 'RECEIVED',
    parcels: []
  }
];

const SubstationReceiving: React.FC = () => {
  const { user, legacyUser } = useAuth();
  const [locationVerified, setLocationVerified] = useState(false);
  const [activeManifest, setActiveManifest] = useState<typeof MOCK_MANIFESTS[0] | null>(null);
  const [scannedParcels, setScannedParcels] = useState<string[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [manualEntry, setManualEntry] = useState('');

  const handleScanLocation = () => {
    // Simulate location QR scan for SS_RECEIVING
    toast.success('Substation location verified: SS_RECEIVING_04');
    setLocationVerified(true);
  };

  const handleSelectManifest = (manifest: typeof MOCK_MANIFESTS[0]) => {
    if (!locationVerified) {
      toast.error('Please scan Substation Location QR first');
      return;
    }
    setActiveManifest(manifest);
  };

  const handleParcelScan = (id: string) => {
    if (!activeManifest) return;
    
    const parcelId = id.toUpperCase();
    if (scannedParcels.includes(parcelId)) {
      toast.warning('Parcel already scanned');
      return;
    }

    const exists = activeManifest.parcels.some(p => p.id === parcelId || p.ttId === parcelId);
    
    if (exists) {
      setScannedParcels([...scannedParcels, parcelId]);
      toast.success(`Parcel ${parcelId} verified`);
    } else {
      toast.error('Parcel not found in this manifest', {
        description: 'Creating discrepancy report...'
      });
    }
    setManualEntry('');
  };

  const handleCompleteReceiving = () => {
    if (!activeManifest) return;
    
    const shortage = activeManifest.expectedCount - scannedParcels.length;
    
    if (shortage > 0) {
      toast.error(`Shortage detected: ${shortage} parcels missing`, {
        description: 'Discrepancy report sent to Supervisor.'
      });
    } else {
      toast.success('Manifest received successfully', {
        description: 'All parcels verified and ready for last-mile.'
      });
    }
    
    setActiveManifest(null);
    setScannedParcels([]);
  };

  if (!locationVerified) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-6">
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
          <MapPin className="w-12 h-12 text-primary" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Substation Arrival</h1>
        <p className="text-muted-foreground text-center max-w-xs mb-8">
          Scan the fixed Location QR poster at the receiving bay to unlock manifest processing.
        </p>
        <Button size="lg" onClick={handleScanLocation} className="btn-modern">
          <QrCode className="mr-2 h-5 w-5" />
          Scan Location QR
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardCheck className="text-primary" />
            Substation Receiving
          </h1>
          <p className="text-muted-foreground">Verified Location: SS_RECEIVING_04</p>
        </div>
        {activeManifest && (
          <Button variant="outline" onClick={() => setActiveManifest(null)}>
            Back to Manifest List
          </Button>
        )}
      </header>

      {!activeManifest ? (
        <div className="grid gap-4">
          <h2 className="text-lg font-semibold">Incoming Manifests</h2>
          {MOCK_MANIFESTS.map((manifest) => (
            <Card 
              key={manifest.id} 
              className="card-modern cursor-pointer hover:border-primary/50"
              onClick={() => handleSelectManifest(manifest)}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-muted rounded-lg">
                    <Package className="text-muted-foreground" />
                  </div>
                  <div>
                    <div className="font-mono font-bold">{manifest.id}</div>
                    <div className="text-sm text-muted-foreground">From: {manifest.origin}</div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right hidden sm:block">
                    <div className="text-sm font-medium">{manifest.expectedCount} Parcels</div>
                    <Badge variant={manifest.status === 'RECEIVED' ? 'secondary' : 'default'}>
                      {manifest.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <ChevronRight className="text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Scan Panel */}
          <Card className="lg:col-span-2 card-modern">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Manifest Processing: {activeManifest.id}</CardTitle>
                <Badge variant="outline">{scannedParcels.length} / {activeManifest.expectedCount}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Verification Progress</span>
                  <span>{Math.round((scannedParcels.length / activeManifest.expectedCount) * 100)}%</span>
                </div>
                <Progress value={(scannedParcels.length / activeManifest.expectedCount) * 100} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="qr-scanner-frame aspect-square bg-muted flex flex-col items-center justify-center p-8 text-center">
                  <QrCode className="w-16 h-16 text-primary mb-4 opacity-50" />
                  <p className="text-sm font-medium">Scan Parcel AWB or TT</p>
                  <p className="text-xs text-muted-foreground mt-2">System will reconcile automatically</p>
                  <Button variant="secondary" size="sm" className="mt-4">
                    Start Camera
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Manual Verification</label>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="Enter AWB or TT ID"
                        value={manualEntry}
                        onChange={(e) => setManualEntry(e.target.value)}
                        className="font-mono"
                        onKeyDown={(e) => e.key === 'Enter' && handleParcelScan(manualEntry)}
                      />
                      <Button onClick={() => handleParcelScan(manualEntry)}>
                        Verify
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 bg-muted/50 rounded-lg border border-dashed">
                    <h4 className="text-xs font-bold uppercase text-muted-foreground mb-2 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Exception Handling
                    </h4>
                    <p className="text-xs text-muted-foreground mb-3">
                      If a parcel is missing its label but has a physical Tamper Tag, use the TT ID to verify.
                    </p>
                    <Button variant="outline" size="sm" className="w-full">
                      <FileWarning className="mr-2 h-4 w-4" />
                      Report Discrepancy
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Recent Scans</h3>
                <div className="bg-muted rounded-md divide-y divide-border/50">
                  {scannedParcels.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground italic">No parcels scanned yet</div>
                  ) : (
                    scannedParcels.slice().reverse().map((id, i) => (
                      <div key={id} className="p-3 flex items-center justify-between animate-in fade-in slide-in-from-left-2">
                        <span className="font-mono text-sm">{id}</span>
                        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Verified
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4">
              <Button 
                className="w-full btn-modern" 
                size="lg"
                disabled={scannedParcels.length === 0}
                onClick={handleCompleteReceiving}
              >
                Complete Manifest Reconciliation
              </Button>
            </CardFooter>
          </Card>

          {/* Info Sidebar */}
          <div className="space-y-6">
            <Card className="card-modern bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="text-base">Manifest Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Manifest ID</span>
                  <span className="font-mono">{activeManifest.id}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Origin Hub</span>
                  <span>{activeManifest.origin}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Expected</span>
                  <span className="font-bold">{activeManifest.expectedCount}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="card-modern">
              <CardHeader>
                <CardTitle className="text-base">Expected Parcel List</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[300px] overflow-y-auto px-6 pb-6 space-y-3">
                  {activeManifest.parcels.map(parcel => (
                    <div key={parcel.id} className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-mono">{parcel.id}</div>
                        <div className="text-[10px] text-muted-foreground">TT: {parcel.ttId}</div>
                      </div>
                      {scannedParcels.includes(parcel.id) || scannedParcels.includes(parcel.ttId) ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-muted" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubstationReceiving;
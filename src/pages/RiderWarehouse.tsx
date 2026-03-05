import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Package, 
  MapPin, 
  Navigation, 
  QrCode,
  Camera, 
  CheckCircle, 
  Clock,
  Phone,
  User,
  Warehouse,
  AlertCircle,
  Scan,
  FileText
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { QRCodeScanner } from '@/components/QRCodeScanner';
import { GPSTracker } from '@/components/GPSTracker';
import { ElectronicSignature } from '@/components/ElectronicSignature';
import { logisticsAPI } from '@/services/logistics-api';
import { advancedFeaturesAPI } from '@/services/advanced-features-api';

type WarehouseDropStep = 'LIST' | 'NAVIGATION' | 'SCANNING' | 'HANDOVER' | 'COMPLETE';

interface WarehouseDropBatch {
  id: string;
  batch_number: string;
  warehouse_id: string;
  warehouse_name: string;
  warehouse_address: string;
  warehouse_contact: string;
  total_packages: number;
  scanned_packages: number;
  status: 'assigned' | 'in_transit' | 'completed';
  assigned_date: string;
  packages: WarehousePackage[];
  warehouse_location: {
    lat: number;
    lng: number;
  };
}

interface WarehousePackage {
  id: string;
  awb_number: string;
  sender_name: string;
  receiver_name: string;
  weight: number;
  status: 'pending' | 'scanned' | 'handed_over';
  scanned_at?: string;
}

export default function RiderWarehouse() {
  const { t, language } = useLanguage();
  const [currentStep, setCurrentStep] = useState<WarehouseDropStep>('LIST');
  const [warehouseBatches, setWarehouseBatches] = useState<WarehouseDropBatch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<WarehouseDropBatch | null>(null);
  const [loading, setLoading] = useState(true);
  const [scannerActive, setScannerActive] = useState(false);
  const [signatureData, setSignatureData] = useState<string>('');
  const [handoverPhoto, setHandoverPhoto] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
  const [scannedPackages, setScannedPackages] = useState<string[]>([]);

  useEffect(() => {
    loadWarehouseBatches();
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  const loadWarehouseBatches = async () => {
    try {
      setLoading(true);
      // Mock warehouse drop batches for demo
      const response: { success: boolean; data: WarehouseDropBatch[] } = { success: true, data: [] };
      
      if (response.success) {
        setWarehouseBatches(response.data || []);
      }
    } catch (error) {
      console.error('Error loading warehouse batches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBatchSelect = (batch: WarehouseDropBatch) => {
    setSelectedBatch(batch);
    setCurrentStep('NAVIGATION');
  };

  const handleStartScanning = () => {
    setCurrentStep('SCANNING');
    setScannerActive(true);
  };

  const handlePackageScan = async (data: string) => {
    try {
      const packageData = JSON.parse(data);
      
      if (selectedBatch) {
        const packageExists = selectedBatch.packages.find(
          pkg => pkg.awb_number === packageData.awb_number
        );

        if (packageExists && !scannedPackages.includes(packageData.awb_number)) {
          // Mock package update for demo
          console.log('Package updated:', packageExists.id);

          // Create scan event
          await advancedFeaturesAPI.createEvent({
            event_type: 'WAREHOUSE_PACKAGE_SCAN',
            event_category: 'rider_operation',
            reference_id: packageExists.id,
            reference_type: 'package',
            event_data: { package_data: packageData, batch_id: selectedBatch.id, location: currentLocation }
          });

          setScannedPackages(prev => [...prev, packageData.awb_number]);
          
          alert(language === 'my' ? 'ပစ္စည်း စကင်န်ဖတ်ပြီး' : 'Package scanned successfully');
        } else if (scannedPackages.includes(packageData.awb_number)) {
          alert(language === 'my' ? 'ဤပစ္စည်းကို စကင်န်ဖတ်ပြီးပါပြီ' : 'Package already scanned');
        } else {
          alert(language === 'my' ? 'ဤ batch တွင် ပစ္စည်းမရှိပါ' : 'Package not found in this batch');
        }
      }
    } catch (error) {
      console.error('Package scan error:', error);
      alert(language === 'my' ? 'ပစ္စည်း စကင်န်ဖတ်မှု မအောင်မြင်ပါ' : 'Failed to scan package');
    }
  };

  const handleStartHandover = () => {
    if (scannedPackages.length === selectedBatch?.total_packages) {
      setCurrentStep('HANDOVER');
      setScannerActive(false);
    } else {
      alert(language === 'my' 
        ? 'ပစ္စည်းအားလုံးကို စကင်န်ဖတ်ပါ' 
        : 'Please scan all packages before handover'
      );
    }
  };

  const handleSignatureComplete = (signature: string) => {
    setSignatureData(signature);
  };

  const handlePhotoCapture = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setHandoverPhoto(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleCompleteHandover = async () => {
    if (!selectedBatch || !signatureData) return;

    try {
      setLoading(true);
      
      // Mock batch status update for demo
      console.log('Warehouse drop batch completed:', selectedBatch.id);

      // Create handover event
      await advancedFeaturesAPI.createEvent({
        event_type: 'WAREHOUSE_HANDOVER_COMPLETE',
        event_category: 'rider_operation',
        reference_id: selectedBatch.id,
        reference_type: 'batch',
        event_data: {
          signature: signatureData,
          photo: handoverPhoto,
          notes: notes,
          packages_count: scannedPackages.length,
          location: currentLocation
        }
      });

      setCurrentStep('COMPLETE');
      
      // Refresh batches list
      setTimeout(() => {
        loadWarehouseBatches();
        setCurrentStep('LIST');
        setSelectedBatch(null);
        setSignatureData('');
        setHandoverPhoto('');
        setNotes('');
        setScannedPackages([]);
      }, 3000);
      
    } catch (error) {
      console.error('Error completing handover:', error);
      alert(language === 'my' ? 'လွှဲပြောင်းခြင်း မအောင်မြင်ပါ' : 'Failed to complete handover');
    } finally {
      setLoading(false);
    }
  };

  const renderBatchList = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {language === 'my' ? 'ဂိုဒေါင်လွှဲပြောင်းရန်စာရင်း' : 'Warehouse Drop List'}
        </h2>
        <Button onClick={loadWarehouseBatches} disabled={loading}>
          {language === 'my' ? 'ပြန်လည်ရယူ' : 'Refresh'}
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2">{language === 'my' ? 'ရယူနေသည်...' : 'Loading...'}</p>
        </div>
      ) : warehouseBatches.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Warehouse className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {language === 'my' ? 'ဂိုဒေါင်လွှဲပြောင်းရန် မရှိပါ' : 'No warehouse drops available'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {warehouseBatches.map((batch) => (
            <Card key={batch.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">{batch.batch_number}</Badge>
                      <Badge variant={batch.status === 'assigned' ? 'secondary' : 'default'}>
                        {language === 'my' 
                          ? batch.status === 'assigned' ? 'သတ်မှတ်ပြီး' : 'သယ်ယူနေ'
                          : batch.status.replace('_', ' ').toUpperCase()
                        }
                      </Badge>
                    </div>
                    
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <Warehouse className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">{batch.warehouse_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span>{batch.warehouse_contact}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">{batch.warehouse_address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-gray-500" />
                        <span>{batch.total_packages} {language === 'my' ? 'ပစ္စည်း' : 'packages'}</span>
                        <span className="text-green-600">
                          ({batch.scanned_packages} {language === 'my' ? 'စကင်န်ဖတ်ပြီး' : 'scanned'})
                        </span>
                      </div>
                    </div>

                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(batch.scanned_packages / batch.total_packages) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <Button onClick={() => handleBatchSelect(batch)}>
                    {language === 'my' ? 'လွှဲပြောင်းမည်' : 'Drop Off'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderNavigation = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={() => setCurrentStep('LIST')}>
          {language === 'my' ? 'နောက်သို့' : 'Back'}
        </Button>
        <h2 className="text-xl font-bold">
          {language === 'my' ? 'လမ်းညွှန်' : 'Navigation'}
        </h2>
      </div>

      {selectedBatch && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Navigation className="w-5 h-5" />
              {selectedBatch.batch_number}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">
                {language === 'my' ? 'ဂိုဒေါင်အချက်အလက်' : 'Warehouse Information'}
              </h3>
              <div className="bg-gray-50 p-3 rounded">
                <div className="flex items-center gap-2 mb-1">
                  <Warehouse className="w-4 h-4" />
                  <span className="font-medium">{selectedBatch.warehouse_name}</span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <Phone className="w-4 h-4" />
                  <span>{selectedBatch.warehouse_contact}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{selectedBatch.warehouse_address}</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-3 rounded">
              <div className="flex items-center gap-2 text-blue-700">
                <Package className="w-4 h-4" />
                <span className="font-medium">
                  {language === 'my' ? 'လွှဲပြောင်းရမည့်ပစ္စည်း:' : 'Packages to Drop:'}
                </span>
                <span className="font-bold">{selectedBatch.total_packages}</span>
              </div>
            </div>

            {currentLocation && selectedBatch.warehouse_location && (
              <GPSTracker
                routeId={selectedBatch.id}
                deviceId="rider_device"
              />
            )}

            <Button 
              onClick={handleStartScanning} 
              className="w-full"
              size="lg"
            >
              <MapPin className="w-4 h-4 mr-2" />
              {language === 'my' ? 'ရောက်ရှိပြီး စကင်န်ဖတ်မည်' : 'Arrived - Start Scanning'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderScanning = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={() => setCurrentStep('NAVIGATION')}>
          {language === 'my' ? 'နောက်သို့' : 'Back'}
        </Button>
        <h2 className="text-xl font-bold">
          {language === 'my' ? 'ပစ္စည်းများ စကင်န်ဖတ်ခြင်း' : 'Package Scanning'}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Scanner */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              {language === 'my' ? 'QR စကင်နာ' : 'QR Scanner'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {scannerActive ? (
              <QRCodeScanner
                onScan={handlePackageScan}
                onError={(error) => {
                  console.error('Scanner error:', error);
                  alert(language === 'my' ? 'စကင်နာ အမှား' : 'Scanner error');
                }}
              />
            ) : (
              <Button 
                onClick={() => setScannerActive(true)}
                className="w-full"
                size="lg"
              >
                <Scan className="w-4 h-4 mr-2" />
                {language === 'my' ? 'စကင်န်ဖတ်မည်' : 'Start Scanning'}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Progress */}
        <Card>
          <CardHeader>
            <CardTitle>{language === 'my' ? 'တိုးတက်မှု' : 'Progress'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {scannedPackages.length} / {selectedBatch?.total_packages}
                </div>
                <div className="text-sm text-gray-600">
                  {language === 'my' ? 'စကင်န်ဖတ်ပြီး' : 'Packages Scanned'}
                </div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className="bg-green-500 h-4 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${selectedBatch ? (scannedPackages.length / selectedBatch.total_packages) * 100 : 0}%` 
                  }}
                />
              </div>

              {scannedPackages.length === selectedBatch?.total_packages && (
                <Button 
                  onClick={handleStartHandover}
                  className="w-full"
                  size="lg"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {language === 'my' ? 'လွှဲပြောင်းမည်' : 'Start Handover'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Package List */}
      {selectedBatch && (
        <Card>
          <CardHeader>
            <CardTitle>{language === 'my' ? 'ပစ္စည်းစာရင်း' : 'Package List'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {selectedBatch.packages.map((pkg) => (
                <div 
                  key={pkg.id}
                  className={`flex items-center justify-between p-2 rounded border ${
                    scannedPackages.includes(pkg.awb_number) 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      scannedPackages.includes(pkg.awb_number) ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                    <div>
                      <span className="font-mono text-sm">{pkg.awb_number}</span>
                      <div className="text-xs text-gray-600">
                        {pkg.sender_name} → {pkg.receiver_name}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm">
                    {scannedPackages.includes(pkg.awb_number) ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <Clock className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderHandover = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={() => setCurrentStep('SCANNING')}>
          {language === 'my' ? 'နောက်သို့' : 'Back'}
        </Button>
        <h2 className="text-xl font-bold">
          {language === 'my' ? 'ဂိုဒေါင်လွှဲပြောင်းခြင်း' : 'Warehouse Handover'}
        </h2>
      </div>

      <div className="space-y-4">
        {/* Handover Photo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5" />
              {language === 'my' ? 'လွှဲပြောင်းမှုဓာတ်ပုံ' : 'Handover Photo'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {handoverPhoto ? (
              <div className="space-y-2">
                <img 
                  src={handoverPhoto} 
                  alt="Handover proof" 
                  className="w-full h-48 object-cover rounded border"
                />
                <Button variant="outline" onClick={handlePhotoCapture}>
                  {language === 'my' ? 'ပြန်ရိုက်မည်' : 'Retake Photo'}
                </Button>
              </div>
            ) : (
              <Button onClick={handlePhotoCapture} variant="outline" className="w-full h-32">
                <Camera className="w-8 h-8 mb-2" />
                <div>
                  <div>{language === 'my' ? 'ဓာတ်ပုံရိုက်မည်' : 'Take Photo'}</div>
                  <div className="text-xs text-gray-500">
                    {language === 'my' ? 'လွှဲပြောင်းမှုအထောက်အထားအတွက်' : 'For handover proof'}
                  </div>
                </div>
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Signature */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {language === 'my' ? 'ဂိုဒေါင်ဝန်ထမ်း လက်မှတ်' : 'Warehouse Staff Signature'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ElectronicSignature
              onSignature={handleSignatureComplete}
            />
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle>{language === 'my' ? 'မှတ်ချက်များ' : 'Notes'}</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={language === 'my' 
                ? 'လွှဲပြောင်းမှုအခြေအနေ သို့မဟုတ် အခြားမှတ်ချက်များ...' 
                : 'Handover condition or other notes...'
              }
              rows={3}
            />
          </CardContent>
        </Card>

        <Button 
          onClick={handleCompleteHandover}
          disabled={!signatureData || loading}
          className="w-full"
          size="lg"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          ) : (
            <CheckCircle className="w-4 h-4 mr-2" />
          )}
          {language === 'my' ? 'လွှဲပြောင်းခြင်း ပြီးစီးမည်' : 'Complete Handover'}
        </Button>
      </div>
    </div>
  );

  const renderComplete = () => (
    <div className="text-center py-8">
      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-green-600 mb-2">
        {language === 'my' ? 'ဂိုဒေါင်လွှဲပြောင်းခြင်း ပြီးစီးပါပြီ!' : 'Warehouse Drop Completed!'}
      </h2>
      <p className="text-gray-600 mb-4">
        {language === 'my' 
          ? 'ပစ္စည်းများကို ဂိုဒေါင်သို့ အောင်မြင်စွာ လွှဲပြောင်းပြီးပါပြီ' 
          : 'Packages have been successfully handed over to warehouse'
        }
      </p>
      {selectedBatch && (
        <div className="space-y-2">
          <Badge variant="outline" className="text-lg px-4 py-2">
            {selectedBatch.batch_number}
          </Badge>
          <div className="text-green-600 font-medium">
            {scannedPackages.length} {language === 'my' ? 'ပစ္စည်း လွှဲပြောင်းပြီး' : 'packages handed over'}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="container mx-auto p-6">
      {/* Progress Indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          {['LIST', 'NAVIGATION', 'SCANNING', 'HANDOVER', 'COMPLETE'].map((step, index) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep === step 
                  ? 'bg-primary text-white' 
                  : index < ['LIST', 'NAVIGATION', 'SCANNING', 'HANDOVER', 'COMPLETE'].indexOf(currentStep)
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-600'
              }`}>
                {index + 1}
              </div>
              {index < 4 && (
                <div className={`w-12 h-1 mx-2 ${
                  index < ['LIST', 'NAVIGATION', 'SCANNING', 'HANDOVER', 'COMPLETE'].indexOf(currentStep)
                    ? 'bg-green-500'
                    : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="text-sm text-gray-600 text-center">
          {language === 'my' ? 'ဂိုဒေါင်လွှဲပြောင်းခြင်း လုပ်ငန်းစဉ်' : 'Warehouse Drop Process'}
        </div>
      </div>

      {/* Step Content */}
      {currentStep === 'LIST' && renderBatchList()}
      {currentStep === 'NAVIGATION' && renderNavigation()}
      {currentStep === 'SCANNING' && renderScanning()}
      {currentStep === 'HANDOVER' && renderHandover()}
      {currentStep === 'COMPLETE' && renderComplete()}
    </div>
  );
}
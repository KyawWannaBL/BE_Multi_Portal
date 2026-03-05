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
  Truck,
  AlertCircle
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { QRCodeScanner } from '@/components/QRCodeScanner';
import { GPSTracker } from '@/components/GPSTracker';
import { ElectronicSignature } from '@/components/ElectronicSignature';
import { QRCodeLabel } from '@/components/QRCodeLabel';
import { logisticsAPI } from '@/services/logistics-api';
import { advancedFeaturesAPI } from '@/services/advanced-features-api';

type PickupStep = 'LIST' | 'NAVIGATION' | 'SCANNING' | 'SIGNATURE' | 'COMPLETE';

interface PickupItem {
  id: string;
  awb_number: string;
  sender_name: string;
  sender_phone: string;
  sender_address: string;
  receiver_name: string;
  receiver_phone: string;
  receiver_address: string;
  service_type: string;
  weight: number;
  cod_amount?: number;
  status: string;
  created_at: string;
  pickup_location: {
    lat: number;
    lng: number;
    address: string;
  };
}

export default function RiderPickup() {
  const { t, language } = useLanguage();
  const [currentStep, setCurrentStep] = useState<PickupStep>('LIST');
  const [pickupItems, setPickupItems] = useState<PickupItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<PickupItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [scannerActive, setScannerActive] = useState(false);
  const [signatureData, setSignatureData] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    loadPickupItems();
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

  const loadPickupItems = async () => {
    try {
      setLoading(true);
      const response = await logisticsAPI.getShipments({
        status: 'pending_pickup'
      });
      
      if (response.success) {
        // Convert shipments to pickup items
        const pickupItems = (response.shipments || []).map(shipment => ({
          ...shipment,
          pickup_location: { lat: 0, lng: 0, address: shipment.sender_address }
        }));
        setPickupItems(pickupItems);
      }
    } catch (error) {
      console.error('Error loading pickup items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleItemSelect = (item: PickupItem) => {
    setSelectedItem(item);
    setCurrentStep('NAVIGATION');
  };

  const handleStartPickup = () => {
    setCurrentStep('SCANNING');
    setScannerActive(true);
  };

  const handleQRScan = async (data: string) => {
    try {
      const qrData = JSON.parse(data);
      if (qrData.awb === selectedItem?.awb_number) {
        setScannerActive(false);
        setCurrentStep('SIGNATURE');
        
        // Record pickup event
        await advancedFeaturesAPI.createEvent({
          event_type: 'PICKUP_SCAN',
          event_category: 'rider_operation',
          reference_id: selectedItem.id,
          reference_type: 'shipment',
          event_data: { qr_data: qrData, location: currentLocation }
        });
      } else {
        alert(language === 'my' ? 'မှားယွင်းသော QR ကုဒ်' : 'Invalid QR Code');
      }
    } catch (error) {
      console.error('QR scan error:', error);
      alert(language === 'my' ? 'QR ကုဒ် ဖတ်ရှုမှု မအောင်မြင်ပါ' : 'Failed to read QR code');
    }
  };

  const handleSignatureComplete = (signature: string) => {
    setSignatureData(signature);
  };

  const handleCompletePickup = async () => {
    if (!selectedItem || !signatureData) return;

    try {
      setLoading(true);
      
      // Update shipment status - using generic update method
      await logisticsAPI.updateShipmentStatus(selectedItem.id, 'picked_up', {
        pickup_signature: signatureData,
        pickup_notes: notes,
        pickup_time: new Date().toISOString(),
        pickup_location: currentLocation
      });

      // Create pickup event
      await advancedFeaturesAPI.createEvent({
        event_type: 'PICKUP_COMPLETE',
        event_category: 'rider_operation',
        reference_id: selectedItem.id,
        reference_type: 'shipment',
        event_data: {
          signature: signatureData,
          notes: notes,
          location: currentLocation
        }
      });

      setCurrentStep('COMPLETE');
      
      // Refresh pickup list
      setTimeout(() => {
        loadPickupItems();
        setCurrentStep('LIST');
        setSelectedItem(null);
        setSignatureData('');
        setNotes('');
      }, 3000);
      
    } catch (error) {
      console.error('Error completing pickup:', error);
      alert(language === 'my' ? 'ပစ္စည်းယူခြင်း မအောင်မြင်ပါ' : 'Failed to complete pickup');
    } finally {
      setLoading(false);
    }
  };

  const renderPickupList = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {language === 'my' ? 'ပစ္စည်းယူရန်စာရင်း' : 'Pickup List'}
        </h2>
        <Button onClick={loadPickupItems} disabled={loading}>
          {language === 'my' ? 'ပြန်လည်ရယူ' : 'Refresh'}
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2">{language === 'my' ? 'ရယူနေသည်...' : 'Loading...'}</p>
        </div>
      ) : pickupItems.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {language === 'my' ? 'ပစ္စည်းယူရန် မရှိပါ' : 'No items to pickup'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {pickupItems.map((item) => (
            <Card key={item.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">{item.awb_number}</Badge>
                      <Badge variant="secondary">{item.service_type}</Badge>
                    </div>
                    
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span>{item.sender_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span>{item.sender_phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">{item.sender_address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-gray-500" />
                        <span>{item.weight}kg</span>
                        {item.cod_amount && (
                          <span className="text-orange-600 font-medium">
                            COD: {item.cod_amount.toLocaleString()} MMK
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <Button onClick={() => handleItemSelect(item)}>
                    {language === 'my' ? 'ယူမည်' : 'Pickup'}
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

      {selectedItem && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Navigation className="w-5 h-5" />
              {selectedItem.awb_number}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">
                {language === 'my' ? 'ပစ္စည်းယူရန်နေရာ' : 'Pickup Location'}
              </h3>
              <div className="bg-gray-50 p-3 rounded">
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-4 h-4" />
                  <span className="font-medium">{selectedItem.sender_name}</span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <Phone className="w-4 h-4" />
                  <span>{selectedItem.sender_phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{selectedItem.sender_address}</span>
                </div>
              </div>
            </div>

            {currentLocation && selectedItem.pickup_location && (
              <GPSTracker
                routeId={selectedItem.id}
                deviceId="rider_device"
              />
            )}

            <Button 
              onClick={handleStartPickup} 
              className="w-full"
              size="lg"
            >
              <MapPin className="w-4 h-4 mr-2" />
              {language === 'my' ? 'ရောက်ရှိပြီး ပစ္စည်းယူမည်' : 'Arrived - Start Pickup'}
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
          {language === 'my' ? 'QR ကုဒ် စကင်န်ဖတ်ခြင်း' : 'QR Code Scanning'}
        </h2>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="text-center mb-4">
            <QrCode className="w-12 h-12 text-primary mx-auto mb-2" />
            <p className="text-gray-600">
              {language === 'my' 
                ? 'ပစ္စည်းပေါ်ရှိ QR ကုဒ်ကို စကင်န်ဖတ်ပါ' 
                : 'Scan the QR code on the package'
              }
            </p>
          </div>

          {scannerActive && (
            <QRCodeScanner
              onScan={handleQRScan}
              onError={(error) => {
                console.error('Scanner error:', error);
                alert(language === 'my' ? 'စကင်နာ အမှား' : 'Scanner error');
              }}
            />
          )}

          {selectedItem && (
            <div className="mt-4 p-3 bg-gray-50 rounded">
              <p className="text-sm text-gray-600 mb-1">
                {language === 'my' ? 'မျှော်လင့်ထားသော AWB:' : 'Expected AWB:'}
              </p>
              <p className="font-mono font-bold">{selectedItem.awb_number}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderSignature = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={() => setCurrentStep('SCANNING')}>
          {language === 'my' ? 'နောက်သို့' : 'Back'}
        </Button>
        <h2 className="text-xl font-bold">
          {language === 'my' ? 'လက်မှတ်ရယူခြင်း' : 'Signature Capture'}
        </h2>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              {language === 'my' ? 'ပို့သူ လက်မှတ်' : 'Sender Signature'}
            </label>
            <ElectronicSignature
              onSignature={handleSignatureComplete}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {language === 'my' ? 'မှတ်ချက်များ (ရွေးချယ်ခွင့်ရှိ)' : 'Notes (Optional)'}
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={language === 'my' 
                ? 'ပစ္စည်းအခြေအနေ သို့မဟုတ် အခြားမှတ်ချက်များ...' 
                : 'Package condition or other notes...'
              }
              rows={3}
            />
          </div>

          <Button 
            onClick={handleCompletePickup}
            disabled={!signatureData || loading}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <CheckCircle className="w-4 h-4 mr-2" />
            )}
            {language === 'my' ? 'ပစ္စည်းယူခြင်း ပြီးစီးမည်' : 'Complete Pickup'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderComplete = () => (
    <div className="text-center py-8">
      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-green-600 mb-2">
        {language === 'my' ? 'ပစ္စည်းယူခြင်း ပြီးစီးပါပြီ!' : 'Pickup Completed!'}
      </h2>
      <p className="text-gray-600 mb-4">
        {language === 'my' 
          ? 'ပစ္စည်းကို အောင်မြင်စွာ ယူပြီးပါပြီ' 
          : 'Package has been successfully picked up'
        }
      </p>
      {selectedItem && (
        <Badge variant="outline" className="text-lg px-4 py-2">
          {selectedItem.awb_number}
        </Badge>
      )}
    </div>
  );

  return (
    <div className="container mx-auto p-6">
      {/* Progress Indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          {['LIST', 'NAVIGATION', 'SCANNING', 'SIGNATURE', 'COMPLETE'].map((step, index) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep === step 
                  ? 'bg-primary text-white' 
                  : index < ['LIST', 'NAVIGATION', 'SCANNING', 'SIGNATURE', 'COMPLETE'].indexOf(currentStep)
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-600'
              }`}>
                {index + 1}
              </div>
              {index < 4 && (
                <div className={`w-12 h-1 mx-2 ${
                  index < ['LIST', 'NAVIGATION', 'SCANNING', 'SIGNATURE', 'COMPLETE'].indexOf(currentStep)
                    ? 'bg-green-500'
                    : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="text-sm text-gray-600 text-center">
          {language === 'my' ? 'ပစ္စည်းယူခြင်း လုပ်ငန်းစဉ်' : 'Pickup Process'}
        </div>
      </div>

      {/* Step Content */}
      {currentStep === 'LIST' && renderPickupList()}
      {currentStep === 'NAVIGATION' && renderNavigation()}
      {currentStep === 'SCANNING' && renderScanning()}
      {currentStep === 'SIGNATURE' && renderSignature()}
      {currentStep === 'COMPLETE' && renderComplete()}
    </div>
  );
}
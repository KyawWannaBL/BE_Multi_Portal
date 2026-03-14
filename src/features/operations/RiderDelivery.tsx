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
  Camera, 
  CheckCircle, 
  Clock,
  Phone,
  User,
  Truck,
  AlertCircle,
  DollarSign,
  FileText
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { GPSTracker } from '@/components/GPSTracker';
import { ElectronicSignature } from '@/components/ElectronicSignature';
import { logisticsAPI } from '@/services/logistics-api';
import { advancedFeaturesAPI } from '@/services/advanced-features-api';

type DeliveryStep = 'LIST' | 'NAVIGATION' | 'DELIVERY' | 'COMPLETE';

interface DeliveryItem {
  id: string;
  awb_number: string;
  sender_name: string;
  receiver_name: string;
  receiver_phone: string;
  receiver_address: string;
  service_type: string;
  weight: number;
  cod_amount?: number;
  status: string;
  created_at: string;
  delivery_location: {
    lat: number;
    lng: number;
    address: string;
  };
}

export default function RiderDelivery() {
  const { t, language } = useLanguage();
  const [currentStep, setCurrentStep] = useState<DeliveryStep>('LIST');
  const [deliveryItems, setDeliveryItems] = useState<DeliveryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<DeliveryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [signatureData, setSignatureData] = useState<string>('');
  const [deliveryPhoto, setDeliveryPhoto] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [codCollected, setCodCollected] = useState<number>(0);
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    loadDeliveryItems();
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

  const loadDeliveryItems = async () => {
    try {
      setLoading(true);
      const response = await logisticsAPI.getShipments({
        status: 'out_for_delivery'
      });
      
      if (response.success) {
        // Convert shipments to delivery items
        const deliveryItems = (response.shipments || []).map(shipment => ({
          ...shipment,
          delivery_location: { lat: 0, lng: 0, address: shipment.receiver_address }
        }));
        setDeliveryItems(deliveryItems);
      }
    } catch (error) {
      console.error('Error loading delivery items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleItemSelect = (item: DeliveryItem) => {
    setSelectedItem(item);
    setCurrentStep('NAVIGATION');
    if (item.cod_amount) {
      setCodCollected(item.cod_amount);
    }
  };

  const handleStartDelivery = () => {
    setCurrentStep('DELIVERY');
  };

  const handleSignatureComplete = (signature: string) => {
    setSignatureData(signature);
  };

  const handlePhotoCapture = () => {
    // In a real app, this would open camera
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setDeliveryPhoto(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleCompleteDelivery = async () => {
    if (!selectedItem || !signatureData) return;

    try {
      setLoading(true);
      
      // Update shipment status
      await logisticsAPI.updateShipmentStatus(selectedItem.id, 'delivered', {
        delivery_signature: signatureData,
        delivery_photo: deliveryPhoto,
        delivery_notes: notes,
        delivery_time: new Date().toISOString(),
        delivery_location: currentLocation,
        cod_collected: selectedItem.cod_amount ? codCollected : 0
      });

      // Create delivery event
      await advancedFeaturesAPI.createEvent({
        event_type: 'DELIVERY_COMPLETE',
        event_category: 'rider_operation',
        reference_id: selectedItem.id,
        reference_type: 'shipment',
        event_data: {
          signature: signatureData,
          photo: deliveryPhoto,
          notes: notes,
          cod_collected: selectedItem.cod_amount ? codCollected : 0,
          location: currentLocation
        }
      });

      setCurrentStep('COMPLETE');
      
      // Refresh delivery list
      setTimeout(() => {
        loadDeliveryItems();
        setCurrentStep('LIST');
        setSelectedItem(null);
        setSignatureData('');
        setDeliveryPhoto('');
        setNotes('');
        setCodCollected(0);
      }, 3000);
      
    } catch (error) {
      console.error('Error completing delivery:', error);
      alert(language === 'my' ? 'ပို့ဆောင်ခြင်း မအောင်မြင်ပါ' : 'Failed to complete delivery');
    } finally {
      setLoading(false);
    }
  };

  const renderDeliveryList = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {language === 'my' ? 'ပို့ဆောင်ရန်စာရင်း' : 'Delivery List'}
        </h2>
        <Button onClick={loadDeliveryItems} disabled={loading}>
          {language === 'my' ? 'ပြန်လည်ရယူ' : 'Refresh'}
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2">{language === 'my' ? 'ရယူနေသည်...' : 'Loading...'}</p>
        </div>
      ) : deliveryItems.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {language === 'my' ? 'ပို့ဆောင်ရန် မရှိပါ' : 'No items to deliver'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {deliveryItems.map((item) => (
            <Card key={item.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">{item.awb_number}</Badge>
                      <Badge variant="secondary">{item.service_type}</Badge>
                      {item.cod_amount && (
                        <Badge variant="destructive">COD</Badge>
                      )}
                    </div>
                    
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span>{item.receiver_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span>{item.receiver_phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">{item.receiver_address}</span>
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
                    {language === 'my' ? 'ပို့မည်' : 'Deliver'}
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
                {language === 'my' ? 'ပို့ဆောင်ရန်နေရာ' : 'Delivery Location'}
              </h3>
              <div className="bg-gray-50 p-3 rounded">
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-4 h-4" />
                  <span className="font-medium">{selectedItem.receiver_name}</span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <Phone className="w-4 h-4" />
                  <span>{selectedItem.receiver_phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{selectedItem.receiver_address}</span>
                </div>
              </div>
            </div>

            {selectedItem.cod_amount && (
              <div className="bg-orange-50 border border-orange-200 p-3 rounded">
                <div className="flex items-center gap-2 text-orange-700">
                  <DollarSign className="w-4 h-4" />
                  <span className="font-medium">
                    {language === 'my' ? 'COD ကောက်ခံရန်:' : 'COD to Collect:'}
                  </span>
                  <span className="font-bold">{selectedItem.cod_amount.toLocaleString()} MMK</span>
                </div>
              </div>
            )}

            {currentLocation && selectedItem.delivery_location && (
              <GPSTracker
                routeId={selectedItem.id}
                deviceId="rider_device"
              />
            )}

            <Button 
              onClick={handleStartDelivery} 
              className="w-full"
              size="lg"
            >
              <MapPin className="w-4 h-4 mr-2" />
              {language === 'my' ? 'ရောက်ရှိပြီး ပို့ဆောင်မည်' : 'Arrived - Start Delivery'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderDelivery = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={() => setCurrentStep('NAVIGATION')}>
          {language === 'my' ? 'နောက်သို့' : 'Back'}
        </Button>
        <h2 className="text-xl font-bold">
          {language === 'my' ? 'ပို့ဆောင်ခြင်း' : 'Delivery'}
        </h2>
      </div>

      <div className="space-y-4">
        {/* COD Collection */}
        {selectedItem?.cod_amount && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                {language === 'my' ? 'COD ကောက်ခံခြင်း' : 'COD Collection'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  {language === 'my' ? 'ကောက်ခံရမည့်ပမာણ:' : 'Amount to Collect:'}
                </label>
                <Input
                  type="number"
                  value={codCollected}
                  onChange={(e) => setCodCollected(Number(e.target.value))}
                  className="text-lg font-bold"
                />
                <p className="text-sm text-gray-600">
                  {language === 'my' ? 'မူလပမာණ:' : 'Original Amount:'} {selectedItem.cod_amount.toLocaleString()} MMK
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Proof of Delivery */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5" />
              {language === 'my' ? 'ပို့ဆောင်မှုအထောက်အထား' : 'Proof of Delivery'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Photo Capture */}
            <div>
              <label className="block text-sm font-medium mb-2">
                {language === 'my' ? 'ပို့ဆောင်မှုဓာတ်ပုံ' : 'Delivery Photo'}
              </label>
              {deliveryPhoto ? (
                <div className="space-y-2">
                  <img 
                    src={deliveryPhoto} 
                    alt="Delivery proof" 
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
                      {language === 'my' ? 'ပို့ဆောင်မှုအထောက်အထားအတွက်' : 'For delivery proof'}
                    </div>
                  </div>
                </Button>
              )}
            </div>

            {/* Signature */}
            <div>
              <label className="block text-sm font-medium mb-2">
                {language === 'my' ? 'လက်ခံသူ လက်မှတ်' : 'Receiver Signature'}
              </label>
              <ElectronicSignature
                onSignature={handleSignatureComplete}
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium mb-2">
                {language === 'my' ? 'မှတ်ချက်များ (ရွေးချယ်ခွင့်ရှိ)' : 'Notes (Optional)'}
              </label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={language === 'my' 
                  ? 'ပို့ဆောင်မှုအခြေအနေ သို့မဟုတ် အခြားမှတ်ချက်များ...' 
                  : 'Delivery condition or other notes...'
                }
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Button 
          onClick={handleCompleteDelivery}
          disabled={!signatureData || loading}
          className="w-full"
          size="lg"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          ) : (
            <CheckCircle className="w-4 h-4 mr-2" />
          )}
          {language === 'my' ? 'ပို့ဆောင်ခြင်း ပြီးစီးမည်' : 'Complete Delivery'}
        </Button>
      </div>
    </div>
  );

  const renderComplete = () => (
    <div className="text-center py-8">
      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-green-600 mb-2">
        {language === 'my' ? 'ပို့ဆောင်ခြင်း ပြီးစီးပါပြီ!' : 'Delivery Completed!'}
      </h2>
      <p className="text-gray-600 mb-4">
        {language === 'my' 
          ? 'ပစ္စည်းကို အောင်မြင်စွာ ပို့ဆောင်ပြီးပါပြီ' 
          : 'Package has been successfully delivered'
        }
      </p>
      {selectedItem && (
        <div className="space-y-2">
          <Badge variant="outline" className="text-lg px-4 py-2">
            {selectedItem.awb_number}
          </Badge>
          {selectedItem.cod_amount && (
            <div className="text-green-600 font-medium">
              COD: {codCollected.toLocaleString()} MMK {language === 'my' ? 'ကောက်ခံပြီး' : 'Collected'}
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="container mx-auto p-6">
      {/* Progress Indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          {['LIST', 'NAVIGATION', 'DELIVERY', 'COMPLETE'].map((step, index) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep === step 
                  ? 'bg-primary text-white' 
                  : index < ['LIST', 'NAVIGATION', 'DELIVERY', 'COMPLETE'].indexOf(currentStep)
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-600'
              }`}>
                {index + 1}
              </div>
              {index < 3 && (
                <div className={`w-16 h-1 mx-2 ${
                  index < ['LIST', 'NAVIGATION', 'DELIVERY', 'COMPLETE'].indexOf(currentStep)
                    ? 'bg-green-500'
                    : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="text-sm text-gray-600 text-center">
          {language === 'my' ? 'ပို့ဆောင်ခြင်း လုပ်ငန်းစဉ်' : 'Delivery Process'}
        </div>
      </div>

      {/* Step Content */}
      {currentStep === 'LIST' && renderDeliveryList()}
      {currentStep === 'NAVIGATION' && renderNavigation()}
      {currentStep === 'DELIVERY' && renderDelivery()}
      {currentStep === 'COMPLETE' && renderComplete()}
    </div>
  );
}
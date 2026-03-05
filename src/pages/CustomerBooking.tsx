import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  MapPin, 
  Package, 
  Calculator,
  CheckCircle,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ROUTE_PATHS } from '@/lib/index';
import { useAuth } from '@/hooks/useAuth';

export default function CustomerBooking() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    receiverName: '',
    receiverPhone: '',
    destinationCity: '',
    destinationTownship: '',
    fullAddress: '',
    weight: 1,
    itemDescription: '',
    serviceType: 'standard',
    codAmount: 0,
    paymentBy: 'sender',
  });

  const [estimatedCost, setEstimatedCost] = useState(0);

  const calculateCost = () => {
    let basePrice = 0;
    
    // Base price logic
    if (formData.destinationCity === 'yangon') {
      switch (formData.destinationTownship) {
        case 'zone1':
          basePrice = 2000;
          break;
        case 'zone2':
          basePrice = 2500;
          break;
        case 'zone3':
          basePrice = 3000;
          break;
        default:
          basePrice = 3000;
      }
    } else if (formData.destinationCity === 'mandalay') {
      basePrice = 3000;
    } else {
      basePrice = 3500;
    }

    // Weight charge (first 1kg free, +500 per extra kg)
    let weightPrice = 0;
    if (formData.weight > 1) {
      weightPrice = (formData.weight - 1) * 500;
    }

    // Service type
    let servicePrice = 0;
    if (formData.serviceType === 'express') {
      servicePrice = 1000;
    }

    const total = basePrice + weightPrice + servicePrice;
    setEstimatedCost(total);
  };

  React.useEffect(() => {
    calculateCost();
  }, [formData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the data to your backend
    alert('Order Placed Successfully! Tracking ID: BE-89755');
    navigate(ROUTE_PATHS.CUSTOMER_DASHBOARD);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Shipment</h1>
          <p className="text-gray-600">Fill in the details to book your delivery</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Form Sections */}
          <div className="lg:col-span-2 space-y-6">
            {/* Sender Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Sender Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="senderName">Name / Shop Name</Label>
                    <Input 
                      id="senderName" 
                      value={user?.full_name || 'Kyaw Wannanna'} 
                      readOnly 
                      className="bg-gray-50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="senderPhone">Phone Number</Label>
                    <Input 
                      id="senderPhone" 
                      value={user?.phone || '09897447744'} 
                      readOnly 
                      className="bg-gray-50"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="pickupAddress">Pickup Address</Label>
                  <Textarea 
                    id="pickupAddress" 
                    rows={2}
                    defaultValue="No. 277, Corner of Anawrahta Road, East Dagon Township"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Receiver Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Receiver Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="receiverName">Receiver Name</Label>
                    <Input 
                      id="receiverName" 
                      placeholder="Enter Name"
                      value={formData.receiverName}
                      onChange={(e) => handleInputChange('receiverName', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="receiverPhone">Receiver Phone</Label>
                    <Input 
                      id="receiverPhone" 
                      placeholder="09xxxxxxxxx"
                      value={formData.receiverPhone}
                      onChange={(e) => handleInputChange('receiverPhone', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="destinationCity">Destination City</Label>
                    <Select value={formData.destinationCity} onValueChange={(value) => handleInputChange('destinationCity', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select City" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yangon">Yangon</SelectItem>
                        <SelectItem value="mandalay">Mandalay</SelectItem>
                        <SelectItem value="naypyitaw">Nay Pyi Taw</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="destinationTownship">Township (Zone)</Label>
                    <Select value={formData.destinationTownship} onValueChange={(value) => handleInputChange('destinationTownship', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Township" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="zone1">Zone 1: Downtown (2000 MMK)</SelectItem>
                        <SelectItem value="zone2">Zone 2: Inner City (2500 MMK)</SelectItem>
                        <SelectItem value="zone3">Zone 3: New Towns (3000 MMK)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="fullAddress">Full Address</Label>
                  <Input 
                    id="fullAddress" 
                    placeholder="Street name, Building No, Floor"
                    value={formData.fullAddress}
                    onChange={(e) => handleInputChange('fullAddress', e.target.value)}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Package & Service */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Package & Service
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="weight">Weight (Kg)</Label>
                    <Input 
                      id="weight" 
                      type="number"
                      min="0.5"
                      step="0.5"
                      value={formData.weight}
                      onChange={(e) => handleInputChange('weight', parseFloat(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="itemDescription">Items Description</Label>
                    <Input 
                      id="itemDescription" 
                      placeholder="e.g. Clothes, Document"
                      value={formData.itemDescription}
                      onChange={(e) => handleInputChange('itemDescription', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="serviceType">Service Type</Label>
                    <Select value={formData.serviceType} onValueChange={(value) => handleInputChange('serviceType', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard (1-2 Days)</SelectItem>
                        <SelectItem value="express">Priority (Same Day)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="codAmount" className="text-red-600 font-bold">COD Amount (To Collect)</Label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md">
                        MMK
                      </span>
                      <Input 
                        id="codAmount" 
                        type="number"
                        placeholder="0"
                        className="rounded-l-none"
                        value={formData.codAmount}
                        onChange={(e) => handleInputChange('codAmount', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Leave 0 if item is already paid.</p>
                  </div>
                  <div>
                    <Label htmlFor="paymentBy">Who Pays Shipping?</Label>
                    <Select value={formData.paymentBy} onValueChange={(value) => handleInputChange('paymentBy', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sender">Sender (Pre-paid)</SelectItem>
                        <SelectItem value="receiver">Receiver (Collect on Delivery)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Base Rate</span>
                    <span>{formData.destinationCity ? `${estimatedCost - (formData.weight > 1 ? (formData.weight - 1) * 500 : 0) - (formData.serviceType === 'express' ? 1000 : 0)} MMK` : '--'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Weight Charge</span>
                    <span>{formData.weight > 1 ? `${(formData.weight - 1) * 500} MMK` : '0 MMK'}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Pickup Fee</span>
                    <span>FREE</span>
                  </div>
                  {formData.serviceType === 'express' && (
                    <div className="flex justify-between">
                      <span>Express Service</span>
                      <span>1,000 MMK</span>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="text-center">
                  <p className="text-sm text-gray-500 uppercase font-bold">Total Estimated Cost</p>
                  <p className="text-3xl font-bold text-gold">{estimatedCost.toLocaleString()} <span className="text-sm">MMK</span></p>
                </div>

                <Button type="submit" className="w-full bg-gold hover:bg-gold/90 text-navy-900 font-bold py-3">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  CONFIRM BOOKING
                </Button>
                
                <p className="text-center text-sm text-gray-500">
                  Rider will be assigned within 30 mins.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  MapPin, 
  Package, 
  Truck, 
  Plane,
  Clock,
  Phone,
  Mail,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ROUTE_PATHS } from '@/lib/index';
import { useLanguageContext } from '@/lib/LanguageContext';
import { IMAGES } from '@/assets/images';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

interface PricingData {
  id: string;
  service_type: string;
  region: string;
  destination: string;
  weight_min: number;
  weight_max: number;
  price_per_kg: number;
  currency: string;
}

export default function GetQuotePage() {
  const { t } = useLanguageContext();
  const [serviceType, setServiceType] = useState<'domestic' | 'international'>('domestic');
  const [region, setRegion] = useState('');
  const [destination, setDestination] = useState('');
  const [weight, setWeight] = useState('1');
  const [dimensions, setDimensions] = useState({ length: '', width: '', height: '' });
  const [pricing, setPricing] = useState<PricingData[]>([]);
  const [availableDestinations, setAvailableDestinations] = useState<string[]>([]);
  const [quote, setQuote] = useState<{
    basePrice: number;
    totalPrice: number;
    currency: string;
    deliveryTime: string;
    chargeableWeight?: number;
    actualWeight?: number;
    volumetricWeight?: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPricingData();
  }, []);

  useEffect(() => {
    if (serviceType && region) {
      updateAvailableDestinations();
    }
  }, [serviceType, region, pricing]);

  useEffect(() => {
    if (destination && weight) {
      calculateQuote();
    }
  }, [destination, weight, pricing]);

  const fetchPricingData = async () => {
    try {
      const { data, error } = await supabase
        .from('pricing_2026_02_03_21_00')
        .select('*')
        .eq('is_active', true)
        .order('region, destination, weight_min');

      if (error) throw error;
      setPricing(data || []);
    } catch (error) {
      console.error('Error fetching pricing:', error);
    }
  };

  const updateAvailableDestinations = () => {
    const destinations = pricing
      .filter(p => p.service_type === serviceType && p.region === region)
      .map(p => p.destination)
      .filter((dest, index, arr) => arr.indexOf(dest) === index)
      .sort();
    
    setAvailableDestinations(destinations);
    setDestination(''); // Reset destination when region changes
    setQuote(null);
  };

  const calculateQuote = () => {
    if (!destination || !weight) return;

    const weightNum = parseFloat(weight);
    if (isNaN(weightNum) || weightNum <= 0) return;

    // Calculate volumetric weight if dimensions are provided
    let volumetricWeight = 0;
    if (dimensions.length && dimensions.width && dimensions.height) {
      const l = parseFloat(dimensions.length);
      const w = parseFloat(dimensions.width);
      const h = parseFloat(dimensions.height);
      if (!isNaN(l) && !isNaN(w) && !isNaN(h)) {
        volumetricWeight = (l * w * h) / 6000; // Standard air cargo divisor
      }
    }

    // For international air cargo, use the greater of actual weight or volumetric weight
    const chargeableWeight = serviceType === 'international' 
      ? Math.max(weightNum, volumetricWeight)
      : weightNum;

    // Find the appropriate pricing tier based on chargeable weight
    const applicablePricing = pricing.find(p => 
      p.service_type === serviceType &&
      p.region === region &&
      p.destination === destination &&
      chargeableWeight >= p.weight_min &&
      (p.weight_max === null || chargeableWeight <= p.weight_max)
    );

    if (!applicablePricing) return;

    let totalPrice = 0;

    if (serviceType === 'domestic') {
      // For domestic: base price for first kg + additional weight charges
      if (chargeableWeight <= 1) {
        totalPrice = applicablePricing.price_per_kg;
      } else {
        const additionalWeight = chargeableWeight - 1;
        totalPrice = applicablePricing.price_per_kg + (additionalWeight * 500); // 500 MMK per additional kg
      }
    } else {
      // For international air cargo: rate per kg × chargeable weight
      totalPrice = applicablePricing.price_per_kg * chargeableWeight;
    }

    const deliveryTime = getDeliveryTime(serviceType, region, destination);

    setQuote({
      basePrice: applicablePricing.price_per_kg,
      totalPrice: Math.round(totalPrice),
      currency: applicablePricing.currency,
      deliveryTime,
      chargeableWeight: Math.round(chargeableWeight * 100) / 100, // Round to 2 decimal places
      actualWeight: weightNum,
      volumetricWeight: Math.round(volumetricWeight * 100) / 100
    });
  };

  const getDeliveryTime = (serviceType: string, region: string, destination: string) => {
    if (serviceType === 'domestic') {
      if (region === 'yangon') return '1-2 Days';
      return '2-3 Days';
    } else {
      switch (region) {
        case 'asia':
          return '3-5 Days';
        case 'europe':
          return '5-7 Days';
        case 'north_america':
          return '5-7 Days';
        case 'oceania':
          return '5-7 Days';
        case 'middle_east':
          return '4-6 Days';
        default:
          return '3-7 Days';
      }
    }
  };

  const getRegionOptions = () => {
    if (serviceType === 'domestic') {
      return [
        { value: 'yangon', label: 'Yangon City' },
        { value: 'mandalay', label: 'Mandalay Region' },
        { value: 'naypyitaw', label: 'Nay Pyi Taw' }
      ];
    } else {
      return [
        { value: 'asia', label: 'Asia' },
        { value: 'europe', label: 'Europe' },
        { value: 'north_america', label: 'North America' },
        { value: 'oceania', label: 'Oceania' },
        { value: 'middle_east', label: 'Middle East' }
      ];
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-navy-900 via-navy-800 to-navy-700 text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-navy-900/50 via-transparent to-navy-900/70" />
        <img 
          src={IMAGES.LOGISTICS_HERO_3} 
          alt="Get Quote" 
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6">
              Get Your <span className="text-gold">Instant Quote</span>
            </h1>
            <p className="text-xl lg:text-2xl text-navy-200 max-w-3xl mx-auto">
              Calculate shipping costs instantly with our transparent pricing calculator.
            </p>
          </div>
        </div>
      </section>

      {/* Quote Calculator */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Calculator Form */}
            <div className="lg:col-span-2">
              <Card className="shadow-xl border-0">
                <CardHeader className="bg-navy-900 text-white">
                  <CardTitle className="text-2xl flex items-center gap-3">
                    <Calculator className="w-6 h-6 text-gold" />
                    {t('quote.title')}
                  </CardTitle>
                  <p className="text-navy-200">{t('quote.subtitle')}</p>
                </CardHeader>
                
                <CardContent className="p-8">
                  <div className="space-y-6">
                    {/* Service Type */}
                    <div className="space-y-2">
                      <Label className="text-lg font-semibold">{t('quote.serviceType')}</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <Button
                          variant={serviceType === 'domestic' ? 'default' : 'outline'}
                          onClick={() => {
                            setServiceType('domestic');
                            setRegion('');
                            setDestination('');
                            setQuote(null);
                          }}
                          className={`h-16 ${serviceType === 'domestic' ? 'bg-gold hover:bg-gold/90 text-navy-900' : ''}`}
                        >
                          <div className="flex items-center gap-3">
                            <Truck className="w-6 h-6" />
                            <div className="text-left">
                              <div className="font-bold">Domestic</div>
                              <div className="text-sm opacity-75">Within Myanmar</div>
                            </div>
                          </div>
                        </Button>
                        
                        <Button
                          variant={serviceType === 'international' ? 'default' : 'outline'}
                          onClick={() => {
                            setServiceType('international');
                            setRegion('');
                            setDestination('');
                            setQuote(null);
                          }}
                          className={`h-16 ${serviceType === 'international' ? 'bg-gold hover:bg-gold/90 text-navy-900' : ''}`}
                        >
                          <div className="flex items-center gap-3">
                            <Plane className="w-6 h-6" />
                            <div className="text-left">
                              <div className="font-bold">International</div>
                              <div className="text-sm opacity-75">Air Cargo</div>
                            </div>
                          </div>
                        </Button>
                      </div>
                    </div>

                    {/* Origin */}
                    <div className="space-y-2">
                      <Label className="text-lg font-semibold">From</Label>
                      <Select value="yangon" disabled>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Origin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yangon">Yangon, Myanmar</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Region/Destination */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-lg font-semibold">
                          {serviceType === 'domestic' ? 'Region' : 'Destination Region'}
                        </Label>
                        <Select value={region} onValueChange={setRegion}>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select region" />
                          </SelectTrigger>
                          <SelectContent>
                            {getRegionOptions().map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-lg font-semibold">
                          {serviceType === 'domestic' ? 'Township/City' : 'Country'}
                        </Label>
                        <Select value={destination} onValueChange={setDestination} disabled={!region}>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select destination" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableDestinations.map((dest) => (
                              <SelectItem key={dest} value={dest}>
                                {dest}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Weight */}
                    <div className="space-y-2">
                      <Label className="text-lg font-semibold">{t('quote.weight')}</Label>
                      <Input
                        type="number"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        min="0.1"
                        step="0.1"
                        className="h-12 text-lg"
                        placeholder="Enter weight in kg"
                      />
                    </div>

                    {/* Dimensions (Optional) */}
                    <div className="space-y-2">
                      <Label className="text-lg font-semibold">Dimensions (cm) - Optional</Label>
                      <div className="grid grid-cols-3 gap-4">
                        <Input
                          type="number"
                          placeholder="Length"
                          value={dimensions.length}
                          onChange={(e) => setDimensions(prev => ({ ...prev, length: e.target.value }))}
                          className="h-12"
                        />
                        <Input
                          type="number"
                          placeholder="Width"
                          value={dimensions.width}
                          onChange={(e) => setDimensions(prev => ({ ...prev, width: e.target.value }))}
                          className="h-12"
                        />
                        <Input
                          type="number"
                          placeholder="Height"
                          value={dimensions.height}
                          onChange={(e) => setDimensions(prev => ({ ...prev, height: e.target.value }))}
                          className="h-12"
                        />
                      </div>
                      <p className="text-sm text-gray-500">
                        Used to calculate volumetric weight for international shipments
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quote Result */}
            <div className="lg:col-span-1">
              <Card className="shadow-xl border-0 sticky top-8">
                <CardHeader className="bg-gold text-navy-900">
                  <CardTitle className="text-2xl">Your Quote</CardTitle>
                </CardHeader>
                
                <CardContent className="p-8">
                  {quote ? (
                    <div className="space-y-6">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-navy-900 mb-2">
                          {quote.totalPrice.toLocaleString()} {quote.currency}
                        </div>
                        <Badge className="bg-green-100 text-green-800">
                          <Clock className="w-4 h-4 mr-1" />
                          {quote.deliveryTime}
                        </Badge>
                      </div>

                      <div className="space-y-3 pt-4 border-t">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Service:</span>
                          <span className="font-medium capitalize">{serviceType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Route:</span>
                          <span className="font-medium">Yangon → {destination}</span>
                        </div>
                        
                        {serviceType === 'international' ? (
                          <>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Actual Weight:</span>
                              <span className="font-medium">{quote.actualWeight} kg</span>
                            </div>
                            {quote.volumetricWeight && quote.volumetricWeight > 0 && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Volumetric Weight:</span>
                                <span className="font-medium">{quote.volumetricWeight} kg</span>
                              </div>
                            )}
                            <div className="flex justify-between font-semibold">
                              <span className="text-gray-900">Chargeable Weight:</span>
                              <span className="text-navy-900">{quote.chargeableWeight} kg</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Rate per kg:</span>
                              <span className="font-medium">{quote.basePrice.toLocaleString()} {quote.currency}</span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Weight:</span>
                              <span className="font-medium">{weight} kg</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Base Rate (1kg):</span>
                              <span className="font-medium">{quote.basePrice.toLocaleString()} {quote.currency}</span>
                            </div>
                            {parseFloat(weight) > 1 && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Additional ({(parseFloat(weight) - 1).toFixed(1)}kg):</span>
                                <span className="font-medium">{((parseFloat(weight) - 1) * 500).toLocaleString()} {quote.currency}</span>
                              </div>
                            )}
                          </>
                        )}
                      </div>

                      <div className="pt-4 border-t">
                        <Button asChild size="lg" className="w-full bg-navy-900 hover:bg-navy-800">
                          <Link to={ROUTE_PATHS.CONTACT}>
                            Book Now
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Link>
                        </Button>
                      </div>

                      <p className="text-xs text-gray-500 text-center">
                        {serviceType === 'domestic' 
                          ? '*Additional weight charged at 500 MMK/kg after first 1kg'
                          : '*International rates based on chargeable weight (greater of actual or volumetric weight). Rates subject to fuel surcharges.'
                        }
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">
                        Select service type, destination, and weight to get your quote
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Information */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MapPin className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Wide Coverage</h3>
                <p className="text-gray-600">
                  Domestic delivery to all major cities and townships across Myanmar, plus international shipping to 50+ countries.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Clock className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Fast Delivery</h3>
                <p className="text-gray-600">
                  Same-day and next-day delivery options for domestic shipments, with express international services available.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Package className="w-8 h-8 text-gold" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Secure Handling</h3>
                <p className="text-gray-600">
                  Professional packaging, real-time tracking, and insurance options to ensure your shipments arrive safely.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-navy-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Need a Custom Quote?</h2>
          <p className="text-xl text-navy-200 mb-8">
            For bulk shipments, special requirements, or custom solutions, contact our logistics experts directly.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-white/10 border-white/20 hover:bg-white/20 transition-colors">
              <CardContent className="p-6 text-center">
                <Phone className="w-8 h-8 text-gold mx-auto mb-4" />
                <h3 className="font-bold mb-2">Call Us</h3>
                <p className="text-navy-200 mb-4">Speak with our experts</p>
                <Button asChild variant="outline" className="border-gold text-gold hover:bg-gold hover:text-navy-900">
                  <a href="tel:+95989747744">+95-9-89747744</a>
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20 hover:bg-white/20 transition-colors">
              <CardContent className="p-6 text-center">
                <Mail className="w-8 h-8 text-gold mx-auto mb-4" />
                <h3 className="font-bold mb-2">Email Us</h3>
                <p className="text-navy-200 mb-4">Get detailed proposals</p>
                <Button asChild variant="outline" className="border-gold text-gold hover:bg-gold hover:text-navy-900">
                  <a href="mailto:info@britiumexpress.com">Send Email</a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
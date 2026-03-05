import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calculator,
  Package,
  Truck,
  Globe,
  Info,
  RefreshCw,
  ChevronRight,
  Scale,
  Maximize2,
  DollarSign
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { logisticsAPI, MyanmarLocation, RateCalculation } from '@/services/logistics-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { springPresets, fadeInUp } from '@/lib/motion';

const RiderCalculator: React.FC = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();

  // State for calculator inputs
  const [calcType, setCalcType] = useState<'domestic' | 'international'>('domestic');
  const [fromState, setFromState] = useState<string>('');
  const [toState, setToState] = useState<string>('');
  const [toCountry, setToCountry] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [dimensions, setDimensions] = useState({ length: '', width: '', height: '' });
  const [serviceType, setServiceType] = useState<string>('STANDARD');

  // State for results and locations
  const [locations, setLocations] = useState<MyanmarLocation[]>([]);
  const [result, setResult] = useState<RateCalculation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch Myanmar locations for domestic calculation
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await logisticsAPI.getLocations();
        if (response.success) {
          setLocations(response.locations);
        }
      } catch (err) {
        console.error('Failed to fetch locations', err);
      }
    };
    fetchLocations();
  }, []);

  // Get unique states from locations list
  const states = useMemo(() => {
    const uniqueStates = new Set(locations.map(loc => loc.state_division));
    return Array.from(uniqueStates).sort();
  }, [locations]);

  // Calculate volumetric weight: (L * W * H) / 5000
  const volumetricWeight = useMemo(() => {
    const { length, width, height } = dimensions;
    if (length && width && height) {
      return (parseFloat(length) * parseFloat(width) * parseFloat(height)) / 5000;
    }
    return 0;
  }, [dimensions]);

  // Chargeable weight is the higher of actual weight vs volumetric weight
  const chargeableWeight = useMemo(() => {
    const actualWeight = parseFloat(weight) || 0;
    return Math.max(actualWeight, volumetricWeight);
  }, [weight, volumetricWeight]);

  const handleCalculate = async () => {
    if (calcType === 'domestic' && (!fromState || !toState || !weight)) {
      setError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      if (calcType === 'domestic') {
        const response = await logisticsAPI.calculateShippingRate(
          fromState,
          toState,
          chargeableWeight,
          serviceType
        );
        if (response.success) {
          setResult(response.rate_calculation);
        } else {
          setError(response.rate_calculation.error || 'Failed to calculate rate');
        }
      } else {
        // Simulated international calculation logic for prototype purposes
        // In a real app, this would hit an international rates API endpoint
        setTimeout(() => {
          const baseRate = chargeableWeight * 15;
          setResult({
            success: true,
            base_rate: baseRate,
            per_kg_rate: 15,
            weight: chargeableWeight,
            remote_surcharge: 0,
            fuel_surcharge_percent: 12,
            total_cost: baseRate * 1.12,
            currency: 'USD',
            service_type: serviceType
          });
          setIsLoading(false);
        }, 1000);
        return;
      }
    } catch (err) {
      setError('An error occurred during calculation');
    } finally {
      if (calcType === 'domestic') setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFromState('');
    setToState('');
    setToCountry('');
    setWeight('');
    setDimensions({ length: '', width: '', height: '' });
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-background p-4 lg:p-8 flex flex-col items-center">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="w-full max-w-4xl space-y-8"
      >
        {/* Header Section */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
            <Calculator className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-foreground font-heading">
            {language === 'my' ? 'ပို့ဆောင်ခ တွက်ချက်ခြင်း' : 'Shipping Calculator'}
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            {language === 'my' 
              ? 'ပို့ဆောင်ခများကို အလွယ်တကူ တွက်ချက်နိုင်ပါသည်။'
              : 'Calculate domestic and international shipping rates instantly for Britium Express.'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Calculator Inputs Card */}
          <Card className="lg:col-span-7 luxury-card overflow-hidden">
            <CardHeader className="pb-2">
              <Tabs 
                value={calcType} 
                onValueChange={(val) => setCalcType(val as any)}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 bg-secondary/50">
                  <TabsTrigger value="domestic" className="flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    {language === 'my' ? 'ပြည်တွင်း' : 'Domestic'}
                  </TabsTrigger>
                  <TabsTrigger value="international" className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    {language === 'my' ? 'နိုင်ငံတကာ' : 'International'}
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>

            <CardContent className="space-y-6 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fromState">{language === 'my' ? 'မှ' : 'From State'}</Label>
                  <Select value={fromState} onValueChange={setFromState}>
                    <SelectTrigger id="fromState" className="bg-background/50">
                      <SelectValue placeholder={language === 'my' ? 'ရွေးချယ်ပါ' : 'Select Origin'} />
                    </SelectTrigger>
                    <SelectContent>
                      {states.map((state) => (
                        <SelectItem key={state} value={state}>{state}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  {calcType === 'domestic' ? (
                    <>
                      <Label htmlFor="toState">{language === 'my' ? 'သို့' : 'To State'}</Label>
                      <Select value={toState} onValueChange={setToState}>
                        <SelectTrigger id="toState" className="bg-background/50">
                          <SelectValue placeholder={language === 'my' ? 'ရွေးချယ်ပါ' : 'Select Destination'} />
                        </SelectTrigger>
                        <SelectContent>
                          {states.map((state) => (
                            <SelectItem key={state} value={state}>{state}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </>
                  ) : (
                    <>
                      <Label htmlFor="toCountry">To Country</Label>
                      <Input 
                        id="toCountry" 
                        placeholder="e.g. Thailand" 
                        value={toCountry} 
                        onChange={(e) => setToCountry(e.target.value)} 
                        className="bg-background/50"
                      />
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight">{language === 'my' ? 'အလေးချိန် (kg)' : 'Weight (kg)'}</Label>
                  <div className="relative">
                    <Input
                      id="weight"
                      type="number"
                      placeholder="0.00"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="pr-10 bg-background/50"
                    />
                    <Scale className="absolute right-3 top-2.5 w-4 h-4 text-muted-foreground" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="serviceType">{language === 'my' ? 'ဝန်ဆောင်မှု အမျိုးအစား' : 'Service Type'}</Label>
                  <Select value={serviceType} onValueChange={setServiceType}>
                    <SelectTrigger id="serviceType" className="bg-background/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="STANDARD">Standard Delivery</SelectItem>
                      <SelectItem value="EXPRESS">Express Delivery</SelectItem>
                      <SelectItem value="SAME_DAY">Same Day (Within City)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Maximize2 className="w-4 h-4" />
                  {language === 'my' ? 'အရွယ်အစား (cm)' : 'Dimensions (cm) - Optional'}
                </Label>
                <div className="grid grid-cols-3 gap-3">
                  <Input
                    placeholder="L"
                    type="number"
                    value={dimensions.length}
                    onChange={(e) => setDimensions({ ...dimensions, length: e.target.value })}
                    className="bg-background/50"
                  />
                  <Input
                    placeholder="W"
                    type="number"
                    value={dimensions.width}
                    onChange={(e) => setDimensions({ ...dimensions, width: e.target.value })}
                    className="bg-background/50"
                  />
                  <Input
                    placeholder="H"
                    type="number"
                    value={dimensions.height}
                    onChange={(e) => setDimensions({ ...dimensions, height: e.target.value })}
                    className="bg-background/50"
                  />
                </div>
                {volumetricWeight > 0 && (
                  <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <Info className="w-3 h-3" />
                    Volumetric Weight: {volumetricWeight.toFixed(2)} kg
                  </div>
                )}
              </div>

              {error && (
                <Alert variant="destructive" className="bg-destructive/10 border-destructive/20">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleCalculate}
                  disabled={isLoading}
                  className="flex-1 luxury-button bg-primary text-primary-foreground hover:bg-primary/90 h-12"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    language === 'my' ? 'တွက်ချက်မည်' : 'Calculate Cost'
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={resetForm}
                  className="w-12 h-12 p-0 border-primary/20 hover:bg-primary/5"
                >
                  <RefreshCw className="w-5 h-5 text-primary" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Calculation Results Card */}
          <div className="lg:col-span-5">
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={springPresets.gentle}
                >
                  <Card className="luxury-card border-primary/30 bg-primary/5 h-full overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-4">
                      <Badge className="bg-primary/20 text-primary border-primary/30">
                        {result.service_type}
                      </Badge>
                    </div>
                    
                    <CardHeader>
                      <CardTitle className="text-xl font-heading">
                        {language === 'my' ? 'ခန့်မှန်းခြေ ကုန်ကျစရိတ်' : 'Estimated Cost'}
                      </CardTitle>
                      <CardDescription>
                        {language === 'my' 
                          ? `${fromState} မှ ${calcType === 'domestic' ? toState : toCountry} သို့` 
                          : `From ${fromState} to ${calcType === 'domestic' ? toState : toCountry}`}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                      <div className="flex flex-col items-center justify-center py-6 bg-background/40 rounded-3xl border border-primary/10">
                        <span className="text-sm text-muted-foreground uppercase tracking-widest">
                          Total Price
                        </span>
                        <div className="flex items-baseline gap-1 mt-2">
                          <span className="text-4xl lg:text-5xl font-bold text-primary">
                            {result.total_cost?.toLocaleString()}
                          </span>
                          <span className="text-lg font-medium text-primary/70">
                            {result.currency || 'MMK'}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Chargeable Weight</span>
                          <span className="font-medium">{result.weight} kg</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Base Rate</span>
                          <span>{result.base_rate?.toLocaleString()} {result.currency || 'MMK'}</span>
                        </div>
                        {result.fuel_surcharge_percent && (
                          <div className="flex justify-between text-sm text-amber-500">
                            <span>Fuel Surcharge ({result.fuel_surcharge_percent}%)</span>
                            <span>+ {((result.base_rate || 0) * (result.fuel_surcharge_percent / 100)).toLocaleString()}</span>
                          </div>
                        )}
                        {result.remote_surcharge && result.remote_surcharge > 0 && (
                          <div className="flex justify-between text-sm text-amber-500">
                            <span>Remote Area Fee</span>
                            <span>+ {result.remote_surcharge.toLocaleString()}</span>
                          </div>
                        )}
                        <Separator className="bg-primary/10" />
                        <div className="flex justify-between items-center pt-2">
                          <span className="font-bold">Grand Total</span>
                          <span className="text-xl font-bold text-primary">
                            {result.total_cost?.toLocaleString()} {result.currency || 'MMK'}
                          </span>
                        </div>
                      </div>

                      <Button className="w-full bg-primary hover:bg-primary/90 rounded-full h-12 flex items-center justify-center gap-2">
                        {language === 'my' ? 'ဘိုကင်တင်ရန် ဆက်သွားမည်' : 'Proceed to Booking'}
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full"
                >
                  <Card className="luxury-card border-dashed border-muted-foreground/20 bg-transparent h-[450px] flex flex-col items-center justify-center text-center p-8">
                    <div className="w-20 h-20 bg-muted/20 rounded-full flex items-center justify-center mb-6">
                      <Package className="w-10 h-10 text-muted-foreground/40" />
                    </div>
                    <h3 className="text-lg font-medium text-muted-foreground">
                      {language === 'my' ? 'တွက်ချက်ရန် အချက်အလက်များ ဖြည့်သွင်းပါ' : 'Ready to Calculate'}
                    </h3>
                    <p className="text-sm text-muted-foreground/60 mt-2">
                      {language === 'my' 
                        ? 'ဘယ်ဘက်မှ အချက်အလက်များကို ဖြည့်သွင်းပြီး ပို့ဆောင်ခများကို စစ်ဆေးကြည့်ပါ။'
                        : 'Fill in the shipment details on the left to see the estimated shipping cost and service options.'}
                    </p>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Information Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="luxury-card p-6 bg-secondary/20 border-none">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold">Transparent Pricing</h4>
                <p className="text-xs text-muted-foreground">No hidden fees or extra surcharges.</p>
              </div>
            </div>
          </Card>
          <Card className="luxury-card p-6 bg-secondary/20 border-none">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold">Accurate Weighing</h4>
                <p className="text-xs text-muted-foreground">Based on weight or volumetric mass.</p>
              </div>
            </div>
          </Card>
          <Card className="luxury-card p-6 bg-secondary/20 border-none">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold">Fast Processing</h4>
                <p className="text-xs text-muted-foreground">Instant quotes for immediate dispatch.</p>
              </div>
            </div>
          </Card>
        </div>
      </motion.div>
    </div>
  );
};

export default RiderCalculator;
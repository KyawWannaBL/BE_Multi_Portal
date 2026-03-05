import React, { useState } from 'react';
import { 
  Search, 
  Package, 
  MapPin, 
  Clock, 
  CheckCircle, 
  Truck, 
  AlertCircle,
  Loader2,
  Phone,
  Mail
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { IMAGES } from '@/assets/images';
import { supabase } from '@/integrations/supabase/client';

interface TrackingResult {
  id: string;
  tracking_number: string;
  status: string;
  from_city: string;
  to_city: string;
  sender_name: string;
  receiver_name: string;
  created_at: string;
  updated_at: string;
  estimated_delivery?: string;
}

export default function PublicTrackingPage() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingResult, setTrackingResult] = useState<TrackingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async () => {
    if (!trackingNumber.trim()) {
      setError('Please enter a tracking number');
      return;
    }

    setLoading(true);
    setError('');
    setTrackingResult(null);

    try {
      // Try to fetch from shipments table
      const { data, error: supabaseError } = await supabase
        .from('shipments_2026_02_03_19_20')
        .select('*')
        .eq('tracking_number', trackingNumber.trim())
        .single();

      if (supabaseError) {
        // If not found in database, show demo data for common tracking numbers
        if (trackingNumber.toUpperCase().startsWith('BE-')) {
          setTrackingResult({
            id: 'demo',
            tracking_number: trackingNumber.toUpperCase(),
            status: getDemoStatus(trackingNumber),
            from_city: 'Yangon',
            to_city: getDemoDestination(trackingNumber),
            sender_name: 'Demo Sender',
            receiver_name: 'Demo Receiver',
            created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date().toISOString(),
            estimated_delivery: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          });
        } else {
          setError('Tracking number not found. Please check the number and try again.');
        }
      } else {
        setTrackingResult(data);
      }
    } catch (err) {
      console.error('Tracking error:', err);
      setError('Unable to track shipment at this time. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const getDemoStatus = (trackingNumber: string) => {
    const num = parseInt(trackingNumber.replace(/\D/g, '')) || 0;
    const statuses = ['Pending', 'In Transit', 'Out for Delivery', 'Delivered'];
    return statuses[num % statuses.length];
  };

  const getDemoDestination = (trackingNumber: string) => {
    const num = parseInt(trackingNumber.replace(/\D/g, '')) || 0;
    const cities = ['Mandalay', 'Nay Pyi Taw', 'Bagan', 'Taunggyi'];
    return cities[num % cities.length];
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'out for delivery':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in transit':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'pending':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'out for delivery':
        return <Truck className="w-5 h-5 text-blue-600" />;
      case 'in transit':
        return <Package className="w-5 h-5 text-yellow-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-gray-600" />;
      case 'cancelled':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Package className="w-5 h-5 text-gray-600" />;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTrack();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-navy-900 via-navy-800 to-navy-700 text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-navy-900/50 via-transparent to-navy-900/70" />
        <img 
          src={IMAGES.TRACKING_DASHBOARD_1} 
          alt="Package Tracking" 
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6">
              Track Your <span className="text-gold">Package</span>
            </h1>
            <p className="text-xl lg:text-2xl text-navy-200 max-w-3xl mx-auto">
              Get real-time updates on your shipment status and delivery progress.
            </p>
          </div>
        </div>
      </section>

      {/* Tracking Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Enter Your Tracking Number</h2>
            <p className="text-lg text-gray-600">
              Enter your tracking ID (e.g., BE-12345) to get the latest status of your shipment.
            </p>
          </div>

          {/* Tracking Input */}
          <Card className="mb-8 shadow-lg border-0">
            <CardContent className="p-8">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder="Enter tracking number (e.g., BE-12345)"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="text-lg py-6 border-2 border-gray-300 focus:border-gold focus:ring-gold"
                  />
                </div>
                <Button 
                  onClick={handleTrack}
                  disabled={loading}
                  size="lg"
                  className="bg-gold hover:bg-gold/90 text-navy-900 font-bold px-8 py-6"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Tracking...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5 mr-2" />
                      Track Package
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Error Message */}
          {error && (
            <Alert className="mb-8 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Tracking Result */}
          {trackingResult && (
            <Card className="shadow-xl border-0">
              <CardHeader className="bg-navy-900 text-white">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl">Tracking Details</CardTitle>
                  <Badge className={`${getStatusColor(trackingResult.status)} border`}>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(trackingResult.status)}
                      {trackingResult.status}
                    </div>
                  </Badge>
                </div>
                <p className="text-navy-200">
                  Tracking ID: <span className="font-bold text-gold">{trackingResult.tracking_number}</span>
                </p>
              </CardHeader>
              
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Shipment Details */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-gray-900 border-b pb-2">Shipment Information</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-gold mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-900">Route</p>
                          <p className="text-gray-600">
                            From: <span className="font-medium">{trackingResult.from_city}</span>
                          </p>
                          <p className="text-gray-600">
                            To: <span className="font-medium">{trackingResult.to_city}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Package className="w-5 h-5 text-gold mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-900">Sender</p>
                          <p className="text-gray-600">{trackingResult.sender_name}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Package className="w-5 h-5 text-gold mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-900">Receiver</p>
                          <p className="text-gray-600">{trackingResult.receiver_name}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-gray-900 border-b pb-2">Timeline</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Clock className="w-5 h-5 text-gold mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-900">Created</p>
                          <p className="text-gray-600">
                            {new Date(trackingResult.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Clock className="w-5 h-5 text-gold mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-900">Last Updated</p>
                          <p className="text-gray-600">
                            {new Date(trackingResult.updated_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>

                      {trackingResult.estimated_delivery && (
                        <div className="flex items-start gap-3">
                          <Truck className="w-5 h-5 text-gold mt-1 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-gray-900">Estimated Delivery</p>
                            <p className="text-gray-600">
                              {new Date(trackingResult.estimated_delivery).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status Message */}
                <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    {getStatusIcon(trackingResult.status)}
                    <h4 className="font-bold text-gray-900">Current Status: {trackingResult.status}</h4>
                  </div>
                  <p className="text-gray-600">
                    {trackingResult.status === 'Delivered' && 'Your package has been successfully delivered.'}
                    {trackingResult.status === 'Out for Delivery' && 'Your package is out for delivery and will arrive soon.'}
                    {trackingResult.status === 'In Transit' && 'Your package is on its way to the destination.'}
                    {trackingResult.status === 'Pending' && 'Your package is being processed at our facility.'}
                    {trackingResult.status === 'Cancelled' && 'This shipment has been cancelled.'}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Demo Instructions */}
          {!trackingResult && !loading && (
            <Card className="mt-8 border-gold/20 bg-gold/5">
              <CardContent className="p-6">
                <h3 className="font-bold text-gray-900 mb-3">Try Demo Tracking Numbers:</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setTrackingNumber('BE-1001')}
                    className="justify-start"
                  >
                    BE-1001 (Delivered)
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setTrackingNumber('BE-1002')}
                    className="justify-start"
                  >
                    BE-1002 (In Transit)
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setTrackingNumber('BE-1003')}
                    className="justify-start"
                  >
                    BE-1003 (Out for Delivery)
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setTrackingNumber('BE-1004')}
                    className="justify-start"
                  >
                    BE-1004 (Pending)
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Contact Support */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Need Help?</h2>
          <p className="text-lg text-gray-600 mb-8">
            Can't find your tracking information? Our customer support team is here to help.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Call Us</h3>
                <p className="text-gray-600 mb-4">Speak with our support team</p>
                <Button asChild variant="outline">
                  <a href="tel:+95989747744">+95-9-89747744</a>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Email Us</h3>
                <p className="text-gray-600 mb-4">Send us your inquiry</p>
                <Button asChild variant="outline">
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
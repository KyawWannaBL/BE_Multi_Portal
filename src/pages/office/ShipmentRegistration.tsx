import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  AlertCircle,
  Truck,
  User,
  MapPin,
  DollarSign,
  Image as ImageIcon,
  Search
} from 'lucide-react';
import { 
  ROUTE_PATHS, 
  MOCK_TOWNSHIPS, 
  Shipment, 
  SHIPMENT_STATUS 
} from '@/lib/index';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const springPresets = {
  gentle: {
    type: "spring" as const,
    stiffness: 100,
    damping: 15,
  },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const registrationSchema = z.object({
  senderName: z.string().min(2, 'Sender name is required'),
  senderPhone: z.string().min(8, 'Valid sender phone is required'),
  receiverName: z.string().min(2, 'Receiver name is required'),
  receiverPhone: z.string().min(8, 'Valid receiver phone is required'),
  receiverAddress: z.string().min(10, 'Full address is required'),
  receiverTownship: z.string().min(1, 'Township is mandatory'),
  serviceType: z.enum(['standard', 'express']),
  codRequired: z.boolean().default(false),
  codAmount: z.number().optional().nullable(),
  weight: z.number().min(0.1, 'Weight must be at least 0.1kg').optional(),
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

export default function ShipmentRegistration() {
  const { ttId } = useParams<{ ttId: string }>();
  const navigate = useNavigate();
  const { user, legacyUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [provisionalData, setProvisionalData] = useState<Partial<Shipment> | null>(null);

  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      serviceType: 'standard',
      codRequired: false,
      receiverTownship: '',
    },
  });

  useEffect(() => {
    // In a real app, fetch the provisional record using ttId
    // Mocking the data that would come from the rider's pickup
    const mockProvisional: Partial<Shipment> = {
      tamperTagId: ttId,
      pieces: 1,
      type: 'box',
      condition: 'OK',
      riderId: 'RDR-001',
      createdAt: new Date().toISOString(),
      photos: [
        'https://images.unsplash.com/photo-1580674285054-bed31e145f59?w=400',
        'https://images.unsplash.com/photo-1559941727-6fb446e7e8ae?w=400',
        'https://images.unsplash.com/photo-1618381297523-e6c0ab13a5b2?w=400'
      ]
    };
    setProvisionalData(mockProvisional);
  }, [ttId]);

  const onSubmit = async (data: RegistrationFormData) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const awb = `AWB-${Math.floor(10000000 + Math.random() * 90000000)}`;
      
      toast.success(`Shipment Registered Successfully!`, {
        description: `AWB ${awb} has been linked to Tamper Tag ${ttId}`,
      });

      navigate(ROUTE_PATHS.OFFICE.QUEUE);
    } catch (error) {
      toast.error("Registration Failed", {
        description: "Please check all fields and try again."
      });
    } finally {
      setLoading(false);
    }
  };

  if (!provisionalData) return <div className="flex items-center justify-center h-screen">Loading Record...</div>;

  return (
    <motion.div 
      initial="hidden" 
      animate="visible" 
      variants={fadeInUp}
      transition={springPresets.gentle}
      className="max-w-5xl mx-auto p-4 md:p-8"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Shipment Registration</h1>
            <p className="text-muted-foreground">Tamper Tag: <span className="font-mono font-bold text-primary">{ttId}</span></p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
          <Button 
            onClick={form.handleSubmit(onSubmit)} 
            disabled={loading}
            className="bg-primary"
          >
            {loading ? "Registering..." : <><Save className="mr-2 h-4 w-4" /> Complete Registration</>}
          </Button>
        </div>
      </div>

      <Alert className="mb-8 border-primary/20 bg-primary/5">
        <AlertCircle className="h-4 w-4 text-primary" />
        <AlertTitle className="text-primary font-semibold">DES Verification Required</AlertTitle>
        <AlertDescription className="text-primary/80">
          Please verify Tamper Tag visibility and parcel condition from the pickup photos before submitting.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Sender Details */}
          <Card className="card-modern">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Sender Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Sender Name</Label>
                <Input 
                  {...form.register('senderName')} 
                  placeholder="Full Name" 
                  className="input-modern"
                />
                {form.formState.errors.senderName && (
                  <p className="text-xs text-destructive">{form.formState.errors.senderName.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Sender Phone</Label>
                <Input 
                  {...form.register('senderPhone')} 
                  placeholder="09..." 
                  className="input-modern"
                />
                {form.formState.errors.senderPhone && (
                  <p className="text-xs text-destructive">{form.formState.errors.senderPhone.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Receiver Details */}
          <Card className="card-modern">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Delivery Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Receiver Name</Label>
                  <Input 
                    {...form.register('receiverName')} 
                    placeholder="Full Name"
                    className="input-modern"
                  />
                  {form.formState.errors.receiverName && (
                    <p className="text-xs text-destructive">{form.formState.errors.receiverName.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Receiver Phone</Label>
                  <Input 
                    {...form.register('receiverPhone')} 
                    placeholder="09..."
                    className="input-modern"
                  />
                  {form.formState.errors.receiverPhone && (
                    <p className="text-xs text-destructive">{form.formState.errors.receiverPhone.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Full Address</Label>
                <Input 
                  {...form.register('receiverAddress')} 
                  placeholder="Street, No, Building, Room..."
                  className="input-modern"
                />
                {form.formState.errors.receiverAddress && (
                  <p className="text-xs text-destructive">{form.formState.errors.receiverAddress.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Township</Label>
                  <Select 
                    onValueChange={(val) => form.setValue('receiverTownship', val)}
                    value={form.watch('receiverTownship')}
                  >
                    <SelectTrigger className="input-modern">
                      <SelectValue placeholder="Select Township" />
                    </SelectTrigger>
                    <SelectContent>
                      {MOCK_TOWNSHIPS.map(t => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.receiverTownship && (
                    <p className="text-xs text-destructive">{form.formState.errors.receiverTownship.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Service Type</Label>
                  <Select 
                    onValueChange={(val: 'standard' | 'express') => form.setValue('serviceType', val)}
                    defaultValue="standard"
                  >
                    <SelectTrigger className="input-modern">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard Delivery</SelectItem>
                      <SelectItem value="express">Express (Same Day)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financials */}
          <Card className="card-modern">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                COD & Payments
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="codRequired" 
                  checked={form.watch('codRequired')} 
                  onCheckedChange={(checked) => form.setValue('codRequired', checked as boolean)}
                />
                <Label htmlFor="codRequired" className="font-medium">Cash on Delivery (COD)</Label>
              </div>

              {form.watch('codRequired') && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-2 pt-2"
                >
                  <Label>COD Amount (MMK)</Label>
                  <Input 
                    type="number" 
                    placeholder="0.00"
                    className="input-modern font-mono text-lg"
                    {...form.register('codAmount', { valueAsNumber: true })}
                  />
                </motion.div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar: Pickup Evidence & Summary */}
        <div className="space-y-6">
          <Card className="card-modern overflow-hidden">
            <CardHeader className="bg-muted/30">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-primary" />
                Pickup Evidence
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-2">
                {provisionalData.photos?.map((photo, i) => (
                  <div 
                    key={i} 
                    className="aspect-square rounded-lg bg-muted overflow-hidden border cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => window.open(photo, '_blank')}
                  >
                    <img src={photo} alt={`Evidence ${i}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-muted/50 rounded-lg text-xs space-y-1">
                <p><span className="text-muted-foreground">Pieces:</span> {provisionalData.pieces}</p>
                <p><span className="text-muted-foreground">Type:</span> {provisionalData.type?.toUpperCase()}</p>
                <p><span className="text-muted-foreground">Condition:</span> <span className="font-bold text-success">{provisionalData.condition}</span></p>
                <p><span className="text-muted-foreground">Rider:</span> {provisionalData.riderId}</p>
                <p><span className="text-muted-foreground">Time:</span> {new Date(provisionalData.createdAt || '').toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="card-modern border-primary/20">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Base Fare</span>
                <span className="font-mono">3,500 MMK</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Service Fee</span>
                <span className="font-mono">{form.watch('serviceType') === 'express' ? '1,500' : '0'} MMK</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg text-primary">
                <span>Total Cost</span>
                <span className="font-mono">{form.watch('serviceType') === 'express' ? '5,000' : '3,500'} MMK</span>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/10 p-4">
              <Button 
                className="w-full"
                onClick={form.handleSubmit(onSubmit)}
                disabled={loading}
              >
                {loading ? "Saving..." : "Finalize Registration"}
              </Button>
            </CardFooter>
          </Card>

          <div className="p-4 rounded-xl border border-dashed border-muted-foreground/30 text-center">
            <Search className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
            <p className="text-xs text-muted-foreground">
              Duplicates check: System will verify phone & address combination upon submission.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

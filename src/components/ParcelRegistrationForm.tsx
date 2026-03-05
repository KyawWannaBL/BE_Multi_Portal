import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Package, MapPin, User, Phone, Scale, Info, CheckCircle2, Loader2 } from 'lucide-react';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { generateTrackingNumber, SHIPMENT_STATUS } from '@/lib/index.ts';

const parcelSchema = z.object({
  senderName: z.string().min(2, 'Sender name is required'),
  senderPhone: z.string().min(8, 'Valid phone number is required'),
  senderAddress: z.string().min(5, 'Full address is required'),
  receiverName: z.string().min(2, 'Receiver name is required'),
  receiverPhone: z.string().min(8, 'Valid phone number is required'),
  receiverAddress: z.string().min(5, 'Delivery address is required'),
  weight: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Weight must be a positive number',
  }),
  parcelType: z.enum(['DOCUMENT', 'PARCEL', 'FRAGILE', 'HEAVY']),
  priority: z.boolean().default(false),
  codAmount: z.string().optional(),
  notes: z.string().optional(),
});

type ParcelFormValues = z.infer<typeof parcelSchema>;

interface ParcelRegistrationFormProps {
  userType: 'merchant' | 'customer';
  onParcelCreated?: (parcel: any) => void;
}

export function ParcelRegistrationForm({ userType, onParcelCreated }: ParcelRegistrationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ParcelFormValues>({
    resolver: zodResolver(parcelSchema),
    defaultValues: {
      senderName: '',
      senderPhone: '',
      senderAddress: '',
      receiverName: '',
      receiverPhone: '',
      receiverAddress: '',
      weight: '1.0',
      parcelType: 'PARCEL',
      priority: false,
      codAmount: '0',
      notes: '',
    },
  });

  async function onSubmit(values: ParcelFormValues) {
    setIsSubmitting(true);
    
    try {
      // Simulate backend processing and wayplan generation
      await new Promise(resolve => setTimeout(resolve, 1500));

      const newParcel = {
        id: `SHIP-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        awb_number: generateTrackingNumber(),
        status: SHIPMENT_STATUS.PENDING,
        created_at: new Date().toISOString(),
        user_type: userType,
        ...values,
        // Auto-assigned metadata for backend simulation
        assigned_rider: 'Pending Assignment',
        assigned_vehicle: 'Calculating Route...',
        estimated_delivery: new Date(Date.now() + 86400000 * 2).toISOString(), // +2 days
      };

      toast.success('Parcel registered successfully!', {
        description: `Tracking ID: ${newParcel.awb_number}`,
        icon: <CheckCircle2 className="h-5 w-5 text-luxury-gold" />,
      });

      if (onParcelCreated) {
        onParcelCreated(newParcel);
      }
      
      form.reset();
    } catch (error) {
      toast.error('Failed to register parcel. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="luxury-card border-none shadow-luxury bg-card/50 backdrop-blur-sm overflow-hidden">
      <CardHeader className="border-b border-border/40 pb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-primary/10">
            <Package className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl font-heading">Parcel Registration</CardTitle>
            <CardDescription className="text-muted-foreground">
              Register a new {userType} pickup order for {new Date().getFullYear()} delivery cycle
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Sender Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-primary font-semibold text-sm uppercase tracking-wider">
                  <User className="h-4 w-4" />
                  Sender Details
                </div>
                <FormField
                  control={form.control}
                  name="senderName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter sender name" {...field} className="bg-background/50" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="senderPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="+1 (555) 000-0000" {...field} className="bg-background/50" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="senderAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pickup Address</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter full pickup address" {...field} className="bg-background/50 min-h-[100px]" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Receiver Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-primary font-semibold text-sm uppercase tracking-wider">
                  <MapPin className="h-4 w-4" />
                  Receiver Details
                </div>
                <FormField
                  control={form.control}
                  name="receiverName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recipient Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter recipient name" {...field} className="bg-background/50" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="receiverPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="+1 (555) 000-0000" {...field} className="bg-background/50" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="receiverAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Delivery Address</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter full delivery address" {...field} className="bg-background/50 min-h-[100px]" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Package Specifications */}
            <div className="pt-6 border-t border-border/40">
              <div className="flex items-center gap-2 text-primary font-semibold text-sm uppercase tracking-wider mb-4">
                <Info className="h-4 w-4" />
                Package Specifications
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Scale className="h-3 w-3" /> Weight (kg)
                      </FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" {...field} className="bg-background/50" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="parcelType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Package Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-background/50">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="PARCEL">Standard Parcel</SelectItem>
                          <SelectItem value="DOCUMENT">Document</SelectItem>
                          <SelectItem value="FRAGILE">Fragile Item</SelectItem>
                          <SelectItem value="HEAVY">Heavy Cargo</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="codAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>COD Amount (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="0.00" {...field} className="bg-background/50" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="mt-6 flex flex-wrap gap-6 items-center">
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-background/30">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-medium leading-none">
                          Express Delivery
                        </FormLabel>
                        <p className="text-xs text-muted-foreground">
                          Prioritize this shipment for faster routing
                        </p>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="pt-6">
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Special Instructions</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Any additional notes for the rider or driver..." {...field} className="bg-background/50" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full luxury-button py-6 text-sm flex items-center justify-center gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Registering Parcel...</>
              ) : (
                'Generate Waybill & QR Label'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Loader2, 
  Package, 
  User, 
  MapPin, 
  Phone, 
  Scale, 
  AlertTriangle, 
  Camera, 
  PenTool, 
  ShieldCheck,
  Send
} from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  SHIPMENT_STATUS, 
  Shipment, 
  generateTrackingNumber 
} from '@/lib/index';
import { useAuth } from '@/hooks/useDemoAuth';
import { PhotoCapture } from '@/components/PhotoCapture';
import { SignaturePad } from '@/components/SignaturePad';
import { useLanguage } from '@/contexts/LanguageContext';

/**
 * Login Form
 */
const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

export function LoginForm() {
  const { login, isLoading } = useAuth();
  const { t } = useLanguage();
  const [error, setError] = React.useState<string>('');
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    setError('');
    try {
      await login(values.email, values.password);
    } catch (error: any) {
      setError(error.message || 'Login failed. Please try again.');
    }
  };

  return (    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
            {error}
          </div>
        )}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('auth.corporateEmail')}</FormLabel>
              <FormControl>
                <Input placeholder="admin@britiumexpress.com" {...field} className="h-11" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('auth.password')}</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} className="h-11" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full h-11 font-semibold" disabled={isLoading}>
          {isLoading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('common.loading')}</>
          ) : (
            t('auth.signInToDashboard')
          )}
        </Button>
      </form>
    </Form>
  );
}

/**
 * Shipment Creation/Edit Form
 */
const shipmentSchema = z.object({
  senderName: z.string().min(2, "Required"),
  senderAddress: z.string().min(5, "Required"),
  senderPhone: z.string().min(8, "Required"),
  receiverName: z.string().min(2, "Required"),
  receiverAddress: z.string().min(5, "Required"),
  receiverPhone: z.string().min(8, "Required"),
  weight: z.coerce.number().min(0.1, "Min 0.1kg"),
  dimensions: z.string().optional(),
  isPriority: z.boolean().default(false),
});

interface ShipmentFormProps {
  initialData?: Partial<Shipment>;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

export function ShipmentForm({ initialData, onSubmit, isLoading }: ShipmentFormProps) {
  const form = useForm<z.infer<typeof shipmentSchema>>({
    resolver: zodResolver(shipmentSchema),
    defaultValues: {
      senderName: initialData?.senderName || '',
      senderAddress: initialData?.senderAddress || '',
      senderPhone: initialData?.senderPhone || '',
      receiverName: initialData?.receiverName || '',
      receiverAddress: initialData?.receiverAddress || '',
      receiverPhone: initialData?.receiverPhone || '',
      weight: initialData?.weight || 1,
      dimensions: initialData?.dimensions || '',
      isPriority: initialData?.isPriority || false,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Sender Details */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" /> Sender Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="senderName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
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
                    <FormControl><Input {...field} /></FormControl>
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
                    <FormControl><Textarea {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Receiver Details */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" /> Receiver Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="receiverName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
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
                    <FormControl><Input {...field} /></FormControl>
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
                    <FormControl><Textarea {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </div>

        {/* Package Specs */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Scale className="w-5 h-5 text-primary" /> Package Specifications
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="weight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Weight (kg)</FormLabel>
                  <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dimensions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dimensions (LxWxH)</FormLabel>
                  <FormControl><Input placeholder="e.g. 30x20x15 cm" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-end">
               <FormField
                control={form.control}
                name="isPriority"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0 p-4 border rounded-md">
                    <FormControl>
                      <input 
                        type="checkbox" 
                        checked={field.value} 
                        onChange={field.onChange} 
                        className="w-4 h-4 text-primary rounded"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Priority Handling</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" className="px-8">Cancel</Button>
          <Button type="submit" className="px-12" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            {initialData ? 'Update Shipment' : 'Create Shipment'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

/**
 * Exception Handling Form
 */
const exceptionSchema = z.object({
  reason: z.string().min(1, "Select a reason"),
  description: z.string().min(10, "Please provide more detail (min 10 chars)"),
  photo: z.string().min(1, "Photo evidence is required"),
});

interface ExceptionFormProps {
  shipmentId: string;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

export function ExceptionForm({ shipmentId, onSubmit, isLoading }: ExceptionFormProps) {
  const form = useForm<z.infer<typeof exceptionSchema>>({
    resolver: zodResolver(exceptionSchema),
    defaultValues: {
      reason: '',
      description: '',
      photo: '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex items-center gap-3 p-4 bg-destructive/10 text-destructive rounded-lg border border-destructive/20">
          <AlertTriangle className="w-6 h-6" />
          <div>
            <p className="font-bold">Reporting Exception</p>
            <p className="text-sm opacity-90">Tracking ID: {shipmentId}</p>
          </div>
        </div>

        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Exception Reason</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select why delivery failed" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="RECEIVER_NOT_PRESENT">Receiver Not Present</SelectItem>
                  <SelectItem value="INCORRECT_ADDRESS">Incorrect/Incomplete Address</SelectItem>
                  <SelectItem value="REFUSED_BY_RECEIVER">Refused by Receiver</SelectItem>
                  <SelectItem value="DAMAGED_IN_TRANSIT">Package Damaged</SelectItem>
                  <SelectItem value="VEHICLE_BREAKDOWN">Vehicle Breakdown</SelectItem>
                  <SelectItem value="WEATHER_ISSUES">Severe Weather</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Detailed Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Provide additional context for the dispatch team..." 
                  className="min-h-[100px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="photo"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Camera className="w-4 h-4" /> Visual Evidence
              </FormLabel>
              <FormControl>
                <PhotoCapture 
                  onCapture={(val: string) => field.onChange(val)} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" variant="destructive" className="w-full" disabled={isLoading}>
          {isLoading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <AlertTriangle className="mr-2 h-4 w-4" />}
          Submit Exception Report
        </Button>
      </form>
    </Form>
  );
}

/**
 * Proof of Delivery Form
 */
const podSchema = z.object({
  receiverName: z.string().min(2, "Receiver name required"),
  signature: z.string().min(1, "Signature required"),
  photo: z.string().optional(),
});

interface ProofOfDeliveryFormProps {
  shipmentId: string;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

export function ProofOfDeliveryForm({ shipmentId, onSubmit, isLoading }: ProofOfDeliveryFormProps) {
  const form = useForm<z.infer<typeof podSchema>>({
    resolver: zodResolver(podSchema),
    defaultValues: {
      receiverName: '',
      signature: '',
      photo: '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-primary mb-4">
              <ShieldCheck className="w-6 h-6" />
              <h3 className="font-bold text-lg">Delivery Confirmation</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Capturing proof of delivery for shipment <span className="font-mono font-bold">{shipmentId}</span>
            </p>

            <FormField
              control={form.control}
              name="receiverName"
              render={({ field }) => (
                <FormItem className="mb-6">
                  <FormLabel>Receiver Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Person who accepted the package" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="signature"
              render={({ field }) => (
                <FormItem className="mb-6">
                  <FormLabel className="flex items-center gap-2">
                    <PenTool className="w-4 h-4" /> Digital Signature
                  </FormLabel>
                  <FormControl>
                    <SignaturePad onSave={(val: string) => field.onChange(val)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="photo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Camera className="w-4 h-4" /> Photo Proof (Optional)
                  </FormLabel>
                  <FormControl>
                    <PhotoCapture 
                      onCapture={(val: string) => field.onChange(val)} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Button type="submit" className="w-full h-12 text-lg font-bold" disabled={isLoading}>
          {isLoading ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : <ShieldCheck className="mr-2 h-5 w-5" />}
          Confirm Delivery
        </Button>
      </form>
    </Form>
  );
}

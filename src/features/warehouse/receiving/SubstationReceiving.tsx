import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  Search,
  QrCode,
  CheckCircle2,
  ArrowRightLeft,
  Truck,
  AlertCircle,
  ChevronRight,
  Filter,
  MapPin,
  Hash,
  Box
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { logisticsAPI, Shipment } from '@/services/logistics-api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter, 
  DialogDescription 
} from '@/components/ui/dialog';

const SubstationReceiving: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'incoming' | 'processing' | 'completed'>('incoming');
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [isProcessDialogOpen, setIsProcessDialogOpen] = useState(false);

  // Fetch shipments intended for this substation or in transit to it
  const { data: shipmentsData, isLoading } = useQuery({
    queryKey: ['substation-receiving', (user as any)?.branch_id],
    queryFn: () => logisticsAPI.getShipments({
      limit: 100,
    }),
    enabled: !!(user as any)?.branch_id,
  });

  // Mock/Simulated filtering based on role and branch
  const filteredShipments = useMemo(() => {
    if (!shipmentsData?.shipments) return [];
    return shipmentsData.shipments.filter(s => {
      const matchesSearch = s.awb_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.receiver_name.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Logic: Show shipments whose destination is this branch or currently assigned to arrive here
      const isRelevant = s.destination_branch_id === (user as any)?.branch_id || s.current_location === (user as any)?.branch_id;
      
      return matchesSearch && isRelevant;
    });
  }, [shipmentsData, searchQuery, (user as any)?.branch_id]);

  const stats = useMemo(() => ({
    pending: filteredShipments.filter(s => s.status === 'IN_TRANSIT').length,
    receivedToday: filteredShipments.filter(s => s.status === 'ARRIVED_AT_SUBSTATION').length,
    forwarded: filteredShipments.filter(s => s.status === 'DEPARTED_FROM_SUBSTATION').length,
  }), [filteredShipments]);

  const receiveMutation = useMutation({
    mutationFn: async (shipmentId: string) => {
      return logisticsAPI.updateShipmentStatus(
        shipmentId,
        'ARRIVED_AT_SUBSTATION',
        (user as any)?.branch_id || 'Unknown Substation',
        user?.id || 'system',
        'Package received and checked at substation receiving bay.'
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['substation-receiving'] });
      toast.success('Shipment received successfully');
      setIsProcessDialogOpen(false);
    },
    onError: () => toast.error('Failed to update shipment status'),
  });

  const handleProcess = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    setIsProcessDialogOpen(true);
  };

  const renderShipmentRow = (shipment: Shipment) => (
    <TableRow key={shipment.id} className="hover:bg-muted/50 transition-colors border-b border-border/40">
      <TableCell className="font-mono font-bold text-primary">{shipment.awb_number}</TableCell>
      <TableCell>
        <div className="flex flex-col">
          <span className="font-medium">{shipment.receiver_name}</span>
          <span className="text-xs text-muted-foreground">{shipment.receiver_city}</span>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant={shipment.status === 'IN_TRANSIT' ? 'outline' : 'secondary'} className="capitalize">
          {shipment.status.replace(/_/g, ' ')}
        </Badge>
      </TableCell>
      <TableCell className="text-right font-mono">{shipment.weight} kg</TableCell>
      <TableCell className="text-right">
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-primary hover:text-primary hover:bg-primary/10"
          onClick={() => handleProcess(shipment)}
        >
          <ChevronRight className="h-4 w-4 mr-1" />
          {t('Process') || 'Process'}
        </Button>
      </TableCell>
    </TableRow>
  );

  return (
    <div className="min-h-screen bg-background text-foreground p-6 lg:p-10 space-y-8">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Box className="h-8 w-8 text-primary" />
            {t('Substation Receiving') || 'Substation Receiving'}
          </h1>
          <p className="text-muted-foreground">
            {t('Manage incoming parcels, sorting, and dispatch prep.') || 'Manage incoming parcels, sorting, and dispatch prep.'}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 w-full md:w-auto">
          {[
            { label: 'Pending', value: stats.pending, icon: Truck, color: 'text-amber-500' },
            { label: 'Received', value: stats.receivedToday, icon: CheckCircle2, color: 'text-emerald-500' },
            { label: 'Forwarded', value: stats.forwarded, icon: ArrowRightLeft, color: 'text-blue-500' }
          ].map((stat, idx) => (
            <div key={idx} className="luxury-card p-4 flex flex-col items-center justify-center min-w-[100px] bg-card/40 backdrop-blur-sm">
              <stat.icon className={`h-5 w-5 mb-2 ${stat.color}`} />
              <span className="text-2xl font-bold font-mono">{stat.value}</span>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{t(stat.label) || stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Operations Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder={t('Search AWB or Recipient...') || 'Search AWB or Recipient...'}
                className="pl-10 bg-muted/20 border-border/50 focus:border-primary/50 h-12 rounded-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button className="luxury-button h-12 px-8">
              <QrCode className="mr-2 h-4 w-4" />
              {t('Scan Package') || 'Scan Package'}
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="w-full">
            <TabsList className="bg-muted/30 p-1 rounded-xl border border-border/40">
              <TabsTrigger value="incoming" className="rounded-lg px-6">{t('Incoming') || 'Incoming'}</TabsTrigger>
              <TabsTrigger value="processing" className="rounded-lg px-6">{t('In Branch') || 'In Branch'}</TabsTrigger>
              <TabsTrigger value="completed" className="rounded-lg px-6">{t('Forwarded') || 'Forwarded'}</TabsTrigger>
            </TabsList>

            <div className="mt-6 luxury-card overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="w-[150px]">{t('AWB Number') || 'AWB Number'}</TableHead>
                    <TableHead>{t('Recipient') || 'Recipient'}</TableHead>
                    <TableHead>{t('Status') || 'Status'}</TableHead>
                    <TableHead className="text-right">{t('Weight') || 'Weight'}</TableHead>
                    <TableHead className="text-right">{t('Action') || 'Action'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array(5).fill(0).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                        <TableCell><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : filteredShipments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-64 text-center">
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <Package className="h-12 w-12 mb-4 opacity-20" />
                          <p>{t('No shipments found matching criteria.') || 'No shipments found matching criteria.'}</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredShipments
                      .filter(s => {
                        if (activeTab === 'incoming') return s.status === 'IN_TRANSIT';
                        if (activeTab === 'processing') return s.status === 'ARRIVED_AT_SUBSTATION';
                        if (activeTab === 'completed') return s.status === 'DEPARTED_FROM_SUBSTATION';
                        return true;
                      })
                      .map(renderShipmentRow)
                  )}
                </TableBody>
              </Table>
            </div>
          </Tabs>
        </div>

        {/* Right Sidebar - Branch Info & Sort Guides */}
        <div className="space-y-6">
          <Card className="luxury-card border-none">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                {t('Substation Info') || 'Substation Info'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">{t('Branch Code') || 'Branch Code'}</span>
                <span className="font-mono">{(user as any)?.branch_id || '---'}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">{t('Operating Hours') || 'Operating Hours'}</span>
                <span className="font-medium text-emerald-500">08:00 - 20:00</span>
              </div>
              <div className="pt-4 border-t border-border/40">
                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">{t('Sorting Zones') || 'Sorting Zones'}</h4>
                <div className="grid grid-cols-2 gap-2">
                  {['Zone A (North)', 'Zone B (East)', 'Zone C (Central)', 'Zone D (Special)'].map(zone => (
                    <div key={zone} className="bg-muted/30 p-2 rounded-lg text-[10px] font-medium border border-border/20 text-center">
                      {zone}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="luxury-card border-none bg-primary/5">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-3 text-primary">
                <AlertCircle className="h-5 w-5" />
                <span className="font-bold">{t('Daily Compliance') || 'Daily Compliance'}</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t('Ensure all packages are scanned within 30 minutes of vehicle arrival. Report any damaged seals immediately to the supervisor.') || 'Ensure all packages are scanned within 30 minutes of vehicle arrival. Report any damaged seals immediately to the supervisor.'}
              </p>
              <Button variant="outline" className="w-full text-xs h-8 border-primary/20 hover:bg-primary/10">
                {t('View Procedures') || 'View Procedures'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Process Dialog */}
      <Dialog open={isProcessDialogOpen} onOpenChange={setIsProcessDialogOpen}>
        <DialogContent className="luxury-card bg-background border-border/40 sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">{t('Shipment Processing') || 'Shipment Processing'}</DialogTitle>
            <DialogDescription className="font-mono text-primary">
              {selectedShipment?.awb_number}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-[10px] uppercase text-muted-foreground">{t('Sender') || 'Sender'}</span>
                <p className="font-medium text-sm">{selectedShipment?.sender_name}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase text-muted-foreground">{t('Receiver') || 'Receiver'}</span>
                <p className="font-medium text-sm">{selectedShipment?.receiver_name}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase text-muted-foreground">{t('Weight') || 'Weight'}</span>
                <p className="font-medium text-sm">{selectedShipment?.weight} kg</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase text-muted-foreground">{t('COD Amount') || 'COD Amount'}</span>
                <p className="font-medium text-sm text-emerald-500">{selectedShipment?.cod_amount} MMK</p>
              </div>
            </div>

            <div className="bg-muted/20 p-4 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold">
                <Hash className="h-4 w-4 text-primary" />
                {t('Assign Storage Zone') || 'Assign Storage Zone'}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map(bin => (
                  <Button key={bin} variant="outline" size="sm" className="hover:bg-primary/10 hover:border-primary/50">
                    {bin}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setIsProcessDialogOpen(false)}>
              {t('Cancel') || 'Cancel'}
            </Button>
            <Button 
              className="luxury-button bg-primary text-black hover:bg-primary/90"
              disabled={receiveMutation.isPending || selectedShipment?.status === 'ARRIVED_AT_SUBSTATION'}
              onClick={() => selectedShipment && receiveMutation.mutate(selectedShipment.id)}
            >
              {receiveMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  {t('Processing...') || 'Processing...'}
                </div>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  {t('Confirm Receipt') || 'Confirm Receipt'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubstationReceiving;